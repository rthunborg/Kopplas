/** Story 15.5 P4 RED contract. Importing this module performs no I/O.
 * P5 must bind REAL production-host browser/HTTP/physical SQL observations.
 * These are test-driver receipts, NOT proposed production RPC/DTO contracts.
 * Do not import tests/support/calendar-feed-atdd.ts: its serial key/global-IP
 * budget belongs to the separate API lane. No shared key mutation in this lane.
 */
import { expect, type Locator, type Page } from "@playwright/test";

export const CALENDAR_FIXTURE_DATE = "2026-10-12";

/** Existing labels were source-inspected, never runtime-verified in P4.
 * All lifecycle names below are PROPOSED accessible names, requiring P5 source
 * and actual browser confirmation. Only subscription/title/profile text and
 * settings path are pinned by the approved Spec. No CSS or future test endpoint.
 */
export const calendarNames = {
  title: "Kalenderprenumeration",
  create: "Skapa kalenderlänk",
  rotate: "Rotera kalenderlänk",
  revoke: "Återkalla kalenderlänk",
  copy: "Kopiera kalenderlänk",
  link: "Kalenderlänk",
  confirmRotate: "Bekräfta rotation",
  confirmRevoke: "Bekräfta återkallelse",
  retry: "Försök igen",
  reconcile: "Kontrollera resultat",
  abuse: "Kalenderprenumeration – missbruksöversikt",
} as const;

export function calendarUI(page: Page) {
  return {
    create: page.getByRole("button", { name: calendarNames.create, exact: true }),
    rotate: page.getByRole("button", { name: calendarNames.rotate, exact: true }),
    revoke: page.getByRole("button", { name: calendarNames.revoke, exact: true }),
    copy: page.getByRole("button", { name: calendarNames.copy, exact: true }),
    link: page.getByRole("textbox", { name: calendarNames.link, exact: true }),
    retry: page.getByRole("button", { name: calendarNames.retry, exact: true }),
    reconcile: page.getByRole("button", { name: calendarNames.reconcile, exact: true }),
    abuse: page.getByRole("region", { name: calendarNames.abuse, exact: true }),
  };
}

