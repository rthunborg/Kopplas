/**
 * Story 20.3 ATDD RED. All tests stay skipped until context navigation lands,
 * provisional selectors are reconciled, and required real-browser evidence runs.
 * AI/source generation only: no browser snapshots or Lovable observations.
 *
 * Confidence 8: selectors/fixtures inspected in DocumentFilters, FileIndexUpload,
 * EntityFilePanel, CommitmentFilesPanel, CRM/calculation/job pages, quote-files-panel,
 * acceptance-panel, global-setup and tenants/{crm,calculations,quotes,files,storage}.
 * New PROVISIONAL IDs: documents-context-heading, documents-context-return,
 * documents-context-empty, documents-context-root. Only new fixed copy is Visa i Dokument,
 * Dokumentkontexten är inte tillgänglig, Försök igen (approved Story 20.3).
 * Return/heading accessible names are intentionally not invented.
 *
 * TEA utilities/faker flags=true but neither package exists: mandate gate 2 false.
 * Keep the existing guarded fixture, local factories, UUIDs and real Next transport.
 * Lazy fixture reads + setup inside skipped bodies keep collection service-free.
 * Error driver needs local request statement_timeout < 20s for the bounded source
 * lock below; verify it before activation. No guessed endpoint or successful mock.
 */
import type { Locator, Page, Response } from "@playwright/test";
import { test, expect } from "../dashboard/guarded-test";
import { readFileSync } from "node:fs";
import path from "node:path";
import {
  adminInsertCustomer, adminInsertFacility, adminInsertContact, adminInsertCalculation,
  adminInsertQuote, adminInsertQuoteVersion, adminInsertFile, adminInsertFileLink,
  adminUploadStorageObject, adminRemoveStorageObject,
} from "../../factories/tenants";
import { adminQuery, adminSession, closeAdminPool } from "../../factories/admin-sql";

type Credentials = { id: string; email: string; password: string };
type Fixture = {
  tenantA: { id: string }; tenantB: { id: string }; adminA: Credentials;
  notifications: { installer: Credentials; salesperson: Credentials; finance: Credentials };
  crm: { fileName: string };
  acceptedJob: { jobId: string };
  acceptedAcceptance: { quoteId: string; acceptanceId: string; evidenceFileId: string };
};
type Owner = "customer" | "facility" | "contact" | "calculation" | "job" | "quote_version" | "quote_acceptance";
type Source = { module: string; ownerType: Owner; ownerId: string; route: string; returnHref: string; panelId: string; label: string; purpose: "crm_document" | "calculation_attachment" | "job_evidence" | "quote_pdf" | "acceptance_evidence" };
type SeedFile = { id: string; linkId: string; name: string; objectPath: string; body: Buffer };
type Seed = {
  base: Fixture; sources: Partial<Record<Owner, Source>>; customers: string[];
  facilities: string[]; contacts: string[]; calculations: string[]; quotes: string[];
  versions: string[]; files: SeedFile[]; foreignCustomerId: string; foreignLabel: string;
};
const RED = { annotation: [{ type: "atdd-red", description: "Activate after Story 20.3 implementation, provisional selector reconciliation and real local fixtures" }] };
const ERROR_RED = { annotation: [...RED.annotation, { type: "skipNetworkMonitoring", description: "Current-authority denial or bounded real source-read failure is the subject" }] };
const LINK_NAME = "Visa i Dokument";
const UNAVAILABLE = "Dokumentkontexten är inte tillgänglig";
const fixture = (): Fixture => JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
const documentRow = (page: Page, name: string) => page.getByTestId("file-index-row").filter({ hasText: name });
const preview = (page: Page) => page.getByTestId("documents-preview-pane");
const download = (page: Page) => preview(page).getByRole("link", { name: "Ladda ned", exact: true });
const contextHeading = (page: Page) => page.getByTestId("documents-context-heading");
const contextReturn = (page: Page) => page.getByTestId("documents-context-return");

