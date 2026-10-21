/**
 * Story 16.2 essential E2E RED contracts, approved -2 spec AC01–04/06–08.
 * All three skips require implemented checked commands/projections and a qualified
 * production Playwright runtime. Importing this file performs no DB/browser work.
 * Exhaustive role/RLS/race/ACL matrices belong to the companion integration tests;
 * existing 16.1 union, booking-facts and core-job journeys remain their own coverage.
 *
 * PROPOSED REPLACEABLE UI ADAPTER, NOT OBSERVED UI OR ADDITIONAL ACCEPTANCE:
 * job-members-panel; job-member-{profileId}; job-members-save-status/error;
 * job-members-refetch/retry; job-planned-dates-form; job-plan-dates-save-status/error;
 * job-plan-dates-refetch/retry; and the Swedish labels/buttons used below.
 * Existing login, menu, job-list-row, job-detail, job-edit-open, job-card-form and
 * job-economy-entitlement selectors come from current source/16.1 tests.
 * Bind proposed selectors and the actual action serialization before activation.
 * The action matcher assumes the existing Next Server Action POST /jobs/{jobId}
 * shape [input], with the thin job-members-atdd MemberInput. Inspect/reconcile the
 * real action; do not add an invented endpoint or stub successful persistence.
 *
 * playwright-utils deviation: config=true but the dependency is absent, so the
 * library two-gate mandate is inactive. Reuse resourcePage, real factory users,
 * current login and vanilla response observation. No missing utility import,
 * dependency, provider or fixture family is introduced. Optional framework setup
 * can install/wire the configured utilities in a separately authorized task.
 */
import { test, expect } from "../support/resource-cdp-attachment";
import type { Locator, Page, Request, Response, Route } from "@playwright/test";
import { createJobsDepthFixture, type JobsDepthFixture } from "../../support/jobs-depth-atdd";
import {
  memberCommand, memberInput, memberRows, memberSnapshot, profileFor, seedMember,
  type MemberInput,
} from "../../support/job-members-atdd";

type Credentials = { readonly email: string; readonly password: string };
type InputMatch = (input: MemberInput) => boolean;

// playwright-utils deviation: package absent; bounded observable hydration condition.
async function ready(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await expect.poll(() => locator.evaluate((element) =>
    Object.keys(element).some((key) => key.startsWith("__react"))), { timeout: 10_000 }).toBe(true);
}

// playwright-utils deviation: no installed auth-session provider; inspected login labels.
async function signIn(page: Page, credentials: Credentials): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await ready(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password);
  await submit.click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}

function actionInput(request: Request, jobId: string): MemberInput | null {
  if (request.method() !== "POST" || !request.headers()["next-action"]
    || new URL(request.url()).pathname !== `/jobs/${jobId}`) return null;
  try {
    const input = JSON.parse(request.postData() ?? "null")?.[0] as MemberInput | undefined;
    return input?.jobId === jobId && typeof input.commandId === "string" ? input : null;
  } catch { return null; }
}

function isAction(request: Request, jobId: string, match: InputMatch): boolean {
  const input = actionInput(request, jobId);
  return input !== null && match(input);
}

// playwright-utils deviation: observe the actual action before the user trigger.
async function saveAction(page: Page, jobId: string, button: Locator, match: InputMatch): Promise<Response> {
  const response = page.waitForResponse((reply) => isAction(reply.request(), jobId, match));
  await button.click();
  return response;
}

async function membersPanel(page: Page, jobId: string): Promise<Locator> {
  await page.goto(`/jobs/${jobId}`);
  const panel = page.getByTestId("job-members-panel");
  await ready(panel);
  return panel;
}

const samePerson = (id: string | null): InputMatch => (input) => input.personProfileId === id;
const datesMatch = (start: string, end: string): InputMatch => (input) =>
  input.planned_start_date === start && input.planned_end_date === end;
const currentLeads = (rows: Awaited<ReturnType<typeof memberRows>>) => rows.filter((row) =>
  row.archived_at === null && row.designation === "arbetsledare");

// Administrative reads only: complete fixture state proves child/role/audit effects.
const unchangedDateFields = (row: Record<string, unknown> | undefined) => Object.fromEntries(
  Object.entries(row ?? {}).filter(([key]) => !["planned_start_date", "planned_end_date", "updated_at"].includes(key)),
);

