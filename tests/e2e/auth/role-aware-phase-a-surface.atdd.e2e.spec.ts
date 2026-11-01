/** Story 11.2 browser ATDD against the real server-derived navigation and local role fixture. */
import { expect, test } from "../dashboard/guarded-test";
import type { Locator, Page, Request, Route, TestInfo } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

type RoleFixture = {
  readonly email: string;
  readonly password: string;
};
type Fixture = {
  readonly tenantA: { readonly id: string; readonly name: string };
  readonly roleAware: {
    readonly saljare: RoleFixture;
    readonly montor: RoleFixture;
  };
};

const fixture: Fixture = JSON.parse(
  readFileSync(path.join(process.cwd(), "tests", "e2e", ".auth", "fixture.json"), "utf8"),
);

const SALJARE_GRANTED_NAV = ["/dashboard", "/customers", "/quotes"];

// Login credentials must never enter a trace, video or automatic failure image.
// Candidate screenshots belong after authenticated assertions, outside this scaffold.
test.use({ trace: "off", video: "off", screenshot: "off" });

async function waitForHydrated(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const ready = () => Object.keys(element).some((key) => key.startsWith("__react"));
        const tick = () => (ready() ? resolve() : requestAnimationFrame(tick));
        tick();
      }),
  );
}

async function logIn(
  page: Page,
  credentials: RoleFixture,
  expectedLanding: "/dashboard" | "/my-day",
): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in" });
  await waitForHydrated(submit);
  await page.getByLabel("E-post").fill(credentials.email);
  await page.getByLabel("Lösenord").fill(credentials.password);
  await submit.click();
  // Login writes the cookie in the client-side callback before routing. Wait for
  // the server-confirmed landing before a test performs a direct navigation, or
  // that navigation can race the cookie write and be redirected back to /login.
  await expect(page).toHaveURL((url) => url.pathname === expectedLanding);
}

test.describe("Story 11.2 rollstyrda Phase A-ytor", () => {
  test("[P0] Säljare receives only matrix-granted server navigation and lands on dashboard", async ({ page }) => {
    await logIn(page, fixture.roleAware.saljare, "/dashboard");

    await expect(page).toHaveURL(/\/dashboard$/);
    const nav = page.getByRole("navigation", { name: "Huvudnavigation" }).first();
    await expect(nav).toBeVisible();
    await expect(nav.getByRole("link")).toHaveCount(SALJARE_GRANTED_NAV.length);
    await expect(
      nav.getByRole("link").evaluateAll((links) => links.map((link) => link.getAttribute("href"))),
    ).resolves.toEqual(SALJARE_GRANTED_NAV);
  });

  test("[P0] Montör direct navigation to active but ungranted settings has one generic denial and no data", async ({ page }) => {
    await logIn(page, fixture.roleAware.montor, "/my-day");
    await expect(page).toHaveURL((url) => url.pathname === "/my-day");
    await page.goto("/settings");

    const denial = page.getByRole("heading", { name: "Ingen åtkomst" });
    await expect(denial).toBeVisible();
    await expect(page.getByRole("alert").filter({ hasText: "Ingen åtkomst" })).toBeVisible();
    const nav = page.getByRole("navigation", { name: "Huvudnavigation" }).first();
    await expect(nav.getByRole("link", { name: "Inställningar" })).toHaveCount(0);
    const main = page.getByRole("main");
    await expect(main.getByRole("table")).toHaveCount(0);
    await expect(main.getByRole("textbox")).toHaveCount(0);
  });

  test("[P0] Montör lands on Min dag with monetary values withheld", async ({ page }) => {
    await logIn(page, fixture.roleAware.montor, "/my-day");

    await expect(page).toHaveURL((url) => url.pathname === "/my-day");
    const main = page.getByRole("main");
    await expect(main).toBeVisible();
    await expect(main.getByText(/SEK|kr/)).toHaveCount(0);
    await expect(main.getByText(/omsättning|marginal|intäkt/i)).toHaveCount(0);
  });

  test("[P1] Säljare can open its matrix-granted customers route without receiving cost or margin", async ({ page }) => {
    await logIn(page, fixture.roleAware.saljare, "/dashboard");
    await page.goto("/customers");

    await expect(page).toHaveURL(/\/customers$/);
    const main = page.getByRole("main");
    await expect(main).toBeVisible();
    await expect(main.getByText(/självkostnad|täckningsbidrag|marginal/i)).toHaveCount(0);
  });

  test("[P0] Säljare is never offered calculation-origin quote creation", async ({ page }) => {
    await logIn(page, fixture.roleAware.saljare, "/dashboard");
    await page.goto("/quotes");

    await expect(page).toHaveURL(/\/quotes$/);
    await expect(page.getByTestId("new-quote-button")).toHaveCount(0);
    // The existing quote detail keeps the approved customer-visible successor flow;
    // this only removes the forbidden calculation-route affordance.
    await expect(page.getByRole("link", { name: /kalkyler/i })).toHaveCount(0);
  });
});

/**
 * Story 35.5 acceptance journeys use the real server-derived role projection.
 * The original five Story 11.2 authority assertions above remain unchanged.
 * Execution against the configured local production server is required for coverage.
 * playwright-utils two-gate mandate is inactive: configured true, package absent.
 * Keep the existing guarded test import and local factories; add no harness/dependency.
 */
const MONTOR_GRANTED_NAV = ["/dashboard", "/jobs", "/scheduling", "/my-day", "/time-reports"];
const SHELL_VIEWPORTS = [
  { name: "desktop", size: { width: 1280, height: 800 } },
  { name: "phone", size: { width: 360, height: 640 } },
] as const;

