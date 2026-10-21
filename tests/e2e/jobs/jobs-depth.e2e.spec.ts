/**
 * Story 16.1 essential browser contracts E01â€“E04, executable against the production UI.
 * Evidence: current JobList/JobDetailView/JobEditDialog, BookingEntry/BookingEditor,
 * booking-actions.ts, shared JobsDepthFixture and the resumed approved 16.1 spec.
 * No browser/service/test is started by importing this file. Every fixture is lazy.
 *
 * PROPOSED UI CONTRACTS, NOT OBSERVED UI: Mina jobb heading; the progressive card
 * labels below; job-card-planning-toggle, job-card-unsent/retry/save-status;
 * job-required-role-{id}, job-access-window-row, job-dependency-{id}; and
 * job-dependency-warning/unknown and job-economy-entitlement. Reconcile these seams with the actual
 * implementation before activation. They describe usable behavior, not CSS/layout.
 * Existing job-edit-* / booking-* IDs and login labels are read from current code.
 * Card failure binding below requires the new form to retain the inspected Next
 * Server Action POST on /jobs/{id}, including its unique submitted title. If its
 * production transport differs, bind that actual action before activation; do not
 * introduce an invented API endpoint or a permanent success stub.
 *
 * playwright-utils deviation: the configured flag is true but package.json has no
 * @seontechnologies/playwright-utils. The library two-gate rule permits existing
 * Playwright/resourcePage conventions. No package or merged-fixture is created.
 * Exhaustive roles/devices/browsers, screenshots and manual polish are deferred
 * release validation (E16 UI/release owner); these skips are not passing evidence.
 */
import { test, expect } from "../support/resource-cdp-attachment";
import type { Locator, Page, Request, Response } from "@playwright/test";
import { COMMAND_MESSAGES } from "@/server/commands/command-errors";
import { adminInsertMembership } from "../../factories/tenants";
import {
  loadCardInput, createJobsDepthFixture, invokeJobCard, type JobsDepthFixture,
} from "../../support/jobs-depth-atdd";

type Credentials = { readonly email: string; readonly password: string };

async function hydrated(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate((element) => new Promise<void>((resolve) => {
    const tick = () => Object.keys(element).some((key) => key.startsWith("__react"))
      ? resolve() : requestAnimationFrame(tick);
    tick();
  }));
}