function href(source: Source, extra: Record<string, string> = {}): string {
  return "/files?" + new URLSearchParams({ module: source.module, ownerType: source.ownerType, ownerId: source.ownerId, ...extra });
}
function tupleMatches(url: URL, source: Source): boolean {
  return url.pathname === "/files" && url.searchParams.get("module") === source.module
    && url.searchParams.get("ownerType") === source.ownerType && url.searchParams.get("ownerId") === source.ownerId;
}
async function hydrated(control: Locator): Promise<void> {
  await control.waitFor({ state: "visible" });
  await expect.poll(() => control.evaluate(element => element.isConnected && Object.keys(element).some(key => key.startsWith("__react"))), { timeout: 15_000 }).toBe(true);
}
async function signIn(page: Page, credentials: Credentials): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await hydrated(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password);
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
/** Pick by the observed exact tuple, not order/CSS; CRM contains three real anchors. */
async function entry(page: Page, source: Source): Promise<Locator> {
  for (const anchor of await page.getByRole("link", { name: LINK_NAME, exact: true }).all()) {
    const value = await anchor.getAttribute("href");
    if (value && tupleMatches(new URL(value, page.url()), source)) return anchor;
  }
  throw new Error("Expected real panel entry for " + source.ownerType + " source");
}
function source(seed: Seed, owner: Owner): Source {
  const value = seed.sources[owner];
  if (!value) throw new Error("Missing locally arranged source " + owner);
  return value;
}
async function selectedIdentity(row: Locator): Promise<{ fileId: string | null; linkId: string | null }> {
  // Source-derived hidden identity fields are extraction only, never CSS interaction.
  return row.evaluate(element => ({
    fileId: element.querySelector<HTMLInputElement>('input[name="file_id"]')?.value ?? null,
    linkId: element.querySelector<HTMLInputElement>('input[name="link_id"]')?.value ?? null,
  }));
}
function actionResponse(page: Page): Promise<Response> {
  // Register before the real existing Next server-action POST. No invented API.
  return page.waitForResponse(reply => new URL(reply.url()).pathname === "/files"
    && reply.request().method() === "POST" && !!reply.request().headers()["next-action"]);
}
async function select(page: Page, file: SeedFile): Promise<Response> {
  const button = documentRow(page, file.name).getByRole("button", { name: "Förhandsvisa", exact: true });
  await hydrated(button);
  const response = actionResponse(page);
  await button.click();
  return response;
}
async function seedFile(seed: Seed, owner: Source, suffix: string, artifact: "quote_pdf" | null = null): Promise<SeedFile> {
  const id = crypto.randomUUID();
  const file = { id, linkId: "", name: "20.3-" + suffix + "-" + crypto.randomUUID() + (artifact ? ".pdf" : ".txt"),
    objectPath: seed.base.tenantA.id + "/" + id + "/context-fixture", body: Buffer.from(artifact ? "%PDF-1.7\n%context-fixture\n" : "20.3 selected bytes " + id) };
  seed.files.push(file);
  await adminUploadStorageObject({ bucket: "tenant-files", objectPath: file.objectPath, body: file.body });
  await adminInsertFile({ id, tenant_id: seed.base.tenantA.id, display_name: file.name, object_path: file.objectPath,
    mime_type: artifact ? "application/pdf" : "text/plain", size_bytes: file.body.length, artifact_kind: artifact, lifecycle_state: "linked" });
  file.linkId = await adminInsertFileLink({ tenant_id: seed.base.tenantA.id, file_id: id, owner_type: owner.ownerType,
    owner_id: owner.ownerId, purpose: owner.purpose });
  return file;
}
async function withSeed(run: (seed: Seed) => Promise<void>): Promise<void> {
  const seed: Seed = { base: fixture(), sources: {}, customers: [], facilities: [], contacts: [], calculations: [],
    quotes: [], versions: [], files: [], foreignCustomerId: "", foreignLabel: "20.3-foreign-" + crypto.randomUUID() };
  try {
    const tenant = seed.base.tenantA.id;
    const customerLabel = "20.3-customer-" + crypto.randomUUID();
    const customerId = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: customerLabel });
    seed.customers.push(customerId);
    seed.foreignCustomerId = await adminInsertCustomer({ tenant_id: seed.base.tenantB.id, customer_type: "company", display_name: seed.foreignLabel });
    seed.customers.push(seed.foreignCustomerId);
    const customerRoute = "/customers/" + customerId;
    seed.sources.customer = { module: "crm", ownerType: "customer", ownerId: customerId, route: customerRoute,
      returnHref: customerRoute, panelId: "entity-file-panel", label: customerLabel, purpose: "crm_document" };
    const facilityLabel = "20.3-facility-" + crypto.randomUUID();
    const facilityId = await adminInsertFacility({ tenant_id: tenant, customer_id: customerId, name: facilityLabel });
    seed.facilities.push(facilityId);
    seed.sources.facility = { module: "crm", ownerType: "facility", ownerId: facilityId, route: customerRoute,
      returnHref: customerRoute, panelId: "entity-file-panel-facility-" + facilityId, label: facilityLabel, purpose: "crm_document" };
    const contactLabel = "20.3-contact-" + crypto.randomUUID();
    const contactId = await adminInsertContact({ tenant_id: tenant, customer_id: customerId, facility_id: facilityId, name: contactLabel });
    seed.contacts.push(contactId);
    seed.sources.contact = { module: "crm", ownerType: "contact", ownerId: contactId, route: customerRoute,
      returnHref: customerRoute, panelId: "entity-file-panel-contact-" + contactId, label: contactLabel, purpose: "crm_document" };
    const calculationLabel = "20.3-calculation-" + crypto.randomUUID();
    const calculationId = await adminInsertCalculation({ tenant_id: tenant, customer_id: customerId, title: calculationLabel });
    seed.calculations.push(calculationId);
    seed.sources.calculation = { module: "calculations", ownerType: "calculation", ownerId: calculationId,
      route: "/calculations/" + calculationId, returnHref: "/calculations/" + calculationId,
      panelId: "entity-file-panel", label: calculationLabel, purpose: "calculation_attachment" };
    const jobId = seed.base.acceptedJob.jobId;
    const [job] = await adminQuery<{ title: string }>("select title from public.jobs where tenant_id=$1 and id=$2", [tenant, jobId]);
    if (!job) throw new Error("Existing accepted-job global fixture missing");
    seed.sources.job = { module: "jobs", ownerType: "job", ownerId: jobId, route: "/jobs/" + jobId,
      returnHref: "/jobs/" + jobId, panelId: "entity-file-panel", label: job.title, purpose: "job_evidence" };
    const acceptanceId = seed.base.acceptedAcceptance.acceptanceId;
    const [acceptance] = await adminQuery<{ quote_version_id: string }>("select quote_version_id from public.quote_acceptances where tenant_id=$1 and id=$2", [tenant, acceptanceId]);
    if (!acceptance) throw new Error("Existing accepted-acceptance global fixture missing");
    const acceptanceRoute = "/quotes/" + seed.base.acceptedAcceptance.quoteId + "/versions/" + acceptance.quote_version_id;
    seed.sources.quote_acceptance = { module: "quotes", ownerType: "quote_acceptance", ownerId: acceptanceId,
      route: acceptanceRoute, returnHref: acceptanceRoute, panelId: "entity-file-panel", label: "", purpose: "acceptance_evidence" };
    await run(seed);
  } finally {
    // Established 20.2/core synthetic-fixture teardown: bypass only while deleting
    // exact test-owned IDs, after assertions. Shared job/acceptance remain untouched.
    await adminSession(async session => {
      await session.query("begin");
      try {
        await session.query("set local session_replication_role = replica");
        const fileIds = seed.files.map(file => file.id);
        await session.query("delete from public.audit_events where target_type='file' and target_id=any($1::uuid[])", [fileIds]);
        await session.query("delete from public.file_links where file_id=any($1::uuid[])", [fileIds]);
        await session.query("delete from public.files where id=any($1::uuid[])", [fileIds]);
        await session.query("delete from public.quote_versions where id=any($1::uuid[])", [seed.versions]);
        await session.query("delete from public.quotes where id=any($1::uuid[])", [seed.quotes]);
        await session.query("delete from public.calculations where id=any($1::uuid[])", [seed.calculations]);
        await session.query("delete from public.contacts where id=any($1::uuid[])", [seed.contacts]);
        await session.query("delete from public.facilities where id=any($1::uuid[])", [seed.facilities]);
        await session.query("delete from public.customers where id=any($1::uuid[])", [seed.customers]);
        await session.query("commit");
      } catch (error) { await session.query("rollback"); throw error; }
    });
    for (const file of seed.files) await adminRemoveStorageObject({ bucket: "tenant-files", objectPath: file.objectPath });
  }
}
async function sentSource(seed: Seed): Promise<SeedFile> {
  const customer = source(seed, "customer"), calculation = source(seed, "calculation");
  const quoteId = await adminInsertQuote({ tenant_id: seed.base.tenantA.id, customer_id: customer.ownerId });
  seed.quotes.push(quoteId);
  const versionId = await adminInsertQuoteVersion({ tenant_id: seed.base.tenantA.id, quote_id: quoteId, calculation_id: calculation.ownerId,
    version_number: 1, status: "draft", company_name: "20.3 synthetic company", customer_display_name: customer.label });
  seed.versions.push(versionId);
  const returnHref = "/quotes/" + quoteId + "/versions/" + versionId;
  seed.sources.quote_version = { module: "quotes", ownerType: "quote_version", ownerId: versionId,
    route: "/quotes/" + quoteId, returnHref, panelId: "commitment-file-panel", label: "", purpose: "quote_pdf" };
  const file = await seedFile(seed, source(seed, "quote_version"), "locked-sent", "quote_pdf");
  // Arrange artifact while draft, then use the real sent transition/lock triggers.
  await adminQuery("update public.quote_versions set pdf_status='generated',pdf_file_id=$2,pdf_generated_at='2026-10-13T08:00:00Z' where id=$1", [versionId, file.id]);
  await adminQuery("update public.quote_versions set status='sent' where id=$1", [versionId]);
  return file;
}
async function openPicker(page: Page): Promise<Locator> {
  const button = page.getByTestId("upload-file-button");
  await hydrated(button); await button.click();
  return page.getByTestId("file-index-upload-form");
}
async function lifecycleState(fileId: string): Promise<string> {
  const [row] = await adminQuery<{ lifecycle_state: string }>("select lifecycle_state from public.files where id=$1", [fileId]);
  return row.lifecycle_state;
}
test.afterAll(async () => { await closeAdminPool(); });

