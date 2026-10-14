/** Story 15.1 actual authenticated acceptance. Skips confer no coverage.
 * 14.4-E2E-006 (empty-slot click/drag portion) is exercised at both real hosts. */
import { test, expect, interval, DATE, type View, type Interval, type SchedulingViewsHarness } from "./support/scheduling-views-atdd";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { adminQuery } from "../factories/admin-sql";
import { readFileSync } from "node:fs";
import path from "node:path";

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);
// PASSIVE-NETWORK-BEGIN factory
type PassiveRow = {
  flight: number; hop: number; publicRequestOrdinal: number | null; publicMatchCount: number;
  identity: "candidate" | "ambiguous" | "unmatched";
  type: string; initiatorType: string; rsc: boolean | null; treePrefetch: boolean | null; noStore: boolean | null;
  status: number | null; mimeClass: string; requestMs: number | null; responseMs: number | null; terminalMs: number | null;
  requestSeq: number | null; responseSeq: number | null; terminalSeq: number | null; publicFailedSeq: number | null;
  mainFrameNavigationAfterResponse: boolean | null;
  dataEventCount: number | null; receivedDataBytes: number | null; receivedEncodedBytes: number | null; finishedEncodedBytes: number | null;
  terminal: "pending" | "finished" | "failed" | "redirected" | "ambiguous";
  canceled: boolean | null; errorClass: string; blockedReason: string;
};
const schedulingPassiveShutdowns = new WeakMap<TestInfo, (failure: boolean) => void>();
function createSchedulingPassiveMetadata(page: Page, origin: string, ordinal: (request: import("@playwright/test").Request) => number | undefined) {
  // Public/CDP matches are candidates only. Protocol completion never replaces native body reads.
  type Flight = { id: string; key: string; row: PassiveRow };
  type PublicFlight = { request: import("@playwright/test").Request; key: string; status: number | null; terminal: "pending" | "finished" | "failed"; failedSeq: number | null; ambiguous: boolean };
  const flights: Flight[] = [], publics: PublicFlight[] = [];
  let closed = false, emitted = false, started = false, overflow = false, invalid = false;
  let setup: "pending" | "ready" | "unavailable" = "pending", cleanup: "requested" | "unavailable" = "requested";
  let session: import("@playwright/test").CDPSession | undefined, detached = false;
  let firstTimestamp: number | undefined, sequence = 0, navigationSeq: number | null = null;
  let frozen: { kind: string; setup: string; overflow: boolean; invalid: boolean; cleanup: string; rows: PassiveRow[] } | undefined;
  const object = (value: unknown): value is Record<string, unknown> => typeof value === "object" && value !== null && !Array.isArray(value);
  const count = (value: unknown, max: number): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0 && value <= max;
  const seq = () => { if (sequence >= 1_000_000) { overflow = true; return null; } return ++sequence; };
  const time = (value: unknown) => {
    if (typeof value !== "number" || !Number.isFinite(value) || firstTimestamp === undefined) { invalid = true; return null; }
    const relative = (value - firstTimestamp) * 1000;
    if (relative < 0 || relative > 300_000) { invalid = true; return null; }
    return Math.round(relative * 1000) / 1000;
  };
  const urlKey = (value: unknown) => {
    if (typeof value !== "string" || value.length > 2048) { invalid = true; return null; }
    const url = new URL(value);
    return url.origin === origin && url.pathname === "/scheduling" ? value : null;
  };
  const idKey = (value: unknown) => { if (typeof value !== "string" || !value.length || value.length > 256) { invalid = true; return null; } return value; };
  const status = (value: unknown) => { if (!count(value, 599) || value < 100) { invalid = true; return null; } return value; };
  const category = (value: unknown, allowed: readonly string[]) => typeof value !== "string" ? "unavailable" : allowed.includes(value) ? value : "other";
  const headers = (value: unknown) => {
    if (!object(value)) { invalid = true; return { rsc: null, treePrefetch: null, noStore: null }; }
    let rsc: boolean = false, prefetch: boolean = false, segment: boolean = false, noStore: boolean | null = null, names = 0;
    // Project allowlisted values immediately; even optional event data is never read.
    for (const name in value) {
      if (!Object.prototype.hasOwnProperty.call(value, name)) continue;
      if (++names > 256 || name.length > 256) { invalid = true; return { rsc: null, treePrefetch: null, noStore: null }; }
      const key = name.toLowerCase();
      if (key === "rsc") rsc = value[name] === "1";
      else if (key === "next-router-prefetch") prefetch = value[name] === "1";
      else if (key === "next-router-segment-prefetch") segment = value[name] === "/_tree";
      else if (key === "cache-control") {
        const cache = value[name];
        if (typeof cache !== "string" || cache.length > 2048) { invalid = true; noStore = null; }
        else noStore = cache.toLowerCase().split(",").some(token => token.trim() === "no-store");
      }
    }
    return { rsc, treePrefetch: prefetch && segment, noStore };
  };
  const safe = (action: () => void) => { if (closed) return; try { action(); } catch { invalid = true; } };
  const current = (event: unknown) => {
    if (!object(event)) { invalid = true; return null; }
    const id = idKey(event.requestId); if (id === null) return null;
    for (let i = flights.length - 1; i >= 0; i--) if (flights[i]!.id === id) return flights[i]!;
    return null;
  };
  const terminal = (flight: Flight, event: Record<string, unknown>, state: "finished" | "failed" | "redirected") => {
    const row = flight.row;
    if (row.terminal !== "pending") { row.terminal = "ambiguous"; return; }
    row.terminal = state; row.terminalMs = time(event.timestamp); row.terminalSeq = seq();
  };
  const onRequest = (event: unknown) => safe(() => {
    if (!object(event) || !object(event.request)) { invalid = true; return; }
    const id = idKey(event.requestId); if (id === null) return;
    const previous = current(event);
    const redirect = object(event.redirectResponse);
    if (previous) {
      if (redirect) { terminal(previous, event, "redirected"); previous.id = ""; }
      else { previous.row.terminal = "ambiguous"; return; }
    }
    if (event.request.method !== "GET") return;
    const key = urlKey(event.request.url); if (key === null) return;
    if (typeof event.timestamp !== "number" || !Number.isFinite(event.timestamp) || event.timestamp < 0) { invalid = true; return; }
    if (flights.length === 4) { overflow = true; return; }
    firstTimestamp ??= event.timestamp;
    const projected = headers(event.request.headers);
    flights.push({ id, key, row: {
      flight: flights.length + 1, hop: previous ? previous.row.hop + 1 : 1,
      publicRequestOrdinal: null, publicMatchCount: 0, identity: "unmatched",
      type: category(event.type, ["Document", "Fetch", "XHR", "Prefetch"]), initiatorType: category(object(event.initiator) ? event.initiator.type : undefined, ["parser", "script", "preload"]),
      rsc: projected.rsc, treePrefetch: projected.treePrefetch, noStore: projected.noStore,
      status: null, mimeClass: "unavailable", requestMs: time(event.timestamp), responseMs: null, terminalMs: null,
      requestSeq: seq(), responseSeq: null, terminalSeq: null, publicFailedSeq: null, mainFrameNavigationAfterResponse: null,
      dataEventCount: 0, receivedDataBytes: 0, receivedEncodedBytes: 0, finishedEncodedBytes: null,
      terminal: "pending", canceled: null, errorClass: "unavailable", blockedReason: "unavailable",
    } });
  });
  const onResponse = (event: unknown) => safe(() => {
    const flight = current(event); if (!flight || !object(event) || !object(event.response)) return;
    const row = flight.row;
    if (row.responseSeq !== null || row.terminal !== "pending") { row.terminal = "ambiguous"; return; }
    // Full URL equality corroborates this hop; it is never a public Request identity join.
    if (urlKey(event.response.url) !== flight.key) { row.terminal = "ambiguous"; return; }
    row.responseSeq = seq(); row.responseMs = time(event.timestamp); row.status = status(event.response.status);
    const mime = event.response.mimeType;
    row.mimeClass = typeof mime !== "string" ? "unavailable" : mime === "text/html" ? "html" : mime === "text/x-component" ? "rsc" : "other";
    row.noStore = headers(event.response.headers).noStore;
  });
  const add = (row: PassiveRow, key: "dataEventCount" | "receivedDataBytes" | "receivedEncodedBytes", value: unknown, max: number) => {
    if (!count(value, max)) { invalid = true; if (typeof value === "number" && value > max) overflow = true; row[key] = null; return; }
    if (row[key] === null) return;
    if (row[key]! + value > max) { overflow = true; row[key] = null; return; }
    row[key]! += value;
  };
  const onData = (event: unknown) => safe(() => {
    const flight = current(event); if (!flight || !object(event)) return;
    seq();
    if (flight.row.terminal !== "pending") { flight.row.terminal = "ambiguous"; return; }
    add(flight.row, "dataEventCount", 1, 1_000_000); add(flight.row, "receivedDataBytes", event.dataLength, 2_147_483_647); add(flight.row, "receivedEncodedBytes", event.encodedDataLength, 2_147_483_647);
  });
  const onFinished = (event: unknown) => safe(() => {
    const flight = current(event); if (!flight || !object(event)) return;
    terminal(flight, event, "finished");
    if (!count(event.encodedDataLength, 2_147_483_647)) { invalid = true; if (typeof event.encodedDataLength === "number" && event.encodedDataLength > 2_147_483_647) overflow = true; flight.row.finishedEncodedBytes = null; }
    else flight.row.finishedEncodedBytes = event.encodedDataLength;
  });
  const onFailed = (event: unknown) => safe(() => {
    const flight = current(event); if (!flight || !object(event)) return;
    terminal(flight, event, "failed");
    flight.row.canceled = typeof event.canceled === "boolean" ? event.canceled : null;
    flight.row.errorClass = typeof event.errorText !== "string" ? "unavailable" : event.errorText === "net::ERR_ABORTED" ? "aborted" : event.errorText === "net::ERR_BLOCKED_BY_CLIENT" ? "blocked-client" : event.errorText === "net::ERR_BLOCKED_BY_RESPONSE" ? "blocked-response" : "other";
    flight.row.blockedReason = event.blockedReason === undefined ? "none" : category(event.blockedReason, ["csp", "mixed-content", "origin", "inspector", "integrity", "subresource-filter", "content-type"]);
  });
  const onPublicRequest = (request: import("@playwright/test").Request) => safe(() => {
    if (request.method() !== "GET") return;
    const key = urlKey(request.url()); if (key === null || publics.some(entry => entry.request === request)) return;
    if (publics.length === 4) { overflow = true; return; }
    publics.push({ request, key, status: null, terminal: "pending", failedSeq: null, ambiguous: false }); seq();
  });
  const onPublicResponse = (response: import("@playwright/test").Response) => safe(() => {
    const entry = publics.find(candidate => candidate.request === response.request());
    if (entry) { const value = status(response.status()); if (entry.status !== null && entry.status !== value) entry.ambiguous = true; entry.status = value; seq(); }
  });
  const onPublicFinished = (request: import("@playwright/test").Request) => safe(() => {
    const entry = publics.find(candidate => candidate.request === request); if (entry) { if (entry.terminal !== "pending" && entry.terminal !== "finished") entry.ambiguous = true; entry.terminal = "finished"; seq(); }
  });
  const onPublicFailed = (request: import("@playwright/test").Request) => safe(() => {
    const entry = publics.find(candidate => candidate.request === request); if (entry) { if (entry.terminal !== "pending" && entry.terminal !== "failed") entry.ambiguous = true; entry.terminal = "failed"; entry.failedSeq = seq(); }
  });
  const onNavigation = (frame: import("@playwright/test").Frame) => safe(() => { if (frame === page.mainFrame()) navigationSeq = seq(); });
  const networkHandlers = [["Network.requestWillBeSent", onRequest], ["Network.responseReceived", onResponse], ["Network.dataReceived", onData], ["Network.loadingFinished", onFinished], ["Network.loadingFailed", onFailed]] as const;
  const pageHandlers = [
    { on: () => page.on("request", onPublicRequest), off: () => page.off("request", onPublicRequest) },
    { on: () => page.on("response", onPublicResponse), off: () => page.off("response", onPublicResponse) },
    { on: () => page.on("requestfinished", onPublicFinished), off: () => page.off("requestfinished", onPublicFinished) },
    { on: () => page.on("requestfailed", onPublicFailed), off: () => page.off("requestfailed", onPublicFailed) },
    { on: () => page.on("framenavigated", onNavigation), off: () => page.off("framenavigated", onNavigation) },
  ];
  const detach = (owned: import("@playwright/test").CDPSession) => {
    if (detached) return; detached = true;
    // Requested is never verified cleanup credit. Future rejection is handled silently;
    // it cannot mutate the frozen failure receipt or perform late diagnostic work.
    try { void owned.detach().then(() => {}, () => {}); }
    catch { cleanup = "unavailable"; if (frozen) frozen.cleanup = cleanup; }
  };
  const stop = (failure: boolean) => {
    if (!closed) {
      closed = true;
      const rows = flights.map(({ key, row }) => {
        const matches = publics.filter(entry => entry.key === key && (row.status === null || entry.status === row.status));
        row.publicMatchCount = matches.length;
        row.identity = row.terminal === "ambiguous" || matches.length > 1 || matches.some(entry => entry.ambiguous) || overflow ? "ambiguous" : matches.length === 1 ? "candidate" : "unmatched";
        if (matches.length === 1) {
          try { const value = ordinal(matches[0]!.request); row.publicRequestOrdinal = count(value, Number.MAX_SAFE_INTEGER) && value > 0 ? value : null; } catch { invalid = true; }
          row.publicFailedSeq = matches[0]!.failedSeq;
        }
        row.mainFrameNavigationAfterResponse = row.responseSeq === null ? null : navigationSeq !== null && navigationSeq > row.responseSeq;
        return row;
      });
      frozen = { kind: "passive-network-v1", setup, overflow, invalid, cleanup, rows };
      for (const remove of [() => page.off("close", onClose), ...pageHandlers.map(handler => handler.off), ...networkHandlers.map(([name, handler]) => () => session?.off(name, handler))]) {
        try { remove(); } catch { cleanup = "unavailable"; frozen.cleanup = cleanup; }
      }
      if (session) detach(session);
      flights.length = 0; publics.length = 0; session = undefined;
    }
    if (!failure || emitted) return; emitted = true;
    try { const json = JSON.stringify(frozen); if (typeof json === "string" && Buffer.byteLength(json, "utf8") <= 4096) console.info(`[scheduling-passive-network-metadata] ${json}`); } catch { /* Drop unavailable diagnostics without altering the native verdict. */ }
  };
  const onClose = () => stop(false);
  const start = () => {
    if (started || closed) return; started = true;
    try {
      page.on("close", onClose);
      if (closed) { try { page.off("close", onClose); } catch { /* Teardown remains unavailable. */ } return; }
      for (const handler of pageHandlers) {
        if (closed) return; handler.on();
        if (closed) { try { handler.off(); } catch { /* Teardown remains unavailable. */ } return; }
      }
      if (closed) return;
      void page.context().newCDPSession(page).then(owned => {
        if (closed) { detach(owned); return; }
        session = owned;
        try {
          for (const [name, handler] of networkHandlers) {
            if (closed) return; owned.on(name, handler);
            if (closed) { try { owned.off(name, handler); } catch { /* Teardown remains unavailable. */ } return; }
          }
          if (closed) return;
          void owned.send("Network.enable", {}).then(() => { if (!closed) setup = "ready"; }, () => { if (!closed) setup = "unavailable"; });
        } catch { if (!closed) setup = "unavailable"; }
      }, () => { if (!closed) setup = "unavailable"; });
    } catch { if (!closed) setup = "unavailable"; }
  };
  return { start, stop };
}
// PASSIVE-NETWORK-END factory
const schedulingAttemptShutdowns = new WeakMap<TestInfo, () => void>();
test.afterEach(({}, testInfo) => {
  // PASSIVE-NETWORK-BEGIN hook-outer
  try {
  // PASSIVE-NETWORK-END hook-outer
  try { schedulingAttemptShutdowns.get(testInfo)?.(); }
  finally { schedulingAttemptShutdowns.delete(testInfo); }
  // PASSIVE-NETWORK-BEGIN hook-final
  } finally {
    try { schedulingPassiveShutdowns.get(testInfo)?.(testInfo.status !== "passed" && testInfo.status !== "skipped"); }
    finally { schedulingPassiveShutdowns.delete(testInfo); }
  }
  // PASSIVE-NETWORK-END hook-final
});
async function attachVisual(page: Page, testInfo: TestInfo, name: string) {
  await testInfo.attach(name, {
    body: await page.screenshot({ fullPage: false }),
    contentType: "image/png",
  });
}
async function center(locator: Locator) {
  await locator.scrollIntoViewIfNeeded(); await expect(locator).toBeVisible();
  const box = await locator.boundingBox(); if (!box) throw new Error("Actual host has no pointer bounds");
  return { x: box.x + box.width / 2, y: box.y + box.height / 2 };
}
async function selectDrag(page: Page, start: Locator, end: Locator) {
  // Both actual host targets must fit before pointerdown; scroll cannot silently
  // transform the second slot into a different interval while dragging.
  await end.scrollIntoViewIfNeeded(); const a = await center(start), b = await center(end);
  await page.mouse.move(a.x, a.y); await page.mouse.down();
  await page.mouse.move(b.x, b.y, { steps: 8 }); await page.mouse.up();
}
async function expectEditor(h: SchedulingViewsHarness, i: Interval) {
  await expect(h.editor).toBeVisible();
  await expect(h.editor.getByTestId("booking-start")).toHaveValue(i.startsLocal);
  await expect(h.editor.getByTestId("booking-end")).toHaveValue(i.endsLocal);
  expect(await h.editor.locator('[data-testid^="booking-assignee-option-"]:checked').evaluateAll(nodes => nodes.map(n => n.getAttribute("data-testid")!.slice("booking-assignee-option-".length)).sort())).toEqual([...i.assigneeIds].sort());
}
async function save(h: SchedulingViewsHarness) {
  const observation = await h.observeConfirmedSave();
  await h.editor.getByTestId("booking-save").click(); await observation.confirmed;
  await expect(h.page.getByTestId("booking-save-status")).toHaveText(/sparad|sparats/i);
}
const visibleCell = (h: SchedulingViewsHarness, date: string) => h.page.locator(`[data-testid="capacity-cell"][data-person="${h.people[0]}"][data-date="${date}"]:visible`);