// playwright-utils deviation: no installed auth-session provider; reuse inspected login labels.
async function signIn(page: Page, credentials: Credentials): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await hydrated(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("LÃ¶senord", { exact: true }).fill(credentials.password);
  await submit.click();
  // Do not require MontÃ¶r to land on a dashboard it may not be entitled to read.
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

async function openEdit(page: Page, jobId: string): Promise<Locator> {
  await page.goto(`/jobs/${jobId}`);
  const trigger = page.getByTestId("job-edit-open");
  await hydrated(trigger);
  await trigger.click();
  const form = page.getByTestId("job-edit-dialog");
  await expect(form).toBeVisible();
  return form;
}

async function openCard(page: Page, jobId: string): Promise<Locator> {
  await page.goto(`/jobs/${jobId}`);
  const form = page.getByTestId("job-card-form");
  await hydrated(form);
  return form;
}

function cardRequest(request: Request, jobId: string, title?: string): boolean {
  return request.method() === "POST" && !!request.headers()["next-action"]
    && new URL(request.url()).pathname === `/jobs/${jobId}`
    && (title === undefined || (request.postData() ?? "").includes(title));
}

// playwright-utils deviation: observe the actual Next action before triggering it; no fake API URL.
async function saveCard(page: Page, form: Locator, jobId: string, title?: string): Promise<void> {
  const saved = page.waitForResponse((response) => cardRequest(response.request(), jobId, title));
  await form.getByTestId("job-edit-save").click();
  expect((await saved).ok()).toBe(true);
  await expect(form).toHaveCount(0);
}

async function fillProgressiveCard(form: Locator, f: JobsDepthFixture, title: string): Promise<void> {
  await form.getByRole("textbox", { name: "Titel", exact: true }).fill(title);
  await form.getByRole("combobox", { name: "AnlÃ¤ggning", exact: true }).selectOption(f.identity.facilityId);
  await form.getByRole("combobox", { name: "Kontakt", exact: true }).selectOption(f.identity.contactId);
  await form.getByTestId("job-card-planning-toggle").click();
  await form.getByLabel("Planerad start", { exact: true }).fill("2026-10-12");
  await form.getByLabel("Planerat slut", { exact: true }).fill("2026-10-13");
  await form.getByLabel("Prioritet", { exact: true }).selectOption("high");
  await form.getByLabel("Uppskattad tid (minuter)", { exact: true }).fill("120");
  await form.getByLabel("Planerad restid (minuter)", { exact: true }).fill("30");
  await form.getByLabel("Antal personer", { exact: true }).fill("2");
  await form.getByLabel("Tidigast", { exact: true }).fill("2026-10-12");
  await form.getByLabel("Ã–nskat datum", { exact: true }).fill("2026-10-13");
  await form.getByLabel("Senast", { exact: true }).fill("2026-10-14");
  await form.getByLabel("Kraven Ã¤r kÃ¤nda", {exact:true}).check();
  await form.getByTestId(`job-required-role-${f.roleId}`).check();
  await form.getByLabel("TilltrÃ¤destiderna Ã¤r kÃ¤nda", {exact:true}).check();
  await form.getByRole("button", { name: "LÃ¤gg till tidsintervall", exact: true }).click();
  const window = form.getByTestId("job-access-window-row");
  await expect(window).toHaveCount(1);
  await window.getByLabel("FrÃ¥n", { exact: true }).fill("2026-10-12T08:00");
  await window.getByLabel("Till", { exact: true }).fill("2026-10-12T16:00");
  await form.getByTestId(`job-dependency-${f.jobs.prerequisite.id}`).check();
}

function bookingAction(response: Response, operation: "preview" | "save", description: string): boolean {
  const request = response.request();
  if (request.method() !== "POST" || !request.headers()["next-action"]) return false;
  // Inspected production transport: [candidate], with editorReview only on save.
  try {
    const candidate = JSON.parse(request.postData() ?? "null")?.[0] as Record<string, unknown> | undefined;
    return !!candidate && candidate.description === description
      && Array.isArray(candidate.assigneeIds) && candidate.assigneeIds.length === 1
      && (operation === "save" ? "editorReview" in candidate : !("editorReview" in candidate));
  } catch { return false; }
}

test.describe("Story 16.1 essential Jobs depth journeys", () => {
  test("[P0] 16.1-E01 My Jobs is the actual duplicate-free member/assignee union; direct denial and money-safe assigned detail agree", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, f.credentials.assignedWorker);
      const menuButton = page.getByRole("button", { name: "Ã–ppna meny", exact: true });
      await hydrated(menuButton);
      await menuButton.click();
      await page.getByRole("dialog", { name: "Huvudmeny", exact: true })
        .getByRole("navigation", { name: "Huvudnavigation", exact: true })
        .getByRole("link", { name: "Jobb/Order", exact: true }).click();
      await expect(page).toHaveURL(/\/jobs$/);
      await expect(page.getByRole("heading", { name: "Mina jobb", exact: true })).toBeVisible();
      const rows = page.getByTestId("job-list-row");
      const expected = [f.jobs.memberOrder, f.jobs.assigneeProject, f.jobs.both, f.jobs.acceptedAssigned];
      await expect(rows).toHaveCount(expected.length);
      const hrefs = await rows.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href")));
      for (const job of expected) {
        expect(hrefs.filter((href) => href === `/jobs/${job.id}`)).toHaveLength(1);
      }
      // An accepted source withheld by quote ACL is not a standalone job.
      const acceptedRow=rows.filter({has:page.locator(`a[href="/jobs/${f.jobs.acceptedAssigned.id}"]`)});
      await expect(acceptedRow).toContainText("KÃ¤lloffert inte tillgÃ¤nglig");
      const sourceFilter=page.getByTestId("job-filter-source-quote");
      await hydrated(sourceFilter);
      await expect(sourceFilter.locator("option")).toHaveCount(2); // all + genuine standalone; no quote identity grant
      await sourceFilter.selectOption({label:"Utan kÃ¤lloffert"});
      await expect(rows).toHaveCount(3);
      await expect(acceptedRow).toHaveCount(0);
      await sourceFilter.selectOption("");
      await expect(rows).toHaveCount(expected.length);
      for (const job of [f.jobs.unrelated, f.jobs.foreign]) {
        await expect(rows.getByRole("link", { name: new RegExp(job.title) })).toHaveCount(0);
        const denied = await page.goto(`/jobs/${job.id}`);
        expect(denied?.status()).toBe(404); // current page uses generic notFound for invisible rows
        await expect(page.getByTestId("job-detail")).toHaveCount(0);
        await expect(page.getByText(job.title, { exact: true })).toHaveCount(0);
        await page.goto("/jobs");
      }
      const response = await page.goto(`/jobs/${f.jobs.acceptedAssigned.id}`);
      expect(response?.ok()).toBe(true);
      await expect(page.getByTestId("job-detail")).toBeVisible();
      const customerDetails = page.getByTestId("job-workspace-details");
      await customerDetails.locator("summary").click();
      await expect(page.getByTestId("job-customer")).toBeVisible();
      await expect(page.getByTestId("job-customer")).not.toBeEmpty();
      await customerDetails.locator("summary").click();
      await expect(page.getByTestId("job-status")).not.toBeEmpty();
      await expect(page.getByTestId("job-accepted-price")).toHaveCount(0);
      await expect(page.getByTestId("job-source-sent-total")).toHaveCount(0);
      await expect(page.getByTestId("job-edit-open")).toHaveCount(0);
      // Includes SSR/RSC data, so hiding money with CSS or null/zero masking cannot pass.
      const payload = await response!.text();
      expect(payload).not.toMatch(/acceptedPriceOre|sourceSentTotalOre|accepted_price_ore|source_sent_total_ore/);
      expect(payload).not.toMatch(/costRateOre|sellRateOre|cost_rate_ore|sell_rate_ore/);
      // Proposed explicit entitlement descriptor; absence of numbers alone is insufficient.
      await expect(page.getByTestId("job-economy-entitlement")).toHaveText(/saknar behÃ¶righet|inte tillgÃ¤nglig/i);
    } finally { await f.dispose(); }
  });

  test("[P1] 16.1-E02 phone progressive identity, scheduling and child save retains unsent input after failure; explicit retry persists across reload",
    { annotation: [{ type: "skipNetworkMonitoring", description: "One identified job-card Server Action request is intentionally aborted before writes" }] },
    async ({ resourcePage: page }) => {
      const f = await createJobsDepthFixture();
      try {
        await page.setViewportSize({ width: 360, height: 640 });
        await signIn(page, f.credentials.manager);
        const form = await openCard(page, f.jobs.editable.id);
        const title = `Phone card ${f.jobs.editable.id}`;
        await fillProgressiveCard(form, f, title);
        const before = await f.snapshot();
        // playwright-utils deviation: one-shot abort matches inspected Next transport and unique draft.
        let aborted = false;
        const failOneCardAction = async (route: import("@playwright/test").Route) => {
          if (!aborted && cardRequest(route.request(), f.jobs.editable.id, title)) {
            aborted = true;
            await route.abort("failed");
          } else await route.continue();
        };
        await page.route("**/*", failOneCardAction);
        const failed = page.waitForEvent("requestfailed", {
          predicate: (request) => cardRequest(request, f.jobs.editable.id, title),
        });
        await form.getByTestId("job-card-save").click();
        const failedRequest = await failed;
        expect(aborted).toBe(true);
        await expect(form.getByTestId("job-card-unsent")).toHaveAttribute("role", "alert");
        await expect(form.getByTestId("job-card-unsent")).toBeVisible();
        await expect(page.getByTestId("job-card-save-status")).toHaveCount(0);
        await expect(form.getByRole("textbox", { name: "Titel", exact: true })).toHaveValue(title);
        await expect(form.getByRole("combobox", { name: "AnlÃ¤ggning", exact: true })).toHaveValue(f.identity.facilityId);
        await expect(form.getByLabel("Uppskattad tid (minuter)", { exact: true })).toHaveValue("120");
        await expect(form.getByTestId(`job-required-role-${f.roleId}`)).toBeChecked();
        await expect(form.getByTestId("job-access-window-row").getByLabel("Till", { exact: true })).toHaveValue("2026-10-12T16:00");
        expect(await f.snapshot()).toEqual(before); // no optimistic card/child/audit write
        await page.unroute("**/*", failOneCardAction);
        const retry = form.getByTestId("job-card-retry");
        await retry.scrollIntoViewIfNeeded();
        await expect(retry).toBeInViewport();
        await expect(retry).toBeEnabled();
        const saved = page.waitForResponse((reply) => cardRequest(reply.request(), f.jobs.editable.id, title));
        await retry.click(); // the consumed failure route now forwards the real save
        const firstSave = await saved;
        expect(firstSave.ok()).toBe(true);
        expect(JSON.parse(firstSave.request().postData() ?? "null")).toEqual(JSON.parse(failedRequest.postData() ?? "null"));
        await expect(page.getByTestId("job-card-save-status")).toHaveText("Jobbet Ã¤r sparat.");
        await expect(page.getByRole("heading", { name: title, exact: true })).toBeVisible();
        const after = await f.snapshot();
        expect(after.jobs.find((row) => row.id === f.jobs.editable.id)).toMatchObject({
          type: "order", title, customer_id: f.identity.customerId, facility_id: f.identity.facilityId,
          contact_id: f.identity.contactId, priority: "high", estimated_duration_minutes: 120,
          planned_travel_minutes: 30, crew_size: 2, earliest_date: "2026-10-12", desired_date: "2026-10-13",
          latest_date: "2026-10-14", planned_start_date: "2026-10-12", planned_end_date: "2026-10-13",
        });
        expect(after.roles.filter((row) => row.job_id === f.jobs.editable.id)).toHaveLength(1);
        expect(after.roles.find((row) => row.job_id === f.jobs.editable.id)?.work_role_id).toBe(f.roleId);
        expect(after.windows.filter((row) => row.job_id === f.jobs.editable.id)).toHaveLength(1);
        expect(after.dependencies.filter((row) => row.job_id === f.jobs.editable.id)).toHaveLength(1);
        expect(after.audit.length - before.audit.length).toBe(1);
        // Continue editing the same mounted form after its same-route refresh.
        // No goto/reload/remount may hide a permanently disabled saved island.
        await form.getByRole("button", { name: "Ta bort tidsintervall 1", exact: true }).click();
        await expect(form.getByTestId("job-access-window-row")).toHaveCount(0);
        await expect(form.getByTestId("job-card-save")).toBeEnabled();
        await form.getByRole("button", { name: "LÃ¤gg till tidsintervall", exact: true }).click();
        const replacementWindow = form.getByTestId("job-access-window-row");
        await expect(replacementWindow).toHaveCount(1);
        await replacementWindow.getByLabel("FrÃ¥n", { exact: true }).fill("2026-10-12T08:00");
        await replacementWindow.getByLabel("Till", { exact: true }).fill("2026-10-12T16:00");
        const secondTitle = `${title} second edit`;
        await form.getByRole("textbox", { name: "Titel", exact: true }).fill(secondTitle);
        await form.getByLabel("Uppskattad tid (minuter)", { exact: true }).fill("150");
        await expect(form.getByTestId("job-card-save-status")).toHaveCount(0);
        await expect(form.getByTestId("job-card-save")).toBeEnabled();
        const secondSaved = page.waitForResponse((reply) => cardRequest(reply.request(), f.jobs.editable.id, secondTitle));
        await form.getByTestId("job-card-save").click();
        const secondSave = await secondSaved;
        expect(secondSave.ok()).toBe(true);
        const firstInput = JSON.parse(firstSave.request().postData() ?? "null")[0] as { commandId: string };
        const secondInput = JSON.parse(secondSave.request().postData() ?? "null")[0] as { commandId: string };
        expect(secondInput.commandId).not.toBe(firstInput.commandId);
        await expect(form.getByTestId("job-card-save-status")).toHaveText("Jobbet Ã¤r sparat.");
        await expect(page.getByRole("heading", { name: secondTitle, exact: true })).toBeVisible();
        const afterSecond = await f.snapshot();
        expect(afterSecond.jobs.find((row) => row.id === f.jobs.editable.id)).toMatchObject({
          title: secondTitle, estimated_duration_minutes: 150, priority: "high",
          customer_id: f.identity.customerId, facility_id: f.identity.facilityId, contact_id: f.identity.contactId,
          planned_travel_minutes: 30, crew_size: 2, earliest_date: "2026-10-12", desired_date: "2026-10-13",
          latest_date: "2026-10-14", planned_start_date: "2026-10-12", planned_end_date: "2026-10-13",
        });
        // Child replacement may refresh row identity/timestamps; compare complete
        // relationship content rather than treating those metadata as immutable.
        const roleContent = (rows: typeof after.roles) => rows.map((row) => [row.tenant_id, row.job_id, row.work_role_id]).sort();
        const windowContent = (rows: typeof after.windows) => rows.map((row) => [row.tenant_id, row.job_id, row.starts_at, row.ends_at]).sort();
        const dependencyContent = (rows: typeof after.dependencies) => rows.map((row) => [row.tenant_id, row.job_id, row.prerequisite_job_id]).sort();
        expect(roleContent(afterSecond.roles)).toEqual(roleContent(after.roles));
        expect(windowContent(afterSecond.windows)).toEqual(windowContent(after.windows));
        expect(dependencyContent(afterSecond.dependencies)).toEqual(dependencyContent(after.dependencies));
        expect(afterSecond.audit.length - after.audit.length).toBe(1);
        await page.reload();
        await expect(page.getByRole("heading", { name: secondTitle, exact: true })).toBeVisible();
        const reloaded = await openCard(page, f.jobs.editable.id);
        await reloaded.getByTestId("job-card-planning-toggle").click();
        await expect(reloaded.getByRole("combobox", { name: "Kontakt", exact: true })).toHaveValue(f.identity.contactId);
        await expect(reloaded.getByLabel("Uppskattad tid (minuter)", { exact: true })).toHaveValue("150");
        await expect(reloaded.getByLabel("Planerad restid (minuter)", { exact: true })).toHaveValue("30");
        await expect(reloaded.getByLabel("Antal personer", { exact: true })).toHaveValue("2");
        await expect(reloaded.getByLabel("Prioritet", { exact: true })).toHaveValue("high");
        await expect(reloaded.getByLabel("Tidigast", { exact: true })).toHaveValue("2026-10-12");
        await expect(reloaded.getByLabel("Ã–nskat datum", { exact: true })).toHaveValue("2026-10-13");
        await expect(reloaded.getByLabel("Senast", { exact: true })).toHaveValue("2026-10-14");
        await expect(reloaded.getByTestId(`job-required-role-${f.roleId}`)).toBeChecked();
        await expect(reloaded.getByTestId(`job-dependency-${f.jobs.prerequisite.id}`)).toBeChecked();
        await expect(reloaded.getByTestId("job-access-window-row").getByLabel("FrÃ¥n", { exact: true })).toHaveValue("2026-10-12T08:00");
        expect(await f.snapshot()).toEqual(afterSecond);
      } finally { await f.dispose(); }
    });

  test("[P0] 16.1-E03 actual job-bound booking preview/save consumes requirements and windows; changed job facts invalidate review before durable save", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      const setup = await invokeJobCard(f.fx.adminClient, "update", await loadCardInput(f, {
        accessWindows: [{ startsAt: "2026-10-12T06:00:00Z", endsAt: "2026-10-12T07:30:00Z" }],
      }));
      expect(setup.ok).toBe(true);
      await signIn(page, f.credentials.manager);
      await page.goto(`/jobs/${f.jobs.editable.id}?tab=schedule`);
      await hydrated(page.getByTestId("booking-entry-job"));
      await page.getByTestId("booking-entry-job").click();
      const sheet = page.getByRole("dialog");
      const description = `Job facts booking ${f.jobs.editable.id}`;
      await expect(sheet.getByTestId("booking-job")).toHaveValue(f.jobs.editable.id);
      await sheet.getByTestId("booking-description").fill(description);
      await sheet.getByTestId("booking-start").fill("2026-10-12T09:00");
      await sheet.getByTestId("booking-end").fill("2026-10-12T10:00");
      await sheet.getByTestId("booking-work-role").selectOption(f.roleId);
      // playwright-utils deviation: real action observation registered before the final draft change.
      const preview = page.waitForResponse((reply) => bookingAction(reply, "preview", description));
      await sheet.getByTestId(`booking-assignee-option-${f.fx.ownProfile.id}`).check();
      expect((await preview).ok()).toBe(true);
      const panel = sheet.getByTestId("booking-conflict-panel");
      await expect(panel).toContainText("Kompetens saknas");
      await expect(panel).toContainText("UtanfÃ¶r tilltrÃ¤destid");
      await sheet.getByTestId("booking-review-current-warnings").check();
      await sheet.getByTestId("booking-override-reason").fill("Reviewed original job requirements and access interval");
      // Real normal-JWT checked card command changes facts while this browser retains its receipt.
      const changed = await invokeJobCard(f.fx.adminClient, "update", await loadCardInput(f, {
        accessWindows: [{ startsAt: "2026-10-12T06:00:00Z", endsAt: "2026-10-12T07:00:00Z" }],
      }));
      expect(changed.ok).toBe(true);
      const beforeStaleSave = await f.snapshot();
      await expect(sheet.getByTestId("booking-save-error")).toHaveCount(0);
      const staleSave = page.waitForResponse((reply) => bookingAction(reply, "save", description))
        .then(async reply => ({reply, body: await reply.text()}));
      const freshPreview = page.waitForResponse((reply) => bookingAction(reply, "preview", description));
      await sheet.getByTestId("booking-save").click();
      const stale = await staleSave;
      expect(stale.reply.ok()).toBe(true); // Transport only; both wire and visible domain failure follow.
      expect(stale.body).toContain("PREVIEW_STALE");
      expect((await freshPreview).ok()).toBe(true);
      await expect(sheet.getByTestId("booking-save-error")).toHaveText(COMMAND_MESSAGES.PREVIEW_STALE);
      await expect(page.getByTestId("booking-save-status")).toHaveCount(0);
      await expect(sheet.getByTestId("booking-review-current-warnings")).not.toBeChecked();
      await expect(sheet.getByTestId("booking-override-reason")).toHaveValue("");
      expect(await f.snapshot()).toEqual(beforeStaleSave); // includes outcome/conflicts/audit, not only bookings
      await expect(panel).toContainText("UtanfÃ¶r tilltrÃ¤destid");
      await sheet.getByTestId("booking-review-current-warnings").check();
      await sheet.getByTestId("booking-override-reason").fill("Reviewed current narrower access interval");
      const save = page.waitForResponse((reply) => bookingAction(reply, "save", description));
      await sheet.getByTestId("booking-retry").click();
      expect((await save).ok()).toBe(true);
      await expect(page.getByTestId("booking-save-status")).toHaveText(/sparad/i);
      const after = await f.snapshot();
      const created = after.bookings.filter((row) => row.description === description);
      expect(created).toHaveLength(1);
      expect(created[0]).toMatchObject({ job_id: f.jobs.editable.id,
        starts_at: "2026-10-12T07:00:00+00:00", ends_at: "2026-10-12T08:00:00+00:00" });
      expect(after.assignees.filter((row) => row.booking_id === created[0].id)
        .map((row) => row.person_profile_id)).toEqual([f.fx.ownProfile.id]);
      const persisted = after.conflicts.filter((row) => row.booking_id === created[0].id);
      expect(persisted).toEqual(expect.arrayContaining([
        expect.objectContaining({ conflict_type: "competence_missing", status: "open" }),
        expect.objectContaining({ conflict_type: "outside_access_window", status: "open",
          starts_at: "2026-10-12T07:00:00+00:00", ends_at: "2026-10-12T08:00:00+00:00" }),
      ]));
      expect(after.audit.length - beforeStaleSave.audit.length).toBe(1);
      await page.reload();
      const summary = page.getByTestId(`booking-summary-${created[0].id}`);
      await expect(summary).toContainText(description);
      await summary.getByTestId("booking-edit").click();
      await expect(page.getByRole("dialog").getByTestId("booking-description")).toHaveValue(description);
      expect(await f.snapshot()).toEqual(after);
    } finally { await f.dispose(); }
  });

  test("[P1] 16.1-E04 dependency dates display unknown, a linked violated-order warning, then clear only after a durable date correction", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      expect((await invokeJobCard(f.fx.adminClient, "update", await loadCardInput(f))).ok).toBe(true);
      await signIn(page, f.credentials.manager);
      await page.goto(`/jobs/${f.jobs.editable.id}`);
      await expect(page.getByTestId("job-dependency-unknown")).toContainText(/okÃ¤nd|saknas/i);
      await expect(page.getByTestId("job-dependency-warning")).toHaveCount(0);
      let form = await openEdit(page, f.jobs.editable.id);
      await form.getByLabel("Planerat startdatum", { exact: true }).fill("2026-10-12");
      await saveCard(page, form, f.jobs.editable.id);
      form = await openEdit(page, f.jobs.prerequisite.id);
      await form.getByLabel("Planerat slutdatum", { exact: true }).fill("2026-10-13");
      await saveCard(page, form, f.jobs.prerequisite.id);
      await page.goto(`/jobs/${f.jobs.editable.id}`);
      await page.reload();
      const warning = page.getByTestId("job-dependency-warning");
      await expect(warning).toContainText(/fÃ¶re|beroende|slut/i);
      await expect(warning.getByRole("link", { name: "Ã–ppna fÃ¶regÃ¥ende jobb", exact: true }))
        .toHaveAttribute("href", `/jobs/${f.jobs.prerequisite.id}`);
      await expect(page.getByTestId("job-dependency-unknown")).toHaveCount(0);
      form = await openEdit(page, f.jobs.prerequisite.id);
      await form.getByLabel("Planerat slutdatum", { exact: true }).fill("2026-10-11");
      await saveCard(page, form, f.jobs.prerequisite.id);
      await page.goto(`/jobs/${f.jobs.editable.id}`);
      await page.reload();
      await expect(page.getByTestId("job-dependency-warning")).toHaveCount(0);
      await expect(page.getByTestId("job-dependency-unknown")).toHaveCount(0);
      const durable = await f.snapshot();
      expect(durable.jobs.find((row) => row.id === f.jobs.prerequisite.id)?.planned_end_date).toBe("2026-10-11");
      expect(durable.jobs.find((row) => row.id === f.jobs.editable.id)?.planned_start_date).toBe("2026-10-12");
      expect(durable.dependencies.filter((row) => row.job_id === f.jobs.editable.id)).toHaveLength(1);
    } finally { await f.dispose(); }
  });
});

