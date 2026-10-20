/** Story 16.5 essential connected workspace journeys; production bindings activated.
 * Spec SHA256 C84BE8587D0F84F4BFCCC4B8BB1635B534E687D372FA9086D3CC87350299EE8F.
 * Proposed/REPLACEABLE: English tab query IDs; tab/tabpanel composition; Mer exposing
 * overflow tabs; job-workspace-header/type/site/contact/responsible-pl/lead IDs,
 * assignment data-state, job-event-{id}, booking-interval-{id}, booking-mini-timeline and schedule-empty IDs. Bind these
 * to actual accessible production composition before activation. They are owner-
 * authorized design assumptions, not observed selectors or legacy evidence.
 * Existing login/card/member/WO/shared-file/booking controls are source inspected.
 * Next action parsing must track the real existing transport; never add a route,
 * widget, test-only persistence or grant to satisfy this file.
 *
 * playwright-utils: configured true, actual package absent; two-gate mandate inactive.
 * Deviations: existing resourcePage fixture/login, test.step, bounded expect.poll,
 * exact real-action waitForResponse and one-shot transport abort (E03 only).
 * No browser/service/DB work at collection; existing setup imports are lazy.
 * API/RLS suites own full revocation, foreign-child, forbidden-reader, money and
 * booking/proof matrices. These three journeys are essential usable flow only.
 * Broad visual/manual/device/browser matrices remain release validation.
 */
import { test, expect } from "../support/resource-cdp-attachment";
import type { Dialog, Locator, Page, Request, Route } from "@playwright/test";
import { withWorkspaceFixture, readWorkspaceEvents } from "../../support/job-workspace-atdd";

type TabName = "Översikt" | "Arbetsorder" | "Schema" | "Filer" | "Händelser";
// playwright-utils deviation: existing bounded hydration predicate; no fixed waits.
async function ready(locator: Locator) {
  await expect(locator).toBeVisible();
  await expect.poll(() => locator.evaluate(element =>
    Object.keys(element).some(key => key.startsWith("__react"))), { timeout: 10_000 }).toBe(true);
}
// playwright-utils deviation: installed project has no auth-session provider/package.
async function signIn(page: Page, credentials: { email: string; password: string }) {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await ready(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password);
  await submit.click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}