for (const [host, gesture, id] of [["Schema", "click", "001"], ["Schema", "drag", "002"], ["Resurser", "click", "003"], ["Resurser", "drag", "004"]] as const) {
  test(`[P0] 15.1-E2E-${id} AC4 actual ${host} ${gesture} persists selected person/start/end`, async ({ resourcePage: page, schedulingViews: h }) => {
    await h.seed(); await page.setViewportSize({ width: 1440, height: 1000 }); await h.open(host, "day");
    const start = "2026-10-12T14:30", end = gesture === "click" ? "2026-10-12T15:00" : "2026-10-12T16:00";
    const schemaPerson = host === "Schema" && gesture === "click" ? h.people[0]! : "";
    if (schemaPerson) await h.filter("Person", schemaPerson);
    const supplied = host === "Resurser" || schemaPerson ? [h.people[0]!] : [];
    const i = interval(start, end, supplied), slot = h.slot(host, start, h.people[0], schemaPerson);
    if (gesture === "click") { const point = await center(slot); await page.mouse.click(point.x, point.y); }
    else await selectDrag(page, slot, h.slot(host, "2026-10-12T15:30"));
    await expectEditor(h, i);
    const before = await h.sqlBookings(); await h.fillRequired(); await save(h);
    const created = (await h.sqlBookings()).filter(row => !before.some(old => old.id === row.id));
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ startsAt: i.startsAt, endsAt: i.endsAt, assigneeIds: [h.people[0]] });
    await expect(h.editor).toHaveCount(0); await h.reloadAndOpen(created[0]!.id);
    await expectEditor(h, { ...i, assigneeIds: [h.people[0]!] });
  });
}
for (const host of ["Schema", "Resurser"] as const) {
  test(`[P0] 15.1-E2E-005 AC5 ${host} keyboard and interval dialog cancel without writes and return focus`, async ({ schedulingViews: h }) => {
    await h.seed(); await h.open(host, "day"); const before = await h.sqlBookings();
    const i = interval("2026-10-12T14:30", "2026-10-12T15:00", host === "Resurser" ? [h.people[0]!] : []);
    const slot = h.slot(host, i.startsLocal); await slot.focus(); await slot.press("Enter"); await expectEditor(h, i);
    await h.cancel(); await expect(slot).toBeFocused(); expect(await h.sqlBookings()).toEqual(before);
    const trigger = h.page.getByRole("button", { name: "Välj intervall", exact: true }); await trigger.click();
    const dialog = h.page.getByRole("dialog", { name: "Välj bokningsintervall" });
    await dialog.getByLabel("Intervall start").fill(i.startsLocal); await dialog.getByLabel("Intervall slut").fill(i.endsLocal);
    await dialog.getByLabel("Intervall person").selectOption(h.people[0]!);
    await dialog.getByRole("button", { name: "Öppna bokningseditor" }).click();
    await expectEditor(h, { ...i, assigneeIds: [h.people[0]!] });
    await h.fillRequired(); await h.cancel(); await expect(trigger).toBeFocused(); expect(await h.sqlBookings()).toEqual(before);
  });
}
test("[P1] 15.1-E2E-006 SCOPE-001 AC1 five projections, periods, filters and toolbar editor agree across later pages", async ({ schedulingViews: h }, testInfo) => {
  await h.seed(true); await h.signIn("manager"); await h.page.setViewportSize({ width: 1440, height: 1000 });
  const shared = [h.ids.role, h.ids.proposal, h.ids.collision, ...h.laterIds].sort();
  for (const [view, modes] of [["Schema", ["day", "week", "month"]], ["Resurser", ["day", "week"]], ["Team", ["week"]], ["Beläggning", ["day", "week", "month"]], ["Min kalender", ["day", "week"]]] as [View, ("day" | "week" | "month")[]][]) {
    for (const mode of modes) {
      await h.open(view, mode); await h.applySharedFilters();
      if (view === "Beläggning") await expect(visibleCell(h, DATE)).toContainText("Bokat 210 min / budget 480 min");
      else if (view === "Schema" && mode === "month") {
        await h.page.locator(`[data-testid="schema-density-day"][data-date="${DATE}"]`).click(); await h.settle();
        expect(await h.visibleIds()).toEqual([h.ids.role, h.ids.proposal, h.ids.collision].sort());
      } else {
        const expected = view === "Min kalender" ? [h.ids.role] : mode === "day" ? [h.ids.role, h.ids.proposal, h.ids.collision].sort() : shared;
        expect(await h.visibleIds()).toEqual(expected);
        if (view === "Min kalender") await expect(h.page.locator(`[aria-label="${mode === "day" ? "Egen agenda" : "Egen veckokalender"}"]:visible`)).toBeVisible();
      }
      if (mode === "week") await attachVisual(h.page, testInfo, ({ Schema: "desktop-schema-week", Resurser: "desktop-resources-week", Team: "desktop-team-week", Beläggning: "desktop-capacity-week", "Min kalender": "desktop-personal-calendar-week" })[view]);
      const before = await h.sqlBookings(), trigger = h.page.getByTestId("scheduling-new-booking");
      await trigger.click(); await expect(h.editor).toBeVisible(); await h.cancel(); await expect(trigger).toBeFocused();
      expect(await h.sqlBookings()).toEqual(before);
    }
  }
});