async function assertNavOrder(nav: Locator, expected: readonly string[], current: string): Promise<void> {
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(expected.length);
  await expect(nav.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href"))))
    .resolves.toEqual(expected);
  const currentPage = nav.locator('a[aria-current="page"]');
  await expect(currentPage).toHaveCount(1);
  await expect(currentPage).toHaveAttribute("href", current);
  // Exact complete href equality also denies extra pending/unbuilt destinations.
  expect(await nav.getByRole("link").evaluateAll(links => links.every(link =>
    link.tagName === "A" && Boolean(link.getAttribute("href")) && link.getAttribute("role") !== "button",
  ))).toBe(true);
}

async function assertShellIdentity(page: Page, email: string): Promise<void> {
  await expect(page.getByTestId("tenant-context")).toBeVisible();
  await expect(page.getByTestId("tenant-context")).toHaveText(fixture.tenantA.name);
  // The phone shell must retain the real server-resolved identity as text.
  await expect(page.getByTestId("current-user")).toBeVisible();
  await expect(page.getByTestId("current-user")).toHaveText(email);
}

async function assertPhoneTarget(control: Locator): Promise<void> {
  await expect(control).toBeVisible();
  const box = await control.boundingBox();
  expect(box).not.toBeNull();
  expect(box!.width).toBeGreaterThanOrEqual(44);
  expect(box!.height).toBeGreaterThanOrEqual(44);
}

async function assertNoHorizontalOverflow(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

/** Masked synthetic-fixture shell evidence; identity and destination content are omitted. */
async function attachShellCapture(page: Page, testInfo: TestInfo, name: string): Promise<void> {
  // All current captures are dashboard shell states. Keep utility popovers closed
  // so no unmasked notification or profile content can enter the exported image.
  await expect(page).toHaveURL(url => url.pathname === "/dashboard");
  await expect(page.getByRole("dialog", { name: "Notiser", exact: true })).toHaveCount(0);
  await expect(page.getByRole("link", { name: "Notisinställningar", exact: true })).toHaveCount(0);
  const capture = await page.screenshot({
    fullPage: false,
    mask: [page.getByTestId("tenant-context"), page.getByTestId("current-user"), page.getByRole("main")],
    maskColor: "#0d0d0f",
  });
  // The existing CI list,json reporter embeds Buffer bytes in general-browser.json.
  // Playwright applies image masks before these bytes leave the browser; actual
  // DOM identity/session assertions remain unchanged and no full-content proof is claimed.
  await testInfo.attach(`masked-synthetic-authenticated-${name}`, { body: capture, contentType: "image/png" });
}

/** Synthetic text-only enlargement of actual rendered sizes, including px tokens. */
async function enlargeRenderedText(container: Locator, factor: number): Promise<void> {
  await container.evaluate((root, scale) => {
    // Snapshot before changing any ancestor so inherited sizes cannot compound.
    const text = [root, ...root.querySelectorAll<HTMLElement>("*")]
      .filter((element): element is HTMLElement => element instanceof HTMLElement
        && [...element.childNodes].some(node => node.nodeType === Node.TEXT_NODE && Boolean(node.textContent?.trim())))
      .map(element => ({ element, size: parseFloat(getComputedStyle(element).fontSize) }));
    for (const { element, size } of text) element.style.fontSize = `${size * scale}px`;
  }, factor);
}

async function renderedFontSize(text: Locator): Promise<number> {
  return text.evaluate(element => parseFloat(getComputedStyle(element).fontSize));
}

test.describe("Story 35.5 authorized responsive shell", () => {
  for (const viewport of SHELL_VIEWPORTS) {
    for (const role of ["saljare", "montor"] as const) {
      test(`[P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded ${role} ${viewport.name} retains supplied order, identity and real utility destinations`, async ({ page }, testInfo) => {
        await page.setViewportSize(viewport.size);
        const credentials = fixture.roleAware[role];
        const landing = role === "montor" ? "/my-day" : "/dashboard";
        const expected = role === "montor" ? MONTOR_GRANTED_NAV : SALJARE_GRANTED_NAV;
        await logIn(page, credentials, landing);
        await assertShellIdentity(page, credentials.email);

        // Existing consumers, ordinary supplied destinations; no invented shell API.
        const bell = page.getByRole("button", { name: /^Notiser(?:,|$)/ });
        await waitForHydrated(bell);
        await bell.click();
        const notifications = page.getByRole("dialog", { name: "Notiser", exact: true });
        await expect(notifications).toBeVisible();
        await expect(notifications.getByRole("link", { name: "Visa alla" })).toHaveAttribute("href", "/notifications");
        if (viewport.name === "phone") {
          // The always-present destination and any actual delivered item links
          // must be touch targets; do not manufacture notifications for this check.
          await assertPhoneTarget(notifications.getByRole("link", { name: "Visa alla", exact: true }));
          for (const itemLink of await notifications.getByRole("list").getByRole("link").all()) {
            await itemLink.scrollIntoViewIfNeeded();
            await assertPhoneTarget(itemLink);
          }
        }
        await notifications.getByRole("link", { name: "Visa alla" }).click();
        await expect(page).toHaveURL(url => url.pathname === "/notifications");
        await expect(page.getByRole("main").getByRole("heading", { name: "Notiser", exact: true })).toBeVisible();

        await page.getByRole("button", { name: "Profil", exact: true }).click();
        const preferences = page.getByRole("link", { name: "Notisinställningar", exact: true });
        await expect(preferences).toHaveAttribute("href", "/settings/notifications");
        const calendar = page.getByRole("link", { name: "Min kalender", exact: true });
        if (role === "montor") await expect(calendar).toHaveAttribute("href", "/settings/calendar");
        else await expect(calendar).toHaveCount(0);
        await preferences.click();
        await expect(page).toHaveURL(url => url.pathname === "/settings/notifications");
        await expect(page.getByRole("heading", { name: "Notisinställningar", exact: true })).toBeVisible();

        await page.goto(landing);
        await assertShellIdentity(page, credentials.email);
        await expect(page.getByRole("main")).toBeVisible();
        if (viewport.name === "phone") {
          const trigger = page.getByRole("button", { name: "Öppna meny", exact: true });
          await waitForHydrated(trigger);
          if (role === "saljare") await attachShellCapture(page, testInfo, "shell-loaded-phone-360x640");
          await trigger.click();
          const drawer = page.getByRole("dialog", { name: "Huvudmeny", exact: true });
          await expect(drawer).toHaveAttribute("aria-modal", "true");
          await assertNavOrder(drawer.getByRole("navigation", { name: "Huvudnavigation" }), expected, landing);
          if (role === "saljare") {
            await attachShellCapture(page, testInfo, "shell-drawer-phone-360x640");
            // Supplemental element crop of the actual opaque drawer: no main records
            // enter its bounds. This detail does not satisfy the full-viewport gate.
            const detail = await drawer.screenshot({
              mask: [drawer.getByTestId("tenant-context"), drawer.getByTestId("current-user")],
              maskColor: "#0d0d0f",
            });
            await testInfo.attach("masked-synthetic-drawer-detail-captured-at-360x640-not-full-viewport", {
              body: detail,
              contentType: "image/png",
            });
          }
          // A real ordinary anchor performs navigation; no router/history shim.
          await drawer.getByRole("link", { name: role === "montor" ? "Dashboard" : "Kunder", exact: true }).click();
          await expect(drawer).toHaveCount(0);
        } else {
          await assertNavOrder(page.getByRole("navigation", { name: "Huvudnavigation" }), expected, landing);
          if (role === "saljare") await attachShellCapture(page, testInfo, "shell-loaded-desktop-1280x800");
          await page.getByRole("navigation", { name: "Huvudnavigation" })
            .getByRole("link", { name: role === "montor" ? "Dashboard" : "Kunder", exact: true }).click();
        }
        const destination = role === "montor" ? "/dashboard" : "/customers";
        await expect(page).toHaveURL(url => url.pathname === destination);
        await assertShellIdentity(page, credentials.email);
        await expect(page.getByRole("main")).toBeVisible();
        // Return to the same menu and verify the new current-page projection.
        if (viewport.name === "phone") {
          await page.getByRole("button", { name: "Öppna meny", exact: true }).click();
          await assertNavOrder(page.getByRole("dialog", { name: "Huvudmeny" }).getByRole("navigation", { name: "Huvudnavigation" }), expected, destination);
        } else await assertNavOrder(page.getByRole("navigation", { name: "Huvudnavigation" }), expected, destination);
      });
    }
  }

  test("[P1] E35-5-T-AC2 E35-5-T-AC4 desktop has 248px sidebar, 56px topbar and 24px content gutters", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await logIn(page, fixture.roleAware.saljare, "/dashboard");
    await assertShellIdentity(page, fixture.roleAware.saljare.email);
    const sidebar = page.getByRole("complementary");
    const header = page.getByRole("banner");
    await expect(sidebar).toBeVisible();
    await expect(header).toBeVisible();
    expect((await sidebar.boundingBox())!.width).toBeCloseTo(248, 0);
    expect((await header.boundingBox())!.height).toBeCloseTo(56, 0);
    await expect(page.getByRole("main")).toHaveCSS("padding-left", "24px");
    await expect(page.getByRole("main")).toHaveCSS("padding-right", "24px");
    await expect(page.getByRole("button", { name: "Öppna meny" })).toBeHidden();
    await assertNoHorizontalOverflow(page);
  });

  test("[P1] E35-5-T-AC2 E35-5-T-AC5 E35-5-T-AC6 E35-5-T-focus-dialog phone drawer traps visible focus, restores trigger, cleans resize scroll and reduces actual motion", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await logIn(page, fixture.roleAware.saljare, "/dashboard");
    const previousOverflow = await page.evaluate(() => document.body.style.overflow);
    const trigger = page.getByRole("button", { name: "Öppna meny", exact: true });
    await waitForHydrated(trigger);
    await trigger.focus();
    await trigger.press("Enter");
    const drawer = page.getByRole("dialog", { name: "Huvudmeny", exact: true });
    const close = drawer.getByRole("button", { name: "Stäng meny", exact: true });
    await expect(drawer).toHaveAttribute("aria-modal", "true");
    await expect(close).toBeFocused();
    expect(await close.evaluate(element => {
      const style = getComputedStyle(element);
      return (style.outlineStyle !== "none" && parseFloat(style.outlineWidth) > 0) || style.boxShadow !== "none";
    })).toBe(true);
    await close.press("Shift+Tab");
    await expect(drawer.getByRole("link").last()).toBeFocused();
    await drawer.getByRole("link").last().press("Tab");
    await expect(close).toBeFocused();
    await close.press("Tab");
    await expect(drawer.getByRole("link").first()).toBeFocused();
    // Inspect actual drawer/descendant motion only, including CSS transitions.
    expect(await drawer.evaluate(panel => [panel, ...panel.querySelectorAll("*")].every(element => {
      const style = getComputedStyle(element);
      return [style.transitionDuration, style.animationDuration].every(value =>
        value.split(",").every(duration => parseFloat(duration) === 0),
      );
    }))).toBe(true);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe("hidden");
    await drawer.press("Escape");
    await expect(drawer).toHaveCount(0);
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
    await trigger.click();
    await close.click();
    await expect(trigger).toBeFocused();
    await expect(drawer).toHaveCount(0);
    await trigger.click();
    await expect(drawer).toBeVisible();
    await page.setViewportSize({ width: 1280, height: 800 });
    await expect(drawer).toHaveCount(0);
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
    // The same control is now intentionally absent from the accessibility tree.
    const hiddenTrigger = page.getByRole("button", { name: "Öppna meny", exact: true, includeHidden: true });
    await expect(hiddenTrigger).toBeHidden();
    await expect(hiddenTrigger).not.toBeFocused();
    await expect(page.getByRole("navigation", { name: "Huvudnavigation" })).toBeVisible();
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(close).toBeFocused();
    await close.click();
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
  });

  test("[P1] E35-5-T-AC4 phone shell reflows enlarged Swedish text and retains reachable 44px owned targets", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await logIn(page, fixture.roleAware.saljare, "/dashboard");
    await waitForHydrated(page.getByRole("button", { name: "Öppna meny", exact: true }));
    for (const textScale of [1, 2]) {
      // Controlled text-only enlargement, including fixed-px tokens. This does not
      // certify native browser zoom or virtual-keyboard behavior.
      const representativeText = [
        page.getByTestId("tenant-context"),
        page.getByTestId("current-user"),
        page.getByRole("button", { name: "Profil", exact: true }),
        page.getByRole("button", { name: "Logga ut", exact: true }),
      ];
      const originalSizes = await Promise.all(representativeText.map(renderedFontSize));
      await enlargeRenderedText(page.getByRole("banner"), textScale);
      for (const [index, text] of representativeText.entries()) {
        expect(await renderedFontSize(text)).toBeCloseTo(originalSizes[index] * textScale, 1);
      }
      await assertShellIdentity(page, fixture.roleAware.saljare.email);
      await assertNoHorizontalOverflow(page);
      if (textScale === 1) {
        await expect(page.getByRole("main")).toHaveCSS("padding-left", "16px");
        await expect(page.getByRole("main")).toHaveCSS("padding-right", "16px");
      }
      for (const control of [
        page.getByRole("button", { name: "Öppna meny", exact: true }),
        page.getByRole("button", { name: /^Notiser(?:,|$)/ }),
        page.getByRole("button", { name: "Profil", exact: true }),
        page.getByRole("button", { name: "Logga ut", exact: true }),
      ]) {
        await control.scrollIntoViewIfNeeded();
        await assertPhoneTarget(control);
        await expect(control).toBeInViewport();
      }
      await page.getByRole("button", { name: "Öppna meny", exact: true }).click();
      const drawer = page.getByRole("dialog", { name: "Huvudmeny", exact: true });
      const customerLabel = drawer.getByRole("link", { name: "Kunder", exact: true }).locator("span");
      const originalDrawerSize = await renderedFontSize(customerLabel);
      await enlargeRenderedText(drawer, textScale);
      expect(await renderedFontSize(customerLabel)).toBeCloseTo(originalDrawerSize * textScale, 1);
      await assertPhoneTarget(drawer.getByRole("button", { name: "Stäng meny", exact: true }));
      for (const link of await drawer.getByRole("link").all()) {
        await link.scrollIntoViewIfNeeded();
        await assertPhoneTarget(link);
        await expect(link).toBeInViewport();
        await expect(link).toHaveAccessibleName(/\S/);
      }
      await drawer.getByRole("link", { name: "Kunder", exact: true }).click();
      await expect(page).toHaveURL(url => url.pathname === "/customers");
      await assertShellIdentity(page, fixture.roleAware.saljare.email);
      await assertNoHorizontalOverflow(page);
    }
    // Labeled overflow of wide destination data is owned by that consumer, not certified here.
  });

  test("[P0] E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-revoked rendered Säljare link cannot override current isolated Montör authority", async ({ page, context }) => {
    // Load the local-only factory for this test; never mutate the run-wide fixture.
    const { createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture } = await import("../../factories/tenants/core");
    const { adminQuery } = await import("../../factories/admin-sql");
    const isolated = await createRoleAwarePhaseAFixture();
    let deniedPage: Page | undefined;
    let fresh: Page | undefined;
    try {
      const user = isolated.users.saljare;
      await page.setViewportSize({ width: 1280, height: 800 });
      await logIn(page, user, "/dashboard");
      await expect(page.getByTestId("tenant-context")).toHaveText(isolated.base.tenantA.name);
      await expect(page.getByTestId("current-user")).toHaveText(user.email);
      const staleLink = page.getByRole("navigation", { name: "Huvudnavigation" }).getByRole("link", { name: "Kunder", exact: true });
      await expect(staleLink).toHaveAttribute("href", "/customers");
      const staleHref = await staleLink.getAttribute("href");
      expect(staleHref).toBe("/customers");
      // Exact existing setRoles fixture semantics (time-reports-atdd.ts:98–102),
      // without importing its unrelated application-command dependency graph.
      // The original call's supplemental default is [], so its insert loop is empty.
      const tenantId = isolated.base.tenantA.id, userId = user.id, primary = "montor", status = "active";
      await adminQuery("update public.tenant_memberships set role=$3,status=$4 where tenant_id=$1 and user_id=$2", [tenantId, userId, primary, status]);
      await adminQuery("delete from public.membership_roles where tenant_id=$1 and membership_id in(select id from public.tenant_memberships where tenant_id=$1 and user_id=$2)", [tenantId, userId]);
      await expect(staleLink).toHaveAttribute("href", staleHref!);
      // Request the exact rendered stale destination as a fresh real document in
      // the same cookie context. This tests current server authority independently
      // of native popup delivery and does not certify same-tab prefetched navigation.
      deniedPage = await context.newPage();
      const deniedResponse = await deniedPage.goto(staleHref!, { waitUntil: "domcontentloaded" });
      expect(deniedResponse?.request().isNavigationRequest()).toBe(true);
      expect(deniedResponse?.request().resourceType()).toBe("document");
      await expect(deniedPage).toHaveURL(url => url.pathname === "/customers");
      await expect(deniedPage.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible();
      await expect(deniedPage.getByRole("alert").filter({ hasText: "Ingen åtkomst" })).toHaveCount(1);
      await expect(deniedPage.getByRole("main").getByRole("table")).toHaveCount(0);
      await expect(deniedPage.getByRole("main").getByRole("textbox")).toHaveCount(0);
      await expect(deniedPage.getByRole("navigation", { name: "Huvudnavigation" }).getByRole("link", { name: "Kunder", exact: true })).toHaveCount(0);

      // Fresh server projection independently keeps identity but removes old grants.
      fresh = await context.newPage();
      await fresh.goto("/my-day", { waitUntil: "domcontentloaded" });
      await expect(fresh).toHaveURL(url => url.pathname === "/my-day");
      await expect(fresh.getByTestId("tenant-context")).toHaveText(isolated.base.tenantA.name);
      await expect(fresh.getByTestId("current-user")).toHaveText(user.email);
      await assertNavOrder(fresh.getByRole("navigation", { name: "Huvudnavigation" }), MONTOR_GRANTED_NAV, "/my-day");
      await expect(fresh.getByRole("main").getByText(/självkostnad|täckningsbidrag|marginal/i)).toHaveCount(0);
    } finally {
      await deniedPage?.close();
      await fresh?.close();
      await cleanupRoleAwarePhaseAFixture(isolated);
    }
  });

  for (const viewport of SHELL_VIEWPORTS) {
    test(`[P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry ${viewport.name} actual sign-out rejection retains server identity and same-command real retry logs out`, async ({ page, context }, testInfo) => {
      await page.setViewportSize(viewport.size);
      // Observe only URL/status of the actual configured browser Auth request.
      // The dashboard runner builds against a local proxy rather than its upstream;
      // both login and sign-out use the existing createSupabaseBrowserClient factory.
      const passwordLogin = page.waitForResponse(response => {
        const url = new URL(response.url());
        return response.request().method() === "POST" && url.pathname === "/auth/v1/token"
          && url.searchParams.get("grant_type") === "password";
      });
      await logIn(page, fixture.roleAware.saljare, "/dashboard");
      await assertShellIdentity(page, fixture.roleAware.saljare.email);
      const originalUrl = page.url();
      const signedIn = await passwordLogin;
      expect(signedIn.status()).toBe(200);
      const auth = new URL(signedIn.url());
      expect(["127.0.0.1", "localhost", "[::1]"]).toContain(auth.hostname);
      expect(["http:", "https:"]).toContain(auth.protocol);
      const isLogoutUrl = (url: URL) => url.origin === auth.origin && url.pathname === "/auth/v1/logout";
      const isLogoutRequest = (request: Request) => request.method() === "POST" && isLogoutUrl(new URL(request.url()));
      const matched: { method: string; origin: string; pathname: string; query: string }[] = [];
      const failBeforeDispatch = async (route: Route) => {
        const request = route.request();
        if (!isLogoutRequest(request)) { await route.continue(); return; }
        const url = new URL(request.url());
        matched.push({ method: request.method(), origin: url.origin, pathname: url.pathname, query: url.search });
        // Definite controlled rejection BEFORE any forwarding; not provider rejection,
        // response loss, a cleared session, or synthetic success. Never 401/403/404.
        await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ code: "unexpected_failure", msg: "Controlled local ATDD rejection" }) });
      };
      // playwright-utils inactive (package absent): network-first native interception.
      await page.route(isLogoutUrl, failBeforeDispatch);
      let confirmation: Page | undefined;
      try {
        const signOut = page.getByRole("button", { name: "Logga ut", exact: true });
        await waitForHydrated(signOut);
        const failure = page.waitForResponse(response => isLogoutRequest(response.request()));
        await signOut.click();
        const rejected = await failure;
        expect(rejected.status()).toBe(500); // Playwright HTTP Response, not APIResponse/toBeOK.
        expect(rejected.headers()["content-type"]).toContain("application/json");
        expect(isLogoutRequest(rejected.request())).toBe(true);
        expect(matched.length).toBeGreaterThan(0);
        const error = page.getByRole("alert").filter({ hasText: "Utloggningen misslyckades. Försök igen." });
        await expect(error).toHaveText("Utloggningen misslyckades. Försök igen.");
        await expect(error).toBeVisible();
        await error.scrollIntoViewIfNeeded();
        await expect(error).toBeInViewport();
        await expect(page).toHaveURL(originalUrl);
        await assertShellIdentity(page, fixture.roleAware.saljare.email);
        await expect(signOut).toBeEnabled();
        await signOut.scrollIntoViewIfNeeded();
        await expect(signOut).toBeInViewport();
        if (viewport.name === "phone") await assertPhoneTarget(signOut);

        // A new real document in the SAME cookie context independently resolves
        // server authority while the failed page stays mounted and visibly failed.
        confirmation = await context.newPage();
        await confirmation.setViewportSize({ width: 1280, height: 800 });
        const confirmed = await confirmation.goto("/dashboard", { waitUntil: "domcontentloaded" });
        expect(confirmed?.status()).toBe(200);
        await expect(confirmation).toHaveURL(url => url.pathname === "/dashboard");
        await assertShellIdentity(confirmation, fixture.roleAware.saljare.email);
        await expect(error).toBeVisible();
        await expect(page).toHaveURL(originalUrl);
        await expect(signOut).toBeEnabled();
        await attachShellCapture(page, testInfo, `shell-controlled-signout-error-${viewport.name}-${viewport.size.width}x${viewport.size.height}`);

        await page.unroute(isLogoutUrl, failBeforeDispatch);
        const realRetry = page.waitForResponse(response => isLogoutRequest(response.request()));
        await signOut.click(); // Explicit SAME command retries against real local Auth.
        const accepted = await realRetry;
        expect(accepted.status()).toBeGreaterThanOrEqual(200);
        expect(accepted.status()).toBeLessThan(300);
        await expect(page).toHaveURL(url => url.pathname === "/login");
        await confirmation.goto("/dashboard", { waitUntil: "domcontentloaded" });
        await expect(confirmation).toHaveURL(url => url.pathname === "/login");
        await expect(confirmation.getByTestId("tenant-context")).toHaveCount(0);
        const retryUrl = new URL(accepted.url());
        // Preserve actual query verbatim without inventing an expected scope query.
        // No headers, request bodies, cookies or credentials are captured.
        await testInfo.attach("local-auth-outcome", { contentType: "application/json", body: JSON.stringify({ controlledFailure: { requests: matched, status: rejected.status() }, realRetry: { method: accepted.request().method(), origin: retryUrl.origin, pathname: retryUrl.pathname, query: retryUrl.search, status: accepted.status() } }) });
      } finally {
        await page.unroute(isLogoutUrl, failBeforeDispatch);
        await confirmation?.close();
      }
      // No response.finished()/RSC EOF, fabricated logout success or client-only
      // session inference. Matcher/installed SDK/runtime remain UNVERIFIED until run.
    });
  }
});

