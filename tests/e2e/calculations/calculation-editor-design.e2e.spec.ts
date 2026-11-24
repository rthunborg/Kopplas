/** Story 35.8 presentation verification. Real production app and existing isolated fixture only.
 * Collection is not execution. The original calculation/tax/source/recovery suites remain
 * unchanged and own their money, authorization and original-operation invariants.
 */
import { test, expect, type ConsoleMessage, type Dialog, type Locator, type Page, type Request as BrowserRequest, type TestInfo } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

interface Fixture {
  adminA: { email: string; password: string };
  adminB: { email: string; password: string };
  tenantB: { id: string };
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
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  const title = `Anläggning Åsby ${crypto.randomUUID()}`;
  await form.getByRole("textbox", { name: "Titel", exact: true }).fill(title);
  await form.getByRole("combobox", { name: "Kund", exact: true }).selectOption({ index: 1 });
  await form.getByRole("button", { name: "Skapa kalkyl", exact: true }).click();
  await expect(page).toHaveURL(/\/calculations\/[a-f0-9-]+$/);
  await expect(page.getByRole("heading", { level: 1, name: title, exact: true })).toBeVisible();
  await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
  return { url: page.url(), title };
}

async function addSection(page: Page, title: string): Promise<Locator> {
  const form = page.getByTestId("add-section-form");
  // A confirmed create deliberately leaves this actual form mounted. Reuse it;
  // the second section must not wait for a button that no longer exists.
  if (!await form.isVisible()) await page.getByTestId("add-section").click();
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  await form.getByLabel("Sektionstitel (valfritt)", { exact: true }).fill(title);
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
  await form.getByRole("textbox", { name: "Enhet", exact: true }).fill("h");
  await form.getByLabel("Kostnad (kr)", { exact: true }).fill("20");
  await form.getByLabel("Pris (kr)", { exact: true }).fill("100");
  await form.getByRole("textbox", { name: "Moms (%)", exact: true }).fill("25");
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

/** Original, unmodified viewport PNG bytes in the existing JSON reporter body.
 * These are synthetic-fixture captures, not proof of persistence or acceptance.
 * The caller asserts the real state separately before and after the image. */
async function capture(page: Page, info: TestInfo, surface: string, state: string,
  recordId: string, focus: Locator, assertState: () => Promise<void>): Promise<void> {
  await focus.scrollIntoViewIfNeeded();
  await expect(focus).toBeInViewport();
  await assertState();
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Presentation capture needs its actual viewport");
  const captureId = `35-8-${surface}-${state}-${viewport.width}x${viewport.height}`;
  await info.attach(`${captureId}.png`, { body: await page.screenshot({ fullPage: false }), contentType: "image/png" });
  await assertState();
  await info.attach(`${captureId}.json`, { body: Buffer.from(JSON.stringify({
    captureId, surface, state, viewport, recordId, url: page.url(),
    syntheticFixture: true, outcome: "caller assertions executed separately; image is not outcome authority",
  })), contentType: "application/json" });
}

function departureLink(page: Page): Locator {
  return page.getByTestId("calculation-editor").getByRole("link", { name: /Kalkyler/ });
}

async function assertUnsent(page: Page, calculation: { url: string; title: string }, draft: string): Promise<void> {
  await expect(page).toHaveURL(calculation.url);
  await expect(page.getByRole("heading", { level: 1, name: calculation.title, exact: true })).toBeVisible();
  await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(draft);
  await expect(titleForm(page)).toHaveAttribute("data-editor-dirty", "true");
  await expect(titleForm(page).getByText("Kalkylen har sparats.", { exact: true })).toHaveCount(0);
}

/** Observe actual browser dialogs. Never replace confirm/beforeunload. Unexpected
 * dialogs are dismissed and recorded, so a broken guard fails without hanging. */
function nativePrompts(page: Page, decision: "accept" | "dismiss") {
  const seen: { type: string; message: string }[] = [];
  const pending: Promise<void>[] = [];
  const listener = (dialog: Dialog) => {
    seen.push({ type: dialog.type(), message: dialog.message() });
    const response = decision === "accept" ? dialog.accept() : dialog.dismiss();
    void response.catch(() => {});
    pending.push(response);
  };
  page.on("dialog", listener);
  return {
    seen,
    async settle() { await Promise.all(pending); },
    stop() { page.off("dialog", listener); },
  };
}

async function renderedFrame(page: Page): Promise<void> {
  await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
}

async function confirmOnce(page: Page, decision: "accept" | "dismiss", action: () => Promise<unknown>): Promise<void> {
  const prompts = nativePrompts(page, decision);
  try {
    await action();
    await expect.poll(() => prompts.seen.length).toBe(1);
    await prompts.settle();
    await renderedFrame(page);
    expect(prompts.seen).toHaveLength(1);
    expect(prompts.seen[0]?.type).toBe("confirm");
    expect(prompts.seen[0]?.message).toMatch(/osparade ändringar.*obekräftat resultat/i);
  } finally { prompts.stop(); }
}

function observeWrites(page: Page) {
  const writes: BrowserRequest[] = [];
  const listener = (request: BrowserRequest) => {
    if (request.method() === "POST" && request.headers()["next-action"] && request.postData()?.includes("operation_id")) writes.push(request);
  };
  page.on("request", listener);
  return { writes, stop: () => page.off("request", listener) };
}

// Same actual multipart request seam as the unchanged producer P-6 tests.
async function postedFields(request: BrowserRequest) {
  const parsed = await new Request("http://localhost", { method: "POST", headers: {
    "content-type": request.headers()["content-type"] ?? "",
  }, body: request.postData() ?? "" }).formData();
  return (name: string) => {
    const value = [...parsed].find(([key]) => key === name || key.endsWith(`_${name}`))?.[1];
    if (typeof value !== "string") throw new Error(`Missing actual editor field ${name}`);
    return value;
  };
}

/** Hold or lose only the response to one REAL server mutation. Every allocated
 * route/promise has bounded cleanup, including failure before release. */
async function interceptedWrite(page: Page, pattern: string, lose = false) {
  let intercepted = false, release!: () => void, complete!: () => void, fail!: (error: unknown) => void;
  const released = new Promise<void>(resolve => { release = resolve; });
  const completed = new Promise<void>((resolve, reject) => { complete = resolve; fail = reject; });
  void completed.catch(() => {});
  let upstreamDone = false;
  const handler: Parameters<Page["route"]>[1] = async route => {
    const request = route.request();
    if (request.method() !== "POST" || !request.headers()["next-action"] || !request.postData()?.includes("operation_id") || intercepted) return route.continue();
    intercepted = true;
    try {
      const response = await route.fetch({ timeout: 20_000 });
      upstreamDone = true;
      if (lose) await route.abort("failed");
      else { await released; await route.fulfill({ response }); }
      complete();
    } catch (error) { fail(error); await route.abort("failed").catch(() => {}); }
  };
  await page.route(pattern, handler);
  return {
    ready: () => upstreamDone, completed, release,
    async remove() {
      release();
      try { if (intercepted) await completed; }
      finally { await page.unroute(pattern, handler); }
    },
  };
}

async function preparedQuote(page: Page) {
  const calculation = await ownCalculation(page);
  const section = await addSection(page, "Granskning Åsby");
  await addRow(section);
  const tax = page.getByTestId("tax-document-settings").locator("form");
  await expect(tax).toHaveAttribute("data-editor-ready", "true");
  await tax.getByRole("button", { name: "Spara skatte- och momsuppgifter", exact: true }).click();
  await expect(tax.getByRole("status")).toContainText(/sparats/);
  await page.getByTestId("create-quote").click();
  const preview = page.getByTestId("pre-quote-preview");
  const form = preview.locator("form");
  await expect(form).toHaveAttribute("data-editor-ready", "true");
  await expect(form.locator('input[name="reviewed_snapshot_digest"]')).not.toHaveValue("");
  return { calculation, preview, form };
}

async function renderedQuote(page: Page, target: string): Promise<void> {
  await expect(page).toHaveURL(new URL(target, page.url()).href);
  await expect(page.getByTestId("quote-detail")).toBeVisible();
  await expect(page.getByTestId("quote-not-found")).toHaveCount(0);
  await expect(page.getByTestId("quote-detail-failed")).toHaveCount(0);
}

async function navigationEntry(page: Page) {
  return page.evaluate(() => {
    const navigation = (window as Window & { navigation?: {
      currentEntry?: { key: string; id: string; index: number; url: string };
    } }).navigation;
    const entry = navigation?.currentEntry;
    return { url: location.href, length: history.length,
      entry: entry ? { key: entry.key, id: entry.id, index: entry.index, url: entry.url } : null };
  });
}

for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 900 }]) {
  test.describe(`Story 35.8 presentation ${viewport.width}x${viewport.height}`, () => {
    test.use({ viewport, contextOptions: { reducedMotion: "reduce" } });

    test("E35-8-T-AC2 / AC4 / loaded: Swedish identity, authoritative totals and reachable controls", async ({ page }, info) => {
      await signIn(page);
      await page.goto("/calculations");
      await expect(page.getByRole("heading", { name: "Kalkyler", level: 1 })).toBeVisible();
      if (viewport.width === 360) await phoneTarget(page.getByTestId("new-calculation"));
      const selected = page.getByTestId("calculation-list-row").filter({ hasText: fixture().calc.title });
      await expect(selected).toHaveAttribute("href", `/calculations/${fixture().calc.id}`);
      await capture(page, info, "calculation-list", "loaded", fixture().calc.id, selected, async () => {
        await expect(selected).toHaveAttribute("href", `/calculations/${fixture().calc.id}`);
        await expect(selected).toContainText(fixture().calc.title);
      });
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
      await capture(page, info, "calculation-editor", "loaded", fixture().calc.id, titleForm(page), async () => {
        await expect(page.getByRole("heading", { level: 1, name: fixture().calc.title, exact: true })).toBeVisible();
        await expect(titleForm(page).locator('input[name="id"]')).toHaveValue(fixture().calc.id);
      });
      const section = page.getByTestId("section-editor").first();
      await capture(page, info, "section-editor", "loaded", fixture().calc.id, section.getByTestId("section-title"), async () => {
        await expect(section.getByTestId("row-edit-form").first()).toBeVisible();
      });
      await capture(page, info, "row-editor", "loaded", fixture().calc.id,
        section.getByTestId("row-edit-form").first().getByLabel("Pris (kr)", { exact: true }), async () => {
          await expect(section.getByTestId("row-edit-form").first().locator('input[name="id"]')).not.toHaveValue("");
        });
      await capture(page, info, "calculation-totals", "loaded", fixture().calc.id, summary, async () => {
        await expect(summary.getByTestId("summary-net")).toContainText("2200,00");
        await expect(summary.getByTestId("summary-vat")).toContainText("550,00");
        await expect(summary.getByTestId("summary-gross")).toContainText("2750,00");
      });
    });

    test("E35-8-T-AC1 / empty / confirmed: keyboard reorder persists stable IDs and preserves another draft", async ({ page }, info) => {
      const calculation = await ownCalculation(page);
      await expect(page.getByTestId("sections-empty")).toBeVisible();
      await capture(page, info, "calculation-editor", "empty", calculation.url.split("/").at(-1)!, page.getByTestId("sections-empty"), async () => {
        await expect(page.getByTestId("section-editor")).toHaveCount(0);
        await expect(page.getByRole("heading", { name: calculation.title, exact: true })).toBeVisible();
      });
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
      await capture(page, info, "section-editor", "reordered-with-draft", original[0]!, first.getByLabel("Sektionstitel", { exact: true }), async () => {
        expect(await ids()).toEqual([original[1], original[0]]);
        await expect(first.getByLabel("Sektionstitel", { exact: true })).toHaveValue("Osparad centraländring");
      });
      // A separate authenticated read proves ordering; it does not confirm the unsent rename.
      const observer = await page.context().newPage();
      try {
        await observer.goto(calculation.url);
        await expect(observer.getByTestId("section-title")).toHaveText(["Belysning Öster", "Central Åsby"]);
        await expect(observer.getByLabel("Sektionstitel", { exact: true }).last()).toHaveValue("Central Åsby");
      } finally { await observer.close(); }
    });

    test("E35-8-T-validation / AC4: invalid row keeps its identity and links the error to keyboard focus", async ({ page }, info) => {
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
      await capture(page, info, "row-editor", "validation", rowId, price, async () => {
        await expect(price).toHaveValue("-50");
        await expect(price).toHaveAttribute("aria-invalid", "true");
        await expect(price).toBeFocused();
        await expect(row.getByTestId("row-saved")).toHaveCount(0);
      });
      await price.fill("100");
      await row.getByRole("button", { name: "Spara rad", exact: true }).click();
      await expect(row.getByTestId("row-saved")).toBeVisible();
      await page.reload();
      await expect(page.getByTestId("row-edit-form").locator('input[name="id"]')).toHaveValue(rowId);
      await expect(page.getByTestId("row-edit-form").getByLabel("Pris (kr)", { exact: true })).toHaveValue("100,00");
      await capture(page, info, "row-editor", "corrected-reread", rowId,
        page.getByTestId("row-edit-form").getByLabel("Pris (kr)", { exact: true }), async () => {
          await expect(page.getByTestId("row-edit-form").locator('input[name="id"]')).toHaveValue(rowId);
          await expect(page.getByTestId("row-edit-form").getByLabel("Pris (kr)", { exact: true })).toHaveValue("100,00");
        });
    });

    test("E35-8-T-focus-dialog / AC5: existing section confirmation traps focus, Escape restores its trigger", async ({ page }, info) => {
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
      await expect(dialog).toHaveAccessibleDescription(/.+/);
      await capture(page, info, "section-editor", "focus-dialog", await section.locator('form input[name="id"]').first().inputValue(), dialog, async () => {
        await expect(dialog).toBeVisible();
        expect(await dialog.evaluate(element => element.contains(document.activeElement))).toBe(true);
      });
      await page.keyboard.press("Escape");
      await expect(dialog).toHaveCount(0);
      await expect(trigger).toBeFocused();
      await expect(section.getByTestId("row-edit-form")).toHaveCount(1);
      await page.reload();
      await expect(page.getByTestId("row-edit-form")).toHaveCount(1);
    });

    test("E35-8-T-dirty-navigation / AC5: cancelling departure keeps route, record and unsent draft", async ({ page }, info) => {
      const calculation = await ownCalculation(page);
      const draft = "Osparad ändring i Åsby";
      const writes = observeWrites(page);
      const clean = nativePrompts(page, "dismiss");
      try {
        await departureLink(page).click();
        await expect(page).toHaveURL(/\/calculations$/);
        await expect(page.getByRole("heading", { name: "Kalkyler", level: 1 })).toBeVisible();
        await renderedFrame(page);
        expect(clean.seen).toHaveLength(0);
      } catch (error) { writes.stop(); throw error; }
      finally { clean.stop(); }
      try {
        await page.getByTestId("calculation-list-row").filter({ hasText: calculation.title }).click();
        await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
        await titleForm(page).getByLabel("Titel", { exact: true }).fill(draft);
        await confirmOnce(page, "dismiss", () => departureLink(page).click());
        await assertUnsent(page, calculation, draft);
        expect(writes.writes).toHaveLength(0);
        await capture(page, info, "calculation-header", "departure-cancelled", calculation.url.split("/").at(-1)!, titleForm(page), async () => {
          await assertUnsent(page, calculation, draft);
          expect(writes.writes).toHaveLength(0);
        });
        await confirmOnce(page, "accept", () => departureLink(page).click());
        await expect(page).toHaveURL(/\/calculations$/);
        await expect(page.getByRole("heading", { name: "Kalkyler", level: 1 })).toBeVisible();
        expect(writes.writes).toHaveLength(0);
        await page.getByTestId("calculation-list-row").filter({ hasText: calculation.title }).click();
        await expect(page.getByRole("heading", { name: calculation.title, level: 1, exact: true })).toBeVisible();
        await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(calculation.title);
        await expect(titleForm(page)).toHaveAttribute("data-editor-dirty", "false");
        expect(writes.writes).toHaveLength(0);
      } finally { writes.stop(); }
    });

    test("E35-8-T-no-match / AC6: filtering keeps no-match distinct from an empty authorized list", async ({ page }, info) => {
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
      await capture(page, info, "calculation-list", "no-match", fixture().calc.id, list.getByRole("status"), async () => {
        await expect(search).toHaveValue(query);
        await expect(list.getByTestId("calculation-list-row")).toHaveCount(0);
        await expect(list.getByTestId("calculation-list-empty")).toHaveCount(0);
      });
      await search.clear();
      await expect(list.getByTestId("calculation-list-row").filter({ hasText: fixture().calc.title })).toHaveAttribute("href", `/calculations/${fixture().calc.id}`);
    });

    test("E35-8-T-empty / AC6: successful other-tenant list has its real empty next action", async ({ page }, info) => {
      await signIn(page, fixture().adminB);
      await page.goto("/calculations");
      const list = page.getByTestId("calculation-list");
      await expect(list.getByTestId("calculation-list-empty")).toBeVisible();
      await expect(list.getByTestId("calculation-list-row")).toHaveCount(0);
      await expect(list.getByTestId("calculation-list-error")).toHaveCount(0);
      await capture(page, info, "calculation-list", "empty", fixture().tenantB.id, list.getByTestId("calculation-list-empty"), async () => {
        await expect(list.getByTestId("calculation-list-empty")).toContainText("Inga kalkyler ännu");
        await expect(list.getByTestId("new-calculation")).toBeVisible();
        await expect(list).not.toContainText(fixture().calc.title);
      });
    });

    test("E35-8-T-dirty-navigation / native beforeunload: real reload cancel and accept preserve authority", async ({ page }, info) => {
      const calculation = await ownCalculation(page);
      const draft = "Osparad före omladdning Åsby";
      await titleForm(page).getByLabel("Titel", { exact: true }).fill(draft);
      const writes = observeWrites(page);
      const cancel = nativePrompts(page, "dismiss");
      try {
        // Genuine reload dispatches the browser's native beforeunload event.
        await page.evaluate(() => location.reload());
        await expect.poll(() => cancel.seen.length).toBe(1);
        await cancel.settle();
        await assertUnsent(page, calculation, draft);
        await renderedFrame(page);
        expect(cancel.seen.map(dialog => dialog.type)).toEqual(["beforeunload"]);
        expect(writes.writes).toHaveLength(0);
        await capture(page, info, "calculation-header", "native-unload-cancelled", calculation.url.split("/").at(-1)!, titleForm(page), async () => {
          await assertUnsent(page, calculation, draft);
          expect(writes.writes).toHaveLength(0);
        });
      } catch (error) { writes.stop(); throw error; }
      finally { cancel.stop(); }
      const accept = nativePrompts(page, "accept");
      try {
        await page.evaluate(() => location.reload());
        await expect.poll(() => accept.seen.length).toBe(1);
        await accept.settle();
        await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(calculation.title);
        await expect(titleForm(page)).toHaveAttribute("data-editor-dirty", "false");
        await expect(page.getByRole("heading", { level: 1, name: calculation.title, exact: true })).toBeVisible();
        expect(accept.seen.map(dialog => dialog.type)).toEqual(["beforeunload"]);
        expect(writes.writes).toHaveLength(0);
      } finally { accept.stop(); writes.stop(); }
    });

    for (const direction of ["back", "forward"] as const) {
      test(`E35-8-T-dirty-navigation / ${direction}: supported cancellable traversal protects pre-commit entry`, async ({ page }, info) => {
        const calculation = await ownCalculation(page);
        await departureLink(page).click();
        await expect(page.getByRole("heading", { level: 1, name: "Kalkyler", exact: true })).toBeVisible();
        let destinationEntry = await navigationEntry(page);
        await page.getByTestId("calculation-list-row").filter({ hasText: calculation.title }).click();
        await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
        if (direction === "forward") {
          await departureLink(page).click();
          await expect(page.getByRole("heading", { level: 1, name: "Kalkyler", exact: true })).toBeVisible();
          destinationEntry = await navigationEntry(page);
          await page.evaluate(() => history.back());
          await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
        }
        const before = await navigationEntry(page);
        if (!before.entry) {
          if (direction === "forward") throw new Error("Forward witness requires the actual native Navigation API/currentEntry");
          info.annotations.push({ type: "compatibility-gap", description: `${direction}: native Navigation API/currentEntry absent; AC5 history proof UNPASSED` });
          test.skip(true, "Compatibility gap: no actual Navigation API entry; this is not passing history proof");
        }
        if (direction === "forward" && !destinationEntry.entry) throw new Error("Forward witness requires its original link-created native target entry");
        const draft = `Osparad ${direction} Åsby`;
        await titleForm(page).getByLabel("Titel", { exact: true }).fill(draft);
        const writes = observeWrites(page);
        // Passive observation only. No fake API, sentinel, compensating popstate,
        // pushState/replaceState, or interception added by the test.
        let traversalPhase: "cancel" | "accept" = "cancel";
        type EntryFacts = { key: string; id: string; url: string; index: number };
        const events: { phase: string; cancelable: boolean; defaultPrevented: boolean; sameDocument: boolean; url: string; type: string;
          key?: string; index?: number; currentEntry?: EntryFacts | null; topLevel?: boolean; entryCount?: number; length?: number }[] = [];
        const forwardStates: { phase: string; state: unknown }[] = [];
        const forwardPrompts: { phase: string; type: string }[] = [];
        const forwardSettlements: { phase: string; result: unknown }[] = [];
        const expectedCurrent = Object.freeze({ ...before.entry! });
        const expectedForward = Object.freeze({ ...destinationEntry.entry! });
        const forwardCounts = direction === "forward" ? await page.evaluate(() => {
          const navigation = (window as Window & { navigation?: { entries?: () => unknown[] } }).navigation;
          if (!navigation?.entries) throw new Error("Forward witness requires native Navigation.entries");
          return { topLevel: window === window.top, entryCount: navigation.entries().length, length: history.length };
        }) : null;
        const markerSelector = '[data-testid="calculation-editor"] [data-editor-dirty], [data-testid="calculation-editor"] [data-editor-protected]';
        const forwardMarkers = direction === "forward" ? await page.locator(markerSelector).evaluateAll(elements => elements.map(element => ({
          testId: element.getAttribute("data-testid"), dirty: element.getAttribute("data-editor-dirty"), protected: element.getAttribute("data-editor-protected"),
        }))) : null;
        // Only the existing adjacent top-level Forward slot qualifies; no new entry/state or fallback.
        const invokeForward = async (phase: "cancel" | "accept") => {
          const result = await page.evaluate(async ({ current, target, counts }) => {
            type Entry = { key: string; id: string; url: string; index: number };
            const navigation = (window as Window & { navigation?: {
              currentEntry?: Entry; entries?: () => Entry[];
              traverseTo?: (key: string) => { committed: Promise<Entry>; finished: Promise<Entry> };
            } }).navigation;
            if (!navigation?.currentEntry || !navigation.entries || !navigation.traverseTo || !counts) {
              throw new Error("Forward witness requires actual native entries/currentEntry/traverseTo");
            }
            const facts = (entry: Entry) => ({ key: entry.key, id: entry.id, url: entry.url, index: entry.index });
            const entries = navigation.entries();
            const adjacent = entries[navigation.currentEntry.index + 1];
            const invocation = { topLevel: window === window.top, entryCount: entries.length, length: history.length,
              currentEntry: facts(navigation.currentEntry), adjacent: adjacent ? facts(adjacent) : null };
            if (!invocation.topLevel || invocation.topLevel !== counts.topLevel || invocation.entryCount !== counts.entryCount ||
              invocation.length !== counts.length || location.href !== current.url ||
              invocation.currentEntry.key !== current.key || invocation.currentEntry.id !== current.id ||
              invocation.currentEntry.url !== current.url || invocation.currentEntry.index !== current.index || !adjacent ||
              adjacent.key !== target.key || adjacent.url !== target.url || adjacent.index !== target.index || target.index !== current.index + 1) {
              throw new Error("Forward witness lost its frozen current identity/counts or exact adjacent target key/URL/index");
            }
            const fulfilled = (entry: Entry) => ({ status: "fulfilled" as const, ...facts(entry) });
            const rejected = (error: unknown) => ({ status: "rejected" as const,
              domException: error instanceof DOMException, name: error instanceof Error ? error.name : typeof error });
            const native = navigation.traverseTo(target.key);
            // Attach BOTH rejection handlers immediately, before awaiting either native promise.
            const committed = native.committed.then(fulfilled, rejected);
            const finished = native.finished.then(fulfilled, rejected);
            const outcomes = await Promise.all([committed, finished]);
            return { invocation, committed: outcomes[0]!, finished: outcomes[1]! };
          }, { current: expectedCurrent, target: expectedForward, counts: forwardCounts });
          forwardSettlements.push({ phase, result });
          return result;
        };
        const assertForwardEvent = (phase: "cancel" | "accept", defaultPrevented: boolean) => {
          const actual = events.filter(event => event.phase === phase);
          expect(actual, "Each Forward phase needs exactly one actual native event").toHaveLength(1);
          expect(actual[0]).toEqual({ phase, cancelable: true, defaultPrevented, sameDocument: true, type: "traverse",
            key: expectedForward.key, index: expectedForward.index, url: expectedForward.url,
            currentEntry: expectedCurrent, ...forwardCounts });
        };
        const assertForwardCounts = async (retainMarkers = false) => {
          expect(await page.evaluate(() => {
            const navigation = (window as Window & { navigation?: { entries?: () => unknown[] } }).navigation;
            return { topLevel: window === window.top, entryCount: navigation?.entries?.().length ?? null, length: history.length };
          })).toEqual(forwardCounts);
          if (retainMarkers) expect(await page.locator(markerSelector).evaluateAll(elements => elements.map(element => ({
            testId: element.getAttribute("data-testid"), dirty: element.getAttribute("data-editor-dirty"), protected: element.getAttribute("data-editor-protected"),
          })))).toEqual(forwardMarkers);
        };
        const promptListener = (dialog: Dialog) => {
          if (direction === "forward" && forwardPrompts.length < 8) forwardPrompts.push({ phase: traversalPhase, type: dialog.type() });
        };
        // Bounded snapshots observe both real actions without changing history or guards.
        const recordForwardState = async (phase: string) => {
          if (direction !== "forward") return;
          const state = await page.evaluate(() => {
            type Entry = { key: string; id: string; url: string; index: number };
            const navigation = (window as Window & { navigation?: {
              currentEntry?: Entry; entries?: () => Entry[];
            } }).navigation;
            const entryFacts = (entry: Entry) => ({ key: entry.key, id: entry.id, url: entry.url, index: entry.index });
            const entries = navigation?.entries?.();
            const markers = Array.from(document.querySelectorAll('[data-testid="calculation-editor"] [data-editor-dirty], [data-testid="calculation-editor"] [data-editor-protected]'));
            return { topLevel: window === window.top, url: location.href, length: history.length,
              currentEntry: navigation?.currentEntry ? entryFacts(navigation.currentEntry) : null,
              entriesAvailable: entries !== undefined, entryCount: entries?.length ?? null,
              entries: entries?.slice(0, 32).map(entryFacts) ?? [], entriesTruncated: (entries?.length ?? 0) > 32,
              markerCount: markers.length, markersTruncated: markers.length > 32,
              markers: markers.slice(0, 32).map(element => ({ testId: element.getAttribute("data-testid"),
                dirty: element.getAttribute("data-editor-dirty"), protected: element.getAttribute("data-editor-protected") })) };
          }).catch(error => ({ unavailable: String(error).slice(0, 240) }));
          forwardStates.push({ phase, state });
        };
        const consoleListener = (message: ConsoleMessage) => {
          const prefix = "E35_8_TRAVERSAL_OBSERVED ";
          if (message.text().startsWith(prefix)) events.push({ ...JSON.parse(message.text().slice(prefix.length)), phase: traversalPhase });
        };
        page.on("console", consoleListener);
        page.on("dialog", promptListener);
        const observation = await page.evaluateHandle(forward => {
          type Entry = { key: string; id: string; url: string; index: number };
          const navigation = (window as Window & { navigation?: EventTarget & { currentEntry?: Entry; entries?: () => Entry[] } }).navigation;
          const listener = (event: Event) => {
            const movement = event as Event & { navigationType: string; destination: { sameDocument: boolean; url: string; key: string; index: number } };
            // The passive observation reaches Node even when an unsupported
            // cross-document traverse destroys this document's JS handles.
            if (forward || movement.navigationType === "traverse") {
              const current = navigation?.currentEntry;
              console.debug("E35_8_TRAVERSAL_OBSERVED " + JSON.stringify({ cancelable: event.cancelable, defaultPrevented: event.defaultPrevented,
                sameDocument: movement.destination.sameDocument, url: movement.destination.url, type: movement.navigationType,
                ...(forward ? { key: movement.destination.key, index: movement.destination.index, topLevel: window === window.top,
                  entryCount: navigation?.entries?.().length, length: history.length,
                  currentEntry: current ? { key: current.key, id: current.id, url: current.url, index: current.index } : null } : {}) }));
            }
          };
          navigation?.addEventListener("navigate", listener);
          return { remove: () => navigation?.removeEventListener("navigate", listener) };
        }, direction === "forward");
        const prompts = nativePrompts(page, "dismiss");
        try {
          await recordForwardState("before-cancel");
          try {
            const cancelled = direction === "forward" ? await invokeForward("cancel") : await page.evaluate(() => history.back());
            await expect.poll(() => events.length).toBe(1);
            const actual = events[0]!;
            await info.attach(`history-${direction}-observed.json`, { body: Buffer.from(JSON.stringify({ before, actual })), contentType: "application/json" });
            if (direction === "back" && (!actual.cancelable || !actual.sameDocument)) {
              info.annotations.push({ type: "compatibility-gap", description: `${direction}: actual traverse cancelable=${actual.cancelable}, sameDocument=${actual.sameDocument}; AC5 history proof UNPASSED` });
              test.skip(true, "Compatibility gap: actual traversal is not cancellable same-document navigation");
            }
            await expect.poll(() => prompts.seen.length).toBe(1);
            await prompts.settle();
            await assertUnsent(page, calculation, draft);
            await renderedFrame(page);
            expect(prompts.seen.map(dialog => dialog.type)).toEqual(["confirm"]);
            expect(actual.defaultPrevented, "The real traverse must be cancelled before its history commit").toBe(true);
            if (direction === "forward") {
              expect(cancelled!.committed).toEqual({ status: "rejected", domException: true, name: "AbortError" });
              expect(cancelled!.finished).toEqual({ status: "rejected", domException: true, name: "AbortError" });
              assertForwardEvent("cancel", true);
              expect(prompts.seen[0]?.message).toMatch(/osparade ändringar.*obekräftat resultat/i);
              await assertForwardCounts(true);
            }
            expect(await navigationEntry(page)).toEqual(before);
            expect(writes.writes).toHaveLength(0);
            await capture(page, info, "calculation-header", `${direction}-cancelled`, calculation.url.split("/").at(-1)!, titleForm(page), async () => {
              await assertUnsent(page, calculation, draft);
              expect(await navigationEntry(page)).toEqual(before);
              if (direction === "forward") await assertForwardCounts(true);
              expect(writes.writes).toHaveLength(0);
            });
          } finally { prompts.stop(); }
          await recordForwardState("before-accept");
          traversalPhase = "accept";
          const acceptedWrites = observeWrites(page);
          try {
            await confirmOnce(page, "accept", async () => {
              if (direction === "back") return page.evaluate(() => history.back());
              const accepted = await invokeForward("accept");
              for (const outcome of [accepted.committed, accepted.finished]) {
                expect(outcome).toMatchObject({ status: "fulfilled", key: expectedForward.key, url: expectedForward.url, index: expectedForward.index });
              }
            });
            if (direction === "forward") {
              await expect.poll(() => events.filter(event => event.phase === "accept").length).toBe(1);
              assertForwardEvent("accept", false);
              expect(events).toHaveLength(2);
              await assertForwardCounts();
            }
            await recordForwardState("after-accept");
            await expect(page).toHaveURL(/\/calculations$/);
            await expect(page.getByRole("heading", { level: 1, name: "Kalkyler", exact: true })).toBeVisible();
            const after = await navigationEntry(page);
            expect(after.length).toBe(before.length);
            expect(after.entry?.index).toBe(before.entry!.index + (direction === "back" ? -1 : 1));
            if (direction === "back") {
              await info.attach("history-back-accepted.json", { body: Buffer.from(JSON.stringify({ destinationEntry, after })), contentType: "application/json" });
              // Accepted traversal preserves the entry key/URL/index; its document ID may change.
              expect({ key: after.entry?.key, url: after.entry?.url, index: after.entry?.index }).toEqual({
                key: destinationEntry.entry?.key, url: destinationEntry.entry?.url, index: destinationEntry.entry?.index,
              });
            } else {
              await info.attach("history-forward-accepted.json", { body: Buffer.from(JSON.stringify({ destinationEntry, after, settlements: forwardSettlements })), contentType: "application/json" });
              // As with accepted Back, IDs are evidence; stable key/URL/index remain mandatory.
              expect({ key: after.entry?.key, url: after.entry?.url, index: after.entry?.index }).toEqual({
                key: expectedForward.key, url: expectedForward.url, index: expectedForward.index,
              });
            }
            expect(acceptedWrites.writes).toHaveLength(0);
            await page.getByTestId("calculation-list-row").filter({ hasText: calculation.title }).click();
            await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(calculation.title);
            expect(acceptedWrites.writes).toHaveLength(0);
          } finally { acceptedWrites.stop(); }
        } catch (error) {
          if (direction === "forward") {
            await recordForwardState("failure");
            await info.attach("history-forward-diagnostic.json", { body: Buffer.from(JSON.stringify({
              before, destinationEntry, states: forwardStates, eventCount: events.length,
              events: events.slice(0, 8), prompts: forwardPrompts, settlements: forwardSettlements,
              failure: String(error).slice(0, 400), observationOnly: true,
            })), contentType: "application/json" });
          }
          throw error;
        } finally {
          prompts.stop();
          page.off("console", consoleListener);
          page.off("dialog", promptListener);
          // Keep the passive observer through both actions; acceptance may replace the document.
          await observation.evaluate(value => value.remove()).catch(error => {
            if (!(error instanceof Error) || !/Execution context was destroyed|Cannot find context|JSHandle is disposed/i.test(error.message)) throw error;
          });
          await observation.dispose();
          writes.stop();
        }
      });
    }

    test("E35-8-T-late-result / AC5: confirmed quote departure cannot discard another mounted draft", async ({ page, context }, info) => {
      const { calculation, preview, form } = await preparedQuote(page);
      const digest = await form.locator('input[name="reviewed_snapshot_digest"]').inputValue();
      const captureDate = await form.locator('input[name="reviewed_quote_capture_date"]').inputValue();
      const writes = observeWrites(page);
      const response = await interceptedWrite(page, "**/calculations/**");
      const prompts = nativePrompts(page, "dismiss");
      const observer = await context.newPage();
      try {
        await preview.getByTestId("confirm-create-quote-version").click();
        await expect.poll(response.ready).toBe(true);
        expect(writes.writes).toHaveLength(1);
        const original = await postedFields(writes.writes[0]!);
        expect(original("operation_id")).toMatch(/^[0-9a-f-]{36}$/i);
        expect(JSON.parse(original("expected"))).toMatchObject({ form: "reviewed-initial-quote", reviewed_snapshot_digest: digest, reviewed_quote_capture_date: captureDate });
        const draft = "Osparad efter offertbegäran Åsby";
        await titleForm(page).getByLabel("Titel", { exact: true }).fill(draft);
        response.release();
        await response.completed;
        await expect.poll(() => prompts.seen.length).toBe(1);
        await prompts.settle();
        await assertUnsent(page, calculation, draft);
        const result = page.getByTestId("pre-quote").getByRole("link", { name: "Öppna skapad offertversion", exact: true });
        await expect(result).toBeVisible();
        const target = await result.getAttribute("href");
        if (!target) throw new Error("Real confirmed quote has no authoritative destination");
        await expect(preview.getByTestId("confirm-create-quote-version")).toBeDisabled();
        await observer.goto(target);
        await renderedQuote(observer, target);
        await expect(observer.getByTestId("quote-version-snapshot")).toHaveAttribute("data-version-id", target.split("/").at(-1)!);
        await expect(observer.getByTestId("quote-source-calculation").getByRole("link")).toHaveAttribute("href", new URL(calculation.url).pathname);
        await expect(observer.getByTestId("quote-accepted-price")).toContainText("125,00");
        await observer.goto(calculation.url);
        await expect(titleForm(observer).getByLabel("Titel", { exact: true })).toHaveValue(calculation.title);
        // A resize/re-render cannot trigger another push, prompt, or mutation.
        const mount = await titleForm(page).elementHandle();
        if (!mount) throw new Error("Missing mounted draft form");
        try {
          await page.setViewportSize({ width: viewport.width + 1, height: viewport.height });
          await page.setViewportSize(viewport);
          await renderedFrame(page);
          await assertUnsent(page, calculation, draft);
          expect(await mount.evaluate(node => node.isConnected)).toBe(true);
          expect(prompts.seen.map(dialog => dialog.type)).toEqual(["confirm"]);
          expect(writes.writes).toHaveLength(1);
          await capture(page, info, "calculation-header", "quote-success-later-draft", calculation.url.split("/").at(-1)!, titleForm(page), async () => {
            await assertUnsent(page, calculation, draft);
            await expect(result).toHaveAttribute("href", target);
            expect(writes.writes).toHaveLength(1);
          });
          await capture(page, info, "pre-quote-preview", "confirmed-departure-cancelled", calculation.url.split("/").at(-1)!, result, async () => {
            await expect(result).toHaveAttribute("href", target);
            await expect(preview.getByTestId("confirm-create-quote-version")).toBeDisabled();
            expect(writes.writes).toHaveLength(1);
          });
        } finally { await mount.dispose(); }
        prompts.stop();
        await confirmOnce(page, "accept", () => result.click());
        await renderedQuote(page, target);
        expect(writes.writes).toHaveLength(1);
      } finally {
        prompts.stop();
        writes.stop();
        response.release();
        const cleanup = await Promise.allSettled([response.remove(), observer.close()]);
        const failed = cleanup.filter((value): value is PromiseRejectedResult => value.status === "rejected");
        if (failed.length) throw new AggregateError(failed.map(value => value.reason), "Quote departure cleanup failed");
      }
    });

    test("E35-8-T-dirty-navigation / form hide: clean hides freely; dirty cancel and protected handle survive", async ({ page }, info) => {
      await signIn(page);
      await page.goto("/calculations");
      const toggle = page.getByTestId("new-calculation");
      await hydrated(toggle);
      const form = page.getByTestId("new-calculation-form");
      const clean = nativePrompts(page, "dismiss");
      try {
        await toggle.click();
        await expect(form).toHaveAttribute("data-editor-ready", "true");
        await toggle.click();
        await expect(form).toHaveCount(0);
        await renderedFrame(page);
        expect(clean.seen).toHaveLength(0);
      } finally { clean.stop(); }
      await toggle.click();
      await expect(form).toHaveAttribute("data-editor-ready", "true");
      const draft = "Osparad ny kalkyl Åsby";
      await form.getByRole("textbox", { name: "Titel", exact: true }).fill(draft);
      const writes = observeWrites(page);
      try {
        await confirmOnce(page, "dismiss", () => toggle.click());
        await expect(form.getByRole("textbox", { name: "Titel", exact: true })).toHaveValue(draft);
        await expect(form).toHaveAttribute("data-editor-dirty", "true");
        await expect(toggle).toHaveAttribute("aria-expanded", "true");
        expect(writes.writes).toHaveLength(0);
        await capture(page, info, "calculation-list", "dirty-hide-cancelled", "unsent-new-calculation", form, async () => {
          await expect(form.getByRole("textbox", { name: "Titel", exact: true })).toHaveValue(draft);
          expect(writes.writes).toHaveLength(0);
        });
        await confirmOnce(page, "accept", () => toggle.click());
        await expect(form).toHaveCount(0);
        expect(writes.writes).toHaveLength(0);
        await toggle.click();
        await expect(form).toHaveAttribute("data-editor-ready", "true");
        await expect(form.getByRole("textbox", { name: "Titel", exact: true })).toHaveValue("");
        const title = `Skyddad ny kalkyl Åsby ${crypto.randomUUID()}`;
        await form.getByRole("textbox", { name: "Titel", exact: true }).fill(title);
        await form.getByRole("combobox", { name: "Kund", exact: true }).selectOption({ index: 1 });
        const loss = await interceptedWrite(page, "**/calculations", true);
        try {
          await form.getByRole("button", { name: "Skapa kalkyl", exact: true }).click();
          await loss.completed;
          await expect(form.getByRole("status")).toContainText(/obekräftat/i);
          expect(writes.writes).toHaveLength(1);
          const original = await postedFields(writes.writes[0]!);
          const handles = () => page.evaluate(() => Object.entries(sessionStorage).filter(([key]) => key.startsWith("kopplas/editor/v1/") && key.endsWith("/new/calculation")));
          const retained = await handles();
          expect(retained).toHaveLength(1);
          expect(JSON.parse(retained[0]![1]).operationId).toBe(original("operation_id"));
          await confirmOnce(page, "dismiss", () => toggle.click());
          await expect(form.getByRole("textbox", { name: "Titel", exact: true })).toHaveValue(title);
          await expect(form.getByRole("button", { name: "Kontrollera resultat", exact: true })).toBeVisible();
          expect(await handles()).toEqual(retained);
          await confirmOnce(page, "accept", () => toggle.click());
          await expect(form).toHaveCount(0);
          expect(await handles()).toEqual(retained);
          expect(writes.writes).toHaveLength(1);
          await toggle.click();
          await expect(form.getByRole("button", { name: "Kontrollera resultat", exact: true })).toBeVisible();
          await loss.remove();
          await form.getByRole("button", { name: "Kontrollera resultat", exact: true }).click();
          await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);
          const result = form.getByRole("link", { name: "Öppna bekräftat resultat", exact: true });
          await expect(result).toBeVisible();
          const target = await result.getAttribute("href");
          if (!target) throw new Error("Checked original create has no result target");
          const observer = await page.context().newPage();
          try {
            await observer.goto(target);
            await expect(titleForm(observer).getByLabel("Titel", { exact: true })).toHaveValue(title);
          } finally { await observer.close(); }
          expect(writes.writes).toHaveLength(1);
          expect(await handles()).toHaveLength(0);
          await capture(page, info, "calculation-list", "protected-hide-recovered", target.split("/").at(-1)!, result, async () => {
            await expect(result).toHaveAttribute("href", target);
            await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);
            expect(writes.writes).toHaveLength(1);
          });
        } finally { await loss.remove(); }
      } finally { writes.stop(); }
    });

    test("E35-8-T-dirty-navigation / preview hide: clean closes; unresolved original quote remains recoverable", async ({ page, context }, info) => {
      const { calculation, preview, form } = await preparedQuote(page);
      const toggle = page.getByTestId("create-quote");
      const clean = nativePrompts(page, "dismiss");
      try {
        await toggle.click();
        await expect(preview).toHaveCount(0);
        await renderedFrame(page);
        expect(clean.seen).toHaveLength(0);
      } finally { clean.stop(); }
      await toggle.click();
      await expect(form).toHaveAttribute("data-editor-ready", "true");
      const writes = observeWrites(page);
      const loss = await interceptedWrite(page, "**/calculations/**", true);
      try {
        const digest = await form.locator('input[name="reviewed_snapshot_digest"]').inputValue();
        await preview.getByTestId("confirm-create-quote-version").click();
        await loss.completed;
        await expect(form.getByRole("status")).toContainText(/obekräftat/i);
        expect(writes.writes).toHaveLength(1);
        const original = await postedFields(writes.writes[0]!);
        expect(JSON.parse(original("expected"))).toMatchObject({ form: "reviewed-initial-quote", reviewed_snapshot_digest: digest });
        const handles = () => page.evaluate(id => Object.entries(sessionStorage).filter(([key]) => key.startsWith("kopplas/editor/v1/") && key.endsWith(`/${id}/reviewed-initial-quote`)), calculation.url.split("/").at(-1)!);
        const retained = await handles();
        expect(retained).toHaveLength(1);
        expect(JSON.parse(retained[0]![1]).operationId).toBe(original("operation_id"));
        await confirmOnce(page, "dismiss", () => toggle.click());
        await expect(preview).toBeVisible();
        await expect(form.locator('input[name="reviewed_snapshot_digest"]')).toHaveValue(digest);
        await expect(form.getByRole("button", { name: "Kontrollera resultat", exact: true })).toBeVisible();
        expect(await handles()).toEqual(retained);
        await capture(page, info, "pre-quote-preview", "protected-hide-cancelled", calculation.url.split("/").at(-1)!, form.getByRole("status"), async () => {
          await expect(form.getByRole("status")).toContainText(/obekräftat/i);
          expect(await handles()).toEqual(retained);
          expect(writes.writes).toHaveLength(1);
        });
        await confirmOnce(page, "accept", () => toggle.click());
        await expect(preview).toHaveCount(0);
        expect(await handles()).toEqual(retained);
        expect(writes.writes).toHaveLength(1);
        await toggle.click();
        await expect(form.getByRole("button", { name: "Kontrollera resultat", exact: true })).toBeVisible();
        await loss.remove();
        await form.getByRole("button", { name: "Kontrollera resultat", exact: true }).click();
        await expect(form.getByRole("status")).toContainText(/ursprungliga.*bekräftad/i);
        const result = form.getByRole("link", { name: "Öppna bekräftat resultat", exact: true });
        await expect(result).toBeVisible();
        const target = await result.getAttribute("href");
        if (!target) throw new Error("Original checked quote has no result target");
        const observer = await context.newPage();
        try {
          await observer.goto(target);
          await renderedQuote(observer, target);
          await expect(observer.getByTestId("quote-version-snapshot")).toHaveAttribute("data-version-id", target.split("/").at(-1)!);
          await expect(observer.getByTestId("quote-source-calculation").getByRole("link")).toHaveAttribute("href", new URL(calculation.url).pathname);
        } finally { await observer.close(); }
        expect(writes.writes).toHaveLength(1);
        expect(await handles()).toHaveLength(0);
      } finally { writes.stop(); await loss.remove(); }
    });

    test("E35-8-T-denied / AC6 / AC7: foreign detail is generic denial, never a successful empty editor", async ({ page }) => {
      await signIn(page, fixture().adminB);
      await page.goto(`/calculations/${fixture().calc.id}`);
      await expect(page.getByTestId("calculation-not-found")).toBeVisible();
      await expect(page.getByText(fixture().calc.title, { exact: true })).toHaveCount(0);
      await expect(page.getByTestId("calculation-editor")).toHaveCount(0);
      await expect(page.getByTestId("sections-empty")).toHaveCount(0);
    });

    test("E35-8-T-AC2 / AC3 / stale: STOP stays blocked; checked review rejects changed rows before a fresh review creates a quote", async ({ page }, info) => {
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
      await capture(page, info, "pre-quote-preview", "reviewed", calculation.url.split("/").at(-1)!, preview.getByTestId("preview-sections"), async () => {
        await expect(preview.getByTestId("preview-sections")).toContainText("Granskning Åsby");
        await expect(preview.locator('input[name="reviewed_snapshot_digest"]')).toHaveValue(digest);
      });
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
      await capture(page, info, "pre-quote-preview", "stale-error-retry", calculation.url.split("/").at(-1)!, preview.getByRole("alert"), async () => {
        await expect(preview.getByRole("alert")).toContainText(/ändr|inaktuell|gransk|konflikt/i);
        await expect(page).toHaveURL(calculation.url);
      });
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
      await capture(page, info, "tax-settings", "readiness-blocker", fixture().blockerCalc.id,
        page.getByTestId("tax-document-settings").getByRole("heading").first(), async () => {
          await expect(page.getByTestId("calculation-header").locator('input[name="id"]')).toHaveValue(fixture().blockerCalc.id);
          await expect(page.getByTestId("create-quote")).toBeDisabled();
        });
      await capture(page, info, "readiness-summary", "STOP", fixture().blockerCalc.id,
        page.getByTestId("readiness-blocker-TOTAL_UNCOMPUTABLE").filter({ visible: true }), async () => {
          await expect(page.getByTestId("readiness-summary").filter({ visible: true })).toHaveAttribute("data-can-create-quote", "false");
          await expect(page.getByTestId("create-quote")).toBeDisabled();
        });
    });
  });
}
