/**
 * Story 13.2 browser acceptance coverage.
 *
 * The assertions drive the authenticated production-mode app against per-recipient
 * local fixture rows. Database authority and raw-write negatives belong to the
 * integration/RLS suite.
 */
import { expect, test, type Locator, type Page } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";

type Credentials = { readonly email: string; readonly password: string };
type NotificationFixture = {
  readonly notifications: {
    readonly administrator: Credentials;
    readonly projectManager: Credentials;
    readonly salesperson: Credentials;
    readonly installer: Credentials;
    readonly finance: Credentials;
    readonly empty: Credentials;
    readonly storedRoute: string;
  };
};
type NotificationRole = keyof Omit<NotificationFixture["notifications"], "storedRoute">;

const FIXTURE_PATH = path.join(process.cwd(), "tests", "e2e", ".auth", "fixture.json");

let cachedFixture: NotificationFixture | undefined;

function fixture(): NotificationFixture {
  cachedFixture ??= JSON.parse(readFileSync(FIXTURE_PATH, "utf8")) as NotificationFixture;
  return cachedFixture;
}

async function waitForHydrated(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate(
    (element) =>
      new Promise<void>((resolve) => {
        const tick = () =>
          Object.keys(element).some((key) => key.startsWith("__react"))
            ? resolve()
            : requestAnimationFrame(tick);
        tick();
      }),
  );
}

async function signIn(page: Page, credentials: Credentials, landing: "/dashboard" | "/my-day" = "/dashboard"): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in" });
  await waitForHydrated(submit);
  await page.getByLabel("E-post").fill(credentials.email);
  await page.getByLabel("Lösenord").fill(credentials.password);
  await submit.click();
  await expect(page).toHaveURL(landing);
}

async function openBell(page: Page): Promise<Locator> {
  const bell = page.getByRole("button", { name: /notiser/i });
  await expect(bell).toBeVisible();
  await bell.click();
  const popover = page.getByRole("dialog", { name: /notiser/i });
  await expect(popover).toBeVisible();
  return popover;
}

