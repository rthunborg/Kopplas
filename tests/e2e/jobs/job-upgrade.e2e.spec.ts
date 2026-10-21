/**
 * Story16.4 RED essential browser journeys. Approved spec SHA256:
 * a722320bc86a1e5e1b75f216b87d3a8a64eeb5f5170bbea930ef1dd45364ad13.
 * All cases stay skipped until implementation/fixture bindings are reconciled.
 * NEW/REPLACEABLE assumptions: job-upgrade-open/dialog/confirm/consent/retry/error/
 * save-status, job-downgrade, payment-plan-editor and job-project-only-fields IDs;
 * confirmation copy; Next action JSON [UpgradeInput] on /jobs/{id}. These describe
 * acceptance seams, not observed UI, endpoints or extra product requirements.
 * Existing full-card, member, WO, file and login bindings come from current code.
 * Preserve the actual action transport when reconciling; never stub persistence.
 *
 * playwright-utils deviations: flag=true/package absent (two-gate mandate inactive).
 * Reuse resourcePage/login/synthetic normal-JWT fixtures, test.step, bounded
 * expect.poll, waitForResponse and one exactly matched route.fetch/abort. No raw
 * request fixture, missing framework import, new service or fixture on collection.
 * Role/SQL-writer/replay/audit-fault matrices belong to integration tests.
 */
import { test, expect } from "../support/resource-cdp-attachment";
import type { Locator, Page, Request, Route } from "@playwright/test";
import { createJobsDepthFixture, type JobsDepthFixture } from "../../support/jobs-depth-atdd";
import { seedMember } from "../../support/job-members-atdd";
import { createWorkOrder, workOrderCommand, workOrderInput } from "../../support/work-orders-atdd";
import { jobSemanticsSnapshot, readJobSemantics, saveCard, type UpgradeInput } from "../../support/job-semantics-atdd";
import { bookingCommand, bookingInput } from "../../support/bookings-atdd";
import { adminInsertContact, adminInsertFacility } from "../../factories/tenants";
import { adminQuery } from "../../factories/admin-sql";
import { parseUtcInstant } from "../../../src/features/scheduling/time-zone";
import { validateJobCardInput } from "../../../src/features/jobs/job-card-domain";

type Credentials = { email: string; password: string };
// playwright-utils deviation: current fixture has no auth-session provider.
async function signIn(page: Page, credentials: Credentials) {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await ready(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password);
  await submit.click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}
