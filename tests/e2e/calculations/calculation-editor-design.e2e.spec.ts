/** Story 35.8 presentation ATDD. Real production app and existing isolated fixture only.
 * Collection is not execution. The original calculation/tax/source/recovery suites remain
 * unchanged and own their money, authorization and original-operation invariants.
 */
import { test, expect, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

interface Fixture {
  adminA: { email: string; password: string };
  adminB: { email: string; password: string };
  calc: { id: string; title: string };
  blockerCalc: { id: string; title: string };
}

// globalSetup creates this file only for an actual run; --list needs no fixture.
function fixture(): Fixture {
  return JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
}

async function hydrated(control: Locator): Promise<void> {
  await control.waitFor({ state: "visible" });
  await control.evaluate(element => new Promise<void>(resolve => {
    const tick = () => Object.keys(element).some(key => key.startsWith("__react"))
      ? resolve() : requestAnimationFrame(tick);
    tick();
  }));
}

async function signIn(page: Page, account = fixture().adminA): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await hydrated(submit);
  await page.getByLabel("E-post").fill(account.email);
  await page.getByLabel("Lösenord").fill(account.password);
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard/);
}

function titleForm(page: Page): Locator {
  return page.getByTestId("calculation-header").locator("form").first();
}

async function ownCalculation(page: Page): Promise<{ url: string; title: string }> {
  await signIn(page);
  await page.goto("/calculations");
  const create = page.getByTestId("new-calculation");
  await hydrated(create);
  await create.click();
  const form = page.getByTestId("new-calculation-form");
  const title = `Anläggning Åsby ${crypto.randomUUID()}`;
  await form.getByLabel("Titel", { exact: true }).fill(title);
  await form.getByRole("combobox", { name: "Kund", exact: true }).selectOption({ index: 1 });
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  await form.getByRole("button", { name: "Skapa kalkyl", exact: true }).click();
  await expect(page).toHaveURL(/\/calculations\/[a-f0-9-]+$/);
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
  return { url: page.url(), title };
}

async function addSection(page: Page, title: string): Promise<Locator> {
  await page.getByTestId("add-section").click();
  const form = page.getByTestId("add-section-form");
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  await form.getByLabel("Sektionstitel", { exact: true }).fill(title);
  await form.getByRole("button", { name: "Skapa sektion", exact: true }).click();
  const section = page.getByTestId("section-editor").filter({ has: page.getByRole("heading", { level: 2, name: title, exact: true }) });
  await expect(section).toHaveCount(1);
  await expect(section.getByLabel("Sektionstitel", { exact: true })).toHaveValue(title);
  return section;
}

async function addRow(section: Locator): Promise<Locator> {
  await section.getByTestId("add-row").click();
  const form = section.getByTestId("row-create-form");
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  // Same established inputs as the existing P-6 real-app row fixture, not a UI formula.
  await form.getByRole("textbox", { name: "Antal", exact: true }).fill("1");
  await form.getByLabel("Enhet", { exact: true }).fill("h");
  await form.getByLabel("Kostnad (kr)", { exact: true }).fill("20");
  await form.getByLabel("Pris (kr)", { exact: true }).fill("100");
  await form.getByLabel("Moms (%)", { exact: true }).fill("25");
  await form.getByRole("button", { name: "Lägg till rad", exact: true }).click();
  const row = section.getByTestId("row-edit-form");
  await expect(row).toHaveCount(1);
  await expect(row).toHaveAttribute("data-editor-ready", "true");
  return row;
}

async function noHorizontalOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
}

async function phoneTarget(control: Locator): Promise<void> {
  await expect(control).toBeVisible();
  const bounds = await control.boundingBox();
  expect(bounds, "The actual control must have measurable geometry").not.toBeNull();
  expect(bounds!.width, "Phone target width must be at least 44 CSS px").toBeGreaterThanOrEqual(44);
  expect(bounds!.height, "Phone target height must be at least 44 CSS px").toBeGreaterThanOrEqual(44);
}

