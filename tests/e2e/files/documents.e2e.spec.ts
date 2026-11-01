/**
 * Documents 20.1 / 20-P1-11: active acceptance tests against the production app.
 * No synthetic success responses: login, upload, signing and
 * opening all use the real application and local fixture, with guarded CDP attachment.
 * Existing Swedish labels/test IDs below are source-derived, unobserved selectors.
 * The Dokument heading/nav and download label are provisional AC1/AC9 contracts.
 * Exhaustive source/RLS/proof/race matrices belong to the integration suites.
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "../dashboard/guarded-test";
import { readFileSync, rmSync } from "node:fs";
import path from "node:path";
import { adminQuery, adminSession, closeAdminPool } from "../../factories/admin-sql";
import { adminInsertFile, adminInsertFileLink } from "../../factories/tenants";

type Credentials = { readonly id: string; readonly email: string; readonly password: string };
type Fixture = {
  readonly tenantA: { readonly id: string };
  readonly adminA: Credentials;
  readonly notifications: {
    readonly projectManager: Credentials;
    readonly salesperson: Credentials;
    readonly installer: Credentials;
    readonly finance: Credentials;
  };
  readonly crm: {
    readonly company: { readonly id: string; readonly displayName: string };
    readonly fileId: string;
    readonly fileName: string;
  };
};

// Read lazily: collecting the active tests does not require a prior seeded fixture.
function fixture(): Fixture {
  return JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
}

async function waitForHydrated(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  let current: { connected: boolean; reactMarker: boolean } | null = null;
  try {
    // Re-resolve the locator each sample; a captured SSR element may be replaced.
    await expect.poll(async () => {
      current = await locator.evaluate(element => ({ connected: element.isConnected, reactMarker: Object.keys(element).some(key => key.startsWith("__react")) }));
      return current.connected && current.reactMarker;
    }, { timeout: 15_000 }).toBe(true);
  } catch (error) { await test.info().attach("documents-hydration-current-node", { body: Buffer.from(JSON.stringify(current)), contentType: "application/json" }); throw error; }
}

async function signIn(page: Page, credentials: Credentials, expectedLanding: "/dashboard" | "/my-day" = "/dashboard"): Promise<void> {
  const events: { at: string; path: string; method: string; status?: number; code?: string; failure?: string }[] = [];
  const observed = (request: import("@playwright/test").Request) => { const path = new URL(request.url()).pathname; return path === "/auth/v1/token" && request.method() === "POST" || path.startsWith("/_next/static/") && path.endsWith(".js") && request.method() === "GET"; };
  const response = (reply: import("@playwright/test").Response) => {
    if (!observed(reply.request())) return;
    const event = { at: new Date().toISOString(), path: new URL(reply.url()).pathname, method: reply.request().method(), status: reply.status(), code: undefined as string | undefined }; events.push(event);
    if (new URL(reply.url()).pathname === "/auth/v1/token" && !reply.ok()) void reply.json().then(body => { const code = body.code ?? body.error_code; if (typeof code === "string" && ["invalid_credentials", "over_request_rate_limit", "request_timeout", "bad_json", "validation_failed", "user_not_found", "user_banned", "email_not_confirmed", "unexpected_failure"].includes(code)) event.code = code; }).catch(() => {});
  };
  const failed = (request: import("@playwright/test").Request) => { if (observed(request)) events.push({ at: new Date().toISOString(), path: new URL(request.url()).pathname, method: request.method(), failure: request.failure()?.errorText?.match(/^net::ERR_[A-Z_]+$/)?.[0] ?? "unknown" }); };
  const pageErrors: string[] = []; const pageError = (error: Error) => pageErrors.push(["Error", "TypeError", "ReferenceError", "SyntaxError", "ChunkLoadError"].includes(error.name) ? error.name : "unknown");
  page.on("response", response); page.on("requestfailed", failed); page.on("pageerror", pageError);
  try {
    await page.goto("/login");
    const submit = page.getByRole("button", { name: "Logga in", exact: true }); await waitForHydrated(submit);
    await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
    await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password); await submit.click();
    await expect(page).toHaveURL(expectedLanding === "/my-day" ? /\/my-day$/ : /\/dashboard$/);
  } catch (error) { await test.info().attach("documents-login-token-transport", { body: Buffer.from(JSON.stringify({ events, pageErrors })), contentType: "application/json" }); throw error; }
  finally { page.off("response", response); page.off("requestfailed", failed); page.off("pageerror", pageError); }
}

async function openDocuments(page: Page, credentials: Credentials): Promise<void> {
  await signIn(page, credentials);
  await page.goto("/files");
  await expect(page.getByRole("heading", { name: "Dokument", exact: true })).toBeVisible();
  await expect(page.getByTestId("file-index")).toBeVisible();
}

function documentRow(page: Page, name: string): Locator {
  return page.getByTestId("file-index-row").filter({ hasText: name });
}

/** Observe the real Next server-action response BEFORE the user submits. */
async function submitAccess(page: Page, control: Locator): Promise<void> {
  const response = page.waitForResponse((candidate) =>
    new URL(candidate.url()).pathname === "/files"
    && candidate.request().method() === "POST"
    && !!candidate.request().headers()["next-action"]);
  await waitForHydrated(control);
  await control.click();
  expect((await response).ok()).toBe(true);
}