test("[P0] 15.1-INT-001 AC2 manager five views; own agenda rejects peer lifecycle and input tampering; denied role", async ({ schedulingViews: h, resourcePage: page }, testInfo) => {
  await h.seed(); await h.signIn("manager"); await h.open("Resurser");
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(page.locator('[aria-label="Behöver omfördelas"]')).toContainText(h.scenario.description);
  const payloads: string[] = [];
  const captureOrigin = new URL(page.url()).origin;
  const captures: Promise<{ ok: true } | { ok: false; error: unknown } | { ok: "abandoned" }>[] = [];
  const abandoned = Symbol("scheduling attempt abandoned");
  let shutdownStarted = false, captureActivated = false, responseAdmissionOpen = false, trackerOpen = true;
  let notifyCancellation!: () => void;
  const cancellation = new Promise<void>(resolve => { notifyCancellation = resolve; });
  const live = new Set<import("@playwright/test").Request>();
  const wakeWaiters = new Set<() => void>();
  let generation = BigInt(0);
  const ensureActive = () => { if (shutdownStarted) throw abandoned; };
  const awaitActive = async <T,>(operation: Promise<T>): Promise<T> => {
    // The operation may already be invoked; retain its settlement even if shutdown reentered.
    const handled = operation.then(value => ({ ok: true as const, value }), error => ({ ok: false as const, error }));
    ensureActive();
    try {
      const result = await Promise.race([handled, cancellation]); ensureActive();
      if (result === undefined) throw abandoned;
      if (!result.ok) throw result.error;
      return result.value;
    }
    catch (error) { ensureActive(); throw error; }
  };
  const wake = () => { for (const waiter of wakeWaiters) waiter(); };
  let hasFailure = false, firstFailure: unknown;
  let notifyFailure!: () => void;
  const failed = new Promise<void>(resolve => { notifyFailure = resolve; });
  const recordFailure = (error: unknown) => {
    if (shutdownStarted || hasFailure) return;
    hasFailure = true; firstFailure = error; notifyFailure();
  };
  const guardProgress = () => { ensureActive(); if (hasFailure) throw firstFailure; };
  const guardedStage = async <T,>(operation: () => Promise<T>): Promise<T> => {
    guardProgress();
    try {
      const value = await awaitActive(Promise.race([operation(), failed]));
      guardProgress(); return value as T;
    } catch (error) { ensureActive(); recordFailure(error); throw firstFailure; }
  };
  const guardedSignIn = async (identity: "montor" | "denied") => {
    guardProgress();
    JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
    guardProgress();
    const credentials = h.users[identity === "montor" ? 1 : 2]!;
    if (identity === "denied") await guardedStage(() => adminQuery("update public.tenant_memberships set status='active' where id=$1 and tenant_id=$2", [h.memberships[2], h.scenario.tenantId]));
    await guardedStage(() => page.context().clearCookies());
    await guardedStage(() => page.goto("/login"));
    await guardedStage(() => page.getByLabel("E-post").fill(credentials.email));
    await guardedStage(() => page.getByLabel("Lösenord").fill(credentials.password));
    await guardedStage(() => page.getByRole("button", { name: "Logga in" }).click());
    await guardedStage(() => expect(page).toHaveURL(/\/dashboard$/));
  };
  const guardedSettle = async () => {
    await guardedStage(() => page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))));
    await guardedStage(() => expect(page.getByText("Läser planering…", { exact: true })).toHaveCount(0));
  };
  type NativeCapture = {
    request: import("@playwright/test").Request; response: import("@playwright/test").Response;
    requestOrdinal: number; captureOrdinal: number; queryPresent: boolean | null;
    phase: "response" | "finished" | "body" | "complete";
    responseMs: number | null; finishedStartMs: number | null; finishedEndMs: number | null;
    bodyStartMs: number | null; bodyEndMs: number | null; requestFailedMs: number | null;
  };
  const admitted = new WeakMap<import("@playwright/test").Request, NativeCapture>();
  // PASSIVE-NETWORK-BEGIN attempt
  const passive = createSchedulingPassiveMetadata(page, captureOrigin, request => admitted.get(request)?.requestOrdinal);
  schedulingPassiveShutdowns.set(testInfo, passive.stop);
  // PASSIVE-NETWORK-END attempt
  let requestOrdinal = 0, captureCount = 0, fulfilledCount = 0, rejectedCount = 0;
  let observerOpen = true, snapshotAttempted = false, baseline: number | null = null;
  try { baseline = performance.now(); } catch { /* Diagnostic clock is optional. */ }
  const relativeTime = () => {
    try {
      if (baseline === null) return null;
      const value = performance.now() - baseline;
      return Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER ? value : null;
    } catch { return null; }
  };
  const updateTiming = (operation: () => void) => { if (!observerOpen) return; try { operation(); } catch { /* Timing cannot alter native capture. */ } };
  const snapshot = (entry: NativeCapture, trigger: "requestfailed" | "finished-rejected" | "body-rejected") => {
    if (!observerOpen || snapshotAttempted) return;
    snapshotAttempted = true;
    try {
      updateTiming(() => {
        if (trigger === "requestfailed") entry.requestFailedMs = relativeTime();
        else if (trigger === "body-rejected") entry.bodyEndMs = relativeTime();
        else entry.finishedEndMs = relativeTime();
      });
      const rawMethod = entry.request.method();
      const method = typeof rawMethod !== "string" ? "unavailable" : rawMethod === "GET" || rawMethod === "POST" ? rawMethod : "other";
      const rawStatus = entry.response.status();
      const status = Number.isInteger(rawStatus) && rawStatus >= 200 && rawStatus <= 299 ? rawStatus : null;
      const rawContentType = entry.response.headers()["content-type"];
      const mediaType = typeof rawContentType === "string" ? rawContentType.split(";", 1)[0]!.trim().toLowerCase() : null;
      const contentType = mediaType === null ? "unavailable" : mediaType === "text/html" || mediaType === "text/x-component" || mediaType === "application/json" || mediaType === "text/plain" ? mediaType : "other";
      const pendingCount = captureCount - fulfilledCount - rejectedCount;
      const validCounter = (value: number) => Number.isSafeInteger(value) && value >= 0;
      const validTime = (value: number | null) => value === null || (Number.isFinite(value) && value >= 0 && value <= Number.MAX_SAFE_INTEGER);
      if (![captureCount, fulfilledCount, rejectedCount, pendingCount].every(validCounter)) return;
      if (![entry.responseMs, entry.finishedStartMs, entry.finishedEndMs, entry.bodyStartMs, entry.bodyEndMs, entry.requestFailedMs].every(validTime)) return;
      if (entry.queryPresent !== null && typeof entry.queryPresent !== "boolean") return;
      if (!["response", "finished", "body", "complete"].includes(entry.phase)) return;
      const json = JSON.stringify({
        kind: "native-response-failure", trigger, path: "/scheduling", queryPresent: entry.queryPresent, method, status, contentType,
        requestOrdinal: Number.isSafeInteger(entry.requestOrdinal) && entry.requestOrdinal > 0 ? entry.requestOrdinal : null,
        captureOrdinal: Number.isSafeInteger(entry.captureOrdinal) && entry.captureOrdinal > 0 ? entry.captureOrdinal : null,
        phase: entry.phase, responseMs: entry.responseMs, finishedStartMs: entry.finishedStartMs, finishedEndMs: entry.finishedEndMs,
        bodyStartMs: entry.bodyStartMs, bodyEndMs: entry.bodyEndMs, requestFailedMs: entry.requestFailedMs,
        captureCount, fulfilledCount, rejectedCount, pendingCount,
      });
      if (typeof json !== "string" || Buffer.byteLength(json, "utf8") > 1024) return;
      console.info("[scheduling-native-response-failure] " + json);
    } catch { /* A failed snapshot is dropped without retry or error replacement. */ }
  };
  const unavailableReason = new Error("Captured scheduling request failed; native reason unavailable.");
  unavailableReason.name = "SchedulingNativeRequestFailure";
  const readFailed = (request: import("@playwright/test").Request) => {
    if (shutdownStarted || !trackerOpen) return;
    const wasLive = live.delete(request);
    if (wasLive) { generation++; wake(); }
    if (!captureActivated) return;
    const entry = admitted.get(request);
    if (!entry && !wasLive) return;
    let reason: unknown = unavailableReason;
    try { const failure = request.failure(), text = failure?.errorText; if (typeof text === "string") reason = text; } catch { /* Use only the fixed unavailable carrier. */ }
    recordFailure(reason);
    wake();
    if (entry) snapshot(entry, "requestfailed");
  };
  const readRequest = (request: import("@playwright/test").Request) => {
    if (shutdownStarted || !trackerOpen) return;
    const url = new URL(request.url());
    if (url.origin !== captureOrigin || url.pathname !== "/scheduling") return;
    live.add(request); generation++; wake();
  };
  const readFinished = (request: import("@playwright/test").Request) => {
    if (shutdownStarted || !trackerOpen) return;
    if (live.delete(request)) { generation++; wake(); }
  };
  const read = (response: import("@playwright/test").Response) => {
    if (shutdownStarted || !responseAdmissionOpen) return;
    const url = new URL(response.url());
    if (url.origin !== captureOrigin || url.pathname !== "/scheduling" || !response.ok()) return;
    const request = response.request(), previous = admitted.get(request);
    const entry: NativeCapture = {
      request, response, requestOrdinal: previous?.requestOrdinal ?? ++requestOrdinal, captureOrdinal: ++captureCount,
      queryPresent: null, phase: "response", responseMs: null, finishedStartMs: null, finishedEndMs: null,
      bodyStartMs: null, bodyEndMs: null, requestFailedMs: null,
    };
    admitted.set(request, entry);
    updateTiming(() => { entry.queryPresent = url.search !== ""; entry.responseMs = relativeTime(); });
    const capture = (async () => {
      updateTiming(() => { entry.phase = "finished"; entry.finishedStartMs = relativeTime(); });
      const failure = await response.finished();
      ensureActive();
      updateTiming(() => { entry.finishedEndMs = relativeTime(); });
      if (failure) throw failure;
      updateTiming(() => { entry.phase = "body"; entry.bodyStartMs = relativeTime(); });
      const payload = await response.text();
      ensureActive();
      payloads.push(payload);
      updateTiming(() => { entry.bodyEndMs = relativeTime(); entry.phase = "complete"; });
    })();
    // Register and handle rejection in the same event turn. The drain retains
    // and rethrows the original error; a missing CDP body is never empty data.
    captures.push(capture.then(() => {
      if (shutdownStarted) return { ok: "abandoned" as const };
      fulfilledCount++; return { ok: true as const };
    }, error => {
      if (error === abandoned) return { ok: "abandoned" as const };
      if (shutdownStarted) return { ok: false as const, error };
      recordFailure(error); rejectedCount++;
      let trigger: "body-rejected" | "finished-rejected" = "finished-rejected";
      updateTiming(() => { trigger = entry.phase === "body" ? "body-rejected" : "finished-rejected"; });
      snapshot(entry, trigger);
      return { ok: false as const, error };
    }));
  };
  const drain = async () => {
    let cursor = 0;
    ensureActive();
    if (hasFailure) throw firstFailure;
    while (cursor < captures.length) {
      if (hasFailure) throw firstFailure;
      const end = captures.length, batch = captures.slice(cursor, end);
      await awaitActive(Promise.race([Promise.all(batch), failed]));
      ensureActive();
      if (hasFailure) throw firstFailure;
      cursor = end;
    }
    if (hasFailure) throw firstFailure;
  };
  const waitForFlightChange = async (observedGeneration: bigint) => {
    ensureActive();
    let notify!: () => void;
    const changed = new Promise<void>(resolve => { notify = resolve; });
    wakeWaiters.add(notify);
    try {
      ensureActive();
      if (!live.size || generation !== observedGeneration || hasFailure) return;
      await awaitActive(Promise.race([changed, failed]));
      ensureActive();
    } finally { if (!shutdownStarted) wakeWaiters.delete(notify); }
  };
  const navigateAfterBarrier = async <T,>(action: () => Promise<T>): Promise<T> => {
    for (;;) {
      ensureActive();
      if (hasFailure) throw firstFailure;
      const observedGeneration = generation, observedCaptures = captures.length;
      if (live.size) { await waitForFlightChange(observedGeneration); ensureActive(); continue; }
      await drain(); ensureActive();
      if (hasFailure) throw firstFailure;
      if (live.size || generation !== observedGeneration || captures.length !== observedCaptures || fulfilledCount + rejectedCount !== captures.length) continue;
      ensureActive();
      try { return await awaitActive(action()); }
      catch (error) { ensureActive(); recordFailure(error); throw firstFailure; }
    }
  };
  const shutdown = () => {
    if (shutdownStarted) return;
    // PASSIVE-NETWORK-BEGIN shutdown
    passive.stop(hasFailure);
    // PASSIVE-NETWORK-END shutdown
    shutdownStarted = true; captureActivated = false; responseAdmissionOpen = false; trackerOpen = false; observerOpen = false;
    notifyCancellation();
    let cleanupFailed = false, cleanupFailure: unknown;
    for (const remove of [() => page.off("response", read), () => page.off("request", readRequest), () => page.off("requestfinished", readFinished), () => page.off("requestfailed", readFailed)]) {
      try { remove(); } catch (error) { if (!cleanupFailed) { cleanupFailed = true; cleanupFailure = error; } }
    }
    wake(); wakeWaiters.clear(); live.clear(); schedulingAttemptShutdowns.delete(testInfo);
    if (cleanupFailed) throw cleanupFailure;
  };
  const closeCaptureWindow = async () => {
    ensureActive();
    responseAdmissionOpen = false;
    try { page.off("response", read); } catch (error) { recordFailure(error); }
    try {
      if (!hasFailure) { try { await navigateAfterBarrier(() => Promise.resolve()); } catch (error) { if (error === abandoned) throw error; recordFailure(error); } }
    } finally {
      // PASSIVE-NETWORK-BEGIN window
      passive.stop(hasFailure);
      // PASSIVE-NETWORK-END window
      if (!shutdownStarted) {
        observerOpen = false; captureActivated = false; trackerOpen = false;
        for (const remove of [() => page.off("request", readRequest), () => page.off("requestfinished", readFinished), () => page.off("requestfailed", readFailed)]) {
          try { remove(); } catch (error) { recordFailure(error); }
        }
      }
    }
  };
  const openCaptureWindow = () => { guardProgress(); captureActivated = true; responseAdmissionOpen = true; page.on("response", read); };
  schedulingAttemptShutdowns.set(testInfo, shutdown);
  page.on("request", readRequest);
  page.on("requestfinished", readFinished);
  page.on("requestfailed", readFailed);
  // PASSIVE-NETWORK-BEGIN start
  passive.start();
  try {
  // PASSIVE-NETWORK-END start
  try {
    try {
    await guardedSignIn("montor"); guardProgress(); openCaptureWindow();
    await navigateAfterBarrier(() => page.goto(`/scheduling?view=resources&person=${h.extraProfiles[2]}&tenant=${h.scenario.tenantIds[1]}`)); guardProgress(); await guardedSettle(); guardProgress(); await drain(); guardProgress();
    await navigateAfterBarrier(() => page.getByLabel("Datum", { exact: true }).fill(DATE)); guardProgress(); await guardedSettle(); guardProgress(); await drain(); guardProgress();
    await guardedStage(() => expect(page.getByRole("tab")).toHaveCount(1)); await guardedStage(() => expect(page.getByRole("tab")).toHaveText("Min kalender"));
    const visibleIds = await guardedStage(() => h.visibleIds()); guardProgress(); expect(visibleIds).toEqual([h.ids.role, h.ids.collision].sort());
    await guardedStage(() => expect(page.getByLabel("Person", { exact: true })).toHaveCount(0)); await guardedStage(() => expect(page.getByTestId("scheduling-new-booking")).toHaveCount(0));
    await guardedStage(() => expect(page.getByText("Behöver omfördelas", { exact: true })).toHaveCount(0));
    await guardedStage(() => expect(page.getByText(h.scenario.assigneeLabels[0]!, { exact: false })).toHaveCount(0));
  } catch (error) {
    if (error === abandoned) throw error;
    recordFailure(error);
  } finally {
    // A failing test keeps all rejection handlers attached but never waits on
    // another unresolved capture. Success must drain the detached final buffer.
    if (!shutdownStarted) await closeCaptureWindow();
  }
  ensureActive();
  if (hasFailure) throw firstFailure;
  try {
    ensureActive();
    expect(payloads.length).toBeGreaterThan(0);
    for (const payload of payloads) { ensureActive(); expect(payload).not.toContain(h.users[2]!.email); ensureActive(); expect(payload).not.toContain('"needsReassignment":'); }
    await guardedSignIn("denied"); guardProgress(); await guardedStage(() => page.goto("/scheduling"));
    await guardedStage(() => expect(page.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible()); await guardedStage(() => expect(page.getByTestId("scheduling-workspace")).toHaveCount(0));
  } catch (error) { if (error === abandoned) throw error; recordFailure(error); }
  ensureActive();
  if (hasFailure) throw firstFailure;
  } catch (error) { if (error !== abandoned) throw error; }
  finally { if (!shutdownStarted) schedulingAttemptShutdowns.delete(testInfo); }
  // PASSIVE-NETWORK-BEGIN final
  } finally { passive.stop(hasFailure); schedulingPassiveShutdowns.delete(testInfo); }
  // PASSIVE-NETWORK-END final
});

