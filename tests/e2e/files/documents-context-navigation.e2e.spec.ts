/**
 * Story 20.3 context navigation. Required cases are active and use real local
 * source panels, request-bound actions, Storage bytes and current authority.
 * AI/source generation only: no browser snapshots or Lovable observations.
 *
 * Confidence 8: selectors/fixtures inspected in DocumentFilters, FileIndexUpload,
 * EntityFilePanel, CommitmentFilesPanel, CRM/calculation/job pages, quote-files-panel,
 * acceptance-panel, global-setup and tenants/{crm,calculations,quotes,files,storage}.
 * Current context test IDs: documents-context-heading, documents-context-return,
 * documents-context-empty, documents-context-root. Only new fixed copy is Visa i Dokument,
 * Dokumentkontexten är inte tillgänglig, Försök igen (approved Story 20.3).
 * Return/heading accessible names are intentionally not invented.
 *
 * TEA utilities/faker flags=true but neither package exists: mandate gate 2 false.
 * Keep the existing guarded fixture, local factories, UUIDs and real Next transport.
 * Lazy fixture reads + setup inside test bodies keep collection service-free.
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
const RED = { annotation: [{ type: "story", description: "20.3 current context navigation through actual source surfaces" }] };
const ERROR_RED = { annotation: [...RED.annotation, { type: "skipNetworkMonitoring", description: "Current-authority denial or bounded real source-read failure is the subject" }] };
const LINK_NAME = "Visa i Dokument";
const UNAVAILABLE = "Dokumentkontexten är inte tillgänglig";
const fixture = (): Fixture => JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
const documentRow = (page: Page, name: string) => page.getByTestId("file-index-row").filter({ hasText: name });
const preview = (page: Page) => page.getByTestId("documents-preview-pane");
const download = (page: Page) => preview(page).getByRole("link", { name: "Ladda ned", exact: true });
const contextHeading = (page: Page) => page.getByTestId("documents-context-heading");
const contextReturn = (page: Page) => page.getByTestId("documents-context-return");
async function attachContextRelationshipState(page: Page) {
  const viewport = page.viewportSize(), name = `35-4-documents-context-return-${viewport?.width}x${viewport?.height}-actual`;
  await test.info().attach(`${name}.png`, { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });
  await test.info().attach(`${name}.provenance.json`, { body: Buffer.from(JSON.stringify({
    kind: "production-actual", family: "connection-chip", state: "owner-context-return-focused", mode: "actual", viewport,
    test: test.info().titlePath, workflowSha: process.env.GITHUB_SHA || null, candidateSha: null,
    candidateIdentity: process.env.GITHUB_SHA ? "requires exact workflow checkout verification" : "local-uncommitted",
    rendering: "actual production page; next start via configured production webServer",
    fixture: "existing synthetic test-owned context-navigation records; actual owner label and checked return href",
    route: new URL(page.url()).pathname,
    command: "pnpm exec playwright test tests/e2e/files/documents-context-navigation.e2e.spec.ts",
    commandBinding: "suite reproduction; exact executed invocation and checkout require CI runner binding",
  })), contentType: "application/json" });
}

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
async function sentSource(seed: Seed, page: Page): Promise<SeedFile> {
  const customer = source(seed, "customer"), calculation = source(seed, "calculation");
  const quoteId = await adminInsertQuote({ tenant_id: seed.base.tenantA.id, customer_id: customer.ownerId });
  seed.quotes.push(quoteId);
  const versionId = await adminInsertQuoteVersion({ tenant_id: seed.base.tenantA.id, quote_id: quoteId, calculation_id: calculation.ownerId,
    version_number: 1, status: "draft", company_name: "20.3 synthetic company", customer_display_name: customer.label });
  seed.versions.push(versionId);
  const returnHref = "/quotes/" + quoteId + "/versions/" + versionId;
  seed.sources.quote_version = { module: "quotes", ownerType: "quote_version", ownerId: versionId,
    route: "/quotes/" + quoteId, returnHref, panelId: "commitment-file-panel", label: "", purpose: "quote_pdf" };
  // Exercise the current production reservation/render/attestation pipeline. Raw
  // pdf_status fixtures omit required provenance and must never bypass the guard.
  try {
    await signIn(page, seed.base.adminA); await page.goto("/quotes/" + quoteId);
    const generate = page.getByRole("button", { name: "Generera PDF", exact: true });
    await hydrated(generate); await generate.click();
    await expect(page.getByTestId("quote-pdf-status")).toHaveAttribute("data-pdf-status", "generated");
  } finally {
    // Track even partial reservations so fixture cleanup keeps exact-ID ownership.
    const files = await adminQuery<{ id: string; link_id: string; display_name: string; object_path: string }>(
      "select f.id,l.id as link_id,f.display_name,f.object_path from public.file_links l join public.files f on f.id=l.file_id where l.owner_type='quote_version' and l.owner_id=$1", [versionId]);
    for (const file of files) if (!seed.files.some(item => item.id === file.id)) seed.files.push({
      id: file.id, linkId: file.link_id, name: file.display_name, objectPath: file.object_path, body: Buffer.alloc(0) });
  }
  const [generated] = await adminQuery<{ pdf_file_id: string }>("select pdf_file_id from public.quote_versions where id=$1 and pdf_status='generated'", [versionId]);
  if (!generated) throw new Error("Actual generated quote source missing");
  const file = seed.files.find(item => item.id === generated.pdf_file_id);
  if (!file) throw new Error("Actual generated PDF link missing");
  // The existing sent transition runs its real immutability/file-lock triggers.
  await adminQuery("update public.quote_versions set status='sent' where id=$1", [versionId]);
  return file;
}
async function openPicker(page: Page): Promise<Locator> {
  const button = page.getByTestId("upload-file-button");
  await hydrated(button); await button.click();
  return page.getByTestId("file-index-upload-form");
}
/** Submit the actual shipped picker and retain exact file ownership even after a partial failure. */
async function uploadFromPicker(page: Page, seed: Seed, form: Locator, chosen: Source): Promise<SeedFile> {
  const name = "20.3-picker-upload-" + crypto.randomUUID() + ".txt";
  const body = Buffer.from("explicit picker owner " + chosen.ownerType + ":" + chosen.ownerId);
  try {
    await form.getByTestId("file-index-upload-owner-type").selectOption(chosen.ownerType);
    await form.getByTestId("file-index-upload-owner").selectOption(chosen.ownerId);
    await expect(form.getByTestId("file-index-upload-owner-type")).toHaveValue(chosen.ownerType);
    await expect(form.getByTestId("file-index-upload-owner")).toHaveValue(chosen.ownerId);
    await form.getByTestId("file-index-upload-input").setInputFiles({ name, mimeType: "text/plain", buffer: body });
    await form.getByTestId("file-index-upload-submit").click();
    await expect(page.getByTestId("file-index-upload-success")).toHaveText("Filen laddades upp.");
    const persisted = () => adminQuery<{ id: string; link_id: string; object_path: string; owner_type: string; owner_id: string; purpose: string }>(
      "select f.id,l.id as link_id,f.object_path,l.owner_type,l.owner_id,l.purpose from public.files f join public.file_links l on l.file_id=f.id where f.tenant_id=$1 and f.display_name=$2",
      [seed.base.tenantA.id, name]);
    await expect.poll(persisted).toHaveLength(1);
    const [file] = await persisted();
    expect(file).toMatchObject({ owner_type: chosen.ownerType, owner_id: chosen.ownerId, purpose: chosen.purpose });
    expect(await adminQuery("select id from public.audit_events where command='file.upload' and target_id=$1", [file.id])).toHaveLength(1);
    return { id: file.id, linkId: file.link_id, name, objectPath: file.object_path, body };
  } finally {
    const files = await adminQuery<{ id: string; object_path: string }>(
      "select id,object_path from public.files where tenant_id=$1 and display_name=$2", [seed.base.tenantA.id, name]);
    for (const file of files) if (!seed.files.some(item => item.id === file.id)) seed.files.push({
      id: file.id, linkId: "", name, objectPath: file.object_path, body });
    const objects = await adminQuery<{ name: string }>(
      "select name from storage.objects where bucket_id='tenant-files' and split_part(name,'/',1)=$1 and split_part(name,'/',3)=$2",
      [seed.base.tenantA.id, name]);
    for (const object of objects) if (!seed.files.some(item => item.objectPath === object.name)) seed.files.push({
      id: object.name.split("/")[1], linkId: "", name, objectPath: object.name, body });
  }
}
async function expectContextUploadReset(page: Page, ref: Source, previousSignedHref?: string): Promise<void> {
  await expect(page).toHaveURL(url => tupleMatches(url, ref) && url.searchParams.get("mode") === "active"
    && [...url.searchParams.keys()].sort().join(",") === "mode,module,ownerId,ownerType");
  await expect(contextHeading(page)).toHaveText(ref.label);
  await expect(contextReturn(page)).toHaveAttribute("href", ref.returnHref);
  await expect(page.getByLabel("Sök dokument", { exact: true })).toHaveValue("");
  await expect(page.getByRole("combobox", { name: "Syfte", exact: true })).toHaveValue("");
  await expect(page.getByLabel("Från", { exact: true })).toHaveValue("");
  await expect(page.getByLabel("Till", { exact: true })).toHaveValue("");
  await expect(page.getByRole("button", { name: "Aktiva", exact: true })).toHaveAttribute("aria-pressed", "true");
  await expect(download(page)).toHaveCount(0);
  if (previousSignedHref) expect(await page.locator("#main-content").evaluate((element, href) =>
    [...element.querySelectorAll("a")].some(anchor => anchor.href === href), previousSignedHref)).toBe(false);
}
async function lifecycleState(fileId: string): Promise<string> {
  const [row] = await adminQuery<{ lifecycle_state: string }>("select lifecycle_state from public.files where id=$1", [fileId]);
  return row.lifecycle_state;
}
test.afterAll(async () => { await closeAdminPool(); });