async function signSelectedRow(page: Page, row: Locator): Promise<Locator> {
  await expect(row).toHaveCount(1);
  await submitAccess(page, row.getByRole("button", { name: "Förhandsvisa", exact: true }));
  const link = page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true });
  await expect(link).toBeVisible();
  await expect(link).toHaveAttribute("target", "_blank");
  await expect(link).toHaveAttribute("rel", /noopener/);
  await expect(link).toHaveAttribute("href", /^https?:\/\//);
  return link;
}

async function upload(page: Page, name: string, mimeType: string, body: string): Promise<Locator> {
  const entry = page.getByRole("button", { name: "Ladda upp fil", exact: true }).first();
  await waitForHydrated(entry);
  await entry.click();
  const form = page.getByTestId("file-index-upload-form");
  await form.getByTestId("file-index-upload-owner-type").selectOption("customer");
  await form.getByTestId("file-index-upload-owner").selectOption(fixture().crm.company.id);
  await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({
    name, mimeType, buffer: Buffer.from(body),
  });
  await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
  await expect(form.getByRole("status")).toContainText("Filen laddades upp");
  const row = documentRow(page, name);
  await expect(row).toHaveCount(1);
  await page.reload();
  await expect(documentRow(page, name)).toHaveCount(1);
  return documentRow(page, name);
}

test.afterAll(async () => { await closeAdminPool(); });