for (const host of ["Schema", "Resurser"] as const) for (const operation of ["move", "resize"] as const) {
  test(`[P1] 15.1-E2E-007 AC5 ${host} actual ${operation} and keyboard/click alternatives preserve review and cancellation`, async ({ resourcePage: page, schedulingViews: h }) => {
    await h.seed(); await h.addProposalPeer(); await page.setViewportSize({ width: 1440, height: 1000 });
    const expected = interval(operation === "move" ? "2026-10-12T12:00" : "2026-10-12T11:00", operation === "move" ? "2026-10-12T13:00" : "2026-10-12T13:30", operation === "move" && host === "Resurser" ? [h.people[2]!, h.people[1]!] : h.people.slice(0, 2));
    for (const mode of ["pointer", "keyboard", "click"] as const) {
      await h.resetProposal(); await page.reload(); await h.open(host, "day");
      const before = await h.sqlBookings();
      const source = host === "Resurser" ? h.row().getByTestId(`scheduling-booking-${h.ids.proposal}`) : h.block(h.ids.proposal);
      const trigger = mode === "pointer" && operation === "move" ? source : source.getByRole("button", { name: operation === "move" ? "Redigera / flytta" : "Ändra längd", exact: true });
      const propose = async () => {
        if (mode === "pointer") {
          await trigger.focus();
          await trigger.dragTo(h.slot(host, operation === "move" ? expected.startsLocal : "2026-10-12T13:00", operation === "move" && host === "Resurser" ? h.people[2] : h.people[0]));
        } else {
          if (mode === "keyboard") { await trigger.focus(); await trigger.press("Enter"); } else await trigger.click();
          await expect(h.editor).toBeVisible();
          await h.editor.getByTestId("booking-start").fill(expected.startsLocal); await h.editor.getByTestId("booking-end").fill(expected.endsLocal);
          if (operation === "move" && host === "Resurser") {
            await h.editor.getByTestId(`booking-assignee-option-${h.people[0]}`).uncheck(); await h.editor.getByTestId(`booking-assignee-option-${h.people[2]}`).check();
          }
        }
        await expectEditor(h, expected); await expect(h.editor.getByTestId("booking-review-current-warnings")).toBeVisible();
      };
      await propose(); await h.editor.getByTestId("booking-save").click();
      await expect(h.editor.getByTestId("booking-save-error")).toContainText("Granska aktuella varningar");
      await h.cancel(); await expect(trigger).toBeFocused(); expect(await h.sqlBookings()).toEqual(before);
      await propose(); await h.review(); await save(h);
      const after = await h.sqlBookings(); expect(after).toHaveLength(before.length);
      expect(after.filter(row => row.id !== h.ids.proposal)).toEqual(before.filter(row => row.id !== h.ids.proposal));
      expect(after.find(row => row.id === h.ids.proposal)).toEqual({ id: h.ids.proposal, startsAt: expected.startsAt, endsAt: expected.endsAt, assigneeIds: [...expected.assigneeIds].sort() });
      const states = await adminQuery<{ status: string }>("select status from public.booking_conflicts where tenant_id=$1 and (booking_id=$2 or related_booking_id=$2)", [h.scenario.tenantId, h.ids.proposal]);
      expect(states.some(row => row.status === "accepted")).toBe(true);
      expect(states.some(row => row.status === "open")).toBe(true);
      await expect(h.editor).toHaveCount(0); await h.reloadAndOpen(h.ids.proposal); await expectEditor(h, expected); await h.cancel();
    }
  });
}
test("[P1] 15.1-E2E-008 AC6 arbetsroll/no-role lanes, multi-assignee rows and current reassignment lifecycle", async ({ schedulingViews: h }) => {
  await h.seed(); await h.signIn("manager"); await h.open("Team");
  const roleLane = h.page.getByRole("heading", { name: h.scenario.description, exact: true }).locator("..");
  expect(await h.visibleIds(roleLane)).toEqual([h.ids.role, h.ids.proposal, h.ids.collision].sort());
  const noRole = h.page.getByRole("heading", { name: "Ingen arbetsroll", exact: true }).locator("..");
  expect(await h.visibleIds(noRole)).toEqual([h.ids.noRole, h.ids.inactive, h.ids.zero, h.ids.hidden].sort());
  // The independently seeded label remains historical booking context after
  // retirement; it must never collapse into the null-role lane or active picker.
  const retired = await adminQuery<{ id: string }>("update public.work_roles set is_active=false where id=$1 and tenant_id=$2 and display_name=$3 returning id", [h.scenario.workRoleId, h.scenario.tenantId, h.scenario.description]);
  expect(retired).toEqual([{ id: h.scenario.workRoleId }]);
  await h.page.reload(); await h.settle();
  expect(await h.visibleIds(roleLane)).toEqual([h.ids.role, h.ids.proposal, h.ids.collision].sort());
  expect(await h.visibleIds(noRole)).toEqual([h.ids.noRole, h.ids.inactive, h.ids.zero, h.ids.hidden].sort());
  const roleText = (id: string) => h.block(id).locator("p").filter({ has: h.page.locator('span[aria-hidden="true"]') });
  await expect(roleText(h.ids.role)).toHaveText(`◇ ${h.scenario.description}`);
  await expect(roleText(h.ids.noRole)).toHaveText("◇ Ingen arbetsroll");
  await h.page.getByTestId("scheduling-new-booking").click();
  await expect(h.editor).toBeVisible();
  for (const picker of ["booking-work-role", "booking-work-role-filter"]) await expect(h.editor.getByTestId(picker).locator(`option[value="${h.scenario.workRoleId}"]`)).toHaveCount(0);
  await h.cancel();
  await h.open("Resurser");
  await expect(h.row(h.people[0]).getByTestId(`scheduling-booking-${h.ids.role}`)).toBeVisible();
  await expect(h.row(h.people[1]).getByTestId(`scheduling-booking-${h.ids.role}`)).toBeVisible();
  const lane = h.page.locator('[aria-label="Behöver omfördelas"]');
  for (const [status, archived, expected] of [["disabled", false, true], ["ended", false, true], ["active", false, false], ["active", true, true], ["active", false, false]] as const) {
    await h.lifecycle(status, archived); expect(await h.visibleIds(lane)).toEqual(expected ? [h.ids.inactive] : []);
    if (!expected) await expect(lane).toContainText("Inga bokningar behöver omfördelas.");
  }
});

