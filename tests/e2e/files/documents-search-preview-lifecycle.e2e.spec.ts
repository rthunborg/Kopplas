/** Story 20.2 ATDD RED; activate skips after implementation and selector verification.
 * Spec pin 5b1ef70a7323f4a0878db8b26ca5ce428bd73de130d64d169c3207dc45e391e8.
 * No oracle/runtime observations. Existing row/upload IDs are source-derived.
 * PROPOSED new IDs: documents-preview-pane/loading/back, documents-filter-error,
 * documents-result-count, documents-facet-count-*, documents-lifecycle-pending/success/error.
 * Approved Swedish filter/action labels; pane image alt=file name, dialog role and
 * lifecycle success copy are bounded proposed UX contracts, unverified in a browser.
 * playwright-utils flag=true, package absent: two-gate mandate inactive. Keep the
 * guarded fixture and vanilla real Next action transport; recommend TEA framework separately.
 * No setup at module load or beforeEach: collecting skipped tests contacts no services.
 */
import type { Locator, Page, Request, Response, APIResponse } from "@playwright/test";
import { test, expect } from "../dashboard/guarded-test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { PDFDocument } from "pdf-lib";
import { adminQuery, adminSession, closeAdminPool } from "../../factories/admin-sql";
import { adminInsertCustomer, adminInsertFile, adminInsertFileLink, adminUploadStorageObject, adminRemoveStorageObject } from "../../factories/tenants";

type Fixture = { tenantA: { id: string }; adminA: { id: string; email: string; password: string }; crm: { fileName: string } };
type File = { fileId: string; linkId: string; name: string; objectPath: string; body: Buffer };
type Seed = { base: Fixture; ownerId: string; hiddenOwnerId: string; files: File[]; customers: string[] };
const RED = { annotation: [{ type: "atdd-red", description: "Activate after Story 20.2 UI/checked lifecycle lands and proposed selectors are verified" }] };
const ERROR_RED = { annotation: [...RED.annotation, { type: "skipNetworkMonitoring", description: "Transport failure/current-source denial is the subject" }] };
const FILES_ROUTE = /\/files(?:\?.*)?$/;
const PNG = Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+a3r0AAAAASUVORK5CYII=", "base64");
const fixture = (): Fixture => JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
const row = (page: Page, name: string) => page.getByTestId("file-index-row").filter({ hasText: name });
const pane = (page: Page) => page.getByTestId("documents-preview-pane");
const downloadLink = (page: Page) => pane(page).getByRole("link", { name: "Ladda ned", exact: true });
const isAction = (request: Request) => new URL(request.url()).pathname === "/files" && request.method() === "POST" && !!request.headers()["next-action"];
const actionResponse = (page: Page) => page.waitForResponse(response => isAction(response.request()));
async function hydrated(control: Locator): Promise<void> {
  await control.waitFor({ state: "visible" });
  await control.evaluate(element => new Promise<void>(resolve => {
    const tick = () => Object.keys(element).some(key => key.startsWith("__react")) ? resolve() : requestAnimationFrame(tick); tick();
  }));
}
async function signIn(page: Page): Promise<void> {
  const credentials = fixture().adminA; await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true }); await hydrated(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password); await submit.click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
