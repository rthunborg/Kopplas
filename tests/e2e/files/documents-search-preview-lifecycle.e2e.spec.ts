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

type Fixture = { notifications: { projectManager: { id: string; email: string; password: string } }; tenantA: { id: string }; adminA: { id: string; email: string; password: string }; crm: { fileName: string } };
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
  let current: { connected: boolean; reactMarker: boolean } | null = null;
  try {
    // Re-resolve the locator each sample; a captured SSR element may be replaced.
    await expect.poll(async () => {
      current = await control.evaluate(element => ({ connected: element.isConnected, reactMarker: Object.keys(element).some(key => key.startsWith("__react")) }));
      return current.connected && current.reactMarker;
    }, { timeout: 15_000 }).toBe(true);
  } catch (error) { await test.info().attach("documents-hydration-current-node", { body: Buffer.from(JSON.stringify(current)), contentType: "application/json" }); throw error; }
}
async function signIn(page: Page): Promise<void> {
  const events: { at: string; path: string; method: string; status?: number; code?: string; failure?: string }[] = [];
  const observed = (request: Request) => { const path = new URL(request.url()).pathname; return path === "/auth/v1/token" && request.method() === "POST" || path.startsWith("/_next/static/") && path.endsWith(".js") && request.method() === "GET"; };
  const response = (reply: Response) => {
    if (!observed(reply.request())) return;
    const event = { at: new Date().toISOString(), path: new URL(reply.url()).pathname, method: reply.request().method(), status: reply.status(), code: undefined as string | undefined }; events.push(event);
    if (new URL(reply.url()).pathname === "/auth/v1/token" && !reply.ok()) void reply.json().then(body => { const code = body.code ?? body.error_code; if (typeof code === "string" && ["invalid_credentials", "over_request_rate_limit", "request_timeout", "bad_json", "validation_failed", "user_not_found", "user_banned", "email_not_confirmed", "unexpected_failure"].includes(code)) event.code = code; }).catch(() => {});
  };
  const failed = (request: Request) => { if (observed(request)) events.push({ at: new Date().toISOString(), path: new URL(request.url()).pathname, method: request.method(), failure: request.failure()?.errorText?.match(/^net::ERR_[A-Z_]+$/)?.[0] ?? "unknown" }); };
  const pageErrors: string[] = []; const pageError = (error: Error) => pageErrors.push(["Error", "TypeError", "ReferenceError", "SyntaxError", "ChunkLoadError"].includes(error.name) ? error.name : "unknown");
  page.on("response", response); page.on("requestfailed", failed); page.on("pageerror", pageError);
  try {
    const credentials = fixture().adminA; await page.goto("/login");
    const submit = page.getByRole("button", { name: "Logga in", exact: true }); await hydrated(submit);
    await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
    await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password); await submit.click();
    await expect(page).toHaveURL(/\/dashboard$/);
  } catch (error) { await test.info().attach("documents-login-token-transport", { body: Buffer.from(JSON.stringify({ events, pageErrors })), contentType: "application/json" }); throw error; }
  finally { page.off("response", response); page.off("requestfailed", failed); page.off("pageerror", pageError); }
}