// playwright-utils deviation: bounded observable hydration, no sleep.
async function ready(locator: Locator) {
  await locator.waitFor({ state: "visible" });
  await expect.poll(() => locator.evaluate(element =>
    Object.keys(element).some(key => key.startsWith("__react"))), { timeout: 10_000 }).toBe(true);
}
function upgradeRequest(request: Request, jobId: string): UpgradeInput | null {
  if (request.method() !== "POST" || !request.headers()["next-action"]
    || new URL(request.url()).pathname !== `/jobs/${jobId}`) return null;
  try {
    const args: unknown = JSON.parse(request.postData() ?? "null");
    if (!Array.isArray(args) || args.length !== 1 || !args[0] || typeof args[0] !== "object") return null;
    const input = args[0] as Record<string, unknown>;
    return input.jobId === jobId && typeof input.commandId === "string" && "expectedState" in input
      && Object.keys(input).every(key => ["jobId", "commandId", "expectedState"].includes(key))
      ? input as UpgradeInput : null;
  } catch { return null; }
}
async function dialog(page: Page, jobId: string) {
  await page.goto(`/jobs/${jobId}`);
  await ready(page.getByTestId("job-upgrade-open"));
  await page.getByTestId("job-upgrade-open").click();
  const pane = page.getByTestId("job-upgrade-dialog");
  await expect(pane).toBeVisible();
  return pane;
}
async function confirmTruth(pane: Locator) {
  await expect(pane).toContainText(/kan inte.*återställ|kan inte.*order|enkelriktad/i);
  await expect(pane).toContainText(/medlemmar.*arbetsorder|arbetsorder.*medlemmar/i);
  await expect(pane).toContainText(/betalningsplan.*inte tillgänglig|ekonomi.*separat/i);
  await expect(pane).not.toContainText(/låser upp.*arbetsorder|låser upp.*medlemmar/i);
  await pane.getByTestId("job-upgrade-consent").check();
}
async function editFullCard(page: Page, f: JobsDepthFixture, jobId: string, title: string,
  customerId: string, facilityId: string, contactId: string) {
  await page.goto(`/jobs/${jobId}`);
  const card = page.getByTestId("job-card-form");
  await ready(card);
  await card.getByRole("textbox", { name: "Titel", exact: true }).fill(title);
  await expect(card.getByRole("combobox", { name: "Kund", exact: true })).toHaveValue(customerId);
  await card.getByRole("combobox", { name: "Anläggning", exact: true }).selectOption(facilityId);
  await card.getByRole("combobox", { name: "Kontakt", exact: true }).selectOption(contactId);
  await card.getByTestId("job-card-planning-toggle").click();
  for (const [label, value] of [
    ["Uppskattad tid (minuter)", "120"], ["Planerad restid (minuter)", "30"], ["Antal personer", "2"],
    ["Tidigast", "2026-10-19"], ["Önskat datum", "2026-10-20"], ["Senast", "2026-10-21"],
    ["Planerad start", "2026-10-20"], ["Planerat slut", "2026-10-20"],
  ]) await card.getByLabel(label, { exact: true }).fill(value);
  await card.getByLabel("Prioritet", { exact: true }).selectOption("high");
  await card.getByLabel("Kundens närvaro", { exact: true }).selectOption("yes");
  await card.getByLabel("Ansvarig projektledare", { exact: true }).selectOption(f.fx.coworkerProfile.id);
  await card.getByLabel("Annan adress än anläggningen", { exact: true }).check();
  for (const [label, value] of [["Gatuadress", "Testgatan 16"], ["Postnummer", "12345"],
    ["Ort", "Teststad"], ["Landskod (två bokstäver)", "SE"]])
    await card.getByRole("textbox", { name: label, exact: true }).fill(value);
  await card.getByLabel("Kraven är kända", { exact: true }).check();
  await card.getByTestId(`job-required-role-${f.roleId}`).check();
  await card.getByLabel("Tillträdestiderna är kända", { exact: true }).check();
  // Arrangement guarantees exactly one existing window; edit it, never duplicate.
  const window = card.getByTestId("job-access-window-row");
  await expect(window).toHaveCount(1);
  await window.getByLabel("Från", { exact: true }).fill("2026-10-20T08:00");
  await window.getByLabel("Till", { exact: true }).fill("2026-10-20T16:00");
  await card.getByTestId(`job-dependency-${f.jobs.prerequisite.id}`).check();
  // playwright-utils deviation: actual card action observation precedes submission.
  const saved = page.waitForResponse(response => {
    const request = response.request();
    return request.method() === "POST" && !!request.headers()["next-action"]
      && new URL(request.url()).pathname === `/jobs/${jobId}`
      && (request.postData() ?? "").includes(title);
  });
  await card.getByTestId("job-card-save").click();
  const response = await saved;
  expect(response.ok()).toBe(true);
  // This plain-object action uses one JSON argument. Inspect only the exact
  // observed request locally; never persist/log its body or any field values.
  let args: unknown = null;
  try { args = JSON.parse(response.request().postData() ?? "null"); } catch { /* Safe structural assertion below. */ }
  const singleObject = Array.isArray(args) && args.length === 1 && args[0] !== null
    && typeof args[0] === "object" && !Array.isArray(args[0]);
  expect(singleObject, "Observed card action must contain one plain object argument").toBe(true);
  const submitted = (args as [Record<string, unknown>])[0];
  expect(submitted.id === jobId && submitted.title === title,
    "Validate only the exact intended job/title card action").toBe(true);
  // Pure reference values describe the existing test contract, never a request
  // replacement. Single-field probes cannot mutate or authorize the actual save.
  const reference = { expectedRevision:"a".repeat(64), commandId: "00000000-0000-4000-8000-000000000001", id: jobId, type: "order", title,
    customer_id: customerId, facility_id: facilityId, contact_id: contactId, priority: "high",
    estimated_duration_minutes: 120, planned_travel_minutes: 30, crew_size: 2,
    earliest_date: "2026-10-19", desired_date: "2026-10-20", latest_date: "2026-10-21",
    planned_start_date: "2026-10-20", planned_end_date: "2026-10-20", customer_presence_required: true,
    responsible_project_manager_id: f.fx.coworkerProfile.id,
    locationOverride: { street: "Testgatan 16", postalCode: "12345", city: "Teststad", countryCode: "SE" },
    requiredWorkRoleIds: [f.roleId], dependencyJobIds: [f.jobs.prerequisite.id],
    accessWindows: [{ startsAt: "2026-10-20T06:00:00Z", endsAt: "2026-10-20T14:00:00Z" }] };
  expect(validateJobCardInput(reference, "update").valid, "Pure card reference must satisfy the production validator").toBe(true);
  const validation = validateJobCardInput(submitted, "update");
  const fieldNames = Object.keys(submitted).sort();
  const unknownFields = fieldNames.filter(name => !Object.hasOwn(reference, name));
  const knownFields = Object.fromEntries(Object.entries(submitted).filter(([name]) => Object.hasOwn(reference, name)));
  const invalidFields = validation.valid ? [] : [...unknownFields, ...Object.keys(reference).filter(name =>
    validateJobCardInput({ ...knownFields, [name]: reference[name as keyof typeof reference] }, "update").valid)].sort();
  expect(validation.valid, JSON.stringify({ fieldNames, invalidFields, inputStageValid: validation.valid })).toBe(true);
  // A Next action may return HTTP 200 for a refused save. Require the actual
  // form outcome; report only its existing user-safe visible feedback on failure.
  const outcome = card.getByTestId("job-card-save-status").or(card.getByTestId("job-card-unsent"));
  await expect(outcome).toBeVisible();
  const outcomeMessage = await outcome.innerText();
  expect(await outcome.getAttribute("data-testid"), outcomeMessage).toBe("job-card-save-status");
  await expect(outcome).toHaveText("Jobbet är sparat.");
  await expect.poll(async () => (await readJobSemantics(f.fx.plannerClient, jobId)).card.title).toBe(title);
  await page.reload();
  const persisted = await readJobSemantics(f.fx.plannerClient, jobId);
  expect(persisted.card).toMatchObject({ title, customer_id: customerId, facility_id: facilityId,
    contact_id: contactId, priority: "high", estimated_duration_minutes: 120, planned_travel_minutes: 30,
    crew_size: 2, earliest_date: "2026-10-19", desired_date: "2026-10-20", latest_date: "2026-10-21",
    planned_start_date: "2026-10-20", planned_end_date: "2026-10-20",
    responsible_project_manager_id: f.fx.coworkerProfile.id, customer_presence_required: true,
    locationOverride: { street: "Testgatan 16", postalCode: "12345", city: "Teststad", countryCode: "SE" },
    requiredWorkRoleIds: [f.roleId], dependencyJobIds: [f.jobs.prerequisite.id] });
  expect(persisted.card.accessWindows).toHaveLength(1);
  expect(parseUtcInstant(persisted.card.accessWindows![0].startsAt)).toBe(parseUtcInstant("2026-10-20T06:00:00Z"));
  expect(parseUtcInstant(persisted.card.accessWindows![0].endsAt)).toBe(parseUtcInstant("2026-10-20T14:00:00Z"));
  await expect(page.getByTestId("job-operational-card")).toContainText("Testgatan 16");
  await expect(page.getByTestId("job-project-only-fields")).toHaveCount(0);
  await expect(page.getByTestId("payment-plan-editor")).toHaveCount(0);
  return persisted;
}