async function open(page: Page, query: Record<string, string> = {}): Promise<void> {
  await signIn(page); await page.goto(`/files?${new URLSearchParams(query)}`);
}
async function select(page: Page, name: string): Promise<Response> {
  const control = row(page, name).getByRole("button", { name: "Förhandsvisa", exact: true }); await hydrated(control);
  const response = actionResponse(page); await control.click(); return response;
}
function signal() { let resolve!: () => void; return { promise: new Promise<void>(done => { resolve = done; }), release: () => resolve() }; }
/** Gate one real action; after-mode forwards the exact fetched RSC response. */
async function gateAction(page: Page, mode: "before" | "after" = "before") {
  const started = signal(); const release = signal(); const finished = signal(); let captured = false;
  await page.route(FILES_ROUTE, async route => {
    if (captured || !isAction(route.request())) { await route.continue(); return; }
    captured = true;
    try {
      let response: APIResponse | undefined; if (mode === "after") response = await route.fetch();
      started.release(); await release.promise;
      if (response) await route.fulfill({ response }); else await route.continue();
    } finally { finished.release(); }
  });
  return { started: started.promise, release: release.release, dispose: async () => { release.release(); if (captured) await finished.promise; await page.unroute(FILES_ROUTE); } };
}
async function seedFile(seed: Seed, name: string, mime: string, body: Buffer = PNG, lifecycle: "linked" | "archived" = "linked", artifact: "quote_pdf" | null = null): Promise<File> {
  const fileId = crypto.randomUUID(); const objectPath = `${seed.base.tenantA.id}/${fileId}/${name}`;
  const file = { fileId, linkId: "", name, objectPath, body }; seed.files.push(file);
  await adminUploadStorageObject({ bucket: "tenant-files", objectPath, body });
  await adminInsertFile({ tenant_id: seed.base.tenantA.id, id: fileId, display_name: name, mime_type: mime, object_path: objectPath, size_bytes: body.length, lifecycle_state: lifecycle, artifact_kind: artifact });
  file.linkId = await adminInsertFileLink({ tenant_id: seed.base.tenantA.id, file_id: fileId, owner_type: "customer", owner_id: seed.ownerId, purpose: "crm_document" }); return file;
}
/** Local factories only; unique test-owned rows/objects cleaned without touching shared fixture. */
async function withSeed(run: (seed: Seed) => Promise<void>): Promise<void> {
  const seed: Seed = { base: fixture(), ownerId: "", hiddenOwnerId: "", files: [], customers: [] };
  try {
    seed.ownerId = await adminInsertCustomer({ tenant_id: seed.base.tenantA.id, customer_type: "company", display_name: `20.2-visible-${crypto.randomUUID()}` }); seed.customers.push(seed.ownerId);
    seed.hiddenOwnerId = await adminInsertCustomer({ tenant_id: seed.base.tenantA.id, customer_type: "company", display_name: `20.2-hidden-${crypto.randomUUID()}` }); seed.customers.push(seed.hiddenOwnerId);
    await run(seed);
  } finally {
    const ids = seed.files.map(file => file.fileId);
    if (ids.length) await adminSession(async session => {
      // Established core.ts synthetic-fixture teardown: transaction-local bypass
      // only for newly created IDs, after all subject assertions. No guard weakened.
      await session.query("begin");
      try {
        await session.query("set local session_replication_role = replica");
        await session.query("delete from public.audit_events where target_type='file' and target_id=any($1::uuid[])", [ids]);
        await session.query("delete from public.file_links where file_id=any($1::uuid[])", [ids]);
        await session.query("delete from public.files where id=any($1::uuid[])", [ids]);
        await session.query("commit");
      } catch (error) { await session.query("rollback"); throw error; }
    });
    for (const file of seed.files) await adminRemoveStorageObject({ bucket: "tenant-files", objectPath: file.objectPath });
    if (seed.customers.length) await adminQuery("delete from public.customers where id=any($1::uuid[])", [seed.customers]);
  }
}
const state = async (id: string) => (await adminQuery<{ lifecycle_state: string; archive_previous_state: string | null; archived_at: Date | null; object_path: string }>("select lifecycle_state,archive_previous_state,archived_at,object_path from public.files where id=$1", [id]))[0];
const audits = (id: string) => adminQuery("select command,event_type,actor_user_id,target_type,target_id from public.audit_events where target_id=$1 and command in ('document.archive','document.restore') order by created_at,id", [id]);
const links = (id: string) => adminQuery("select id,file_id,owner_type,owner_id,purpose,is_locked,locked_at,archived_at from public.file_links where file_id=$1 order by id", [id]);
async function confirmArchive(page: Page, name: string): Promise<Response> {
  await row(page, name).getByRole("button", { name: "Arkivera", exact: true }).click();
  const dialog = page.getByRole("dialog");
  const response = actionResponse(page); await dialog.getByRole("button", { name: "Arkivera", exact: true }).click(); return response;
}
test.afterAll(async () => { await closeAdminPool(); });
for (const viewport of [{ name: "desktop", width: 1280, height: 800 }, { name: "connected phone", width: 360, height: 640 }]) {
  test.describe(`Documents 20.2 ATDD RED — ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });
    // RED: activate after normalized URL filters/facets/date/mode read lands.
    test.skip("[P1][AC1,8] combined filters retain literal search and honest authorized facets", RED, async ({ page }) => {
      await withSeed(async seed => {
        const marker = `20.2-${crypto.randomUUID()}`;
        const included = await seedFile(seed, `${marker}%_[a].png`, "image/png");
        const outside = await seedFile(seed, `${marker}-outside.png`, "image/png");
        const denied = await seedFile(seed, `${marker}-hidden.png`, "image/png");
        await adminQuery("update public.file_links set created_at=$2 where id=$1", [included.linkId, "2026-10-24T22:30:00Z"]);
        await adminQuery("update public.file_links set created_at=$2 where id=$1", [outside.linkId, "2026-10-25T23:30:00Z"]);
        await adminQuery("update public.file_links set owner_id=$2 where id=$1", [denied.linkId, seed.hiddenOwnerId]);
        await adminQuery("update public.file_links set created_at=$2 where id=$1", [denied.linkId, "2026-10-24T22:40:00Z"]);
        await adminQuery("update public.customers set archived_at=statement_timestamp() where id=$1", [seed.hiddenOwnerId]);
        await open(page, { q: marker, module: "crm", ownerType: "customer", purpose: "crm_document", from: "2026-10-25", to: "2026-10-25", mode: "active" });
        await expect(row(page, included.name)).toHaveCount(1); await expect(row(page, outside.name)).toHaveCount(0); await expect(row(page, denied.name)).toHaveCount(0);
        await expect(page.getByTestId("documents-result-count")).toHaveText("1");
        await expect(page.getByTestId("documents-facet-count-module-crm")).toHaveText("1");
        await expect(page.getByTestId("documents-facet-count-ownerType-customer")).toHaveText("1");
        await expect(page.getByTestId("documents-facet-count-purpose-crm_document")).toHaveText("1");
        await expect(page.getByLabel("Från", { exact: true })).toHaveValue("2026-10-25"); await expect(page.getByLabel("Till", { exact: true })).toHaveValue("2026-10-25");
        const search = page.getByLabel("Sök dokument", { exact: true }); await hydrated(search); await search.fill(`  ${marker.toUpperCase()}%_[A]  `);
        await expect(page).toHaveURL(url => url.searchParams.get("q")?.toLowerCase() === `${marker}%_[a]`); await expect(row(page, included.name)).toHaveCount(1);
        await search.fill("image/png"); await expect(row(page, included.name)).toHaveCount(1);
        await search.fill(`not-present-${crypto.randomUUID()}`); await expect(page.getByTestId("file-index-empty")).toBeVisible();
        await expect(page.getByTestId("documents-result-count")).toHaveText("0");
        await expect(page.getByLabel("Modul", { exact: true })).toHaveValue("crm"); await expect(page.getByLabel("Typ", { exact: true })).toHaveValue("customer"); await expect(page.getByLabel("Syfte", { exact: true })).toHaveValue("crm_document");
        await expect(page.getByTestId("file-index-error")).toHaveCount(0);
      });
    });
    for (const invalid of [
      { name: "duplicated query", query: "q=a&q=b" }, { name: "unknown mode", query: "mode=all" },
      { name: "reversed date range", query: "from=2026-10-25&to=2026-10-24" }, { name: "impossible date", query: "from=2026-02-30" },
      { name: "pending module", query: "module=ai" },
    ]) {
      // RED: activate after validation replaces 20.1 scalar-first query parsing.
      test.skip(`[P0][AC1,8] ${invalid.name} validates instead of showing an unfiltered list`, RED, async ({ page }) => {
        await signIn(page); await page.goto(`/files?${invalid.query}`);
        await expect(page.getByTestId("documents-filter-error").getByRole("alert")).toBeVisible();
        await expect(page.getByTestId("file-index-row")).toHaveCount(0); await expect(page.getByTestId("documents-result-count")).toHaveCount(0);
        await expect(page.getByTestId("documents-next-page")).toHaveCount(0); await expect(page.getByRole("main")).not.toContainText(fixture().crm.fileName);
      });
    }
    // RED: activate after filter-bound complete pagination lands.
    test.skip("[P1][AC1,8] fifty-row continuation retains normalized filters without duplicates", RED, async ({ page }) => {
      await withSeed(async seed => {
        const marker = `20.2-pages-${crypto.randomUUID()}`;
        for (let i = 0; i < 51; i++) { const file = await seedFile(seed, `${marker}-${i.toString().padStart(2, "0")}.png`, "image/png"); await adminQuery("update public.file_links set created_at=$2 where id=$1", [file.linkId, new Date(Date.UTC(2026, 9, 25, 10, 0, 51 - i)).toISOString()]); }
        const filters = { q: marker, module: "crm", ownerType: "customer", purpose: "crm_document", from: "2026-10-25", to: "2026-10-25", mode: "active" };
        await open(page, filters); await expect(page.getByTestId("file-index-row")).toHaveCount(50); await expect(row(page, seed.files[0].name)).toHaveCount(1);
        await page.getByTestId("documents-next-page").click();
        await expect(page).toHaveURL(url => !!url.searchParams.get("cursor") && Object.entries(filters).every(([key, value]) => url.searchParams.get(key) === value));
        await expect(page.getByTestId("file-index-row")).toHaveCount(1); await expect(row(page, seed.files[50].name)).toHaveCount(1); await expect(row(page, seed.files[0].name)).toHaveCount(0);
        await expect(page.getByTestId("documents-next-page")).toHaveCount(0); await page.getByLabel("Sök dokument", { exact: true }).fill(seed.files[0].name);
        await expect(page).toHaveURL(url => !url.searchParams.has("cursor") && url.searchParams.get("q") === seed.files[0].name); await expect(row(page, seed.files[0].name)).toHaveCount(1);
      });
    });
    // RED: activate after latest-selection-safe pane and supported image rendering land.
    test.skip("[P0][AC2,8] delayed signed response cannot replace a newer selected image", RED, async ({ page }) => {
      await withSeed(async seed => {
        const a = await seedFile(seed, `20.2-A-${crypto.randomUUID()}.png`, "image/png"); const b = await seedFile(seed, `20.2-B-${crypto.randomUUID()}.png`, "image/png");
        await open(page); const gate = await gateAction(page, "after");
        let nextGate: Awaited<ReturnType<typeof gateAction>> | undefined;
        try {
          const first = select(page, a.name); await gate.started;
          await expect(pane(page).getByTestId("documents-preview-loading")).toBeVisible(); await expect(downloadLink(page)).toHaveCount(0);
          nextGate = await gateAction(page);
          const second = select(page, b.name);
          // Next actions may queue: selection must change immediately even when
          // B's server request cannot start before delayed A is delivered.
          await expect(pane(page)).toContainText(b.name);
          await expect(downloadLink(page)).toHaveCount(0);
          gate.release(); expect((await first).ok()).toBe(true); await nextGate.started;
          await expect(pane(page)).not.toContainText(a.name);
          await expect(downloadLink(page)).toHaveCount(0);
          await expect(pane(page).getByRole("img", { name: a.name, exact: true })).toHaveCount(0);
          nextGate.release(); expect((await second).ok()).toBe(true);
          const image = pane(page).getByRole("img", { name: b.name, exact: true }); await expect(image).toBeVisible();
          await expect.poll(() => image.evaluate((element: HTMLImageElement) => element.complete && element.naturalWidth)).toBe(1);
          const selectedHref = await downloadLink(page).getAttribute("href"); expect(selectedHref).toMatch(/^https?:\/\//);
          await expect(downloadLink(page)).toHaveAttribute("href", selectedHref!); await expect(pane(page)).not.toContainText(a.name);
          const bytes = await page.request.get(selectedHref!); expect(bytes.ok()).toBe(true); expect(await bytes.body()).toEqual(b.body);
        } finally { if (nextGate) await nextGate.dispose(); await gate.dispose(); }
      });
    });
    // RED: activate after filter/mode reset discards previous URLs and old requests immediately.
    test.skip("[P0][AC2,8] filter and mode changes clear prior URL content and error", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-reset-${crypto.randomUUID()}.png`, "image/png"); await open(page);
        expect((await select(page, file.name)).ok()).toBe(true); await expect(downloadLink(page)).toBeVisible();
        const gate = await gateAction(page, "after");
        try {
          const response = actionResponse(page); await pane(page).getByRole("button", { name: "Förnya åtkomst", exact: true }).click(); await gate.started;
          await page.getByLabel("Sök dokument", { exact: true }).fill(`absent-${crypto.randomUUID()}`);
          await expect(downloadLink(page)).toHaveCount(0); await expect(pane(page).getByRole("img")).toHaveCount(0); await expect(pane(page).getByRole("alert")).toHaveCount(0);
          gate.release(); expect((await response).ok()).toBe(true); await expect(page.getByTestId("file-index-empty")).toBeVisible(); await expect(downloadLink(page)).toHaveCount(0);
          await page.getByRole("button", { name: "Arkiverade", exact: true }).click();
          await expect(page).toHaveURL(url => url.searchParams.get("mode") === "archived"); await expect(downloadLink(page)).toHaveCount(0);
        } finally { await gate.dispose(); }
      });
    });
    // RED: activate after explicit expiry/renewal pane contract lands.
    test.skip("[P1][AC2,8] expiry removes bearer access until explicit fresh checked renewal", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-expiry-${crypto.randomUUID()}.png`, "image/png"); await open(page); await page.clock.install({ time: new Date() });
        expect((await select(page, file.name)).ok()).toBe(true); await expect(downloadLink(page)).toBeVisible(); await page.clock.fastForward(86_401_000);
        await expect(pane(page).getByText("Åtkomsten har gått ut", { exact: true })).toBeVisible(); await expect(downloadLink(page)).toHaveCount(0); await expect(pane(page).getByRole("img")).toHaveCount(0);
        const renewal = pane(page).getByRole("button", { name: "Förnya åtkomst", exact: true }); await renewal.focus(); await expect(renewal).toBeFocused(); await page.clock.setFixedTime(new Date());
        const response = actionResponse(page); await renewal.press("Enter"); expect((await response).ok()).toBe(true); await expect(downloadLink(page)).toBeVisible();
        const href = await downloadLink(page).getAttribute("href"); expect(href).toMatch(/^https?:\/\//);
        const bytes = await page.request.get(href!); expect(bytes.ok()).toBe(true); expect(await bytes.body()).toEqual(file.body);
      });
    });
    // RED: activate after supported PDF embedding and authorized download land.
    test.skip("[P1][AC2,8] ordinary PDF preview uses fresh authorized PDF bytes", RED, async ({ page }) => {
      await withSeed(async seed => {
        const pdf = await PDFDocument.create(); pdf.addPage().drawText("20.2 authorized ordinary PDF");
        const body = Buffer.from(await pdf.save()); const name = `20.2-pdf-${crypto.randomUUID()}.pdf`;
        await open(page); await page.getByRole("button", { name: "Ladda upp fil", exact: true }).first().click();
        const form = page.getByTestId("file-index-upload-form");
        await form.getByTestId("file-index-upload-owner-type").selectOption("customer");
        await form.getByTestId("file-index-upload-owner").selectOption(seed.ownerId);
        await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "application/pdf", buffer: body });
        const uploaded = actionResponse(page); await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
        expect((await uploaded).ok()).toBe(true);
        const [persisted] = await adminQuery<{ id: string; object_path: string }>("select id,object_path from public.files where tenant_id=$1 and display_name=$2", [seed.base.tenantA.id, name]);
        expect(persisted).toBeDefined(); seed.files.push({ fileId: persisted.id, objectPath: persisted.object_path, linkId: "", name, body });
        await expect(row(page, name)).toHaveCount(1); expect((await select(page, name)).ok()).toBe(true);
        // PROPOSED accessible title for established PDF embedding; verify when activated.
        const embedded = pane(page).getByTitle(name, { exact: true }); await expect(embedded).toBeVisible();
        const href = await downloadLink(page).getAttribute("href"); expect(href).toMatch(/^https?:\/\//);
        await expect(embedded).toHaveAttribute("src", href!);
        const actual = await page.request.get(href!); expect(actual.ok()).toBe(true);
        expect(actual.headers()["content-type"]).toContain("application/pdf"); expect(await actual.body()).toEqual(body);
      });
    });
    // RED: activate after unsupported-format download fallback lands.
    test.skip("[P1][AC2,8] unsupported format downloads actual authorized stored bytes", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-download-${crypto.randomUUID()}.doc`, "application/msword", Buffer.from("20.2 authorized download bytes")); await open(page);
        expect((await select(page, file.name)).ok()).toBe(true); await expect(pane(page).getByRole("img")).toHaveCount(0); await expect(downloadLink(page)).toBeVisible();
        const downloading = page.waitForEvent("download"); await downloadLink(page).click(); const downloaded = await downloading;
        expect(await downloaded.failure()).toBeNull(); expect(downloaded.suggestedFilename()).toBe(file.name);
        const location = await downloaded.path(); expect(location).not.toBeNull(); expect(readFileSync(location!)).toEqual(file.body);
      });
    });
    // RED: activate after neutral current-source denial clears a previously successful pane.
    test.skip("[P0][AC2,3,8] now-ineligible selected source denies renewal without stale URL or hidden identity", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-denial-${crypto.randomUUID()}.png`, "image/png"); await open(page);
        expect((await select(page, file.name)).ok()).toBe(true); await expect(downloadLink(page)).toBeVisible();
        await adminQuery("update public.customers set archived_at=statement_timestamp() where id=$1", [seed.ownerId]);
        const response = actionResponse(page); await pane(page).getByRole("button", { name: "Förnya åtkomst", exact: true }).click(); expect((await response).ok()).toBe(true);
        await expect(pane(page).getByRole("alert")).toContainText("Dokumentet är inte tillgängligt"); await expect(pane(page).getByRole("alert")).not.toContainText(/object_path|bucket_id|hittades inte|finns inte/i);
        await expect(downloadLink(page)).toHaveCount(0); await expect(pane(page).getByRole("img")).toHaveCount(0);
      });
    });
    // RED: activate after action-transport failure has explicit retry and clears old content.
    test.skip("[P1][AC2,8] transient failure clears previous preview and retries only explicitly", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-retry-${crypto.randomUUID()}.png`, "image/png"); await open(page);
        expect((await select(page, file.name)).ok()).toBe(true); await expect(downloadLink(page)).toBeVisible(); let attempts = 0;
        await page.route(FILES_ROUTE, async route => { if (isAction(route.request())) { attempts++; await route.abort("failed"); } else await route.continue(); });
        try {
          await pane(page).getByRole("button", { name: "Förnya åtkomst", exact: true }).click(); await expect(pane(page).getByRole("button", { name: "Försök igen", exact: true })).toBeVisible();
          await expect(downloadLink(page)).toHaveCount(0); await expect(pane(page).getByRole("img")).toHaveCount(0);
          await page.clock.install({ time: new Date() }); await page.clock.runFor(10_000); expect(attempts).toBe(1);
        } finally { await page.unroute(FILES_ROUTE); }
        const response = actionResponse(page); await pane(page).getByRole("button", { name: "Försök igen", exact: true }).click(); expect((await response).ok()).toBe(true); await expect(downloadLink(page)).toBeVisible();
      });
    });
    // RED: activate after confirmation, checked archive pending/success and metadata-only mode.
    test.skip("[P0][AC2,4,8] archive confirms all-link effect and waits for checked persistence", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-archive-${crypto.randomUUID()}.png`, "image/png"); const originalLinks = await links(file.fileId);
        await open(page); expect((await select(page, file.name)).ok()).toBe(true); await expect(downloadLink(page)).toBeVisible();
        await row(page, file.name).getByRole("button", { name: "Arkivera", exact: true }).click();
        const dialog = page.getByRole("dialog"); await expect(dialog).toContainText("Filen arkiveras för alla sina kopplingar"); await expect(dialog).not.toContainText(seed.hiddenOwnerId);
        const gate = await gateAction(page);
        try {
          const response = actionResponse(page); await dialog.getByRole("button", { name: "Arkivera", exact: true }).click(); await gate.started;
          await expect(page.getByTestId("documents-lifecycle-pending")).toBeVisible(); await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0);
          expect((await state(file.fileId)).lifecycle_state).toBe("linked"); expect(await audits(file.fileId)).toHaveLength(0);
          gate.release(); expect((await response).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Arkiverad");
          expect(await state(file.fileId)).toMatchObject({ lifecycle_state: "archived", archive_previous_state: "linked", object_path: file.objectPath }); expect(await links(file.fileId)).toEqual(originalLinks);
          expect(await audits(file.fileId)).toEqual([expect.objectContaining({ command: "document.archive", event_type: "file.archived", actor_user_id: seed.base.adminA.id, target_type: "file", target_id: file.fileId })]);
          await expect(downloadLink(page)).toHaveCount(0); await page.reload(); await expect(row(page, file.name)).toHaveCount(0);
          await page.getByRole("button", { name: "Arkiverade", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(1);
          await expect(row(page, file.name).getByRole("button", { name: "Förhandsvisa", exact: true })).toHaveCount(0);
          await expect(row(page, file.name).getByRole("link", { name: "Ladda ned", exact: true })).toHaveCount(0); await expect(downloadLink(page)).toHaveCount(0);
        } finally { await gate.dispose(); }
      });
    });
    // RED: activate after checked whole-graph denial despite an earlier enabled hint.
    test.skip("[P0][AC3,8] hidden now-ineligible context denies whole archive without identity or audit", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-all-links-${crypto.randomUUID()}.png`, "image/png");
        await adminInsertFileLink({ tenant_id: seed.base.tenantA.id, file_id: file.fileId, owner_type: "customer", owner_id: seed.hiddenOwnerId, purpose: "crm_document" });
        await open(page, { q: file.name }); await row(page, file.name).filter({ hasText: "20.2-visible" }).getByRole("button", { name: "Arkivera", exact: true }).click();
        await adminQuery("update public.customers set archived_at=statement_timestamp() where id=$1", [seed.hiddenOwnerId]);
        const response = actionResponse(page); await page.getByRole("dialog").getByRole("button", { name: "Arkivera", exact: true }).click(); expect((await response).ok()).toBe(true);
        await expect(page.getByTestId("documents-lifecycle-error").getByRole("alert")).toBeVisible();
        await expect(page.getByTestId("documents-lifecycle-error")).not.toContainText(seed.hiddenOwnerId); await expect(page.getByTestId("documents-lifecycle-error")).not.toContainText("20.2-hidden");
        await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0); expect((await state(file.fileId)).lifecycle_state).toBe("linked"); expect(await audits(file.fileId)).toHaveLength(0);
      });
    });
    // RED: activate after restore provenance/pending and fresh active signing land.
    test.skip("[P0][AC2,4,5,8] ordinary restore preserves identity bytes links and needs fresh active signing", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-restore-${crypto.randomUUID()}.png`, "image/png"); const originalLinks = await links(file.fileId);
        await open(page); expect((await confirmArchive(page, file.name)).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toBeVisible();
        await page.getByRole("button", { name: "Arkiverade", exact: true }).click(); const gate = await gateAction(page);
        try {
          const response = actionResponse(page); await row(page, file.name).getByRole("button", { name: "Återställ", exact: true }).click(); await gate.started;
          await expect(page.getByTestId("documents-lifecycle-pending")).toBeVisible(); await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0); expect((await state(file.fileId)).lifecycle_state).toBe("archived");
          gate.release(); expect((await response).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Återställd");
          expect(await state(file.fileId)).toMatchObject({ lifecycle_state: "linked", archived_at: null, object_path: file.objectPath }); expect(await links(file.fileId)).toEqual(originalLinks);
          expect(await audits(file.fileId)).toEqual([expect.objectContaining({ command: "document.archive", event_type: "file.archived" }), expect.objectContaining({ command: "document.restore", event_type: "file.restored", actor_user_id: seed.base.adminA.id })]);
          await expect(downloadLink(page)).toHaveCount(0); await page.reload(); await page.getByRole("button", { name: "Aktiva", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(1);
          expect((await select(page, file.name)).ok()).toBe(true); const href = await downloadLink(page).getAttribute("href"); expect(href).toMatch(/^https?:\/\//);
          const stored = await page.request.get(href!); expect(stored.ok()).toBe(true); expect(await stored.body()).toEqual(file.body);
        } finally { await gate.dispose(); }
      });
    });
    // RED: activate after fail-closed legacy origin and immutable artifact entitlements.
    test.skip("[P0][AC5,6,8] unknown origin cannot restore and ordinary-purpose quote PDF gains no action", RED, async ({ page }) => {
      await withSeed(async seed => {
        // Archived INSERT represents legacy unknown origin; origin remains DB-owned NULL.
        const legacy = await seedFile(seed, `20.2-legacy-${crypto.randomUUID()}.png`, "image/png", PNG, "archived");
        const pdf = await seedFile(seed, `20.2-artifact-${crypto.randomUUID()}.pdf`, "application/pdf", Buffer.from("%PDF-1.7"), "archived", "quote_pdf");
        await open(page, { mode: "archived", module: "crm", ownerType: "customer" }); await expect(row(page, legacy.name)).toHaveCount(1);
        await expect(row(page, legacy.name).getByRole("button", { name: "Återställ", exact: true })).toBeDisabled(); await expect(row(page, legacy.name)).toContainText(/inte tillgänglig/i);
        // Invalid ordinary-purpose quote_pdf binding is absent, never relabeled ordinary.
        await expect(row(page, pdf.name)).toHaveCount(0); await expect(downloadLink(page)).toHaveCount(0);
        expect((await state(legacy.fileId)).archive_previous_state).toBeNull(); expect((await state(pdf.fileId)).lifecycle_state).toBe("archived"); expect(await audits(legacy.fileId)).toHaveLength(0); expect(await audits(pdf.fileId)).toHaveLength(0);
      });
    });
    // RED: activate after committed response-loss reconciliation and explicit current action.
    test.skip("[P0][AC4,7,8] lost committed archive response refreshes truth without blind retry", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-loss-${crypto.randomUUID()}.png`, "image/png"); await open(page); let submissions = 0; let lost = false;
        await page.route(FILES_ROUTE, async route => {
          if (!isAction(route.request())) { await route.continue(); return; } submissions++;
          if (lost) { await route.continue(); return; } lost = true;
          await route.fetch(); await route.abort("failed"); // Real checked commit; discard transport only.
        });
        try {
          await row(page, file.name).getByRole("button", { name: "Arkivera", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "Arkivera", exact: true }).click();
          await expect(page.getByTestId("documents-lifecycle-error")).toBeVisible(); await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0);
          await page.clock.install({ time: new Date() }); await page.clock.runFor(10_000); expect(submissions).toBe(1); expect((await state(file.fileId)).lifecycle_state).toBe("archived"); expect(await audits(file.fileId)).toHaveLength(1);
          await page.getByRole("button", { name: "Försök igen", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(0); // Retry first refreshes current read.
          expect(submissions).toBe(1); await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0);
          await page.getByRole("button", { name: "Arkiverade", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(1); expect(submissions).toBe(1); expect(await audits(file.fileId)).toHaveLength(1);
          const response = actionResponse(page); await row(page, file.name).getByRole("button", { name: "Återställ", exact: true }).click(); // Explicit new current-state choice.
          expect((await response).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Återställd"); expect(submissions).toBe(2); expect(await audits(file.fileId)).toHaveLength(2);
        } finally { await page.unroute(FILES_ROUTE); }
      });
    });
    // RED: activate after logical pane/back focus and retained list filters land.
    test.skip("[P1][AC2,8] keyboard list-detail-back retains filters focus and reachable controls", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-focus-${crypto.randomUUID()}.png`, "image/png"); await open(page, { q: file.name, module: "crm", ownerType: "customer", purpose: "crm_document" });
        const preview = row(page, file.name).getByRole("button", { name: "Förhandsvisa", exact: true }); await hydrated(preview); await preview.focus(); await expect(preview).toBeFocused();
        const response = actionResponse(page); await preview.press("Enter"); expect((await response).ok()).toBe(true); await expect(pane(page)).toBeVisible();
        const back = pane(page).getByTestId("documents-preview-back"); await expect(back).toBeInViewport(); await back.focus(); await expect(back).toBeFocused(); await back.press("Enter");
        await expect(preview).toBeFocused(); await expect(preview).toBeInViewport(); await expect(page.getByLabel("Sök dokument", { exact: true })).toHaveValue(file.name);
        await expect(page.getByLabel("Modul", { exact: true })).toHaveValue("crm"); await expect(page.getByLabel("Typ", { exact: true })).toHaveValue("customer"); await expect(page.getByLabel("Syfte", { exact: true })).toHaveValue("crm_document");
        await expect(page).toHaveURL(url => url.searchParams.get("q") === file.name && url.searchParams.get("ownerType") === "customer");
        await expect(page.getByRole("button", { name: "Ladda upp fil", exact: true }).first()).toBeInViewport();
      });
    });
    // RED: activate after new filter/preview composition retains owner-required shipped upload.
    test.skip("[P1][AC8] shipped owner picker remains required and contextual read confirms upload", RED, async ({ page }) => {
      await withSeed(async seed => {
        await open(page); await page.getByRole("button", { name: "Ladda upp fil", exact: true }).first().click(); const form = page.getByTestId("file-index-upload-form");
        await expect(form.getByTestId("file-index-upload-owner-type")).toBeVisible(); await expect(form.getByTestId("file-index-upload-owner")).toBeVisible();
        const name = `20.2-upload-${crypto.randomUUID()}.txt`; const body = Buffer.from("20.2 owner-required upload");
        await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "text/plain", buffer: body });
        const denied = actionResponse(page); await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click(); expect((await denied).ok()).toBe(true);
        await expect(form.getByRole("alert")).toBeVisible(); await expect(form.getByRole("status")).toHaveCount(0); await expect(row(page, name)).toHaveCount(0);
        await form.getByTestId("file-index-upload-owner-type").selectOption("customer"); await form.getByTestId("file-index-upload-owner").selectOption(seed.ownerId);
        await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "text/plain", buffer: body });
        const response = actionResponse(page); await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click(); expect((await response).ok()).toBe(true); await expect(form.getByRole("status")).toContainText("Filen laddades upp");
        const [persisted] = await adminQuery<{ id: string; object_path: string }>("select id,object_path from public.files where tenant_id=$1 and display_name=$2", [seed.base.tenantA.id, name]);
        expect(persisted).toBeDefined(); seed.files.push({ fileId: persisted.id, objectPath: persisted.object_path, linkId: "", name, body });
        await page.reload(); await expect(row(page, name)).toHaveCount(1); await page.goto(`/customers/${seed.ownerId}`); await expect(page.getByTestId("file-panel-existing-list")).toContainText(name);
      });
    });
  });
}