async function open(page: Page, query: Record<string, string> = {}): Promise<void> {
  await signIn(page); await page.goto(`/files?${new URLSearchParams(query)}`);
}
async function select(page: Page, name: string): Promise<Response> {
  const control = row(page, name).getByRole("button", { name: "Förhandsvisa", exact: true }); await hydrated(control);
  const response = actionResponse(page); await control.click(); return response;
}
/** Canonicalize the actual Next reply fields; multipart boundaries are transport noise. */
function actionIdentity(request: Request) {
  const body = request.postData() ?? "";
  if (!request.headers()["content-type"]?.startsWith("multipart/form-data")) return { action: request.headers()["next-action"], body };
  const boundary = request.headers()["content-type"].split("boundary=")[1];
  const fields = body.split(`--${boundary}`).map(part => {
    const name = /name="([^"]+)"/.exec(part)?.[1];
    return name ? [name, part.split("\r\n\r\n").slice(1).join("\r\n\r\n").replace(/\r\n$/, "")] : null;
  }).filter(Boolean).sort((a,b) => a![0].localeCompare(b![0]));
  return { action: request.headers()["next-action"], fields };
}function signal() { let resolve!: () => void; return { promise: new Promise<void>(done => { resolve = done; }), release: () => resolve() }; }
/** Gate one real action; after modes fetch the real response, then forward it or lose only transport. */
async function gateAction(page: Page, mode: "before" | "after" | "after-loss" = "before") {
  const started = signal(); const release = signal(); const finished = signal(); let captured = false;
  await page.route(FILES_ROUTE, async route => {
    if (captured || !isAction(route.request())) { await route.continue(); return; }
    captured = true;
    try {
      let response: APIResponse | undefined; if (mode !== "before") response = await route.fetch();
      started.release(); await release.promise;
      if (mode === "after-loss") await route.abort("failed"); else if (response) await route.fulfill({ response }); else await route.continue();
    } finally { finished.release(); }
  });
  return { started: started.promise, release: release.release, dispose: async () => { release.release(); if (captured) await finished.promise; await page.unroute(FILES_ROUTE); } };
}
async function gateRead(page: Page) {
  const started = signal(), release = signal(), finished = signal(); let captured = false;
  await page.route(FILES_ROUTE, async route => {
    if (captured || route.request().method() !== "GET" || route.request().headers().rsc !== "1") { await route.continue(); return; }
    captured = true; started.release(); try { await release.promise; await route.continue(); } finally { finished.release(); }
  });
  return { started: started.promise, release: release.release, dispose: async () => { release.release(); if (captured) await finished.promise; await page.unroute(FILES_ROUTE); } };
}
async function seedFile(seed: Seed, name: string, mime: string, body: Buffer = PNG, lifecycle: "linked" | "archived" = "linked", artifact: "quote_pdf" | null = null): Promise<File> {
  const fileId = crypto.randomUUID(); const objectPath = `${seed.base.tenantA.id}/${fileId}/browser-fixture`;
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

    test("[P0][AC3,7] uncertain no-op cannot enter directly or before current read and original retry requires confirmation", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, "20.2-direct-loss-" + crypto.randomUUID() + ".png", "image/png");
        await adminQuery("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [file.fileId]);
        await open(page, { q: file.name, mode: "archived" }); const requests: Request[] = []; page.on("request", r => { if (isAction(r)) requests.push(r); });
        let lost = false; await page.route(FILES_ROUTE, async route => {
          if (!isAction(route.request()) || lost) { await route.continue(); return; } lost = true;
          await adminQuery("update public.files set lifecycle_state='linked',archived_at=null where id=$1", [file.fileId]);
          await route.fetch(); await adminQuery("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [file.fileId]); await route.abort("failed");
        });
        await row(page, file.name).getByRole("button", { name: "Återställ", exact: true }).click(); await expect(page.getByTestId("documents-lifecycle-error")).toBeVisible();
        const direct = row(page, file.name).getByRole("button", { name: "Återställ", exact: true }); await expect(direct).toBeDisabled(); await direct.evaluate(element => (element as HTMLButtonElement).click()); expect(requests).toHaveLength(1);
        await page.unroute(FILES_ROUTE); const read = await gateRead(page);
        try {
          await page.getByRole("button", { name: "Försök igen", exact: true }).click(); await read.started; await expect(direct).toBeDisabled(); await expect(page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true })).toHaveCount(0); expect(requests).toHaveLength(1);
          read.release(); await expect(page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true })).toBeVisible();
          await direct.click(); await expect(page.getByRole("dialog", { name: "Bekräfta ny återställning" })).toBeVisible(); expect(requests).toHaveLength(1); await page.keyboard.press("Escape"); await expect(direct).toBeFocused();
          const retry = page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true }); await retry.click(); const dialog = page.getByRole("dialog"); await expect(dialog.getByRole("button", { name: "Återställ", exact: true })).toBeFocused();
          await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Shift+Tab"); await expect(dialog.getByRole("button", { name: "Avbryt", exact: true })).toBeFocused(); await page.keyboard.press("Tab"); await page.keyboard.press("Tab"); await expect(dialog.getByRole("button", { name: "Återställ", exact: true })).toBeFocused();
          await page.keyboard.press("Escape"); await expect(retry).toBeFocused(); expect(requests).toHaveLength(1); await retry.click();
          const response = actionResponse(page); await dialog.getByRole("button", { name: "Återställ", exact: true }).click(); expect((await response).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Återställd");
          expect(requests).toHaveLength(2); expect(actionIdentity(requests[1])).toEqual(actionIdentity(requests[0])); expect((await state(file.fileId)).lifecycle_state).toBe("linked"); expect(await audits(file.fileId)).toHaveLength(1);
        } finally { await read.dispose(); }
      });
    });
    test("[P0][AC3,8] pending restore survives filter changes without overlapping action or stale feedback", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, "20.2-pending-filter-" + crypto.randomUUID() + ".png", "image/png"); await adminQuery("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [file.fileId]); await open(page, { mode: "archived" });
        const requests: Request[] = []; page.on("request", r => { if (isAction(r)) requests.push(r); }); const gate = await gateAction(page, "after");
        try {
          const response = actionResponse(page); await row(page, file.name).getByRole("button", { name: "Återställ", exact: true }).click(); await gate.started; await expect(page.getByTestId("documents-lifecycle-pending")).toBeVisible();
          await page.getByLabel("Sök dokument", { exact: true }).fill("no-match-pending"); await expect(page.getByTestId("documents-projection-loading")).toBeVisible(); await expect(row(page, file.name)).not.toBeVisible(); await expect(page.getByTestId("documents-lifecycle-pending")).toBeVisible(); expect(requests).toHaveLength(1);
          gate.release(); expect((await response).ok()).toBe(true); await expect(page.getByTestId("file-index-empty")).toBeVisible(); await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0); await expect(page.getByTestId("documents-lifecycle-error")).toHaveCount(0); expect(requests).toHaveLength(1); expect((await state(file.fileId)).lifecycle_state).toBe("linked");
        } finally { await gate.dispose(); }
      });
    });
    test("[P0][AC3,7,8] lost pending response after filter change exposes current refresh and preserves original callable", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const target = await seedFile(seed, "20.2-filter-loss-target-" + crypto.randomUUID() + ".png", "image/png");
        const current = await seedFile(seed, "20.2-filter-loss-current-" + crypto.randomUUID() + ".png", "image/png");
        await adminQuery("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [target.fileId]);
        await open(page, { q: target.name, mode: "archived" });
        const requests: Request[] = []; page.on("request", request => { if (isAction(request)) requests.push(request); });
        const restore = row(page, target.name).getByRole("button", { name: "Återställ", exact: true }); await hydrated(restore);
        const action = await gateAction(page, "after-loss");
        try {
          await restore.click(); await action.started; await expect(page.getByTestId("documents-lifecycle-pending")).toBeVisible();
          await page.getByLabel("Sök dokument", { exact: true }).fill(current.name);
          await page.getByRole("button", { name: "Aktiva", exact: true }).click();
          await expect(page.getByTestId("documents-projection-loading")).toBeVisible();
          await expect(row(page, target.name)).not.toBeVisible();
          await expect(page.getByTestId("documents-lifecycle-pending")).toBeVisible(); expect(requests).toHaveLength(1);
          action.release();
          await expect(row(page, current.name)).toBeVisible();
          const archive = row(page, current.name).getByRole("button", { name: "Arkivera", exact: true });
          await expect(page.getByTestId("documents-operation-refresh-required")).toBeVisible();
          await expect(page.getByTestId("documents-lifecycle-pending")).toHaveCount(0);
          await expect(page.getByTestId("documents-lifecycle-error")).toHaveCount(0);
          await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0);
          await expect(archive).toBeDisabled(); await archive.evaluate(element => (element as HTMLButtonElement).click()); expect(requests).toHaveLength(1);
          expect((await state(target.fileId)).lifecycle_state).toBe("linked"); expect(await audits(target.fileId)).toHaveLength(1);
        } finally { await action.dispose(); }
        const read = await gateRead(page);
        try {
          const refresh = page.getByTestId("documents-operation-refresh-required").getByRole("button", { name: "Läs in aktuella dokument", exact: true });
          await expect(refresh).toBeVisible(); await refresh.click(); await read.started;
          await expect(row(page, current.name).getByRole("button", { name: "Arkivera", exact: true })).toBeDisabled();
          await expect(page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true })).toHaveCount(0); expect(requests).toHaveLength(1);
          read.release(); await expect(page.getByTestId("documents-operation-uncertain")).toContainText("inte tillgänglig i detta tillstånd");
          await expect(page.getByTestId("documents-operation-refresh-required")).toHaveCount(0);
        } finally { await read.dispose(); }
        // An opposite transition changes eligibility, but never replaces the original consumed restore handle.
        await adminQuery("update public.files set lifecycle_state='archived',archived_at=now() where id=$1", [target.fileId]);
        await page.getByLabel("Sök dokument", { exact: true }).fill(target.name);
        await page.getByRole("button", { name: "Arkiverade", exact: true }).click();
        await expect(row(page, target.name)).toBeVisible();
        const retry = page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true });
        await expect(retry).toBeVisible(); expect(requests).toHaveLength(1); await retry.click();
        const dialog = page.getByRole("dialog", { name: "Bekräfta tidigare åtgärd" }); await expect(dialog).toBeVisible(); expect(requests).toHaveLength(1);
        const response = actionResponse(page); await dialog.getByRole("button", { name: "Återställ", exact: true }).click(); expect((await response).ok()).toBe(true);
        await expect(page.getByTestId("documents-lifecycle-error")).toContainText("redan hanterats");
        expect(requests).toHaveLength(2); expect(actionIdentity(requests[1])).toEqual(actionIdentity(requests[0]));
        expect((await state(target.fileId)).lifecycle_state).toBe("archived"); expect(await audits(target.fileId)).toHaveLength(1); expect(await audits(current.fileId)).toHaveLength(0);
      });
    });
    test("[P1][AC1,8] draft mode withholds old rows counts and facets until authorized projection arrives", RED, async ({ page }) => {
      await withSeed(async seed => {
        const marker = "20.2-current-" + crypto.randomUUID();
        const active = await seedFile(seed, marker + "-active.png", "image/png");
        await seedFile(seed, marker + "-active-second.png", "image/png");
        const archived = await seedFile(seed, marker + "-archived.png", "image/png", PNG, "archived");
        await open(page, { q: marker });
        const moduleOption = page.getByLabel("Modul", { exact: true }).locator('option[value="crm"]');
        const purposeOption = page.getByLabel("Syfte", { exact: true }).locator('option[value="crm_document"]');
        await expect(moduleOption).toHaveText("Kunder (2)"); await expect(purposeOption).toHaveText("Kunddokument (2)");
        await hydrated(page.getByRole("button", { name: "Arkiverade", exact: true })); const read = await gateRead(page);
        try {
          await page.getByRole("button", { name: "Arkiverade", exact: true }).click(); await read.started;
          await expect(page.getByTestId("documents-projection-loading")).toBeVisible(); await expect(row(page, active.name)).not.toBeVisible();
          await expect(page.getByTestId("documents-result-count")).not.toBeVisible(); await expect(page.getByLabel("Antal per filter")).not.toBeVisible();
          await expect(moduleOption).toHaveText("Kunder"); await expect(purposeOption).toHaveText("Kunddokument");
          for (const label of ["Modul", "Syfte"]) expect(await page.getByLabel(label, { exact: true }).locator("option").allTextContents()).not.toEqual(expect.arrayContaining([expect.stringMatching(/\(\d+\)/)]));
          read.release(); await expect(row(page, archived.name)).toBeVisible(); await expect(row(page, active.name)).toHaveCount(0);
          await expect(moduleOption).toHaveText("Kunder (1)"); await expect(purposeOption).toHaveText("Kunddokument (1)");
          await expect(page.getByTestId("documents-result-count")).toHaveText("1");
          await expect(row(page, archived.name).getByRole("button", { name: "Förhandsvisa", exact: true })).toHaveCount(0);
        } finally { await read.dispose(); }
      });
    });
    test("[P1][AC8] archive modal contains keyboard focus background and busy dismissal", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, "20.2-dialog-" + crypto.randomUUID() + ".png", "image/png"); await open(page, { q: file.name }); const invoker = row(page, file.name).getByRole("button", { name: "Arkivera", exact: true }); await invoker.click(); const dialog = page.getByRole("dialog");
        await expect(dialog.getByRole("button", { name: "Arkivera", exact: true })).toBeFocused(); await page.keyboard.press("Shift+Tab"); await page.keyboard.press("Shift+Tab"); await expect(dialog.getByRole("button", { name: "Avbryt", exact: true })).toBeFocused(); await page.keyboard.press("Escape"); await expect(invoker).toBeFocused(); expect(await audits(file.fileId)).toHaveLength(0);
        await invoker.click(); await expect(page.getByTestId("file-index").locator('[inert]')).toHaveCount(1); const gate = await gateAction(page);
        try { const response = actionResponse(page); await dialog.getByRole("button", { name: "Arkivera", exact: true }).click(); await gate.started; await expect(dialog.getByRole("button", { name: "Avbryt", exact: true })).toBeDisabled(); await page.keyboard.press("Escape"); await expect(dialog).toBeVisible(); gate.release(); expect((await response).ok()).toBe(true); await expect(dialog).toHaveCount(0); expect(await audits(file.fileId)).toHaveLength(1); } finally { await gate.dispose(); }
      });
    });
    for (const mime of ["image/png", "application/pdf"]) test("[P1][AC2] actual " + mime + " media failure offers explicit retry and authorized download", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const pdf = await PDFDocument.create(); pdf.addPage(); const body = mime === "application/pdf" ? Buffer.from(await pdf.save()) : PNG;
        const file = await seedFile(seed, "20.2-media-" + crypto.randomUUID() + (mime === "image/png" ? ".png" : ".pdf"), mime, body); await open(page, { q: file.name });
        const mediaRoute = /\/storage\/v1\/object\/sign\//; await page.route(mediaRoute, route => route.abort("failed"));
        try { expect((await select(page, file.name)).ok()).toBe(true); await expect(pane(page).getByTestId("documents-media-error").getByRole("alert")).toBeVisible(); await expect(pane(page).getByRole("img")).toHaveCount(0); await expect(pane(page).locator("iframe")).toHaveCount(0); await expect(downloadLink(page)).toBeVisible(); } finally { await page.unroute(mediaRoute); }
        const response = actionResponse(page); await pane(page).getByRole("button", { name: "Försök igen", exact: true }).click(); expect((await response).ok()).toBe(true); await expect(pane(page).getByTestId("documents-media-error")).toHaveCount(0);
        if (mime === "image/png") await expect.poll(() => pane(page).getByRole("img").evaluate(element => (element as HTMLImageElement).naturalWidth)).toBe(1); else await expect(pane(page).locator("iframe")).toHaveAttribute("src", /^blob:/);
        const actual = await page.request.get((await downloadLink(page).getAttribute("href"))!); expect(actual.ok()).toBe(true); expect(await actual.body()).toEqual(body);
        if (mime === "application/pdf") { expect(actual.headers()["content-type"]).toContain("application/octet-stream"); const loaded = await pane(page).locator("iframe").evaluate(async element => Array.from(new Uint8Array(await (await fetch(element.getAttribute("src")!)).arrayBuffer()))); expect(Buffer.from(loaded)).toEqual(body); }
      });
    });
    test("[P0][AC2] successful response delayed past bearer expiry never renders a URL", RED, async ({ page }) => {
      await withSeed(async seed => { const file = await seedFile(seed, "20.2-arrival-expiry-" + crypto.randomUUID() + ".png", "image/png"); await open(page, { q: file.name }); await page.clock.install({ time: new Date() }); const gate = await gateAction(page, "after"); try { const response = select(page, file.name); await gate.started; await page.clock.fastForward(86_401_000); gate.release(); expect((await response).ok()).toBe(true); await expect(pane(page)).toContainText("Åtkomsten har gått ut"); await expect(downloadLink(page)).toHaveCount(0); await expect(pane(page).getByRole("img")).toHaveCount(0); } finally { await gate.dispose(); } });
    });
    test("[P0][AC4,5,8] bounded undo uses current safe restore and cannot revive a newly forbidden source", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, "20.2-undo-" + crypto.randomUUID() + ".png", "image/png"); await open(page, { q: file.name }); await expect(row(page, file.name).getByTestId("file-index-size")).toHaveText(PNG.length + " B"); expect((await confirmArchive(page, file.name)).ok()).toBe(true); const undo = page.getByTestId("documents-archive-undo"); await expect(undo).toBeVisible(); await expect(row(page, file.name)).toHaveCount(0);
        await undo.click(); const response = actionResponse(page); await page.getByRole("dialog").getByRole("button", { name: "Återställ", exact: true }).click(); expect((await response).ok()).toBe(true); await expect(row(page, file.name)).toBeVisible(); expect((await state(file.fileId)).lifecycle_state).toBe("linked"); expect(await audits(file.fileId)).toHaveLength(2);
        expect((await confirmArchive(page, file.name)).ok()).toBe(true); await expect(undo).toBeVisible(); await undo.click(); await adminQuery("update public.customers set archived_at=now() where id=$1", [seed.ownerId]); const denied = actionResponse(page); await page.getByRole("dialog").getByRole("button", { name: "Återställ", exact: true }).click(); expect((await denied).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-error")).toBeVisible(); expect((await state(file.fileId)).lifecycle_state).toBe("archived"); expect(await audits(file.fileId)).toHaveLength(3);
        await page.getByRole("button", { name: "Försök igen", exact: true }).click(); await expect(undo).toHaveCount(0);
        // Fixture reopens the ordinary source/file solely to test the independent transient affordance deadline.
        await adminQuery("update public.customers set archived_at=null where id=$1", [seed.ownerId]); await adminQuery("update public.files set lifecycle_state='linked',archived_at=null where id=$1", [file.fileId]); await page.reload(); await page.clock.install({ time: new Date() });
        expect((await confirmArchive(page, file.name)).ok()).toBe(true); await expect(undo).toBeVisible(); await undo.click(); await expect(page.getByRole("dialog")).toBeVisible(); await page.clock.fastForward(10_001);
        await expect(undo).toHaveCount(0); await expect(page.getByRole("dialog")).toHaveCount(0); await expect(page.getByTestId("documents-undo-expired")).toBeVisible(); expect((await state(file.fileId)).lifecycle_state).toBe("archived"); expect(await audits(file.fileId)).toHaveLength(4);
      });
    });

    test("[P0][AC4,7] retained Undo restore survives deadline response loss and opposite archive without restoring again", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, "20.2-undo-retained-" + crypto.randomUUID() + ".png", "image/png"); await open(page, { q: file.name }); await page.clock.install({ time: new Date() }); expect((await confirmArchive(page, file.name)).ok()).toBe(true);
        const undo = page.getByTestId("documents-archive-undo"); await expect(undo).toBeVisible(); const requests: Request[] = []; page.on("request", request => { if (isAction(request)) requests.push(request); });
        const checked = signal(), releaseLoss = signal(), finished = signal(); let lost = false; await page.route(FILES_ROUTE, async route => { if (!isAction(route.request()) || lost) { await route.continue(); return; } lost = true; try { await route.fetch(); checked.release(); await releaseLoss.promise; await route.abort("failed"); } finally { finished.release(); } });
        try {
          await undo.click(); await page.getByRole("dialog").getByRole("button", { name: "Återställ", exact: true }).click(); await checked.promise; await expect(page.getByTestId("documents-lifecycle-pending")).toBeVisible(); await page.clock.fastForward(10_001); await expect(page.getByRole("dialog")).toBeVisible(); await expect(page.getByRole("dialog").getByRole("button", { name: "Avbryt", exact: true })).toBeDisabled(); releaseLoss.release(); await expect(page.getByTestId("documents-lifecycle-error")).toBeVisible(); expect((await state(file.fileId)).lifecycle_state).toBe("linked"); expect(await audits(file.fileId)).toHaveLength(2);
          await page.clock.fastForward(10_001); await expect(undo).toHaveCount(0); expect(requests).toHaveLength(1); await expect(page.getByTestId("documents-lifecycle-success")).toHaveCount(0);
          await page.getByRole("button", { name: "Försök igen", exact: true }).click(); await expect(row(page, file.name)).toBeVisible(); expect((await confirmArchive(page, file.name)).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Arkiverad");
          await page.getByRole("button", { name: "Arkiverade", exact: true }).click(); await expect(row(page, file.name)).toBeVisible(); await page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true }).click(); const replay = actionResponse(page); await page.getByRole("dialog").getByRole("button", { name: "Återställ", exact: true }).click(); expect((await replay).ok()).toBe(true);
          await expect(page.getByTestId("documents-lifecycle-error")).toContainText("redan hanterats"); expect((await state(file.fileId)).lifecycle_state).toBe("archived"); expect(await audits(file.fileId)).toHaveLength(3); expect(requests).toHaveLength(3); expect(actionIdentity(requests[2])).toEqual(actionIdentity(requests[0])); expect(actionIdentity(requests[1])).not.toEqual(actionIdentity(requests[0]));
        } finally { releaseLoss.release(); if (lost) await finished.promise; await page.unroute(FILES_ROUTE); }
      });
    });
    // RED: activate after normalized URL filters/facets/date/mode read lands.
    test("[P1][AC1,8] combined filters retain literal search and honest authorized facets", RED, async ({ page }) => {
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
      test(`[P0][AC1,8] ${invalid.name} validates instead of showing an unfiltered list`, RED, async ({ page }) => {
        await signIn(page); await page.goto(`/files?${invalid.query}`);
        await expect(page.getByTestId("documents-filter-error").getByRole("alert")).toBeVisible();
        await expect(page.getByTestId("file-index-row")).toHaveCount(0); await expect(page.getByTestId("documents-result-count")).toHaveCount(0);
        await expect(page.getByTestId("documents-next-page")).toHaveCount(0); await expect(page.getByRole("main")).not.toContainText(fixture().crm.fileName);
      });
    }
    // RED: activate after filter-bound complete pagination lands.
    test("[P1][AC1,8] fifty-row continuation retains normalized filters without duplicates", RED, async ({ page }) => {
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
    test("[P0][AC2,8] delayed signed response cannot replace a newer selected image", RED, async ({ page }) => {
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
    test("[P0][AC2,8] filter and mode changes clear prior URL content and error", RED, async ({ page }) => {
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
    test("[P1][AC2,8] expiry removes bearer access until explicit fresh checked renewal", RED, async ({ page }) => {
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
    test("[P1][AC2,8] ordinary PDF preview uses fresh authorized PDF bytes", RED, async ({ page }) => {
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
        await expect(embedded).toHaveAttribute("src", /^blob:/);
        const renderedBytes = await embedded.evaluate(async element => Array.from(new Uint8Array(await (await fetch(element.getAttribute("src")!)).arrayBuffer()))); expect(Buffer.from(renderedBytes)).toEqual(body);
        const actual = await page.request.get(href!); expect(actual.ok()).toBe(true);
        expect(actual.headers()["content-type"]).toContain("application/pdf"); expect(await actual.body()).toEqual(body);
      });
    });
    test("[P1][AC2,8] expanded image upload form does not intercept normal preview and real stored image bytes", async ({ page }) => {
      await withSeed(async seed => {
        const name = `20.2-upload-image-${crypto.randomUUID()}.png`;
        await open(page); await page.getByRole("button", { name: "Ladda upp fil", exact: true }).first().click();
        const form = page.getByTestId("file-index-upload-form");
        await form.getByTestId("file-index-upload-owner-type").selectOption("customer");
        await form.getByTestId("file-index-upload-owner").selectOption(seed.ownerId);
        await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "image/png", buffer: PNG });
        const uploaded = actionResponse(page); await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click(); expect((await uploaded).ok()).toBe(true);
        const [persisted] = await adminQuery<{ id: string; object_path: string }>("select id,object_path from public.files where tenant_id=$1 and display_name=$2", [seed.base.tenantA.id, name]);
        expect(persisted).toBeDefined(); seed.files.push({ fileId: persisted.id, objectPath: persisted.object_path, linkId: "", name, body: PNG });
        await expect(form.getByRole("status")).toContainText("Filen laddades upp");
        // Keep the shipped form expanded: ordinary pointer clicks must reach the new row.
        await expect(page.getByTestId("upload-file-button")).toHaveAttribute("aria-expanded", "true");
        await expect(row(page, name)).toHaveCount(1); expect((await select(page, name)).ok()).toBe(true);
        const image = pane(page).getByRole("img", { name, exact: true }); await expect(image).toBeVisible();
        await expect.poll(() => image.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBe(1);
        const href = await downloadLink(page).getAttribute("href"); expect(href).toMatch(/^https?:\/\//); await expect(image).toHaveAttribute("src", href!);
        const actual = await page.request.get(href!); expect(actual.ok()).toBe(true); expect(actual.headers()["content-type"]).toContain("image/png"); expect(await actual.body()).toEqual(PNG);
      });
    });
    // RED: activate after unsupported-format download fallback lands.
    test("[P1][AC2,8] unsupported format downloads actual authorized stored bytes", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-download-${crypto.randomUUID()}.doc`, "application/msword", Buffer.from("20.2 authorized download bytes")); await open(page);
        expect((await select(page, file.name)).ok()).toBe(true); await expect(pane(page).getByRole("img")).toHaveCount(0); await expect(downloadLink(page)).toBeVisible();
        const downloading = page.waitForEvent("download"); await downloadLink(page).click(); const downloaded = await downloading;
        expect(await downloaded.failure()).toBeNull(); expect(downloaded.suggestedFilename()).toBe(file.name);
        const location = await downloaded.path(); expect(location).not.toBeNull(); expect(readFileSync(location!)).toEqual(file.body);
      });
    });
    // RED: activate after neutral current-source denial clears a previously successful pane.
    test("[P0][AC2,3,8] now-ineligible selected source denies renewal without stale URL or hidden identity", ERROR_RED, async ({ page }) => {
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
    test("[P1][AC2,8] transient failure clears previous preview and retries only explicitly", ERROR_RED, async ({ page }) => {
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
    test("[P0][AC2,4,8] archive confirms all-link effect and waits for checked persistence", RED, async ({ page }) => {
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
    test("[P0][AC3,8] hidden now-ineligible context denies whole archive without identity or audit", ERROR_RED, async ({ page }) => {
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
    test("[P0][AC2,4,5,8] ordinary restore preserves identity bytes links and needs fresh active signing", RED, async ({ page }) => {
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
    test("[P0][AC5,6,8] unknown origin cannot restore and ordinary-purpose quote PDF gains no action", RED, async ({ page }) => {
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
    test("[P0][AC4,7,8] lost committed archive response refreshes truth without blind retry", ERROR_RED, async ({ page }) => {
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
          const response = actionResponse(page); await row(page, file.name).getByRole("button", { name: "Återställ", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "Återställ", exact: true }).click(); // Separately confirmed fresh current-state choice.
          expect((await response).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Återställd"); expect(submissions).toBe(2); expect(await audits(file.fileId)).toHaveLength(2);
        } finally { await page.unroute(FILES_ROUTE); }
      });
    });
    test("[P0][AC3,7,8] retained consumed archive closure survives refresh and opposite restore without rearchiving", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-consumed-${crypto.randomUUID()}.png`, "image/png"); await open(page, { q: file.name });
        const requests: Request[] = []; page.on("request", request => { if (isAction(request)) requests.push(request); });
        let lost = false;
        await page.route(FILES_ROUTE, async route => {
          if (!isAction(route.request()) || lost) { await route.continue(); return; }
          lost = true; await route.fetch(); await route.abort("failed");
        });
        try {
          await row(page, file.name).getByRole("button", { name: "Arkivera", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "Arkivera", exact: true }).click();
          await expect(page.getByTestId("documents-lifecycle-error")).toBeVisible(); expect(await audits(file.fileId)).toHaveLength(1);
          await page.getByRole("button", { name: "Försök igen", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(0); expect(requests).toHaveLength(1);
          await page.getByRole("button", { name: "Arkiverade", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(1);
          const restored = actionResponse(page); await row(page, file.name).getByRole("button", { name: "Återställ", exact: true }).click(); await page.getByRole("dialog").getByRole("button", { name: "Återställ", exact: true }).click(); expect((await restored).ok()).toBe(true);
          await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Återställd");
          await page.getByRole("button", { name: "Aktiva", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(1);
          await page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true }).click();
          const replayed = actionResponse(page); await page.getByRole("dialog").getByRole("button", { name: "Arkivera", exact: true }).click(); expect((await replayed).ok()).toBe(true);
          await expect(page.getByTestId("documents-lifecycle-error")).toContainText("redan hanterats");
          expect((await state(file.fileId)).lifecycle_state).toBe("linked"); expect(await audits(file.fileId)).toHaveLength(2); expect(requests).toHaveLength(3);
          expect(actionIdentity(requests[2])).toEqual(actionIdentity(requests[0]));
          expect(actionIdentity(requests[1])).not.toEqual(actionIdentity(requests[0]));
          const [original] = await adminQuery<{ correlation_id: string }>("select correlation_id from public.audit_events where target_id=$1 and command='document.archive'", [file.fileId]);
          expect(requests[0].postData()).not.toContain(original.correlation_id);
        } finally { await page.unroute(FILES_ROUTE); }
      });
    });
    test("[P0][AC3,4,7] retained no-op restore closure is not consumed and can change only after current refresh and confirmation", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-noop-${crypto.randomUUID()}.png`, "image/png");
        await adminQuery("update public.files set lifecycle_state='archived',archived_at=statement_timestamp() where id=$1", [file.fileId]);
        await open(page, { q: file.name, mode: "archived" });
        const requests: Request[] = []; page.on("request", request => { if (isAction(request)) requests.push(request); });
        let lost = false;
        await page.route(FILES_ROUTE, async route => {
          if (!isAction(route.request()) || lost) { await route.continue(); return; }
          lost = true;
          // A concurrent genuine ordinary restoration makes this checked request a no-op.
          await adminQuery("update public.files set lifecycle_state='linked',archived_at=null where id=$1", [file.fileId]);
          await route.fetch(); await route.abort("failed");
        });
        try {
          await row(page, file.name).getByRole("button", { name: "Återställ", exact: true }).click();
          await expect(page.getByTestId("documents-lifecycle-error")).toBeVisible(); expect(await audits(file.fileId)).toHaveLength(0);
          await page.getByRole("button", { name: "Försök igen", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(0); expect(requests).toHaveLength(1);
          await page.getByRole("button", { name: "Aktiva", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(1);
          expect((await confirmArchive(page, file.name)).ok()).toBe(true); await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Arkiverad");
          await page.getByRole("button", { name: "Arkiverade", exact: true }).click(); await expect(row(page, file.name)).toHaveCount(1);
          await page.getByRole("button", { name: "Bekräfta tidigare åtgärd", exact: true }).click();
          const response = actionResponse(page); await page.getByRole("dialog").getByRole("button", { name: "Återställ", exact: true }).click(); expect((await response).ok()).toBe(true);
          await expect(page.getByTestId("documents-lifecycle-success")).toContainText("Återställd");
          expect((await state(file.fileId)).lifecycle_state).toBe("linked"); expect(await audits(file.fileId)).toHaveLength(2); expect(requests).toHaveLength(3);
          expect(actionIdentity(requests[2])).toEqual(actionIdentity(requests[0]));
          expect(actionIdentity(requests[1])).not.toEqual(actionIdentity(requests[0]));
        } finally { await page.unroute(FILES_ROUTE); }
      });
    });
    test("[P0][AC3,7] real encrypted action rejects extra input selected substitution and a different currently authorized actor", ERROR_RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-bound-${crypto.randomUUID()}.png`, "image/png"); await open(page, { q: file.name });
        const request = page.waitForRequest(isAction); expect((await confirmArchive(page, file.name)).ok()).toBe(true); const original = await request;
        const headers = { "next-action": original.headers()["next-action"], "content-type": original.headers()["content-type"], origin: new URL(page.url()).origin };
        const body = original.postData()!;
        for (const [crafted, code] of [
          [body.replace(`"file_id":"${file.fileId}"`, `"file_id":"${file.fileId}","correlation_id":"${crypto.randomUUID()}"`), "VALIDATION_FAILED"],
          [body.replace(`"file_id":"${file.fileId}"`, `"file_id":"${crypto.randomUUID()}"`), "TENANT_ACCESS_DENIED"],
        ]) {
          expect(crafted).not.toBe(body); const result = await page.request.post("/files", { data: crafted, headers }); expect(result.ok()).toBe(true); expect(await result.text()).toContain(code);
          expect(await audits(file.fileId)).toHaveLength(1);
        }
        await page.goto("/login");
        const user = seed.base.notifications.projectManager; const submit = page.getByRole("button", { name: "Logga in", exact: true }); await hydrated(submit);
        await page.getByLabel("E-post", { exact: true }).fill(user.email); await page.getByLabel("Lösenord", { exact: true }).fill(user.password); await submit.click(); await expect(page).toHaveURL(/\/dashboard$/);
        const denied = await page.request.post("/files", { data: body, headers }); expect(denied.ok()).toBe(true); expect(await denied.text()).toContain("TENANT_ACCESS_DENIED");
        expect((await state(file.fileId)).lifecycle_state).toBe("archived"); expect(await audits(file.fileId)).toHaveLength(1);
      });
    });    // RED: activate after logical pane/back focus and retained list filters land.
    test("[P1][AC2,8] PDF preview aborts pending fetch and revokes completed Blob URL on Back", ERROR_RED, async ({ page }) => {
      type MediaCleanupAudit = {
        created: string[]; revoked: string[]; gateNextPdf: boolean; releaseGatedPdf: (() => void) | null;
        requests: { aborted: boolean; gated: boolean; released: boolean; settled: boolean; status?: number }[];
      };
      await withSeed(async seed => {
        const marker = "20.2-media-cleanup-" + crypto.randomUUID();
        const pdf = await PDFDocument.create(); pdf.addPage().drawText("20.2 real media cleanup");
        const pdfBody = Buffer.from(await pdf.save());
        const document = await seedFile(seed, marker + "-A.pdf", "application/pdf", pdfBody);
        const image = await seedFile(seed, marker + "-B.png", "image/png");
        await page.addInitScript(() => {
          const audit: MediaCleanupAudit = { created: [], revoked: [], gateNextPdf: false, releaseGatedPdf: null, requests: [] };
          (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit = audit;
          const create = URL.createObjectURL.bind(URL), revoke = URL.revokeObjectURL.bind(URL);
          URL.createObjectURL = value => {
            const url = create(value);
            if (value instanceof Blob && value.type === "application/pdf") audit.created.push(url);
            return url;
          };
          URL.revokeObjectURL = url => { if (audit.created.includes(url)) audit.revoked.push(url); revoke(url); };
          const fetchActual = window.fetch.bind(window);
          window.fetch = async (input, init) => {
            const url = input instanceof Request ? input.url : String(input);
            const signal = init?.signal ?? (input instanceof Request ? input.signal : undefined);
            if (!url.includes("/storage/v1/object/sign/") || !signal) return fetchActual(input, init);
            const observation: MediaCleanupAudit["requests"][number] = { aborted: signal.aborted, gated: false, released: false, settled: false };
            audit.requests.push(observation);
            signal.addEventListener("abort", () => { observation.aborted = true; }, { once: true });
            const gated = audit.gateNextPdf; audit.gateNextPdf = false;
            try {
              // Delay delivery of the actual native Response only. No successful
              // status, headers, body, signing result or stored bytes are fabricated.
              const response = await fetchActual(input, init); observation.status = response.status;
              if (gated) {
                observation.gated = true;
                await new Promise<void>(resolve => { audit.releaseGatedPdf = resolve; });
                observation.released = true; audit.releaseGatedPdf = null;
              }
              return response;
            } finally { observation.settled = true; }
          };
        });
        await open(page, { q: marker });
        expect((await select(page, document.name)).ok()).toBe(true);
        const embedded = pane(page).getByTitle(document.name, { exact: true });
        await expect(embedded).toHaveAttribute("src", /^blob:/);
        const firstBlob = (await embedded.getAttribute("src"))!;
        const actualBytes = await embedded.evaluate(async element => Array.from(new Uint8Array(await (await fetch(element.getAttribute("src")!)).arrayBuffer())));
        expect(Buffer.from(actualBytes)).toEqual(pdfBody);
        await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.created.length)).toBe(1);
        await pane(page).getByTestId("documents-preview-back").press("Enter");
        await expect(row(page, document.name).getByRole("button", { name: "Förhandsvisa", exact: true })).toBeFocused();
        await expect(pane(page).locator("iframe")).toHaveCount(0); await expect(downloadLink(page)).toHaveCount(0);
        await expect.poll(() => page.evaluate(url => (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.revoked.includes(url), firstBlob)).toBe(true);
        expect(await page.evaluate(url => fetch(url).then(() => false, () => true), firstBlob)).toBe(true);
        await page.evaluate(() => { (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.gateNextPdf = true; });
        try {
          expect((await select(page, document.name)).ok()).toBe(true);
          await expect(pane(page).getByTestId("documents-media-loading")).toBeVisible();
          await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.requests[1]?.gated)).toBe(true);
          expect(await page.evaluate(() => (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.requests[1].status)).toBe(200);
          expect((await select(page, image.name)).ok()).toBe(true);
          await expect.poll(() => page.evaluate(() => (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.requests[1].aborted)).toBe(true);
          await expect(pane(page).locator("iframe")).toHaveCount(0);
          const selectedImage = pane(page).getByRole("img", { name: image.name, exact: true });
          await expect.poll(() => selectedImage.evaluate(element => (element as HTMLImageElement).naturalWidth)).toBe(1);
          await page.evaluate(() => { (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.releaseGatedPdf?.(); });
          await expect.poll(() => page.evaluate(() => {
            const request = (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.requests[1];
            return request.released && request.settled;
          })).toBe(true);
          expect(await page.evaluate(() => {
            const audit = (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit;
            return { created: audit.created.length, revoked: audit.revoked.length };
          })).toEqual({ created: 1, revoked: 1 });
          await expect(pane(page)).not.toContainText(document.name); await expect(pane(page).locator("iframe")).toHaveCount(0);
          await expect(selectedImage).toBeVisible(); await expect(pane(page).getByRole("alert")).toHaveCount(0);
        } finally {
          // Release this test's native fetch gate even when an assertion fails.
          await page.evaluate(() => { (window as unknown as Window & { __documentsMediaCleanupAudit: MediaCleanupAudit }).__documentsMediaCleanupAudit.releaseGatedPdf?.(); });
        }
      });
    });
    test("[P1][AC2,8] keyboard list-detail-back retains filters focus and reachable controls", RED, async ({ page }) => {
      await withSeed(async seed => {
        const file = await seedFile(seed, `20.2-focus-${crypto.randomUUID()}.png`, "image/png"); await open(page, { q: file.name, module: "crm", ownerType: "customer", purpose: "crm_document" });
        const preview = row(page, file.name).getByRole("button", { name: "Förhandsvisa", exact: true }); await hydrated(preview); await preview.focus(); await expect(preview).toBeFocused();
        const response = actionResponse(page); await preview.press("Enter"); expect((await response).ok()).toBe(true); await expect(pane(page)).toBeVisible();
        const back = pane(page).getByTestId("documents-preview-back"); await expect(back).toBeInViewport(); await expect(back).toBeFocused(); await back.press("Enter");
        await expect(preview).toBeFocused(); await expect(preview).toBeInViewport(); await expect(page.getByLabel("Sök dokument", { exact: true })).toHaveValue(file.name);
        await expect(page.getByLabel("Modul", { exact: true })).toHaveValue("crm"); await expect(page.getByLabel("Typ", { exact: true })).toHaveValue("customer"); await expect(page.getByLabel("Syfte", { exact: true })).toHaveValue("crm_document");
        await expect(page).toHaveURL(url => url.searchParams.get("q") === file.name && url.searchParams.get("ownerType") === "customer");
        await expect(page.getByRole("button", { name: "Ladda upp fil", exact: true }).first()).toBeInViewport();
      });
    });
    // RED: activate after new filter/preview composition retains owner-required shipped upload.
    test("[P1][AC8] shipped owner picker remains required and contextual read confirms upload", RED, async ({ page }) => {
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
