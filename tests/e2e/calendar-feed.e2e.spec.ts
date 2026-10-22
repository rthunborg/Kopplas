/** Essential production-host browser coverage. Real Next actions, anonymous HTTP and physical SQL readbacks. */
import type { Page } from "@playwright/test";
import { test as resourceTest, expect } from "./support/resource-cdp-attachment";
import {
  createCalendarFailureLabels, calendarNames, calendarUI, calendarBrowserCleanup, enterActualPersonalCalendar, expectAccessWarning,
  followPersonalSubscriptionByKeyboard, tabTo, withCalendarBrowserFixture,
  type CalendarBrowserFixture, type PhysicalSnapshot, type SafeFeedReceipt,
} from "./support/calendar-feed-atdd";

// Playwright 1.61's automatic error-context DOM snapshot is independent of
// screenshot/trace options. A unique worker fixture changes its worker-pool
// digest, preventing reuse by unrelated smoke files. Keep the flag through test
// artifact teardown (including failures/timeouts), then restore the prior value
// at worker teardown. Error-context message/source attachments still exist on
// failures; attachment contents are unqualified until inspected under custody.
// This changes no assertion/native JSON result evidence.
const test = resourceTest.extend<Record<never, never>, { calendarArtifactPrivacy: void }>({
  calendarArtifactPrivacy: [async ({}, provide) => {
    const prior = process.env.PLAYWRIGHT_NO_COPY_PROMPT;
    process.env.PLAYWRIGHT_NO_COPY_PROMPT = "1";
    try { await provide(); }
    finally {
      if (prior === undefined) delete process.env.PLAYWRIGHT_NO_COPY_PROMPT;
      else process.env.PLAYWRIGHT_NO_COPY_PROMPT = prior;
    }
  }, { scope: "worker", auto: true }],
});

// One-time capability must never enter trace/HAR/video/screenshots/reporter data.
// The driver also sanitizes raw HTTP/DOM errors; no cause/body/URL attachment.
test.use({ trace: "off", screenshot: "off", video: "off", serviceWorkers:"block" });

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
    if (expectedStatus === 404) expect(receipt.genericInactive).toBe(true);
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

