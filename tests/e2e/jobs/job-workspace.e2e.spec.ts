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
 * No browser/service/DB work at collection; real setup bindings use the static runner loader.
 * API/RLS suites own full revocation, foreign-child, forbidden-reader, money and
 * booking/proof matrices. These three journeys are essential usable flow only.
 * Broad visual/manual/device/browser matrices remain release validation.
 */
import { test, expect } from "../support/resource-cdp-attachment";
import type { Dialog, Locator, Page, Request, Route } from "@playwright/test";
import { withWorkspaceFixture, readWorkspaceEvents } from "../../support/job-workspace-atdd";
import { saveCard, upgradeInput, upgradeJob, jobSemanticsSnapshot } from "../../support/job-semantics-atdd";
import { createWorkOrder, readWorkOrders } from "../../support/work-orders-atdd";
import { seedMember, readMembers } from "../../support/job-members-atdd";
import { bookingCommand, bookingInput } from "../../support/bookings-atdd";
import { runCommand } from "@/server/commands/envelope";
import { updateJob } from "@/server/commands/jobs";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { adminQuery } from "../../factories/admin-sql";

/** Actual production-page PNG Buffer attachments are embedded by JSONReporter.
 * Controlled transport never substitutes route payloads or fabricates success.
 */
async function attachJobsState(page: Page, state: string, mode: "actual" | "controlled-transport" | "controlled-persisted-state" = "actual") {
  const viewport = page.viewportSize();
  const name = `35-4-jobs-${state}-${viewport?.width}x${viewport?.height}-${mode}`;
  await test.info().attach(`${name}.png`, { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });
  await test.info().attach(`${name}.provenance.json`, { body: Buffer.from(JSON.stringify({
    state, mode, viewport, test: test.info().titlePath,
    workflowSha: process.env.GITHUB_SHA || null, candidateSha: null,
    candidateIdentity: process.env.GITHUB_SHA ? "requires exact workflow checkout verification" : "local-uncommitted",
    rendering: "actual production page; next start via configured production webServer",
    fixture: mode === "controlled-persisted-state"
      ? "defensive schema-permitted standalone parent; NULL source refs and genuinely absent events; not ordinary command creation"
      : "synthetic test-owned Jobs records; checked normal-JWT commands and DB-owned event identity/time",
    route: new URL(page.url()).pathname,
    command: "pnpm exec playwright test tests/e2e/jobs/job-workspace.e2e.spec.ts",
  })), contentType: "application/json" });
}

/** Same run-bound control contract as the next-start-only preload. IDs only;
 * atomic replace avoids partially parsed state, and restrictive POSIX modes apply
 * where supported (Windows retains the user's test-results directory ACL).
 */