for (const viewport of [
  { name: "desktop", width: 1280, height: 800 },
  { name: "connected phone", width: 360, height: 640 },
]) {
  test.describe(`Documents 20.1 — ${viewport.name}`, () => {
    test.use({ viewport: { width: viewport.width, height: viewport.height } });

    for (const role of ["tenant_admin", "projektledare"] as const) {
      test(`[P1][AC1,9] ${role} follows the single Dokument navigation to the usable destination`, async ({ page }) => {
        const data = fixture();
        await signIn(page, role === "tenant_admin" ? data.adminA : data.notifications.projectManager);
        if (viewport.width < 768) {
          const menu = page.getByRole("button", { name: "Öppna meny", exact: true });
          await waitForHydrated(menu);
          await menu.click();
        }
        const navigation = page.getByRole("navigation", { name: "Huvudnavigation", exact: true }).filter({ visible: true });
        const destination = navigation.getByRole("link", { name: "Dokument", exact: true });
        await expect(destination).toHaveCount(1);
        await expect(destination).toHaveAttribute("href", "/files");
        await expect(navigation.getByRole("link", { name: "Filer", exact: true })).toHaveCount(0);
        await destination.click();
        await expect(page).toHaveURL(/\/files$/);
        await expect(page.getByRole("heading", { name: "Dokument", exact: true })).toBeVisible();
        await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
        await expect(page.getByTestId("file-index-error")).toHaveCount(0);
        if (viewport.width < 768) {
          await expect(page.getByRole("dialog", { name: "Huvudmeny", exact: true })).toHaveCount(0);
        }
      });
    }

    for (const role of ["installer", "salesperson", "finance"] as const) {
      test(`[P0][AC1,9] ${role} has neither Dokument navigation nor direct-route access`, async ({ page }) => {
        await signIn(page, fixture().notifications[role], role === "installer" ? "/my-day" : "/dashboard");
        await expect(page.getByRole("link", { name: "Dokument", exact: true })).toHaveCount(0);
        await page.goto("/files");
        await expect(page.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible();
        await expect(page.getByTestId("file-index")).toHaveCount(0);
        await expect(page.getByTestId("file-index-row")).toHaveCount(0);
        await expect(page.getByRole("button", { name: /förhandsvisa|ladda upp fil/i })).toHaveCount(0);
        await expect(page.locator("#main-content")).not.toContainText(fixture().crm.fileName);
      });
    }

    test("[P1][AC9] actual source read shows loading before the real authorized document list", async ({ page }) => {
      const data = fixture();
      await signIn(page, data.adminA);
      // The existing local-only helper owns one transaction and connection.
      // Hold this serial gate's real read; never substitute a successful response.
      await adminSession(async session => {
        await session.query("begin");
        try {
          await session.query("set local lock_timeout = '5s'");
          await session.query("lock table public.file_links in access exclusive mode");
          await page.goto("/files", { waitUntil: "commit" });
          await expect(page.getByRole("heading", { name: "Dokument", exact: true })).toBeVisible();
          await expect(page.getByRole("status").filter({ hasText: "Läser in dokument…" })).toBeVisible();
          await expect(page.getByTestId("file-index")).toHaveCount(0);
          await expect(page.getByTestId("file-index-empty")).toHaveCount(0);
          await expect(page.getByTestId("file-index-error")).toHaveCount(0);
          await expect(page.getByRole("main")).not.toContainText(data.crm.fileName);
        } finally {
          await session.query("rollback");
        }
      });
      await expect(page.getByTestId("file-index")).toBeVisible();
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
      await expect(page.getByRole("status").filter({ hasText: "Läser in dokument…" })).toHaveCount(0);
      await expect(page.getByTestId("file-index-error")).toHaveCount(0);
    });

    test("[P1][AC7,9] keyboard access shows signing progress, opens real inline text and refreshes expired selected access", async ({ page, context }) => {
      await openDocuments(page, fixture().adminA);
      const name = `documents-inline-${crypto.randomUUID()}.txt`;
      const content = `Dokument browser acceptance ${crypto.randomUUID()}`;
      const row = await upload(page, name, "text/plain", content);
      await page.clock.install({ time: new Date() });
      const button = row.getByRole("button", { name: "Förhandsvisa", exact: true });
      await button.focus();
      await expect(button).toBeFocused();
      const firstResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === "/files"
        && response.request().method() === "POST"
        && !!response.request().headers()["next-action"]);
      // Gate the actual action request before forwarding. No signer, audit or
      // success response is fulfilled or replaced.
      let releaseSigning!: () => void;
      let sawSigning!: () => void;
      let finishedSigning!: () => void;
      let observedSigning = false;
      let firstSigning = true;
      const signingGate = new Promise<void>(resolve => { releaseSigning = resolve; });
      const signingStarted = new Promise<void>(resolve => { sawSigning = resolve; });
      const signingFinished = new Promise<void>(resolve => { finishedSigning = resolve; });
      await page.route("**/files", async route => {
        const request = route.request();
        const gated = firstSigning && request.method() === "POST" && !!request.headers()["next-action"];
        if (gated) {
          firstSigning = false;
          observedSigning = true;
          sawSigning();
          await signingGate;
        }
        try { await route.continue(); }
        finally { if (gated) finishedSigning(); }
      });
      try {
        await button.press("Enter");
        await signingStarted;
        await expect(page.getByTestId("documents-preview-loading")).toHaveText("Öppnar…");
        await expect(page.getByTestId("documents-preview-pane").getByRole("button", { name: "Förnya åtkomst", exact: true })).toBeDisabled();
        await expect(page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true })).toHaveCount(0);
        await expect(page.getByTestId("documents-preview-pane").getByRole("alert")).toHaveCount(0);
      } finally {
        releaseSigning();
        if (observedSigning) await signingFinished;
        await page.unroute("**/files");
      }
      expect((await firstResponse).ok()).toBe(true);
      const link = page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true });
      await expect(link).toBeVisible();
      const firstHref = await link.getAttribute("href");
      expect(firstHref).toMatch(/^https?:\/\//);
      const popupPromise = context.waitForEvent("page");
      await link.focus();
      await expect(link).toBeFocused();
      await link.press("Enter");
      const popup = await popupPromise;
      try {
        await expect(popup).toHaveURL(firstHref!);
        await expect(popup.getByText(content, { exact: true })).toBeVisible();
      } finally { await popup.close(); }
      // Preserve explicit pre-expiry refresh. Identical URLs minted within one
      // server second are not treated as a defect.
      await submitAccess(page, page.getByTestId("documents-preview-pane").getByRole("button", { name: "Förnya åtkomst", exact: true }));
      await expect(link).toBeVisible();
      await expect(page.getByTestId("documents-preview-pane").getByRole("alert")).toHaveCount(0);
      const beforeExpiryHref = await link.getAttribute("href");
      expect(beforeExpiryHref).toMatch(/^https?:\/\//);
      const previousIssuanceObservedAt = Date.now();
      // Browser time only drives expiry UI. Selected-source signing/audit and
      // Storage bytes remain real production-app/local-fixture operations.
      await page.clock.fastForward(86_401_000);
      await expect(page.getByTestId("documents-preview-pane").getByText("Åtkomsten har gått ut", { exact: true })).toContainText("Åtkomsten har gått ut");
      await expect(link).toHaveCount(0);
      const reopen = page.getByTestId("documents-preview-pane").getByRole("button", { name: "Förnya åtkomst", exact: true });
      await expect(reopen).toBeVisible();
      await reopen.focus();
      await expect(reopen).toBeFocused();
      await expect.poll(() => Date.now()).toBeGreaterThan(previousIssuanceObservedAt + 1_100);
      await page.clock.setFixedTime(new Date());
      const refreshed = page.waitForResponse(response =>
        new URL(response.url()).pathname === "/files"
        && response.request().method() === "POST"
        && !!response.request().headers()["next-action"]);
      await reopen.press("Enter");
      expect((await refreshed).ok()).toBe(true);
      await expect(reopen).toBeEnabled();
      // Settle the shared hook's bounded timer with Date fixed at real issuance
      // time, resetting the tick after the deliberate browser-only jump.
      await page.clock.fastForward(86_401_000);
      await expect(link).toBeVisible();
      await expect(page.getByTestId("documents-preview-pane").getByRole("alert")).toHaveCount(0);
      const refreshedHref = await link.getAttribute("href");
      expect(refreshedHref).toMatch(/^https?:\/\//);
      expect(refreshedHref).not.toBe(beforeExpiryHref);
      const refreshedBytes = await page.request.get(refreshedHref!);
      expect(refreshedBytes.ok()).toBe(true);
      expect(await refreshedBytes.text()).toBe(content);
    });
    test("[P0][AC3,7,9] expiry hides the stale URL and refresh denies a now-archived selected source", async ({ page }) => {
      const data = fixture();
      await openDocuments(page, data.adminA);
      await page.clock.install({ time: new Date() });
      const row = documentRow(page, data.crm.fileName);
      await signSelectedRow(page, row);
      // Maximum accepted bearer TTL is 86400s. Browser time alone drives the
      // expiry UI; the server/source check remains real and is deliberately denied.
      await page.clock.fastForward(86_401_000);
      await expect(page.getByTestId("documents-preview-pane").getByText("Åtkomsten har gått ut", { exact: true })).toBeVisible();
      await expect(page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true })).toHaveCount(0);
      const [source] = await adminQuery<{ archived_at: string | null }>(
        "select archived_at from public.customers where tenant_id=$1 and id=$2",
        [data.tenantA.id, data.crm.company.id],
      );
      if (!source) throw new Error("Documents browser fixture customer is missing");
      try {
        await adminQuery("update public.customers set archived_at=statement_timestamp() where tenant_id=$1 and id=$2", [data.tenantA.id, data.crm.company.id]);
        await submitAccess(page, page.getByTestId("documents-preview-pane").getByRole("button", { name: "Förnya åtkomst", exact: true }));
        const denial = page.getByTestId("documents-preview-pane").getByRole("alert");
        await expect(denial).toBeVisible();
        await expect(denial).not.toBeEmpty();
        await expect(denial).not.toContainText(/object_path|bucket_id|hittades inte|finns inte/i);
        await expect(page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true })).toHaveCount(0);
        await page.reload();
        await expect(documentRow(page, data.crm.fileName)).toHaveCount(0);
        await expect(page.getByTestId("file-index-error")).toHaveCount(0);
      } finally {
        await adminQuery("update public.customers set archived_at=$3 where tenant_id=$1 and id=$2", [data.tenantA.id, data.crm.company.id, source.archived_at]);
      }
    });

    test("[P1][AC9] name, MIME and owner narrowing survive and zero matches have an honest empty state", async ({ page }) => {
      const data = fixture();
      await openDocuments(page, data.adminA);
      const search = page.getByLabel("Sök dokument", { exact: true });
      await waitForHydrated(search);
      await search.fill(data.crm.fileName);
      await expect(page.getByTestId("file-index-row")).toHaveCount(1);
      await page.getByTestId("file-index-category-filter").selectOption("customer");
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
      await search.fill("application/pdf");
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
      await search.fill(`no-match-${crypto.randomUUID()}`);
      await expect(page.getByTestId("file-index-row")).toHaveCount(0);
      await expect(page.getByTestId("file-index-empty")).toBeVisible();
      await expect(page.getByTestId("file-index-error")).toHaveCount(0);
      await search.fill(data.crm.fileName);
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
    });

    test("[P1][AC9] external navigation resets filters while own server echoes retain focused newer drafts", async ({ page }) => {
      const data = fixture();
      await openDocuments(page, data.adminA);
      const search = page.getByTestId("file-index-search");
      await waitForHydrated(search);
      let releaseResponse!: () => void;
      let sawRequest!: () => void;
      const responseGate = new Promise<void>(resolve => { releaseResponse = resolve; });
      const requestStarted = new Promise<void>(resolve => { sawRequest = resolve; });
      await page.route("**/files?**", async route => {
        if (new URL(route.request().url()).searchParams.get("q") === data.crm.fileName) {
          sawRequest();
          await responseGate;
        }
        await route.continue();
      });
      try {
        await search.fill(data.crm.fileName);
        await requestStarted;
        await search.fill(data.crm.fileName + "-not-present");
        releaseResponse();
        await expect(page).toHaveURL(url => url.searchParams.get("q") === data.crm.fileName + "-not-present");
        await expect(search).toHaveValue(data.crm.fileName + "-not-present");
        await expect(search).toBeFocused();
        await expect(page.getByTestId("file-index-empty")).toBeVisible();
      } finally {
        releaseResponse();
        await page.unroute("**/files?**");
      }
      if (viewport.width < 768) {
        await page.getByRole("button", { name: "Öppna meny", exact: true }).click();
      }
      const navigation = page.getByRole("navigation", { name: "Huvudnavigation", exact: true }).filter({ visible: true });
      await navigation.getByRole("link", { name: "Dokument", exact: true }).click();
      await expect(page).toHaveURL(/\/files$/);
      await expect(search).toHaveValue("");
      await expect(page.getByTestId("file-index-category-filter")).toHaveValue("");
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
      // Own reset tracking must not swallow real external history traversal.
      await page.goBack();
      await expect(page).toHaveURL(url => url.searchParams.get("q") === data.crm.fileName + "-not-present");
      await expect(search).toHaveValue(data.crm.fileName + "-not-present");
      await expect(page.getByTestId("file-index-empty")).toBeVisible();
      await page.goForward();
      await expect(page).toHaveURL(/\/files$/);
      await expect(search).toHaveValue("");
      await expect(page.getByTestId("file-index-category-filter")).toHaveValue("");
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
    });

    test("[P0][AC1,9] repeated query keys fail closed and malformed cursors have controlled retry", async ({ page }) => {
      const data = fixture(); await signIn(page, data.adminA);
      const params = new URLSearchParams(); params.append("q", data.crm.fileName); params.append("q", "not-present"); params.append("ownerType", "customer"); params.append("ownerType", "job");
      await page.goto(`/files?${params}`); await expect(page.getByTestId("documents-filter-error").getByRole("alert")).toBeVisible(); await expect(page.getByTestId("file-index-row")).toHaveCount(0);
      await page.goto("/files?cursor=malformed&cursor=also-malformed"); await expect(page.getByTestId("documents-filter-error").getByRole("alert")).toBeVisible(); await expect(page.getByTestId("file-index-row")).toHaveCount(0);
      await page.getByRole("link", { name: "Rensa filter", exact: true }).click(); await expect(page).toHaveURL(/\/files$/); await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
      await page.goto("/files?cursor=malformed"); await expect(page.getByTestId("file-index-error")).toBeVisible(); await page.getByRole("button", { name: "Försök igen", exact: true }).click();
      await expect(page).toHaveURL(url => !url.searchParams.has("cursor")); await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
    });

    test("[P1][AC4,6,9] actual destination traverses over fifty contexts and preserves collection narrowing", async ({ page }) => {
      const data = fixture(); const marker = "documents-pages-"+crypto.randomUUID();
      const files: string[] = []; const links: string[] = [];
      try {
        for (let i=0; i<61; i++) {
          const id = await adminInsertFile({ tenant_id: data.tenantA.id, display_name: marker+"-"+i+".txt", mime_type: "text/plain", lifecycle_state: "linked" });
          files.push(id);
          const link = await adminInsertFileLink({ tenant_id: data.tenantA.id, file_id: id, owner_type: "customer", owner_id: data.crm.company.id, purpose: "crm_document" });
          links.push(link);
          await adminQuery("update public.file_links set created_at=$2 where id=$1", [link,new Date(Date.UTC(2030,0,1,0,0,61-i)).toISOString()]);
        }
        // These ordinary metadata fixtures exercise listing, not Storage bytes.
        // The other journeys use real uploaded objects for checked access.
        await openDocuments(page, data.adminA);
        await expect(page.getByTestId("file-index-row")).toHaveCount(50);
        await expect(documentRow(page, marker+"-0.txt")).toHaveCount(1);
        await expect(documentRow(page, marker+"-60.txt")).toHaveCount(0);
        await page.getByTestId("documents-next-page").click();
        await expect(page).toHaveURL(/cursor=/);
        await expect(documentRow(page, marker+"-60.txt")).toHaveCount(1);
        await expect(documentRow(page, marker+"-0.txt")).toHaveCount(0);
        await page.goto("/files");
        const search = page.getByLabel("Sök dokument", { exact: true });
        await waitForHydrated(search);
        await search.fill(marker+"-60.txt");
        await expect(documentRow(page, marker+"-60.txt")).toHaveCount(1);
        await expect(page.getByTestId("file-index-row")).toHaveCount(1);
        await expect(page.getByTestId("documents-next-page")).toHaveCount(0);
        await search.fill(marker);
        await page.getByTestId("file-index-category-filter").selectOption("customer");
        await expect(page).toHaveURL(/ownerType=customer/);
        await expect(page.getByTestId("file-index-row")).toHaveCount(50);
        // A continuation for the previous server filter must disappear immediately,
        // before the debounced newer filter has returned its descriptor.
        let releaseFilterResponse!: () => void;
        let sawFilterRequest!: () => void;
        let finishedFilterRequest!: () => void;
        const filterGate = new Promise<void>(resolve => { releaseFilterResponse = resolve; });
        const filterStarted = new Promise<void>(resolve => { sawFilterRequest = resolve; });
        const filterFinished = new Promise<void>(resolve => { finishedFilterRequest = resolve; });
        await page.route("**/files?**", async route => {
          const params = new URL(route.request().url()).searchParams;
          const gated = params.get("q") === marker+"-60.txt" && params.get("ownerType") === "customer";
          if (gated) { sawFilterRequest(); await filterGate; }
          try { await route.continue(); }
          finally { if (gated) finishedFilterRequest(); }
        });
        try {
          await search.fill(marker+"-60.txt");
          await filterStarted;
          await expect(page.getByTestId("documents-next-page")).toHaveCount(0);
        } finally {
          releaseFilterResponse(); await filterFinished; await page.unroute("**/files?**");
        }
        await expect(page.getByTestId("file-index-row")).toHaveCount(1);
        await search.fill(marker);
        await expect(page.getByTestId("file-index-row")).toHaveCount(50);
        await expect(page.getByTestId("documents-next-page")).toHaveCount(1);
        await page.getByTestId("documents-next-page").click();
        await expect(page).toHaveURL(url => !!url.searchParams.get("cursor") && !!url.searchParams.get("q") && url.searchParams.get("ownerType") === "customer");
        await expect(search).toHaveValue(marker);
        await expect(page.getByTestId("file-index-category-filter")).toHaveValue("customer");
        await expect(page.getByTestId("file-index-row")).toHaveCount(11);
        await expect(documentRow(page, marker+"-60.txt")).toHaveCount(1);
        await expect(page.getByTestId("documents-next-page")).toHaveCount(0);
      } finally {
        if (links.length) await adminQuery("delete from public.file_links where id=any($1::uuid[])", [links]);
        if (files.length) await adminQuery("delete from public.files where id=any($1::uuid[])", [files]);
      }
    });

    test("[P1][AC9] upload requires an owner and success survives both Documents and contextual-page reads", async ({ page }) => {
      const data = fixture();
      await openDocuments(page, data.adminA);
      const entry = page.getByRole("button", { name: "Ladda upp fil", exact: true }).first();
      await waitForHydrated(entry);
      await entry.click();
      const form = page.getByTestId("file-index-upload-form");
      const name = `documents-owner-${crypto.randomUUID()}.txt`;
      await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from("owner-required acceptance") });
      await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
      await expect(form.getByRole("alert")).toBeVisible();
      await expect(form.getByRole("status")).toHaveCount(0);
      await expect(documentRow(page, name)).toHaveCount(0);
      // A completed React action resets uncontrolled file inputs, including denial.
      await form.getByTestId("file-index-upload-owner").selectOption(data.crm.company.id);
      await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({ name, mimeType: "text/plain", buffer: Buffer.from("owner-required acceptance") });
      await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
      await expect(form.getByRole("status")).toContainText("Filen laddades upp");
      await expect(documentRow(page, name)).toHaveCount(1);
      await page.reload();
      await expect(documentRow(page, name)).toHaveCount(1);
      await page.goto(`/customers/${data.crm.company.id}`);
      await expect(page.getByTestId("file-panel-existing-list")).toContainText(name);
    });

    test("[P1][AC9] confirmed upload reset preserves a newer search draft before its debounce", async ({ page }) => {
      const data = fixture();
      await openDocuments(page, data.adminA);
      await page.goto(`/files?${new URLSearchParams({ q: data.crm.fileName, ownerType: "customer" })}`);
      const search = page.getByTestId("file-index-search");
      await waitForHydrated(search);
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
      const entry = page.getByRole("button", { name: "Ladda upp fil", exact: true }).first();
      await entry.click();
      const form = page.getByTestId("file-index-upload-form");
      const name = `documents-upload-new-draft-${crypto.randomUUID()}.txt`;
      const body = "confirmed upload reset must preserve newer search";
      await form.getByTestId("file-index-upload-owner").selectOption(data.crm.company.id);
      await form.getByLabel("Välj en fil att ladda upp", { exact: true }).setInputFiles({
        name, mimeType: "text/plain", buffer: Buffer.from(body),
      });
      // Freeze only browser timers: the real upload and RSC read still run. The
      // reset must commit before the new draft's 200ms debounce can navigate.
      await page.clock.install({ time: new Date() });
      await page.clock.pauseAt(new Date(Date.now() + 1_000));
      let releaseReset!: () => void;
      let sawResetResponse!: () => void;
      let finishedReset!: () => void;
      const resetGate = new Promise<void>(resolve => { releaseReset = resolve; });
      const resetResponse = new Promise<void>(resolve => { sawResetResponse = resolve; });
      const resetFinished = new Promise<void>(resolve => { finishedReset = resolve; });
      let capturedReset = false;
      await page.route("**/files?**", async route => {
        const request = route.request();
        const params = new URL(request.url()).searchParams;
        const ownReset = !capturedReset && request.method() === "GET" && request.headers().rsc === "1"
          && !params.has("q") && !params.has("ownerType") && !params.has("cursor");
        if (!ownReset) { await route.continue(); return; }
        capturedReset = true;
        try {
          const response = await route.fetch();
          expect(response.ok()).toBe(true);
          sawResetResponse();
          await resetGate;
          // Forward the exact real server response, never a synthetic RSC body.
          await route.fulfill({ response });
        } finally { finishedReset(); }
      });
      try {
        const uploadResponse = page.waitForResponse(response =>
          new URL(response.url()).pathname === "/files" && response.request().method() === "POST"
          && !!response.request().headers()["next-action"]);
        await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
        expect((await uploadResponse).ok()).toBe(true);
        await expect(form.getByRole("status")).toContainText("Filen laddades upp");
        await resetResponse;
        await expect(search).toHaveValue("");
        await search.fill(name);
        await expect(search).toBeFocused();
        releaseReset();
        await resetFinished;
        await expect(page).toHaveURL(/\/files$/);
        // The newly persisted row proves the actual reset read has committed.
        await expect(documentRow(page, name)).toHaveCount(1);
        await expect(search).toHaveValue(name);
        await expect(search).toBeFocused();
        await page.clock.runFor(201);
        await expect(page).toHaveURL(url => url.pathname === "/files" && url.searchParams.get("q") === name
          && !url.searchParams.has("ownerType") && !url.searchParams.has("cursor"));
        await expect(search).toHaveValue(name);
        await expect(page.getByTestId("file-index-row")).toHaveCount(1);
        await signSelectedRow(page, documentRow(page, name));
        const href = await page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true }).getAttribute("href");
        expect(href).not.toBeNull();
        const stored = await page.request.get(href!);
        expect(stored.ok()).toBe(true);
        expect(await stored.text()).toBe(body);
      } finally {
        releaseReset();
        if (capturedReset) await resetFinished;
        await page.unroute("**/files?**");
      }
    });

    test("[P1][AC6,9] confirmed upload on a narrowed continuation returns to visible first-page context", async ({ page }) => {
      const data = fixture(); const marker = "documents-upload-cursor-"+crypto.randomUUID();
      const files: string[] = []; const links: string[] = [];
      try {
        for (let i=0; i<61; i++) {
          const id = await adminInsertFile({ tenant_id: data.tenantA.id, display_name: marker+"-"+i+".txt", mime_type: "text/plain", lifecycle_state: "linked" });
          files.push(id);
          const link = await adminInsertFileLink({ tenant_id: data.tenantA.id, file_id: id, owner_type: "customer", owner_id: data.crm.company.id, purpose: "crm_document" });
          links.push(link);
          await adminQuery("update public.file_links set created_at=$2 where id=$1", [link,new Date(Date.UTC(2020,0,1,0,0,61-i)).toISOString()]);
        }
        await openDocuments(page, data.adminA);
        const params = new URLSearchParams({ q: marker, ownerType: "customer" });
        await page.goto(`/files?${params}`);
        await expect(page.getByTestId("file-index-row")).toHaveCount(50);
        await page.getByTestId("documents-next-page").click();
        await expect(page).toHaveURL(url => !!url.searchParams.get("cursor") && !!url.searchParams.get("q") && url.searchParams.get("ownerType") === "customer");
        await expect(page.getByTestId("file-index-row")).toHaveCount(11);
        await expect(documentRow(page, marker+"-60.txt")).toHaveCount(1);
        const name = `documents-persisted-${crypto.randomUUID()}.txt`;
        await upload(page, name, "text/plain", "confirmed upload from continuation");
        await expect(page).toHaveURL(/\/files$/);
        await expect(page.getByTestId("file-index-search")).toHaveValue("");
        await expect(page.getByTestId("file-index-category-filter")).toHaveValue("");
        await expect(documentRow(page, name)).toHaveCount(1);
        await page.goto(`/customers/${data.crm.company.id}`);
        await expect(page.getByTestId("file-panel-existing-list")).toContainText(name);
        await page.reload();
        await expect(page.getByTestId("file-panel-existing-list")).toContainText(name);
      } finally {
        if (links.length) await adminQuery("delete from public.file_links where id=any($1::uuid[])", [links]);
        if (files.length) await adminQuery("delete from public.files where id=any($1::uuid[])", [files]);
      }
    });

    test("[P1][AC9] an unsupported inline format offers a real authorized download", async ({ page }) => {
      await openDocuments(page, fixture().adminA);
      const name = `documents-download-${crypto.randomUUID()}.doc`;
      const body = "Documents unsupported-format download acceptance";
      const row = await upload(page, name, "application/msword", body);
      await submitAccess(page, row.getByRole("button", { name: /förhandsvisa|ladda ned/i }));
      const downloadLink = page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true });
      await expect(downloadLink).toBeVisible();
      const downloadPromise = page.waitForEvent("download");
      await downloadLink.click();
      const download = await downloadPromise;
      expect(await download.failure()).toBeNull();
      expect(download.suggestedFilename()).toBe(name);
      const downloadedPath = test.info().outputPath(`saved-download-${crypto.randomUUID()}.doc`);
      try { await download.saveAs(downloadedPath); expect(readFileSync(downloadedPath)).toEqual(Buffer.from(body)); }
      finally { rmSync(downloadedPath, { force: true }); } // Only this test-owned saved copy.
    });

    test("[P0][AC3,7] the next open and route read use current membership rather than the signed-in session", async ({ page }) => {
      const data = fixture();
      const user = data.notifications.projectManager;
      await openDocuments(page, user);
      const row = documentRow(page, data.crm.fileName);
      await expect(row).toHaveCount(1);
      const [membership] = await adminQuery<{ id: string; status: string }>(
        "select id,status from public.tenant_memberships where tenant_id=$1 and user_id=$2",
        [data.tenantA.id, user.id],
      );
      if (!membership) throw new Error("Documents browser fixture membership is missing");
      try {
        await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and id=$2", [data.tenantA.id, membership.id]);
        await submitAccess(page, row.getByRole("button", { name: "Förhandsvisa", exact: true }));
        await expect(page.getByTestId("documents-preview-pane").getByRole("alert")).toBeVisible();
        await expect(page.getByTestId("documents-preview-pane").getByRole("link", { name: "Ladda ned", exact: true })).toHaveCount(0);
        await page.reload();
        await expect(page.getByTestId("file-index")).toHaveCount(0);
        await expect(page.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible();
        await expect(page.getByRole("main")).not.toContainText(data.crm.fileName);
      } finally {
        await adminQuery("update public.tenant_memberships set status=$3 where tenant_id=$1 and id=$2", [data.tenantA.id, membership.id, membership.status]);
      }
    });
  });
}