test("[P0] checkpoint stale full-card draft is refused, retained, and only replaced after explicit fresh-read consent",async({resourcePage:page})=>{
  const f=await createJobsDepthFixture();
  try {
    expect((await invokeJobCard(f.fx.adminClient,"update",await loadCardInput(f))).ok).toBe(true);
    await signIn(page,f.credentials.manager);
    const form=await openCard(page,f.jobs.editable.id);
    const staleTitle=`Stale draft ${f.jobs.editable.id}`;
    await form.getByRole("textbox",{name:"Titel",exact:true}).fill(staleTitle);
    const first=await loadCardInput(f,{estimated_duration_minutes:180,requiredWorkRoleIds:[],dependencyJobIds:[],
      accessWindows:[{startsAt:"2026-10-12T07:00:00Z",endsAt:"2026-10-12T12:00:00Z"}]});
    expect((await invokeJobCard(f.fx.adminClient,"update",first)).ok).toBe(true);
    const committed=await f.snapshot();
    await form.getByTestId("job-card-save").click();
    await expect(form.getByTestId("job-card-stale")).toBeVisible();
    await expect(form.getByRole("textbox",{name:"Titel",exact:true})).toHaveValue(staleTitle);
    await expect(form.getByTestId("job-card-save-status")).toHaveCount(0);
    expect(await f.snapshot()).toEqual(committed);
    page.once("dialog",dialog=>dialog.dismiss());
    await form.getByTestId("job-card-read-current").click();
    await expect(form.getByRole("textbox",{name:"Titel",exact:true})).toHaveValue(staleTitle);
    page.once("dialog",dialog=>dialog.accept());
    await form.getByTestId("job-card-read-current").click();
    await expect(page.getByTestId("job-card-stale")).toHaveCount(0);
    const current=page.getByTestId("job-card-form");
    await expect(current.getByRole("textbox",{name:"Titel",exact:true})).toHaveValue(first.title);
    await current.getByTestId("job-card-planning-toggle").click();
    await expect(current.getByLabel("Uppskattad tid (minuter)",{exact:true})).toHaveValue("180");
    await expect(current.getByTestId(`job-required-role-${f.roleId}`)).not.toBeChecked();
    await expect(current.getByTestId(`job-dependency-${f.jobs.prerequisite.id}`)).not.toBeChecked();
    await expect(current.getByTestId("job-access-window-row").getByLabel("FrÃ¥n",{exact:true})).toHaveValue("2026-10-12T09:00");
    await current.getByRole("textbox",{name:"Titel",exact:true}).fill(`Reviewed ${f.jobs.editable.id}`);
    await current.getByTestId("job-card-save").click();
    await expect(page.getByTestId("job-card-save-status")).toBeVisible();
    const saved=await f.snapshot();
    expect(saved.jobs.find(row=>row.id===f.jobs.editable.id)).toMatchObject({estimated_duration_minutes:180,title:`Reviewed ${f.jobs.editable.id}`});
    expect(saved.roles).toEqual(committed.roles);expect(saved.dependencies).toEqual(committed.dependencies);
    // Replacement uses new child IDs, so compare exact persisted window instants.
    expect(saved.windows.filter(row=>row.job_id===f.jobs.editable.id).map(row=>[row.starts_at,row.ends_at]))
      .toEqual(committed.windows.filter(row=>row.job_id===f.jobs.editable.id).map(row=>[row.starts_at,row.ends_at]));
  } finally {await f.dispose();}
});