type OwnedShellFixture = Awaited<ReturnType<typeof import("../../factories/tenants/core").createRoleAwarePhaseAFixture>>;
type CaptureViewport = { readonly width: number; readonly height: number };
type OwnedCaptureStage = "fixture" | "context" | "login" | "loaded" | "profile" | "representatives"
  | "bell-empty" | "bell-seed" | "bell-populated" | "bell-error" | "logout-rejection" | "logout-session"
  | "logout-retry" | "login-blank" | "revocation" | "denied" | "reduced-nav" | "context-close"
  | "auth-delete" | "fixture-cleanup" | "publish";
type OwnedCaptureScope = {
  fixture: OwnedShellFixture;
  context: import("@playwright/test").BrowserContext;
  page: Page;
  origin: string;
  stage: (stage: OwnedCaptureStage) => void;
  capture: (page: Page, state: string, viewport?: CaptureViewport) => Promise<void>;
};

async function assertOwnedShellIdentity(page: Page, owned: OwnedShellFixture, email: string): Promise<void> {
  await expect(page.getByTestId("tenant-context")).toBeVisible();
  await expect(page.getByTestId("tenant-context")).toHaveText(owned.base.tenantA.name);
  await expect(page.getByTestId("current-user")).toBeVisible();
  await expect(page.getByTestId("current-user")).toHaveText(email);
}