async function selectTab(page: Page, name: TabName) {
  const tab = page.getByRole("tab", { name, exact: true });
  // Replaceable mobile composition: overflow retains the same accessible tab names.
  if (!await tab.isVisible()) await page.getByRole("button", { name: "Mer", exact: true }).click();
  await tab.click();
  await expect(tab).toHaveAttribute("aria-selected", "true");
  await expect(page.getByRole("tabpanel", { name, exact: true })).toBeVisible();
}
async function identity(page: Page, jobId: string, title: string) {
  expect(new URL(page.url()).pathname).toBe(`/jobs/${jobId}`);
  const header = page.getByTestId("job-workspace-header");
  await expect(header).toBeVisible();
  await expect(header.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(header.getByTestId("job-status")).toBeVisible();
  await expect(header.getByTestId("job-customer")).toContainText("Workshop customer");
  await expect(header.getByTestId("job-site")).toContainText("Workshop");
  await expect(header.getByTestId("job-contact")).toContainText("Workshop contact");
  await expect(header.getByTestId("job-planned-dates")).toContainText("2026-10-12");
  await expect(header.getByTestId("job-responsible-pl")).toBeVisible();
  await expect(header.getByTestId("job-lead")).toBeVisible();
}
function cardAction(request: Request, jobId: string, title: string): Record<string, unknown> | null {
  if (request.method() !== "POST" || !request.headers()["next-action"]
    || new URL(request.url()).pathname !== `/jobs/${jobId}`) return null;
  try {
    const args: unknown = JSON.parse(request.postData() ?? "null");
    if (!Array.isArray(args) || args.length !== 1 || !args[0] || typeof args[0] !== "object") return null;
    const input = args[0] as Record<string, unknown>;
    return input.id === jobId && input.title === title && typeof input.commandId === "string"
      && "facility_id" in input ? input : null;
  } catch { return null; }
}

// playwright-utils deviation: resourcePage is the project's existing guard-owned browser attachment.
test.describe("Story 16.5 essential job workspace", () => {
  test("[P0] 16.5-E01 manager desktop keeps real header/overview and all five consumers, shared job file and server-confirmed edit across reload", async ({ resourcePage: page }) => {
    await withWorkspaceFixture(async f => {
      const { saveCard, upgradeInput, upgradeJob, jobSemanticsSnapshot } = await import("../../support/job-semantics-atdd");
      const { createWorkOrder } = await import("../../support/work-orders-atdd");
      const { seedMember } = await import("../../support/job-members-atdd");
      const jobId = f.jobs.both.id, title = `Workspace ${jobId}`;
      await saveCard(f, jobId, { title, responsible_project_manager_id: f.fx.coworkerProfile.id });
      await seedMember(f, jobId, f.fx.ownProfile.id, true);
      const child = await createWorkOrder(f.fx.plannerClient, jobId, { title: "Actual workspace work order" });
      const before = await f.snapshot();
      const bookings = before.bookings.filter(row => row.job_id === jobId);
      expect(bookings.length).toBeGreaterThan(0);
      await page.setViewportSize({ width: 1280, height: 900 });
      await signIn(page, f.credentials.manager);
      // Existing title/list entry, then stable route; no new entry point.
      await page.goto("/jobs");
      await page.getByRole("link", { name: title, exact: true }).click();
      await identity(page, jobId, title);
      await expect(page.getByRole("tab")).toHaveText(["Översikt", "Arbetsorder", "Schema", "Filer", "Händelser"]);
      await expect(page.getByTestId("job-workspace-type")).toContainText("Order");
      await expect(page.getByTestId("job-members-panel")).toBeVisible();
      await expect(page.getByTestId("job-operational-card")).toBeVisible();
      await expect(page.getByTestId("job-card-form")).toBeVisible();
      await expect(page.getByTestId("job-upgrade-open")).toBeVisible();
      await expect(page.getByTestId("job-standalone-origin")).toBeVisible();

      await test.step("Each tab mounts the real authorized consumer and retains the same header", async () => {
        await selectTab(page, "Arbetsorder");
        await expect(page.getByTestId(`work-order-${child}`)).toContainText("Actual workspace work order");
        await identity(page, jobId, title);
        await selectTab(page, "Schema");
        for (const booking of bookings) {
          await expect(page.getByTestId(`booking-summary-${booking.id}`)).toBeVisible();
          await expect(page.getByTestId("booking-mini-timeline").getByTestId(`booking-interval-${booking.id}`)).toBeVisible();
        }
        await expect(page.getByTestId("booking-entry-job")).toBeVisible();
        await expect(page.getByTestId("booking-edit").first()).toBeVisible();
        await identity(page, jobId, title);
        await selectTab(page, "Filer");
        const files = page.getByRole("tabpanel", { name: "Filer", exact: true }).getByRole("region", { name: "Filer", exact: true });
        const name = `workspace-${jobId}.txt`;
        await files.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({
          name, mimeType: "text/plain", buffer: Buffer.from("Real shared job workspace file"),
        });
        await files.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
        await expect(files.getByRole("status")).toContainText("Filen laddades upp");
        await page.reload();
        await expect(files.getByRole("listitem").filter({ hasText: name })).toHaveCount(1);
        const stored = await jobSemanticsSnapshot(f);
        const link = stored.fileLinks.find(row => row.owner_id === jobId && row.owner_type === "job");
        expect(link).toBeDefined();
        await identity(page, jobId, title);
        await selectTab(page, "Händelser");
        const events = await readWorkspaceEvents(f.fx.plannerClient, jobId);
        expect(events.error).toBeNull();
        expect(events.rows.length).toBeGreaterThan(0);
        for (const row of events.rows) await expect(page.getByTestId(`job-event-${row.id}`)).toBeVisible();
        await identity(page, jobId, title);
      });

      await selectTab(page, "Översikt");
      const card = page.getByTestId("job-card-form"), changed = `${title} edited`;
      await ready(card);
      await card.getByRole("textbox", { name: "Titel", exact: true }).fill(changed);
      // playwright-utils deviation: observer armed before exact real Next action.
      const saved = page.waitForResponse(reply => cardAction(reply.request(), jobId, changed) !== null);
      await card.getByTestId("job-card-save").click();
      expect((await saved).ok()).toBe(true);
      await expect(card.getByTestId("job-card-save-status")).toBeVisible();
      expect((await f.snapshot()).jobs.find(row => row.id === jobId)?.title).toBe(changed);
      await page.reload();
      await identity(page, jobId, changed);
      // Arrange an actual existing upgrade command solely to check its real event
      // label in the new timeline; 16.4 owns upgrade/replay/conservation matrices.
      const upgraded = await upgradeJob(f.fx.plannerClient, await upgradeInput(f.fx.plannerClient, jobId));
      expect(upgraded.ok).toBe(true);
      await page.goto(`/jobs/${jobId}?tab=events`);
      await expect(page.getByRole("tabpanel", { name: "Händelser", exact: true })).toContainText("Uppgraderad till projekt");
      await expect(page.getByTestId("job-workspace-type")).toContainText("Projekt");
      await identity(page, jobId, changed);
      // Existing accepted source consumer remains usable under its existing rights.
      await page.goto(`/jobs/${f.jobs.acceptedAssigned.id}`);
      await expect(page.getByTestId("job-source-traceability")).toBeVisible();
      await expect(page.getByTestId("job-source-quote-version")).toBeVisible();
    });
  });

  test("[P0] 16.5-E02 phone current member reads own booking subset, denied files fall back, and private PL/money/event payloads stay absent", async ({ resourcePage: page }) => {
    await withWorkspaceFixture(async f => {
      const { saveCard } = await import("../../support/job-semantics-atdd");
      const { seedMember, readMembers } = await import("../../support/job-members-atdd");
      const { bookingCommand, bookingInput } = await import("../../support/bookings-atdd");
      const jobId = f.jobs.both.id, title = `Private worker workspace ${jobId}`;
      await saveCard(f, jobId, { title, responsible_project_manager_id: f.fx.coworkerProfile.id });
      await seedMember(f, jobId, f.fx.ownProfile.id);
      // Existing leads may receive crew-picker labels. Use an ordinary member for the no-picker privacy boundary.
      await seedMember(f, jobId, f.fx.adminProfile.id, true);
      const nonOwnDescription = `Other person's booking ${jobId}`;
      const nonOwn = await bookingCommand("create", f.fx.adminClient, bookingInput([f.fx.coworkerProfile.id], {
        jobId, description: nonOwnDescription, startsAt: "2026-10-23T06:00:00Z", endsAt: "2026-10-23T07:00:00Z",
      }));
      expect(nonOwn.ok).toBe(true);
      const stored = await f.snapshot();
      const ownIds = stored.assignees.filter(row => row.person_profile_id === f.fx.ownProfile.id).map(row => row.booking_id);
      const visibleBookings = stored.bookings.filter(row => row.job_id === jobId && ownIds.includes(row.id));
      expect(visibleBookings.length).toBeGreaterThan(0);
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, f.credentials.assignedWorker);
      const response = await page.goto(`/jobs/${jobId}?tab=files`);
      expect(response?.ok()).toBe(true);
      await expect(page.getByRole("tab", { name: "Översikt", exact: true })).toHaveAttribute("aria-selected", "true");
      await expect(page.getByRole("tab", { name: "Filer", exact: true })).toHaveCount(0);
      await identity(page, jobId, title);
      const pl = page.getByTestId("job-responsible-pl");
      await expect(pl).toHaveAttribute("data-state", "assigned-name-unavailable");
      await expect(pl).toContainText(/tilldelad|utsedd/i);
      await expect(pl).not.toContainText(/ingen tilldelad/i);
      await expect(pl).not.toContainText(f.fx.coworkerProfile.id);
      await expect(page.getByTestId("job-lead")).toContainText((await readMembers(f.fx.montorClient, jobId)).members.find(row => row.personProfileId === f.fx.adminProfile.id)!.label);
      for (const id of ["job-card-form", "job-edit-open", "job-upgrade-open"]) await expect(page.getByTestId(id)).toHaveCount(0);
      await expect(page.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true })).toHaveCount(0);
      await expect(page.getByRole("button", { name: "Spara arbetsledare", exact: true })).toHaveCount(0);
      const wire = (await response!.text()).replace(/\\+"/g, '"');
      expect(wire).not.toMatch(/acceptedPriceOre|sourceSentTotalOre|accepted_price_ore|source_sent_total_ore|costRateOre|sellRateOre|supplierPrice|supplier_price|rawMetadata|raw_metadata|actorEmail|actor_email/);
      expect(wire).not.toMatch(/"reference"\s*:/);
      expect(wire).not.toContain(f.credentials.manager.email);
      const scheduleResponse = await page.goto(`/jobs/${jobId}?tab=schedule`);
      expect(scheduleResponse?.ok()).toBe(true);
      await expect(page.getByRole("tabpanel", { name: "Schema", exact: true })).toBeVisible();
      const scheduleWire = (await scheduleResponse!.text()).replace(/\\+"/g, '"');
      expect(scheduleWire).not.toContain(nonOwnDescription);
      expect(scheduleWire).not.toContain(f.credentials.manager.email);
      expect(scheduleWire).not.toMatch(/acceptedPriceOre|sourceSentTotalOre|costRateOre|sellRateOre|rawMetadata|actorEmail/);
      for (const booking of visibleBookings) await expect(page.getByTestId(`booking-summary-${booking.id}`)).toBeVisible();
      if (nonOwn.ok) await expect(page.getByTestId(`booking-summary-${nonOwn.data.bookingId}`)).toHaveCount(0);
      await expect(page.getByText(nonOwnDescription, { exact: true })).toHaveCount(0);
      await expect(page.getByTestId("booking-entry-job")).toHaveCount(0);
      await expect(page.getByTestId("booking-edit")).toHaveCount(0);
      await expect(page.getByTestId("booking-editor")).toHaveCount(0);
      await expect(page.getByTestId("booking-mini-timeline")).toBeVisible();
      await selectTab(page, "Händelser");
      const events = await readWorkspaceEvents(f.fx.montorClient, jobId);
      expect(events.error).toBeNull();
      expect(events.rows.length).toBeGreaterThan(0);
      for (const event of events.rows) {
        expect(Object.keys(event).sort()).toEqual(["eventType", "id", "occurredAt"]);
        await expect(page.getByTestId(`job-event-${event.id}`)).toBeVisible();
      }
      // An already-authorized current-job member label can now name this PL;
      // joining the job changes no tenant role, directory grant or booking grant.
      await seedMember(f, jobId, f.fx.coworkerProfile.id);
      const memberLabel = (await readMembers(f.fx.montorClient, jobId)).members.find(row => row.personProfileId === f.fx.coworkerProfile.id)!.label;
      await page.reload();
      await expect(pl).toHaveAttribute("data-state", "named");
      await expect(pl).toContainText(memberLabel);
      await expect(pl).not.toContainText(f.fx.coworkerProfile.id);
    });
  });

  test("[P1] 16.5-E03 keyboard/Mer, back/refresh and old document return keep selection and drafts; exact real save failure offers honest retry",
    { annotation: [{ type: "skipNetworkMonitoring", description: "One exactly identified card action is aborted before persistence, then retried against the real server" }] },
    async ({ resourcePage: page }) => {
      await withWorkspaceFixture(async f => {
        const { saveCard } = await import("../../support/job-semantics-atdd");
        const { createWorkOrder } = await import("../../support/work-orders-atdd");
        const jobId = f.jobs.editable.id, title = `Navigation ${jobId}`;
        await saveCard(f, jobId, { title });
        const child = await createWorkOrder(f.fx.plannerClient, jobId, { title: "Document-return child" });
        await page.setViewportSize({ width: 1280, height: 900 });
        await signIn(page, f.credentials.manager);
        // Existing /jobs/{parent}?workOrder={child} document-context return shape,
        // deliberately no tab parameter; document indexing/ACL is lower-layer scope.
        await page.goto(`/jobs/${jobId}?workOrder=${child}`);
        await expect(page.getByRole("tab", { name: "Arbetsorder", exact: true })).toHaveAttribute("aria-selected", "true");
        const pane = page.getByRole("region", { name: "Arbetsorderdetalj", exact: true });
        await expect(pane.getByRole("textbox", { name: "Rubrik", exact: true })).toHaveValue("Document-return child");
        await page.reload();
        await expect(pane).toBeVisible();
        await selectTab(page, "Översikt");
        const overview = page.getByRole("tab", { name: "Översikt", exact: true });
        await overview.focus();
        await overview.press("ArrowRight");
        const orderTab = page.getByRole("tab", { name: "Arbetsorder", exact: true });
        await expect(orderTab).toBeFocused();
        await orderTab.press("Enter");
        await expect(orderTab).toHaveAttribute("aria-selected", "true");
        expect(new URL(page.url()).searchParams.get("workOrder")).toBe(child);
        await selectTab(page, "Schema");
        await expect(page.getByTestId("job-schedule-empty")).toBeVisible();
        await expect(page.getByRole("tabpanel", { name: "Schema", exact: true }).getByRole("alert")).toHaveCount(0);
        await page.goBack();
        await expect(orderTab).toHaveAttribute("aria-selected", "true");
        await page.goto(`/jobs/${jobId}?tab=unknown`);
        await expect(overview).toHaveAttribute("aria-selected", "true");
        await identity(page, jobId, title);
        await page.setViewportSize({ width: 360, height: 640 });
        await page.getByRole("button", { name: "Mer", exact: true }).click();
        await page.getByRole("tab", { name: "Händelser", exact: true }).click();
        await expect(page.getByRole("tab", { name: "Händelser", exact: true })).toHaveAttribute("aria-selected", "true");
        await expect(page.getByRole("tab", { name: "Händelser", exact: true })).toBeFocused();
        await identity(page, jobId, title);
        await selectTab(page, "Arbetsorder");
        await page.getByTestId(`work-order-${child}`).getByRole("button", { name: "Document-return child", exact: true }).click();
        const draft = pane.getByRole("textbox", { name: "Rubrik", exact: true });
        await draft.fill("Unsent workspace draft");
        let protectedLeave = false;
        const rejectLeave = async (dialog: Dialog) => {
          expect(dialog.type()).toBe("confirm");
          expect(dialog.message()).toMatch(/osparad|utkast/i);
          protectedLeave = true;
          await dialog.dismiss();
        };
        page.on("dialog", rejectLeave); // arm before tab navigation; covers explicit leave protection
        try { await page.getByRole("tab", { name: "Översikt", exact: true }).click(); }
        finally { page.off("dialog", rejectLeave); }
        if (protectedLeave) await expect(orderTab).toHaveAttribute("aria-selected", "true");
        else await selectTab(page, "Arbetsorder"); // retained island path must preserve entered value
        await expect(draft).toHaveValue("Unsent workspace draft");
        // Explicitly abandon only after proving protection/preservation, before a separate card draft.
        const acceptLeave = async (dialog: Dialog) => { await dialog.accept(); };
        page.on("dialog", acceptLeave);
        try { await selectTab(page, "Översikt"); }
        finally { page.off("dialog", acceptLeave); }
        const card = page.getByTestId("job-card-form"), changed = `${title} retry`;
        await ready(card);
        await card.getByRole("textbox", { name: "Titel", exact: true }).fill(changed);
        const before = await f.snapshot();
        let intercepted = false, failedInput: Record<string, unknown> | null = null;
        // playwright-utils deviation: one-shot exact real transport failure; never synthetic success.
        const abortOnce = async (route: Route) => {
          const input = cardAction(route.request(), jobId, changed);
          if (!intercepted && input) { intercepted = true; failedInput = input; await route.abort("failed"); }
          else await route.continue();
        };
        await page.route("**/*", abortOnce);
        try {
          const failed = page.waitForEvent("requestfailed", { predicate: request => cardAction(request, jobId, changed) !== null });
          await card.getByTestId("job-card-save").click();
          await failed;
          expect(intercepted).toBe(true);
          await expect(card.getByTestId("job-card-unsent")).toHaveAttribute("role", "alert");
          await expect(card.getByTestId("job-card-save-status")).toHaveCount(0);
          await expect(card.getByRole("textbox", { name: "Titel", exact: true })).toHaveValue(changed);
          expect(await f.snapshot()).toEqual(before);
        } finally { await page.unroute("**/*", abortOnce); }
        const retry = card.getByTestId("job-card-retry");
        await expect(retry).toBeEnabled();
        // playwright-utils deviation: real response observer precedes the retry trigger.
        const saved = page.waitForResponse(reply => cardAction(reply.request(), jobId, changed) !== null);
        await retry.click();
        const reply = await saved;
        expect(reply.ok()).toBe(true);
        expect(cardAction(reply.request(), jobId, changed)).toEqual(failedInput);
        await expect(card.getByTestId("job-card-save-status")).toHaveAttribute("role", "status");
        expect((await f.snapshot()).jobs.find(row => row.id === jobId)?.title).toBe(changed);
        await page.reload();
        await identity(page, jobId, changed);
      });
    });
});