test.describe("Story 20.3 real entity insertion routes — ATDD RED", () => {
  for (const owner of ["customer", "facility", "contact", "calculation", "job", "quote_version", "quote_acceptance"] as const) {
    test.skip("[P1][AC1,3,5,7] " + owner + " real panel opens exact Documents context and safe return", RED, async ({ page }) => {
      await withSeed(async seed => {
        const created = owner === "quote_version" ? await sentSource(seed)
          : owner === "quote_acceptance" ? null : await seedFile(seed, source(seed, owner), owner);
        const ref = source(seed, owner);
        const fileName = created?.name ?? (await adminQuery<{ display_name: string }>("select display_name from public.files where id=$1", [seed.base.acceptedAcceptance.evidenceFileId]))[0].display_name;
        await signIn(page, seed.base.adminA); await page.goto(ref.route);
        const panel = page.getByTestId(ref.panelId);
        await expect(panel).toBeVisible();
        await expect(panel).toContainText(fileName);
        if (owner === "quote_version") {
          await expect(panel.getByTestId("file-lock-notice")).toBeVisible();
          await expect(panel.getByLabel("Välj en fil att ladda upp")).toHaveCount(0);
          await expect(panel.getByTestId("replace-file")).toHaveCount(0);
          await expect(panel.getByTestId("delete-file")).toHaveCount(0);
        }
        if (owner === "quote_acceptance") await expect(panel.getByLabel("Välj en fil att ladda upp", { exact: true })).toBeVisible();
        const anchor = await entry(page, ref);
        await expect(anchor).toHaveAttribute("href", href(ref));
        await anchor.click();
        await expect(page).toHaveURL(url => tupleMatches(url, ref));
        await expect(page.getByRole("heading", { name: "Dokument", exact: true })).toBeVisible();
        await expect(contextHeading(page)).toBeVisible();
        await expect(documentRow(page, fileName)).toHaveCount(1);
        if (created) expect(await selectedIdentity(documentRow(page, fileName))).toEqual({ fileId: created.id, linkId: created.linkId });
        await expect(contextReturn(page)).toHaveAttribute("href", ref.returnHref);
        await contextReturn(page).click();
        await expect(page).toHaveURL(url => url.pathname === ref.returnHref);
        if (owner === "quote_version") await expect(page.getByTestId("quote-version-snapshot")).toBeVisible();
        else await expect(page.getByTestId(ref.panelId)).toBeVisible();
      });
    });
  }

  test.skip("[P1][AC1,5,7] sent wrapper stays null for draft/empty; no fabricated version panel", RED, async ({ page }) => {
    await withSeed(async seed => {
      await sentSource(seed); const ref = source(seed, "quote_version");
      await signIn(page, seed.base.adminA);
      const draftId = await adminInsertQuoteVersion({ tenant_id: seed.base.tenantA.id, quote_id: seed.quotes[0],
        calculation_id: source(seed, "calculation").ownerId, version_number: 2, status: "draft" });
      seed.versions.push(draftId);
      await page.goto("/quotes/" + seed.quotes[0] + "/versions/" + draftId);
      await expect(page.getByTestId("commitment-file-panel")).toHaveCount(0);
      await expect(page.getByRole("link", { name: LINK_NAME, exact: true })).toHaveCount(0);
      await page.goto(ref.route);
      await expect(page.getByTestId("commitment-file-panel")).toHaveCount(0); // latest selected draft
      await page.goto(ref.returnHref);
      await expect(page.getByTestId("quote-version-snapshot")).toBeVisible();
      // The version subroute has no sent-file wrapper; preserve that actual surface.
      await expect(page.getByTestId("commitment-file-panel")).toHaveCount(0);
      const emptyQuoteId = await adminInsertQuote({ tenant_id: seed.base.tenantA.id, customer_id: source(seed, "customer").ownerId });
      seed.quotes.push(emptyQuoteId);
      const emptyVersionId = await adminInsertQuoteVersion({ tenant_id: seed.base.tenantA.id, quote_id: emptyQuoteId,
        calculation_id: source(seed, "calculation").ownerId, status: "draft" });
      seed.versions.push(emptyVersionId);
      await adminQuery("update public.quote_versions set status='sent' where id=$1", [emptyVersionId]);
      await page.goto("/quotes/" + emptyQuoteId);
      await expect(page.getByTestId("quote-detail")).toBeVisible();
      await expect(page.getByTestId("commitment-file-panel")).toHaveCount(0);
      await expect(page.getByRole("link", { name: LINK_NAME, exact: true })).toHaveCount(0);
    });
  });
});

