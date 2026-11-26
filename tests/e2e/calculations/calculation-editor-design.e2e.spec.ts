/** Story 35.8 presentation verification. Real production app and existing isolated fixture only.
 * Collection is not execution. The original calculation/tax/source/recovery suites remain
 * unchanged and own their money, authorization and original-operation invariants.
 */
import { test, expect, type ConsoleMessage, type Dialog, type Locator, type Page, type Request as BrowserRequest, type TestInfo } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, adminInsertCustomer, adminInsertCalculation } from "../../factories/tenants";

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

/** Cleanup never lets missing native witness evidence retain a held mutation.
 * Context replacement is an unavailable witness, never a qualified native event. */
async function finishNativeRetention(input: {
  release: () => void; stopPrompts: () => void; stopWrites: () => void;
  removeHold: () => Promise<void>; closeObserver: () => Promise<void>;
  readEvents: () => Promise<unknown>; removeEvents: () => Promise<unknown>; disposeEvents: () => Promise<void>;
  attach: (value: unknown) => Promise<void>; priorFailure: unknown;
}): Promise<void> {
  const failures: unknown[] = [];
  for (const stop of [input.release, input.stopPrompts, input.stopWrites]) {
    try { stop(); } catch (error) { failures.push(error); }
  }
  const unavailable = (error: unknown) => /Execution context was destroyed|Cannot find context|JSHandle is disposed|Target page, context or browser has been closed/i.test(String(error));
  const witness = async () => {
    let observed: unknown;
    try { observed = await input.readEvents(); }
    catch (error) {
      observed = { qualification: "OPEN", witness: "unavailable", category: unavailable(error) ? "document-context-unavailable" : "witness-read-failed" };
      if (!unavailable(error)) failures.push(error);
    }
    try { await input.attach(observed); } catch (error) { failures.push(error); }
    try { await input.removeEvents(); } catch (error) { if (!unavailable(error)) failures.push(error); }
    finally { try { await input.disposeEvents(); } catch (error) { if (!unavailable(error)) failures.push(error); } }
  };
  // Start each cleanup independently, including synchronous throws from a seam.
  const settled = await Promise.allSettled([
    Promise.resolve().then(input.removeHold), Promise.resolve().then(input.closeObserver), Promise.resolve().then(witness),
  ]);
  for (const result of settled) if (result.status === "rejected") failures.push(result.reason);
  if (failures.length && input.priorFailure === undefined) throw new AggregateError(failures, "Native retention cleanup failed");
  if (failures.length && input.priorFailure !== undefined) {
    // Retain the primary qualification/assertion failure, with cleanup facts separately.
    try { await input.attach({ qualification: "OPEN", cleanupFailures: failures.length, primaryFailurePreserved: true }); } catch { /* The original failure remains primary. */ }
  }
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

    // These real shell-profile journeys require the independently integrated shell prerequisite.
    // They do not exercise sidebar, drawer or notification acknowledgement navigation.
    for (const host of ["list", "editor"] as const) {
      test(`E35-8-T-shell-profile-${host} / AC5: current draft cancel and one confirmed departure never replay a write`, async ({ page }) => {
        let calculation: Awaited<ReturnType<typeof ownCalculation>> | undefined;
        if (host === "editor") calculation = await ownCalculation(page);
        else { await signIn(page); await page.goto("/calculations"); }
        const root = page.getByTestId(host === "editor" ? "calculation-editor" : "calculation-list");
        await expect(root).toHaveCount(1);
        await expect(root).toHaveAttribute("data-calculation-departure-root", "true");
        const mountedRoot = await root.elementHandle();
        expect(mountedRoot).not.toBeNull();
        if (host === "list") {
          await hydrated(page.getByTestId("new-calculation"));
          await page.getByTestId("new-calculation").click();
        }
        const form = host === "editor" ? titleForm(page) : page.getByTestId("new-calculation-form");
        await expect(form).toHaveAttribute("data-editor-ready", "true");
        const originalUrl = page.url(), originalEntry = await navigationEntry(page);
        const originalRows = host === "list" ? await root.getByTestId("calculation-list-row").count() : undefined;
        const draft = `Osparad profilresa ${crypto.randomUUID()}`;
        const writes = observeWrites(page);
        const mainFrame = page.mainFrame();
        let profileCommits = 0;
        const committed = (frame: import("@playwright/test").Frame) => {
          if (frame === mainFrame && new URL(frame.url()).pathname === "/settings/notifications") profileCommits++;
        };
        page.on("framenavigated", committed);
        try {
          await form.getByLabel("Titel", { exact: true }).fill(draft);
          await expect(form).toHaveAttribute("data-editor-dirty", "true");
          const profile = page.getByRole("button", { name: "Profil", exact: true });
          await hydrated(profile);
          await profile.click();
          const destination = page.getByRole("link", { name: "Notisinställningar", exact: true });
          await expect(destination).toHaveAttribute("href", "/settings/notifications");
          await confirmOnce(page, "dismiss", () => destination.click());
          await expect(page).toHaveURL(originalUrl);
          expect(await navigationEntry(page)).toEqual(originalEntry);
          expect(await mountedRoot!.evaluate(element => element.isConnected)).toBe(true);
          await expect(form.getByLabel("Titel", { exact: true })).toHaveValue(draft);
          await expect(form).toHaveAttribute("data-editor-dirty", "true");
          await expect(profile).toHaveAttribute("aria-expanded", "true");
          expect(profileCommits).toBe(0);
          expect(writes.writes).toHaveLength(0);
          // A subsequent edit must be checked by the same mounted listener, using current state.
          await form.getByLabel("Titel", { exact: true }).fill(`${draft} ändrad`);
          await expect(form).toHaveAttribute("data-editor-dirty", "true");
          await confirmOnce(page, "accept", () => destination.click());
          await expect(page).toHaveURL(new URL("/settings/notifications", originalUrl).href);
          await expect(page.getByRole("heading", { level: 1, name: "Notisinställningar", exact: true })).toBeVisible();
          await renderedFrame(page);
          expect(profileCommits).toBe(1);
          const departedEntry = await navigationEntry(page);
          expect(originalEntry.entry).not.toBeNull();
          expect(departedEntry.entry).not.toBeNull();
          expect(departedEntry.entry!.index).toBe(originalEntry.entry!.index + 1);
          expect(departedEntry.length).toBe(originalEntry.length + 1);
          expect(writes.writes).toHaveLength(0);
          await page.goto(originalUrl);
          if (calculation) {
            await expect(page.getByRole("heading", { level: 1, name: calculation.title, exact: true })).toBeVisible();
            await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(calculation.title);
            await expect(titleForm(page)).toHaveAttribute("data-editor-dirty", "false");
          } else {
            await expect(page.getByRole("heading", { level: 1, name: "Kalkyler", exact: true })).toBeVisible();
            await expect(root.getByTestId("calculation-list-row")).toHaveCount(originalRows!);
            await expect(root.getByTestId("calculation-list-row").filter({ hasText: draft })).toHaveCount(0);
            await expect(page.getByTestId("new-calculation-form")).toHaveCount(0);
          }
          expect(profileCommits).toBe(1);
          expect(writes.writes).toHaveLength(0);
        } finally { page.off("framenavigated", committed); writes.stop(); }
      });
    }

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
          const traverse = { phase, cancelable: true, defaultPrevented, sameDocument: true, type: "traverse",
            key: expectedForward.key, index: expectedForward.index, url: expectedForward.url,
            currentEntry: expectedCurrent, ...forwardCounts };
          // Keep every observation: only this exact ordered sequence qualifies.
          expect(actual, "Forward must contain only its exact traversal and accepted same-slot replacement").toEqual(
            phase === "cancel" ? [traverse] : [traverse, {
              phase, cancelable: true, defaultPrevented: false, sameDocument: true, type: "replace",
              key: "", index: -1, url: expectedForward.url,
              currentEntry: expectedForward, ...forwardCounts,
            }]);
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
                // These sampled native identities bind the replacement's pre-commit current entry; final replacement IDs remain evidence.
                expect(outcome).toEqual({ status: "fulfilled", ...expectedForward });
              }
            });
            if (direction === "forward") {
              await expect.poll(() => events.filter(event => event.phase === "accept").length).toBe(2);
              assertForwardEvent("cancel", true);
              assertForwardEvent("accept", false);
              expect(events).toHaveLength(3);
              await assertForwardCounts();
            }
            await recordForwardState("after-accept");
            await expect(page).toHaveURL(/\/calculations$/);
            await expect(page.getByRole("heading", { level: 1, name: "Kalkyler", exact: true })).toBeVisible();
            if (direction === "forward") {
              await renderedFrame(page);
              assertForwardEvent("cancel", true);
              assertForwardEvent("accept", false);
              expect(events).toHaveLength(3);
              await assertForwardCounts();
            }
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

    for (const revoke of ["role", "target"] as const) {
      test(`E35-8-T-retention-revocation / ${revoke}: retained business values require current exact write authority`, async ({ page }, info) => {
        const { adminQuery, adminExec, closeAdminPool } = await import("../../factories/admin-sql.js");
        let owned: Awaited<ReturnType<typeof createRoleAwarePhaseAFixture>> | undefined;
        let membership: { id: string; tenant_id: string; user_id: string } | undefined;
        let roleChanged = false;
        const writes = observeWrites(page);
        try {
          owned = await createRoleAwarePhaseAFixture();
          const tenantId = owned.base.tenantA.id, user = owned.users.projektledare;
          const customerId = await adminInsertCustomer({ tenant_id: tenantId, customer_type: "company", display_name: "Åsby återinträdesprov" });
          const calculationId = await adminInsertCalculation({ tenant_id: tenantId, customer_id: customerId, title: `Återinträde ${revoke} ${crypto.randomUUID()}` });
          await signIn(page, user);
          await page.goto("/calculations");
          const targetPath = `/calculations/${calculationId}`;
          await page.locator(`[data-testid="calculation-list-row"][href="${targetPath}"]`).click();
          await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
          const secret = `Behåll endast med aktuell rätt ${crypto.randomUUID()}`;
          await titleForm(page).getByLabel("Titel", { exact: true }).fill(secret);
          const events = await page.evaluateHandle(() => {
            const navigation = (window as Window & { navigation?: EventTarget }).navigation;
            if (!navigation) throw new Error("Retention revocation qualification OPEN: Navigation API absent");
            const actual: { trusted: boolean; sameDocument: boolean; cancelable: boolean; prevented: boolean }[] = [];
            const listener = (event: Event) => {
              const movement = event as Event & { navigationType: string; destination: { sameDocument: boolean } };
              if (movement.navigationType === "traverse") queueMicrotask(() => actual.push({ trusted: event.isTrusted, sameDocument: movement.destination.sameDocument, cancelable: event.cancelable, prevented: event.defaultPrevented }));
            };
            navigation.addEventListener("navigate", listener);
            return { actual, remove: () => navigation.removeEventListener("navigate", listener) };
          });
          const prompts = nativePrompts(page, "dismiss");
          try {
            await page.goBack({ waitUntil: "commit", timeout: 5_000 }).catch(error => { if (!/ERR_ABORTED|aborted/i.test(String(error))) throw error; });
            await prompts.settle();
            if (new URL(page.url()).pathname === targetPath) await page.goBack({ waitUntil: "commit", timeout: 5_000 });
            await expect(page).toHaveURL(/\/calculations$/);
            const actual = await events.evaluate(value => value.actual);
            expect(actual, "No substitute for a genuine forced native retention event").toContainEqual({ trusted: true, sameDocument: true, cancelable: false, prevented: false });
            await info.attach(`retained-${revoke}-native-event.json`, { body: Buffer.from(JSON.stringify(actual)), contentType: "application/json" });
          } finally { prompts.stop(); await events.evaluate(value => value.remove()); await events.dispose(); }
          if (revoke === "role") {
            const rows = await adminQuery<{ id: string; tenant_id: string; user_id: string }>("select id,tenant_id,user_id from public.tenant_memberships where tenant_id=$1 and user_id=$2 and role='projektledare' and status='active'", [tenantId, user.id]);
            expect(rows).toHaveLength(1); membership = rows[0];
            await adminExec("update public.tenant_memberships set role='ekonomi' where id=$1 and tenant_id=$2 and user_id=$3 and role='projektledare' and status='active'", [membership.id, tenantId, user.id]);
            roleChanged = true;
            const current = await adminQuery<{ role: string }>("select role from public.tenant_memberships where id=$1 and tenant_id=$2 and user_id=$3", [membership.id, tenantId, user.id]);
            expect(current).toEqual([{ role: "ekonomi" }]);
          } else {
            await adminExec("update public.calculations set archived_at=clock_timestamp(),status='archived' where id=$1 and tenant_id=$2 and archived_at is null", [calculationId, tenantId]);
            const current = await adminQuery<{ archived: boolean }>("select archived_at is not null as archived from public.calculations where id=$1 and tenant_id=$2", [calculationId, tenantId]);
            expect(current).toEqual([{ archived: true }]);
          }
          // The already-rendered ordinary link is the exact original resource.
          // Current per-request authority, not that stale link or its old read, decides reentry.
          await page.locator(`[data-testid="calculation-list-row"][href="${targetPath}"]`).click();
          await expect(page).toHaveURL(new URL(targetPath, page.url()).href);
          await expect(page.getByTestId("calculation-not-found")).toBeVisible();
          await expect.poll(() => page.locator('input').evaluateAll((inputs, value) => inputs.some(input => (input as HTMLInputElement).value === value), secret)).toBe(false);
          await expect(page.locator('[data-editor-restored="true"]')).toHaveCount(0);
          expect(writes.writes).toHaveLength(0);
          await info.attach(`retained-${revoke}-denial.json`, { body: Buffer.from(JSON.stringify({ exactCalculationId: calculationId, revocation: revoke, restoredBusinessValues: false, writes: writes.writes.length })), contentType: "application/json" });
        } finally {
          writes.stop();
          const failures: unknown[] = [];
          if (roleChanged && membership) {
            try { await adminExec("update public.tenant_memberships set role='projektledare' where id=$1 and tenant_id=$2 and user_id=$3 and role='ekonomi' and status='active'", [membership.id, membership.tenant_id, membership.user_id]); }
            catch (error) { failures.push(error); }
          }
          if (owned) { try { await cleanupRoleAwarePhaseAFixture(owned); } catch (error) { failures.push(error); } }
          try { await closeAdminPool(); } catch (error) { failures.push(error); }
          if (failures.length) throw new AggregateError(failures, "Owned retention revocation fixture cleanup failed");
        }
      });
    }

    test("E35-8-T-retention-pending-authority / real early input is blocked and stale reentry cannot erase a draft", async ({ page }, info) => {
      const calculation = await ownCalculation(page);
      const targetPath = new URL(calculation.url).pathname;
      await departureLink(page).click();
      await expect(page).toHaveURL(/\/calculations$/);
      const writes = observeWrites(page);
      let release!: () => void;
      const released = new Promise<void>(resolve => { release = resolve; });
      const held: Promise<void>[] = [];
      let cleaning = false;
      const handler: Parameters<Page["route"]>[1] = route => {
        const request = route.request();
        if (request.method() !== "POST" || !request.headers()["next-action"] || request.postData()?.includes("operation_id") || cleaning) return route.continue();
        const work = (async () => { await released; await route.continue(); })();
        held.push(work); void work.catch(() => {}); return work;
      };
      await page.route(`**${targetPath}`, handler);
      try {
        await page.locator(`[data-testid="calculation-list-row"][href="${targetPath}"]`).click();
        await expect.poll(() => held.length).toBeGreaterThan(0);
        const form = titleForm(page), input = form.getByLabel("Titel", { exact: true });
        await expect(form).toHaveAttribute("data-editor-ready", "false");
        await expect(input).toBeDisabled();
        await expect(form.getByRole("button", { name: "Spara titel", exact: true })).toBeDisabled();
        // Actual keyboard input while the fieldset is disabled cannot author a
        // value. No force-fill, synthetic input dispatch or DOM value assignment.
        await input.focus();
        await page.keyboard.type("Får inte skrivas före aktuell behörighet");
        await expect(input).toHaveValue(calculation.title);
        await expect(form).toHaveAttribute("data-editor-dirty", "false");
        await page.goBack({ waitUntil: "commit" });
        await expect(page).toHaveURL(/\/calculations$/);
        release(); await Promise.all(held);
        await renderedFrame(page);
        expect(writes.writes).toHaveLength(0);
        // A late authorization result from the departed form must not install
        // an old writer; returning starts another fresh authorization.
        cleaning = true; await page.unroute(`**${targetPath}`, handler);
        await page.locator(`[data-testid="calculation-list-row"][href="${targetPath}"]`).click();
        await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
        await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(calculation.title);
        await expect(titleForm(page)).toHaveAttribute("data-editor-dirty", "false");
        expect(writes.writes).toHaveLength(0);
        await info.attach("pending-authority-boundary.json", { body: Buffer.from(JSON.stringify({ actualHeldReads: held.length, earlyKeyboardValueBlocked: true, staleResultReturnedAfterDeparture: true, writes: writes.writes.length })), contentType: "application/json" });
      } finally {
        cleaning = true; release(); writes.stop();
        const settled = await Promise.allSettled(held);
        await page.unroute(`**${targetPath}`, handler);
        const failed = settled.filter((value): value is PromiseRejectedResult => value.status === "rejected");
        if (failed.length) throw new AggregateError(failed.map(value => value.reason), "Pending-authority read release failed");
      }
    });

    for (const direction of ["back", "forward"] as const) {
      test(`E35-8-T-native-retention / genuine Chromium ${direction}: committed destination, exact old operation and newer unsent draft`, async ({ page, context }, info) => {
        const calculation = await ownCalculation(page);
        const targetPath = new URL(calculation.url).pathname;
        // Every slot is created by the actual application's links/router.
        // Forward reuses the naturally linked list entry, never pushState/traverseTo.
        if (direction === "forward") {
          await departureLink(page).click();
          await expect(page).toHaveURL(/\/calculations$/);
          await page.goBack({ waitUntil: "commit" });
          await expect(page).toHaveURL(calculation.url);
          await expect(titleForm(page)).toHaveAttribute("data-editor-ready", "true");
        }
        const events = await page.evaluateHandle(() => {
          const navigation = (window as Window & { navigation?: EventTarget }).navigation;
          if (!navigation) throw new Error("Native retention qualification OPEN: actual Navigation API absent");
          const observed: { trusted: boolean; sameDocument: boolean; cancelable: boolean; prevented: boolean; url: string; type: string }[] = [];
          const listener = (event: Event) => {
            const movement = event as Event & { navigationType: string; destination: { sameDocument: boolean; url: string } };
            queueMicrotask(() => observed.push({ trusted: event.isTrusted, sameDocument: movement.destination.sameDocument,
              cancelable: event.cancelable, prevented: event.defaultPrevented, url: movement.destination.url, type: movement.navigationType }));
          };
          navigation.addEventListener("navigate", listener);
          return { observed, remove: () => navigation.removeEventListener("navigate", listener) };
        });
        const writes = observeWrites(page);
        const response = await interceptedWrite(page, "**/calculations/**");
        const prompts = nativePrompts(page, "dismiss");
        const observer = await context.newPage();
        const submitted = `Ursprunglig native ${direction} ${crypto.randomUUID()}`;
        const draft = `Nyare osparad native ${direction} ${crypto.randomUUID()}`;
        let scenarioFailure: unknown;
        try {
          await titleForm(page).getByLabel("Titel", { exact: true }).fill(submitted);
          await titleForm(page).getByRole("button", { name: "Spara titel", exact: true }).click();
          await expect.poll(response.ready).toBe(true);
          expect(writes.writes).toHaveLength(1);
          const original = await postedFields(writes.writes[0]!);
          const operationId = original("operation_id");
          const originalExpected = original("expected");
          await titleForm(page).getByLabel("Titel", { exact: true }).fill(draft);
          const traverse = () => direction === "back" ? page.goBack({ waitUntil: "commit", timeout: 5_000 }) : page.goForward({ waitUntil: "commit", timeout: 5_000 });
          // Real browser-driven cancellation attempt, followed by another native
          // traversal with NO intervening click, keyboard event or added activation.
          await traverse().catch(error => { if (!/ERR_ABORTED|aborted/i.test(String(error))) throw error; });
          await prompts.settle();
          await expect(page).toHaveURL(calculation.url);
          const cancelled = await events.evaluate(value => value.observed.filter(event => event.type === "traverse"));
          expect(cancelled, "Qualification OPEN unless a real trusted cancellable traversal was cancelled").toEqual([
            expect.objectContaining({ trusted: true, sameDocument: true, cancelable: true, prevented: true }),
          ]);
          await traverse();
          await expect(page).toHaveURL(/\/calculations$/);
          const native = await events.evaluate(value => value.observed.filter(event => event.type === "traverse"));
          expect(native, "Qualification OPEN unless Chromium actually committed a trusted noncancellable same-document traversal").toEqual([
            cancelled[0], expect.objectContaining({ trusted: true, sameDocument: true, cancelable: false, prevented: false, url: page.url() }),
          ]);
          await expect(page.getByTestId("calculation-list")).toBeVisible();
          expect(writes.writes).toHaveLength(1);
          // Returning is an ordinary link to exactly the original form/resource.
          await page.locator(`[data-testid="calculation-list-row"][href="${targetPath}"]`).click();
          await expect(page).toHaveURL(calculation.url);
          await expect(titleForm(page)).toHaveAttribute("data-editor-restored", "true");
          await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(draft);
          await expect(titleForm(page).getByRole("button", { name: "Kontrollera resultat", exact: true })).toBeVisible();
          const handles = await page.evaluate(() => Object.entries(sessionStorage).filter(([key]) => key.startsWith("kopplas/editor/v1/")).map(([, value]) => JSON.parse(value) as { operationId: string }));
          expect(handles.map(handle => handle.operationId)).toContain(operationId);
          // The old callback is stale even though its actual server effect committed.
          response.release(); await response.completed;
          await renderedFrame(page);
          await expect(page).toHaveURL(calculation.url);
          await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(draft);
          expect(writes.writes).toHaveLength(1);
          expect(original("expected")).toBe(originalExpected);
          await titleForm(page).getByRole("button", { name: "Kontrollera resultat", exact: true }).click();
          await expect(titleForm(page).getByText(/Den ursprungliga åtgärden är bekräftad/)).toBeVisible();
          await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(draft);
          await expect(titleForm(page)).toHaveAttribute("data-editor-dirty", "true");
          await expect(page).toHaveURL(calculation.url);
          expect(writes.writes).toHaveLength(1); // reauthorization/reconciliation are read-only POSTs
          await observer.goto(calculation.url);
          await expect(titleForm(observer).getByLabel("Titel", { exact: true })).toHaveValue(submitted);
          const { adminQuery, closeAdminPool } = await import("../../factories/admin-sql.js");
          try {
            const proof = await adminQuery<{ operation_id: string; status: string }>("select operation_id,status from public.calculation_editor_operations where calculation_id=$1 and operation_id=$2", [targetPath.split("/").at(-1), operationId]);
            expect(proof).toEqual([{ operation_id: operationId, status: "committed" }]);
          } finally { await closeAdminPool(); }
          await capture(page, info, "calculation-header", `native-${direction}-restored-newer-draft`, targetPath.split("/").at(-1)!, titleForm(page), async () => {
            await expect(titleForm(page).getByLabel("Titel", { exact: true })).toHaveValue(draft);
            await expect(page).toHaveURL(calculation.url);
            expect(writes.writes).toHaveLength(1);
          });
        } catch (error) { scenarioFailure = error; throw error; }
        finally {
          await finishNativeRetention({
            release: response.release, stopPrompts: prompts.stop, stopWrites: writes.stop,
            removeHold: response.remove, closeObserver: () => observer.close(),
            readEvents: () => events.evaluate(value => value.observed), removeEvents: () => events.evaluate(value => value.remove()), disposeEvents: () => events.dispose(),
            attach: value => info.attach(`native-${direction}-retention-observations.json`, { body: Buffer.from(JSON.stringify(value)), contentType: "application/json" }),
            priorFailure: scenarioFailure,
          });
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

    test("E35-8-T-denied / AC6 / AC7: foreign detail is generic denial, never a successful empty editor", async ({ page }, info) => {
      await signIn(page, fixture().adminB);
      await page.goto(`/calculations/${fixture().calc.id}`);
      await expect(page.getByTestId("calculation-not-found")).toBeVisible();
      await expect(page.getByText(fixture().calc.title, { exact: true })).toHaveCount(0);
      await expect(page.getByTestId("calculation-editor")).toHaveCount(0);
      await expect(page.getByTestId("sections-empty")).toHaveCount(0);
      const denial = page.getByTestId("calculation-not-found");
      await capture(page, info, "calculation-detail", "foreign-denial", fixture().calc.id, denial, async () => {
        await expect(denial).toBeVisible();
        await expect(page.getByText(fixture().calc.title, { exact: true })).toHaveCount(0);
        await expect(page.getByTestId("calculation-editor")).toHaveCount(0);
        await expect(page.getByTestId("sections-empty")).toHaveCount(0);
        const back = denial.getByRole("link", { name: "Tillbaka till kalkyler", exact: true });
        await expect(back).toHaveAttribute("href", "/calculations");
        if (viewport.width === 360) await phoneTarget(back);
      });
    });

    test("E35-8-T-read-error / AC6: authenticated malformed detail ID renders a generic read failure", async ({ page }, info) => {
      await signIn(page);
      const invalidId = "not-a-calculation-id";
      await page.goto(`/calculations/${invalidId}`);
      const failure = page.getByTestId("calculation-detail-failed");
      const assertReadError = async () => {
        await expect(failure).toBeVisible();
        await expect(failure).toHaveAttribute("role", "alert");
        await expect(failure).toContainText("Kalkylen kunde inte läsas in.");
        await expect(failure).toContainText("Ett tillfälligt fel inträffade. Försök igen om en stund.");
        for (const testId of ["calculation-editor", "calculation-not-found", "calculation-list-empty", "sections-empty", "totals-summary"]) {
          await expect(page.getByTestId(testId)).toHaveCount(0);
        }
        await expect(page.locator("body")).not.toContainText(invalidId, { useInnerText: true });
        const back = failure.getByRole("link", { name: "Tillbaka till kalkyler", exact: true });
        await expect(back).toHaveAttribute("href", "/calculations");
        if (viewport.width === 360) await phoneTarget(back);
      };
      await assertReadError();
      await capture(page, info, "calculation-detail", "read-error", invalidId, failure, assertReadError);
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
      // Derived quote-readiness permits warnings; it is not a persisted lifecycle status.
      const readiness = page.getByTestId("readiness-summary").filter({ visible: true });
      await capture(page, info, "readiness-summary", "quote-ready-with-warnings", calculation.url.split("/").at(-1)!, readiness, async () => {
        await expect(readiness).toHaveAttribute("data-can-create-quote", "true");
        await expect(readiness.getByTestId("readiness-blockers")).toHaveCount(0);
        await expect(readiness.getByTestId("readiness-warnings")).toBeVisible();
        await expect(open).toBeEnabled();
      });
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

    test("E35-8-T-revoked / AC6 / AC7: isolated current membership revocation rejects the rendered editor without saving", async ({ page }, info) => {
      const enteredAt = Date.now(), workDeadline = enteredAt + 45_000, cleanupDeadline = enteredAt + 59_000;
      const outcomes: { phase: string; status: "pending" | "fulfilled" | "rejected" }[] = [];
      const pending = new Set<Promise<unknown>>(), timers = new Set<ReturnType<typeof setTimeout>>();
      const failures: unknown[] = [];
      let cleaning = false;
      function observe<T>(phase: string, promise: Promise<T>): Promise<T> {
        const outcome = { phase, status: "pending" as "pending" | "fulfilled" | "rejected" };
        outcomes.push(outcome); pending.add(promise);
        void promise.then(() => { outcome.status = "fulfilled"; pending.delete(promise); },
          () => { outcome.status = "rejected"; pending.delete(promise); });
        return promise;
      }
      async function bounded<T>(phase: string, start: () => Promise<T>, cleanup = false, ceiling = 15_000): Promise<T> {
        const remaining = Math.min(ceiling, (cleanup ? cleanupDeadline : workDeadline) - Date.now());
        if ((!cleanup && cleaning) || remaining <= 0) throw new Error(`${phase}: rolling deadline exhausted`);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const actual = observe(phase, start());
        try {
          return await Promise.race([actual, new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error(`${phase}: timed out; actual operation may still be pending`)), remaining);
            timers.add(timer);
          })]);
        } finally { if (timer) { clearTimeout(timer); timers.delete(timer); } }
      }
      // Environment/SQL imports and all provisioning stay inside the body; the static facade creates no client/pool at collection.
      const environment = await import("../../support/test-env.js");
      const apiUrl = new URL(environment.LOCAL_SUPABASE_URL), dbUrl = new URL(environment.LOCAL_SUPABASE_DB_URL);
      const loopback = ["127.0.0.1", "localhost", "[::1]"];
      if (!loopback.includes(apiUrl.hostname) || !["http:", "https:"].includes(apiUrl.protocol)
        || apiUrl.pathname !== "/" || apiUrl.username || apiUrl.password || apiUrl.search || apiUrl.hash
        || !loopback.includes(dbUrl.hostname) || !["postgres:", "postgresql:"].includes(dbUrl.protocol)
        || dbUrl.pathname !== "/postgres" || dbUrl.username !== "postgres" || dbUrl.search || dbUrl.hash) {
        throw new Error("Isolated revocation requires the exact parsed local test API/Postgres target");
      }
      environment.assertLocalStack();
      const { adminQuery, adminExec, closeAdminPool } = await import("../../factories/admin-sql.js");
      type Membership = { id: string; tenant_id: string; user_id: string; role: string; status: string; business: Record<string, unknown>; updated_at: string };
      let owned: Awaited<ReturnType<typeof createRoleAwarePhaseAFixture>> | undefined;
      let customerId: string | undefined, calculationId: string | undefined, original: Membership | undefined;
      let revocationAttempted = false, readMembership: (() => Promise<Membership[]>) | undefined;
      let writes: ReturnType<typeof observeWrites> | undefined;
      let ownedHandler: Parameters<Page["route"]>[1] | undefined;
      let ownsMutationUrl: ((url: URL) => boolean) | undefined;
      let releaseMutation: ((dispatch: boolean) => void) | undefined, failCapture: ((error: unknown) => void) | undefined;
      let dispatched = false, checkedServerRejection = false, scenarioComplete = false, verifiedDisabled = false;
      const gateFailures: unknown[] = [];
      try {
        owned = await bounded("createRoleAwarePhaseAFixture", () => createRoleAwarePhaseAFixture());
        const tenantId = owned!.base.tenantA.id, user = owned!.users.projektledare;
        expect(user.id).not.toBe(owned!.base.adminA.id);
        readMembership = () => adminQuery<Membership>(
          "select id,tenant_id,user_id,role,status,to_jsonb(m)-'updated_at' as business,updated_at::text as updated_at from public.tenant_memberships m where user_id=$1",
          [user.id]);
        const initialMemberships = await bounded("readMembership", () => readMembership!());
        expect(initialMemberships, "The dedicated project manager must own exactly one membership").toHaveLength(1);
        expect(initialMemberships[0]).toMatchObject({ tenant_id: tenantId, user_id: user.id, role: "projektledare", status: "active" });
        customerId = await bounded("adminInsertCustomer", () => adminInsertCustomer({ tenant_id: tenantId, customer_type: "company", display_name: "Åsby behörighetsprov" }));
        const initialTitle = `Behörighetsprov Åsby ${crypto.randomUUID()}`;
        calculationId = await bounded("adminInsertCalculation", () => adminInsertCalculation({ tenant_id: tenantId, customer_id: customerId!, title: initialTitle }));
        await bounded("signIn", () => signIn(page, user));
        const calculationUrl = new URL(`/calculations/${calculationId}`, page.url()).href;
        await bounded("page.goto", () => page.goto(calculationUrl));
        const form = titleForm(page), input = form.getByLabel("Titel", { exact: true });
        const save = form.getByRole("button", { name: "Spara titel", exact: true });
        await bounded("UI assertion", () => expect(form).toHaveAttribute("data-editor-ready", "true"));
        await bounded("UI assertion", () => expect(form.locator('input[name="id"]')).toHaveValue(calculationId!));
        await bounded("UI assertion", () => expect(page.getByRole("heading", { level: 1, name: initialTitle, exact: true })).toBeVisible());
        // Prove this same account's actual current write authority before revoking it.
        const confirmedTitle = `${initialTitle} bekräftad`;
        await bounded("input.fill", () => input.fill(confirmedTitle));
        await bounded("save.click", () => save.click());
        await bounded("UI assertion", () => expect(form.getByRole("status")).toHaveText("Kalkylen har sparats."));
        await bounded("UI assertion", () => expect(page.getByRole("heading", { level: 1, name: confirmedTitle, exact: true })).toBeVisible());
        await bounded("UI assertion", () => expect(form).toHaveAttribute("data-editor-dirty", "false"));
        const readEntity = () => adminQuery<{ entity: Record<string, unknown> }>(
          "select to_jsonb(c) as entity from public.calculations c where id=$1 and tenant_id=$2", [calculationId, tenantId]);
        const persistedBefore = await bounded("readEntity", () => readEntity());
        expect(persistedBefore).toHaveLength(1);
        expect(persistedBefore[0].entity).toMatchObject({ id: calculationId, tenant_id: tenantId, title: confirmedTitle });
        const current = await bounded("readMembership", () => readMembership!());
        expect(current).toHaveLength(1);
        expect(current[0].business).toEqual(initialMemberships[0].business);
        original = current[0];
        const attemptedTitle = `${initialTitle} avvisad`;
        await bounded("input.fill", () => input.fill(attemptedTitle));
        await bounded("UI assertion", () => expect(form).toHaveAttribute("data-editor-dirty", "true"));
        await bounded("UI assertion", () => expect(save).toBeEnabled());
        const origin = new URL(calculationUrl).origin;
        ownsMutationUrl = url => url.origin === origin && url.pathname === `/calculations/${calculationId}`;
        let capturedOnce = false, originalRequest: BrowserRequest | undefined;
        let acceptCapture!: (request: BrowserRequest) => void;
        const captured = observe("original mutation captured before upstream", new Promise<BrowserRequest>((resolve, reject) => {
          acceptCapture = resolve; failCapture = reject;
        }));
        const decision = observe("owned mutation gate decision", new Promise<boolean>(resolve => { releaseMutation = resolve; }));
        ownedHandler = route => {
          const request = route.request();
          // Other server-action authority READs are not editor mutation candidates.
          if (request.method() !== "POST" || !request.headers()["next-action"] || !request.postData()?.includes("operation_id")) {
            return observe("unrelated authority read continuation", route.continue());
          }
          const validSeam = ownsMutationUrl!(new URL(request.url())) && request.frame() === page.mainFrame();
          if (!validSeam || capturedOnce || cleaning) {
            const error = new Error("Wrong or duplicate original mutation candidate: abort before upstream");
            gateFailures.push(error); failCapture!(error);
            return observe("abort wrong/duplicate mutation", route.abort("failed"));
          }
          capturedOnce = true; originalRequest = request; acceptCapture(request);
          return observe("owned original mutation route", (async () => {
            const permit = await decision;
            if (!permit || !verifiedDisabled || gateFailures.length || cleaning) {
              await observe("abort unreleased original mutation", route.abort("failed")); return;
            }
            dispatched = true;
            // Parameterless continuation sends this SAME browser request, never a fetched replacement.
            await observe("original POST route.continue", route.continue());
          })());
        };
        await bounded("page.route", () => page.route(ownsMutationUrl!, ownedHandler!));
        writes = observeWrites(page);
        // The rendered form and exact dedicated membership remain active for this one real Save.
        // No later edits: the operation hook's numeric draft revision is internal, not a wire field.
        const submission = observe("original real Save action", save.click());
        void submission.then(() => {}, error => failCapture!(error));
        const request = await bounded("original pre-upstream POST captured", () => captured);
        expect(request).toBe(originalRequest);
        expect(request.method()).toBe("POST");
        expect(new URL(request.url()).origin).toBe(origin);
        expect(new URL(request.url()).pathname).toBe(`/calculations/${calculationId}`);
        expect(request.frame()).toBe(page.mainFrame());
        expect(request.headers()["next-action"]).toBeTruthy();
        const fields = await bounded("postedFields", () => postedFields(request));
        expect(fields("id")).toBe(calculationId);
        expect(fields("title")).toBe(attemptedTitle);
        const operationId = fields("operation_id");
        expect(operationId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i);
        expect(JSON.parse(fields("expected"))).toEqual({ version: 1, form: "calculation",
          header: Object.fromEntries(["id", "title", "status", "archived_at", "tax_input_snapshot"].map(key => [key, persistedBefore[0].entity[key]])),
        });
        expect(await bounded("readEntity", () => readEntity()), "The pre-upstream held POST must leave the complete baseline unchanged").toEqual(persistedBefore);
        const activeAtCapture = await bounded("readMembership", () => readMembership!());
        expect(activeAtCapture).toHaveLength(1);
        expect(activeAtCapture[0].business).toEqual(original!.business);
        expect(gateFailures).toHaveLength(0);
        revocationAttempted = true;
        // Exact id + tenant + user + original role/status + every business column.
        // The normal updated_at trigger stays enabled; it is not rolled back.
        await bounded("adminExec", () => adminExec(
          "update public.tenant_memberships m set status='disabled' where id=$1 and tenant_id=$2 and user_id=$3 and role='projektledare' and status='active' and (to_jsonb(m)-'updated_at')=$4::jsonb",
          [original!.id, tenantId, user.id, JSON.stringify(original!.business)]));
        const disabled = await bounded("readMembership", () => readMembership!());
        expect(disabled).toHaveLength(1);
        expect(disabled[0].business).toEqual({ ...original!.business, status: "disabled" });
        expect(Date.parse(disabled[0].updated_at)).toBeGreaterThanOrEqual(Date.parse(original!.updated_at));
        verifiedDisabled = true;
        releaseMutation!(true);
        const rejection = await bounded("request.response", () => request.response());
        expect(rejection, "The actual rendered editor mutation must receive a real checked rejection").not.toBeNull();
        expect(rejection!.request()).toBe(request);
        expect(rejection!.url()).toBe(request.url());
        expect(rejection!.status()).toBe(200);
        expect(rejection!.headers()["content-type"]).toContain("text/x-component");
        expect(await bounded("original mutation response terminal", () => rejection!.finished())).toBeNull();
        const responseBody = await bounded("original mutation response body", () => rejection!.text());
        expect(responseBody).toContain('"code":"TENANT_MEMBERSHIP_REQUIRED"');
        expect(responseBody).toContain('"status":"error"');
        expect(responseBody).toContain(`"operationId":"${operationId}"`);
        checkedServerRejection = true;
        await bounded("original Save action settled", () => submission);
        const assertRejected = async () => {
          await bounded("UI assertion", () => expect(page).toHaveURL(calculationUrl));
          await bounded("UI assertion", () => expect(form.getByRole("alert")).toHaveText("Ditt konto har ingen aktiv behörighet till ett företag. Kontakta din administratör."));
          await bounded("UI assertion", () => expect(form.getByText("Kalkylen har sparats.", { exact: true })).toHaveCount(0));
          await bounded("UI assertion", () => expect(input).toHaveValue(attemptedTitle));
          await bounded("UI assertion", () => expect(form).toHaveAttribute("data-editor-dirty", "true"));
          await bounded("UI assertion", () => expect(form.locator('input[name="id"]')).toHaveValue(calculationId!));
          await bounded("UI assertion", () => expect(page.getByRole("heading", { level: 1, name: confirmedTitle, exact: true })).toBeVisible());
          expect(writes!.writes).toEqual([request]);
        };
        await bounded("assertRejected", () => assertRejected());
        expect(await bounded("readEntity", () => readEntity()), "Independent owned-row reread must show no mutation from the rejected request").toEqual(persistedBefore);
        await bounded("capture", () => capture(page, info, "calculation-editor", "revoked-membership-rejected", calculationId!, form.getByRole("alert"), assertRejected));
        expect(await bounded("readEntity", () => readEntity())).toEqual(persistedBefore);
        expect(gateFailures).toHaveLength(0);
        scenarioComplete = true;
      } catch (error) { failures.push(error); }
      finally {
        cleaning = true;
        // Default is ABORT, including setup/capture/disable failure and no request arrival.
        releaseMutation?.(false); failCapture?.(new Error("Original capture gate closed during cleanup"));
        try {
          const settled = await bounded("settle owned browser work", () => Promise.allSettled([...pending]), true, 2_000);
          for (const result of settled) if (result.status === "rejected") failures.push(result.reason);
        } catch (error) { failures.push(error); }
        if (pending.size) {
          try { await bounded("close owned page/client channels only", () => page.close({ runBeforeUnload: false }), true, 2_000); }
          catch (error) { failures.push(error); }
        }
        try {
          const settled = await bounded("collect actual browser settlements", () => Promise.allSettled([...pending]), true, 1_000);
          for (const result of settled) if (result.status === "rejected") failures.push(result.reason);
        } catch (error) { failures.push(error); }
        try { if (ownedHandler && ownsMutationUrl) await bounded("remove exact mutation handler", () => page.unroute(ownsMutationUrl!, ownedHandler!), true, 1_000); }
        catch (error) { failures.push(error); }
        writes?.stop();
        failures.push(...gateFailures);
        if (dispatched && !checkedServerRejection) failures.push(new Error("SERVER_OUTCOME_UNKNOWN: client termination is not checked rejection or backend rollback"));
        // Restoration precedes cleanup even when request or UI assertions fail.
        // Preserve exact identity and all business columns; only trigger-owned time advances.
        try {
          if (owned && original && revocationAttempted && readMembership) {
            const current = await bounded("readMembership", () => readMembership!(), true, 1_000);
            expect(current).toHaveLength(1);
            if (current[0].status === "disabled") {
              const disabledBusiness = { ...original!.business, status: "disabled" };
              expect(current[0].business).toEqual(disabledBusiness);
              await bounded("adminExec", () => adminExec(
                "update public.tenant_memberships m set status=$4 where id=$1 and tenant_id=$2 and user_id=$3 and role='projektledare' and status='disabled' and (to_jsonb(m)-'updated_at')=$5::jsonb",
                [original!.id, original!.tenant_id, original!.user_id, original!.status, JSON.stringify(disabledBusiness)]), true, 1_000);
            } else expect(current[0].business).toEqual(original!.business);
            const restored = await bounded("readMembership", () => readMembership!(), true, 1_000);
            expect(restored).toHaveLength(1);
            expect(restored[0].business).toEqual(original!.business);
            expect(Date.parse(restored[0].updated_at)).toBeGreaterThanOrEqual(Date.parse(current[0].updated_at));
            await bounded("info.attach", () => info.attach("revocation-owned-restoration.json", { contentType: "application/json", body: Buffer.from(JSON.stringify({
              sameMembershipRestored: true, allBusinessColumnsRestored: true,
              triggerOwnedUpdatedAtNondecreasing: true, timestampRollbackClaimed: false,
            })) }), true, 1_000);
          }
        } catch (error) { failures.push(error); }
        try {
          // The facade's legacy replica-mode tenant removal bypasses root cascades.
          // Remove only this isolated actor/entity's own title-operation fixtures first.
          if (owned && calculationId) await bounded("adminExec", () => adminExec(
            "delete from public.calculation_editor_operations where tenant_id=$1 and actor_user_id=$2 and calculation_id=$3 and operation_kind='calculation.update'",
            [owned!.base.tenantA.id, owned!.users.projektledare.id, calculationId]), true, 1_000);
        } catch (error) { failures.push(error); }
        try {
          if (owned && calculationId) await bounded("adminExec", () => adminExec("delete from public.calculations where id=$1 and tenant_id=$2", [calculationId, owned!.base.tenantA.id]), true, 1_000);
        } catch (error) { failures.push(error); }
        try {
          if (owned && customerId) await bounded("adminExec", () => adminExec("delete from public.customers where id=$1 and tenant_id=$2", [customerId, owned!.base.tenantA.id]), true, 1_000);
        } catch (error) { failures.push(error); }
        try { if (owned) await bounded("cleanupRoleAwarePhaseAFixture", () => cleanupRoleAwarePhaseAFixture(owned!), true, 3_000); }
        catch (error) { failures.push(error); }
        if (owned) {
            const tenants = [owned!.base.tenantA.id, owned!.base.tenantB.id];
            const users = [owned!.base.adminA.id, owned!.base.adminB.id, owned!.base.orphanUser.id, ...owned!.extraUsers.map(user => user.id)];
            // The existing facade is best-effort: separately require actual absence.
            for (const table of ["tenants", "auth.users"]) {
              const qualified = table === "tenants" ? "public.tenants" : "auth.users";
              try { expect(await bounded("adminQuery", () => adminQuery(`select id from ${qualified} where id=any($1::uuid[])`, [table === "tenants" ? tenants : users]), true, 1_000)).toHaveLength(0); }
              catch (error) { failures.push(error); }
            }
            try { expect(await bounded("adminQuery", () => adminQuery("select id from public.tenant_memberships where tenant_id=any($1::uuid[]) or user_id=any($2::uuid[])", [tenants, users]), true, 1_000)).toHaveLength(0); } catch (error) { failures.push(error); }
            try { expect(await bounded("adminQuery", () => adminQuery("select operation_id from public.calculation_editor_operations where tenant_id=any($1::uuid[]) and actor_user_id=$2", [tenants, owned!.users.projektledare.id]), true, 1_000)).toHaveLength(0); } catch (error) { failures.push(error); }
            try { if (calculationId) expect(await bounded("adminQuery", () => adminQuery("select id from public.calculations where id=$1", [calculationId]), true, 1_000)).toHaveLength(0); } catch (error) { failures.push(error); }
            try { if (customerId) expect(await bounded("adminQuery", () => adminQuery("select id from public.customers where id=$1", [customerId]), true, 1_000)).toHaveLength(0); } catch (error) { failures.push(error); }
        }
        let knownPoolCloseOutcome: "completed" | "failed" | "unknown" = "unknown";
        // Attempt the real known pool close even when an earlier cleanup phase consumed its budget.
        const poolClose = observe("actual known pool close", closeAdminPool().then(() => {
          knownPoolCloseOutcome = "completed";
        }, error => { knownPoolCloseOutcome = "failed"; throw error; }));
        try { await bounded("known pool close settlement", () => poolClose, true, 1_000); }
        catch (error) { failures.push(error); }
        if (!owned) {
          // No returned handle authorizes per-fixture deletion or cleanup credit.
          // Fixed categories only: a real attempted pool close still pending is unknown.
          try {
            await bounded("info.attach", () => info.attach("revocation-setup-failure.json", { contentType: "application/json", body: Buffer.from(JSON.stringify({
              setup: "failed-before-ownership-return", perFixtureCleanup: "unknown",
              scenarioCredit: "none", cleanupCredit: "none", knownPoolCloseOutcome,
              wholeStackTeardown: "not-observed-by-case",
            })) }), true, 1_000);
          } catch (error) { failures.push(error); }
        }
      }
      for (const timer of timers) clearTimeout(timer);
      try { await bounded("attach actual revocation phases", () => info.attach("revocation-real-request-phases.json", { contentType: "application/json", body: Buffer.from(JSON.stringify({
        outcomes, dispatched, checkedServerRejection, verifiedDisabled,
        serverOutcome: dispatched ? (checkedServerRejection ? "checked-rejection" : "SERVER_OUTCOME_UNKNOWN") : "not-dispatched",
        scenarioCredit: scenarioComplete && failures.length === 0 && pending.size === 0 ? "asserted" : "none",
        cleanupCredit: owned && failures.length === 0 && pending.size === 0 && (!dispatched || checkedServerRejection) ? "asserted-owned-absence" : "none",
        pendingOperations: pending.size, clientPageCloseIsBackendCancellation: false,
      })) }), true, 1_000); } catch (error) { failures.push(error); }
      if (pending.size) failures.push(new Error("Revocation operation settlement remains unknown; no cleanup credit inferred"));
      if (failures.length) throw new AggregateError(failures, "Isolated revocation journey or owned restoration/cleanup failed");
    });

    test("E35-8-T-loading / AC6: held authoritative detail navigation retains selected identity until the real response", async ({ page }, info) => {
      const enteredAt = Date.now(), workDeadline = enteredAt + 45_000, cleanupDeadline = enteredAt + 59_000;
      const outcomes: { phase: string; status: "pending" | "fulfilled" | "rejected" }[] = [];
      const pending = new Set<Promise<unknown>>(), timers = new Set<ReturnType<typeof setTimeout>>();
      const failures: unknown[] = [];
      let cleaning = false;
      function observe<T>(phase: string, promise: Promise<T>): Promise<T> {
        const outcome = { phase, status: "pending" as "pending" | "fulfilled" | "rejected" };
        outcomes.push(outcome); pending.add(promise);
        void promise.then(() => { outcome.status = "fulfilled"; pending.delete(promise); },
          () => { outcome.status = "rejected"; pending.delete(promise); });
        return promise;
      }
      async function bounded<T>(phase: string, start: () => Promise<T>, cleanup = false, ceiling = 15_000): Promise<T> {
        const remaining = Math.min(ceiling, (cleanup ? cleanupDeadline : workDeadline) - Date.now());
        if ((!cleanup && cleaning) || remaining <= 0) throw new Error(`${phase}: rolling deadline exhausted`);
        let timer: ReturnType<typeof setTimeout> | undefined;
        const actual = observe(phase, start());
        try {
          return await Promise.race([actual, new Promise<never>((_, reject) => {
            timer = setTimeout(() => reject(new Error(`${phase}: timed out; actual operation may still be pending`)), remaining);
            timers.add(timer);
          })]);
        } finally { if (timer) { clearTimeout(timer); timers.delete(timer); } }
      }
      const selectedCalculation = fixture().calc;
      const detailPath = `/calculations/${selectedCalculation.id}`;
      let origin = "", interactionStarted = false, closing = false, releasePublished = false;
      // Passive public events only: sequence is this client's observed order, never server-clock causality.
      function createPassiveLoadingObserver(observedPage: Page, afterInput: () => boolean) {
        type FailureCategory = "aborted" | "blocked-by-client" | "other" | "unavailable";
        type Event = "requestfinished" | "requestfailed" | "document-request-issued" | "main-frame-commit" | "release-published" |
          "terminal-assertion-settled" | "cleanup-started" | "owned-routes-attempt-ended" |
          "owned-handler-removal-attempt-ended" | "owned-page-close-started" |
          "owned-page-close-attempt-ended" | "client-collection-attempt-ended" | "owned-observer-detach-attempt-ended";
        type Receipt = { event: Event; failure?: FailureCategory };
        type Commit = { order: number; cleanupOnly: boolean };
        let unavailable = false, cleanupOnly = false, order = 0, terminalOrder: number | undefined;
        let exactRequest: BrowserRequest | undefined, selectedKind: "document" | "client-rsc" | "unavailable" = "unavailable";
        let exactTerminal: "not-observed" | "requestfinished" | "requestfailed" | "multiple-events" = "not-observed";
        let detached = false, eventsTruncated = false, commitsTruncated = false;
        const before: Receipt[] = [], cleanup: Receipt[] = [], commits: Commit[] = [];
        let mainFrame: ReturnType<Page["mainFrame"]> | undefined;
        let documentUnobservable = false, documentRequests = 0, documentRequestsTruncated = false;
        let firstDocument: Commit | undefined;
        // Bind once before input; failed or missing frame association is never negative evidence.
        try { mainFrame = observedPage.mainFrame(); if (!mainFrame) documentUnobservable = true; }
        catch { documentUnobservable = true; unavailable = true; }
        const safe = (action: () => void) => { try { action(); } catch { unavailable = true; } };
        const record = (event: Event, failure?: FailureCategory) => {
          order++;
          const entries = cleanupOnly ? cleanup : before;
          if (entries.length < 16) entries.push(failure ? { event, failure } : { event });
          else { eventsTruncated = true; unavailable = true; }
        };
        const terminal = (request: BrowserRequest, event: "requestfinished" | "requestfailed") => safe(() => {
          if (!exactRequest || request !== exactRequest) return;
          let failure: FailureCategory | undefined;
          if (event === "requestfailed") {
            failure = "unavailable";
            try {
              const raw = request.failure()?.errorText;
              if (typeof raw === "string" && raw.length) {
                failure = /\bERR_BLOCKED_BY_CLIENT\b/i.test(raw) ? "blocked-by-client" :
                  /\bERR_ABORTED\b|\bNS_BINDING_ABORTED\b/i.test(raw) ? "aborted" : "other";
              }
            } catch { unavailable = true; }
          }
          record(event, failure);
          terminalOrder ??= order;
          exactTerminal = exactTerminal === "not-observed" ? event : "multiple-events";
        });
        const finished = (request: BrowserRequest) => terminal(request, "requestfinished");
        const failed = (request: BrowserRequest) => terminal(request, "requestfailed");
        const issued = (request: BrowserRequest) => {
          try {
            if (!afterInput() || !request.isNavigationRequest() || request.resourceType() !== "document") return;
            const frame = request.frame();
            if (!mainFrame || !frame) { documentUnobservable = true; unavailable = true; return; }
            if (frame !== mainFrame) return;
            if (documentRequests < 8) documentRequests++;
            else documentRequestsTruncated = true;
            if (!firstDocument) { record("document-request-issued"); firstDocument = { order, cleanupOnly }; }
          } catch { documentUnobservable = true; unavailable = true; }
        };
        const committed = (frame: import("@playwright/test").Frame) => safe(() => {
          if (!afterInput() || !mainFrame || frame !== mainFrame) return;
          record("main-frame-commit");
          if (commits.length < 4) commits.push({ order, cleanupOnly });
          else { commitsTruncated = true; unavailable = true; }
        });
        const snapshot = (onlyCleanup: boolean) => ({
          availability: unavailable ? "unavailable" as const : "available" as const,
          exactRequestSelected: Boolean(exactRequest), selectedKind, exactTerminal,
          events: (onlyCleanup ? cleanup : before).map(entry => ({ ...entry })), eventsTruncated,
          mainFrameCommits: commits.filter(entry => entry.cleanupOnly === onlyCleanup).map(entry => ({
            relativeToExactTerminal: terminalOrder === undefined ? "exact-terminal-not-observed" as const :
              entry.order < terminalOrder ? "before" as const : "after" as const,
          })), commitsTruncated,
          documentRequests, documentRequestsTruncated,
          // Issuance order is observation, not cancellation/fallback causation. None observed
          // excludes neither earlier router intent nor other fetches or unbound browser activity.
          firstPostInputDocumentRequest: {
            relativeToExactSelectedRscTerminal: documentUnobservable || unavailable || selectedKind !== "client-rsc" || terminalOrder === undefined
              ? "unobservable" as const : !firstDocument ? "none-observed" as const :
                firstDocument.order < terminalOrder ? "issued-before" as const : "issued-after" as const,
            relativeToFirstMainFrameCommit: documentUnobservable || unavailable ? "unobservable" as const :
              !firstDocument ? "none-observed" as const : !commits.length ? "commit-not-observed" as const :
                firstDocument.order < commits[0].order ? "issued-before" as const : "issued-after" as const,
            relativeToCleanup: documentUnobservable || unavailable ? "unobservable" as const :
              !firstDocument ? "none-observed" as const : firstDocument.cleanupOnly ? "cleanup-only" as const : "before-cleanup" as const,
          },
        });
        let preCleanup: ReturnType<typeof snapshot> | undefined;
        return {
          select: (request: BrowserRequest, documentNavigation: boolean) => safe(() => {
            if (!exactRequest) { exactRequest = request; selectedKind = documentNavigation ? "document" : "client-rsc"; }
          }),
          install: () => {
            try { observedPage.on("request", issued); }
            catch { documentUnobservable = true; unavailable = true; }
            safe(() => { observedPage.on("requestfinished", finished); });
            safe(() => { observedPage.on("requestfailed", failed); });
            safe(() => { observedPage.on("framenavigated", committed); });
          },
          mark: (event: Event) => safe(() => record(event)),
          beginCleanup: () => safe(() => {
            preCleanup = snapshot(false); cleanupOnly = true; record("cleanup-started");
          }),
          detach: () => {
            // Each removal is isolated; an observer error never replaces the journey/cleanup failure.
            let removed = true;
            for (const remove of [() => observedPage.off("request", issued), () => observedPage.off("requestfinished", finished),
              () => observedPage.off("requestfailed", failed), () => observedPage.off("framenavigated", committed)]) {
              try { remove(); } catch { removed = false; unavailable = true; }
            }
            detached = removed; safe(() => record("owned-observer-detach-attempt-ended"));
          },
          evidence: () => {
            try {
              return { availability: unavailable ? "unavailable" as const : "available" as const,
                preCleanup: preCleanup ?? { availability: "unavailable" as const }, cleanupOnly: snapshot(true), detached,
                firstPostInputMainFrameCommit: commits.length ? {
                  relativeToExactTerminal: terminalOrder === undefined ? "exact-terminal-not-observed" as const :
                    commits[0].order < terminalOrder ? "before" as const : "after" as const,
                  relativeToCleanup: commits[0].cleanupOnly ? "cleanup-only" as const : "before-cleanup" as const,
                } : "not-observed" as const };
            } catch { return { availability: "unavailable" as const }; }
          },
        };
      }
      const passiveLoading = createPassiveLoadingObserver(page, () => interactionStarted);
      const ownsUrl = (url: URL) => url.origin === origin && url.pathname === detailPath;
      let release!: () => void;
      const released = observe("owned hold release", new Promise<void>(resolve => { release = resolve; }));
      const held: { request: BrowserRequest; kind: "prefetch" | "navigation"; afterInteraction: boolean;
        dispatched: boolean; responded: boolean; continuation: "held" | "pending" | "fulfilled" | "rejected"; done: Promise<void> }[] = [];
      const handler: Parameters<Page["route"]>[1] = route => {
        const request = route.request(), headers = request.headers();
        const mainFrame = request.frame() === page.mainFrame();
        const documentNavigation = request.isNavigationRequest() && mainFrame;
        const nextRead = mainFrame && headers.rsc === "1" && Boolean(headers["next-router-state-tree"] || headers["next-router-prefetch"] || headers["next-router-segment-prefetch"]);
        if (closing || !ownsUrl(new URL(request.url())) || request.method() !== "GET" || (!documentNavigation && !nextRead)) {
          return observe("unheld route continuation", route.continue());
        }
        const prefetch = Boolean(headers["next-router-prefetch"] || headers["next-router-segment-prefetch"] || /prefetch/i.test(headers.purpose ?? headers["sec-purpose"] ?? ""));
        const entry = { request, kind: prefetch ? "prefetch" as const : "navigation" as const,
          afterInteraction: interactionStarted, dispatched: false, responded: false,
          continuation: "held" as "held" | "pending" | "fulfilled" | "rejected", done: Promise.resolve() };
        held.push(entry);
        if (entry.kind === "navigation" && entry.afterInteraction) passiveLoading.select(request, documentNavigation);
        entry.done = observe("owned route lifecycle", (async () => {
          await released;
          entry.dispatched = true; entry.continuation = "pending";
          try { await observe("original route.continue", route.continue()); entry.continuation = "fulfilled"; }
          catch (error) { entry.continuation = "rejected"; throw error; }
        })());
        return entry.done;
      };
      const responseListener = (response: import("@playwright/test").Response) => {
        const entry = held.find(item => item.request === response.request());
        if (entry) entry.responded = true;
      };
      let installed = false;
      let responseState: "not-started" | "pending" | "received" | "null" | "rejected" = "not-started";
      let terminalState: "not-started" | "pending" | "finished" | "returned-error" | "rejected" = "not-started";
      try {
        await bounded("sign in", () => signIn(page));
        origin = new URL(page.url()).origin;
        // Own every selected-detail hold, including prefetch dependencies, before list mount.
        await bounded("install selected route", () => page.route(ownsUrl, handler)); installed = true;
        page.on("response", responseListener);
        passiveLoading.install();
        await bounded("render list", () => page.goto("/calculations"));
        const selected = page.getByTestId("calculation-list-row").filter({ hasText: selectedCalculation.title });
        await bounded("selected row cardinality", () => expect(selected).toHaveCount(1));
        await bounded("selected href", () => expect(selected).toHaveAttribute("href", detailPath));
        await bounded("selected hydration", () => hydrated(selected));
        await bounded("selected focus", () => selected.focus());
        interactionStarted = true;
        // Pinned Playwright bypasses the navigation barrier with noWaitAfter. Keep the real awaited action.
        await bounded("real Enter returned", () => selected.press("Enter", { noWaitAfter: true }));
        await bounded("post-Link non-prefetch request", () => expect.poll(() => held.filter(entry => entry.kind === "navigation" && entry.afterInteraction).length).toBeGreaterThan(0));
        const navigation = held.find(entry => entry.kind === "navigation" && entry.afterInteraction)!;
        const assertHeld = async () => {
          expect(navigation.dispatched, "Selected detail must still be held before upstream dispatch").toBe(false);
          expect(navigation.responded, "A pending detail cannot already have a real response").toBe(false);
          await bounded("held list heading", () => expect(page.getByRole("heading", { level: 1, name: "Kalkyler", exact: true })).toBeVisible());
          await bounded("held selected visible", () => expect(selected).toBeVisible());
          await bounded("held selected href", () => expect(selected).toHaveAttribute("href", detailPath));
          await bounded("held selected title", () => expect(selected).toContainText(selectedCalculation.title));
          await bounded("held no empty list", () => expect(page.getByTestId("calculation-list-empty")).toHaveCount(0));
          await bounded("held no false filter empty", () => expect(page.getByText("Inga träffar", { exact: true })).toHaveCount(0));
          for (const testId of ["calculation-editor", "calculation-not-found", "calculation-detail-failed", "sections-empty", "totals-summary"]) {
            await bounded(`held absent ${testId}`, () => expect(page.getByTestId(testId)).toHaveCount(0));
          }
        };
        await bounded("held original capture completed", () => capture(page, info, "calculation-list", "loading-selected-detail", selectedCalculation.id, selected, assertHeld));
        releasePublished = true; release();
        passiveLoading.mark("release-published");
        outcomes.push({ phase: "release published for ALL owned holds", status: "fulfilled" });
        await bounded("original route.continue settled", () => navigation.done);
        responseState = "pending";
        const actualResponse = await bounded("same original request.response", () => navigation.request.response().then(response => {
          responseState = response ? "received" : "null"; return response;
        }, error => { responseState = "rejected"; throw error; }));
        expect(actualResponse, "The same continued original request must return an actual response").not.toBeNull();
        expect(actualResponse!.request()).toBe(navigation.request);
        expect(actualResponse!.status()).toBe(200);
        expect(new URL(actualResponse!.url()).origin).toBe(origin);
        expect(new URL(actualResponse!.url()).pathname).toBe(detailPath);
        expect(actualResponse!.headers()["content-type"]).toContain(navigation.request.isNavigationRequest() ? "text/html" : "text/x-component");
        const rendered = observe("matching detail render sequence", (async () => {
          await bounded("matching detail URL rendered", () => expect(page).toHaveURL(new URL(detailPath, origin).href));
          await bounded("matching detail heading rendered", () => expect(page.getByRole("heading", { level: 1, name: selectedCalculation.title, exact: true })).toBeVisible());
          await bounded("matching detail entity rendered", () => expect(titleForm(page).locator('input[name="id"]')).toHaveValue(selectedCalculation.id));
          await bounded("no detail not found", () => expect(page.getByTestId("calculation-not-found")).toHaveCount(0));
          await bounded("no detail read failure", () => expect(page.getByTestId("calculation-detail-failed")).toHaveCount(0));
          const summary = page.getByTestId("totals-summary").filter({ visible: true });
          await bounded("unchanged golden net rendered", () => expect(summary.getByTestId("summary-net")).toContainText("2200,00"));
          await bounded("unchanged golden VAT rendered", () => expect(summary.getByTestId("summary-vat")).toContainText("550,00"));
          await bounded("unchanged golden gross rendered", () => expect(summary.getByTestId("summary-gross")).toContainText("2750,00"));
        })());
        const terminal = observe("same response terminal assertion", (async () => {
          terminalState = "pending";
          try {
            expect(await bounded("same response.finished terminal", () => actualResponse!.finished().then(result => {
              terminalState = result === null ? "finished" : "returned-error"; return result;
            }, error => { terminalState = "rejected"; throw error; }))).toBeNull();
          } finally {
            outcomes.push({ phase: "matching detail render sequence at bounded terminal settlement", status: outcomes.find(outcome => outcome.phase === "matching detail render sequence")!.status });
            passiveLoading.mark("terminal-assertion-settled");
          }
        })());
        const branches = await Promise.allSettled([rendered, terminal]);
        const branchErrors = branches.filter(result => result.status === "rejected").map(result => result.reason);
        if (branchErrors.length) throw new AggregateError(branchErrors, "Matching detail render and same-response terminal are both required");
      } catch (error) { failures.push(error); }
      finally {
        passiveLoading.beginCleanup();
        cleaning = true; closing = true; release();
        try { await bounded("settle every owned route", () => Promise.allSettled(held.map(entry => entry.done)).then(results => {
          for (const result of results) if (result.status === "rejected") failures.push(result.reason);
        }), true, 2_000); }
        catch (error) { failures.push(error); }
        finally { passiveLoading.mark("owned-routes-attempt-ended"); }
        // Remove only this case's handler before any owned-page close; preserve an actual unroute failure.
        try { if (installed) await bounded("remove exact owned handler", () => page.unroute(ownsUrl, handler), true, 2_000); }
        catch (error) { failures.push(error); }
        finally { passiveLoading.mark("owned-handler-removal-attempt-ended"); }
        // A race timeout does not cancel. Close only this owned page to terminate pending client channels.
        if (pending.size) {
          passiveLoading.mark("owned-page-close-started");
          try { await bounded("close owned page/client channels only", () => page.close({ runBeforeUnload: false }), true, 3_000); }
          catch (error) { failures.push(error); }
          finally { passiveLoading.mark("owned-page-close-attempt-ended"); }
        }
        try { await bounded("collect actual client settlements", () => Promise.allSettled([...pending]).then(results => {
          for (const result of results) if (result.status === "rejected") failures.push(result.reason);
        }), true, 2_000); }
        catch (error) { failures.push(error); }
        finally { passiveLoading.mark("client-collection-attempt-ended"); }
        passiveLoading.detach();
        page.off("response", responseListener);
        for (const timer of timers) clearTimeout(timer);
        try { await bounded("attach actual loading phases", () => info.attach("loading-navigation-correlation.json", { contentType: "application/json", body: Buffer.from(JSON.stringify({
          releasePublished, responseState, terminalState, outcomes, pendingClientOperations: pending.size,
          clientPageCloseIsBackendCancellation: false, heldRequestCount: held.length,
          passiveRequestLifecycle: passiveLoading.evidence(),
          requests: held.slice(0, 8).map(entry => ({ kind: entry.kind, afterInteraction: entry.afterInteraction,
            dispatched: entry.dispatched, responded: entry.responded, continuation: entry.continuation })), truncated: held.length > 8,
        })) }), true, 1_000); } catch (error) { failures.push(error); }
        if (pending.size) failures.push(new Error("Loading client operation settlement remains unknown"));
      }
      if (failures.length) throw new AggregateError(failures, "Loading journey primary/cleanup phases failed; see actual phase outcomes");
    });
  });
}