test.describe("Story 20.3 real entity insertion routes — context navigation", () => {
  for (const owner of ["customer", "facility", "contact", "calculation", "job", "quote_version", "quote_acceptance"] as const) {
    test("[P1][AC1,3,5,7] " + owner + " real panel opens exact Documents context and safe return", RED, async ({ page }) => {
      await withSeed(async seed => {
        const created = owner === "quote_version" ? await sentSource(seed, page)
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

  for (const owner of ["calculation", "job"] as const) {
    for (const casing of ["uppercase", "mixed-case"] as const) {
      test("[P1][AC1,2,4,7] " + owner + " " + casing + " entity UUID keeps canonical context entry and return", RED, async ({ page }) => {
        await withSeed(async seed => {
          const ref = source(seed, owner), file = await seedFile(seed, ref, "uuid-case-" + owner);
          // This fixture must actually exercise letter case; numeric-only UUIDs are insufficient evidence.
          expect(ref.ownerId.match(/[a-f]/g)?.length ?? 0).toBeGreaterThan(1);
          let letters = 0;
          const requested = casing === "uppercase" ? ref.ownerId.toUpperCase()
            : ref.ownerId.replace(/[a-f]/g, letter => letters++ % 2 === 0 ? letter.toUpperCase() : letter);
          expect(requested).not.toBe(ref.ownerId);
          if (casing === "mixed-case") expect(requested).not.toBe(ref.ownerId.toUpperCase());
          await signIn(page, seed.base.adminA);
          await page.goto(ref.route.replace(ref.ownerId, requested));
          await expect(page.getByTestId(ref.panelId)).toContainText(file.name);
          const anchor = await entry(page, ref);
          await expect(anchor).toHaveAttribute("href", href(ref));
          await anchor.click();
          await expect(page).toHaveURL(new URL(href(ref), page.url()).href);
          await expect(contextHeading(page)).toHaveText(ref.label);
          await expect(contextReturn(page)).toHaveAttribute("href", ref.returnHref);
          expect(await selectedIdentity(documentRow(page, file.name))).toEqual({ fileId: file.id, linkId: file.linkId });
          await contextReturn(page).click();
          await expect(page).toHaveURL(new URL(ref.returnHref, page.url()).href);
          await expect(page.getByTestId(ref.panelId)).toContainText(file.name);
        });
      });
    }
  }

  test("[P1][AC1,5,7] sent wrapper stays null for draft/empty; no fabricated version panel", RED, async ({ page }) => {
    await withSeed(async seed => {
      await sentSource(seed, page); const ref = source(seed, "quote_version");
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

test.describe("Story 20.3 context authority — context navigation", () => {
  for (const role of ["installer", "salesperson", "finance"] as const) {
    test("[P0][AC1,2,7] " + role + " cannot gain center entry or source labels from query intent", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, source(seed, "customer"), "denied-role");
        await signIn(page, seed.base.notifications[role]);
        await page.goto(source(seed, "customer").route);
        await expect(page.getByRole("link", { name: LINK_NAME, exact: true })).toHaveCount(0);
        await page.goto(href(source(seed, "customer")));
        await expect(page.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible();
        await expect(page.getByTestId("file-index-row")).toHaveCount(0);
        await expect(contextReturn(page)).toHaveCount(0);
        await expect(page.locator("#main-content")).not.toContainText(source(seed, "customer").label);
        await expect(page.locator("#main-content")).not.toContainText(file.name);
      });
    });
  }

  const invalidQueries = [
    "owner-id-only", "duplicate-owner", "duplicate-id", "wrong-module", "unknown-owner",
    "malformed-uuid", "unknown-key", "returnTo", "client-label", "wrong-purpose", "missing-source", "cross-tenant",
  ] as const;
  for (const invalid of invalidQueries) {
    test("[P0][AC2,7] direct " + invalid + " context never exposes results, labels or automatic fallback", ERROR_RED, async ({ page }) => {
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
        await expect(page.locator("#main-content")).not.toContainText(ref.label);
        await expect(page.locator("#main-content")).not.toContainText(seed.foreignLabel);
        await expect(page.locator("#main-content")).not.toContainText(file.name);
        await expect(page).toHaveURL(url => url.pathname === "/files" && url.searchParams.toString() === params.toString());
      });
    });
  }

  for (const owner of ["customer", "facility", "contact", "calculation"] as const) {
    test("[P0][AC1,2,7] " + owner + " source revocation is rechecked even with zero eligible links", ERROR_RED, async ({ page }) => {
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
        await expect(page.locator("#main-content")).not.toContainText(ref.label);
        // Root is a neutral explicit choice; unavailable context never auto-navigates.
        await expect(page).toHaveURL(url => tupleMatches(url, ref));
        await expect(page.getByTestId("documents-context-root")).toHaveAttribute("href", "/files");
        await page.goto(ref.route);
        const hrefs = await page.getByRole("link", { name: LINK_NAME, exact: true }).evaluateAll(elements => elements.map(element => element.getAttribute("href")));
        expect(hrefs.some(value => value !== null && tupleMatches(new URL(value, page.url()), ref))).toBe(false);
      });
    });
  }

  test("[P0][AC2,7] zero-link contact becomes unavailable when live facility ancestry is revoked", ERROR_RED, async ({ page }) => {
    await withSeed(async seed => {
      const ref = source(seed, "contact");
      await signIn(page, seed.base.adminA); await page.goto(href(ref));
      await expect(page.getByTestId("documents-context-empty")).toBeVisible();
      await adminQuery("update public.facilities set archived_at=statement_timestamp() where id=$1", [source(seed, "facility").ownerId]);
      await page.reload();
      await expect(page.getByText(UNAVAILABLE, { exact: true })).toBeVisible();
      await expect(contextReturn(page)).toHaveCount(0);
      await expect(page.locator("#main-content")).not.toContainText(ref.label);
      await expect(page.locator("#main-content")).not.toContainText(source(seed, "facility").label);
    });
  });

  test("[P1][AC2] transient real source lookup failure offers retry and exposes context only after recovery", ERROR_RED, async ({ page }) => {
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
          await expect(page.locator("#main-content")).not.toContainText(ref.label);
        } finally { await session.query("rollback"); }
      });
      await page.getByRole("button", { name: "Försök igen", exact: true }).click();
      await expect(contextHeading(page)).toContainText(ref.label);
      await expect(contextReturn(page)).toHaveAttribute("href", ref.returnHref);
      await expect(page.getByTestId("documents-context-empty")).toBeVisible();
    });
  });
});

