/** General lane: ordinary seeded fixture only; no dashboard19/proxy dependency. */
import { test, expect } from "./guarded-test";
import type { Page, TestInfo } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

test.use({ trace: "off", video: "off", screenshot: "off" });


/** Preserve full-page context and attach an explicitly whole-viewport original. */
async function attachDashboardView(page: Page, testInfo: TestInfo, name: string) {
  const viewport = page.viewportSize();
  if (!viewport) throw new Error("Dashboard capture requires an explicit viewport");
  const context = await page.screenshot({ fullPage: true });
  await testInfo.attach(name, { body: context, contentType: "image/png" });
  // Reuse the original when its actual PNG dimensions already equal the viewport.
  const whole = context.readUInt32BE(16) === viewport.width && context.readUInt32BE(20) === viewport.height
    ? context : await page.screenshot({ fullPage: false });
  await testInfo.attach(`${name}-whole-viewport-${viewport.width}x${viewport.height}`, { body: whole, contentType: "image/png" });
}

async function signIn(page: Page) {
  const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8")) as {
    adminA: { email: string; password: string }; tenantA: { name: string };
  };
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await submit.evaluate(element => new Promise<void>(resolve => {
    const tick = () => Object.keys(element).some(key => key.startsWith("__react")) ? resolve() : requestAnimationFrame(tick);
    tick();
  }));
  await page.getByLabel("E-post").fill(fixture.adminA.email);
  await page.getByLabel("Lösenord").fill(fixture.adminA.password);
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await expect(page.getByTestId("tenant-context")).toContainText(fixture.tenantA.name);
}

for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 900 }]) {
  test(`E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded ${viewport.width} connected facts and keyboard destination`, async ({ page }, testInfo) => {
    await page.setViewportSize(viewport);
    await signIn(page);
    const pipeline = page.getByRole("region", { name: "Offertpipeline", exact: true });
    await expect(pipeline).toBeVisible();
    for (const name of ["Skickade", "Accepterade", "Förlorade", "Träffgrad", "Accepterat värde"]) {
      await expect(pipeline.getByLabel(name, { exact: true })).toBeVisible();
    }
    await expect(pipeline.locator("time")).toHaveAttribute("datetime", /\d{4}-\d{2}-\d{2}T/);
    const link = pipeline.getByRole("link", { name: "Visa offerter", exact: true });
    await expect(link).toHaveCount(1);
    await expect(link).toHaveAttribute("href", "/quotes");
    await link.focus();
    await expect(link).toBeFocused();
    // Use a real Tab gesture so :focus-visible is exercised rather than assuming .focus() suffices.
    await page.keyboard.press("Shift+Tab");
    await page.keyboard.press("Tab");
    await expect(link).toBeFocused();
    expect(await link.evaluate(element => {
      const style = getComputedStyle(element);
      return style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0;
    })).toBe(true);
    const bounds = (await link.boundingBox())!;
    if (viewport.width === 360) {
      expect(bounds.height).toBeGreaterThanOrEqual(44);
      expect(bounds.width).toBeGreaterThanOrEqual(44);
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    await attachDashboardView(page, testInfo, `dashboard-current-period-${viewport.width}`);
    await page.keyboard.press("Enter");
    await expect(page).toHaveURL(/\/quotes$/);
    await expect(page.getByRole("heading", { name: "Offerter", exact: true })).toBeVisible();
  });
}

test("E35-14-T-AC2 E35-14-T-AC4 phone values remain in one column through enlarged text", async ({ page }, testInfo) => {
  await page.setViewportSize({ width: 360, height: 640 });
  await signIn(page);
  const pipeline = page.getByRole("region", { name: "Offertpipeline", exact: true });
  await expect(pipeline.getByLabel("Skickade", { exact: true })).toBeVisible();
  // The read-only phone composition must retain every real value, without a side-by-side metric squeeze.
  const metricGrid = pipeline.locator("dl");
  expect(await metricGrid.evaluate(element => getComputedStyle(element).gridTemplateColumns.split(/\s+/).length)).toBe(1);
  const typography = pipeline.locator("h2, dt, dd, p, a");
  const before = await typography.evaluateAll(elements => elements.map(element => {
    const text = document.createRange();
    text.selectNodeContents(element);
    return { fontSize: parseFloat(getComputedStyle(element).fontSize), height: text.getBoundingClientRect().height };
  }));
  const rootSize = await page.evaluate(() => parseFloat(getComputedStyle(document.documentElement).fontSize));
  await page.addStyleTag({ content: `html { font-size: ${rootSize * 2}px !important; }` });
  const enlarged = await typography.evaluateAll(elements => elements.map(element => {
    const text = document.createRange();
    text.selectNodeContents(element);
    return { fontSize: parseFloat(getComputedStyle(element).fontSize), height: text.getBoundingClientRect().height };
  }));
  expect(enlarged).toHaveLength(before.length);
  for (const [index, actual] of enlarged.entries()) {
    expect(actual.fontSize).toBeCloseTo(before[index].fontSize * 2, 1);
    expect(actual.height).toBeGreaterThan(before[index].height);
  }
  for (const name of ["Skickade", "Accepterade", "Förlorade", "Träffgrad", "Accepterat värde"]) {
    await expect(pipeline.getByLabel(name, { exact: true })).toBeVisible();
  }
  const link = pipeline.getByRole("link", { name: "Visa offerter", exact: true });
  await link.scrollIntoViewIfNeeded();
  await link.click({ trial: true });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  await attachDashboardView(page, testInfo, "dashboard-enlarged-text-phone");
});