test.describe("Story 20.3 context authority — ATDD RED", () => {
  for (const role of ["installer", "salesperson", "finance"] as const) {
    test.skip("[P0][AC1,2,7] " + role + " cannot gain center entry or source labels from query intent", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, source(seed, "customer"), "denied-role");
        await signIn(page, seed.base.notifications[role]);
        await page.goto(source(seed, "customer").route);
        await expect(page.getByRole("link", { name: LINK_NAME, exact: true })).toHaveCount(0);
        await page.goto(href(source(seed, "customer")));
        await expect(page.getByText(UNAVAILABLE, { exact: true })).toBeVisible();
        await expect(page.getByTestId("file-index-row")).toHaveCount(0);
        await expect(contextReturn(page)).toHaveCount(0);
        await expect(page.getByRole("main")).not.toContainText(source(seed, "customer").label);
        await expect(page.getByRole("main")).not.toContainText(file.name);
      });
    });
  }

  const invalidQueries = [
    "owner-id-only", "duplicate-owner", "duplicate-id", "wrong-module", "unknown-owner",
    "malformed-uuid", "unknown-key", "returnTo", "client-label", "wrong-purpose", "missing-source", "cross-tenant",
  ] as const;
  for (const invalid of invalidQueries) {
    test.skip("[P0][AC2,7] direct " + invalid + " context never exposes results, labels or automatic fallback", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, "customer");
        const file = await seedFile(seed, ref, "unfiltered-decoy");
        const params = new URLSearchParams({ module: "crm", ownerType: "customer", ownerId: ref.ownerId });
        switch (invalid) {
          case "owner-id-only": params.delete("ownerType"); break;
          case "duplicate-owner": params.append("ownerType", "facility"); break;
          case "duplicate-id": params.append("ownerId", source(seed, "facility").ownerId); break;
          case "wrong-module": params.set("module", "jobs"); break;
          case "unknown-owner": params.set("ownerType", "supplier"); break;
          case "malformed-uuid": params.set("ownerId", "not-a-uuid"); break;
          case "unknown-key": params.set("unexpected", "1"); break;
          case "returnTo": params.set("returnTo", "https://example.invalid/escape"); break;
          case "client-label": params.set("label", seed.foreignLabel); break;
          case "wrong-purpose": params.set("purpose", "job_evidence"); break;
          case "missing-source": params.set("ownerId", crypto.randomUUID()); break;
          case "cross-tenant": params.set("ownerId", seed.foreignCustomerId); break;
        }
        await signIn(page, seed.base.adminA); const requested = "/files?" + params;
        await page.goto(requested);
        await expect(page.getByRole("alert").filter({ hasText: /Dokumentkontexten är inte tillgänglig|Kontrollera dokumentfiltren/ })).toBeVisible();
        await expect(page.getByTestId("file-index-row")).toHaveCount(0);
        await expect(page.getByTestId("documents-result-count")).toHaveCount(0);
        await expect(page.getByLabel("Antal per filter")).toHaveCount(0);
        await expect(contextReturn(page)).toHaveCount(0);
        await expect(page.getByRole("main")).not.toContainText(ref.label);
        await expect(page.getByRole("main")).not.toContainText(seed.foreignLabel);
        await expect(page.getByRole("main")).not.toContainText(file.name);
        await expect(page).toHaveURL(url => url.pathname === "/files" && url.searchParams.toString() === params.toString());
      });
    });
  }

  for (const owner of ["customer", "facility", "contact", "calculation"] as const) {
    test.skip("[P0][AC1,2,7] " + owner + " source revocation is rechecked even with zero eligible links", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, owner);
        await signIn(page, seed.base.adminA); await page.goto(ref.route);
        await (await entry(page, ref)).click();
        await expect(contextHeading(page)).toBeVisible();
        await expect(page.getByTestId("documents-context-empty")).toBeVisible();
        const table = owner === "customer" ? "customers" : owner === "facility" ? "facilities" : owner === "contact" ? "contacts" : "calculations";
        await adminQuery("update public." + table + " set archived_at=statement_timestamp() where id=$1", [ref.ownerId]);
        await page.reload();
        await expect(page.getByText(UNAVAILABLE, { exact: true })).toBeVisible();
        await expect(contextReturn(page)).toHaveCount(0);
        await expect(page.getByTestId("file-index-row")).toHaveCount(0);
        await expect(page.getByTestId("documents-context-empty")).toHaveCount(0);
        await expect(page.getByRole("main")).not.toContainText(ref.label);
        // Root is a neutral explicit choice; unavailable context never auto-navigates.
        await expect(page).toHaveURL(url => tupleMatches(url, ref));
        await expect(page.getByTestId("documents-context-root")).toHaveAttribute("href", "/files");
        await page.goto(ref.route);
        const hrefs = await page.getByRole("link", { name: LINK_NAME, exact: true }).evaluateAll(elements => elements.map(element => element.getAttribute("href")));
        expect(hrefs.some(value => value !== null && tupleMatches(new URL(value, page.url()), ref))).toBe(false);
      });
    });
  }

  test.skip("[P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked", ERROR_RED, async ({ page }) => {
    await withSeed(async seed => {
      const ref = source(seed, "contact");
      await signIn(page, seed.base.adminA); await page.goto(href(ref));
      await expect(page.getByTestId("documents-context-empty")).toBeVisible();
      await adminQuery("update public.facilities set archived_at=statement_timestamp() where id=$1", [source(seed, "facility").ownerId]);
      await page.reload();
      await expect(page.getByText(UNAVAILABLE, { exact: true })).toBeVisible();
      await expect(contextReturn(page)).toHaveCount(0);
      await expect(page.getByRole("main")).not.toContainText(ref.label);
      await expect(page.getByRole("main")).not.toContainText(source(seed, "facility").label);
    });
  });

  test.skip("[P1][AC2] transient real source lookup failure offers retry and exposes context only after recovery", ERROR_RED, async ({ page }) => {
    await withSeed(async seed => {
      const ref = source(seed, "customer");
      await signIn(page, seed.base.adminA);
      // Fixture need: verify request-bound PostgREST statement_timeout <20s.
      // Bounded existing-table lock drives a REAL read failure, never fake JSON.
      await adminSession(async session => {
        await session.query("begin");
        try {
          await session.query("set local lock_timeout='5s'");
          await session.query("lock table public.customers in access exclusive mode");
          await page.goto(href(ref), { waitUntil: "commit" });
          await expect(page.getByRole("button", { name: "Försök igen", exact: true })).toBeVisible({ timeout: 20_000 });
          await expect(page.getByText(UNAVAILABLE, { exact: true })).toHaveCount(0);
          await expect(page.getByTestId("file-index-row")).toHaveCount(0);
          await expect(contextReturn(page)).toHaveCount(0);
          await expect(page.getByRole("main")).not.toContainText(ref.label);
        } finally { await session.query("rollback"); }
      });
      await page.getByRole("button", { name: "Försök igen", exact: true }).click();
      await expect(contextHeading(page)).toContainText(ref.label);
      await expect(contextReturn(page)).toHaveAttribute("href", ref.returnHref);
      await expect(page.getByTestId("documents-context-empty")).toBeVisible();
    });
  });
});

