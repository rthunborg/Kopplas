/** P4 RED ONLY: 11 skipped essential browser cases, zero acceptance evidence.
 * P5 must bind the fail-closed driver before activation. No recording/runtime
 * observation was performed. Proposed new selectors are listed in worker JSON.
 * playwright-utils two-gate decision: flag=true, package absent; vanilla style.
 */
import { test, expect, type Page } from "@playwright/test";
import {
  calendarNames, calendarUI, enterActualPersonalCalendar, expectAccessWarning,
  followPersonalSubscriptionByKeyboard, tabTo, withCalendarBrowserFixture,
  type CalendarBrowserFixture, type PhysicalSnapshot, type SafeFeedReceipt,
} from "./support/calendar-feed-atdd";

// One-time capability must never enter trace/HAR/video/screenshots/reporter data.
// P5's driver also sanitizes raw HTTP/DOM errors; no cause/body/URL attachment.
test.use({ trace: "off", screenshot: "off", video: "off" });

function expectPrivateStorage(snapshot: PhysicalSnapshot) {
  expect(snapshot.onlyHashedCapabilitiesStored).toBe(true);
  expect(snapshot.auditContainsCapabilityOrProofOrIpOrKey).toBe(false);
}

function expectIsolated(before: PhysicalSnapshot, after: PhysicalSnapshot) {
  expect(after.peer).toEqual(before.peer);
  expect(after.foreign).toEqual(before.foreign);
  expectPrivateStorage(after);
}

function expectPublicFeed(receipt: SafeFeedReceipt, expectedStatus: number) {
  expect(receipt.status).toBe(expectedStatus);
  expect(receipt.cacheControl).toMatch(/no-store/i);
  expect(receipt.setCookiePresent).toBe(false);
  expect(receipt.redirectPresent).toBe(false);
  expect(receipt.containsForbiddenFields).toBe(false);
  if (expectedStatus === 200) {
    expect(receipt.contentType).toMatch(/^text\/calendar(?:;|$)/i);
    expect(receipt.rfc5545Valid).toBe(true);
  } else {
    expect(receipt.events).toEqual([]);
  }
}

async function issueFromUI(page: Page, fixture: CalendarBrowserFixture) {
  const saved = fixture.observeLifecycle("create"); // register BEFORE click
  await calendarUI(page).create.click();
  const result = await saved;
  expect(result.committed).toBe(true);
  const issued = await fixture.captureIssuedLink();
  // Boolean receipts deliberately keep raw one-time capability out of failures.
  expect(issued.canonical43Characters).toBe(true);
  expect(issued.hashMatchesPhysicalGeneration).toBe(true);
  expect(issued.absentFromBrowserStorage).toBe(true);
  return { issued, snapshot: result.snapshot };
}

