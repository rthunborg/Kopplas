/**
 * Documents 20.1 / 20-P1-11: active acceptance tests against the production app.
 * No route fulfillment or synthetic success responses: login, upload, signing and
 * opening all use the real application and local fixture. These tests have not run.
 * Existing Swedish labels/test IDs below are source-derived, unobserved selectors.
 * The Dokument heading/nav and download label are provisional AC1/AC9 contracts.
 * Exhaustive source/RLS/proof/race matrices belong to the integration suites.
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { adminQuery, closeAdminPool } from "../../factories/admin-sql";

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
  await form.getByLabel("Koppla till", { exact: true }).selectOption("customer");
  await form.getByLabel("Kund", { exact: true }).selectOption(fixture().crm.company.id);
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
        await expect(page.getByRole("main")).not.toContainText(fixture().crm.fileName);
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
      await page.getByLabel("Kategori", { exact: true }).selectOption("customer");
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
      await form.getByLabel("Kund", { exact: true }).selectOption(data.crm.company.id);
      await form.getByRole("button", { name: "Ladda upp fil", exact: true }).click();
      await expect(form.getByRole("status")).toContainText("Filen laddades upp");
      await expect(documentRow(page, name)).toHaveCount(1);
      await page.reload();
      await expect(documentRow(page, name)).toHaveCount(1);
      await page.goto(`/customers/${data.crm.company.id}`);
      await expect(page.getByTestId("file-panel-existing-list")).toContainText(name);
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
        await expect(page.getByRole("main")).not.toContainText(data.crm.fileName);
      } finally {
        await adminQuery("update public.tenant_memberships set status=$3 where tenant_id=$1 and id=$2", [data.tenantA.id, membership.id, membership.status]);
      }
    });
  });
}
