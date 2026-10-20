/**
 * Story 16.3 essential browser RED contracts (approved -2 spec AC01–07).
 * Exactly three skips; no database or browser work on import. Activate only after
 * checked commands, real projections/shared files and a qualified production
 * Playwright runtime exist. The integration suites own both-kind/role/ACL/graph/
 * revocation/replay/rollback matrices; these journeys prove the usable flow.
 *
 * PROPOSED REPLACEABLE ADAPTER, NOT OBSERVED UI OR EXTRA ACCEPTANCE:
 * job-work-orders-panel, work-order-pane, work-order-{id}, work-order-error,
 * work-order-save-status, work-order-refetch/retry, work-order-dependency-warning;
 * the Swedish work-order labels/buttons below; ?workOrder={id}; and prerequisite
 * option values `${jobId}:${workOrderId}`. Bind these to the implemented accessible
 * UI before activation. Existing login/shared EntityFilePanel labels are inspected
 * source contracts. Actions below assume Next Server Action POST /jobs/{jobId},
 * next-action header, JSON [WorkOrderInput]. Reconcile the actual serialization;
 * never create a test-only endpoint or permanently mock successful persistence.
 *
 * playwright-utils deviation: flag=true/package absent, so its two-gate mandate
 * is inactive. Reuse resourcePage, current login and normal-JWT fixture helpers;
 * vanilla observation/one-shot response loss is documented below. Installing and
 * wiring utilities belongs to a separately authorized framework task.
 */
import { test, expect } from "../support/resource-cdp-attachment";
import type { Locator, Page, Request, Response, Route } from "@playwright/test";
import { createJobsDepthFixture } from "../../support/jobs-depth-atdd";
import { memberCommand, memberInput, seedMember } from "../../support/job-members-atdd";
import {
  createWorkOrder, readWorkOrders, workOrderCommand, workOrderInput, workOrdersSnapshot,
  type WorkOrderInput,
} from "../../support/work-orders-atdd";

type Credentials = { readonly email: string; readonly password: string };
type Match = (input: WorkOrderInput) => boolean;

// playwright-utils deviation: existing bounded observable hydration condition.
async function ready(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await expect.poll(() => locator.evaluate((element) =>
    Object.keys(element).some((key) => key.startsWith("__react"))), { timeout: 10_000 }).toBe(true);
}

// playwright-utils deviation: package/auth-session provider absent; current login labels.
async function signIn(page: Page, credentials: Credentials): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await ready(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password);
  await submit.click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

function actionInput(request: Request, jobId: string): WorkOrderInput | null {
  if (request.method() !== "POST" || !request.headers()["next-action"]
    || new URL(request.url()).pathname !== `/jobs/${jobId}`) return null;
  try {
    const input = JSON.parse(request.postData() ?? "null")?.[0] as WorkOrderInput | undefined;
    return input?.jobId === jobId && typeof input.commandId === "string" ? input : null;
  } catch { return null; }
}
function matchesAction(request: Request, jobId: string, match: Match): boolean {
  const input = actionInput(request, jobId);
  return input !== null && match(input);
}

// playwright-utils deviation: package absent; listener precedes the exact user trigger.
async function save(page: Page, jobId: string, button: Locator, match: Match): Promise<Response> {
  const reply = page.waitForResponse((response) => matchesAction(response.request(), jobId, match));
  await button.click();
  return reply;
}
async function pane(page: Page, jobId: string, workOrderId: string): Promise<Locator> {
  await page.goto(`/jobs/${jobId}?workOrder=${workOrderId}`);
  const detail = page.getByTestId("work-order-pane");
  await ready(detail);
  return detail;
}
const titleIs = (title: string): Match => (input) => input.title === title;
const statusIs = (status: string): Match => (input) => input.status === status;