test.describe("Story 20.3 exact selected-link and file lifecycle — context navigation", () => {
  test("[P0][AC3,7] one file linked to two sources yields only the exact tuple row and contextual facets", RED, async ({ page }) => {
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
      const signedHref = await download(page).getAttribute("href");
      expect(signedHref).toMatch(/^http:\/\/127\.0\.0\.1:/);
      // Fixture Storage uses octet-stream; verify actual selected bytes rather than
      // assuming Chrome will render that MIME as an HTML text document in a popup.
      const stored = await page.request.get(signedHref!);
      expect(stored.ok()).toBe(true); expect(await stored.body()).toEqual(file.body);
      await page.goto(child.route); await (await entry(page, child)).click();
      expect(await selectedIdentity(documentRow(page, file.name))).toEqual({ fileId: file.id, linkId: otherLink });
      await expect(page.getByTestId("documents-result-count")).toHaveText("2");
      await expect(page.getByTestId("documents-facet-count-ownerType-facility")).toHaveText("2");
      await expect(download(page)).toHaveCount(0);
    });
  });

  test("[P0][AC3,7] selected link revocation cannot refresh through another authorized owner of the same file", ERROR_RED, async ({ page }) => {
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
    test("[P0][AC3,7] contextual " + operation + " still checks ALL file links after alternate source revocation", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, "customer"), child = source(seed, "facility");
        const file = await seedFile(seed, ref, "all-links-" + operation);
        await adminInsertFileLink({ tenant_id: seed.base.tenantA.id, file_id: file.id, owner_type: "facility", owner_id: child.ownerId, purpose: "crm_document" });
        if (operation === "restore") await adminQuery("update public.files set lifecycle_state='archived',archived_at=statement_timestamp() where id=$1", [file.id]);
        await signIn(page, seed.base.adminA); await page.goto(href(ref, { mode: operation === "restore" ? "archived" : "active" }));
        const label = operation === "archive" ? "Arkivera" : "Återställ";
        const action = documentRow(page, file.name).getByRole("button", { name: label, exact: true });
        await hydrated(action);
        if (operation === "archive") { await action.click(); await expect(page.getByRole("dialog")).toBeVisible(); }
        await adminQuery("update public.facilities set archived_at=statement_timestamp() where id=$1", [child.ownerId]);
        const response = actionResponse(page);
        if (operation === "archive") await page.getByRole("dialog").getByRole("button", { name: label, exact: true }).click();
        else await action.click();
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

test.describe("Story 20.3 upload owner continuity — context navigation", () => {
  for (const owner of ["customer", "calculation", "job"] as const) {
    test("[P1][AC5,7] supported " + owner + " picker retains explicit owner choice while exact context is validated", RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, owner), initial = await seedFile(seed, ref, "picker-narrowed-" + owner);
        await signIn(page, seed.base.adminA);
        await page.goto(ref.route); await (await entry(page, ref)).click();
        await page.goto(href(ref, { q: initial.name, purpose: ref.purpose, from: "2020-01-01", to: "2099-12-31", mode: "active" }));
        await expect(documentRow(page, initial.name)).toHaveCount(1);
        expect((await select(page, initial)).ok()).toBe(true); await expect(download(page)).toBeVisible();
        const previousSignedHref = (await download(page).getAttribute("href"))!;
        await preview(page).getByTestId("documents-preview-back").click();
        const form = await openPicker(page);
        await expect(form.getByTestId("file-index-upload-owner")).toHaveValue("");
        await form.getByTestId("file-index-upload-owner-type").selectOption(owner);
        await form.getByTestId("file-index-upload-owner").selectOption(ref.ownerId);
        await expect(form.getByTestId("file-index-upload-owner-type")).toHaveValue(owner);
        await expect(form.getByTestId("file-index-upload-owner")).toHaveValue(ref.ownerId);
        const owners = await form.getByTestId("file-index-upload-owner-type").getByRole("option").evaluateAll(elements => elements.map(element => (element as HTMLOptionElement).value));
        expect(owners).toEqual(["customer", "calculation", "job"]);
        const uploaded = await uploadFromPicker(page, seed, form, ref);
        await expectContextUploadReset(page, ref, previousSignedHref);
        await expect(documentRow(page, uploaded.name)).toHaveCount(1);
        expect(await selectedIdentity(documentRow(page, uploaded.name))).toEqual({ fileId: uploaded.id, linkId: uploaded.linkId });
        await page.reload(); await expect(documentRow(page, uploaded.name)).toHaveCount(1);
        await expectContextUploadReset(page, ref, previousSignedHref);
        expect((await select(page, uploaded)).ok()).toBe(true); await expect(download(page)).toBeVisible();
        const stored = await page.request.get((await download(page).getAttribute("href"))!);
        expect(stored.ok()).toBe(true); expect(await stored.body()).toEqual(uploaded.body);
      });
    });
  }
  test("[P1][AC3,4,5,7] explicitly different picker owner persists without changing original archived context", RED, async ({ page }) => {
    await withSeed(async seed => {
      const original = source(seed, "facility"), chosen = source(seed, "calculation");
      const initial = await seedFile(seed, original, "different-picker-owner");
      await signIn(page, seed.base.adminA);
      await page.goto(href(original, { q: initial.name, purpose: original.purpose, from: "2020-01-01", to: "2099-12-31", mode: "active" }));
      expect((await select(page, initial)).ok()).toBe(true); await expect(download(page)).toBeVisible();
      const previousSignedHref = (await download(page).getAttribute("href"))!;
      await preview(page).getByTestId("documents-preview-back").click();
      await page.getByRole("button", { name: "Arkiverade", exact: true }).click();
      await expect(page).toHaveURL(url => tupleMatches(url, original) && url.searchParams.get("mode") === "archived" && url.searchParams.get("q") === initial.name);
      await expect(page.getByTestId("file-index-empty")).toBeVisible();
      const form = await openPicker(page);
      await expect(form.getByTestId("file-index-upload-owner")).toHaveValue("");
      const uploaded = await uploadFromPicker(page, seed, form, chosen);
      await expectContextUploadReset(page, original, previousSignedHref);
      await expect(documentRow(page, initial.name)).toHaveCount(1);
      await expect(documentRow(page, uploaded.name)).toHaveCount(0);
      await expect(page.getByTestId("documents-result-count")).toHaveText("1");
      await expect(page.getByTestId("documents-facet-count-ownerType-calculation")).toHaveCount(0);
      await page.reload(); await expectContextUploadReset(page, original, previousSignedHref);
      await expect(documentRow(page, uploaded.name)).toHaveCount(0);
      await page.goto(href(chosen)); await expect(documentRow(page, uploaded.name)).toHaveCount(1);
      expect(await selectedIdentity(documentRow(page, uploaded.name))).toEqual({ fileId: uploaded.id, linkId: uploaded.linkId });
      expect((await select(page, uploaded)).ok()).toBe(true); await expect(download(page)).toBeVisible();
      const stored = await page.request.get((await download(page).getAttribute("href"))!);
      expect(stored.ok()).toBe(true); expect(await stored.body()).toEqual(uploaded.body);
    });
  });

  test("[P1][AC3,4,5,7] real contextual continuation upload returns to first page and clears signed preview", RED, async ({ page }) => {
    await withSeed(async seed => {
      const ref = source(seed, "customer"), marker = "picker-cursor-" + crypto.randomUUID();
      for (let index = 0; index < 51; index++) await seedFile(seed, ref, marker + "-" + index);
      await signIn(page, seed.base.adminA);
      await page.goto(href(ref, { q: marker, purpose: ref.purpose, from: "2020-01-01", to: "2099-12-31", mode: "active" }));
      await expect(page.getByTestId("file-index-row")).toHaveCount(50);
      await page.getByTestId("documents-next-page").click();
      await expect(page).toHaveURL(url => tupleMatches(url, ref) && !!url.searchParams.get("cursor") && url.searchParams.get("q") === marker);
      await expect(page.getByTestId("file-index-row")).toHaveCount(1);
      const selected = await selectedIdentity(page.getByTestId("file-index-row"));
      const initial = seed.files.find(file => file.id === selected.fileId)!;
      expect((await select(page, initial)).ok()).toBe(true); await expect(download(page)).toBeVisible();
      const previousSignedHref = (await download(page).getAttribute("href"))!;
      await preview(page).getByTestId("documents-preview-back").click();
      const uploaded = await uploadFromPicker(page, seed, await openPicker(page), ref);
      await expectContextUploadReset(page, ref, previousSignedHref);
      await expect(page.getByTestId("documents-result-count")).toHaveText("52");
      await expect(page.getByTestId("file-index-row")).toHaveCount(50);
      await expect(documentRow(page, uploaded.name)).toHaveCount(1);
      expect(await selectedIdentity(documentRow(page, uploaded.name))).toEqual({ fileId: uploaded.id, linkId: uploaded.linkId });
      await page.reload(); await expectContextUploadReset(page, ref, previousSignedHref);
      await expect(documentRow(page, uploaded.name)).toHaveCount(1);
      expect((await select(page, uploaded)).ok()).toBe(true); await expect(download(page)).toBeVisible();
      const stored = await page.request.get((await download(page).getAttribute("href"))!);
      expect(stored.ok()).toBe(true); expect(await stored.body()).toEqual(uploaded.body);
    });
  });

  for (const owner of ["facility", "contact", "quote_version", "quote_acceptance"] as const) {
    test("[P1][AC5,7] " + owner + " context chooses no generic owner and preserves safe entity upload return", RED, async ({ page }) => {
      await withSeed(async seed => {
        if (owner === "quote_version") await sentSource(seed, page);
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
    test("[P1][AC5,7] safe return preserves real " + owner + " upload authority and exact owner", RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, owner);
        const name = "20.3-return-upload-" + crypto.randomUUID() + ".txt";
        await signIn(page, seed.base.adminA); await page.goto(ref.route);
        await (await entry(page, ref)).click();
        let evidenceAccess: { href: string; bytes: Buffer } | null = null;
        if (owner === "quote_acceptance") {
          const evidence = page.getByTestId("file-index-row").filter({ has: page.locator('input[name="file_id"][value="' + seed.base.acceptedAcceptance.evidenceFileId + '"]') });
          const open = evidence.getByRole("button", { name: "Förhandsvisa", exact: true });
          await hydrated(open); const reply = actionResponse(page); await open.click();
          expect((await reply).ok()).toBe(true); await expect(download(page)).toBeVisible();
          const signedHref = await download(page).getAttribute("href");
          const stored = await page.request.get(signedHref!); expect(stored.ok()).toBe(true);
          evidenceAccess = { href: signedHref!, bytes: await stored.body() };
        }
        await contextReturn(page).click();
        try {
          const panel = page.getByTestId(ref.panelId);
          const submit = panel.getByRole("button", { name: "Ladda upp fil", exact: true });
          await hydrated(submit);
          await panel.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from("owner-preserved entity upload") });
          const original = owner === "quote_acceptance" ? await adminQuery(
            "select to_jsonb(a) as acceptance,to_jsonb(l) as link,to_jsonb(f) as file from public.quote_acceptances a join public.file_links l on l.owner_type='quote_acceptance' and l.owner_id=a.id join public.files f on f.id=l.file_id where a.id=$1", [ref.ownerId]) : null;
          const originalObject = owner === "quote_acceptance" ? await adminQuery<{ name: string; metadata: unknown }>(
            "select o.name,o.metadata from storage.objects o join public.files f on f.object_path=o.name and f.bucket_id=o.bucket_id where f.id=$1", [seed.base.acceptedAcceptance.evidenceFileId]) : null;
          const originalUploadAudit = owner === "quote_acceptance" ? await adminQuery(
            "select id from public.audit_events where command='file.upload' and target_id in (select file_id from public.file_links where owner_type='quote_acceptance' and owner_id=$1) order by id", [ref.ownerId]) : null;
          await submit.click();
          if (owner === "quote_acceptance") {
            // Registered evidence is immutable under the existing 10.8 AR704 guard.
            // The retained form's real command may write a fresh orphan object before
            // the atomic metadata/link wrapper fails; it must never append evidence.
            await expect(panel.getByRole("alert")).toContainText("Uppladdningen kunde inte slutföras just nu.");
            await expect(panel.getByRole("status")).toHaveCount(0);
            expect(await adminQuery("select id from public.files where tenant_id=$1 and display_name=$2", [seed.base.tenantA.id, name])).toHaveLength(0);
            const current = await adminQuery(
              "select to_jsonb(a) as acceptance,to_jsonb(l) as link,to_jsonb(f) as file from public.quote_acceptances a join public.file_links l on l.owner_type='quote_acceptance' and l.owner_id=a.id join public.files f on f.id=l.file_id where a.id=$1", [ref.ownerId]);
            expect(current).toEqual(original);
            expect(await adminQuery(
              "select o.name,o.metadata from storage.objects o join public.files f on f.object_path=o.name and f.bucket_id=o.bucket_id where f.id=$1", [seed.base.acceptedAcceptance.evidenceFileId])).toEqual(originalObject);
            expect(await adminQuery("select id from public.audit_events where command='file.upload' and target_id in (select file_id from public.file_links where owner_type='quote_acceptance' and owner_id=$1) order by id", [ref.ownerId])).toEqual(originalUploadAudit);
            const stored = await page.request.get(evidenceAccess!.href);
            expect(stored.ok()).toBe(true); expect(await stored.body()).toEqual(evidenceAccess!.bytes);
            await page.reload(); await expect(panel).not.toContainText(name);
            await (await entry(page, ref)).click(); await expect(documentRow(page, name)).toHaveCount(0);
            return;
          }
          await expect(panel.getByRole("status")).toContainText("Filen laddades upp.");
          await page.reload(); await expect(panel).toContainText(name);
          const rows = await adminQuery<{ id: string; object_path: string; owner_type: string; owner_id: string; is_locked: boolean }>(
            "select f.id,f.object_path,l.owner_type,l.owner_id,l.is_locked from public.files f join public.file_links l on l.file_id=f.id where f.tenant_id=$1 and f.display_name=$2",
            [seed.base.tenantA.id, name]);
          expect(rows).toHaveLength(1);
          expect(rows[0]).toMatchObject({ owner_type: owner, owner_id: ref.ownerId, is_locked: false });
          await (await entry(page, ref)).click(); await expect(documentRow(page, name)).toHaveCount(1);
        } finally {
          // Track even a partially successful upload for withSeed's exact-ID cleanup.
          const uploaded = await adminQuery<{ id: string; object_path: string }>("select id,object_path from public.files where tenant_id=$1 and display_name=$2", [seed.base.tenantA.id, name]);
          for (const file of uploaded) seed.files.push({ id: file.id, linkId: "", name, objectPath: file.object_path, body: Buffer.alloc(0) });
          // Exact unique synthetic filename identifies the existing upload helper's
          // retained orphan, if metadata failed; cleanup never touches shared evidence.
          const orphanObjects = await adminQuery<{ name: string }>(
            "select name from storage.objects where bucket_id='tenant-files' and split_part(name,'/',1)=$1 and split_part(name,'/',3)=$2", [seed.base.tenantA.id, name]);
          for (const object of orphanObjects) if (!seed.files.some(file => file.objectPath === object.name)) seed.files.push({
            id: object.name.split("/")[1], linkId: "", name, objectPath: object.name, body: Buffer.alloc(0) });
        }
      });
    });
  }
});

