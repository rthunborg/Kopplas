/** Story 11.2 browser ATDD against the real server-derived navigation and local role fixture. */
import { expect, test } from "../dashboard/guarded-test";
import type { Locator, Page, Request, Route } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { LOCAL_SUPABASE_URL } from "../../support/test-env";

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
 * Story 35.5 RED scaffolds. Source-derived selectors only; no browser validation yet.
 * Implementation author: activate these skips for this task, earn actual evidence,
 * and retain the original five Story 11.2 assertions above unchanged.
 * playwright-utils two-gate mandate is inactive: configured true, package absent.
 * Keep the existing guarded test import and local factories; add no harness/dependency.
 */
const MONTOR_GRANTED_NAV = ["/dashboard", "/jobs", "/scheduling", "/my-day", "/time-reports"];
const SHELL_VIEWPORTS = [
  { name: "desktop", size: { width: 1280, height: 800 } },
  { name: "phone", size: { width: 360, height: 640 } },
] as const;
const RED = {
  annotation: [{
    type: "atdd-red",
    description: "Unexecuted source-bound RED scaffold; activate in Story 35.5 implementation and verify against the real local production server.",
  }],
};

async function assertNavOrder(nav: Locator, expected: readonly string[], current: string): Promise<void> {
  await expect(nav).toBeVisible();
  await expect(nav.getByRole("link")).toHaveCount(expected.length);
  await expect(nav.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href"))))
    .resolves.toEqual(expected);
  await expect(nav.getByRole("link", { current: "page" })).toHaveCount(1);
  await expect(nav.getByRole("link", { current: "page" })).toHaveAttribute("href", current);
  // Exact complete href equality also denies extra pending/unbuilt destinations.
  expect(await nav.getByRole("link").evaluateAll(links => links.every(link =>
    link.tagName === "A" && Boolean(link.getAttribute("href")) && link.getAttribute("role") !== "button",
  ))).toBe(true);
}

async function assertShellIdentity(page: Page, email: string): Promise<void> {
  await expect(page.getByTestId("tenant-context")).toBeVisible();
  await expect(page.getByTestId("tenant-context")).toHaveText(fixture.tenantA.name);
  // The existing phone design hides this secondary line; exact text is still checked.
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

test.describe("Story 35.5 authorized responsive shell — RED", () => {
  for (const viewport of SHELL_VIEWPORTS) {
    for (const role of ["saljare", "montor"] as const) {
      test.skip(`[P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded ${role} ${viewport.name} retains supplied order, identity and real utility destinations`, RED, async ({ page }) => {
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
        if (viewport.name === "phone") {
          const trigger = page.getByRole("button", { name: "Öppna meny", exact: true });
          await waitForHydrated(trigger);
          await trigger.click();
          const drawer = page.getByRole("dialog", { name: "Huvudmeny", exact: true });
          await expect(drawer).toHaveAttribute("aria-modal", "true");
          await assertNavOrder(drawer.getByRole("navigation", { name: "Huvudnavigation" }), expected, landing);
          // A real ordinary anchor performs navigation; no router/history shim.
          await drawer.getByRole("link", { name: role === "montor" ? "Dashboard" : "Kunder", exact: true }).click();
          await expect(drawer).toHaveCount(0);
        } else {
          await assertNavOrder(page.getByRole("navigation", { name: "Huvudnavigation" }), expected, landing);
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

  test.skip("[P1] E35-5-T-AC2 E35-5-T-AC4 desktop has 248px sidebar, 56px topbar and 24px content gutters", RED, async ({ page }) => {
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

  test.skip("[P1] E35-5-T-AC2 E35-5-T-AC5 E35-5-T-AC6 E35-5-T-focus-dialog phone drawer traps visible focus, restores trigger, cleans resize scroll and reduces actual motion", RED, async ({ page }) => {
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
    await expect(trigger).not.toBeFocused();
    await expect(page.getByRole("navigation", { name: "Huvudnavigation" })).toBeVisible();
    await page.setViewportSize({ width: 360, height: 640 });
    await expect(trigger).toHaveAttribute("aria-expanded", "false");
    await trigger.click();
    await expect(close).toBeFocused();
    await close.click();
    await expect(trigger).toBeFocused();
    await expect.poll(() => page.evaluate(() => document.body.style.overflow)).toBe(previousOverflow);
  });

  test.skip("[P1] E35-5-T-AC4 phone shell reflows enlarged Swedish text and retains reachable 44px owned targets", RED, async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await logIn(page, fixture.roleAware.saljare, "/dashboard");
    await waitForHydrated(page.getByRole("button", { name: "Öppna meny", exact: true }));
    for (const textSize of ["100%", "200%"]) {
      // Controlled root text enlargement; not native browser zoom or an OS keyboard claim.
      await page.evaluate(size => { document.documentElement.style.fontSize = size; }, textSize);
      await assertShellIdentity(page, fixture.roleAware.saljare.email);
      await assertNoHorizontalOverflow(page);
      if (textSize === "100%") {
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

  test.skip("[P0] E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-revoked rendered Säljare link cannot override current isolated Montör authority", RED, async ({ page, context }) => {
    // Dynamic imports avoid introducing factory/service work into skipped collection.
    const { createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture } = await import("../../factories/tenants/core");
    const { setRoles } = await import("../../support/time-reports-atdd");
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
      await setRoles(isolated.base.tenantA.id, user.id, "montor");
      // Native modified anchor opens a fresh server request, avoiding prefetched RSC
      // becoming false authority evidence. No synthetic denial or shared user mutation.
      const opened = page.waitForEvent("popup");
      await staleLink.click({ modifiers: ["ControlOrMeta"] });
      deniedPage = await opened;
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
    test.skip(`[P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry ${viewport.name} actual sign-out rejection retains server identity and same-command real retry logs out`, RED, async ({ page, context }, testInfo) => {
      await page.setViewportSize(viewport.size);
      await logIn(page, fixture.roleAware.saljare, "/dashboard");
      await assertShellIdentity(page, fixture.roleAware.saljare.email);
      const originalUrl = page.url();
      const auth = new URL(LOCAL_SUPABASE_URL);
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