/**
 * Direct human authorization: root chat01a1970a-d2cd-7d22-a7ec-e322e6be3d2f,
 * userMessage01a19811-3dfd-7551-86cb-42b0bf92208f, independently read via the app.
 * Earlier original-capture requests were rejected; the original15 cases and their
 * masked evidence above stay unchanged. These appended cases own all ten fixture
 * identities and all browser contexts. Original PNGs remain memory-only until
 * strict Auth deletion succeeds. No issued-JWT invalidation claim is made.
 */
async function withRetiredOwnedCaptures(
  browser: import("@playwright/test").Browser,
  testInfo: TestInfo,
  viewport: CaptureViewport,
  expectedFrames: number,
  run: (scope: OwnedCaptureScope) => Promise<void>,
): Promise<void> {
  const frames: { state: string; viewport: CaptureViewport; body: Buffer }[] = [];
  let core: typeof import("../../factories/tenants/core") | undefined;
  let owned: OwnedShellFixture | undefined;
  let context: import("@playwright/test").BrowserContext | undefined;
  let ownedIds: string[] = [];
  let stage: OwnedCaptureStage = "fixture";
  let failed: OwnedCaptureStage | undefined;
  let authDeleted = false, cleanupCompleted = false;
  const publicationDeadline = Date.now() + testInfo.timeout - 5_000;
  try {
    core = await import("../../factories/tenants/core");
    owned = await core.createRoleAwarePhaseAFixture();
    // Exactly base adminA/adminB/orphan plus the seven returned extras; never globals.
    ownedIds = [...new Set([owned.base.adminA.id, owned.base.adminB.id, owned.base.orphanUser.id,
      ...owned.extraUsers.map(user => user.id)])];
    if (ownedIds.length !== 10) throw new Error("Owned fixture identity count");
    stage = "context";
    const app = new URL(testInfo.project.use.baseURL ?? "");
    if (!(["127.0.0.1", "localhost", "[::1]"].includes(app.hostname)
      && ["http:", "https:"].includes(app.protocol))) throw new Error("Local capture origin required");
    context = await browser.newContext({ baseURL: app.origin, viewport, deviceScaleFactor: 1 });
    const page = await context.newPage();
    const ownedContext = context;
    await run({ fixture: owned, context, page, origin: app.origin, stage: next => { stage = next; }, capture: async (target, state, geometry = viewport) => {
      if (target.context() !== ownedContext || new URL(target.url()).origin !== app.origin)
        throw new Error("Owned capture context required");
      const ordinaryGeometry = geometry.width === viewport.width && geometry.height === viewport.height;
      const approvedLoginGeometry = viewport.width === 1280 && viewport.height === 800
        && geometry.width === 1440 && geometry.height === 900 && stage === "login-blank"
        && new URL(target.url()).pathname === "/login";
      if (!ordinaryGeometry && !approvedLoginGeometry) throw new Error("Unapproved capture geometry");
      const body = await target.screenshot({ fullPage: false });
      expect({ width: body.readUInt32BE(16), height: body.readUInt32BE(20) }).toEqual(geometry);
      frames.push({ state, viewport: geometry, body });
    } });
    if (frames.length !== expectedFrames) throw new Error("Owned capture inventory incomplete");
  } catch {
    // No original error/cause, expected email, generated suffix, API body or header
    // may escape. Only the fixed stage vocabulary is reported after cleanup.
    failed = stage;
  } finally {
    if (context) {
      try { await context.close(); } catch { failed ??= "context-close"; }
    }
    if (owned && core) {
      // Existing strict helper checks returned/thrown Auth errors, in redacted mode.
      // Attempt ALL unique owned IDs and inspect every result before publication.
      const deleted = await Promise.allSettled(ownedIds.map(id => core!.deleteAuthUser(id, "redacted")));
      authDeleted = ownedIds.length === 10 && deleted.every(result => result.status === "fulfilled");
      if (!authDeleted) failed ??= "auth-delete";
      try {
        // Paired best-effort tenant cleanup is additional cleanup, never proof of
        // the strict Auth deletion above or a stronger tenant-deletion guarantee.
        await core.cleanupRoleAwarePhaseAFixture(owned);
        cleanupCompleted = true;
      } catch { failed ??= "fixture-cleanup"; }
    }
  }
  if (!authDeleted) failed ??= "auth-delete";
  if (!cleanupCompleted) failed ??= "fixture-cleanup";
  if (testInfo.errors.length > 0 || Date.now() >= publicationDeadline) failed ??= "publish";
  if (failed) {
    for (const frame of frames) frame.body.fill(0);
    frames.length = 0;
    throw new Error(`Owned shell capture withheld [stage=${failed};auth-delete=${authDeleted ? "passed" : "failed"};cleanup=${cleanupCompleted ? "completed" : "incomplete"}]`);
  }
  // The ONLY new attachment site: all assertions, owned-context close, ten strict
  // Auth deletions and paired cleanup completed before any original leaves memory.
  for (const frame of frames) await testInfo.attach(
    `owned-original-${frame.state}-${frame.viewport.width}x${frame.viewport.height}-released-after-auth-delete`,
    { body: frame.body, contentType: "image/png" },
  );
}

