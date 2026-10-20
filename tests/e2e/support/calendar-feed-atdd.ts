/** Real production browser adapter. Uses isolated rows and the already provisioned runtime key read-only. No key/global-IP mutation or resource startup. */
import { expect, type Locator, type Page, type Request, type Route } from "@playwright/test";
import { createHash, randomBytes, randomUUID } from "node:crypto";
import { withBookingFixture } from "../../support/bookings-atdd";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { adminInsertCustomer, adminInsertFacility, makeAuthedServerClient } from "../../factories/tenants";
import { signIn as browserSignIn, hydrated } from "./time-reports-atdd";
import { createJob } from "@/server/commands/jobs";
import { runCommand } from "@/server/commands/envelope";

export const CALENDAR_FIXTURE_DATE = "2026-10-12";

/** Accessible labels bound to the authored production components. Runtime
 * verification is performed by the required production-host browser lane. */
export const calendarNames = {
  title: "Kalenderprenumeration",
  create: "Skapa kalenderlänk",
  rotate: "Rotera länk",
  revoke: "Återkalla länk",
  copy: "Kopiera länk",
  link: "Din kalenderlänk (visas bara nu)",
  confirmRotate: "Bekräfta rotera",
  confirmRevoke: "Bekräfta återkalla",
  retry: "Försök igen med samma ändring",
  reconcile: "Kontrollera resultat",
  abuse: "Kalenderprenumerationer – begränsningar",
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
    notice: page.getByRole("region", { name: calendarNames.title, exact: true }).getByRole("status"),
    abuse: page.getByRole("region", { name: calendarNames.abuse, exact: true }),
  };
}

/** Keyboard traversal proves reachability; direct focus() would not prove it. */
export async function tabTo(page: Page, target: Locator): Promise<void> {
  await hydrated(target);
  if (await target.evaluate((element) => element === document.activeElement)) return;
  for (let count = 0; count < 80; count++) {
    await page.keyboard.press("Tab");
    if (await target.evaluate((element) => element === document.activeElement)) return;
  }
  throw new Error("Expected calendar control is not reachable by keyboard");
}

/** Actual source anchors: AppShell Huvudmeny/Huvudnavigation + Planering;
 * SchedulingToolbar Planeringsvy/Min kalender, Datum, Period;
 * PersonalCalendarView Min kalender/Egen agenda/Egen veckokalender/empty copy.
 * Hydration is awaited before interaction with the production host.
 */