for (const viewport of [{ name: "desktop", width: 1280, height: 800 }, { name: "phone", width: 360, height: 640 }]) {
  test.describe("Story 20.3 history and focus — " + viewport.name + " context navigation", () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    test("[P1][AC4,7] keyboard entity-center-history-safe return keeps filters and clears selected capability", RED, async ({ page }) => {
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
        const expectedEntityHref = new URL(ref.route, page.url()).href;
        await test.info().attach("exact-context-history-before-back", {
          body: Buffer.from(JSON.stringify({ viewport: viewport.name, expectedEntityHref, sourceOwnerId: ref.ownerId,
            centerHref: page.url(), historyLength: await page.evaluate(() => window.history.length) })), contentType: "application/json" });
        await page.goBack({ waitUntil: "commit" });
        await test.info().attach("exact-context-history-after-back", {
          body: Buffer.from(JSON.stringify({ expectedEntityHref, actualEntityHref: page.url(),
            historyLength: await page.evaluate(() => window.history.length) })), contentType: "application/json" });
        await expect(page).toHaveURL(expectedEntityHref);
        await expect(page.getByTestId(ref.panelId)).toBeVisible();
        await page.goForward({ waitUntil: "commit" });
        await expect(page).toHaveURL(url => tupleMatches(url, ref) && url.searchParams.get("q") === file.name);
        await expect(search).toHaveValue(file.name); await expect(download(page)).toHaveCount(0);
        const back = contextReturn(page); await expect(back).toHaveAttribute("href", ref.returnHref);
        await back.scrollIntoViewIfNeeded(); await back.focus(); await expect(back).toBeFocused(); await expect(back).toBeInViewport();
        await expect(contextHeading(page)).toContainText(ref.label); await expect(back).toContainText(ref.label);
        await attachContextRelationshipState(page);
        await back.press("Enter"); await expect(page).toHaveURL(url => url.pathname === ref.returnHref);
        await expect(page.getByTestId(ref.panelId)).toBeVisible();
      });
    });
    test("[P1][AC3,4,7] filter change and a different context clear stale signed preview while controls stay reachable", RED, async ({ page }) => {
      await withSeed(async seed => {
        const ref = source(seed, "customer"), other = source(seed, "facility");
        const file = await seedFile(seed, ref, "stale-preview");
        await seedFile(seed, other, "next-context");
        await signIn(page, seed.base.adminA); await page.goto(href(ref));
        expect((await select(page, file)).ok()).toBe(true); await expect(download(page)).toBeVisible();
        const signedUrl = await download(page).getAttribute("href");
        expect(signedUrl).toMatch(/^https?:\/\//);
        await preview(page).getByTestId("documents-preview-back").click();
        const search = page.getByLabel("Sök dokument", { exact: true }); await hydrated(search); await search.fill("absent-" + crypto.randomUUID());
        await expect(download(page)).toHaveCount(0); await expect(search).toBeFocused();
        await expect(page.getByTestId("file-index-empty")).toBeVisible();
        await page.goto(other.route); await (await entry(page, other)).click();
        await expect(contextHeading(page)).toContainText(other.label); await expect(download(page)).toHaveCount(0);
        expect(await page.locator("#main-content").evaluate((element, value) => [...element.querySelectorAll("a")].some(anchor => anchor.href === value), signedUrl)).toBe(false);
        await contextReturn(page).scrollIntoViewIfNeeded(); await expect(contextReturn(page)).toBeInViewport();
        await search.scrollIntoViewIfNeeded(); await expect(search).toBeInViewport();
      });
    });
  });
}