test.describe("Story 35.5 owned originals — release only after strict Auth deletion", () => {
  test.describe.configure({ retries: 0 });
  // Inherit the existing file-level OFF privacy options. Re-declaring these
  // worker-scoped options inside a describe is rejected during collection.

  for (const viewport of SHELL_VIEWPORTS) {
    test(`[P1] E35-5-CAP-owned-shell ${viewport.name} real loaded/profile/drawer originals`, async ({ browser }, testInfo) => {
      await withRetiredOwnedCaptures(browser, testInfo, viewport.size, viewport.name === "phone" ? 3 : 2, async scope => {
        const { page, fixture: owned } = scope;
        scope.stage("login");
        await logIn(page, owned.base.adminA, "/dashboard");
        await assertOwnedShellIdentity(page, owned, owned.base.adminA.email);
        scope.stage("loaded");
        await expect(page.locator("#main-content").getByRole("heading", { name: "Dashboard", exact: true, level: 1 })).toBeVisible();
        await expect(page.getByText("Inga offerthändelser under perioden", { exact: true })).toBeVisible();
        await scope.capture(page, "loaded");
        if (viewport.name === "phone") {
          const trigger = page.getByRole("button", { name: "Öppna meny", exact: true });
          await waitForHydrated(trigger);
          await trigger.click();
          const drawer = page.getByRole("dialog", { name: "Huvudmeny", exact: true });
          await expect(drawer).toHaveAttribute("aria-modal", "true");
          await expect(drawer.getByRole("link", { name: "Dokument", exact: true })).toHaveAttribute("href", "/files");
          await expect(drawer.getByRole("button", { name: "Stäng meny", exact: true })).toBeFocused();
          await scope.capture(page, "full-viewport-drawer");
          await drawer.getByRole("button", { name: "Stäng meny", exact: true }).click();
          await expect(trigger).toBeFocused();
        }
        scope.stage("profile");
        const profile = page.getByRole("button", { name: "Profil", exact: true });
        await waitForHydrated(profile);
        await profile.click();
        await expect(profile).toHaveAttribute("aria-expanded", "true");
        await expect(page.getByRole("link", { name: "Notisinställningar", exact: true })).toHaveAttribute("href", "/settings/notifications");
        await expect(page.getByRole("link", { name: "Min kalender", exact: true })).toHaveAttribute("href", "/settings/calendar");
        await scope.capture(page, "profile-open");
      });
    });

    test(`[P1] E35-5-CAP-owned-record-context ${viewport.name} actual empty customers/files/jobs`, async ({ browser }, testInfo) => {
      await withRetiredOwnedCaptures(browser, testInfo, viewport.size, 3, async scope => {
        const { page, fixture: owned } = scope;
        scope.stage("login");
        await logIn(page, owned.base.adminA, "/dashboard");
        scope.stage("representatives");
        for (const destination of [
          { href: "/customers", heading: "Kunder", marker: "customers-empty", state: "customers-real-empty" },
          { href: "/files", heading: "Dokument", marker: "file-index-empty", state: "files-real-empty" },
          { href: "/jobs", heading: "Jobb/Order", marker: "job-list-empty", state: "jobs-real-empty" },
        ]) {
          await page.goto(destination.href, { waitUntil: "domcontentloaded" });
          await expect(page).toHaveURL(url => url.pathname === destination.href);
          await assertOwnedShellIdentity(page, owned, owned.base.adminA.email);
          await expect(page.locator("#main-content").getByRole("heading", { name: destination.heading, exact: true, level: 1 })).toBeVisible();
          await expect(page.getByTestId(destination.marker)).toBeVisible();
          await scope.capture(page, destination.state);
        }
      });
    });

    test(`[P1] E35-5-CAP-owned-connected-context ${viewport.name} actual scheduling/my-day/preferences`, async ({ browser }, testInfo) => {
      await withRetiredOwnedCaptures(browser, testInfo, viewport.size, 3, async scope => {
        const { page, fixture: owned } = scope;
        scope.stage("login");
        await logIn(page, owned.base.adminA, "/dashboard");
        scope.stage("representatives");
        for (const destination of [
          { href: "/scheduling", heading: "Planering", empty: "Inga bokningar matchar perioden och filtren.", state: "scheduling-real-empty" },
          { href: "/my-day", heading: "Min dag", empty: "inga bokningar ännu", state: "my-day-real-empty" },
          { href: "/settings/notifications", heading: "Notisinställningar", empty: null, state: "notification-preferences-real-defaults" },
        ]) {
          const preferencesRead = destination.href === "/settings/notifications" ? page.waitForResponse(response =>
            response.request().method() === "GET" && new URL(response.url()).origin === scope.origin
            && new URL(response.url()).pathname === "/api/notifications/preferences") : undefined;
          await page.goto(destination.href, { waitUntil: "domcontentloaded" });
          if (preferencesRead) expect((await preferencesRead).status()).toBe(200);
          await expect(page).toHaveURL(url => url.pathname === destination.href);
          await assertOwnedShellIdentity(page, owned, owned.base.adminA.email);
          const main = page.locator("#main-content");
          await expect(main.getByRole("heading", { name: destination.heading, exact: true, level: 1 })).toBeVisible();
          if (destination.empty) await expect(main.getByText(destination.empty, { exact: true })).toBeVisible();
          else await expect(main.getByRole("group", { name: "Notiskategorier", exact: true })).toBeVisible();
          await expect(main.getByRole("alert")).toHaveCount(0);
          await scope.capture(page, destination.state);
        }
      });
    });

    test(`[P1] E35-5-CAP-owned-bell ${viewport.name} actual empty/populated and controlled local failure`, async ({ browser }, testInfo) => {
      await withRetiredOwnedCaptures(browser, testInfo, viewport.size, 3, async scope => {
        const { page, fixture: owned } = scope;
        const isRead = (request: Request) => request.method() === "GET"
          && new URL(request.url()).origin === scope.origin && new URL(request.url()).pathname === "/api/notifications";
        scope.stage("login");
        const initialRead = page.waitForResponse(response => isRead(response.request()));
        await logIn(page, owned.base.adminA, "/dashboard");
        expect((await initialRead).status()).toBe(200);
        await assertOwnedShellIdentity(page, owned, owned.base.adminA.email);
        const bell = page.getByRole("button", { name: /^Notiser(?:,|$)/ });
        scope.stage("bell-empty");
        await waitForHydrated(bell);
        await bell.click();
        const panel = page.getByRole("dialog", { name: "Notiser", exact: true });
        await expect(panel.getByText("Inga olästa notiser", { exact: true })).toBeVisible();
        await expect(panel.getByRole("list").getByRole("link")).toHaveCount(0);
        await expect(panel.getByRole("alert")).toHaveCount(0);
        await scope.capture(page, "bell-real-empty");
        await bell.click();
        scope.stage("bell-seed");
        const { admin } = await import("../../factories/tenants/core");
        const { adminInsertCustomer } = await import("../../factories/tenants/crm");
        const { adminInsertQuote } = await import("../../factories/tenants/quotes");
        const customerId = await adminInsertCustomer({ tenant_id: owned.base.tenantA.id, customer_type: "company", display_name: "Syntetisk bildgranskningskund" });
        const quoteId = await adminInsertQuote({ tenant_id: owned.base.tenantA.id, customer_id: customerId });
        const title = "Syntetisk offertuppföljning för bildgranskning";
        // Approved global-setup.ts:996–1010 personal-row columns/category/current
        // UTC date meaning, now bound to a real owned quote instead of a dangling ID.
        const { error } = await admin().from("notifications").insert({
          tenant_id: owned.base.tenantA.id, recipient_user_id: owned.base.adminA.id,
          category: "quote.follow_up_due", title, body: "Syntetisk uppföljning för dagens bildgranskning.",
          route: `/quotes/${quoteId}`, logical_subject_id: quoteId, logical_period: new Date().toISOString().slice(0, 10),
        });
        if (error) throw new Error("Owned notification seed refused");
        scope.stage("bell-populated");
        const populatedRead = page.waitForResponse(response => isRead(response.request()));
        await page.reload({ waitUntil: "domcontentloaded" });
        expect((await populatedRead).status()).toBe(200);
        await waitForHydrated(bell);
        await bell.click();
        await expect(panel.getByRole("link", { name: title, exact: true })).toHaveAttribute("href", `/quotes/${quoteId}`);
        await expect(panel.getByRole("list").getByRole("link")).toHaveCount(1);
        await expect(panel.getByRole("alert")).toHaveCount(0);
        await scope.capture(page, "bell-real-populated-synthetic-own-quote");
        scope.stage("bell-error");
        const isReadUrl = (url: URL) => url.origin === scope.origin && url.pathname === "/api/notifications";
        const rejectRead = async (route: Route) => {
          if (!isRead(route.request())) { await route.continue(); return; }
          await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ error: "Controlled owned local read failure" }) });
        };
        await page.route(isReadUrl, rejectRead);
        const rejectedRead = page.waitForResponse(response => isRead(response.request()));
        await page.reload({ waitUntil: "domcontentloaded" });
        expect((await rejectedRead).status()).toBe(500);
        await waitForHydrated(bell);
        await bell.click();
        await expect(panel.getByRole("alert")).toHaveText("Notiser kunde inte hämtas. Försök igen.");
        await scope.capture(page, "bell-controlled-local-read-error");
        await page.unroute(isReadUrl, rejectRead);
      });
    });

    test(`[P1] E35-5-CAP-owned-signout ${viewport.name} actual failure/session proof/real retry/blank login`, async ({ browser }, testInfo) => {
      await withRetiredOwnedCaptures(browser, testInfo, viewport.size, 2, async scope => {
        const { page, context, fixture: owned } = scope;
        const user = owned.users.saljare;
        scope.stage("login");
        const signedIn = page.waitForResponse(response => response.request().method() === "POST"
          && new URL(response.url()).pathname === "/auth/v1/token"
          && new URL(response.url()).searchParams.get("grant_type") === "password");
        await logIn(page, user, "/dashboard");
        await assertOwnedShellIdentity(page, owned, user.email);
        const loginResponse = await signedIn;
        expect(loginResponse.status()).toBe(200);
        const auth = new URL(loginResponse.url());
        expect(["127.0.0.1", "localhost", "[::1]"]).toContain(auth.hostname);
        expect(["http:", "https:"]).toContain(auth.protocol);
        const originalUrl = page.url();
        const isLogoutUrl = (url: URL) => url.origin === auth.origin && url.pathname === "/auth/v1/logout";
        const isLogout = (request: Request) => request.method() === "POST" && isLogoutUrl(new URL(request.url()));
        const reject = async (route: Route) => {
          if (!isLogout(route.request())) { await route.continue(); return; }
          await route.fulfill({ status: 500, contentType: "application/json", body: JSON.stringify({ code: "unexpected_failure", msg: "Controlled owned local rejection" }) });
        };
        scope.stage("logout-rejection");
        await page.route(isLogoutUrl, reject);
        const command = page.getByRole("button", { name: "Logga ut", exact: true });
        await waitForHydrated(command);
        const rejection = page.waitForResponse(response => isLogout(response.request()));
        await command.click();
        const rejected = await rejection;
        expect(rejected.status()).toBe(500);
        const alert = page.getByRole("alert").filter({ hasText: "Utloggningen misslyckades. Försök igen." });
        await expect(alert).toHaveText("Utloggningen misslyckades. Försök igen.");
        await expect(alert).toBeVisible();
        await expect(page).toHaveURL(originalUrl);
        await assertOwnedShellIdentity(page, owned, user.email);
        await expect(command).toBeEnabled();
        scope.stage("logout-session");
        const confirmation = await context.newPage();
        const confirmed = await confirmation.goto("/dashboard", { waitUntil: "domcontentloaded" });
        expect(confirmed?.status()).toBe(200);
        await expect(confirmation).toHaveURL(url => url.pathname === "/dashboard");
        await assertOwnedShellIdentity(confirmation, owned, user.email);
        await expect(alert).toBeVisible();
        await expect(command).toBeEnabled();
        await scope.capture(page, "signout-controlled-error-server-session-confirmed");
        scope.stage("logout-retry");
        await page.unroute(isLogoutUrl, reject);
        const retry = page.waitForResponse(response => isLogout(response.request()));
        await command.click();
        const accepted = await retry;
        expect(accepted.status()).toBeGreaterThanOrEqual(200);
        expect(accepted.status()).toBeLessThan(300);
        expect(new URL(accepted.url()).search).toBe(new URL(rejected.url()).search);
        await expect(page).toHaveURL(url => url.pathname === "/login");
        await confirmation.goto("/dashboard", { waitUntil: "domcontentloaded" });
        await expect(confirmation).toHaveURL(url => url.pathname === "/login");
        scope.stage("login-blank");
        await expect(page.getByTestId("tenant-context")).toHaveCount(0);
        await expect(page.getByLabel("E-post")).toHaveValue("");
        await expect(page.getByLabel("Lösenord")).toHaveValue("");
        await expect(page.getByRole("button", { name: "Logga in", exact: true })).toBeVisible();
        const loginViewport = viewport.name === "desktop" ? { width: 1440, height: 900 } : viewport.size;
        await page.setViewportSize(loginViewport);
        await scope.capture(page, "signed-out-server-confirmed-blank-login", loginViewport);
      });
    });

    test(`[P0] E35-5-CAP-owned-revoked ${viewport.name} actual revoked denial and current reduced navigation`, async ({ browser }, testInfo) => {
      await withRetiredOwnedCaptures(browser, testInfo, viewport.size, 2, async scope => {
        const { page, context, fixture: owned } = scope;
        const user = owned.users.saljare;
        scope.stage("login");
        await logIn(page, user, "/dashboard");
        await assertOwnedShellIdentity(page, owned, user.email);
        let sourceNavigation = page.getByRole("navigation", { name: "Huvudnavigation", exact: true });
        if (viewport.name === "phone") {
          const trigger = page.getByRole("button", { name: "Öppna meny", exact: true });
          await waitForHydrated(trigger);
          await trigger.click();
          sourceNavigation = page.getByRole("dialog", { name: "Huvudmeny", exact: true }).getByRole("navigation", { name: "Huvudnavigation", exact: true });
        }
        const staleLink = sourceNavigation.getByRole("link", { name: "Kunder", exact: true });
        await expect(staleLink).toHaveAttribute("href", "/customers");
        const staleHref = await staleLink.getAttribute("href");
        expect(staleHref).toBe("/customers");
        scope.stage("revocation");
        const { adminQuery } = await import("../../factories/admin-sql");
        // Exact already-approved setRoles statements/inputs; no new query semantics.
        const tenantId = owned.base.tenantA.id, userId = user.id, primary = "montor", status = "active";
        await adminQuery("update public.tenant_memberships set role=$3,status=$4 where tenant_id=$1 and user_id=$2", [tenantId, userId, primary, status]);
        await adminQuery("delete from public.membership_roles where tenant_id=$1 and membership_id in(select id from public.tenant_memberships where tenant_id=$1 and user_id=$2)", [tenantId, userId]);
        await expect(staleLink).toHaveAttribute("href", staleHref!);
        scope.stage("denied");
        const denied = await context.newPage();
        const response = await denied.goto(staleHref!, { waitUntil: "domcontentloaded" });
        expect(response?.request().isNavigationRequest()).toBe(true);
        expect(response?.request().resourceType()).toBe("document");
        await expect(denied).toHaveURL(url => url.pathname === "/customers");
        await assertOwnedShellIdentity(denied, owned, user.email);
        await expect(denied.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible();
        await expect(denied.getByRole("alert").filter({ hasText: "Ingen åtkomst" })).toHaveCount(1);
        await expect(denied.locator("#main-content").getByRole("table")).toHaveCount(0);
        await expect(denied.locator("#main-content").getByRole("textbox")).toHaveCount(0);
        await expect(denied.getByRole("navigation", { name: "Huvudnavigation" }).getByRole("link", { name: "Kunder", exact: true })).toHaveCount(0);
        await scope.capture(denied, "actual-revoked-generic-denial");
        scope.stage("reduced-nav");
        const fresh = await context.newPage();
        await fresh.goto("/my-day", { waitUntil: "domcontentloaded" });
        await expect(fresh).toHaveURL(url => url.pathname === "/my-day");
        await assertOwnedShellIdentity(fresh, owned, user.email);
        await expect(fresh.locator("#main-content").getByText(/självkostnad|täckningsbidrag|marginal/i)).toHaveCount(0);
        if (viewport.name === "phone") {
          const trigger = fresh.getByRole("button", { name: "Öppna meny", exact: true });
          await waitForHydrated(trigger);
          await trigger.click();
          await assertNavOrder(fresh.getByRole("dialog", { name: "Huvudmeny", exact: true }).getByRole("navigation", { name: "Huvudnavigation" }), MONTOR_GRANTED_NAV, "/my-day");
        } else await assertNavOrder(fresh.getByRole("navigation", { name: "Huvudnavigation" }), MONTOR_GRANTED_NAV, "/my-day");
        await scope.capture(fresh, "actual-revoked-current-reduced-navigation");
      });
    });
  }
});