async function setJobEventsTransportFault(jobId: string, actorUserId: string, armed: boolean) {
  const control = process.env.E2E_JOB_EVENTS_FETCH_FAULT_CONTROL;
  const runId = process.env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID;
  if (control !== resolve("test-results/private/job-events-fetch-fault.json") || !runId) {
    throw new Error("Run-bound safe-events startup adapter is required");
  }
  await mkdir(dirname(control), {recursive: true, mode: 0o700});
  const temporary = `${control}.${runId}.tmp`;
  await writeFile(temporary, JSON.stringify({schemaVersion: 1, runId, armed, jobId, actorUserId}), {mode: 0o600});
  await rename(temporary, control);
  expect(JSON.parse(await readFile(control, "utf8"))).toEqual({schemaVersion: 1, runId, armed, jobId, actorUserId});
}

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
// Temporary E03 runtime evidence: bounded paths/actions/armed booleans/key NAMES only.
async function installCardHistoryDiagnostics(page: Page, jobId: string) {
  const prefix = "16.5-E03-HISTORY ";
  page.on("console", message => {if (message.text().startsWith(prefix)) console.info(message.text());});
  await page.evaluate(({prefix, expectedPath}) => {
    let count = 0;
    const active = new Map<EventListenerOrEventListenerObject, EventListener>();
    const add = window.addEventListener, remove = window.removeEventListener;
    const confirm = window.confirm, push = history.pushState, replace = history.replaceState;
    const knownKeys = new Set(["__NA", "__N", "_N", "__PRIVATE_NEXTJS_INTERNALS_TREE", "bookingEditor", "key"]);
    const keys = (state: unknown) => state && typeof state === "object"
      ? [...new Set(Object.keys(state).map(key => knownKeys.has(key) ? key : "[other-key]"))].sort() : [];
    const pathCategory = (target: string | URL | null | undefined) => {
      const path = new URL(target ?? location.href, location.href).pathname;
      return path === expectedPath ? "/jobs/current-job" : path === "/jobs" ? "/jobs"
        : /^\/jobs\/[^/]+$/.test(path) ? "/jobs/other-job" : path === "/login" ? "/login" : "/other";
    };
    const emit = (kind: string, target?: string | URL | null, state?: unknown) => {
      if (count++ >= 64) return;
      try {
        console.info(prefix + JSON.stringify({kind, path: pathCategory(target),
          armed: active.size > 0, historyKeys: keys(state === undefined ? history.state : state)}));
      } catch { /* Diagnostic failure must never affect the original navigation. */ }
    };
    const capture = (options?: boolean | AddEventListenerOptions | EventListenerOptions) => options === true || (typeof options === "object" && options.capture === true);
    // Observe before the application guard, without cancelling or modifying the event.
    add.call(window, "popstate", event => emit("pop-observed", location.href, (event as PopStateEvent).state), true);
    add.call(window, "beforeunload", () => emit("beforeunload-observed"));
    const navigation = (window as Window & {navigation?: EventTarget}).navigation;
    navigation?.addEventListener("navigate", event => {
      const movement = event as Event & {navigationType?: string; destination?: {url: string; sameDocument: boolean}};
      if (movement.navigationType !== "traverse") return;
      const scope = movement.destination?.sameDocument ? "samedocument" : "crossdocument";
      emit(`traverse-${scope}-${event.cancelable ? "cancellable" : "noncancellable"}`, movement.destination?.url);
    });
    const stages = new Set(["after-dirty-fill", "before-cancelled-reload", "before-back"]);
    add.call(window, "workspace-history-stage", event => {
      const stage = (event as CustomEvent<string>).detail;
      if (stages.has(stage)) emit(stage);
    });
    window.addEventListener = function(this: Window, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | AddEventListenerOptions) {
      if (type !== "popstate" || !capture(options)) return add.call(this, type, listener, options);
      // Only the actual card guard's ordinary capture registration is tracked.
      // Automatic once/signal removal cannot be inferred from add/remove calls.
      if (typeof options === "object" && (options.once || options.signal)) {
        emit("capture-listener-untracked-options");
        return add.call(this, type, listener, options);
      }
      let wrapped = active.get(listener);
      if (!wrapped) {
        wrapped = function(this: Window, event: Event) {
          emit("guard-pop-enter");
          try {return typeof listener === "function" ? listener.call(this, event) : listener.handleEvent(event);}
          finally {emit("guard-pop-exit");}
        };
        active.set(listener, wrapped);
      }
      const result = add.call(this, type, wrapped, options);
      emit("guard-listener-added");
      return result;
    } as typeof window.addEventListener;
    window.removeEventListener = function(this: Window, type: string, listener: EventListenerOrEventListenerObject, options?: boolean | EventListenerOptions) {
      if (type !== "popstate" || !capture(options)) return remove.call(this, type, listener, options);
      const wrapped = active.get(listener);
      active.delete(listener);
      const result = remove.call(this, type, wrapped ?? listener, options);
      emit("guard-listener-removed");
      return result;
    } as typeof window.removeEventListener;
    window.confirm = function(this: Window, message?: string) {
      emit("confirm-request");
      const accepted = confirm.call(this, message);
      emit(accepted ? "confirm-accepted" : "confirm-refused");
      return accepted;
    };
    history.pushState = function(data: unknown, unused: string, url?: string | URL | null) {emit("history-push", url, data); return push.call(this, data, unused, url);};
    history.replaceState = function(data: unknown, unused: string, url?: string | URL | null) {emit("history-replace", url, data); return replace.call(this, data, unused, url);};
    emit("diagnostic-installed");
  }, {prefix, expectedPath: `/jobs/${jobId}`});
}
async function cardHistoryStage(page: Page, stage: string) {
  await page.evaluate(stage => window.dispatchEvent(new CustomEvent("workspace-history-stage", {detail: stage})), stage);
}
async function identity(page: Page, jobId: string, title: string) {
  await expect(page).toHaveURL(url => url.pathname === `/jobs/${jobId}`);
  const header = page.getByTestId("job-workspace-header");
  await expect(header).toBeVisible();
  await expect(header.getByRole("heading", { name: title, exact: true })).toBeVisible();
  await expect(header.getByTestId("job-status")).toBeVisible();
  const details = header.getByTestId("job-workspace-details");
  const disclosed = await details.getAttribute("open") === null;
  if (disclosed) await details.locator("summary").click();
  await expect(header.getByTestId("job-customer")).toContainText("Workshop customer");
  await expect(header.getByTestId("job-site")).toContainText("Workshop");
  await expect(header.getByTestId("job-contact")).toContainText("Workshop contact");
  await expect(header.getByTestId("job-planned-dates")).toContainText("2026-10-12");
  await expect(header.getByTestId("job-responsible-pl")).toBeVisible();
  await expect(header.getByTestId("job-lead")).toBeVisible();
  if (disclosed) await details.locator("summary").click();
}
async function openListedJob(page: Page, jobId: string, title: string) {
  const row = page.getByTestId("job-list-row").filter({hasText: title});
  await expect(row.getByText(title, {exact: true})).toBeVisible();
  const link = row.getByRole("link");
  await expect(link).toHaveAttribute("href", `/jobs/${jobId}`);
  await link.click();
  await expect(page).toHaveURL(url => url.pathname === `/jobs/${jobId}`);
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
      const jobId = f.jobs.both.id, title = `Workspace ${jobId}`;
      await saveCard(f, jobId, { title, responsible_project_manager_id: f.fx.coworkerProfile.id });
      await seedMember(f, jobId, f.fx.ownProfile.id, true);
      const child = await createWorkOrder(f.fx.plannerClient, jobId, { title: "Actual workspace work order" });
      const cancelled = await bookingCommand("create", f.fx.adminClient, bookingInput([f.fx.ownProfile.id], {
        jobId, description: "Cancelled workspace interval", status: "cancelled", startsAt: "2026-10-25T06:00:00Z", endsAt: "2026-10-25T07:00:00Z",
      }));
      expect(cancelled.ok).toBe(true);
      const before = await f.snapshot();
      const bookings = before.bookings.filter(row => row.job_id === jobId);
      expect(bookings.length).toBeGreaterThan(0);
      await page.setViewportSize({ width: 1280, height: 900 });
      await signIn(page, f.credentials.manager);
      // Existing title/list entry, then stable route; no new entry point.
      await page.goto("/jobs");
      await openListedJob(page, jobId, title);
      await identity(page, jobId, title);
      await expect(page.getByRole("tab")).toHaveText(["Översikt", "Arbetsorder", "Schema", "Filer", "Händelser"]);
      await expect(page.getByTestId("job-workspace-type")).toContainText("Order");
      await expect(page.getByTestId("job-members-panel")).toBeVisible();
      await expect(page.getByTestId("job-operational-card")).toBeVisible();
      await expect(page.getByTestId("job-card-form")).toBeVisible();
      await expect(page.getByTestId("job-upgrade-open")).toBeVisible();
      await expect(page.getByTestId("job-standalone-origin")).toBeVisible();

      await test.step("Persistent header opens the actual preconnected booking editor and covers navigation with its modal", async () => {
        const header = page.getByTestId("job-workspace-header");
        await header.getByRole("button", {name: "Boka", exact: true}).click();
        await expect(page.getByRole("tab", {name: "Schema", exact: true})).toHaveAttribute("aria-selected", "true");
        const editor = page.getByTestId("booking-editor");
        await expect(editor).toBeVisible();
        await expect(editor.getByTestId("booking-job")).toHaveValue(jobId);
        await page.getByRole("dialog").getByRole("button", {name: "Stäng", exact: true}).click();
        await expect(editor).toHaveCount(0);
        // BookingEditor close owns an asynchronous Back; observe its public marker handoff before navigating.
        await expect.poll(() => page.evaluate(() => Object.prototype.hasOwnProperty.call(history.state ?? {}, "bookingEditor"))).toBe(false);
        await selectTab(page, "Översikt");
        await page.getByTestId("job-workspace-content").evaluate(element => {element.scrollTop = element.scrollHeight;});
        await expect(header).toBeInViewport();
        const viewport = await page.getByTestId("job-workspace-content").boundingBox();
        expect(viewport!.height).toBeGreaterThanOrEqual(96);
        await page.setViewportSize({width: 360, height: 640});
        await page.getByTestId("job-workspace-content").evaluate(element => {element.scrollTop = element.scrollHeight;});
        await expect(header).toBeInViewport();
        const phoneViewport = await page.getByTestId("job-workspace-content").boundingBox();
        expect(phoneViewport!.height).toBeGreaterThanOrEqual(96);
        await header.getByTestId("job-upgrade-open").click();
        await expect(page.getByTestId("job-upgrade-dialog")).toBeVisible();
        const tab = page.getByRole("tab", {name: "Arbetsorder", exact: true});
        const box = await tab.boundingBox();
        expect(box).not.toBeNull();
        // A physical pointer hit at the underlying tab must hit the modal backdrop, never activate navigation.
        await page.mouse.click(box!.x + box!.width / 2, box!.y + box!.height / 2);
        await expect(page.getByRole("tab", {name: "Översikt", exact: true})).toHaveAttribute("aria-selected", "true");
        await expect(page.getByTestId("job-upgrade-dialog")).toHaveCount(0);
        // Ordinary pointer interaction in the phone body remains reachable below the persistent chrome.
        await selectTab(page, "Schema");
        await page.getByTestId("booking-entry-job").click();
        await expect(editor).toBeVisible();
        await expect(editor.getByTestId("booking-job")).toHaveValue(jobId);
        await page.getByRole("dialog").getByRole("button", {name: "Stäng", exact: true}).click();
        await expect(editor).toHaveCount(0);
        // BookingEditor close owns an asynchronous Back; observe its public marker handoff before navigating.
        await expect.poll(() => page.evaluate(() => Object.prototype.hasOwnProperty.call(history.state ?? {}, "bookingEditor"))).toBe(false);
        await selectTab(page, "Översikt");
        await page.setViewportSize({width: 1280, height: 900});
      });

      await test.step("Each tab mounts the real authorized consumer and retains the same header", async () => {
        await selectTab(page, "Arbetsorder");
        await expect(page.getByTestId(`work-order-${child}`)).toContainText("Actual workspace work order");
        await identity(page, jobId, title);
        await selectTab(page, "Schema");
        for (const booking of bookings) {
          await expect(page.getByTestId(`booking-summary-${booking.id}`)).toBeVisible();
          await expect(page.getByTestId("booking-mini-timeline").getByTestId(`booking-interval-${booking.id}`)).toBeVisible();
        }
        if (cancelled.ok) await expect(page.getByTestId(`booking-interval-${cancelled.data.bookingId}`)).toContainText("Avbruten");
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
        await draft.scrollIntoViewIfNeeded();
        await attachJobsState(page, "inherited-work-order-retained-unsent-input");
        // Explicitly abandon only after proving protection/preservation, before a separate card draft.
        const acceptLeave = async (dialog: Dialog) => { await dialog.accept(); };
        page.on("dialog", acceptLeave);
        try {
          await selectTab(page, "Arbetsorder");
          await page.getByRole("button", {name: "Stäng arbetsorder", exact: true}).click();
          await selectTab(page, "Översikt");
        } finally { page.off("dialog", acceptLeave); }
        // Establish a real prior SPA route before arming the card-only leave guard.
        await page.goto("/jobs");
        await installCardHistoryDiagnostics(page, jobId);
        await openListedJob(page, jobId, title);
        const card = page.getByTestId("job-card-form"), changed = `${title} retry`;
        await ready(card);
        await card.getByRole("textbox", { name: "Titel", exact: true }).fill(changed);
        await cardHistoryStage(page, "after-dirty-fill");
        await test.step("Only the card draft blocks refresh, browser Back and SPA exit; same-job tabs retain it", async () => {
          await cardHistoryStage(page, "before-cancelled-reload");
          const prompt = page.waitForEvent("dialog");
          const reload = page.evaluate(() => window.location.reload());
          const unload = await prompt;
          expect(unload.type()).toBe("beforeunload");
          await unload.dismiss();
          await reload;
          await expect(card.getByRole("textbox", {name: "Titel", exact: true})).toHaveValue(changed);
          await card.getByRole("textbox", {name: "Titel", exact: true}).scrollIntoViewIfNeeded();
          await attachJobsState(page, "inherited-card-retained-after-cancelled-refresh");
          await page.setViewportSize({width: 1280, height: 900});
          await cardHistoryStage(page, "before-back");
          const backPrompt = page.waitForEvent("dialog");
          const away = page.evaluate(() => window.history.back());
          const back = await backPrompt;
          expect(back.type()).toBe("confirm");
          expect(back.message()).toContain("jobbkortet");
          await back.dismiss();
          await away;
          await expect(card.getByRole("textbox", {name: "Titel", exact: true})).toHaveValue(changed);
          expect(new URL(page.url()).pathname).toBe(`/jobs/${jobId}`);
          await card.getByRole("textbox", {name: "Titel", exact: true}).scrollIntoViewIfNeeded();
          await attachJobsState(page, "inherited-card-retained-after-cancelled-back");
          const exitPrompt = page.waitForEvent("dialog");
          const leave = page.getByRole("navigation", {name: "Huvudnavigation", exact: true}).getByRole("link", {name: "Jobb/Order", exact: true}).click();
          const exit = await exitPrompt;
          expect(exit.type()).toBe("confirm");
          expect(exit.message()).toContain("jobbkortet");
          await exit.dismiss();
          await leave;
          expect(new URL(page.url()).pathname).toBe(`/jobs/${jobId}`);
          await selectTab(page, "Schema");
          await selectTab(page, "Översikt");
          await expect(card.getByRole("textbox", {name: "Titel", exact: true})).toHaveValue(changed);
        });
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
        await page.getByRole("navigation", {name: "Huvudnavigation", exact: true}).getByRole("link", {name: "Jobb/Order", exact: true}).click();
        await expect(page).toHaveURL(/\/jobs$/);
      });
    });
  test("[P0] 16.5-E04 two-child back restores identity and files; late real create retains current tab and query", async ({resourcePage: page}) => {
    await withWorkspaceFixture(async f => {
      const jobId = f.jobs.editable.id;
      await saveCard(f, jobId);
      const a = await createWorkOrder(f.fx.plannerClient, jobId, {title: "History child A"});
      const b = await createWorkOrder(f.fx.plannerClient, jobId, {title: "History child B"});
      await signIn(page, f.credentials.manager);
      await page.goto(`/jobs/${jobId}?tab=work-orders&workOrder=${a}&returnTo=%2Fdocuments`);
      const pane = page.getByTestId("work-order-pane");
      await expect(pane.getByLabel("Rubrik", {exact: true})).toHaveValue("History child A");
      await selectTab(page, "Översikt");
      await selectTab(page, "Arbetsorder");
      await page.getByTestId(`work-order-${b}`).getByRole("button", {name: "History child B", exact: true}).click();
      await expect(page).toHaveURL(url => url.searchParams.get("workOrder") === b);
      await expect(pane.getByLabel("Rubrik", {exact: true})).toHaveValue("History child B");
      await page.goBack();
      expect(new URL(page.url()).searchParams.get("workOrder")).toBe(a);
      await selectTab(page, "Arbetsorder");
      await expect(pane.getByLabel("Rubrik", {exact: true})).toHaveValue("History child A");
      // Returned shared-file consumer belongs to the restored child, never the previous child.
      await expect(pane.getByTestId(`entity-file-panel-work-order-${a}`)).toBeVisible();
      await expect(pane.locator('input[name="owner_id"]')).toHaveValue(a);
      const unsentFile = pane.getByLabel("Välj en fil att ladda upp", {exact: true});
      await unsentFile.setInputFiles({name: "unsent-child-A.txt", mimeType: "text/plain", buffer: Buffer.from("Unsent A evidence")});
      await pane.getByLabel("Rubrik", {exact: true}).fill("Unsent child A with file");
      const rejectedSelection = page.waitForEvent("dialog");
      const tryB = page.getByTestId(`work-order-${b}`).getByRole("button", {name: "History child B", exact: true}).click();
      const selectionWarning = await rejectedSelection;
      expect(selectionWarning.type()).toBe("confirm");
      await selectionWarning.dismiss();
      await tryB;
      await expect(page).toHaveURL(url => url.searchParams.get("workOrder") === a);
      await expect(pane.getByLabel("Rubrik", {exact: true})).toHaveValue("Unsent child A with file");
      expect(await unsentFile.evaluate(input => Array.from((input as HTMLInputElement).files ?? [], file => file.name))).toEqual(["unsent-child-A.txt"]);
      await expect(pane.locator('input[name="owner_id"]')).toHaveValue(a);
      await selectTab(page, "Översikt");
      await selectTab(page, "Arbetsorder");
      const acceptedSelection = page.waitForEvent("dialog");
      const chooseB = page.getByTestId(`work-order-${b}`).getByRole("button", {name: "History child B", exact: true}).click();
      await (await acceptedSelection).accept();
      await chooseB;
      await expect(page).toHaveURL(url => url.searchParams.get("workOrder") === b);
      await pane.getByLabel("Rubrik", {exact: true}).fill("Unsent child B draft");
      const protection = page.waitForEvent("dialog");
      const back = page.goBack();
      const warning = await protection;
      expect(warning.type()).toBe("confirm");
      expect(warning.message()).toMatch(/osparad|pågående|utkast/i);
      await warning.dismiss();
      await back;
      await expect(page).toHaveURL(url => url.searchParams.get("workOrder") === b);
      await selectTab(page, "Arbetsorder");
      await expect(pane.getByLabel("Rubrik", {exact: true})).toHaveValue("Unsent child B draft");
      const abandon = page.waitForEvent("dialog");
      const close = page.getByRole("button", {name: "Stäng arbetsorder", exact: true}).click();
      await (await abandon).accept();
      await close;
      const panel = page.getByTestId("job-work-orders-panel");
      await panel.getByRole("button", {name: "Ny arbetsorder", exact: true}).click();
      await pane.getByLabel("Rubrik", {exact: true}).fill("Late workspace child");
      let release!: () => void, observed!: () => void;
      const held = new Promise<void>(resolve => {release = resolve;});
      const committed = new Promise<void>(resolve => {observed = resolve;});
      let captured = false;
      const holdCreate = async (route: Route) => {
        const request = route.request();
        if (!captured && request.method() === "POST" && request.headers()["next-action"] && new URL(request.url()).pathname === `/jobs/${jobId}`
          && request.postData()?.includes('"title":"Late workspace child"')) {
          captured = true;
          const reply = await route.fetch();
          expect(reply.ok()).toBe(true);
          observed();
          await held;
          await route.fulfill({response: reply});
        } else await route.continue();
      };
      await page.route("**/*", holdCreate);
      try {
        await pane.getByRole("button", {name: "Skapa arbetsorder", exact: true}).click();
        await committed;
        await selectTab(page, "Händelser");
        const query = new URLSearchParams(new URL(page.url()).search);
        query.set("returnTo", "/files?search=kept");
        await page.evaluate(query => window.history.replaceState(window.history.state, "", `?${query}`), query.toString());
        release();
        await expect(pane.getByTestId("work-order-save-status")).toBeAttached();
        await expect(page.getByRole("tab", {name: "Händelser", exact: true})).toHaveAttribute("aria-selected", "true");
        const rows = (await readWorkOrders(f.fx.plannerClient, jobId)).rows.filter(row => row.title === "Late workspace child");
        expect(rows).toHaveLength(1);
        await expect(page).toHaveURL(url => url.pathname === `/jobs/${jobId}` && url.searchParams.get("workOrder") === rows[0].id);
        const current = new URL(page.url());
        expect(current.searchParams.get("returnTo")).toBe("/files?search=kept");
        expect(current.searchParams.get("workOrder")).toBe(rows[0].id);
        await expect(page.getByRole("tab", {name: "Händelser", exact: true})).toHaveAttribute("aria-selected", "true");
      } finally {release(); await page.unroute("**/*", holdCreate);}
    });
  });
  test("[P0] 16.5-E05 accepted child navigation wins over a late real create completion", async ({resourcePage: page}) => {
    await withWorkspaceFixture(async f => {
      const jobId = f.jobs.editable.id, createdTitle = "Late create must not steal navigation";
      await saveCard(f, jobId);
      const b = await createWorkOrder(f.fx.plannerClient, jobId, {title: "Navigation winner B"});
      await signIn(page, f.credentials.manager);
      await page.goto(`/jobs/${jobId}?tab=work-orders`);
      const panel = page.getByTestId("job-work-orders-panel"), pane = page.getByTestId("work-order-pane");
      await panel.getByRole("button", {name: "Ny arbetsorder", exact: true}).click();
      await pane.getByLabel("Rubrik", {exact: true}).fill(createdTitle);
      let releaseCreate!: () => void, releaseNavigation!: () => void, createReady!: () => void, navigationReady!: () => void;
      const heldCreate = new Promise<void>(resolve => {releaseCreate = resolve;});
      const heldNavigation = new Promise<void>(resolve => {releaseNavigation = resolve;});
      const createCommitted = new Promise<void>(resolve => {createReady = resolve;});
      const navigationObserved = new Promise<void>(resolve => {navigationReady = resolve;});
      let capturedCreate = false, capturedNavigation = false;
      const destinations: string[] = [];
      const holdActual = async (route: Route) => {
        const request = route.request(), url = new URL(request.url());
        if (url.pathname !== `/jobs/${jobId}`) {await route.continue(); return;}
        if (!capturedCreate && request.method() === "POST" && request.headers()["next-action"]
          && request.postData()?.includes(`"title":"${createdTitle}"`)) {
          capturedCreate = true;
          const reply = await route.fetch();
          expect(reply.ok()).toBe(true);
          createReady();
          await heldCreate;
          await route.fulfill({response: reply});
        } else if (request.method() === "GET" && request.headers().rsc === "1" && url.searchParams.has("workOrder")) {
          destinations.push(url.searchParams.get("workOrder")!);
          if (!capturedNavigation && url.searchParams.get("workOrder") === b) {
            capturedNavigation = true;
            const reply = await route.fetch();
            expect(reply.ok()).toBe(true);
            navigationReady();
            await heldNavigation;
            await route.fulfill({response: reply});
          } else await route.continue();
        } else await route.continue();
      };
      await page.route("**/*", holdActual);
      let choice: Promise<void> | undefined;
      try {
        await pane.getByRole("button", {name: "Skapa arbetsorder", exact: true}).click();
        await createCommitted;
        const consent = page.waitForEvent("dialog");
        choice = page.getByTestId(`work-order-${b}`).getByRole("button", {name: "Navigation winner B", exact: true}).click();
        expect((await consent).type()).toBe("confirm");
        await (await consent).accept();
        await navigationObserved;
        await expect(pane.getByLabel("Rubrik", {exact: true})).toBeDisabled();
        releaseCreate();
        await expect(pane.getByTestId("work-order-save-status")).toBeAttached();
        const created = (await readWorkOrders(f.fx.plannerClient, jobId)).rows.filter(row => row.title === createdTitle);
        expect(created).toHaveLength(1);
        await expect(page.getByTestId(`work-order-${created[0].id}`)).toHaveCount(1);
        expect(destinations).toContain(b);
        expect(destinations).not.toContain(created[0].id);
        releaseNavigation();
        await choice;
        await expect(page).toHaveURL(url => url.pathname === `/jobs/${jobId}` && url.searchParams.get("workOrder") === b);
        await expect(pane.getByLabel("Rubrik", {exact: true})).toHaveValue("Navigation winner B");
        await expect(pane.getByLabel("Rubrik", {exact: true})).toBeEnabled();
        expect((await readWorkOrders(f.fx.plannerClient, jobId)).rows.filter(row => row.title === createdTitle)).toHaveLength(1);
      } finally {
        releaseCreate(); releaseNavigation();
        await choice?.catch(() => {});
        await page.unroute("**/*", holdActual);
      }
    });
  });});