test.describe("Story16.4 same-row Projekt upgrade — RED", () => {
  test("[P0] 16.4-Upgrade-E01 manager uses full card on both kinds; same-ID upgrade preserves accepted source and every child", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      const jobId = f.jobs.acceptedAssigned.id;
      const raw = (await f.snapshot()).jobs.find(row => row.id === jobId)!;
      expect(raw.quote_acceptance_id).not.toBeNull();
      const customerId = String(raw.customer_id);
      const facilityId = await adminInsertFacility({ tenant_id: f.fx.base.tenantA.id, customer_id: customerId, name: "Accepted job site" });
      const contactId = await adminInsertContact({ tenant_id: f.fx.base.tenantA.id, customer_id: customerId, facility_id: facilityId, name: "Site contact" });
      await seedMember(f, jobId, f.fx.ownProfile.id, true);
      await seedMember(f, jobId, f.fx.coworkerProfile.id);
      await saveCard(f, jobId, { customer_id: customerId, facility_id: facilityId, contact_id: contactId,
        accessWindows: [{ startsAt: "2026-10-20T06:00:00Z", endsAt: "2026-10-20T14:00:00Z" }] });
      await adminQuery("update public.jobs set status='in_progress' where id=$1 and tenant_id=$2", [jobId, f.fx.base.tenantA.id]);
      const wo = await createWorkOrder(f.fx.plannerClient, jobId, { title: "Retained order child" });
      const prior = await createWorkOrder(f.fx.plannerClient, f.jobs.prerequisite.id, { title: "Prior work" });
      expect((await workOrderCommand("dependencies", f.fx.plannerClient, await workOrderInput(f.fx.plannerClient, jobId,
        { workOrderId: wo, prerequisites: [{ jobId: f.jobs.prerequisite.id, workOrderId: prior }] }))).ok).toBe(true);
      expect((await bookingCommand("create", f.fx.adminClient, bookingInput([f.fx.ownProfile.id],
        { jobId, startsAt: "2026-10-20T06:00:00Z", endsAt: "2026-10-20T07:00:00Z" }))).ok).toBe(true);
      await signIn(page, f.credentials.manager);
      await editFullCard(page, f, jobId, "Order card before upgrade", customerId, facilityId, contactId);
      await page.getByRole("tab", {name: "Filer", exact: true}).click();
      const files = page.getByRole("region", { name: "Filer", exact: true });
      const filename = `upgrade-${jobId}.txt`;
      await files.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({
        name: filename, mimeType: "text/plain", buffer: Buffer.from("Persistent same-owner file"),
      });
      await files.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
      await expect(files.getByRole("status")).toContainText("Filen laddades upp");
      const cardBefore = await readJobSemantics(f.fx.plannerClient, jobId);
      expect(cardBefore.leadPersonProfileId).toBe(f.fx.ownProfile.id);
      expect(cardBefore.dependencies).toContainEqual(expect.objectContaining({ dependentWorkOrderId: wo, prerequisiteWorkOrderId: prior }));
      const before = await jobSemanticsSnapshot(f);
      expect(before.bookings.some(row => row.job_id === jobId)).toBe(true);
      expect(before.fileLinks.some(row => row.owner_id === jobId)).toBe(true);
      const pane = await dialog(page, jobId);
      await confirmTruth(pane);
      const response = page.waitForResponse(reply => upgradeRequest(reply.request(), jobId) !== null);
      await pane.getByTestId("job-upgrade-confirm").click();
      expect((await response).ok()).toBe(true);
      await expect(page.getByTestId("job-upgrade-save-status")).toBeVisible();
      await page.reload();
      await expect(page).toHaveURL(new RegExp(`/jobs/${jobId}$`));
      await expect(page.getByTestId("job-operational-card")).toContainText("Projekt");
      await expect(page.getByTestId("job-status")).toContainText("Pågår");
      await expect(page.getByTestId("job-upgrade-open")).toHaveCount(0);
      await expect(page.getByTestId("job-downgrade")).toHaveCount(0);
      const after = await jobSemanticsSnapshot(f);
      const current = after.jobs.find(row => row.id === jobId)!;
      expect(current).toMatchObject({ ...Object.fromEntries(["status", "tenant_id", "customer_id", "quote_acceptance_id",
        "quote_version_id", "source_quote_version_id"].filter(key => key in raw).map(key => [key, key === "status" ? "in_progress" : raw[key]])), id: jobId, type: "projekt" });
      for (const key of ["members", "roles", "windows", "dependencies", "bookings", "assignees", "conflicts",
        "workOrders", "workOrderAssignees", "workOrderDependencies", "files", "fileLinks"] as const)
        expect(after[key], key).toEqual(before[key]);
      expect(after.events.filter(row => !before.events.some(old => old.id === row.id))).toEqual([
        expect.objectContaining({ job_id: jobId, tenant_id: f.fx.base.tenantA.id }),
      ]);
      expect(after.audit.filter(row => !before.audit.some(old => old.id === row.id))).toHaveLength(1);
      const upgraded = await readJobSemantics(f.fx.plannerClient, jobId);
      const {cardRevision:previousRevision,...previousFields}=cardBefore.card as typeof cardBefore.card & {cardRevision:string};
      const {cardRevision:upgradedRevision,...upgradedFields}=upgraded.card as typeof upgraded.card & {cardRevision:string};
      expect(previousRevision).toMatch(/^[0-9a-f]{64}$/);expect(upgradedRevision).toMatch(/^[0-9a-f]{64}$/);
      expect(upgradedRevision).not.toBe(previousRevision);
      expect(upgradedFields).toEqual({ ...previousFields, type: "projekt" });
      expect(upgraded.leadPersonProfileId).toBe(cardBefore.leadPersonProfileId);
      expect(upgraded.workOrders).toEqual(cardBefore.workOrders);
      expect(upgraded.dependencies).toEqual(cardBefore.dependencies);
      await page.getByRole("tab", {name: "Filer", exact: true}).click();
      await expect(files.getByRole("listitem").filter({ hasText: filename })).toHaveCount(1);
      // Both kinds have usable fields and existing WO/lead semantics, with no project-only invention.
      await editFullCard(page, f, jobId, "Projekt card after upgrade", customerId, facilityId, contactId);
      await expect(page.getByTestId(`job-member-${f.fx.ownProfile.id}`)).toBeVisible();
      await page.getByRole("tab", {name: "Arbetsorder", exact: true}).click();
      await expect(page.getByTestId(`work-order-${wo}`)).toContainText("Retained order child");
    } finally { await f.dispose(); }
  });

  test("[P0] 16.4-Upgrade-E02 current lead gains no manager grant; phone response-loss retry keeps state and commits once",
    { annotation: [{ type: "skipNetworkMonitoring", description: "Lose one exact real upgrade response after durable commit" }] },
    async ({ resourcePage: page }) => {
      const f = await createJobsDepthFixture();
      let lose: ((route: Route) => Promise<void>) | undefined;
      try {
        const jobId = f.jobs.memberOrder.id;
        await seedMember(f, jobId, f.fx.ownProfile.id, true);
        await page.setViewportSize({ width: 360, height: 640 });
        await signIn(page, f.credentials.assignedWorker);
        await page.goto(`/jobs/${jobId}`);
        await expect(page.getByTestId("job-detail")).toBeVisible();
        await expect(page.getByTestId("job-upgrade-open")).toHaveCount(0);
        await expect(page.getByTestId("job-card-form")).toHaveCount(0);
        await expect(page.getByTestId("job-edit-open")).toHaveCount(0);
        const lead = await readJobSemantics(f.fx.montorClient, jobId);
        expect(lead).toMatchObject({ canUpgrade: false, canEditCard: false, leadPersonProfileId: f.fx.ownProfile.id });
        await signIn(page, f.credentials.manager);
        const pane = await dialog(page, jobId);
        await confirmTruth(pane);
        const before = await jobSemanticsSnapshot(f);
        let captured: UpgradeInput | null = null, intercepted = false;
        // playwright-utils deviation: one-shot exact Next action forwards real writes,
        // checks their durable result, then drops ONLY this response; unrelated traffic continues.
        lose = async route => {
          const input = upgradeRequest(route.request(), jobId);
          if (intercepted || !input) { await route.continue(); return; }
          intercepted = true; captured = input;
          const upstream = await route.fetch();
          expect(upstream.ok()).toBe(true);
          await expect.poll(async () => (await readJobSemantics(f.fx.plannerClient, jobId)).type).toBe("projekt");
          await expect(page.getByTestId("job-upgrade-save-status")).toHaveCount(0);
          await route.abort("failed");
        };
        await page.route("**/*", lose);
        await pane.getByTestId("job-upgrade-confirm").click();
        await expect(pane.getByTestId("job-upgrade-error")).toBeVisible();
        await expect(pane.getByTestId("job-upgrade-consent")).toBeChecked();
        await expect(page.getByTestId("job-upgrade-save-status")).toHaveCount(0);
        expect(intercepted).toBe(true);
        const committed = await jobSemanticsSnapshot(f);
        expect(committed.events.length - before.events.length).toBe(1);
        expect(committed.audit.length - before.audit.length).toBe(1);
        const retry = page.waitForResponse(reply => upgradeRequest(reply.request(), jobId) !== null);
        await pane.getByTestId("job-upgrade-retry").click();
        const replay = await retry;
        expect(replay.ok()).toBe(true);
        expect(upgradeRequest(replay.request(), jobId)).toEqual(captured);
        await expect(page.getByTestId("job-upgrade-save-status")).toBeVisible();
        expect(await jobSemanticsSnapshot(f)).toEqual(committed);
        await page.reload();
        await expect(page.getByTestId("job-operational-card")).toContainText("Projekt");
        await expect(page.getByTestId("job-upgrade-open")).toHaveCount(0);
        await expect(page.getByTestId("job-downgrade")).toHaveCount(0);
      } finally {
        if (lose) await page.unroute("**/*", lose);
        await f.dispose();
      }
    });

  test("[P0] 16.4-Upgrade-E03 definitive refusal dismisses; failed/duplicate refetch retains confirmation and cannot overwrite a newer save",async({resourcePage:page})=>{
    const f=await createJobsDepthFixture();let intercept:((route:Route)=>Promise<void>)|undefined;let release=()=>{};
    try {
      const job=f.jobs.editable.id,membership=f.fx.coworkerProfile.membershipId;
      await signIn(page,f.credentials.manager);let pane=await dialog(page,job);await confirmTruth(pane);
      const [prior]=await adminQuery<{role:string}>("select role from public.tenant_memberships where id=$1",[membership]);
      const roles=await adminQuery<{role:string}>("select role from public.membership_roles where membership_id=$1",[membership]);
      await adminQuery("delete from public.membership_roles where membership_id=$1",[membership]);
      await adminQuery("update public.tenant_memberships set role='saljare' where id=$1",[membership]);
      const before=await jobSemanticsSnapshot(f);
      await pane.getByTestId("job-upgrade-confirm").click();await expect(pane.getByTestId("job-upgrade-error")).toBeVisible();
      await page.getByRole("dialog",{name:"Uppgradera till projekt",exact:true}).getByRole("button",{name:"Stäng",exact:true}).click();
      await expect(pane).toHaveCount(0);expect(await jobSemanticsSnapshot(f)).toEqual(before);
      await adminQuery("update public.tenant_memberships set role=$2 where id=$1",[membership,prior.role]);
      for(const role of roles)await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,$3)",[f.fx.base.tenantA.id,membership,role.role]);
      pane=await dialog(page,job);await confirmTruth(pane);
      await saveCard(f,job,{title:"Intervening card change"});
      await pane.getByTestId("job-upgrade-confirm").click();await expect(pane.getByTestId("job-upgrade-refetch")).toBeEnabled();
      const isRefetch=(request:Request)=>{if(request.method()!=="POST" || !request.headers()["next-action"] || new URL(request.url()).pathname!==`/jobs/${job}`)return false;try{const args=JSON.parse(request.postData()??"null");return Array.isArray(args)&&args.length===1&&args[0]===job;}catch{return false;}};
      let calls=0;intercept=async route=>{if(!isRefetch(route.request())){await route.continue();return;}calls++;await route.abort("failed");};
      await page.route("**/*",intercept);await pane.getByTestId("job-upgrade-refetch").click();
      await expect(pane.getByTestId("job-upgrade-error")).toContainText("kunde inte hämtas");await expect(pane.getByTestId("job-upgrade-consent")).toBeChecked();
      await expect(pane.getByTestId("job-upgrade-refetch")).toBeEnabled();await page.unroute("**/*",intercept);
      let reached!:()=>void;const captured=new Promise<void>(resolve=>{reached=resolve;}),released=new Promise<void>(resolve=>{release=resolve;});
      intercept=async route=>{if(!isRefetch(route.request())){await route.continue();return;}calls++;const actual=await route.fetch();reached();await released;await route.fulfill({response:actual});};
      await page.route("**/*",intercept);
      await pane.getByTestId("job-upgrade-refetch").evaluate(element=>{(element as HTMLButtonElement).click();(element as HTMLButtonElement).click();});
      await captured;await expect(pane.getByTestId("job-upgrade-refetch")).toBeDisabled();await expect(pane.getByTestId("job-upgrade-retry")).toHaveCount(0);await expect(pane.getByTestId("job-upgrade-confirm")).toBeDisabled();
      release();await expect(pane.getByTestId("job-upgrade-consent")).not.toBeChecked();expect(calls).toBe(2);
      await confirmTruth(pane);await pane.getByTestId("job-upgrade-confirm").click();await expect(page.getByTestId("job-upgrade-save-status")).toBeVisible();
      expect((await readJobSemantics(f.fx.plannerClient,job)).type).toBe("projekt");
    } finally {release();if(intercept)await page.unroute("**/*",intercept);await f.dispose();}
  });
});