for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 900 }]) {
  test.describe(`Story 35.8 presentation ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, contextOptions: { reducedMotion: "reduce" } });

    test("E35-8-T-AC2 / AC4 / loaded: Swedish identity, authoritative totals and reachable controls", async ({ page }) => {
      await signIn(page);
      await page.goto("/calculations");
      await expect(page.getByRole("heading", { name: "Kalkyler", level: 1 })).toBeVisible();
      // First intended phone red assertion: current Ny kalkyl padding gives <44px height.
      if (viewport.width === 360) await phoneTarget(page.getByTestId("new-calculation"));
      const selected = page.getByTestId("calculation-list-row").filter({ hasText: fixture().calc.title });
      await expect(selected).toHaveAttribute("href", `/calculations/${fixture().calc.id}`);
      await selected.focus();
      await selected.press("Enter");
      await expect(page).toHaveURL(new RegExp(`/calculations/${fixture().calc.id}$`));
      await expect(page.getByRole("heading", { name: fixture().calc.title, level: 1, exact: true })).toBeVisible();
      const summary = page.getByTestId("totals-summary").filter({ visible: true });
      await expect(summary).toHaveCount(1);
      // Existing Story 5.2 golden fixture: reuse its exact rendered expectations.
      await expect(summary.getByTestId("summary-net")).toContainText("2200,00");
      await expect(summary.getByTestId("summary-vat")).toContainText("550,00");
      await expect(summary.getByTestId("summary-gross")).toContainText("2750,00");
      if (viewport.width === 360) {
        for (const control of [titleForm(page).getByRole("button", { name: "Spara titel", exact: true }),
          page.getByTestId("section-move-up").first(), page.getByTestId("row-move-down").first(),
          page.getByTestId("create-quote").filter({ visible: true })]) await phoneTarget(control);
      }
      await noHorizontalOverflow(page);
    });

    test("E35-8-T-AC1 / empty / confirmed: keyboard reorder persists stable IDs and preserves another draft", async ({ page }) => {
      const calculation = await ownCalculation(page);
      await expect(page.getByTestId("sections-empty")).toBeVisible();
      const first = await addSection(page, "Central Åsby");
      const second = await addSection(page, "Belysning Öster");
      const ids = () => page.getByTestId("section-editor").evaluateAll(sections => sections.map(section =>
        section.querySelector<HTMLInputElement>('form input[name="id"]')?.value ?? ""));
      const original = await ids();
      expect(original).toHaveLength(2);
      expect(new Set(original).size).toBe(2);
      expect(original.every(id => /^[0-9a-f-]{36}$/i.test(id))).toBe(true);
      await first.getByLabel("Sektionstitel", { exact: true }).fill("Osparad centraländring");
      const move = second.locator("xpath=..").getByTestId("section-move-up");
      await expect(move.locator("xpath=ancestor::form[1]")).toHaveAttribute("data-editor-ready", "true");
      await move.focus();
      await move.press("Enter");
      await expect.poll(ids).toEqual([original[1], original[0]]);
      await expect(first.getByLabel("Sektionstitel", { exact: true })).toHaveValue("Osparad centraländring");
      await expect(page.getByTestId("section-reorder-error")).toHaveCount(0);
      // A separate authenticated read proves ordering; it does not confirm the unsent rename.
      const observer = await page.context().newPage();
      try {
        await observer.goto(calculation.url);
        await expect(observer.getByTestId("section-title")).toHaveText(["Belysning Öster", "Central Åsby"]);
        await expect(observer.getByLabel("Sektionstitel", { exact: true }).last()).toHaveValue("Central Åsby");
      } finally { await observer.close(); }
    });

    test("E35-8-T-validation / AC4: invalid row keeps its identity and links the error to keyboard focus", async ({ page }) => {
      await ownCalculation(page);
      const section = await addSection(page, "Validering Åsby");
      const row = await addRow(section);
      const rowId = await row.locator('input[name="id"]').inputValue();
      const price = row.getByLabel("Pris (kr)", { exact: true });
      await price.fill("-50");
      await row.getByRole("button", { name: "Spara rad", exact: true }).click();
      await expect(price).toHaveAttribute("aria-invalid", "true");
      await expect(price).toHaveValue("-50");
      await expect(row.locator('input[name="id"]')).toHaveValue(rowId);
      await expect(row.getByTestId("row-saved")).toHaveCount(0);
      const errorId = await price.getAttribute("aria-describedby");
      expect(errorId).toBeTruthy();
      await expect(price).toHaveAccessibleDescription(/.+/);
      // FormErrorSummary supports linked fields; this caller must actually supply them.
      const correction = row.getByRole("alert").getByRole("link");
      await expect(correction).toHaveCount(1);
      await correction.focus();
      await correction.press("Enter");
      await expect(price).toBeFocused();
      await expect(price).toBeInViewport({ ratio: 1 });
      await price.fill("100");
      await row.getByRole("button", { name: "Spara rad", exact: true }).click();
      await expect(row.getByTestId("row-saved")).toBeVisible();
      await page.reload();
      await expect(page.getByTestId("row-edit-form").locator('input[name="id"]')).toHaveValue(rowId);
      await expect(page.getByTestId("row-edit-form").getByLabel("Pris (kr)", { exact: true })).toHaveValue("100,00");
    });

    test("E35-8-T-focus-dialog / AC5: existing section confirmation traps focus, Escape restores its trigger", async ({ page }) => {
      await ownCalculation(page);
      const section = await addSection(page, "Skyddad sektion Åsby");
      await addRow(section);
      const trigger = section.getByTestId("archive-section");
      await trigger.focus();
      await trigger.press("Enter");
      const dialog = section.getByRole("alertdialog", { name: "Bekräfta borttagning" });
      await expect(dialog).toBeVisible();
      expect(await dialog.evaluate(element => element.contains(document.activeElement)), "Opening the actual dialog must move focus inside").toBe(true);
      const cancel = dialog.getByTestId("archive-section-cancel");
      const confirm = dialog.getByTestId("archive-section-confirm-button");
      if (viewport.width === 360) { await phoneTarget(cancel); await phoneTarget(confirm); }
      await confirm.focus();
      await page.keyboard.press("Tab");
      await expect(cancel).toBeFocused();
      await page.keyboard.press("Shift+Tab");
      await expect(confirm).toBeFocused();
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(section.getByTestId("row-edit-form")).toHaveCount(1);
      await page.reload();
      await expect(page.getByTestId("row-edit-form")).toHaveCount(1);
    });

    test("E35-8-T-dirty-navigation / AC5: cancelling departure keeps route, record and unsent draft", async ({ page }) => {
      const calculation = await ownCalculation(page);
      const draft = "Osparad ändring i Åsby";
      await titleForm(page).getByLabel("Titel", { exact: true }).fill(draft);
      // Accept native or feature-owned accessible confirmation; never fake a saved result.
      const dismiss = async (dialog: import("@playwright/test").Dialog) => { await dialog.dismiss(); };
      page.on("dialog", dismiss);
      try {
        await page.getByTestId("calculation-editor").getByRole("link", { name: /Kalkyler/ }).click();
        const prompt = page.getByRole("dialog").or(page.getByRole("alertdialog")).filter({ hasText: /ospar|ändring|lämna/i });
        if (await prompt.isVisible()) await prompt.getByRole("button", { name: /Avbryt|Stanna/i }).click();
        await expect(page).toHaveURL(calculation.url);
        await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(draft);
        await expect(page.getByRole("heading", { name: calculation.title, exact: true })).toBeVisible();
        await expect(titleForm(page).getByText("Kalkylen har sparats.", { exact: true })).toHaveCount(0);
      } finally { page.off("dialog", dismiss); }
    });

    test("E35-8-T-no-match / AC6: filtering keeps no-match distinct from an empty authorized list", async ({ page }) => {
      await signIn(page);
      await page.goto("/calculations");
      const list = page.getByTestId("calculation-list");
      await expect(list.getByTestId("calculation-list-row").filter({ hasText: fixture().calc.title })).toBeVisible();
      const search = list.getByRole("searchbox");
      await expect(search).toHaveAccessibleName(/sök/i);
      const query = `Ingen träff ${crypto.randomUUID()}`;
      await search.fill(query);
      await expect(search).toHaveValue(query);
      await expect(list.getByTestId("calculation-list-row")).toHaveCount(0);
      await expect(list.getByTestId("calculation-list-empty")).toHaveCount(0);
      await expect(list.getByRole("status")).toContainText(/inga.*träff|ingen.*träff/i);
      await search.clear();
      await expect(list.getByTestId("calculation-list-row").filter({ hasText: fixture().calc.title })).toHaveAttribute("href", `/calculations/${fixture().calc.id}`);
    });

    test("E35-8-T-denied / AC6 / AC7: foreign detail is generic denial, never a successful empty editor", async ({ page }) => {
      await signIn(page, fixture().adminB);
      await page.goto(`/calculations/${fixture().calc.id}`);
      await expect(page.getByTestId("calculation-not-found")).toBeVisible();
      await expect(page.getByText(fixture().calc.title, { exact: true })).toHaveCount(0);
      await expect(page.getByTestId("calculation-editor")).toHaveCount(0);
      await expect(page.getByTestId("sections-empty")).toHaveCount(0);
    });

    test("E35-8-T-AC2 / AC3 / stale: STOP stays blocked; checked review rejects changed rows before a fresh review creates a quote", async ({ page }) => {
      const calculation = await ownCalculation(page);
      const section = await addSection(page, "Granskning Åsby");
      await addRow(section);
      const tax = page.getByTestId("tax-document-settings").locator("form");
      await expect(tax).toHaveAttribute("data-editor-ready", "true");
      await tax.getByRole("button", { name: "Spara skatte- och momsuppgifter", exact: true }).click();
      await expect(tax.getByRole("status")).toContainText(/sparats/);
      const open = page.getByTestId("create-quote").filter({ visible: true });
      await expect(open).toBeEnabled();
      await open.click();
      const preview = page.getByTestId("pre-quote-preview").filter({ visible: true });
      await expect(preview.locator("form")).toHaveAttribute("data-editor-ready", "true");
      const digest = await preview.locator('input[name="reviewed_snapshot_digest"]').inputValue();
      expect(digest).not.toBe("");
      const observer = await page.context().newPage();
      try {
        await observer.goto(calculation.url);
        const row = observer.getByTestId("row-edit-form");
        await expect(row).toHaveAttribute("data-editor-ready", "true");
        await row.getByLabel("Etikett (visas i offert)", { exact: true }).fill("Ändrad av separat flik");
        await row.getByRole("button", { name: "Spara rad", exact: true }).click();
        await expect(row.getByTestId("row-saved")).toBeVisible();
      } finally { await observer.close(); }
      // Submit the original real reviewed form, not a forged/minted digest or mocked success.
      await preview.getByTestId("confirm-create-quote-version").click();
      await expect(preview.getByRole("alert")).toContainText(/ändr|inaktuell|gransk|konflikt/i);
      await expect(page).toHaveURL(calculation.url);
      await page.reload();
      await page.getByTestId("create-quote").filter({ visible: true }).click();
      const refreshed = page.getByTestId("pre-quote-preview").filter({ visible: true });
      await expect(refreshed.locator('input[name="reviewed_snapshot_digest"]')).not.toHaveValue(digest);
      await expect(refreshed.getByTestId("preview-sections")).toContainText("Ändrad av separat flik");
      await expect(refreshed.locator("form")).toHaveAttribute("data-editor-ready", "true");
      await refreshed.getByTestId("confirm-create-quote-version").click();
      await expect(page).toHaveURL(/\/quotes\/[a-f0-9-]+\/versions\/[a-f0-9-]+$/);
      const quoteUrl = page.url();
      await page.reload();
      await expect(page).toHaveURL(quoteUrl);
      // Existing blocker fixture retains its actual STOP semantics (no invented zero/default).
      await page.goto(`/calculations/${fixture().blockerCalc.id}`);
      await expect(page.getByTestId("readiness-summary").filter({ visible: true })).toHaveAttribute("data-can-create-quote", "false");
      await expect(page.getByTestId("readiness-blocker-TOTAL_UNCOMPUTABLE").filter({ visible: true })).toBeVisible();
      await expect(page.getByTestId("create-quote").filter({ visible: true })).toBeDisabled();
    });
  });
}
