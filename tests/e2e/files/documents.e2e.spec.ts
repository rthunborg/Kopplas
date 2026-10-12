/**
 * Documents 20.1 / 20-P1-11: active acceptance tests against the production app.
 * No route fulfillment or synthetic success responses: login, upload, signing and
 * opening all use the real application and local fixture, with guarded CDP attachment.
 * Existing Swedish labels/test IDs below are source-derived, unobserved selectors.
 * The Dokument heading/nav and download label are provisional AC1/AC9 contracts.
 * Exhaustive source/RLS/proof/race matrices belong to the integration suites.
 */
import type { Locator, Page } from "@playwright/test";
import { test, expect } from "../dashboard/guarded-test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { adminQuery, closeAdminPool } from "../../factories/admin-sql";
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
  await locator.evaluate((element) => new Promise<void>((resolve) => {
    const tick = () => Object.keys(element).some((key) => key.startsWith("__react"))
      ? resolve() : requestAnimationFrame(tick);
    tick();
  }));
}

async function signIn(page: Page, credentials: Credentials): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await waitForHydrated(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password);
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard$/);
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
  await submitAccess(page, row.getByRole("button", { name: "Förhandsgranska", exact: true }));
  const link = row.getByRole("link", { name: /tidsbegränsad länk/i });
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
        await signIn(page, fixture().notifications[role]);
        await expect(page.getByRole("link", { name: "Dokument", exact: true })).toHaveCount(0);
        await page.goto("/files");
        await expect(page.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible();
        await expect(page.getByTestId("file-index")).toHaveCount(0);
        await expect(page.getByTestId("file-index-row")).toHaveCount(0);
        await expect(page.getByRole("button", { name: /förhandsgranska|ladda upp fil/i })).toHaveCount(0);
        await expect(page.locator("#main-content")).not.toContainText(fixture().crm.fileName);
      });
    }

    test("[P1][AC7,9] keyboard access opens real inline text and explicit refresh calls the server again", async ({ page, context }) => {
      await openDocuments(page, fixture().adminA);
      const name = `documents-inline-${crypto.randomUUID()}.txt`;
      const content = `Dokument browser acceptance ${crypto.randomUUID()}`;
      const row = await upload(page, name, "text/plain", content);
      const button = row.getByRole("button", { name: "Förhandsgranska", exact: true });
      await button.focus();
      await expect(button).toBeFocused();
      const firstResponse = page.waitForResponse((response) =>
        new URL(response.url()).pathname === "/files"
        && response.request().method() === "POST"
        && !!response.request().headers()["next-action"]);
      await button.press("Enter");
      expect((await firstResponse).ok()).toBe(true);
      const link = row.getByRole("link", { name: /tidsbegränsad länk/i });
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
      // Reauthorization is proven by another observed production server action;
      // identical URLs minted within one server second are not treated as a defect.
      await submitAccess(page, row.getByRole("button", { name: "Öppna igen", exact: true }));
      await expect(link).toBeVisible();
      await expect(row.getByRole("alert")).toHaveCount(0);
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
      await expect(row.getByText("Länken har gått ut.", { exact: true })).toBeVisible();
      await expect(row.getByRole("link", { name: /tidsbegränsad länk/i })).toHaveCount(0);
      const [source] = await adminQuery<{ archived_at: string | null }>(
        "select archived_at from public.customers where tenant_id=$1 and id=$2",
        [data.tenantA.id, data.crm.company.id],
      );
      if (!source) throw new Error("Documents browser fixture customer is missing");
      try {
        await adminQuery("update public.customers set archived_at=statement_timestamp() where tenant_id=$1 and id=$2", [data.tenantA.id, data.crm.company.id]);
        await submitAccess(page, row.getByRole("button", { name: "Länken har gått ut — öppna igen", exact: true }));
        const denial = row.getByRole("alert");
        await expect(denial).toBeVisible();
        await expect(denial).not.toBeEmpty();
        await expect(denial).not.toContainText(/object_path|bucket_id|hittades inte|finns inte/i);
        await expect(row.getByRole("link", { name: /tidsbegränsad länk/i })).toHaveCount(0);
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
      const search = page.getByLabel("Sök (namn eller typ)", { exact: true });
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
        if (new URL(route.request().url()).searchParams.get("search") === data.crm.fileName) {
          sawRequest();
          await responseGate;
        }
        await route.continue();
      });
      try {
        await search.fill(data.crm.fileName);
        await requestStarted;
        const newerDraft = data.crm.fileName + "-not-present";
        await search.fill(newerDraft);
        releaseResponse();
        await expect(page).toHaveURL(url => url.searchParams.get("search") === newerDraft);
        await expect(search).toHaveValue(newerDraft);
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
    });

    test("[P1][AC9] repeated query keys remain scalar and malformed cursors have controlled retry", async ({ page }) => {
      const data = fixture();
      await signIn(page, data.adminA);
      const params = new URLSearchParams();
      params.append("search", data.crm.fileName); params.append("search", "not-present");
      params.append("owner", "customer"); params.append("owner", "job");
      await page.goto(`/files?${params}`);
      await expect(page.getByTestId("file-index-search")).toHaveValue(data.crm.fileName);
      await expect(page.getByTestId("file-index-category-filter")).toHaveValue("customer");
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
      await expect(page.getByTestId("file-index-error")).toHaveCount(0);
      await page.goto("/files?cursor=malformed&cursor=also-malformed");
      await expect(page.getByTestId("file-index-error")).toBeVisible();
      await page.getByRole("link", { name: "Försök igen", exact: true }).click();
      await expect(page).toHaveURL(/\/files$/);
      await expect(documentRow(page, data.crm.fileName)).toHaveCount(1);
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
        const search = page.getByLabel("Sök (namn eller typ)", { exact: true });
        await waitForHydrated(search);
        await search.fill(marker+"-60.txt");
        await expect(documentRow(page, marker+"-60.txt")).toHaveCount(1);
        await expect(page.getByTestId("file-index-row")).toHaveCount(1);
        await expect(page.getByTestId("documents-next-page")).toHaveCount(0);
        await search.fill(marker);
        await page.getByTestId("file-index-category-filter").selectOption("customer");
        await expect(page).toHaveURL(/owner=customer/);
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
          const gated = params.get("search") === marker+"-60.txt" && params.get("owner") === "customer";
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
        await expect(page).toHaveURL(/cursor=.*search=.*owner=customer/);
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
        const params = new URLSearchParams({ search: marker, owner: "customer" });
        await page.goto(`/files?${params}`);
        await expect(page.getByTestId("file-index-row")).toHaveCount(50);
        await page.getByTestId("documents-next-page").click();
        await expect(page).toHaveURL(/cursor=.*search=.*owner=customer/);
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
      await submitAccess(page, row.getByRole("button", { name: /förhandsgranska|ladda ned/i }));
      const downloadLink = row.getByRole("link", { name: /ladda ned|hämta|tidsbegränsad länk/i });
      await expect(downloadLink).toBeVisible();
      const downloadPromise = page.waitForEvent("download");
      await downloadLink.click();
      const download = await downloadPromise;
      expect(await download.failure()).toBeNull();
      expect(download.suggestedFilename()).toBe(name);
      const downloadedPath = await download.path();
      expect(downloadedPath).not.toBeNull();
      expect(readFileSync(downloadedPath!, "utf8")).toBe(body);
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
        await submitAccess(page, row.getByRole("button", { name: "Förhandsgranska", exact: true }));
        await expect(row.getByRole("alert")).toBeVisible();
        await expect(row.getByRole("link", { name: /tidsbegränsad länk/i })).toHaveCount(0);
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