test.describe("15.5 Kalenderprenumeration essential production-host ATDD RED", () => {
  test.skip("[P0] 15.5-E2E-001 [AC1 AC3 AC4 AC6 AC7 AC9] Planering → own issue → anonymous feed → physical last-use → rotate/revoke", async ({ page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      await expectAccessWarning(page);
      const before = await f.snapshot();
      const { issued: first, snapshot: created } = await issueFromUI(page, f);
      expect(created.own.activeCount).toBe(1);
      expect(created.own.generationCount - before.own.generationCount).toBe(1);
      expect(created.own.audit.length - before.own.audit.length).toBe(1);
      expect(created.own.audit.at(-1)).toEqual({ action: "create", actorMatchesSubject: true });
      expect(created.own.lastUsedAt).toBeNull(); // create is not a fetch
      expect(created.own.usageCount).toBe(0);
      expectIsolated(before, created);
      const fetched = await f.fetchAnonymous(first.handle);
      expectPublicFeed(fetched, 200);
      expect(fetched.events).toEqual(f.expectedOwnEvents); // own/shared once; peer/foreign poison omitted
      const used = await f.snapshot();
      expect(used.own.lastUsedAt).not.toBeNull();
      expect(used.own.usageCount).toBe(1);
      expectIsolated(before, used);
      await page.reload();
      await expect(page.getByText(/Senast hämtad/)).toBeVisible();
      expect(await f.lastUsedMatchesPhysical()).toBe(true);
      await expect(calendarUI(page).link).toHaveCount(0);
      await expect(calendarUI(page).abuse).toHaveCount(0);

      await calendarUI(page).rotate.click();
      const rotatedCall = f.observeLifecycle("rotate");
      await page.getByRole("dialog").getByRole("button", { name: calendarNames.confirmRotate, exact: true }).click();
      const rotated = await rotatedCall;
      expect(rotated.committed).toBe(true);
      expect(rotated.snapshot.own.activeCount).toBe(1);
      expect(rotated.snapshot.own.revokedCount - used.own.revokedCount).toBe(1);
      expect(rotated.snapshot.own.audit.length - used.own.audit.length).toBe(1);
      const second = await f.captureIssuedLink();
      expect(second.hashMatchesPhysicalGeneration).toBe(true);
      expectPublicFeed(await f.fetchAnonymous(first.handle), 404);
      expectPublicFeed(await f.fetchAnonymous(second.handle), 200);

      await calendarUI(page).revoke.click();
      const revokedCall = f.observeLifecycle("revoke");
      await page.getByRole("dialog").getByRole("button", { name: calendarNames.confirmRevoke, exact: true }).click();
      const revoked = await revokedCall;
      expect(revoked.committed).toBe(true);
      expect(revoked.snapshot.own.activeCount).toBe(0);
      expect(revoked.snapshot.own.audit.length - rotated.snapshot.own.audit.length).toBe(1);
      expectIsolated(before, revoked.snapshot);
      expectPublicFeed(await f.fetchAnonymous(second.handle), 404);
      await expect(calendarUI(page).link).toHaveCount(0);
      await page.reload();
      expectPublicFeed(await f.fetchAnonymous(first.handle), 404);
      expectPublicFeed(await f.fetchAnonymous(second.handle), 404);
    });
  });

  for (const variant of [
    { id: "002A", mode: "day", scenario: "own-and-foreign", host: "Egen agenda" },
    { id: "002B", mode: "week", scenario: "own-and-foreign", host: "Egen veckokalender" },
    { id: "002C", mode: "day", scenario: "no-profile", host: "Egen agenda" },
  ] as const) {
    test.skip(`[P1] 15.5-E2E-${variant.id} [AC1 AC6] actual ${variant.host} ${variant.scenario} exposes one keyboard subscription link`, async ({ page }) => {
      await withCalendarBrowserFixture(page, variant.scenario, async (f) => {
        await f.signIn("montor");
        const personal = await enterActualPersonalCalendar(page, variant.mode);
        await expect(personal.getByLabel(variant.host, { exact: true })).toBeVisible();
        if (variant.scenario === "no-profile") {
          await expect(personal.getByText("Inga egna bokningar i perioden.", { exact: true })).toBeVisible();
        }
        const link = personal.getByRole("link", { name: calendarNames.title, exact: true });
        await expect(link).toHaveCount(1);
        await expect(link).toHaveAttribute("href", "/settings/calendar");
        await tabTo(page, link);
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/\/settings\/calendar$/);
        await expect(page.getByRole("heading", { name: calendarNames.title, exact: true })).toHaveCount(1);
        await expect(calendarUI(page).create).toHaveCount(1); // single lifecycle surface
      });
    });
  }

  test.skip("[P1] 15.5-E2E-003 [AC1 AC6] profile Min kalender entry reaches the same settings surface by keyboard", async ({ page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await page.goto("/dashboard");
      const profile = page.getByRole("button", { name: "Profil", exact: true });
      await tabTo(page, profile);
      await page.keyboard.press("Enter");
      const link = page.getByRole("link", { name: "Min kalender", exact: true });
      await expect(link).toHaveAttribute("href", "/settings/calendar");
      await tabTo(page, link);
      await page.keyboard.press("Enter");
      await expect(page).toHaveURL(/\/settings\/calendar$/);
      await expect(page.getByRole("heading", { name: calendarNames.title, exact: true })).toHaveCount(1);
      await expect(calendarUI(page).create).toHaveCount(1);
    });
  });

  test.skip("[P1] 15.5-E2E-004 [AC1 AC6] never-used, clipboard denial selectable fallback and revisit never recover the one-time URL", async ({ page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      await expectAccessWarning(page);
      await f.denyClipboard(); // browser permission fault BEFORE copy, no server mock
      const { snapshot } = await issueFromUI(page, f);
      expect(snapshot.own.lastUsedAt).toBeNull();
      await expect(page.getByText(/Aldrig hämtad|Inte hämtad ännu/i)).toBeVisible();
      await calendarUI(page).copy.click();
      await expect(page.getByRole("alert")).toContainText(/kopiera.*(?:manuellt|själv)|markera.*länk/i);
      await tabTo(page, calendarUI(page).link);
      await page.keyboard.press("ControlOrMeta+A");
      expect(await f.checkIssuedLinkFallback()).toEqual({
        readOnly: true, selectedWholeLink: true, equalsConfirmedIssuedLink: true,
      });
      await page.reload();
      await expect(calendarUI(page).link).toHaveCount(0);
      await expect(calendarUI(page).copy).toHaveCount(0);
      await expect(page.getByText(/(?:förlorat|tappat|sparat).*länk|länk.*(?:återskapas|visas igen)/i)).toBeVisible();
      await expect(calendarUI(page).rotate).toBeEnabled();
      expect(await f.snapshot()).toEqual(snapshot); // revisit must not silently rotate
    });
  });

  test.skip("[P0] 15.5-E2E-005 [AC2 AC6] confirmation cancellation, pending persistence and failed rotation retry preserve old generation", async ({ page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      const held = await f.armFault("hold-before-send");
      let created: PhysicalSnapshot;
      try {
        const committed = f.observeLifecycle("create");
        await calendarUI(page).create.click();
        await held.reached;
        await expect(calendarUI(page).create).toBeDisabled();
        await expect(calendarUI(page).link).toHaveCount(0);
        expect((await f.snapshot()).own.activeCount).toBe(0);
        await held.release();
        const result = await committed;
        expect(result.committed).toBe(true);
        created = result.snapshot;
      } finally { await held.dispose(); }
      const original = await f.captureIssuedLink();
      await calendarUI(page).rotate.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(calendarUI(page).rotate).toBeFocused();
      expect(await f.snapshot()).toEqual(created);

      const failure = await f.armFault("fail-before-send");
      try {
        await calendarUI(page).rotate.click();
        await page.getByRole("dialog").getByRole("button", { name: calendarNames.confirmRotate, exact: true }).click();
        await failure.reached;
        await expect(page.getByRole("alert")).toContainText(/försök igen|kunde inte/i);
        await expect(calendarUI(page).retry).toBeEnabled();
        expect(await f.snapshot()).toEqual(created);
        expectPublicFeed(await f.fetchAnonymous(original.handle), 200);
      } finally { await failure.dispose(); }
      const beforeRetry = await f.snapshot();
      const retry = f.observeLifecycle("rotate");
      await calendarUI(page).retry.click();
      const retried = await retry;
      expect(retried.committed).toBe(true);
      expect(retried.snapshot.own.generationCount - beforeRetry.own.generationCount).toBe(1);
      expect(retried.snapshot.own.audit.length - beforeRetry.own.audit.length).toBe(1);
      expectIsolated(created, retried.snapshot);
      expectPublicFeed(await f.fetchAnonymous(original.handle), 404);
    });
  });

  test.skip("[P0] 15.5-E2E-006 [AC1 AC2 AC6] lost committed issuance reconciles sanitized metadata and needs separate explicit rotation", async ({ page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      const lost = await f.armFault("lose-committed-response");
      let committed: PhysicalSnapshot;
      try {
        await calendarUI(page).create.click();
        await lost.reached;
        committed = await lost.committed; // actual SQL commit precedes transport abort
        expect(committed.own.activeCount).toBe(1);
        await expect(page.getByRole("alert")).toContainText(/okänt|kontrollera|kunde inte bekräfta/i);
        await expect(calendarUI(page).link).toHaveCount(0);
      } finally { await lost.dispose(); }
      await calendarUI(page).reconcile.click();
      await expect(page.getByText(/länk.*(?:återskapas|visas igen)|(?:förlorat|tappat).*länk/i)).toBeVisible();
      await expect(calendarUI(page).link).toHaveCount(0);
      expect(await f.snapshot()).toEqual(committed);
      expect(await f.attemptReceipt()).toEqual({ submittedAttempts: 1, distinctAttempts: 1, recoveredRawLink: false });
      // Status/retry must not create a second secret or silently repeat rotation.
      await calendarUI(page).rotate.click();
      const rotated = f.observeLifecycle("rotate");
      await page.getByRole("dialog").getByRole("button", { name: calendarNames.confirmRotate, exact: true }).click();
      const result = await rotated;
      expect(result.committed).toBe(true);
      expect(result.snapshot.own.generationCount - committed.own.generationCount).toBe(1);
      expect(result.snapshot.own.revokedCount - committed.own.revokedCount).toBe(1);
      expect(result.snapshot.own.audit.length - committed.own.audit.length).toBe(1);
      expectIsolated(committed, result.snapshot);
      const fresh = await f.captureIssuedLink();
      expect(fresh.hashMatchesPhysicalGeneration).toBe(true);
      expectPublicFeed(await f.fetchAnonymous(fresh.handle), 200);
    });
  });

  test.describe("connected phone essentials", () => {
    test.use({ viewport: { width: 360, height: 640 }, hasTouch: true });
    test.skip("[P1] 15.5-E2E-007 [AC1 AC6] 360×640 keyboard entry, touch issue and revoke confirmation remain usable", async ({ page }) => {
      await withCalendarBrowserFixture(page, "no-profile", async (f) => {
        await f.signIn("montor");
        await followPersonalSubscriptionByKeyboard(page, "day");
        await expectAccessWarning(page);
        const create = calendarUI(page).create;
        await create.scrollIntoViewIfNeeded();
        const bounds = await create.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        const saved = f.observeLifecycle("create");
        await create.tap();
        expect((await saved).committed).toBe(true);
        const issued = await f.captureIssuedLink();
        const feed = await f.fetchAnonymous(issued.handle);
        expectPublicFeed(feed, 200);
        expect(feed.events).toEqual([]); // no profile never broadens to tenant rows
        await calendarUI(page).revoke.tap();
        const confirm = page.getByRole("dialog").getByRole("button", { name: calendarNames.confirmRevoke, exact: true });
        await tabTo(page, confirm);
        const revoked = f.observeLifecycle("revoke");
        await page.keyboard.press("Enter");
        expect((await revoked).snapshot.own.activeCount).toBe(0);
        expectPublicFeed(await f.fetchAnonymous(issued.handle), 404);
      });
    });
  });

  test.skip("[P0] 15.5-E2E-008 [AC1 AC5 AC6 AC9] manager self-service cannot read Admin aggregate or peer capability", async ({ page }) => {
    await withCalendarBrowserFixture(page, "admin-monitoring", async (f) => {
      await f.signIn("manager");
      await followPersonalSubscriptionByKeyboard(page, "week");
      await expect(calendarUI(page).abuse).toHaveCount(0);
      const before = await f.snapshot();
      const { issued, snapshot } = await issueFromUI(page, f);
      expectIsolated(before, snapshot);
      const feed = await f.fetchAnonymous(issued.handle);
      expectPublicFeed(feed, 200);
      expect(feed.events).toEqual(f.expectedOwnEvents); // manager team scope cannot broaden feed
      expect(await f.monitoringReceipt()).toMatchObject({
        aggregateReadAllowed: false, containsHashIpUrlProofKeyOrPeerDetails: false,
      });
    });
  });

  test.skip("[P0] 15.5-E2E-009 [AC5 AC6 AC9] Admin sees only sanitized own-tenant abuse counters and separate own lifecycle", async ({ page }) => {
    await withCalendarBrowserFixture(page, "admin-monitoring", async (f) => {
      await f.signIn("admin");
      await followPersonalSubscriptionByKeyboard(page, "week");
      await expect(calendarUI(page).abuse).toBeVisible();
      await expect(calendarUI(page).create).toHaveCount(1);
      const monitoring = await f.monitoringReceipt();
      expect(monitoring).toEqual({
        aggregateReadAllowed: true, ownTenantOnly: true,
        limitedRequests: f.expectedAbuse.limitedRequests, spikes: f.expectedAbuse.spikes,
        containsHashIpUrlProofKeyOrPeerDetails: false,
      });
      // These counts are independently seeded physical facts; do not derive the
      // oracle from the provider response. No rate-limit trip in this E2E lane.
      await expect(calendarUI(page).abuse).toContainText(String(f.expectedAbuse.limitedRequests));
      const before = await f.snapshot();
      const { snapshot } = await issueFromUI(page, f);
      expectIsolated(before, snapshot); // Admin management remains self-only
    });
  });
});