test.describe("Story 16.2 essential job-member journeys", () => {
  // RED: activate after real member/lead UI, checked commands and runtime are bound.
  test("[P0] 16.2-E01 manager archives/reactivates the same project member and selects/replaces/clears one order lead with stale refetch", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      const project = f.jobs.assigneeProject.id, order = f.jobs.memberOrder.id;
      const crewId = f.fx.coworkerProfile.id, leadId = f.fx.ownProfile.id;
      await seedMember(f, order, crewId); // arrangement only; tested writes use UI/normal JWT
      const baseline = await memberSnapshot(f);
      await signIn(page, f.credentials.manager);
      let panel = await membersPanel(page, project);
      await panel.getByRole("combobox", { name: "Lägg till person", exact: true }).selectOption(crewId);
      expect((await saveAction(page, project, panel.getByRole("button", { name: "Lägg till medlem", exact: true }), samePerson(crewId))).ok()).toBe(true);
      await expect(panel.getByTestId("job-members-save-status")).toHaveAttribute("role", "status");
      await expect(panel.getByTestId("job-members-save-status")).toBeVisible();
      const assigned = await memberRows(f, project);
      expect(assigned).toHaveLength(1);
      expect(assigned[0]).toMatchObject({ person_profile_id: crewId, designation: "member", archived_at: null });
      const relationshipId = assigned[0].id;
      expect((await memberSnapshot(f)).audit.length - baseline.audit.length).toBe(1);
      expect((await saveAction(page, project, panel.getByTestId(`job-member-${crewId}`)
        .getByRole("button", { name: "Ta bort medlem", exact: true }), samePerson(crewId))).ok()).toBe(true);
      await expect(panel.getByTestId(`job-member-${crewId}`)).toHaveCount(0);
      const removed = await memberRows(f, project);
      expect(removed).toHaveLength(1);
      expect(removed[0].id).toBe(relationshipId);
      expect(removed[0].archived_at).not.toBeNull();
      await panel.getByRole("combobox", { name: "Lägg till person", exact: true }).selectOption(crewId);
      expect((await saveAction(page, project, panel.getByRole("button", { name: "Lägg till medlem", exact: true }), samePerson(crewId))).ok()).toBe(true);
      await page.reload();
      await ready(panel);
      await expect(page.getByTestId(`job-member-${crewId}`)).toBeVisible();
      expect(await memberRows(f, project)).toEqual([expect.objectContaining({ id: relationshipId, archived_at: null })]);
      const afterCrew = await memberSnapshot(f);
      expect(afterCrew.audit.length - baseline.audit.length).toBe(3);
      expect(afterCrew.tenantMemberships).toEqual(baseline.tenantMemberships);
      expect(afterCrew.tenantRoles).toEqual(baseline.tenantRoles);
      expect(afterCrew.bookings).toEqual(baseline.bookings);
      expect(afterCrew.assignees).toEqual(baseline.assignees);

      panel = await membersPanel(page, order);
      let previousAuditCount = afterCrew.audit.length;
      for (const person of [leadId, crewId]) {
        await panel.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true }).selectOption(person);
        expect((await saveAction(page, order, panel.getByRole("button", { name: "Spara arbetsledare", exact: true }), samePerson(person))).ok()).toBe(true);
        await page.reload();
        await ready(panel);
        await expect(panel.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true })).toHaveValue(person);
        expect(currentLeads(await memberRows(f, order))).toEqual([expect.objectContaining({ person_profile_id: person })]);
        const selected = await memberSnapshot(f);
        expect(selected.audit.length - previousAuditCount).toBe(1);
        previousAuditCount = selected.audit.length;
      }
      const beforeClear = await memberRows(f, order);
      await panel.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true }).selectOption("");
      // A real independently authenticated command changes the lead while this picker is stale.
      expect((await memberCommand("lead", f.fx.adminClient,
        await memberInput(f.fx.adminClient, order, { personProfileId: leadId }))).ok).toBe(true);
      const concurrent = await memberSnapshot(f);
      await saveAction(page, order, panel.getByRole("button", { name: "Spara arbetsledare", exact: true }), samePerson(null));
      await expect(panel.getByTestId("job-members-error")).toHaveAttribute("role", "alert");
      await expect(panel.getByTestId("job-members-error")).toContainText(/ändrat|aktuella|inaktuell/i);
      await expect(panel.getByTestId("job-members-save-status")).toHaveCount(0);
      await expect(panel.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true })).toHaveValue("");
      expect(await memberSnapshot(f)).toEqual(concurrent);
      await panel.getByTestId("job-members-refetch").click();
      await expect(panel.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true })).toHaveValue("");
      await expect(panel.getByTestId("job-members-retry")).toBeEnabled();
      expect((await saveAction(page, order, panel.getByTestId("job-members-retry"), samePerson(null))).ok()).toBe(true);
      await page.reload();
      await expect(panel.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true })).toHaveValue("");
      const cleared = await memberRows(f, order), after = await memberSnapshot(f);
      expect(currentLeads(cleared)).toHaveLength(0);
      expect(cleared.map((row) => row.id).sort()).toEqual(beforeClear.map((row) => row.id).sort());
      expect(cleared).toHaveLength(2);
      expect(cleared.every((row) => row.archived_at === null && row.designation === "member")).toBe(true);
      expect(after.audit.length - concurrent.audit.length).toBe(1);
      expect(after.tenantMemberships).toEqual(baseline.tenantMemberships);
      expect(after.tenantRoles).toEqual(baseline.tenantRoles);
    } finally { await f.dispose(); }
  });

  // RED: bind dates-only UI/actual action, current-state retry and qualified runtime.
  test("[P0] 16.2-E02 phone lead manages ordinary crew/dates only; a lost real save response retries once, and stale dates require refetch",
    { annotation: [{ type: "skipNetworkMonitoring", description: "One identified real dates action is forwarded to persistence, then its response is deliberately lost" }] },
    async ({ resourcePage: page }) => {
      const f = await createJobsDepthFixture();
      try {
        const jobId = f.jobs.memberOrder.id, crewId = f.fx.coworkerProfile.id;
        await seedMember(f, jobId, f.fx.ownProfile.id, true);
        await page.setViewportSize({ width: 360, height: 640 });
        await signIn(page, f.credentials.assignedWorker);
        const panel = await membersPanel(page, jobId);
        await expect(panel.getByRole("combobox", { name: "Ansvarig arbetsledare", exact: true })).toHaveCount(0);
        await expect(panel.getByRole("button", { name: "Spara arbetsledare", exact: true })).toHaveCount(0);
        await expect(panel.getByTestId(`job-member-${f.fx.ownProfile.id}`).getByRole("button", { name: "Ta bort medlem", exact: true })).toHaveCount(0);
        await expect(page.getByTestId("job-edit-open")).toHaveCount(0);
        await expect(page.getByTestId("job-card-form")).toHaveCount(0);
        await expect(page.getByLabel("Status", { exact: true })).toHaveCount(0);
        await expect(page.getByLabel("Prioritet", { exact: true })).toHaveCount(0);
        const beforeCrew = await memberSnapshot(f);
        await panel.getByRole("combobox", { name: "Lägg till person", exact: true }).selectOption(crewId);
        expect((await saveAction(page, jobId, panel.getByRole("button", { name: "Lägg till medlem", exact: true }), samePerson(crewId))).ok()).toBe(true);
        await expect(panel.getByTestId(`job-member-${crewId}`)).toBeVisible();
        expect((await saveAction(page, jobId, panel.getByTestId(`job-member-${crewId}`).getByRole("button", { name: "Ta bort medlem", exact: true }), samePerson(crewId))).ok()).toBe(true);
        await expect(panel.getByTestId(`job-member-${crewId}`)).toHaveCount(0);
        expect((await memberSnapshot(f)).audit.length - beforeCrew.audit.length).toBe(2);

        const dates = page.getByTestId("job-planned-dates-form");
        await ready(dates);
        await dates.getByLabel("Planerat startdatum", { exact: true }).fill("2026-10-20");
        await dates.getByLabel("Planerat slutdatum", { exact: true }).fill("2026-10-21");
        const beforeDates = await memberSnapshot(f);
        const matches = datesMatch("2026-10-20", "2026-10-21");
        let consumed = false;
        // playwright-utils deviation: narrow one-shot response loss on the real action, never fake success.
        const loseOneResponse = async (route: Route) => {
          if (!consumed && isAction(route.request(), jobId, matches)) {
            consumed = true;
            const upstream = await route.fetch();
            expect(upstream.ok()).toBe(true);
            await route.abort("failed");
          } else await route.continue();
        };
        await page.route("**/*", loseOneResponse);
        const failed = page.waitForEvent("requestfailed", { predicate: (request) => isAction(request, jobId, matches) });
        await dates.getByRole("button", { name: "Spara datum", exact: true }).click();
        const failedRequest = await failed;
        expect(consumed).toBe(true);
        await expect(dates.getByTestId("job-plan-dates-error")).toHaveAttribute("role", "alert");
        await expect(dates.getByTestId("job-plan-dates-save-status")).toHaveCount(0);
        await expect(dates.getByLabel("Planerat startdatum", { exact: true })).toHaveValue("2026-10-20");
        await expect(dates.getByLabel("Planerat slutdatum", { exact: true })).toHaveValue("2026-10-21");
        const committed = await memberSnapshot(f);
        expect(committed.jobs.find((row) => row.id === jobId)).toMatchObject({ planned_start_date: "2026-10-20", planned_end_date: "2026-10-21" });
        expect(committed.audit.length - beforeDates.audit.length).toBe(1);
        await page.unroute("**/*", loseOneResponse);
        const retry = dates.getByTestId("job-plan-dates-retry");
        await retry.scrollIntoViewIfNeeded();
        await expect(retry).toBeInViewport();
        await expect(retry).toBeEnabled();
        const reply = await saveAction(page, jobId, retry, matches);
        expect(reply.ok()).toBe(true);
        expect(actionInput(reply.request(), jobId)).toEqual(actionInput(failedRequest, jobId));
        await expect(dates.getByTestId("job-plan-dates-save-status")).toHaveAttribute("role", "status");
        await expect(dates.getByTestId("job-plan-dates-save-status")).toBeVisible();
        expect(await memberSnapshot(f)).toEqual(committed); // one mutation/audit despite uncertain retry
        expect(unchangedDateFields(committed.jobs.find((row) => row.id === jobId)))
          .toEqual(unchangedDateFields(beforeDates.jobs.find((row) => row.id === jobId)));
        for (const key of ["members", "roles", "windows", "dependencies", "bookings", "assignees", "conflicts", "tenantMemberships", "tenantRoles"] as const)
          expect(committed[key]).toEqual(beforeDates[key]);
        await page.reload();
        await ready(dates);
        await expect(dates.getByLabel("Planerat startdatum", { exact: true })).toHaveValue("2026-10-20");
        await expect(dates.getByLabel("Planerat slutdatum", { exact: true })).toHaveValue("2026-10-21");

        await dates.getByLabel("Planerat slutdatum", { exact: true }).fill("2026-10-23");
        expect((await memberCommand("dates", f.fx.adminClient, await memberInput(f.fx.adminClient, jobId,
          { planned_start_date: "2026-10-20", planned_end_date: "2026-10-22" }))).ok).toBe(true);
        const current = await memberSnapshot(f);
        await saveAction(page, jobId, dates.getByRole("button", { name: "Spara datum", exact: true }), datesMatch("2026-10-20", "2026-10-23"));
        await expect(dates.getByTestId("job-plan-dates-error")).toContainText(/ändrat|aktuella|inaktuell/i);
        await expect(dates.getByLabel("Planerat slutdatum", { exact: true })).toHaveValue("2026-10-23");
        await expect(dates.getByTestId("job-plan-dates-save-status")).toHaveCount(0);
        expect(await memberSnapshot(f)).toEqual(current);
        await dates.getByTestId("job-plan-dates-refetch").click();
        await expect(dates.getByLabel("Planerat slutdatum", { exact: true })).toHaveValue("2026-10-23");
        await expect(dates.getByTestId("job-plan-dates-retry")).toBeEnabled();
        expect((await saveAction(page, jobId, dates.getByTestId("job-plan-dates-retry"), datesMatch("2026-10-20", "2026-10-23"))).ok()).toBe(true);
        await expect(dates.getByTestId("job-plan-dates-save-status")).toBeVisible();
        const final = await memberSnapshot(f);
        expect(final.audit.length - current.audit.length).toBe(1);
        expect(final.jobs.find((row) => row.id === jobId)).toMatchObject({ planned_start_date: "2026-10-20", planned_end_date: "2026-10-23" });
        await page.reload();
        await expect(dates.getByLabel("Planerat slutdatum", { exact: true })).toHaveValue("2026-10-23");
        const denied = await page.goto(`/jobs/${f.jobs.unrelated.id}`);
        expect(denied?.status()).toBe(404);
        await expect(page.getByTestId("job-detail")).toHaveCount(0);
      } finally { await f.dispose(); }
    });

  // RED: activate after trusted relational Sales-role navigation/read admission lands.
  test("[P0] 16.2-E03 designated Sales user reaches own My Jobs/detail without money or unrelated reads, then loses access when removed", async ({ resourcePage: page }) => {
    const f: JobsDepthFixture = await createJobsDepthFixture();
    try {
      const sales = f.fx.users.saljare, profile = await profileFor(f, sales);
      const own = f.jobs.acceptedAssigned;
      await seedMember(f, own.id, profile.id, true);
      const before = await memberSnapshot(f);
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, sales);
      const menu = page.getByRole("button", { name: "Öppna meny", exact: true });
      await ready(menu);
      await menu.click();
      await page.getByRole("dialog", { name: "Huvudmeny", exact: true })
        .getByRole("navigation", { name: "Huvudnavigation", exact: true })
        .getByRole("link", { name: "Jobb/Order", exact: true }).click();
      await expect(page).toHaveURL(/\/jobs$/);
      await expect(page.getByRole("heading", { name: "Mina jobb", exact: true })).toBeVisible();
      const rows = page.getByTestId("job-list-row");
      await expect(rows).toHaveCount(1);
      await expect(rows.getByRole("link")).toHaveAttribute("href", `/jobs/${own.id}`);
      const ownResponse = await page.goto(`/jobs/${own.id}`);
      expect(ownResponse?.ok()).toBe(true);
      await expect(page.getByTestId("job-detail")).toBeVisible();
      await expect(page.getByTestId("job-members-panel")).toBeVisible();
      await expect(page.getByTestId("job-planned-dates-form")).toBeVisible();
      await expect(page.getByTestId("job-accepted-price")).toHaveCount(0);
      await expect(page.getByTestId("job-source-sent-total")).toHaveCount(0);
      await expect(page.getByTestId("job-edit-open")).toHaveCount(0);
      await expect(page.getByTestId("job-card-form")).toHaveCount(0);
      await expect(page.getByTestId("job-economy-entitlement")).toContainText(/inte tillgängliga|saknar behörighet/i);
      // SSR/RSC wire omission rejects hidden, null or zero money placeholders.
      const payload = await ownResponse!.text();
      expect(payload).not.toMatch(/acceptedPriceOre|sourceSentTotalOre|accepted_price_ore|source_sent_total_ore|costRateOre|sellRateOre|cost_rate_ore|sell_rate_ore/);
      for (const job of [f.jobs.unrelated, f.jobs.foreign]) {
        const denied = await page.goto(`/jobs/${job.id}`);
        expect(denied?.status()).toBe(404);
        await expect(page.getByTestId("job-detail")).toHaveCount(0);
        await expect(page.getByText(job.title, { exact: true })).toHaveCount(0);
      }
      // Manager's real normal-JWT removal clears designation and membership atomically.
      expect((await memberCommand("remove", f.fx.adminClient,
        await memberInput(f.fx.adminClient, own.id, { personProfileId: profile.id }))).ok).toBe(true);
      const revoked = await memberSnapshot(f);
      expect(revoked.audit.length - before.audit.length).toBe(1);
      expect(revoked.tenantMemberships).toEqual(before.tenantMemberships);
      expect(revoked.tenantRoles).toEqual(before.tenantRoles);
      expect(currentLeads(await memberRows(f, own.id))).toHaveLength(0);
      const removed = (await memberRows(f, own.id)).find((row) => row.person_profile_id === profile.id);
      expect(removed).toBeDefined();
      expect(removed!.archived_at).not.toBeNull();
      const denied = await page.goto(`/jobs/${own.id}`); // same authenticated browser; no token refresh
      expect(denied?.status()).toBe(404);
      await expect(page.getByTestId("job-detail")).toHaveCount(0);
      await expect(page.getByText(own.title, { exact: true })).toHaveCount(0);
      await page.goto("/jobs");
      await expect(page.getByTestId("job-list-row").getByRole("link", { name: new RegExp(own.title) })).toHaveCount(0);
      expect(await memberSnapshot(f)).toEqual(revoked);
    } finally { await f.dispose(); }
  });

  test("[P0] 16.2-E04 deliberate stale assignment retry uses the currently visible eligible person", async ({resourcePage: page}) => {
    const f = await createJobsDepthFixture();
    try {
      const job = f.jobs.assigneeProject.id, personA = f.fx.ownProfile.id, personB = f.fx.coworkerProfile.id;
      await signIn(page, f.credentials.manager);
      const panel = await membersPanel(page, job);
      await panel.getByRole("combobox", {name: "Lägg till person", exact: true}).selectOption(personA);
      expect((await memberCommand("dates", f.fx.adminClient, await memberInput(f.fx.adminClient, job,
        {planned_start_date: "2026-10-20", planned_end_date: "2026-10-21"}))).ok).toBe(true);
      await saveAction(page, job, panel.getByRole("button", {name: "Lägg till medlem", exact: true}), samePerson(personA));
      await expect(panel.getByTestId("job-members-error")).toBeVisible();
      await panel.getByTestId("job-members-refetch").click();
      await expect(panel.getByTestId("job-members-retry")).toBeEnabled();
      await panel.getByRole("combobox", {name: "Lägg till person", exact: true}).selectOption(personB);
      const before = await memberSnapshot(f);
      await saveAction(page, job, panel.getByTestId("job-members-retry"), samePerson(personB));
      await expect(panel.getByTestId(`job-member-${personB}`)).toBeVisible();
      await expect(panel.getByTestId(`job-member-${personA}`)).toHaveCount(0);
      const after = await memberSnapshot(f);
      expect(after.audit.length - before.audit.length).toBe(1);
      expect((await memberRows(f, job)).map((r) => r.person_profile_id)).toEqual([personB]);
    } finally {await f.dispose();}
  });

  test("[P0] 16.2-E05 cross-lane refetch synchronizes pristine lead and cannot silently authorize a dirty lead", async ({resourcePage: page}) => {
    const f = await createJobsDepthFixture();
    try {
      const job = f.jobs.memberOrder.id, leadA = f.fx.ownProfile.id, leadB = f.fx.coworkerProfile.id, leadC = f.fx.adminProfile.id;
      await seedMember(f, job, leadA, true);
      await seedMember(f, job, leadB);
      await seedMember(f, job, leadC);
      await signIn(page, f.credentials.manager);
      const panel = await membersPanel(page, job), dates = panel.getByTestId("job-planned-dates-form");
      const picker = panel.getByRole("combobox", {name: "Ansvarig arbetsledare", exact: true});
      await expect(picker).toHaveValue(leadA);
      await dates.getByLabel("Planerat startdatum", {exact: true}).fill("2026-10-20");
      await dates.getByLabel("Planerat slutdatum", {exact: true}).fill("2026-10-21");
      expect((await memberCommand("lead", f.fx.adminClient, await memberInput(f.fx.adminClient, job, {personProfileId: leadB}))).ok).toBe(true);
      await saveAction(page, job, dates.getByRole("button", {name: "Spara datum", exact: true}), datesMatch("2026-10-20", "2026-10-21"));
      await expect(dates.getByTestId("job-plan-dates-error")).toBeVisible();
      await dates.getByTestId("job-plan-dates-refetch").click();
      await expect(dates.getByTestId("job-plan-dates-retry")).toBeEnabled();
      await expect(picker).toHaveValue(leadB);
      await picker.selectOption(leadC);
      await saveAction(page, job, dates.getByTestId("job-plan-dates-retry"), datesMatch("2026-10-20", "2026-10-21"));
      await expect(dates.getByTestId("job-plan-dates-save-status")).toBeVisible();
      await expect(picker).toHaveValue(leadC);
      const before = await memberSnapshot(f);
      await saveAction(page, job, panel.getByRole("button", {name: "Spara arbetsledare", exact: true}), samePerson(leadC));
      await expect(panel.getByTestId("job-members-error")).toBeVisible();
      expect(await memberSnapshot(f)).toEqual(before);
      expect(currentLeads(await memberRows(f, job))).toEqual([expect.objectContaining({person_profile_id: leadB})]);
      await panel.getByTestId("job-members-refetch").click();
      await expect(panel.getByTestId("job-members-retry")).toBeEnabled();
      await expect(picker).toHaveValue(leadC);
      await saveAction(page, job, panel.getByTestId("job-members-retry"), samePerson(leadC));
      await expect(panel.getByTestId("job-members-save-status")).toBeVisible();
      expect(currentLeads(await memberRows(f, job))).toEqual([expect.objectContaining({person_profile_id: leadC})]);
    } finally {await f.dispose();}
  });

});