test("[P0] external follow-up selected tenant scopes Mine/all/deep links and entitled source filters agree",async({resourcePage:page})=>{
  const f=await createJobsDepthFixture();
  try {
    const {adminQuery}=await import("../../factories/admin-sql");
    const tenantA=f.fx.base.tenantA.id,tenantB=f.fx.base.tenantB.id,user=f.fx.users.projektledare;
    await adminQuery("insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)",[tenantA,f.jobs.acceptedAssigned.id,f.fx.coworkerProfile.id]);
    await adminInsertMembership({tenant_id:tenantB,user_id:user.id,role:"tenant_admin",status:"active"});
    const [{id:membership}]=await adminQuery<{id:string}>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2",[tenantB,user.id]);
    const [{id:profile}]=await adminQuery<{id:string}>("insert into public.person_profiles(tenant_id,membership_id) values($1,$2) returning id",[tenantB,membership]);
    await adminQuery("insert into public.job_members(tenant_id,job_id,person_profile_id) values($1,$2,$3)",[tenantB,f.jobs.foreign.id,profile]);
    await adminQuery("update public.tenant_memberships set created_at=case when tenant_id=$1 then '2026-01-01'::timestamptz else '2026-02-01'::timestamptz end where user_id=$2",[tenantA,user.id]);
    const [source]=await adminQuery<{quote_id:string;quote_number:number}>("select v.quote_id,v.quote_number from public.jobs j join public.quote_versions v on v.id=j.quote_version_id and v.tenant_id=j.tenant_id where j.id=$1",[f.jobs.acceptedAssigned.id]);
    await signIn(page,f.credentials.manager);
    for(const url of ["/jobs?view=mine","/jobs"]) {
      await page.goto(url);
      const rows=page.getByTestId("job-list-row");
      const row=rows.filter({has:page.locator(`a[href="/jobs/${f.jobs.acceptedAssigned.id}"]`)});
      await expect(row).toContainText(`Offert #${source.quote_number}`);
      await expect(rows.getByRole("link",{name:new RegExp(f.jobs.foreign.title)})).toHaveCount(0);
      const filter=page.getByTestId("job-filter-source-quote");await hydrated(filter);
      await expect(filter.locator(`option[value="${source.quote_id}"]`)).toHaveText(`Offert #${source.quote_number}`);
      await filter.selectOption(source.quote_id);
      await expect(rows).toHaveCount(1);await expect(row).toBeVisible();
      await filter.selectOption({label:"Utan kÃ¤lloffert"});await expect(row).toHaveCount(0);
    }
    const denied=await page.goto(`/jobs/${f.jobs.foreign.id}`);
    expect(denied?.status()).toBe(404);
    await expect(page.getByTestId("job-detail")).toHaveCount(0);
    await expect(page.getByText(f.jobs.foreign.title,{exact:true})).toHaveCount(0);
    expect(await denied!.text()).not.toContain("Foreign workshop");
  } finally {await f.dispose();}
});
