/** 35.8-P P-6 essential real-app acceptance. Run only with configured production
 * server + local fixture; no mocked successful command or browser-side money engine.
 */
import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

interface Fixture { adminA: { email: string; password: string }; }
function fixture(): Fixture {
  return JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
}
async function hydrated(locator: Locator) {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate(el => new Promise<void>(resolve => {
    const tick = () => Object.keys(el).some(k => k.startsWith("__react")) ? resolve() : requestAnimationFrame(tick);
    tick();
  }));
}
async function signIn(page: Page) {
  const account = fixture().adminA;
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in" });
  await hydrated(submit);
  await page.getByLabel("E-post").fill(account.email);
  await page.getByLabel("Lösenord").fill(account.password);
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard/);
}
async function ownCalculation(page: Page) {
  await signIn(page);
  await page.goto("/calculations");
  const create = page.getByTestId("new-calculation");
  await hydrated(create);
  await create.click();
  const form = page.getByTestId("new-calculation-form");
  const title = `Safety ${crypto.randomUUID()}`;
  await form.getByLabel("Titel").fill(title);
  await form.getByLabel("Kund", { exact: true }).selectOption({ index: 1 });
  await form.getByRole("button", { name: "Skapa kalkyl" }).click();
  const row = page.getByTestId("calculation-list-row").filter({ hasText: title });
  await expect(row).toBeVisible();
  await row.click();
  await expect(page.getByTestId("calculation-header")).toBeVisible();
  return page.url();
}
function headerForm(page: Page) { return page.getByTestId("calculation-header").locator("form").first(); }

for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 900 }]) {
  test(`E35-8-T-unknown / confirmed: lost committed response retains original handle through remount (${viewport.width})`, async ({ page, context }) => {
    await page.setViewportSize(viewport);
    const url = await ownCalculation(page);
    const form = headerForm(page);
    const title = `Committed ${crypto.randomUUID()}`;
    await hydrated(form.getByLabel("Titel"));
    await form.getByLabel("Titel").fill(title);
    let intercepted = 0;
    let originalBody = "";
    await page.route("**/calculations/**", async route => {
      const request = route.request();
      if (request.method() !== "POST" || !request.headers()["next-action"] || intercepted) return route.continue();
      intercepted++;
      originalBody = request.postData() ?? "";
      // Forward the REAL mutation and wait for the server result before dropping
      // only its response. Independent reread below proves persistence separately.
      await route.fetch();
      await route.abort("failed");
    });
    await form.getByRole("button", { name: "Spara titel" }).click();
    await expect.poll(() => intercepted).toBe(1);
    expect(originalBody).toMatch(/operation[_-]?id/i);
    await expect(form.getByText("Kalkylen har sparats.")).toHaveCount(0);
    await expect(form.getByRole("status")).toContainText(/obekräft|inte.*bekräft|okänt|osäkert/i);
    // Another read sees the write but does not prove the operation to this form.
    const observer = await context.newPage();
    await observer.goto(url);
    await expect(headerForm(observer).getByLabel("Titel")).toHaveValue(title);
    await observer.close();
    await page.unroute("**/calculations/**");
    await page.reload();
    const remounted = headerForm(page);
    await expect(remounted.getByLabel("Titel")).toHaveValue(title);
    await expect(remounted.getByText("Kalkylen har sparats.")).toHaveCount(0);
    // Reconciliation is explicit; remount/reconnect cannot submit a new write.
    await remounted.getByRole("button", { name: /kontrollera|stäm av/i }).click();
    await expect(remounted.getByRole("status")).toContainText(/sparats|bekräft/i);
    expect(intercepted).toBe(1);
  });
}

test("E35-8-T-stale: an original header decision cannot overwrite the other tab's confirmed edit", async ({ page, context }) => {
  const url = await ownCalculation(page);
  const other = await context.newPage();
  try {
    await other.goto(url);
    const stale = headerForm(page);
    const fresh = headerForm(other);
    await hydrated(fresh.getByLabel("Titel"));
    await stale.getByLabel("Titel").fill("Retained unsent old decision");
    const winner = `Newer ${crypto.randomUUID()}`;
    await fresh.getByLabel("Titel").fill(winner);
    await fresh.getByRole("button", { name: "Spara titel" }).click();
    await expect(fresh.getByRole("status")).toContainText(/sparats/);
    await stale.getByRole("button", { name: "Spara titel" }).click();
    await expect(stale.getByText("Kalkylen har sparats.")).toHaveCount(0);
    await expect(stale.getByRole("alert")).toContainText(/ändrat|ändrats|inaktuell|uppdatera/i);
    await expect(stale.getByLabel("Titel")).toHaveValue("Retained unsent old decision");
    await other.reload();
    await expect(headerForm(other).getByLabel("Titel")).toHaveValue(winner);
  } finally { await other.close(); }
});

test.fixme("E35-8-T-late-result: hold original A response, edit later draft B, then deliver A; only A is confirmed and B stays unsent");
test.fixme("P-6 remaining five real hosts: independent identities/original facts, duplicate suppression, retained unknown draft and explicit reconcile/replay");
test.fixme("E35-8-T-connection-required / submitting / error-retry: pre-dispatch failure is unsent; no automatic queue/replay on reconnect");
// Original seventeen Applies STATE/T identities and AC1–AC7, including AC6,
// remain in the approved test-design companion. These focused scaffolds do not
// replace its loading/denied/revoked/locked/dirty-navigation/focus obligations.