test("[P1] 15.1-COMP-001 AC3 toolbar preferences isolate user/tenant/view and reset corrupt/unavailable storage", async ({ schedulingViews: h, resourcePage: page }) => {
  await h.seed(); await h.open("Schema", "day"); await h.filter("Person", h.people[0]!); await h.filter("Jobb", h.scenario.jobId);
  const state = async () => ({ mode: await page.getByLabel("Period", { exact: true }).inputValue(), person: await page.getByLabel("Person", { exact: true }).inputValue(), job: await page.getByLabel("Jobb", { exact: true }).inputValue() });
  const changed = { mode: "day", person: h.people[0], job: h.scenario.jobId }, defaults = { mode: "week", person: "", job: "" };
  await page.reload(); await h.settle(); expect(await state()).toEqual(changed);
  await page.getByRole("tab", { name: "Resurser", exact: true }).click(); await h.settle(); expect(await state()).toEqual(defaults);
  await page.getByRole("tab", { name: "Schema", exact: true }).click(); await h.settle(); expect(await state()).toEqual(changed);
  for (const identity of ["manager", "other-tenant"] as const) {
    await h.signIn(identity); await page.goto("/scheduling"); await h.settle(); expect(await state()).toEqual(defaults);
    await h.signIn(); await page.goto("/scheduling"); await h.settle(); expect(await state()).toEqual(changed);
  }
  await page.evaluate(() => { for (let n = 0; n < localStorage.length; n++) { const key = localStorage.key(n)!; if (key.startsWith("kopplas:scheduling:v1:") && key.endsWith(":schema")) localStorage.setItem(key, "corrupt"); } });
  await page.reload(); await h.settle(); expect(await state()).toEqual(defaults); await expect(page.getByText(/Sparade inställningar återställdes/)).toBeVisible();
  await h.filter("Person", h.people[0]!);
  await page.evaluate(() => { for (let n = 0; n < localStorage.length; n++) { const key = localStorage.key(n)!; if (key.startsWith("kopplas:scheduling:v1:") && key.endsWith(":schema")) { const value = JSON.parse(localStorage.getItem(key)!); value.input.filters.personIds = ["00000000-0000-4000-8000-000000000001"]; localStorage.setItem(key, JSON.stringify(value)); } } });
  await page.reload(); await h.settle(); expect(await state()).toEqual(defaults); await expect(page.getByText(/Sparade inställningar återställdes/)).toBeVisible();
  await h.filter("Person", h.people[0]!); await page.getByRole("button", { name: "Återställ filter", exact: true }).click(); await h.settle(); expect(await state()).toEqual(defaults);
  await page.addInitScript(() => { Storage.prototype.getItem = () => { throw new Error("Synthetic denied storage"); }; Storage.prototype.setItem = () => { throw new Error("Synthetic denied storage"); }; });
  await page.reload(); await h.settle(); expect(await state()).toEqual(defaults); expect((await h.visibleIds()).length).toBe(7);
});
test("[P1] 15.1-COMP-001 AC3 observed real read transport failure hides stale/empty/count until retry", async ({ schedulingViews: h }) => {
  await h.seed(); await h.open("Schema"); await h.filter("Jobb", h.scenario.jobId);
  const failed = await h.failNextRead(); await h.page.getByRole("tab", { name: "Schema", exact: true }).click(); await failed.failed;
  await expect(h.page.getByRole("alert")).toContainText("Planeringen kunde inte läsas");
  expect(await h.visibleIds()).toEqual([]); await expect(h.page.getByText(/Inga bokningar matchar/)).toHaveCount(0);
  await expect(h.page.getByText(/^Konflikter \(/)).toHaveCount(0);
  await expect(h.page.getByLabel("Jobb", { exact: true })).toHaveValue(h.scenario.jobId);
  await h.page.getByRole("button", { name: "Försök igen", exact: true }).click(); await h.settle();
  await expect(h.page.getByRole("alert")).toHaveCount(0); expect(await h.visibleIds()).toEqual([h.ids.role, h.ids.proposal, h.ids.collision].sort());
});
test("[P1] 15.1-COMP-002 AC7 numeric capacity/zero budget/color/full hidden demand drilldown", async ({ schedulingViews: h }) => {
  await h.seed(); await h.open("Beläggning"); await h.applySharedFilters();
  for (const [date, demand, budget, state, ids] of [["2026-10-13", 60, 0, "overbooked-no-capacity", [h.ids.zero]], ["2026-10-15", 0, 0, "no-capacity", []], ["2026-10-14", 540, 480, "overbooked", [h.ids.hidden]]] as const) {
    const cell = visibleCell(h, date); await expect(cell).toBeVisible(); await expect(cell).toHaveAttribute("data-demand", String(demand)); await expect(cell).toHaveAttribute("data-budget", String(budget)); await expect(cell).toHaveAttribute("data-balance", String(budget - demand)); await expect(cell).toHaveAttribute("data-state", state);
    await expect(cell).toHaveClass(state.startsWith("overbooked") ? /bg-red-50/ : /bg-white/);
    if (budget) { await expect(cell).toHaveAttribute("data-occupancy", "112.5"); await expect(cell).toContainText("113 %"); }
    await expect(cell).not.toContainText(/NaN|Infinity/); if (!budget) await expect(cell).toContainText("Ingen kapacitet");
    if (demand) {
      await cell.click(); await h.settle(); await expect(h.page.getByRole("tab", { name: "Resurser", exact: true })).toHaveAttribute("aria-selected", "true");
      for (const filter of ["Arbetsroll", "Jobb", "Kund"]) await expect(h.page.getByLabel(filter, { exact: true })).toHaveValue("");
      expect(await h.visibleIds()).toEqual([...ids].sort()); await h.open("Beläggning"); await h.applySharedFilters();
    }
  }
});
test("[P1] 15.1-COMP-003 AC8 360x640 connected agenda/summary and failed save retry preserve unsent input", async ({ schedulingViews: h, resourcePage: page }, testInfo) => {
  await h.seed(); await page.setViewportSize({ width: 360, height: 640 }); await h.open("Schema");
  await expect(page.locator('[aria-label="Agenda"]:visible')).toBeVisible(); await expect(h.block(h.ids.role)).toContainText(h.scenario.assigneeLabels[0]!);
  await attachVisual(page, testInfo, "phone-agenda");
  for (const control of [page.getByRole("tab", { name: "Schema", exact: true }), page.getByLabel("Person", { exact: true }), page.getByTestId("scheduling-new-booking")]) {
    await control.scrollIntoViewIfNeeded(); const box = await control.boundingBox(); expect(box).not.toBeNull(); expect(box!.x).toBeGreaterThanOrEqual(0); expect(box!.x + box!.width).toBeLessThanOrEqual(360); await control.focus(); await expect(control).toBeFocused();
  }
  await h.open("Beläggning"); await expect(page.locator('[aria-label="Kapacitetssammanfattning"]:visible')).toBeVisible();
  await attachVisual(page, testInfo, "phone-capacity-summary");
  const before = await h.sqlBookings(); await page.getByRole("button", { name: "Välj intervall", exact: true }).click();
  const dialog = page.getByRole("dialog", { name: "Välj bokningsintervall" });
  await dialog.getByLabel("Intervall start").fill("2026-10-12T14:30"); await dialog.getByLabel("Intervall slut").fill("2026-10-12T15:00"); await dialog.getByLabel("Intervall person").selectOption(h.people[0]!); await dialog.getByRole("button", { name: "Öppna bokningseditor" }).click();
  await h.fillRequired(); const draft = h.scenario.description + " phone unsent input"; await h.editor.getByTestId("booking-description").fill(draft);
  await attachVisual(page, testInfo, "phone-editor-draft");
  const attempts: Record<string, unknown>[] = [];
  const capture = (request: import("@playwright/test").Request) => {
    if (request.method() !== "POST" || !request.headers()["next-action"]) return;
    try { const input = JSON.parse(request.postData() ?? "null")?.[0]; if (input && typeof input === "object" && "editorReview" in input) attempts.push(input); } catch { /* Unrelated request. */ }
  };
  page.on("request", capture);
  const failure = await h.failNextSaveOnce(); await h.editor.getByTestId("booking-save").click(); await failure.failed;
  await expect(h.editor.getByTestId("booking-description")).toHaveValue(draft); await expect(page.getByTestId("booking-save-status")).toHaveCount(0); expect(await h.sqlBookings()).toEqual(before);
  await h.editor.getByTestId("booking-retry").scrollIntoViewIfNeeded();
  await attachVisual(page, testInfo, "phone-editor-save-failure");
  const confirmed = await h.observeConfirmedSave(); await h.editor.getByTestId("booking-retry").click(); await confirmed.confirmed;
  page.off("request", capture); expect(attempts).toHaveLength(2); expect(attempts[1]).toEqual(attempts[0]);
  await expect(page.getByTestId("booking-save-status")).toHaveText(/sparad/i); await expect(h.editor).toHaveCount(0); expect((await h.sqlBookings()).length).toBe(before.length + 1);
  await attachVisual(page, testInfo, "phone-confirmed-retry");
});
test("[P1] 15.1-COMP-003 AC8 month density drilldown and long multi-assignee labels at 360x640", async ({ schedulingViews: h, resourcePage: page }, testInfo) => {
  await h.seed(); await h.open("Schema", "month"); const density = page.locator(`[data-testid="schema-density-day"][data-date="${DATE}"]`); await expect(density).toHaveText("5 bokningar · öppna dag"); await density.click(); await h.settle();
  expect(await h.visibleIds()).toEqual([h.ids.role, h.ids.noRole, h.ids.inactive, h.ids.proposal, h.ids.collision].sort());
  await page.setViewportSize({ width: 360, height: 640 }); await h.open("Schema");
  await expect(h.block(h.ids.role)).toContainText(h.scenario.description); for (const label of h.scenario.assigneeLabels) await expect(h.block(h.ids.role)).toContainText(label);
  await h.block(h.ids.role).scrollIntoViewIfNeeded();
  await attachVisual(page, testInfo, "phone-long-multi-assignee-labels");
});