test.describe("Story 16.3 essential work-order journeys", () => {
  test.skip("[P0] 16.3-E01 manager creates and edits own dates/plural assignees, reloads and opens an own shared file", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      const jobId = f.jobs.assigneeProject.id;
      const people = [f.fx.ownProfile.id, f.fx.coworkerProfile.id];
      for (const person of people) await seedMember(f, jobId, person);
      await signIn(page, f.credentials.manager); // PL independently holds Files.View/Create.
      await page.goto(`/jobs/${jobId}`);
      const panel = page.getByTestId("job-work-orders-panel");
      await ready(panel);
      await panel.getByRole("button", { name: "Ny arbetsorder", exact: true }).click();
      const detail = page.getByTestId("work-order-pane");
      const title = detail.getByLabel("Rubrik", { exact: true });
      await title.focus();
      await expect(title).toBeFocused();
      await title.fill("Montera central");
      await detail.getByLabel("Beskrivning", { exact: true }).fill("Märk och kontrollera kretsarna");
      await detail.getByLabel("Planerat startdatum", { exact: true }).fill("2026-10-20");
      await detail.getByLabel("Planerat slutdatum", { exact: true }).fill("2026-10-21");
      const beforeCreate = await workOrdersSnapshot(f);
      expect((await save(page, jobId, detail.getByRole("button", { name: "Skapa arbetsorder", exact: true }), titleIs("Montera central"))).ok()).toBe(true);
      await expect(detail.getByTestId("work-order-save-status")).toHaveAttribute("role", "status");
      const created = (await readWorkOrders(f.fx.plannerClient, jobId)).rows;
      expect(created).toHaveLength(1);
      const id = created[0].id;
      expect(created[0]).toMatchObject({ jobId, title: "Montera central", status: "created",
        description: "Märk och kontrollera kretsarna", plannedStartDate: "2026-10-20", plannedEndDate: "2026-10-21" });
      const afterCreate = await workOrdersSnapshot(f);
      expect(afterCreate.audit.length - beforeCreate.audit.length).toBe(1);
      expect(afterCreate.audit.filter((event) => !beforeCreate.audit.some((old) => old.id === event.id)))
        .toEqual([expect.objectContaining({ tenant_id: f.fx.base.tenantA.id, actor_user_id: f.fx.users.projektledare.id })]);
      expect(afterCreate.jobs).toEqual(beforeCreate.jobs); // Own dates do not mutate parent/provenance.

      await detail.getByRole("listbox", { name: "Tilldelade personer", exact: true }).selectOption(people);
      expect((await save(page, jobId, detail.getByRole("button", { name: "Spara tilldelning", exact: true }),
        (input) => input.workOrderId === id && JSON.stringify(input.personProfileIds?.slice().sort()) === JSON.stringify(people.slice().sort()))).ok()).toBe(true);
      expect((await workOrdersSnapshot(f)).audit.length - afterCreate.audit.length).toBe(1);
      await title.fill("Montera och prova central");
      await detail.getByLabel("Planerat slutdatum", { exact: true }).fill("");
      const beforeEdit = await workOrdersSnapshot(f);
      expect((await save(page, jobId, detail.getByRole("button", { name: "Spara arbetsorder", exact: true }),
        (input) => input.workOrderId === id && input.title === "Montera och prova central" && input.planned_end_date === null)).ok()).toBe(true);
      const afterEdit = await workOrdersSnapshot(f);
      expect(afterEdit.audit.length - beforeEdit.audit.length).toBe(1);
      expect(afterEdit.jobs).toEqual(beforeCreate.jobs);
      await page.reload();
      await expect(panel.getByTestId(`work-order-${id}`)).toContainText("Montera och prova central");
      await expect(title).toHaveValue("Montera och prova central");
      await expect(detail.getByLabel("Planerat slutdatum", { exact: true })).toHaveValue("");
      const persisted = (await readWorkOrders(f.fx.plannerClient, jobId)).rows.find((row) => row.id === id)!;
      expect(persisted.plannedEndDate).toBeNull();
      expect(persisted.assignees.map((person) => person.id).sort()).toEqual(people.slice().sort());

      // Existing shared panel, scoped by child pane; real upload/sign/open, no new file fixture family.
      const files = detail.getByRole("region", { name: "Filer", exact: true });
      const name = `16-3-${crypto.randomUUID()}.txt`, body = "Work order shared file — exact private bytes";
      await files.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({
        name, mimeType: "text/plain", buffer: Buffer.from(body),
      });
      await files.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
      await expect(files.getByRole("status")).toContainText("Filen laddades upp");
      await page.reload();
      const fileRow = files.getByRole("listitem").filter({ hasText: name });
      await expect(fileRow).toHaveCount(1);
      await fileRow.getByRole("button", { name: "Öppna fil", exact: true }).click();
      const link = fileRow.getByRole("link", { name: "Öppna fil (tidsbegränsad länk)", exact: true });
      await expect(link).toHaveAttribute("rel", /noopener/);
      const opened = page.waitForEvent("popup");
      await link.click();
      const popup = await opened;
      try { await expect(popup.getByText(body, { exact: true })).toBeVisible(); }
      finally { await popup.close(); }
    } finally { await f.dispose(); }
  });

  test.skip("[P1] 16.3-E02 phone lead progresses status; lost-response/stale retries retain newer draft and cannot reopen",
    { annotation: [{ type: "skipNetworkMonitoring", description: "One specifically matched real work-order update commits upstream before its response is deliberately lost" }] },
    async ({ resourcePage: page }) => {
      const f = await createJobsDepthFixture();
      try {
        const jobId = f.jobs.memberOrder.id;
        await seedMember(f, jobId, f.fx.ownProfile.id, true);
        const id = await createWorkOrder(f.fx.adminClient, jobId, { title: "Lead task" });
        await page.setViewportSize({ width: 360, height: 640 });
        await signIn(page, f.credentials.assignedWorker);
        const detail = await pane(page, jobId, id);
        const status = detail.getByRole("combobox", { name: "Arbetsorderstatus", exact: true });
        const beforeProgress = await workOrdersSnapshot(f);
        await status.selectOption("in_progress");
        expect((await save(page, jobId, detail.getByRole("button", { name: "Spara status", exact: true }), statusIs("in_progress"))).ok()).toBe(true);
        const progressed = await workOrdersSnapshot(f);
        expect(progressed.audit.length - beforeProgress.audit.length).toBe(1);
        expect(progressed.workOrders.find((row) => row.id === id)?.status).toBe("in_progress");
        await expect(page.getByTestId("job-edit-open")).toHaveCount(0);
        await expect(detail.getByRole("region", { name: "Filer", exact: true })).toHaveCount(0);

        const title = detail.getByLabel("Rubrik", { exact: true });
        await title.fill("Committed before lost response");
        const match: Match = (input) => input.workOrderId === id && input.title === "Committed before lost response";
        let consumed = false;
        let release!: () => void, committedSignal!: () => void;
        const held = new Promise<void>((resolve) => { release = resolve; });
        const committed = new Promise<void>((resolve) => { committedSignal = resolve; });
        // playwright-utils deviation: one-shot exact predicate, forwarding the real action; never fake success.
        const loseResponse = async (route: Route) => {
          if (!consumed && matchesAction(route.request(), jobId, match)) {
            consumed = true;
            const upstream = await route.fetch();
            expect(upstream.ok()).toBe(true);
            committedSignal();
            await held;
            await route.abort("failed");
          } else await route.continue();
        };
        await page.route("**/*", loseResponse);
        const failed = page.waitForEvent("requestfailed", { predicate: (request) => matchesAction(request, jobId, match) });
        try {
          await detail.getByRole("button", { name: "Spara arbetsorder", exact: true }).click();
          await committed;
          const durable = await workOrdersSnapshot(f);
          expect(durable.audit.length - progressed.audit.length).toBe(1);
          expect(durable.workOrders.find((row) => row.id === id)?.title).toBe("Committed before lost response");
          await expect(title).toBeEnabled();
          await title.fill("Newer unsent visible input");
          release();
          const failedRequest = await failed;
          await expect(detail.getByTestId("work-order-error")).toHaveAttribute("role", "alert");
          await expect(detail.getByTestId("work-order-save-status")).toHaveCount(0);
          const retry = detail.getByTestId("work-order-retry");
          await retry.scrollIntoViewIfNeeded();
          await expect(retry).toBeInViewport();
          const replay = await save(page, jobId, retry, match);
          expect(replay.ok()).toBe(true);
          expect(actionInput(replay.request(), jobId)).toEqual(actionInput(failedRequest, jobId));
          expect(await workOrdersSnapshot(f)).toEqual(durable); // Replayed outcome, no second audit.
          await expect(title).toHaveValue("Newer unsent visible input");
        } finally { release(); await page.unroute("**/*", loseResponse); }

        // A current independent manager makes the next visible draft's consent stale.
        expect((await workOrderCommand("update", f.fx.adminClient, await workOrderInput(f.fx.adminClient, jobId,
          { workOrderId: id, title: "Concurrent manager edit" }))).ok).toBe(true);
        const concurrent = await workOrdersSnapshot(f);
        await save(page, jobId, detail.getByRole("button", { name: "Spara arbetsorder", exact: true }), titleIs("Newer unsent visible input"));
        await expect(detail.getByTestId("work-order-error")).toContainText(/ändrat|aktuella|inaktuell/i);
        await expect(title).toHaveValue("Newer unsent visible input");
        await expect(detail.getByTestId("work-order-save-status")).toHaveCount(0);
        expect(await workOrdersSnapshot(f)).toEqual(concurrent);
        await detail.getByTestId("work-order-refetch").click();
        await expect(title).toHaveValue("Newer unsent visible input");
        expect((await save(page, jobId, detail.getByTestId("work-order-retry"), titleIs("Newer unsent visible input"))).ok()).toBe(true);
        await expect(detail.getByTestId("work-order-save-status")).toBeVisible();
        const saved = await workOrdersSnapshot(f);
        expect(saved.audit.length - concurrent.audit.length).toBe(1);
        expect(saved.workOrders.find((row) => row.id === id)?.title).toBe("Newer unsent visible input");
        await page.reload();
        await expect(title).toHaveValue("Newer unsent visible input");
        await status.selectOption("done");
        expect((await save(page, jobId, detail.getByRole("button", { name: "Spara status", exact: true }), statusIs("done"))).ok()).toBe(true);
        await page.reload();
        await expect(detail.getByRole("button", { name: "Återöppna arbetsorder", exact: true })).toHaveCount(0);
        const done = await workOrdersSnapshot(f);
        expect(done.workOrders.find((row) => row.id === id)?.status).toBe("done");
        expect((await workOrderCommand("status", f.fx.montorClient, await workOrderInput(f.fx.montorClient, jobId,
          { workOrderId: id, status: "in_progress" }))).ok).toBe(false);
        expect(await workOrdersSnapshot(f)).toEqual(done);
        expect(done.jobs).toEqual(beforeProgress.jobs); // Child completion never completes the parent.
      } finally { await f.dispose(); }
    });

  test.skip("[P0] 16.3-E03 distinct same-parent work orders warn from their own dates, clear at equality and show unknown; scoped reads/writes remain bounded", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      const jobId = f.jobs.memberOrder.id;
      await seedMember(f, jobId, f.fx.ownProfile.id, true);
      // Deliberately contradictory parent timing: a parent-date proxy would report clear.
      expect((await memberCommand("dates", f.fx.adminClient, await memberInput(f.fx.adminClient, jobId,
        { planned_start_date: "2026-10-30", planned_end_date: "2026-10-30" }))).ok).toBe(true);
      const prerequisite = await createWorkOrder(f.fx.adminClient, jobId,
        { title: "Prerequisite own endpoint", planned_start_date: "2026-10-19", planned_end_date: "2026-10-21" });
      const dependent = await createWorkOrder(f.fx.adminClient, jobId,
        { title: "Dependent own endpoint", planned_start_date: "2026-10-20", planned_end_date: "2026-10-22" });
      await signIn(page, f.credentials.assignedWorker);
      const detail = await pane(page, jobId, dependent);
      await detail.getByRole("combobox", { name: "Förutsättning", exact: true }).selectOption(`${jobId}:${prerequisite}`);
      const beforeEdge = await workOrdersSnapshot(f);
      expect((await save(page, jobId, detail.getByRole("button", { name: "Spara beroenden", exact: true }),
        (input) => input.workOrderId === dependent && input.prerequisites?.some((edge) => edge.jobId === jobId && edge.workOrderId === prerequisite) === true)).ok()).toBe(true);
      await page.reload();
      const warning = detail.getByTestId("work-order-dependency-warning");
      await expect(warning).toContainText(/försen|risk/i);
      const withEdge = await workOrdersSnapshot(f);
      expect(withEdge.audit.length - beforeEdge.audit.length).toBe(1);
      expect(withEdge.workOrderDependencies).toHaveLength(1);
      expect((await readWorkOrders(f.fx.montorClient, jobId)).dependencyWarnings).toContainEqual(expect.objectContaining({
        state: "delay", dependent: { jobId, workOrderId: dependent }, prerequisite: { jobId, workOrderId: prerequisite },
        prerequisiteEndDate: "2026-10-21", dependentStartDate: "2026-10-20",
      }));

      const prerequisitePane = await pane(page, jobId, prerequisite);
      await prerequisitePane.getByLabel("Planerat slutdatum", { exact: true }).fill("2026-10-20");
      expect((await save(page, jobId, prerequisitePane.getByRole("button", { name: "Spara arbetsorder", exact: true }),
        (input) => input.workOrderId === prerequisite && input.planned_end_date === "2026-10-20")).ok()).toBe(true);
      await pane(page, jobId, dependent);
      await expect(warning).toHaveCount(0);
      expect((await readWorkOrders(f.fx.montorClient, jobId)).dependencyWarnings).toContainEqual(expect.objectContaining({ state: "clear" }));
      expect((await workOrdersSnapshot(f)).jobs).toEqual(beforeEdge.jobs);

      // Missing actual endpoint stays unknown despite known parent dates; no fabricated date.
      expect((await workOrderCommand("update", f.fx.adminClient, await workOrderInput(f.fx.adminClient, jobId,
        { workOrderId: prerequisite, planned_end_date: null }))).ok).toBe(true);
      await page.reload();
      await expect(warning).toContainText(/okänd|saknas|kan inte bedömas/i);
      expect((await readWorkOrders(f.fx.montorClient, jobId)).dependencyWarnings).toContainEqual(expect.objectContaining({ state: "unknown" }));
      const unrelated = await page.goto(`/jobs/${f.jobs.unrelated.id}?workOrder=${dependent}`);
      expect(unrelated?.status()).toBe(404);
      await expect(page.getByTestId("job-detail")).toHaveCount(0);
      await expect(page.getByText("Dependent own endpoint", { exact: true })).toHaveCount(0);

      // Ordinary parent member + assignee still has no new write grant after designation clears.
      expect((await workOrderCommand("assignees", f.fx.adminClient, await workOrderInput(f.fx.adminClient, jobId,
        { workOrderId: dependent, personProfileIds: [f.fx.ownProfile.id] }))).ok).toBe(true);
      expect((await memberCommand("lead", f.fx.adminClient, await memberInput(f.fx.adminClient, jobId, { personProfileId: null }))).ok).toBe(true);
      const ordinary = await workOrdersSnapshot(f);
      await pane(page, jobId, dependent);
      await expect(detail.getByRole("button", { name: "Spara arbetsorder", exact: true })).toHaveCount(0);
      expect((await workOrderCommand("update", f.fx.montorClient, await workOrderInput(f.fx.montorClient, jobId,
        { workOrderId: dependent, title: "Denied ordinary member edit" }))).ok).toBe(false);
      expect(await workOrdersSnapshot(f)).toEqual(ordinary);
    } finally { await f.dispose(); }
  });
});
