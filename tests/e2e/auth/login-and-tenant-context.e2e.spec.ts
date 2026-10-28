/**
 * Story 2.1 — E2E acceptance (browser journeys), GREEN as of the Playwright runner
 * (TEA testarch-framework). Closes foundation gaps G-2 (UI active-tenant-context
 * display) and G-3 (anonymous route redirect).
 *
 * Seeded by `tests/e2e/global-setup.ts`: adminA has an active `tenant_admin` membership
 * in tenantA; orphanUser has none. The app runs against the local Supabase stack
 * (`playwright.config.ts` webServer).
 *
 * COVERAGE (test-design-epic-2-foundation-consolidated.md):
 *   AC3 → anonymous → protected route redirects to /login (G-3, P1)
 *   AC1 → tenant_admin signs in → lands in the (app) shell
 *   AC1 → top bar shows the resolved tenant/company context + current user (G-2, P1)
 *   AC2 → authenticated user WITHOUT active membership → user-safe no-access, zero tenant data
 *   round-trip → sign out → /login, and a protected route redirects again (AC1 + AC3)
 */
import { test, expect } from "../dashboard/guarded-test";
import type { Page, Locator } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

interface FixtureCreds {
  readonly tenantA: { readonly name: string };
  readonly adminA: { readonly email: string; readonly password: string };
  readonly orphanUser: { readonly email: string; readonly password: string };
}

const fixture: FixtureCreds = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "e2e", ".auth", "fixture.json"),
    "utf8",
  ),
);

/**
 * Wait until a control is React-HYDRATED before interacting. The login form + sign-out
 * are client islands; clicking before hydration triggers the browser's NATIVE submit
 * (a GET that puts credentials in the URL) or a no-op, racing the JS handler. React
 * attaches `__reactFiber$`/`__reactProps$` keys to a DOM node once it has hydrated —
 * poll for that as a deterministic readiness signal (more reliable than networkidle,
 * which Next dev's HMR socket never reaches).
 */
async function waitForHydrated(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        const ready = () =>
          Object.keys(el).some((k) => k.startsWith("__react"));
        const tick = () => (ready() ? resolve() : requestAnimationFrame(tick));
        tick();
      }),
  );
}

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in" });
  await waitForHydrated(submit); // the whole form hydrates with its submit control
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Lösenord").fill(password);
  await submit.click();
}

test.describe("Login + tenant-context display (Story 2.1 E2E — G-2/G-3)", () => {
  test("AC3: an anonymous visitor to a protected (app) route is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("AC1: a tenant_admin can sign in with email + password and lands in the (app) shell", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await expect(page).toHaveURL(/\/dashboard/);
  });

  test("AC1/G-2: after sign-in, the top bar displays the resolved active tenant/company context and current user", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await expect(page).toHaveURL(/\/dashboard/);
    await expect(page.getByTestId("tenant-context")).toContainText(
      fixture.tenantA.name,
    );
    await expect(page.getByTestId("current-user")).toContainText(
      fixture.adminA.email,
    );
  });

  test("AC2: an authenticated user WITHOUT active membership sees a user-safe no-access state and ZERO tenant data", async ({
    page,
  }) => {
    await signIn(page, fixture.orphanUser.email, fixture.orphanUser.password);
    // Authenticated-but-no-membership renders NoTenantAccess (role="alert") INSTEAD of
    // the shell — a generic denial that never reveals whether a tenant/user exists.
    // Scope to user-facing application content: after a client navigation, Next injects
    // `#__next-route-announcer__` (also role="alert") beside the application root and
    // gives it the route title, so denial text alone is no longer unique.
    await expect(
      page.locator("main").getByRole("alert").filter({ hasText: "Ingen åtkomst" }),
    ).toBeVisible();
    // ZERO tenant data: the shell's tenant-context anchor must not be present at all.
    await expect(page.getByTestId("tenant-context")).toHaveCount(0);
  });

  test("login/logout loop: signing out returns to /login and a protected route again redirects (AC1 + AC3 round-trip)", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await expect(page).toHaveURL(/\/dashboard/);

    const signOut = page.getByRole("button", { name: "Logga ut" });
    await waitForHydrated(signOut); // client island — wait before clicking
    await signOut.click();
    await expect(page).toHaveURL(/\/login(\?|$)/);

    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });
});

/**
 * Story 35.2 RED scaffolds. Selectors are source-derived, not browser-verified.
 * Existing five Story 2.1 cases above remain active and unchanged.
 *
 * E35-2-T-AC1/2/4/5: bounded rendered login foundation/focus/reflow evidence.
 * E35-2-T-AC3/6/7: real credential rejection -> explicit keyboard retry ->
 * cookie-bound server landing. State aliases: E35-2-T-validation/denied/
 * error-retry/loaded/confirmed (and corresponding E35-2-STATE-* IDs).
 * Deterministic loading/submitting/connection-required/unknown and router order
 * belong to the actual-handler unit seam, not simulated browser Auth responses.
 * Existing role/orphan/logout cases supply inherited authority coverage; this
 * does not create another role matrix or a dialog/file flow.
 */
