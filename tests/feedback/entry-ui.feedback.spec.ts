import { test, expect } from "@playwright/test";

test("production entry page hydrates, supports keyboard input and fits the viewport", async ({ page }, testInfo) => {
  const errors: string[] = [];
  page.on("pageerror", error => errors.push(error.message));
  const response = await page.goto("/login");
  expect(response?.status()).toBe(200);
  await expect(page.getByRole("heading", { name: "Logga in", exact: true })).toBeVisible();
  // DOM input alone can succeed on unhydrated HTML. Wait for React's actual
  // client attachment before checking controlled inputs and keyboard order.
  await expect.poll(() => page.locator("form").evaluate(form => Object.keys(form).some(key => key.startsWith("__reactFiber$")))).toBe(true);
  const email = page.getByLabel("E-post", { exact: true });
  const password = page.getByLabel("Lösenord", { exact: true });
  await email.focus();
  await page.keyboard.type("entry-feedback@example.invalid");
  await expect(email).toHaveValue("entry-feedback@example.invalid");
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
  await page.keyboard.type("synthetic-feedback-only");
  await expect(password).toHaveValue("synthetic-feedback-only");
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Logga in", exact: true })).toBeFocused();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  for (const input of [email, password]) {
    const bounds = await input.boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.width).toBeGreaterThan(200);
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(page.viewportSize()!.width);
  }
  await email.clear();
  await password.clear();
  // Captured review evidence, not a baseline comparison or visual acceptance.
  await testInfo.attach("production-entry-page", { body: await page.screenshot({ fullPage: true }), contentType: "image/png" });
  expect(errors).toEqual([]);
  expect(await page.context().cookies()).toEqual([]);
});