export async function enterActualPersonalCalendar(page: Page, mode: "day" | "week") {
  await page.goto("/dashboard");
  const menu = page.getByRole("button", { name: "Öppna meny", exact: true });
  if (await menu.isVisible()) { await hydrated(menu); await menu.click(); }
  const nav = page.getByRole("navigation", { name: "Huvudnavigation", exact: true })
    .filter({ visible: true });
  await nav.getByRole("link", { name: "Planering", exact: true }).click();
  await expect(page).toHaveURL(/\/scheduling$/);
  const personalTab = page.getByRole("tab", { name: "Min kalender", exact: true });
  await hydrated(personalTab);
  await personalTab.click();
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

/** Both bearer access and provider retention warnings are required. */
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
export type SafeEvent = { uid: string; start: string; end: string; summary: string; location: string | null };
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
  genericInactive: boolean;
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
   * Reuses withBookingFixture/FixtureUser/adminQuery; no host env file or
   * globally shared fixture/key is created in this helper.
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
  fetchAnonymous: (link: IssuedLinkHandle, hostileCookiesAndValidators?: boolean) => Promise<SafeFeedReceipt>;
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

type TokenFact = { id: string; tenant_id: string; membership_id: string; token_hash: string | null;
  revision: number; attempt_id: string; action: LifecycleAction; revoked_at: string | null;
  usage_count: string; last_used_at: string | null; request_count: string; spike_count: string; last_spike_at: string | null };
type AuditFact = { target_id: string; actor_user_id: string; command: string; metadata: Record<string, unknown> };
type Attempt = { action: LifecycleAction; revision: number; attemptId: string };
const secretLinks = new WeakMap<IssuedLinkHandle, string>();
const hash = (value: string) => createHash("sha256").update(value).digest("hex");

function actionInput(request: Request): Attempt | null {
  if (request.method() !== "POST" || !request.headers()["next-action"] || new URL(request.url()).pathname !== "/settings/calendar") return null;
  try {
    const [input] = JSON.parse(request.postData() ?? "null");
    return input && ["create", "rotate", "revoke"].includes(input.action) && Number.isSafeInteger(input.revision)
      && /^[0-9a-f-]{36}$/i.test(input.attemptId) ? input as Attempt : null;
  } catch { return null; }
}
function deferred<T>() {
  let resolve!: (value: T) => void, reject!: (error: Error) => void;
  const promise = new Promise<T>((yes, no) => { resolve = yes; reject = no; });
  void promise.catch(() => undefined);
  return { promise, resolve, reject };
}
/** Independent RFC inspection: exact boundaries, CRLF, UTF8 folding, required
 * singleton properties and allowlist. No production serializer/parser import. */
function inspectCalendar(body: string): { events: SafeEvent[]; valid: boolean } {
  const lines = body.split("\r\n");
  let valid = body.startsWith("BEGIN:VCALENDAR\r\n") && body.endsWith("END:VCALENDAR\r\n")
    && !body.replaceAll("\r\n", "").match(/[\r\n]/) && lines.every(line => Buffer.byteLength(line) <= 75);
  const unfolded = body.replace(/\r\n[ \t]/g, "");
  const matches = [...unfolded.matchAll(/BEGIN:VEVENT\r\n([\s\S]*?)END:VEVENT\r\n/g)];
  valid &&= matches.length === (unfolded.match(/BEGIN:VEVENT/g) ?? []).length;
  const events = matches.map(match => {
    const properties = new Map<string, string[]>();
    for (const line of match[1].split("\r\n").filter(Boolean)) {
      const colon = line.indexOf(":");
      if (colon < 1) { valid = false; continue; }
      const name = line.slice(0, colon), values = properties.get(name) ?? [];
      values.push(line.slice(colon + 1)); properties.set(name, values);
    }
    const allowed = ["UID", "DTSTAMP", "LAST-MODIFIED", "DTSTART", "DTEND", "DTSTART;VALUE=DATE", "DTEND;VALUE=DATE", "SUMMARY", "LOCATION"];
    valid &&= [...properties.keys()].every(name => allowed.includes(name)) && [...properties.values()].every(values => values.length === 1);
    for (const required of ["UID", "DTSTAMP", "LAST-MODIFIED", "SUMMARY"]) valid &&= properties.has(required);
    const start = properties.get("DTSTART")?.[0] ?? properties.get("DTSTART;VALUE=DATE")?.[0];
    const end = properties.get("DTEND")?.[0] ?? properties.get("DTEND;VALUE=DATE")?.[0];
    valid &&= !!start && !!end && /^(?:\d{8}|\d{8}T\d{6}Z)$/.test(start) && /^(?:\d{8}|\d{8}T\d{6}Z)$/.test(end);
    const decode = (value: string) => value.replace(/\\([nN,;\\])/g, (_, char: string) => /n/i.test(char) ? "\n" : char);
    return { uid: properties.get("UID")?.[0] ?? "", start: start ?? "", end: end ?? "", summary: decode(properties.get("SUMMARY")?.[0] ?? ""), location: properties.has("LOCATION") ? decode(properties.get("LOCATION")![0]) : null };
  });
  valid &&= new Set(events.map(event => event.uid)).size === events.length;
  return { events: events.sort((a, b) => a.uid.localeCompare(b.uid)), valid };
}

/** Fresh ordinary auth fixtures and physical SQL observations only. The caller
 * owns the production host/runtime key; missing infrastructure fails the test.
 * No global-IP reset, Vault writes, success stubs, retries or secret attachments. */
export async function withCalendarBrowserFixture(
  page: Page, scenario: "own-and-foreign" | "no-profile" | "admin-monitoring",
  run: (fixture: CalendarBrowserFixture) => Promise<void>,
): Promise<void> {
  // Even Playwright locator errors can include the one-time input in DOM context.
  // Preserve failure, but never let those native details reach JSON/HTML reports.
  try {
    await withBookingFixture(async fx => {
      const ownTenant = fx.base.tenantA.id, foreignTenant = fx.base.tenantB.id;
      const ids = fx.tenantIds, bookingIds: string[] = [], customers: string[] = [], facilities: string[] = [], jobs: string[] = [], roles: string[] = [];
      const extraProfile = randomUUID(), privateNote = `PRIVATE-NOTE-${randomUUID()}`;
      const peerUser = fx.roleUnionUser;
      const [peerMember] = await adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [ownTenant, peerUser.id]);
      const subjects = { montor: { user: fx.users.montor, membership: fx.ownProfile.membershipId, profile: fx.ownProfile.id },
        manager: { user: fx.users.projektledare, membership: fx.coworkerProfile.membershipId, profile: fx.coworkerProfile.id },
        admin: { user: fx.base.adminA, membership: fx.adminProfile.membershipId, profile: fx.adminProfile.id } };
      let subject = subjects.montor;
      const attempts: Attempt[] = [], rawLinks: string[] = [], seedHashes: string[] = [];
      const activeFaults = new Set<ArmedFault>();
      const requestListener = (request: Request) => { const input = actionInput(request); if (input) attempts.push(input); };
      page.on("request", requestListener);
      const readTokens = () => adminQuery<TokenFact>(`select id,tenant_id,membership_id,token_hash,revision,attempt_id,action,
        revoked_at::text,usage_count::text,last_used_at::text,request_count::text,spike_count::text,last_spike_at::text
        from public.calendar_feed_tokens where tenant_id=any($1::uuid[]) order by tenant_id,membership_id,revision`, [ids]);
      const readAudit = () => adminQuery<AuditFact>(`select target_id,actor_user_id,command,metadata from public.audit_events
        where tenant_id=any($1::uuid[]) and command like 'calendar_feed.%' order by created_at,id`, [ids]);
      const snapshot = async (): Promise<PhysicalSnapshot> => {
        const [tokens, audits] = await Promise.all([readTokens(), readAudit()]);
        const rows = (membership: string, userId: string): SubjectRows => {
          const own = tokens.filter(row => row.membership_id === membership), active = own.find(row => row.revoked_at === null);
          return { generationCount: own.filter(row => row.action !== "revoke").length, activeCount: own.filter(row => row.revoked_at === null).length,
            revokedCount: own.filter(row => row.action !== "revoke" && row.revoked_at !== null).length, revision: own.at(-1)?.revision ?? 0,
            usageCount: Number(active?.usage_count ?? 0), lastUsedAt: active?.last_used_at ?? null,
            audit: audits.filter(audit => own.some(row => row.id === audit.target_id)).map(audit => ({ action: audit.command.slice("calendar_feed.".length) as LifecycleAction, actorMatchesSubject: audit.actor_user_id === userId })) };
        };
        const serialized = JSON.stringify(audits);
        const secrets = [...rawLinks, ...rawLinks.map(url => new URL(url).pathname.split("/").at(-1)!), ...tokens.flatMap(row => row.token_hash ? [row.token_hash] : []), ...seedHashes,
          process.env.CALENDAR_FEED_ATTESTATION_SECRET ?? ""].filter(Boolean);
        return { own: rows(subject.membership, subject.user.id), peer: rows(peerMember.id, peerUser.id), foreign: rows(fx.foreignProfile.membershipId, fx.base.adminB.id),
          onlyHashedCapabilitiesStored: tokens.every(row => row.action === "revoke" ? row.token_hash === null : /^[0-9a-f]{64}$/.test(row.token_hash ?? "")),
          auditContainsCapabilityOrProofOrIpOrKey: secrets.some(value => serialized.includes(value)) || /"(?:token|token_hash|tokenHash|rawUrl|issuedPath|signature|proof|ip|ip_hash|ipHash|secret|key)"\s*:/i.test(serialized) };
      };
      const committedAttempt = async (input: Attempt): Promise<PhysicalSnapshot> => {
        await expect.poll(async () => {
          const [tokens, audits] = await Promise.all([readTokens(), readAudit()]);
          const token = tokens.find(row => row.membership_id === subject.membership && row.attempt_id === input.attemptId && row.action === input.action && row.revision === input.revision + 1);
          return !!token && audits.filter(audit => audit.target_id === token.id && audit.actor_user_id === subject.user.id && audit.metadata.attemptId === input.attemptId && audit.metadata.revision === token.revision).length === 1;
        }, { timeout: 15_000, message: "Expected exact calendar lifecycle row and attributable audit commit" }).toBe(true);
        return snapshot();
      };
      const errors: Error[] = [];
      try {
        await adminQuery("update public.tenants set provisioning_state=null where id=any($1::uuid[])", [ids]);
        await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id) values($1,$2,$3)", [extraProfile, ownTenant, peerMember.id]);
        if (scenario === "no-profile") await adminQuery("delete from public.person_profiles where id=$1 and tenant_id=$2", [fx.ownProfile.id, ownTenant]);
        const expectedByProfile = new Map<string, SafeEvent[]>();
        for (const tenant of ids) {
          const customer = await adminInsertCustomer({ tenant_id: tenant, customer_type: "company", display_name: tenant === ownTenant ? "Kalendertest kund" : "FOREIGN-CUSTOMER" }); customers.push(customer);
          const facility = await adminInsertFacility({ tenant_id: tenant, customer_id: customer, name: "Kalendertest plats" }); facilities.push(facility);
          await adminQuery("update public.facilities set address_line1='Testgatan 15',postal_code='75300',city='Uppsala' where id=$1 and tenant_id=$2", [facility, tenant]);
          const job = await runCommand(createJob, { client: (tenant === ownTenant ? fx.adminClient : fx.foreignClient) as never, input: { customer_id: customer, title: tenant === ownTenant ? "Kalendertest jobb" : "FOREIGN-JOB" }, correlationId: randomUUID() });
          if (!job.ok) throw new Error("Calendar job seed refused"); jobs.push(job.data.targetId);
          const [role] = await adminQuery<{ id: string }>("insert into public.work_roles(tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,'Installation',20000,40000) returning id", [tenant]); roles.push(role.id);
          const available = [fx.ownProfile.id, fx.coworkerProfile.id, fx.adminProfile.id].filter(id => scenario !== "no-profile" || id !== fx.ownProfile.id);
          const assignments = tenant === ownTenant ? [...available.map(id => [id]), available, [extraProfile]] : [[fx.foreignProfile.id]];
          for (const profiles of assignments) {
            const id = randomUUID(); bookingIds.push(id);
            await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,facility_id,create_command_id,create_payload_digest,create_result)
              values($1,$2,'2026-10-12T06:00:00Z','2026-10-12T08:00:00Z',$3,$4,$5,$6,$7,$8,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`, [id, tenant, privateNote, role.id, job.data.targetId, customer, facility, randomUUID()]);
            for (const profile of profiles) {
              await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)", [tenant, id, profile]);
              const expected = expectedByProfile.get(profile) ?? [];
              expected.push({ uid: `${id}@bookings.kopplas`, start: "20261012T060000Z", end: "20261012T080000Z", summary: "Installation – Kalendertest jobb – Kalendertest kund", location: "Testgatan 15, 75300 Uppsala" }); expectedByProfile.set(profile, expected);
            }
          }
        }
        // Concrete peer/foreign capabilities and aggregate poison facts. No feed
        // requests, dedicated key changes or global-IP budget writes are involved.
        for (const [tenant, membership, count] of [[ownTenant, peerMember.id, 3], [foreignTenant, fx.foreignProfile.membershipId, 19]] as const) {
          const digest = hash(randomBytes(32).toString("base64url")); seedHashes.push(digest);
          await adminQuery(`insert into public.calendar_feed_tokens(tenant_id,membership_id,token_hash,revision,attempt_id,action,expected_revision,request_count,spike_count,last_spike_at)
            values($1,$2,$3,1,$4,'create',0,$5,$5,clock_timestamp())`, [tenant, membership, digest, randomUUID(), count]);
        }
        let confirmedLink: string | null = null;
        const fixture: CalendarBrowserFixture = {
          expectedOwnEvents: [], expectedAbuse: { limitedRequests: 3, spikes: 1 },
          async signIn(identity) { subject = subjects[identity]; fixture.expectedOwnEvents = [...(expectedByProfile.get(subject.profile) ?? [])].sort((a, b) => a.uid.localeCompare(b.uid)); await browserSignIn(page, subject.user); },
          snapshot,
          async observeLifecycle(action) {
            const response = page.waitForResponse(response => actionInput(response.request())?.action === action);
            const request = await page.waitForRequest(request => actionInput(request)?.action === action);
            const input = actionInput(request)!;
            await response;
            return { committed: true, snapshot: await committedAttempt(input) };
          },
          async captureIssuedLink() {
            const input = calendarUI(page).link; await input.waitFor({ state: "visible" });
            const url = await input.inputValue(), token = /^\/calendar\/feed\/([A-Za-z0-9_-]{43})$/.exec(new URL(url).pathname)?.[1];
            const handle = Object.freeze({}) as IssuedLinkHandle; secretLinks.set(handle, url); rawLinks.push(url); confirmedLink = url;
            const canonical = new URL(url).origin === new URL(page.url()).origin && !!token && Buffer.from(token, "base64url").length === 32 && Buffer.from(token, "base64url").toString("base64url") === token;
            const current = (await readTokens()).find(row => row.membership_id === subject.membership && row.revoked_at === null);
            const browserStorage = await page.evaluate(() => JSON.stringify([Object.entries(localStorage), Object.entries(sessionStorage), document.cookie]));
            return { handle, canonical43Characters: canonical, hashMatchesPhysicalGeneration: !!token && current?.token_hash === hash(token),
              absentFromBrowserStorage: !browserStorage.includes(url) && !!token && !browserStorage.includes(token) };
          },
          async fetchAnonymous(handle, hostileCookiesAndValidators = false) {
            try {
              const url = secretLinks.get(handle); if (!url) throw new Error("Unknown handle");
              const response = await fetch(url, { method: "GET", redirect: "manual", credentials: "omit", signal: AbortSignal.timeout(15_000), headers: {
                "Cache-Control": "no-cache", ...(hostileCookiesAndValidators ? { Cookie: "sb-junk-auth-token=hostile; tenant=foreign", Authorization: "Bearer invalid-fixture-session", "If-None-Match": "*", "If-Modified-Since": "Wed, 21 Oct 2099 07:28:00 GMT" } : {}) } });
              const body = await response.text(), parsed = response.status === 200 ? inspectCalendar(body) : { events: [], valid: false };
              const forbidden = [privateNote, peerUser.id, subject.user.id, ownTenant, foreignTenant, "FOREIGN-CUSTOMER", "FOREIGN-JOB", ...seedHashes,
                ...rawLinks, ...rawLinks.map(value => new URL(value).pathname.split("/").at(-1)!)];
              return { status: response.status, contentType: response.headers.get("content-type") ?? "", cacheControl: response.headers.get("cache-control") ?? "",
                setCookiePresent: response.headers.has("set-cookie"), redirectPresent: response.headers.has("location"), events: parsed.events,
                containsForbiddenFields: forbidden.some(value => body.includes(value)) || /(?:ATTENDEE|ORGANIZER|DESCRIPTION|EMAIL|cost_rate|sell_rate|token_hash|tenant_id|membership_id)/i.test(body), rfc5545Valid: parsed.valid,
                genericInactive: response.status === 404 && body === "Kalenderlänken är inte aktiv." };
            } catch { throw new Error("Calendar anonymous HTTP verification failed (details redacted)"); }
          },
          async lastUsedMatchesPhysical() {
            const used = (await snapshot()).own.lastUsedAt;
            const expected = await page.evaluate(timestamp => timestamp ? new Date(timestamp).toLocaleString("sv-SE") : "Aldrig hämtad", used);
            return await page.getByRole("region", { name: calendarNames.title, exact: true }).locator("dl").innerText().then(text => text.includes(expected));
          },
          async checkIssuedLinkFallback() {
            return calendarUI(page).link.evaluate((element, expected) => { const input = element as HTMLInputElement; return {
              readOnly: input.readOnly, selectedWholeLink: input.selectionStart === 0 && input.selectionEnd === input.value.length,
              equalsConfirmedIssuedLink: expected !== null && input.value === expected }; }, confirmedLink);
          },
          async denyClipboard() { await page.context().clearPermissions(); await page.evaluate(() => Object.defineProperty(navigator, "clipboard", { configurable: true, value: { writeText: async () => { throw new DOMException("Clipboard permission denied", "NotAllowedError"); } } })); },
          async armFault(kind) {
            const reached = deferred<void>(), committed = deferred<PhysicalSnapshot>(), release = deferred<void>(), settled = deferred<void>();
            let consumed = false;
            const handler = async (route: Route) => {
              const input = actionInput(route.request()); if (!input || consumed) { await route.fallback(); return; } consumed = true;
              try {
                if (kind === "hold-before-send") {
                  reached.resolve(); await Promise.race([release.promise, new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error("Calendar hold timeout")), 20_000); timer.unref(); })]);
                  await route.continue();
                } else if (kind === "fail-before-send") { await route.abort("failed"); reached.resolve(); }
                else { const response = await route.fetch({ timeout: 15_000 }); if (!response.ok()) throw new Error("Calendar response failed");
                  const state = await committedAttempt(input); await route.abort("failed"); committed.resolve(state); reached.resolve(); }
              } catch { const error = new Error("Calendar transport fault verification failed (details redacted)"); reached.reject(error); committed.reject(error); await route.abort("failed").catch(() => undefined); }
              finally { settled.resolve(); }
            };
            await page.route("**/settings/calendar", handler);
            const fault: ArmedFault = { reached: reached.promise, committed: committed.promise, release: async () => { release.resolve(); }, dispose: async () => {
              release.resolve();
              if (consumed) await Promise.race([settled.promise, new Promise<never>((_, reject) => { const timer = setTimeout(() => reject(new Error("Calendar transport settlement timeout")), 20_000); timer.unref(); })]);
              await page.unroute("**/settings/calendar", handler); activeFaults.delete(fault);
            } };
            activeFaults.add(fault); return fault;
          },
          async attemptReceipt() { return { submittedAttempts: attempts.length, distinctAttempts: new Set(attempts.map(input => input.attemptId)).size, recoveredRawLink: await calendarUI(page).link.count() > 0 }; },
          async monitoringReceipt() {
            const client = await makeAuthedServerClient(subject.user), own = await client.rpc("read_calendar_feed_abuse", { p_tenant_id: ownTenant });
            const foreign = await client.rpc("read_calendar_feed_abuse", { p_tenant_id: foreignTenant });
            const tokens = (await readTokens()).filter(row => row.tenant_id === ownTenant);
            const expectedLimited = tokens.reduce((sum, row) => sum + Number(row.spike_count), 0);
            const data = own.data as Record<string, unknown> | null;
            const keysValid = !!data && Object.keys(data).sort().join(",") === "lastSpikeAt,limited,requests";
            const expectedSpike = tokens.map(row => row.last_spike_at).filter((value): value is string => value !== null).sort().at(-1);
            const dtoValid = keysValid && data!.limited === expectedLimited && data!.requests === tokens.reduce((sum, row) => sum + Number(row.request_count), 0)
              && (expectedSpike ? typeof data!.lastSpikeAt === "string" && new Date(data!.lastSpikeAt).getTime() === new Date(expectedSpike).getTime() : data!.lastSpikeAt === null);
            return { aggregateReadAllowed: !own.error && dtoValid, ownTenantOnly: !!foreign.error,
              limitedRequests: typeof data?.limited === "number" ? data.limited : 0, spikes: data?.lastSpikeAt ? 1 : 0,
              containsHashIpUrlProofKeyOrPeerDetails: !!data && !keysValid };
          },
        };
        await run(fixture);
      } catch { errors.push(new Error("Calendar scenario assertions or setup failed (sensitive details redacted)")); }
      finally {
        page.off("request", requestListener);
        for (const fault of activeFaults) { try { await fault.dispose(); } catch { errors.push(new Error("Calendar fault cleanup failed")); } }
        try {
          await adminSession(async ({ query }) => {
            await query("begin");
            try {
              // Only this fixture's immutable audit rows require the established
              // transaction-local bypass. Restore enforcement before row teardown.
              await query("set local session_replication_role=replica");
              await query("delete from public.audit_events where tenant_id=any($1::uuid[])", [ids]);
              await query("set local session_replication_role=origin");
              await query("delete from public.calendar_feed_tokens where tenant_id=any($1::uuid[])", [ids]);
              await query("delete from public.booking_assignees where tenant_id=any($1::uuid[]) and booking_id=any($2::uuid[])", [ids, bookingIds]);
              await query("delete from public.booking_conflicts where tenant_id=any($1::uuid[]) and (booking_id=any($2::uuid[]) or related_booking_id=any($2::uuid[]))", [ids, bookingIds]);
              await query("delete from public.bookings where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, bookingIds]);
              await query("delete from public.job_events where tenant_id=any($1::uuid[]) and job_id=any($2::uuid[])", [ids, jobs]);
              await query("delete from public.job_members where tenant_id=any($1::uuid[]) and job_id=any($2::uuid[])", [ids, jobs]);
              await query("delete from public.jobs where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, jobs]);
              await query("delete from public.facilities where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, facilities]);
              await query("delete from public.customers where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, customers]);
              await query("delete from public.work_roles where tenant_id=any($1::uuid[]) and id=any($2::uuid[])", [ids, roles]);
              await query("delete from public.person_profiles where tenant_id=any($1::uuid[])", [ids]);
              await query("commit");
            } catch { await query("rollback"); throw new Error("Calendar owned row cleanup failed"); }
          });
        } catch { errors.push(new Error("Calendar owned row cleanup failed")); }
        if (errors.length) throw new AggregateError(errors, "Calendar browser cleanup failed (details redacted)");
      }
    });
  } catch (error) {
    // The owned spec's isolated worker fixture also disables Playwright's
    // automatic error-context DOM snapshots through artifact teardown.
    await page.goto("about:blank").catch(() => undefined);
    if (error instanceof AggregateError) throw error; // only fixed sanitized failures enter this aggregate
    throw new Error("Calendar browser scenario failed (sensitive browser/transport/SQL details redacted)");
  }
}