test.describe("15.5 Kalenderprenumeration essential production-host", () => {
  test("[P0] 15.5-E2E-001 [AC1 AC3 AC4 AC6 AC7 AC9] Planering → own issue → anonymous feed → physical last-use → rotate/revoke", async ({ resourcePage: page }) => {
    const labels=createCalendarFailureLabels(undefined,"E2E001");
    try { await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      labels.at("sign-in"); await f.signIn("montor");
      labels.at("navigation"); await followPersonalSubscriptionByKeyboard(page, "day");
      labels.at("warning"); await expectAccessWarning(page);
      const before = await f.snapshot();
      labels.at("create"); const { issued: first, snapshot: created } = await issueFromUI(page, f);
      expect(created.own.activeCount).toBe(1);
      expect(created.own.generationCount - before.own.generationCount).toBe(1);
      expect(created.own.audit.length - before.own.audit.length).toBe(1);
      expect(created.own.audit.at(-1)).toEqual({ action: "create", actorMatchesSubject: true });
      expect(created.own.lastUsedAt).toBeNull(); // create is not a fetch
      expect(created.own.usageCount).toBe(0);
      expectIsolated(before, created);
      labels.at("feed"); const fetched = await f.fetchAnonymous(first.handle);
      expectPublicFeed(fetched, 200);
      expect(fetched.events).toEqual(f.expectedOwnEvents); // own/shared once; peer/foreign poison omitted
      labels.at("last-use"); const used = await f.snapshot();
      expect(used.own.lastUsedAt).not.toBeNull();
      expect(used.own.usageCount).toBe(1);
      expectIsolated(before, used);
      await page.reload();
      await expect(page.getByText(/Senast hämtad/)).toBeVisible();
      expect(await f.lastUsedMatchesPhysical()).toBe(true);
      await expect(calendarUI(page).link).toHaveCount(0);
      await expect(calendarUI(page).abuse).toHaveCount(0);
      const hostile = await f.fetchAnonymous(first.handle, true);
      expectPublicFeed(hostile, 200);
      expect(hostile.events).toEqual(f.expectedOwnEvents);

      labels.at("rotation"); await calendarUI(page).rotate.click();
      const rotatedCall = f.observeLifecycle("rotate");
      await page.getByRole("dialog").getByRole("button", { name: calendarNames.confirmRotate, exact: true }).click();
      const rotated = await rotatedCall;
      expect(rotated.committed).toBe(true);
      expect(rotated.snapshot.own.activeCount).toBe(1);
      expect(rotated.snapshot.own.revokedCount - used.own.revokedCount).toBe(1);
      expect(rotated.snapshot.own.audit.length - used.own.audit.length).toBe(1);
      const second = await f.captureIssuedLink();
      expect(second.hashMatchesPhysicalGeneration).toBe(true);
      labels.at("old-new-feed"); expectPublicFeed(await f.fetchAnonymous(first.handle), 404);
      expectPublicFeed(await f.fetchAnonymous(second.handle), 200);

      labels.at("revoke"); await calendarUI(page).revoke.click();
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
    },labels); } catch(error) { labels.capture("FINAL");labels.failure();labels.publish();throw error; }
  });

  for (const variant of [
    { id: "002A", mode: "day", scenario: "own-and-foreign", host: "Egen agenda" },
    { id: "002B", mode: "week", scenario: "own-and-foreign", host: "Egen veckokalender" },
    { id: "002C", mode: "day", scenario: "no-profile", host: "Egen agenda" },
  ] as const) {
    test(`[P1] 15.5-E2E-${variant.id} [AC1 AC6] actual ${variant.host} ${variant.scenario} exposes one keyboard subscription link`, async ({ resourcePage: page }) => {
      await withCalendarBrowserFixture(page, variant.scenario, async (f) => {
        await f.signIn("montor");
        const personal = await enterActualPersonalCalendar(page, variant.mode);
        if (variant.scenario === "no-profile") {
          await expect(personal).toBeVisible();
          await expect(personal.getByLabel(variant.host, { exact: true })).toBeAttached();
          await expect(personal.getByText("Inga egna bokningar i perioden.", { exact: true })).toBeVisible();
        } else {
          await expect(personal.getByLabel(variant.host, { exact: true })).toBeVisible();
        }
        const link = personal.getByRole("link", { name: calendarNames.title, exact: true });
        await expect(link).toHaveCount(1);
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("href", "/settings/calendar");
        await tabTo(page, link);
        await page.keyboard.press("Enter");
        await expect(page).toHaveURL(/\/settings\/calendar$/);
        await expect(page.getByRole("heading", { name: calendarNames.title, exact: true })).toHaveCount(1);
        await expect(calendarUI(page).create).toHaveCount(1); // single lifecycle surface
      });
    });
  }

  test("[P1] 15.5-E2E-003 [AC1 AC6] profile Min kalender entry reaches the same settings surface by keyboard", async ({ resourcePage: page }) => {
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
      await f.signIn("seller");
      await page.goto("/dashboard");
      await page.getByRole("button", { name: "Profil", exact: true }).click();
      await expect(page.getByRole("link", { name: "Min kalender", exact: true })).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Notisinställningar", exact: true })).toBeVisible();
      await page.goto("/settings/calendar");
      await expect(calendarUI(page).create).toHaveCount(0);
    });
  });

  test("[P1] 15.5-E2E-004 [AC1 AC6] never-used, clipboard denial selectable fallback and revisit never recover the one-time URL", async ({ resourcePage: page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      await expectAccessWarning(page);
      await f.denyClipboard(); // browser permission fault BEFORE copy, no server mock
      const { snapshot } = await issueFromUI(page, f);
      expect(snapshot.own.lastUsedAt).toBeNull();
      await expect(page.getByText(/Aldrig hämtad|Inte hämtad ännu/i)).toBeVisible();
      await calendarUI(page).copy.click();
      await expect(calendarUI(page).notice).toContainText(/markera och kopiera länken/i);
      await tabTo(page, calendarUI(page).link);
      await page.keyboard.press("ControlOrMeta+A");
      expect(await f.checkIssuedLinkFallback()).toEqual({
        readOnly: true, selectedWholeLink: true, equalsConfirmedIssuedLink: true,
      });
      await page.reload();
      await expect(calendarUI(page).link).toHaveCount(0);
      await expect(calendarUI(page).copy).toHaveCount(0);
      await expect(page.getByText(/befintliga länken visas inte igen/i)).toBeVisible();
      await expect(calendarUI(page).rotate).toBeEnabled();
      expect(await f.snapshot()).toEqual(snapshot); // revisit must not silently rotate
    });
  });

  test("[P0] 15.5-E2E-005 [AC2 AC6] confirmation cancellation, pending persistence and failed rotation retry preserve old generation", async ({ resourcePage: page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      const held = await f.armFault("hold-before-send");
      let created: PhysicalSnapshot;
      let heldPrimary: { error: unknown } | undefined;
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
      } catch (error) { heldPrimary = { error }; throw error; }
      finally { await calendarBrowserCleanup([{ stage: "cleanup-fault-dispose", run: () => held.dispose() }], heldPrimary); }
      const original = await f.captureIssuedLink();
      await calendarUI(page).rotate.click();
      await expect(page.getByRole("dialog")).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(page.getByRole("dialog")).toHaveCount(0);
      await expect(calendarUI(page).rotate).toBeFocused();
      expect(await f.snapshot()).toEqual(created);

      const failure = await f.armFault("fail-before-send");
      let failurePrimary: { error: unknown } | undefined;
      try {
        await calendarUI(page).rotate.click();
        await page.getByRole("dialog").getByRole("button", { name: calendarNames.confirmRotate, exact: true }).click();
        await failure.reached;
        await expect(calendarUI(page).notice).toContainText(/kontrollera resultatet/i);
        await calendarUI(page).reconcile.click();
        await expect(calendarUI(page).notice).toContainText(/inget sparat resultat/i);
        await expect(calendarUI(page).retry).toBeEnabled();
        expect(await f.snapshot()).toEqual(created);
        expectPublicFeed(await f.fetchAnonymous(original.handle), 200);
      } catch (error) { failurePrimary = { error }; throw error; }
      finally { await calendarBrowserCleanup([{ stage: "cleanup-fault-dispose", run: () => failure.dispose() }], failurePrimary); }
      const beforeRetry = await f.snapshot();
      const retry = f.observeLifecycle("rotate");
      await calendarUI(page).retry.click();
      const retried = await retry;
      expect(retried.committed).toBe(true);
      expect(retried.snapshot.own.generationCount - beforeRetry.own.generationCount).toBe(1);
      expect(retried.snapshot.own.audit.length - beforeRetry.own.audit.length).toBe(1);
      expectIsolated(created, retried.snapshot);
      const fresh = await f.captureIssuedLink();
      expect(fresh.hashMatchesPhysicalGeneration).toBe(true);
      expect(await f.attemptReceipt()).toEqual({ submittedAttempts: 3, distinctAttempts: 2, recoveredRawLink: true });
      expectPublicFeed(await f.fetchAnonymous(original.handle), 404);
      expectPublicFeed(await f.fetchAnonymous(fresh.handle), 200);
    });
  });

  test("[P0] 15.5-E2E-006 [AC1 AC2 AC6] lost committed issuance reconciles sanitized metadata and needs separate explicit rotation", async ({ resourcePage: page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async (f) => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      const lost = await f.armFault("lose-committed-response");
      let committed: PhysicalSnapshot;
      let lostPrimary: { error: unknown } | undefined;
      try {
        await calendarUI(page).create.click();
        await lost.reached;
        committed = await lost.committed; // actual SQL commit precedes transport abort
        expect(committed.own.activeCount).toBe(1);
        await expect(calendarUI(page).notice).toContainText(/kontrollera resultatet/i);
        await expect(calendarUI(page).link).toHaveCount(0);
      } catch (error) { lostPrimary = { error }; throw error; }
      finally { await calendarBrowserCleanup([{ stage: "cleanup-fault-dispose", run: () => lost.dispose() }], lostPrimary); }
      await calendarUI(page).reconcile.click();
      await expect(calendarUI(page).notice).toContainText(/utfärdade länken kan inte återhämtas/i);
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
    test("[P1] 15.5-E2E-007 [AC1 AC6] 360×640 keyboard entry, touch issue and revoke confirmation remain usable", async ({ resourcePage }, testInfo) => {
      const labels=createCalendarFailureLabels(undefined,"E2E007");
      try {
      // CDP resourcePage intentionally supplies its own context. Create this
      // test's touch-enabled context on that same owned browser so its options
      // are real under both CDP and the configured native Playwright runner.
      const browser = resourcePage.context().browser();
      if (!browser) throw new Error("Calendar phone test requires the owned browser");
      const context = await browser.newContext({ baseURL: testInfo.project.use.baseURL, viewport: { width: 360, height: 640 }, hasTouch: true, serviceWorkers:"block" });
      const page = await context.newPage();
      let phonePrimary: { error: unknown } | undefined;
      try { await withCalendarBrowserFixture(page, "no-profile", async (f) => {
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
      },labels); } catch (error) { phonePrimary = { error }; throw error; }
      finally { await calendarBrowserCleanup([{ stage: "cleanup-page", run: () => context.close() }], phonePrimary); }
      } catch(error) { labels.capture("FINAL");labels.failure();labels.publish();throw error; }
    });
  });

  test("[P0] 15.5-E2E-008 [AC1 AC5 AC6 AC9] manager self-service cannot read Admin aggregate or peer capability", async ({ resourcePage: page }) => {
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

  test("[P0] 15.5-E2E-009 [AC5 AC6 AC9] Admin sees only sanitized own-tenant abuse counters and separate own lifecycle", async ({ resourcePage: page }) => {
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

  for (const competingAction of ["rotate", "revoke"] as const) {
    test(`[P0] 15.5-E2E-010-${competingAction} [AC2 AC6] automatic refresh removes a superseded issuance and success announcement after concurrent ${competingAction}`, async ({ resourcePage: page }) => {
      const labels=competingAction==="revoke"?createCalendarFailureLabels(undefined,"E2E010-revoke"):undefined;
      try { await withCalendarBrowserFixture(page, "own-and-foreign", async f => {
        await f.signIn("montor");
        await followPersonalSubscriptionByKeyboard(page, "day");
        const before = await f.snapshot(), held = await f.armFault("hold-committed-response");
        const pending: Promise<unknown>[] = [];
        let competingPage: Page | undefined;
        let racePrimary: { error: unknown } | undefined;
        try {
          const original = f.observeLifecycle("create"); pending.push(original); void original.catch(() => undefined);
          await calendarUI(page).create.click();
          const first = await held.committed, originalLink = await held.issuedLink;
          expect(first.own.revision - before.own.revision).toBe(1);
          expect(first.own.audit.length - before.own.audit.length).toBe(1);
          await expect(calendarUI(page).link).toHaveCount(0);
          await expect(calendarUI(page).notice).toHaveText("Arbetar…");
          expectPublicFeed(await f.fetchAnonymous(originalLink), 200);

          // Same real session, separate settings instance; the original page's
          // response remains held until this independently audited command commits.
          competingPage = await page.context().newPage();
          await competingPage.goto("/settings/calendar");
          const control = calendarUI(competingPage)[competingAction];
          await tabTo(competingPage, control);
          await competingPage.keyboard.press("Enter");
          const competing = f.observeLifecycle(competingAction, competingPage); pending.push(competing); void competing.catch(() => undefined);
          await competingPage.getByRole("dialog").getByRole("button", { name: competingAction === "rotate" ? calendarNames.confirmRotate : calendarNames.confirmRevoke, exact: true }).click();
          const newer = await competing;
          expect(newer.committed).toBe(true);
          expect(newer.snapshot.own.revision - first.own.revision).toBe(1);
          expect(newer.snapshot.own.audit.length - first.own.audit.length).toBe(1);
          expect(newer.snapshot.own.audit.at(-1)).toEqual({ action: competingAction, actorMatchesSubject: true });
          expect(newer.snapshot.own.activeCount).toBe(competingAction === "rotate" ? 1 : 0);
          const currentLink = competingAction === "rotate" ? await f.captureIssuedLink(competingPage) : null;
          if (currentLink) expect(currentLink.hashMatchesPhysicalGeneration).toBe(true);

          await held.release(); // release before joining the original pending action
          await original;
          // This is mutate()'s automatic refresh; no explicit refresh/reload is
          // allowed here, since either would hide a missing refresh/state/message wire.
          await expect(calendarUI(page).notice).toHaveText("Statusen har ändrats. Välj en ny ändring utifrån aktuell status.");
          await expect(calendarUI(page).notice).not.toContainText("Länken är skapad. Kopiera den nu");
          await expect(calendarUI(page).link).toHaveCount(0);
          await expect(calendarUI(page).copy).toHaveCount(0);
          const after = await f.snapshot();
          expect(after.own.revision).toBe(newer.snapshot.own.revision);
          expect(after.own.audit).toEqual(newer.snapshot.own.audit);
          expectIsolated(before, after);
          expectPublicFeed(await f.fetchAnonymous(originalLink), 404);
          if (currentLink) {
            const feed = await f.fetchAnonymous(currentLink.handle);
            expectPublicFeed(feed, 200);
            expect(feed.events).toEqual(f.expectedOwnEvents);
          }
        } catch (error) { racePrimary = { error }; throw error; }
        finally {
          await calendarBrowserCleanup([
            { stage: "cleanup-fault-release", run: () => held.release() },
            { stage: "cleanup-lifecycle", run: () => Promise.allSettled(pending) },
            { stage: "cleanup-fault-dispose", run: () => held.dispose() },
            { stage: "cleanup-page", run: async () => competingPage?.close() },
          ], racePrimary);
        }
      },labels); } catch(error) { labels?.capture("FINAL");labels?.failure();labels?.publish();throw error; }
    });
  }

  test("[P0] 15.5-E2E-011 [AC2 AC6] automatic refresh retains the current issuance, copy control and success announcement", async ({ resourcePage: page }) => {
    await withCalendarBrowserFixture(page, "own-and-foreign", async f => {
      await f.signIn("montor");
      await followPersonalSubscriptionByKeyboard(page, "day");
      const before = await f.snapshot(), held = await f.armFault("hold-committed-response");
      const original = f.observeLifecycle("create"); void original.catch(() => undefined);
      let controlPrimary: { error: unknown } | undefined;
      try {
        await calendarUI(page).create.click();
        const committed = await held.committed;
        expect(committed.own.revision - before.own.revision).toBe(1);
        await expect(calendarUI(page).link).toHaveCount(0);
        await held.release();
        await original;
        // A visible success announcement means the automatic refresh completed
        // and busy ended. Only then verify that reconciliation retained this URL.
        await expect(calendarUI(page).notice).toHaveText("Länken är skapad. Kopiera den nu; den visas bara den här gången.");
        await expect(calendarUI(page).copy).toBeVisible();
        const issued = await f.captureIssuedLink();
        expect(issued.canonical43Characters).toBe(true);
        expect(issued.hashMatchesPhysicalGeneration).toBe(true);
        expect(issued.absentFromBrowserStorage).toBe(true);
        expect(await f.snapshot()).toEqual(committed);
        expectIsolated(before, committed);
        const feed = await f.fetchAnonymous(issued.handle);
        expectPublicFeed(feed, 200);
        expect(feed.events).toEqual(f.expectedOwnEvents);
      } catch (error) { controlPrimary = { error }; throw error; }
      finally {
        await calendarBrowserCleanup([
          { stage: "cleanup-fault-release", run: () => held.release() },
          { stage: "cleanup-lifecycle", run: () => Promise.allSettled([original]) },
          { stage: "cleanup-fault-dispose", run: () => held.dispose() },
        ], controlPrimary);
      }
    });
  });
});