test.describe("Story 20.3 exact selected-link and file lifecycle — ATDD RED", () => {
  test.skip("[P0][AC3,7] one file linked to two sources yields only the exact tuple row and contextual facets", RED, async ({ page, context }) => {
    await withSeed(async seed => {
      const ref = source(seed, "customer"), child = source(seed, "facility");
      const file = await seedFile(seed, ref, "same-file");
      const otherLink = await adminInsertFileLink({ tenant_id: seed.base.tenantA.id, file_id: file.id, owner_type: "facility", owner_id: child.ownerId, purpose: "crm_document" });
      const decoy = await seedFile(seed, child, "other-owner-only");
      await signIn(page, seed.base.adminA); await page.goto(ref.route); await (await entry(page, ref)).click();
      await expect(documentRow(page, file.name)).toHaveCount(1);
      expect(await selectedIdentity(documentRow(page, file.name))).toEqual({ fileId: file.id, linkId: file.linkId });
      await expect(documentRow(page, decoy.name)).toHaveCount(0);
      await expect(page.getByTestId("documents-result-count")).toHaveText("1");
      await expect(page.getByTestId("documents-facet-count-module-crm")).toHaveText("1");
      await expect(page.getByTestId("documents-facet-count-ownerType-customer")).toHaveText("1");
      await expect(page.getByTestId("documents-facet-count-purpose-crm_document")).toHaveText("1");
      await expect(page.getByTestId("documents-facet-count-ownerType-facility")).toHaveCount(0);
      expect((await select(page, file)).ok()).toBe(true);
      await expect(download(page)).toBeVisible();
      const popupPromise = context.waitForEvent("page"); await download(page).click();
      const popup = await popupPromise;
      try { await expect(popup.getByText(file.body.toString(), { exact: true })).toBeVisible(); }
      finally { await popup.close(); }
      await page.goto(child.route); await (await entry(page, child)).click();
      expect(await selectedIdentity(documentRow(page, file.name))).toEqual({ fileId: file.id, linkId: otherLink });
      await expect(page.getByTestId("documents-result-count")).toHaveText("2");
      await expect(page.getByTestId("documents-facet-count-ownerType-facility")).toHaveText("2");
      await expect(download(page)).toHaveCount(0);
    });
  });

  test.skip("[P0][AC3,7] selected link revocation cannot refresh through another authorized owner of the same file", ERROR_RED, async ({ page }) => {
    await withSeed(async seed => {
      const ref = source(seed, "customer"), child = source(seed, "facility");
      const file = await seedFile(seed, ref, "revoked-selection");
      const alternate = await adminInsertFileLink({ tenant_id: seed.base.tenantA.id, file_id: file.id, owner_type: "facility", owner_id: child.ownerId, purpose: "crm_document" });
      await signIn(page, seed.base.adminA); await page.goto(href(ref));
      expect((await select(page, file)).ok()).toBe(true); await expect(download(page)).toBeVisible();
      await adminQuery("update public.file_links set archived_at=statement_timestamp() where id=$1", [file.linkId]);
      const response = actionResponse(page); await preview(page).getByRole("button", { name: "Förnya åtkomst", exact: true }).click();
      expect((await response).ok()).toBe(true);
      await expect(preview(page).getByRole("alert")).toContainText("Dokumentet är inte tillgängligt.");
      await expect(download(page)).toHaveCount(0);
      await page.reload(); await expect(documentRow(page, file.name)).toHaveCount(0);
      await page.goto(href(child));
      expect(await selectedIdentity(documentRow(page, file.name))).toEqual({ fileId: file.id, linkId: alternate });
      expect((await select(page, file)).ok()).toBe(true); await expect(download(page)).toBeVisible();
    });
  });

  for (const operation of ["archive", "restore"] as const) {
    test.skip("[P0][AC3,7] contextual " + operation + " still checks ALL file links after alternate source revocation", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, "customer"), child = source(seed, "facility");
        const file = await seedFile(seed, ref, "all-links-" + operation);
        await adminInsertFileLink({ tenant_id: seed.base.tenantA.id, file_id: file.id, owner_type: "facility", owner_id: child.ownerId, purpose: "crm_document" });
        if (operation === "restore") await adminQuery("update public.files set lifecycle_state='archived',archive_previous_state='linked',archived_at=statement_timestamp() where id=$1", [file.id]);
        await signIn(page, seed.base.adminA); await page.goto(href(ref, { mode: operation === "restore" ? "archived" : "active" }));
        const label = operation === "archive" ? "Arkivera" : "Återställ";
        await documentRow(page, file.name).getByRole("button", { name: label, exact: true }).click();
        const dialog = page.getByRole("dialog");
        await expect(dialog).toBeVisible();
        await adminQuery("update public.facilities set archived_at=statement_timestamp() where id=$1", [child.ownerId]);
        const response = actionResponse(page); await dialog.getByRole("button", { name: label, exact: true }).click();
        expect((await response).ok()).toBe(true);
        await expect(page.getByTestId("documents-lifecycle-error").getByRole("alert")).toBeVisible();
        await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0);
        expect(await lifecycleState(file.id)).toBe(operation === "archive" ? "linked" : "archived");
        expect(await adminQuery("select id from public.audit_events where target_id=$1 and command in ('document.archive','document.restore')", [file.id])).toHaveLength(0);
        await expect(page.getByTestId("documents-lifecycle-error")).not.toContainText(child.label);
      });
    });
  }
});