test.describe("Story 13.2 In-app-notiser — bell, center och inställningar (ATDD RED)", () => {
  const validRoles: ReadonlyArray<readonly [string, NotificationRole]> = [
    ["Företagsadmin", "administrator"],
    ["Projektledare", "projectManager"],
    ["Säljare", "salesperson"],
    ["Montör", "installer"],
    ["Ekonomi", "finance"],
  ];

  for (const [roleName, role] of validRoles) {
    test(`[P0] ${roleName} sees the personal bell with a capped 9+ unread count`, async ({ page }) => {
      await signIn(page, fixture().notifications[role], role === "installer" ? "/my-day" : "/dashboard");
      const bell = page.getByRole("button", { name: /notiser.*9\+/i });
      await expect(bell).toBeVisible();
      await expect(bell).toHaveAccessibleName(/9\+.*olästa notiser/i);
      await expect(page.getByRole("navigation", { name: "Huvudnavigation" }).getByRole("link", { name: /notiser/i })).toHaveCount(0);
    });
  }

  test("[P0] Bell popover lists the latest personal notifications and opens the personal center", async ({ page }) => {
    await signIn(page, fixture().notifications.administrator);
    const popover = await openBell(page);
    await expect(popover.getByRole("list").getByRole("listitem")).toHaveCount(10);
    await expect(popover.getByRole("button", { name: "Markera alla som lästa" })).toBeVisible();
    await popover.getByRole("link", { name: "Visa alla" }).click();
    await expect(page).toHaveURL(/\/notifications$/);
    await expect(page.getByRole("heading", { name: "Notiser" })).toBeVisible();
  });

  test("[P0] A stored notification link marks the item read and opens its entitled destination", async ({ page }) => {
    const data = fixture().notifications;
    await signIn(page, data.administrator);
    const popover = await openBell(page);
    const notification = popover.getByRole("listitem").filter({ hasText: /uppföljning/i }).first();
    await notification.getByRole("link").click();
    await expect(page).toHaveURL(new RegExp(`${data.storedRoute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}$`));
    await page.goBack();
    await expect(page.getByRole("button", { name: /notiser.*olästa notiser/i })).not.toHaveAccessibleName(/9\+.*olästa notiser/i);
  });

  test("[P0] Notification center applies module/category, read-state, and date filters together", async ({ page }) => {
    await signIn(page, fixture().notifications.projectManager);
    await page.goto("/notifications");
    await page.getByLabel("Modul eller kategori").selectOption("quotes");
    await page.getByLabel("Lässtatus").selectOption("unread");
    await page.getByLabel("Från datum").fill("2026-09-01");
    const rows = page.getByRole("main").getByRole("listitem");
    await expect(rows.first()).toContainText(/uppföljning/i);
    await expect(rows).toHaveCount(10);
    for (let index = 0; index < 10; index += 1) {
      await expect(rows.nth(index)).toHaveAccessibleName("oläst");
    }
  });

  test("[P1] Marking one notification as read updates the bell and row state", async ({ page }) => {
    await signIn(page, fixture().notifications.salesperson);
    await page.goto("/notifications");
    const row = page.getByRole("listitem").filter({ hasText: /uppföljning/i }).first();
    await expect(row).toHaveAccessibleName("oläst");
    await row.getByRole("button", { name: "Markera som läst" }).click();
    await expect(row).toHaveAccessibleName("läst");
    await expect(page.getByRole("button", { name: /notiser/i })).toHaveAccessibleName(/olästa notiser/i);
  });

  test("[P1] Mark all read updates the popover and persists after reload", async ({ page }) => {
    await signIn(page, fixture().notifications.finance);
    const popover = await openBell(page);
    await popover.getByRole("button", { name: "Markera alla som lästa" }).click();
    await expect(popover.getByText("Inga olästa notiser")).toBeVisible();
    await page.reload();
    await expect(page.getByRole("button", { name: /notiser/i })).not.toHaveAccessibleName(/olästa notiser/i);
  });

  test("[P1] Failed optimistic mark-read restores persisted state and offers recovery after reload", async ({ page }) => {
    await signIn(page, fixture().notifications.administrator);
    await page.goto("/notifications");
    // Intentional fault injection: it must exercise rollback, never manufacture a successful UI response.
    await page.route("**/api/notifications/*/read", (route) => route.fulfill({ status: 500, body: "{}" }));
    const row = page.getByRole("listitem", { name: "oläst", exact: true }).filter({ hasText: /uppföljning/i }).first();
    await row.getByRole("button", { name: "Markera som läst" }).click();
    await expect(page.getByRole("alert").filter({ hasText: /kunde inte markera.*försök igen/i })).toBeVisible();
    await expect(row).toHaveAccessibleName(/oläst/i);
    await page.unroute("**/api/notifications/*/read");
    await page.reload();
    await expect(row).toHaveAccessibleName(/oläst/i);
  });

  test("[P0] Bell restores the known persisted unread state when one acknowledgement and reconciliation both fail", async ({ page }) => {
    await signIn(page, fixture().notifications.administrator);
    const popover = await openBell(page);
    await page.route("**/api/notifications/*/read", (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.route("**/api/notifications", (route) => route.fulfill({ status: 500, body: "{}" }));
    const notification = popover.getByRole("listitem", { name: "oläst", exact: true }).first();
    await notification.getByRole("link").click();
    await expect(popover.getByRole("alert")).toContainText(/kunde inte markera.*försök igen/i);
    await expect(notification).toHaveAccessibleName("oläst");
    await expect(page.getByRole("button", { name: /notiser/i })).toHaveAccessibleName(/olästa notiser/i);
  });

  test("[P0] Bell restores known persisted state when mark-all and reconciliation both fail", async ({ page }) => {
    // Finance consumed its shared unread fixture in the successful mark-all proof above.
    // Project manager has not mutated notifications in this file, so this test starts
    // from a known enabled mark-all control before injecting either failure.
    await signIn(page, fixture().notifications.projectManager);
    const popover = await openBell(page);
    const markAll = popover.getByRole("button", { name: "Markera alla som lästa" });
    await expect(markAll).toBeEnabled();
    await page.route("**/api/notifications/read-all", (route) => route.fulfill({ status: 500, body: "{}" }));
    await page.route("**/api/notifications", (route) => route.fulfill({ status: 500, body: "{}" }));
    await markAll.click();
    await expect(popover.getByRole("alert")).toContainText(/kunde inte markera.*försök igen/i);
    await expect(popover.getByRole("listitem", { name: "oläst", exact: true }).first()).toBeVisible();
    await expect(page.getByRole("button", { name: /notiser/i })).toHaveAccessibleName(/olästa notiser/i);
  });

  test("[P0] Profile preferences group the active category by module", async ({ page }, testInfo) => {
    await signIn(page, fixture().notifications.projectManager);
    await page.getByRole("button", { name: /profil/i }).click();
    const initialPreferencesResponse = page.waitForResponse((response) => new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "GET");
    await page.getByRole("link", { name: "Notisinställningar" }).click();
    const initialPreferences = await initialPreferencesResponse;
    expect(initialPreferences.status()).toBe(200);
    const initialPreferenceRows = (await initialPreferences.json()).preferences as { category: string; channel: string; enabled: boolean }[];
    await expect(page.getByRole("heading", { name: "Notisinställningar" })).toBeVisible();
    const quotesGroup = page.getByRole("group", { name: /offerter/i });
    await expect(quotesGroup.getByRole("rowheader", { name: /viktig uppföljning av offert/i })).toBeVisible();
    await expect(quotesGroup.getByRole("switch", { name: "Viktig uppföljning av offert i appen", exact: true })).toBeDisabled();
    const schedulingGroup = page.getByRole("group", { name: "Scheduling, Time Reporting & Calendar Feeds", exact: true });
    await expect(schedulingGroup.getByRole("rowheader", { name: "Ändringar i planeringen", exact: true })).toBeVisible();
    await expect(schedulingGroup.getByRole("rowheader", { name: "Påminnelse om tidrapport", exact: true })).toBeVisible();
    await expect(quotesGroup.getByRole("rowheader", { name: "Ändringar i planeringen", exact: true })).toHaveCount(0);
    await expect(quotesGroup.getByRole("rowheader", { name: "Påminnelse om tidrapport", exact: true })).toHaveCount(0);
    await expect(schedulingGroup.getByRole("rowheader", { name: /viktig uppföljning av offert/i })).toHaveCount(0);
    const bookingPreference = schedulingGroup.getByRole("switch", { name: "Ändringar i planeringen i appen", exact: true });
    const originalEnabled = initialPreferenceRows.find((preference) => preference.category === "booking.changed" && preference.channel === "in_app")?.enabled ?? true;
    await expect(bookingPreference).toBeChecked({ checked: originalEnabled });
    const [saveResponse] = await Promise.all([
      page.waitForResponse((response) => new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "PUT"),
      bookingPreference.click(),
    ]);
    expect(saveResponse.request().postDataJSON()).toEqual({ category: "booking.changed", channel: "in_app", enabled: !originalEnabled });
    expect(saveResponse.status()).toBe(200);
    expect(await saveResponse.json()).toEqual({ ok: true });
    await expect(bookingPreference).toBeEnabled();
    const [reloadResponse] = await Promise.all([
      page.waitForResponse((response) => new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "GET"),
      page.reload(),
    ]);
    expect(reloadResponse.status()).toBe(200);
    expect((await reloadResponse.json()).preferences).toContainEqual({ category: "booking.changed", channel: "in_app", enabled: !originalEnabled });
    await expect(bookingPreference).toBeChecked({ checked: !originalEnabled });
    const [restoreResponse, restoredPreferences] = await Promise.all([
      page.waitForResponse((response) => new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "PUT"),
      page.waitForResponse((response) => new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "GET"),
      bookingPreference.click(),
    ]);
    expect(restoreResponse.request().postDataJSON()).toEqual({ category: "booking.changed", channel: "in_app", enabled: originalEnabled });
    expect(restoreResponse.status()).toBe(200);
    expect(await restoreResponse.json()).toEqual({ ok: true });
    expect(restoredPreferences.status()).toBe(200);
    expect((await restoredPreferences.json()).preferences).toContainEqual({ category: "booking.changed", channel: "in_app", enabled: originalEnabled });
    await expect(bookingPreference).toBeChecked({ checked: originalEnabled });
    await expect(bookingPreference).toBeEnabled();
    const originalViewport = page.viewportSize();
    expect(originalViewport).not.toBeNull();
    const ownOrigin = new URL(page.url()).origin;
    const routeMatcher = (url: URL) => url.origin === ownOrigin && url.pathname === "/api/notifications/preferences";
    let releaseHeld!: () => void;
    const held = new Promise<void>((resolve) => { releaseHeld = resolve; });
    let markStarted!: () => void;
    const started = new Promise<void>((resolve) => { markStarted = resolve; });
    let intercepted = false;
    let heldRouteTask: Promise<void> | undefined;
    const controlledHandler = (route: import("@playwright/test").Route) => {
      const request = route.request();
      if (request.method() !== "PUT" || intercepted) return route.fallback();
      const input = request.postDataJSON();
      if (!input || Object.keys(input).length !== 3 || input.category !== "booking.changed" || input.channel !== "in_app" || input.enabled !== !originalEnabled) return route.fallback();
      intercepted = true;
      markStarted();
      heldRouteTask = (async () => {
        await held;
        await route.fulfill({ status: 503, contentType: "application/json", body: JSON.stringify({ error: "Controlled test PUT rejection" }) });
      })();
      void heldRouteTask.catch(() => {});
      return heldRouteTask;
    };
    await page.route(routeMatcher, controlledHandler);
    let primaryFailure: unknown;
    let hasPrimaryFailure = false;
    const cleanupFailures: string[] = [];
    try {
      const rejectedResponse = page.waitForResponse((response) => new URL(response.url()).origin === ownOrigin && new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "PUT");
      const recoveryResponse = page.waitForResponse((response) => new URL(response.url()).origin === ownOrigin && new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "GET");
      void rejectedResponse.catch(() => {});
      void recoveryResponse.catch(() => {});
      await bookingPreference.click();
      await started;
      const { createHash } = await import("node:crypto");
      for (const viewport of [{ name: "desktop-1280x800", width: 1280, height: 800 }, { name: "phone-360x640", width: 360, height: 640 }]) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await bookingPreference.scrollIntoViewIfNeeded();
        await expect(bookingPreference).toBeInViewport();
        await expect(bookingPreference).toBeDisabled();
        await expect(bookingPreference).toBeChecked({ checked: originalEnabled });
        const png = await page.screenshot({ fullPage: false });
        expect(png.subarray(1, 4).toString()).toBe("PNG");
        expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([viewport.width, viewport.height]);
        const id = `d4-preferences-put-pending-${viewport.name}`;
        await testInfo.attach(id, { body: png, contentType: "image/png" });
        await testInfo.attach(`${id}-metadata`, { body: Buffer.from(JSON.stringify({ id, state: "loading", control: "normal UI PUT held before upstream; original persisted checked value", category: "booking.changed", channel: "in_app", expectedEnabled: originalEnabled, requestedEnabled: !originalEnabled, viewport: page.viewportSize(), scroll: await page.evaluate(() => ({ x: scrollX, y: scrollY })), pngWidth: png.readUInt32BE(16), pngHeight: png.readUInt32BE(20), sha256: createHash("sha256").update(png).digest("hex"), pathname: new URL(page.url()).pathname, testId: testInfo.testId, retry: testInfo.retry, revision: process.env.GITHUB_SHA ?? null, runId: process.env.GITHUB_RUN_ID ?? null, runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null })), contentType: "application/json" });
      }
      releaseHeld();
      const [rejected, recovery] = await Promise.all([rejectedResponse, recoveryResponse]);
      expect(rejected.status()).toBe(503);
      expect(rejected.request().postDataJSON()).toEqual({ category: "booking.changed", channel: "in_app", enabled: !originalEnabled });
      expect(recovery.status()).toBe(200);
      expect((await recovery.json()).preferences).toContainEqual({ category: "booking.changed", channel: "in_app", enabled: originalEnabled });
      await expect(bookingPreference).toBeChecked({ checked: originalEnabled });
      await expect(bookingPreference).toBeEnabled();
      const saveError = page.getByRole("alert");
      await expect(saveError).toHaveText("Kunde inte spara inställningen. Försök igen.");
      for (const viewport of [{ name: "desktop-1280x800", width: 1280, height: 800 }, { name: "phone-360x640", width: 360, height: 640 }]) {
        await page.setViewportSize({ width: viewport.width, height: viewport.height });
        await saveError.scrollIntoViewIfNeeded();
        await expect(saveError).toBeInViewport();
        await expect(bookingPreference).toBeInViewport();
        await expect(bookingPreference).toBeChecked({ checked: originalEnabled });
        await expect(bookingPreference).toBeEnabled();
        const png = await page.screenshot({ fullPage: false });
        expect(png.subarray(1, 4).toString()).toBe("PNG");
        expect([png.readUInt32BE(16), png.readUInt32BE(20)]).toEqual([viewport.width, viewport.height]);
        const id = `d4-preferences-controlled-put-error-${viewport.name}`;
        await testInfo.attach(id, { body: png, contentType: "image/png" });
        await testInfo.attach(`${id}-metadata`, { body: Buffer.from(JSON.stringify({ id, state: "error", control: "controlled client-network PUT503 without upstream write; actual recovery GET200", category: "booking.changed", channel: "in_app", expectedEnabled: originalEnabled, viewport: page.viewportSize(), scroll: await page.evaluate(() => ({ x: scrollX, y: scrollY })), pngWidth: png.readUInt32BE(16), pngHeight: png.readUInt32BE(20), sha256: createHash("sha256").update(png).digest("hex"), pathname: new URL(page.url()).pathname, testId: testInfo.testId, retry: testInfo.retry, revision: process.env.GITHUB_SHA ?? null, runId: process.env.GITHUB_RUN_ID ?? null, runAttempt: process.env.GITHUB_RUN_ATTEMPT ?? null })), contentType: "application/json" });
      }
    } catch (error) {
      primaryFailure = error;
      hasPrimaryFailure = true;
    } finally {
      try { releaseHeld(); } catch { cleanupFailures.push("release"); }
      try { await page.unroute(routeMatcher, controlledHandler); } catch { cleanupFailures.push("unroute"); }
      try { if (heldRouteTask) await heldRouteTask; } catch { cleanupFailures.push("held-settlement"); }
      try { await expect(bookingPreference).toBeEnabled(); } catch { cleanupFailures.push("handler-enabled"); }
      try { await page.setViewportSize(originalViewport!); } catch { cleanupFailures.push("viewport-restore"); }
      let finishedResponse: import("@playwright/test").Response | undefined;
      try {
        [finishedResponse] = await Promise.all([
          page.waitForResponse((response) => new URL(response.url()).origin === ownOrigin && new URL(response.url()).pathname === "/api/notifications/preferences" && response.request().method() === "GET"),
          page.reload(),
        ]);
      } catch { cleanupFailures.push("reload"); }
      try {
        if (!finishedResponse) throw new Error("No finished preference response");
        expect(finishedResponse.status()).toBe(200);
        expect((await finishedResponse.json()).preferences).toContainEqual({ category: "booking.changed", channel: "in_app", enabled: originalEnabled });
      } catch { cleanupFailures.push("reload-readback"); }
      try { await expect(bookingPreference).toBeChecked({ checked: originalEnabled }); } catch { cleanupFailures.push("original-control-state"); }
      try { await expect(bookingPreference).toBeEnabled(); } catch { cleanupFailures.push("finished-control-enabled"); }
      try { await expect(page.getByRole("alert")).toHaveCount(0); } catch { cleanupFailures.push("finished-no-alert"); }
      if (cleanupFailures.length) {
        try {
          await testInfo.attach("d4-preferences-cleanup-failures", { body: Buffer.from(JSON.stringify({ stages: cleanupFailures })), contentType: "application/json" });
        } catch { cleanupFailures.push("cleanup-report"); }
        try {
          testInfo.annotations.push({ type: "cleanup-failure", description: cleanupFailures.join(", ") });
        } catch { cleanupFailures.push("cleanup-annotation"); }
      }
    }
    if (hasPrimaryFailure) throw primaryFailure;
    if (cleanupFailures.length) throw new Error(`Notification preference cleanup failed at: ${cleanupFailures.join(", ")}`);
  });

  test("[P0] Essential in-app notification preference is visibly required and cannot be disabled", async ({ page }) => {
    await signIn(page, fixture().notifications.administrator);
    await page.goto("/settings/notifications");
    const essential = page.getByRole("switch", { name: /viktig.*i appen/i });
    await expect(essential).toBeChecked();
    await expect(essential).toBeDisabled();
    await expect(page.getByText(/obligatorisk notis/i)).toBeVisible();
  });

  test("[P1] Quote delivery has no personal preference row while required notification controls remain visible", async ({ page }) => {
    await signIn(page, fixture().notifications.salesperson);
    await page.goto("/settings/notifications");
    const emailColumn = page.getByRole("group", { name: /offerter/i }).getByRole("columnheader", { name: "E-post" });
    await expect(emailColumn).toBeVisible();
    await expect(page.getByText(/e-postinställningar är tillgängliga när leverans är aktiverad på servern/i)).toBeVisible();
    await expect(page.getByRole("switch", { name: "Offertleverans i appen", exact: true })).toHaveCount(0);
    await expect(page.getByRole("switch", { name: "Offertleverans e-post", exact: true })).toHaveCount(0);
    await expect(page.getByRole("switch", { name: "Viktig uppföljning av offert e-post", exact: true })).toBeDisabled();
  });

  test("[P2] Bell popover supports keyboard activation, semantic labels, and focus return", async ({ page }) => {
    await signIn(page, fixture().notifications.installer, "/my-day");
    const bell = page.getByRole("button", { name: /notiser/i });
    await bell.focus();
    await page.keyboard.press("Enter");
    const popover = page.getByRole("dialog", { name: /notiser/i });
    await expect(popover).toBeVisible();
    await expect(popover.getByRole("listitem").first()).toHaveAccessibleName(/oläst|läst/i);
    await page.keyboard.press("Escape");
    await expect(popover).toBeHidden();
    await expect(bell).toBeFocused();
  });

  test("[P2] Empty and never-run states are explicit and make no real-time delivery claim", async ({ page }) => {
    await signIn(page, fixture().notifications.empty);
    await page.goto("/notifications");
    await expect(page.getByText("Du har inga notiser ännu")).toBeVisible();
    await expect(page.getByText(/ingen tidigare skanning/i)).toBeVisible();
    await expect(page.getByText(/realtid/i)).toHaveCount(0);
  });

  test("[P2] Stale producer state exposes elapsed scan information without claiming current delivery", async ({ page }) => {
    await signIn(page, fixture().notifications.administrator);
    await page.goto("/notifications");
    await expect(page.getByText(/skannad för \d+ tim sedan/i)).toBeVisible();
    await expect(page.getByRole("status")).toContainText(/senaste skanning/i);
    await expect(page.getByText(/uppdateras i realtid/i)).toHaveCount(0);
  });
});