test.describe("Story 35.2 — real login and accessible foundations (ATDD RED)", () => {
  // Retained credential values must not become trace/video/screenshot artifacts.
  test.use({ trace: "off", video: "off", screenshot: "off" });

  const viewports = [
    { width: 360, height: 640 },
    { width: 1440, height: 900 },
  ] as const;

  async function expectNoHorizontalOverflow(page: Page): Promise<void> {
    expect(
      await page.evaluate(() =>
        Math.max(document.documentElement.scrollWidth, document.body.scrollWidth) <=
        document.documentElement.clientWidth,
      ),
      "The credential journey must fit the viewport without horizontal scrolling",
    ).toBe(true);
  }

  async function expectReadableText(locator: Locator): Promise<void> {
    const contrast = await locator.evaluate((element) => {
      // Measure computed colors on this flat login surface, including translucent
      // backgrounds. This is not a screenshot, disabled-state or focus-ring audit.
      const canvas = document.createElement("canvas");
      canvas.width = canvas.height = 1;
      const context = canvas.getContext("2d");
      if (!context) throw new Error("A canvas context is required to measure contrast");
      context.fillStyle = "white";
      context.fillRect(0, 0, 1, 1);
      const ancestors: Element[] = [];
      for (let current: Element | null = element; current; current = current.parentElement) {
        ancestors.unshift(current);
      }
      for (const ancestor of ancestors) {
        const style = getComputedStyle(ancestor);
        if (style.backgroundImage !== "none" || Number(style.opacity) !== 1) {
          throw new Error("Composite image/opacity contrast needs rendered measurement");
        }
        context.fillStyle = style.backgroundColor;
        context.fillRect(0, 0, 1, 1);
      }
      const background = context.getImageData(0, 0, 1, 1).data;
      context.fillStyle = getComputedStyle(element).color;
      context.fillRect(0, 0, 1, 1);
      const foreground = context.getImageData(0, 0, 1, 1).data;
      const luminance = (color: Uint8ClampedArray) => {
        const linear = Array.from(color.slice(0, 3), (channel) => {
          const value = channel / 255;
          return value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4;
        });
        return linear[0] * 0.2126 + linear[1] * 0.7152 + linear[2] * 0.0722;
      };
      const a = luminance(foreground);
      const b = luminance(background);
      return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    });
    expect(contrast, "Actual login text must meet 4.5:1 contrast").toBeGreaterThanOrEqual(4.5);
  }

  for (const viewport of viewports) {
    test.skip(`[P0] E35-2-T-AC7; [P1] E35-2-T-AC3/4/6: invalid then corrected keyboard sign-in confirms current tenant/user at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/login");
      const main = page.getByRole("main");
      const email = main.getByLabel("E-post", { exact: true });
      const password = main.getByLabel("Lösenord", { exact: true });
      const submit = main.getByRole("button", { name: "Logga in", exact: true });
      await waitForHydrated(submit);

      // Source-associated labels are exercised via keyboard, not only locator fills.
      await email.focus();
      await expect(email).toBeFocused();
      await email.fill(fixture.adminA.email);
      await page.keyboard.press("Tab");
      await expect(password).toBeFocused();
      const invalidPassword = `${fixture.adminA.password}-invalid-35-2`;
      await password.fill(invalidPassword);
      await page.keyboard.press("Tab");
      await expect(submit).toBeFocused();
      await page.keyboard.press("Enter");

      // E35-2-STATE-validation/denied/error-retry: this is a real Auth failure,
      // not a mocked token response and not evidence of authenticated membership.
      const error = main.getByRole("alert");
      await expect(error).toHaveText("Fel e-post eller lösenord. Försök igen.");
      await expect(page).toHaveURL(/\/login(\?|$)/);
      await expect(email).toHaveValue(fixture.adminA.email);
      expect(await password.inputValue() === invalidPassword, "Rejected input remains in memory").toBe(true);
      await expect(submit).toBeEnabled();
      await expect(page.getByTestId("tenant-context")).toHaveCount(0);
      await expect(page.getByTestId("current-user")).toHaveCount(0);
      await expect(page.getByRole("navigation", { name: "Huvudnavigation" })).toHaveCount(0);
      await expectReadableText(error);
      await expect(error).toBeInViewport();
      await expect(submit).toBeInViewport();
      await expectNoHorizontalOverflow(page);

      if (viewport.width === 360) {
        for (const control of [email, password, submit]) {
          const box = await control.boundingBox();
          expect(box, "Phone controls must have measurable touch targets").not.toBeNull();
          expect(box!.height, "Phone touch target height").toBeGreaterThanOrEqual(44);
          expect(box!.width, "Phone touch target width").toBeGreaterThanOrEqual(44);
        }
      }

      // Explicit correction uses the existing real session/cookie flow. Derive
      // this fixture's destination from the checked role resolver, not a universal
      // dashboard assumption. Root/protected layout still decide actual access.
      const { resolveLandingRoute } = await import("../../../src/server/authz/phase-a-surface");
      const expectedLanding = resolveLandingRoute(["tenant_admin"]);
      expect(expectedLanding).not.toBeNull();
      await password.focus();
      await password.fill(fixture.adminA.password);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL((url) => url.pathname === expectedLanding);
      await expect(page.getByTestId("tenant-context")).toContainText(fixture.tenantA.name);
      await expect(page.getByTestId("current-user")).toContainText(fixture.adminA.email);

      // E35-2-STATE-loaded/confirmed: reloading rechecks server authority with
      // the actual persisted cookie; UI text or an SDK response alone is insufficient.
      await page.reload();
      await expect(page).toHaveURL((url) => url.pathname === expectedLanding);
      await expect(page.getByTestId("tenant-context")).toContainText(fixture.tenantA.name);
      await expect(page.getByTestId("current-user")).toContainText(fixture.adminA.email);
    });

    test.skip(`[P1] E35-2-T-AC1/2/4/5: plain wordmark, local font, readable keyboard focus and enlarged reflow at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/login");
      const main = page.getByRole("main");
      const email = main.getByLabel("E-post", { exact: true });
      const password = main.getByLabel("Lösenord", { exact: true });
      const submit = main.getByRole("button", { name: "Logga in", exact: true });
      await waitForHydrated(submit);
      const wordmark = main.getByText("Kopplas", { exact: true });
      await expect(wordmark).toBeVisible();
      await expect(wordmark.getByRole("img")).toHaveCount(0);

      await page.evaluate(async () => { await document.fonts.ready; });
      const font = await wordmark.evaluate((element) => {
        const family = getComputedStyle(element).fontFamily.split(",")[0].replace(/["']/g, "").trim();
        const normalize = (value: string) => value.replace(/["']/g, "").trim();
        const fontResources = performance.getEntriesByType("resource")
          .map((entry) => entry.name)
          .filter((name) => /\.(woff2?|ttf|otf)(\?|$)/i.test(name));
        return {
          family,
          loaded: Array.from(document.fonts).some((face) => normalize(face.family) === family && face.status === "loaded"),
          localResources: fontResources.length > 0 && fontResources.every((name) => new URL(name).origin === location.origin),
        };
      });
      expect(font.family).not.toMatch(/Geist/i);
      expect(font.loaded, "The rendered wordmark uses a loaded font face").toBe(true);
      expect(font.localResources, "Login fonts load from the application origin").toBe(true);
      // Exact official Inter roman/italic/license identity is a separate asset
      // hash assertion; a generated next/font family name cannot prove its bytes.
      for (const text of [wordmark, main.getByRole("heading", { name: "Logga in", exact: true }), main.getByText("E-post", { exact: true }), main.getByText("Lösenord", { exact: true }), submit]) {
        await expectReadableText(text);
      }

      for (const control of [email, password, submit]) {
        await control.blur();
        const before = await control.evaluate((element) => {
          const style = getComputedStyle(element);
          return `${style.outlineStyle}/${style.outlineWidth}/${style.outlineColor}/${style.boxShadow}`;
        });
        // Reach each actual control with Tab to exercise focus-visible behavior.
        if (control === email) await submit.focus();
        await page.keyboard.press("Tab");
        // The browser may place its location bar between the last and first
        // control, so explicitly return to the first control before subsequent Tabs.
        if (control === email) await email.focus();
        await expect(control).toBeFocused();
        await expect(control).toBeInViewport();
        const focus = await control.evaluate((element) => {
          const style = getComputedStyle(element);
          return {
            signature: `${style.outlineStyle}/${style.outlineWidth}/${style.outlineColor}/${style.boxShadow}`,
            indicator: (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none",
          };
        });
        expect(focus.signature, "Keyboard focus changes the visible control treatment").not.toBe(before);
        expect(focus.indicator, "Focused controls have a visible outline or ring").toBe(true);
      }

      // Exercise actual text enlargement without adding a product state hook.
      // This desktop-browser check does not claim virtual-keyboard emulation.
      await page.evaluate(() => { document.documentElement.style.fontSize = "200%"; });
      await expectNoHorizontalOverflow(page);
      for (const control of [email, password, submit]) {
        await control.scrollIntoViewIfNeeded();
        await expect(control).toBeInViewport();
      }
      await expect(submit).toBeEnabled();
    });
  }
});