/** Keyboard traversal proves reachability; direct focus() would not prove it. */
export async function tabTo(page: Page, target: Locator): Promise<void> {
  for (let count = 0; count < 80; count++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("Expected calendar control is not reachable by keyboard");
}

/** Actual source anchors: AppShell Huvudmeny/Huvudnavigation + Planering;
 * SchedulingToolbar Planeringsvy/Min kalender, Datum, Period;
 * PersonalCalendarView Min kalender/Egen agenda/Egen veckokalender/empty copy.
 * P5 must verify hydration against the production host before accepting results.
 */
export async function enterActualPersonalCalendar(page: Page, mode: "day" | "week") {
  await page.goto("/dashboard");
  const menu = page.getByRole("button", { name: "Öppna meny", exact: true });
  if (await menu.isVisible()) await menu.click();
  const nav = page.getByRole("navigation", { name: "Huvudnavigation", exact: true })
    .filter({ visible: true });
  await nav.getByRole("link", { name: "Planering", exact: true }).click();
  await expect(page).toHaveURL(/\/scheduling$/);
  await page.getByRole("tab", { name: "Min kalender", exact: true }).click();
  await page.getByLabel("Datum", { exact: true }).fill(CALENDAR_FIXTURE_DATE);
  await page.getByLabel("Period", { exact: true }).selectOption(mode);
  await expect(page.getByText("Läser planering…", { exact: true })).toHaveCount(0);
  const personal = page.getByRole("region", { name: "Min kalender", exact: true });
  await expect(personal).toBeVisible();
  return personal;
}

export async function followPersonalSubscriptionByKeyboard(page: Page, mode: "day" | "week") {
  const personal = await enterActualPersonalCalendar(page, mode);
  const subscription = personal.getByRole("link", { name: calendarNames.title, exact: true });
  await expect(subscription).toHaveCount(1);
  await expect(subscription).toHaveAttribute("href", "/settings/calendar");
  await tabTo(page, subscription);
  await page.keyboard.press("Enter");
  await expect(page).toHaveURL(/\/settings\/calendar$/);
  await expect(page.getByRole("heading", { name: calendarNames.title, exact: true })).toBeVisible();
}

/** Exact Swedish warning copy is not pinned. These semantic assertions need P5
 * reconciliation with final accessible wording; provider retention is required.
 */
export async function expectAccessWarning(page: Page): Promise<void> {
  await expect(page.getByText(/(?:alla|den) som har länken.*läsa/i)).toBeVisible();
  await expect(page.getByText(/kalender(?:app|leverantör).*behålla|redan hämtade.*(?:finnas kvar|sparas)/i)).toBeVisible();
}

declare const issuedLinkBrand: unique symbol;
/** Adapter keeps the raw link in a private WeakMap, never an enumerable property.
 * Do not compare, interpolate, attach, screenshot, trace or print the raw input.
 */
export type IssuedLinkHandle = { readonly [issuedLinkBrand]: true };
export type LifecycleAction = "create" | "rotate" | "revoke";
export type SafeEvent = { uid: string; summary: string; location: string | null };
export type SubjectRows = {
  generationCount: number; activeCount: number; revokedCount: number;
  revision: number; usageCount: number; lastUsedAt: string | null;
  audit: { action: LifecycleAction; actorMatchesSubject: boolean }[];
};
export type PhysicalSnapshot = {
  own: SubjectRows; peer: SubjectRows; foreign: SubjectRows;
  onlyHashedCapabilitiesStored: boolean;
  auditContainsCapabilityOrProofOrIpOrKey: boolean;
};
export type LifecycleObservation = {
  committed: boolean; snapshot: PhysicalSnapshot;
};
export type SafeFeedReceipt = {
  status: number; contentType: string; cacheControl: string;
  setCookiePresent: boolean; redirectPresent: boolean;
  events: SafeEvent[]; containsForbiddenFields: boolean;
  rfc5545Valid: boolean;
};
export type ArmedFault = {
  reached: Promise<void>;
  /** SQL commit readback, not a fulfilled/stubbed response. */
  committed: Promise<PhysicalSnapshot>;
  release: () => Promise<void>;
  dispose: () => Promise<void>;
};

export type CalendarBrowserFixture = {
  /** Fixture is tenant-isolated, with legacy NULL provisioning_state positive,
   * own/shared planned rows and peer/foreign poison rows, stable independent UIDs.
   * Reuse existing withBookingFixture/FixtureUser/adminQuery contracts in P5;
   * create no host env file or globally shared fixture/key in this helper.
   */
  expectedOwnEvents: SafeEvent[];
  expectedAbuse: { limitedRequests: number; spikes: number };
  signIn: (identity: "montor" | "manager" | "admin") => Promise<void>;
  snapshot: () => Promise<PhysicalSnapshot>;
  /** Register actual action transport listener BEFORE triggering the UI action;
   * bind actual Next action input, never guess an /api endpoint or RPC payload.
   * Transport 2xx alone is insufficient: join exact subject/attempt SQL commit.
   */
  observeLifecycle: (action: LifecycleAction) => Promise<LifecycleObservation>;
  /** Read the one-time accessible input without exposing its value in assertions.
   * Format/hash/no-storage checks return booleans only. Capture errors discard
   * cause/request/response/DOM bodies and use a fixed redacted message.
   */
  captureIssuedLink: () => Promise<{
    handle: IssuedLinkHandle; canonical43Characters: boolean;
    hashMatchesPhysicalGeneration: boolean; absentFromBrowserStorage: boolean;
  }>;
  /** REAL anonymous HTTP GET to /calendar/feed/[token] outside browser trace;
   * cookie-free independent client, retries=0, no raw error/URL artifacts.
   * Parse independently of production encoder. Only sanitized receipt escapes.
   * Every request counts: E2E uses no rate-limit trip/global-key mutation. Parent
   * schedules it separately from serial API unknown-IP budget/key/fault tests.
   */
  fetchAnonymous: (link: IssuedLinkHandle) => Promise<SafeFeedReceipt>;
  /** Compare last-used UI with exact physical timestamp without locale guesses. */
  lastUsedMatchesPhysical: () => Promise<boolean>;
  /** Private raw checks; return no URL/hash/proof/IP/key or browser storage data. */
  checkIssuedLinkFallback: () => Promise<{
    readOnly: boolean; selectedWholeLink: boolean; equalsConfirmedIssuedLink: boolean;
  }>;
  denyClipboard: () => Promise<void>;
  /** Transport-only fault, registered BEFORE actions. Never synthesize success.
   * Hold-before-send proves pending; fail-before-send proves zero writes; lost
   * response forwards real request and confirms SQL commit before aborting bytes.
   * Restore all routes/listeners and release owned gates in finally, bounded.
   */
  armFault: (kind: "hold-before-send" | "fail-before-send" | "lose-committed-response") => Promise<ArmedFault>;
  /** Test-normalized sanitized current-self attempt metadata; no new RPC shape. */
  attemptReceipt: () => Promise<{
    submittedAttempts: number; distinctAttempts: number; recoveredRawLink: boolean;
  }>;
  /** Actual management read response scrubbed privately, plus actual UI/SQL
   * aggregate comparison. SQL setup must seed only owned aggregate rows (no
   * unknown-IP requests or test-key writes in this browser fixture).
   */
  monitoringReceipt: () => Promise<{
    aggregateReadAllowed: boolean; ownTenantOnly: boolean;
    limitedRequests: number; spikes: number;
    containsHashIpUrlProofKeyOrPeerDetails: boolean;
  }>;
};

/** INTENTIONAL RED BLOCKER. Removing test.skip alone fails BEFORE acceptance.
 * P5 replaces this body with actual owned fixtures and try/finally cleanup,
 * confirms selectors against actual production-host UI, binds real actions,
 * anonymous HTTP and physical rows, and uses guard-owned resourcePage/host.
 * No fake/no-op adapter, mock-returned receipt, production getter, generated
 * key, DB/HTTP/client import, resource launch, environment read or runtime here.
 * Existing resource-cdp-attachment reads env at import, hence P4 imports neither
 * it nor runtime test-env factories. Parent owns P5 launch/config admission.
 */
export async function withCalendarBrowserFixture(
  _page: Page,
  _scenario: "own-and-foreign" | "no-profile" | "admin-monitoring",
  _run: (fixture: CalendarBrowserFixture) => Promise<void>,
): Promise<void> {
  throw new Error("ATDD RED 15.5: bind real browser, anonymous HTTP and physical SQL adapter before acceptance");
}