// E35-4-T-AC1 / E35-4-T-AC4 / E35-4-T-AC6 / E35-4-T-AC7;
// E35-4-STATE-loaded. E01/E02 retain route/privacy/navigation coverage.
// Activated against the 35.4 presentation; runtime result must still be recorded separately.
// No synthetic event actors, metadata or history; only the existing safe read projection.
test.describe("Story 35.4 representative AuditTrail", () => {
  for (const viewport of [{width: 1280, height: 900}, {width: 360, height: 640}]) {
    test(`[P1][E35-4-T-AC1,AC4,AC6,AC7] safe compact and full AuditTrail retain Swedish labels and exact Stockholm times at ${viewport.width}x${viewport.height}`, async ({resourcePage: page}) => {
      await withWorkspaceFixture(async f => {
        const jobId = f.jobs.both.id;
        // Genuine checked transitions append DB-owned events; no direct history INSERT.
        for (const status of ["in_progress", "done", "cancelled"] as const) {
          const updated = await runCommand(updateJob, { client: f.fx.plannerClient as never,
            input: { id: jobId, status }, correlationId: crypto.randomUUID() });
          expect(updated.ok).toBe(true);
        }
        const events = await readWorkspaceEvents(f.fx.plannerClient, jobId);
        expect(events.error).toBeNull();
        expect(events.rows.length).toBeGreaterThan(3);
        const labels: Record<string, string> = {
          created: "Skapad", in_progress: "Pågår", done: "Klar", cancelled: "Avbruten",
          upgraded_to_projekt: "Uppgraderad till projekt",
        };
        const assertRows = async (panel: Locator, expected: typeof events.rows) => {
          await expect(panel.getByRole("listitem")).toHaveCount(expected.length);
          for (const [index, event] of expected.entries()) {
            const row = panel.getByRole("listitem").nth(index);
            await expect(row).toContainText(labels[event.eventType] ?? "Jobbet uppdaterades");
            const time = row.locator("time");
            await expect(time).toHaveAttribute("datetime", event.occurredAt);
            await expect(time).toHaveText(new Date(event.occurredAt).toLocaleString("sv-SE", {timeZone: "Europe/Stockholm"}));
          }
        };
        await page.setViewportSize(viewport);
        await signIn(page, f.credentials.manager);
        await page.goto(`/jobs/${jobId}`);
        const compact = page.getByTestId("job-recent-events");
        await assertRows(compact, events.rows.slice(-3));
        await expect(compact.locator(`time[datetime="${events.rows[0].occurredAt}"]`)).toHaveCount(0);
        await compact.scrollIntoViewIfNeeded();
        await attachJobsState(page, "audit-compact-latest-three");
        await selectTab(page, "Händelser");
        const full = page.getByTestId("job-event-history");
        await assertRows(full, events.rows);
        for (const event of events.rows) {
          await expect(full.getByTestId(`job-event-${event.id}`)).toBeVisible();
        }
        await full.scrollIntoViewIfNeeded();
        await attachJobsState(page, "audit-full-history");
      });
    });
    test(`[P1][E35-4-T-AC1,AC4,AC6,AC7] defensive persisted standalone job renders genuine empty AuditTrail at ${viewport.width}x${viewport.height}`, async ({resourcePage: page}) => {
      await withWorkspaceFixture(async f => {
        // Controlled defensive persisted state, NOT ordinary createJob behavior:
        // createJob atomically appends `created`. The schema permits a standalone
        // parent with both source refs NULL. Never delete/rewrite existing history.
        const jobId = crypto.randomUUID(), title = `Defensive empty history ${jobId}`;
        const tenantId = f.fx.base.tenantA.id;
        try {
        const [parent] = await adminQuery<{id: string; quote_acceptance_id: null; quote_version_id: null}>(
          `insert into public.jobs(id,tenant_id,customer_id,facility_id,contact_id,title,
            quote_acceptance_id,quote_version_id,planned_start_date,planned_end_date)
           values($1,$2,$3,$4,$5,$6,NULL,NULL,'2026-10-12','2026-10-12')
           returning id,quote_acceptance_id,quote_version_id`,
          [jobId, tenantId, f.identity.customerId, f.identity.facilityId, f.identity.contactId, title]);
        expect(parent).toEqual({id: jobId, quote_acceptance_id: null, quote_version_id: null});
        const before = await readWorkspaceEvents(f.fx.plannerClient, jobId);
        expect(before).toEqual({rows: [], error: null});
        const [{count}] = await adminQuery<{count: number}>(
          "select count(*)::int count from public.job_events where tenant_id=$1 and job_id=$2", [tenantId, jobId]);
        expect(count).toBe(0);
        await page.setViewportSize(viewport);
        await signIn(page, f.credentials.manager);
        await page.goto(`/jobs/${jobId}`);
        await identity(page, jobId, title);
        const compact = page.getByTestId("job-recent-events");
        await expect(compact.getByText("Inga händelser.", {exact: true})).toBeVisible();
        await expect(compact.getByRole("listitem")).toHaveCount(0);
        await expect(compact.getByRole("alert")).toHaveCount(0);
        await expect(compact.getByRole("button", {name: "Försök igen", exact: true})).toHaveCount(0);
        await compact.scrollIntoViewIfNeeded();
        await attachJobsState(page, "audit-empty-compact-defensive-persisted-parent", "controlled-persisted-state");
        await selectTab(page, "Händelser");
        const full = page.getByTestId("job-event-history");
        await expect(full.getByText("Inga händelser.", {exact: true})).toBeVisible();
        await expect(full.getByRole("listitem")).toHaveCount(0);
        await expect(full.getByRole("alert")).toHaveCount(0);
        await expect(full.getByRole("button", {name: "Försök igen", exact: true})).toHaveCount(0);
        await full.scrollIntoViewIfNeeded();
        await attachJobsState(page, "audit-empty-full-defensive-persisted-parent", "controlled-persisted-state");
        expect(await readWorkspaceEvents(f.fx.plannerClient, jobId)).toEqual(before);
        } finally {
          // Explicitly remove only our new empty parent, even after an assertion
          // fails. Existing fixture disposal still owns its whole tenant fixture.
          // No event INSERT, DELETE, UPDATE or enforcement change is performed.
          await adminQuery(`delete from public.jobs j where j.tenant_id=$1 and j.id=$2
            and j.quote_acceptance_id is null and j.quote_version_id is null
            and not exists(select 1 from public.job_events e where e.tenant_id=$1 and e.job_id=$2)`, [tenantId, jobId]);
          const [{count}] = await adminQuery<{count: number}>(
            "select count(*)::int count from public.jobs where tenant_id=$1 and id=$2", [tenantId, jobId]);
          expect(count).toBe(0);
        }
      });
    });
    test(`[P1][E35-4-T-AC1,AC4,AC6,AC7] real safe-events transport failure persists through retry then recovers unchanged history at ${viewport.width}x${viewport.height}`, async ({resourcePage: page}) => {
      await withWorkspaceFixture(async f => {
        const jobId = f.jobs.both.id, title = `Retry history ${jobId}`;
        const actorUserId = f.credentials.manager.id;
        await saveCard(f, jobId, {title});
        const before = await readWorkspaceEvents(f.fx.plannerClient, jobId);
        expect(before.error).toBeNull();
        expect(before.rows.length).toBeGreaterThan(0);
        await page.setViewportSize(viewport);
        await signIn(page, f.credentials.manager);
        try {
          await setJobEventsTransportFault(jobId, actorUserId, true);
          await page.goto(`/jobs/${jobId}`);
          await identity(page, jobId, title);
          const compact = page.getByTestId("job-recent-events");
          await expect(compact.getByRole("alert")).toHaveText("Händelserna kunde inte hämtas. Försök igen.");
          await expect(compact.getByText("Inga händelser.", {exact: true})).toHaveCount(0);
          await expect(compact.getByRole("listitem")).toHaveCount(0);
          await compact.scrollIntoViewIfNeeded();
          await attachJobsState(page, "audit-error-compact-armed", "controlled-transport");
          // Still armed across a full real page read; no stale client panel or
          // one-shot failure can satisfy the persistence/retry observations.
          await page.reload();
          await identity(page, jobId, title);
          await selectTab(page, "Händelser");
          const full = page.getByTestId("job-event-history");
          const retry = full.getByRole("button", {name: "Försök igen", exact: true});
          await expect(full.getByRole("alert")).toHaveText("Händelserna kunde inte hämtas. Försök igen.");
          await expect(retry).toBeEnabled();
          const bounds = await retry.boundingBox();
          expect(bounds?.height).toBeGreaterThanOrEqual(44);
          const refreshed = page.waitForResponse(reply => reply.request().method() === "GET"
            && reply.request().headers().rsc === "1" && new URL(reply.url()).pathname === `/jobs/${jobId}`);
          await retry.click();
          const failedRefresh = await refreshed;
          expect(failedRefresh.ok()).toBe(true);
          // Observe the actual refresh response; never supply/fabricate RSC.
          expect(await failedRefresh.text()).toContain("Händelserna kunde inte hämtas. Försök igen.");
          await expect(full.getByRole("alert")).toHaveText("Händelserna kunde inte hämtas. Försök igen.");
          await expect(full.getByText("Inga händelser.", {exact: true})).toHaveCount(0);
          await expect(full.getByRole("listitem")).toHaveCount(0);
          await identity(page, jobId, title);
          await full.scrollIntoViewIfNeeded();
          await attachJobsState(page, "audit-error-full-retry-still-armed", "controlled-transport");
          await setJobEventsTransportFault(jobId, actorUserId, false);
          await retry.click();
          await expect(full.getByRole("alert")).toHaveCount(0);
          await expect(full.getByRole("listitem")).toHaveCount(before.rows.length);
          for (const event of before.rows) {
            const row = full.getByTestId(`job-event-${event.id}`);
            await expect(row).toBeVisible();
            await expect(row.locator("time")).toHaveAttribute("datetime", event.occurredAt);
          }
          await identity(page, jobId, title);
          expect(await readWorkspaceEvents(f.fx.plannerClient, jobId)).toEqual(before);
          await full.scrollIntoViewIfNeeded();
          await attachJobsState(page, "audit-retry-recovered-same-real-history");
        } finally {
          await setJobEventsTransportFault(jobId, actorUserId, false);
        }
      });
    });
  }
});