test.describe("Story 20.3 upload owner continuity — ATDD RED", () => {
  for (const owner of ["customer", "calculation", "job"] as const) {
    test.skip("[P1][AC5,7] supported " + owner + " picker preselects the validated exact source", RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, owner); await signIn(page, seed.base.adminA);
        await page.goto(ref.route); await (await entry(page, ref)).click();
        const form = await openPicker(page);
        await expect(form.getByTestId("file-index-upload-owner-type")).toHaveValue(owner);
        await expect(form.getByTestId("file-index-upload-owner")).toHaveValue(ref.ownerId);
        const owners = await form.getByTestId("file-index-upload-owner-type").getByRole("option").evaluateAll(elements => elements.map(element => (element as HTMLOptionElement).value));
        expect(owners).toEqual(["customer", "calculation", "job"]);
      });
    });
  }
  for (const owner of ["facility", "contact", "quote_version", "quote_acceptance"] as const) {
    test.skip("[P1][AC5,7] " + owner + " context chooses no generic owner and preserves safe entity upload return", RED, async ({ page }) => {
      await withSeed(async seed => {
        if (owner === "quote_version") await sentSource(seed);
        const ref = source(seed, owner); await signIn(page, seed.base.adminA);
        await page.goto(ref.route); await (await entry(page, ref)).click();
        const form = await openPicker(page);
        await expect(form.getByTestId("file-index-upload-owner")).toHaveValue("");
        const options = await form.getByTestId("file-index-upload-owner-type").getByRole("option").evaluateAll(elements => elements.map(element => (element as HTMLOptionElement).value));
        expect(options).toEqual(["customer", "calculation", "job"]);
        await expect(form.getByTestId("file-index-upload-owner")).not.toHaveValue(source(seed, "customer").ownerId);
        // Explicit manual owner stays visible; browsing the child never grants it silently.
        await form.getByTestId("file-index-upload-owner-type").selectOption("customer");
        await form.getByTestId("file-index-upload-owner").selectOption(source(seed, "customer").ownerId);
        await expect(form.getByTestId("file-index-upload-owner")).toHaveValue(source(seed, "customer").ownerId);
        await expect(contextReturn(page)).toHaveAttribute("href", ref.returnHref);
        await contextReturn(page).click();
        await expect(page).toHaveURL(url => url.pathname === ref.returnHref);
        if (owner === "quote_version") {
          await expect(page.getByTestId("quote-version-snapshot")).toBeVisible();
          // Locked/no-upload assertions belong to the approved quote DETAIL insertion.
          await page.goto(ref.route);
          const panel = page.getByTestId(ref.panelId);
          await expect(panel).toBeVisible();
          await expect(panel.getByTestId("file-lock-notice")).toBeVisible();
          await expect(panel.getByLabel("Välj en fil att ladda upp")).toHaveCount(0);
        } else {
          const panel = page.getByTestId(ref.panelId);
          await expect(panel).toBeVisible();
          await expect(panel.getByLabel("Välj en fil att ladda upp", { exact: true })).toBeVisible();
          // Existing owner-required form binding, source-derived DOM extraction.
          expect(await panel.evaluate(element => ({
            type: element.querySelector<HTMLInputElement>('input[name="owner_type"]')?.value,
            id: element.querySelector<HTMLInputElement>('input[name="owner_id"]')?.value,
          }))).toEqual({ type: owner, id: ref.ownerId });
        }
      });
    });
  }

  for (const owner of ["facility", "contact", "quote_acceptance"] as const) {
    test.skip("[P1][AC5,7] safe return preserves real " + owner + " upload persistence and exact owner", RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, owner);
        const name = "20.3-return-upload-" + crypto.randomUUID() + ".txt";
        await signIn(page, seed.base.adminA); await page.goto(ref.route);
        await (await entry(page, ref)).click(); await contextReturn(page).click();
        try {
          const panel = page.getByTestId(ref.panelId);
          const submit = panel.getByRole("button", { name: "Ladda upp fil", exact: true });
          await hydrated(submit);
          await panel.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from("owner-preserved entity upload") });
          await submit.click();
          await expect(panel.getByRole("status")).toContainText("Filen laddades upp.");
          await page.reload(); await expect(panel).toContainText(name);
          const rows = await adminQuery<{ id: string; object_path: string; owner_type: string; owner_id: string; is_locked: boolean }>(
            "select f.id,f.object_path,l.owner_type,l.owner_id,l.is_locked from public.files f join public.file_links l on l.file_id=f.id where f.tenant_id=$1 and f.display_name=$2",
            [seed.base.tenantA.id, name]);
          expect(rows).toHaveLength(1);
          expect(rows[0]).toMatchObject({ owner_type: owner, owner_id: ref.ownerId, is_locked: owner === "quote_acceptance" });
          await (await entry(page, ref)).click(); await expect(documentRow(page, name)).toHaveCount(1);
        } finally {
          // Track even a partially successful upload for withSeed's exact-ID cleanup.
          const uploaded = await adminQuery<{ id: string; object_path: string }>("select id,object_path from public.files where tenant_id=$1 and display_name=$2", [seed.base.tenantA.id, name]);
          for (const file of uploaded) seed.files.push({ id: file.id, linkId: "", name, objectPath: file.object_path, body: Buffer.alloc(0) });
        }
      });
    });
  }
});

for (const viewport of [{ name: "desktop", width: 1280, height: 800 }, { name: "phone", width: 360, height: 640 }]) {
  test.describe("Story 20.3 history and focus — " + viewport.name + " ATDD RED", () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    test.skip("[P1][AC4,7] keyboard entity-center-history-safe return keeps filters and clears selected capability", RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, "facility"), file = await seedFile(seed, ref, "history");
        await signIn(page, seed.base.adminA); await page.goto(ref.route);
        const anchor = await entry(page, ref); await anchor.scrollIntoViewIfNeeded(); await anchor.focus();
        await expect(anchor).toBeFocused(); await expect(anchor).toBeInViewport(); await anchor.press("Enter");
        await expect(page).toHaveURL(url => tupleMatches(url, ref));
        await expect(contextHeading(page)).toBeVisible();
        const search = page.getByLabel("Sök dokument", { exact: true }); await hydrated(search); await search.fill(file.name);
        await expect(page).toHaveURL(url => tupleMatches(url, ref) && url.searchParams.get("q") === file.name && !url.searchParams.has("cursor"));
        await expect(search).toBeFocused(); expect((await select(page, file)).ok()).toBe(true);
        await expect(download(page)).toBeVisible();
        await page.goBack(); await expect(page).toHaveURL(url => url.pathname === ref.route);
        await expect(page.getByTestId(ref.panelId)).toBeVisible();
        await page.goForward();
        await expect(page).toHaveURL(url => tupleMatches(url, ref) && url.searchParams.get("q") === file.name);
        await expect(search).toHaveValue(file.name); await expect(download(page)).toHaveCount(0);
        const back = contextReturn(page); await expect(back).toHaveAttribute("href", ref.returnHref);
        await back.scrollIntoViewIfNeeded(); await back.focus(); await expect(back).toBeFocused(); await expect(back).toBeInViewport();
        await back.press("Enter"); await expect(page).toHaveURL(url => url.pathname === ref.returnHref);
        await expect(page.getByTestId(ref.panelId)).toBeVisible();
      });
    });
    test.skip("[P1][AC3,4,7] filter change and a different context clear stale signed preview while controls stay reachable", RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, "customer"), other = source(seed, "facility");
        const file = await seedFile(seed, ref, "stale-preview");
        await seedFile(seed, other, "next-context");
        await signIn(page, seed.base.adminA); await page.goto(href(ref));
        expect((await select(page, file)).ok()).toBe(true); await expect(download(page)).toBeVisible();
        const signedUrl = await download(page).getAttribute("href");
        expect(signedUrl).toMatch(/^https?:\/\//);
        const search = page.getByLabel("Sök dokument", { exact: true }); await hydrated(search); await search.fill("absent-" + crypto.randomUUID());
        await expect(download(page)).toHaveCount(0); await expect(search).toBeFocused();
        await expect(page.getByTestId("file-index-empty")).toBeVisible();
        await page.goto(other.route); await (await entry(page, other)).click();
        await expect(contextHeading(page)).toContainText(other.label); await expect(download(page)).toHaveCount(0);
        expect(await page.getByRole("main").evaluate((element, value) => [...element.querySelectorAll("a")].some(anchor => anchor.href === value), signedUrl)).toBe(false);
        await contextReturn(page).scrollIntoViewIfNeeded(); await expect(contextReturn(page)).toBeInViewport();
        await search.scrollIntoViewIfNeeded(); await expect(search).toBeInViewport();
      });
    });
  });
}
