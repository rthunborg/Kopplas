/** Story 15.1 actual authenticated acceptance. Skips confer no coverage.
 * 14.4-E2E-006 (empty-slot click/drag portion) is exercised at both real hosts. */
import { test, expect, interval, DATE, type View, type Interval, type SchedulingViewsHarness } from "./support/scheduling-views-atdd";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { adminQuery } from "../factories/admin-sql";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import path from "node:path";
import playwrightPackage from "@playwright/test/package.json";
import * as lifecycle from "./support/scheduling-lifecycle-metadata";
const lifecyclePages = new WeakMap<TestInfo, Page>();

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
  const observedPage = lifecyclePages.get(testInfo);
  if (observedPage) lifecycle.mark(observedPage, "after-each", "enter");
  lifecyclePages.delete(testInfo);
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
  test(`[P0] 15.1-E2E-${id} AC4 actual ${host} ${gesture} persists selected person/start/end`, async ({ resourcePage: page, schedulingViews: h, bookingEditor }, testInfo) => {
    await h.seed(); await page.setViewportSize({ width: 1440, height: 1000 }); await h.open(host, "day");
    const start = "2026-10-12T14:30", end = gesture === "click" ? "2026-10-12T15:00" : "2026-10-12T16:00";
    const schemaPerson = host === "Schema" && gesture === "click" ? h.people[0]! : "";
    if (schemaPerson) await h.filter("Person", schemaPerson);
    const supplied = host === "Resurser" || schemaPerson ? [h.people[0]!] : [];
    const i = interval(start, end, supplied), slot = h.slot(host, start, h.people[0], schemaPerson);
    if (gesture === "click") { const point = await center(slot); await page.mouse.click(point.x, point.y); }
    else await selectDrag(page, slot, h.slot(host, "2026-10-12T15:30"));
    await expectEditor(h, i);
    const before = await h.sqlBookings(); await h.fillRequired();
    await expect(h.editor.getByTestId("booking-save")).toBeEnabled(); await expectEditor(h, { ...i, assigneeIds: [h.people[0]!] });
    const captureHost = host === "Schema" ? "schema" : "resources";
    let pointerCaptureError: unknown, pointerCaptureFailed = false;
    try {
      await attachVisual(page, testInfo, `${captureHost}-${gesture}-selected-editor-desktop`);
      await page.setViewportSize({ width: 360, height: 640 });
      await expectEditor(h, { ...i, assigneeIds: [h.people[0]!] });
      await attachVisual(page, testInfo, `${captureHost}-${gesture}-selected-editor-phone`);
      if(host==="Schema"&&gesture==="drag"){
        const endpointPane=h.editor.locator(".overflow-y-auto");
        const endpointScroll={dialog:await endpointPane.evaluate(node=>({x:node.scrollLeft,y:node.scrollTop})),page:await page.evaluate(()=>({x:scrollX,y:scrollY}))};
        let endpointError:unknown,endpointFailed=false;const endpointCleanup:string[]=[];
        try {
          const startInput=h.editor.getByTestId("booking-start"),endInput=h.editor.getByTestId("booking-end");
          await startInput.scrollIntoViewIfNeeded();await endInput.scrollIntoViewIfNeeded();
          const startLabel=startInput.locator(".."),endLabel=endInput.locator(".."),footer=h.editor.getByTestId("booking-save").locator("..");
          const initialStart=await startLabel.boundingBox(),pane=await endpointPane.boundingBox();
          expect(initialStart).not.toBeNull();expect(pane).not.toBeNull();
          await endpointPane.evaluate((node,delta)=>node.scrollBy({top:delta,left:0,behavior:"instant"}),initialStart!.y-Math.max(0,pane!.y)-8);
          await expect(startInput).toHaveValue("2026-10-12T14:30");await expect(endInput).toHaveValue("2026-10-12T16:00");
          await expect(footer).toBeVisible();const footerBox=await footer.boundingBox();expect(footerBox).not.toBeNull();
          expect(footerBox!.y).toBeGreaterThanOrEqual(0);expect(footerBox!.y+footerBox!.height).toBeLessThanOrEqual(640);
          for(const target of [startLabel,startInput,endLabel,endInput]){
            await expect(target).toBeVisible();const box=await target.boundingBox();expect(box).not.toBeNull();
            expect(box!.x).toBeGreaterThanOrEqual(0);expect(box!.x+box!.width).toBeLessThanOrEqual(360);
            expect(box!.y).toBeGreaterThanOrEqual(Math.max(0,pane!.y));expect(box!.y+box!.height).toBeLessThanOrEqual(Math.min(640,footerBox!.y));
          }
          await attachVisual(page,testInfo,"schema-drag-selected-editor-phone-endpoints");
        } catch(error){endpointError=error;endpointFailed=true;}
        finally {
          try {await endpointPane.evaluate((node,position)=>node.scrollTo({left:position.x,top:position.y,behavior:"instant"}),endpointScroll.dialog);expect(await endpointPane.evaluate(node=>({x:node.scrollLeft,y:node.scrollTop}))).toEqual(endpointScroll.dialog);}catch{endpointCleanup.push("dialog-scroll");}
          try {await page.evaluate(position=>window.scrollTo({left:position.x,top:position.y,behavior:"instant"}),endpointScroll.page);expect(await page.evaluate(()=>({x:scrollX,y:scrollY}))).toEqual(endpointScroll.page);}catch{endpointCleanup.push("page-scroll");}
        }
        if(endpointFailed)throw endpointError;
        if(endpointCleanup.length)throw new Error(`Schema drag endpoint restoration failed: ${endpointCleanup.join(", ")}`);
      }
    } catch (error) { pointerCaptureError = error; pointerCaptureFailed = true; }
    finally { try { await page.setViewportSize({ width: 1440, height: 1000 }); } catch (error) { if (!pointerCaptureFailed) { pointerCaptureError = error; pointerCaptureFailed = true; } } }
    if (pointerCaptureFailed) throw pointerCaptureError;
    if (host === "Schema" && gesture === "click") {
      const gate = await bookingEditor.holdNextSave();
      let saving: Promise<void> | undefined;
      let pendingError: unknown, pendingFailed = false;
      const pendingCleanup: string[] = [];
      try {
        saving = save(h);
        const saveRejected = new Promise<never>((_resolve, reject) => { void saving!.catch(reject); });
        await Promise.race([gate.started, saveRejected]);
        await expect(h.editor.getByTestId("booking-editor")).toHaveAttribute("aria-busy", "true");
        await expect(h.editor.getByTestId("booking-save")).toBeDisabled();
        await attachVisual(page, testInfo, "selected-editor-pending-desktop");
        await page.setViewportSize({ width: 360, height: 640 });
        await expect(h.editor.getByTestId("booking-editor")).toHaveAttribute("aria-busy", "true");
        await expect(h.editor.getByTestId("booking-save")).toBeDisabled();
        await attachVisual(page, testInfo, "selected-editor-pending-phone");
      } catch (error) { pendingError = error; pendingFailed = true; }
      finally {
        try { await gate.release(); } catch { pendingCleanup.push("release"); }
        try { await page.setViewportSize({ width: 1440, height: 1000 }); } catch { pendingCleanup.push("viewport"); }
        try { if (saving) await saving; } catch (error) { pendingCleanup.push("save-settlement"); if (!pendingFailed) { pendingError = error; pendingFailed = true; } }
      }
      if (pendingFailed) throw pendingError;
      if (pendingCleanup.length) throw new Error(`Selected editor capture cleanup failed: ${pendingCleanup.join(", ")}`);
    } else await save(h);
    const created = (await h.sqlBookings()).filter(row => !before.some(old => old.id === row.id));
    expect(created).toHaveLength(1);
    expect(created[0]).toMatchObject({ startsAt: i.startsAt, endsAt: i.endsAt, assigneeIds: [h.people[0]] });
    await expect(h.editor).toHaveCount(0); await h.reloadAndOpen(created[0]!.id, host, i);
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
    await h.fillRequired(); await h.cancel(); await expect(trigger).toBeFocused(); await expect(trigger).toBeVisible(); expect(await h.sqlBookings()).toEqual(before);
  });
}
test("[P1] 15.1-E2E-006 SCOPE-001 AC1 five projections, periods, filters and toolbar editor agree across later pages", async ({ schedulingViews: h }, testInfo) => {
  testInfo.setTimeout(360_000);
  await h.seed(true); await h.signIn("manager"); await h.page.setViewportSize({ width: 1440, height: 1000 });
  // DENSE-TRANSPORT-BEGIN bounded allowlist; raw input is inspected only ephemerally.
  type DenseRow = { ordinal: number; view: View; mode: "day" | "week" | "month"; phase: "open" | "sharedFilters" | "assertions" | "toolbar"; startMs: number; endMs?: number; status?: number; terminal: "pending" | "finished" | "aborted" | "failed" };
  const denseRows: DenseRow[] = [], denseRequests = new Map<import("@playwright/test").Request, DenseRow>();
  const denseCounters = { ignored: 0, malformed: 0, oversized: 0, omitted: 0, unavailable: 0 };
  const denseIncrement = (key: keyof typeof denseCounters) => { denseCounters[key] = Math.min(1_000_000, denseCounters[key] + 1); };
  const denseOrigin = new URL(h.page.url()).origin, denseEpoch = performance.now();
  let denseLastMs = 0, denseObserving = true;
  let denseContext: Pick<DenseRow, "view" | "mode" | "phase"> | undefined;
  const denseClock = () => {
    const elapsed = performance.now() - denseEpoch;
    if (!Number.isFinite(elapsed)) { denseIncrement("unavailable"); return undefined; }
    denseLastMs = Math.max(denseLastMs, Math.min(3_600_000, Math.max(0, elapsed))); return denseLastMs;
  };
  const denseRequest = (request: import("@playwright/test").Request) => {
    try {
      if (!denseObserving) return;
      if (request.method() !== "POST") { denseIncrement("ignored"); return; }
      const rawUrl = request.url(); if (rawUrl.length > 4096) { denseIncrement("oversized"); return; }
      const url = new URL(rawUrl);
      if (url.origin !== denseOrigin || url.pathname !== "/scheduling" || !request.headers()["next-action"]) { denseIncrement("ignored"); return; }
      const body = request.postData();
      if (!body || body.length > 32768 || Buffer.byteLength(body, "utf8") > 65536) { denseIncrement(body ? "oversized" : "malformed"); return; }
      let first: unknown;
      try { const parsed: unknown = JSON.parse(body); first = Array.isArray(parsed) ? parsed[0] : undefined; } catch { denseIncrement("malformed"); return; }
      if (!first || typeof first !== "object" || Array.isArray(first) || !("view" in first) || !("filters" in first) || !("mode" in first) || !denseContext) { denseIncrement("ignored"); return; }
      if (denseRows.length >= 256 || denseRequests.size >= 256) { denseIncrement("omitted"); return; }
      if (denseRequests.has(request)) return;
      const startMs = denseClock(); if (startMs === undefined) return;
      const row: DenseRow = { ordinal: denseRows.length + 1, ...denseContext, startMs, terminal: "pending" };
      denseRows.push(row); denseRequests.set(request, row);
    } catch { denseIncrement("unavailable"); }
  };
  const denseResponse = (response: import("@playwright/test").Response) => {
    try { if (!denseObserving) return; const row = denseRequests.get(response.request()); if (!row) return; const status = response.status(); if (Number.isInteger(status) && status >= 100 && status <= 599) row.status = status; } catch { denseIncrement("unavailable"); }
  };
  const denseFinished = (request: import("@playwright/test").Request) => {
    try { if (!denseObserving) return; const row = denseRequests.get(request); if (!row) return; row.terminal = "finished"; const endMs = denseClock(); if (endMs !== undefined) row.endMs = endMs; denseRequests.delete(request); } catch { denseIncrement("unavailable"); }
  };
  const denseFailed = (request: import("@playwright/test").Request) => {
    try { if (!denseObserving) return; const row = denseRequests.get(request); if (!row) return; row.terminal = "failed"; try { if (request.failure()?.errorText === "net::ERR_ABORTED") row.terminal = "aborted"; } catch { denseIncrement("unavailable"); } const endMs = denseClock(); if (endMs !== undefined) row.endMs = endMs; denseRequests.delete(request); } catch { denseIncrement("unavailable"); }
  };
  const denseListen = [() => h.page.on("request", denseRequest), () => h.page.on("response", denseResponse), () => h.page.on("requestfinished", denseFinished), () => h.page.on("requestfailed", denseFailed)];
  const denseDetach = [() => h.page.off("request", denseRequest), () => h.page.off("response", denseResponse), () => h.page.off("requestfinished", denseFinished), () => h.page.off("requestfailed", denseFailed)];
  const denseFinalize = async () => {
    denseObserving = false;
    for (const detach of denseDetach) { try { detach(); } catch { denseIncrement("unavailable"); } }
    denseRequests.clear();
    let statusElements: number | null = null, alertElements: number | null = null;
    try { if (!h.page.isClosed()) { const count = await h.page.getByRole("status").count(); if (Number.isSafeInteger(count) && count >= 0) statusElements = Math.min(1_000_000, count); } } catch { denseIncrement("unavailable"); }
    try { if (!h.page.isClosed()) { const count = await h.page.getByRole("alert").count(); if (Number.isSafeInteger(count) && count >= 0) alertElements = Math.min(1_000_000, count); } } catch { denseIncrement("unavailable"); }
    try {
      let body = Buffer.from(JSON.stringify({ schemaVersion: 1, attribution: "read-shaped-transport-only", records: denseRows, counters: denseCounters, statusElements, alertElements }));
      if (body.byteLength > 65536) { denseIncrement("omitted"); body = Buffer.from(JSON.stringify({ schemaVersion: 1, attribution: "read-shaped-transport-only", records: [], counters: denseCounters, statusElements, alertElements, outputTruncated: true })); }
      await testInfo.attach("scheduling-dense-read-transport", { body, contentType: "application/json" });
    } catch { denseIncrement("unavailable"); }
  };
  // SEMANTIC-READ-BEGIN: test-owned bounded observation, never application control.
  type SemanticEvent=Parameters<NonNullable<Parameters<typeof import("@/features/scheduling/view-model").runSchedulingRead>[1]["observe"]>>[0];
  type SemanticOwner=Awaited<ReturnType<Page["exposeBinding"]>>;
  const semanticBounds={installMs:500,disposeMs:500,attachMs:500} as const; // At most 1500ms awaited diagnostic overhead; test budget is unchanged.
  const semanticKeys=["ticket","currentTicket","ordinal","operation","phase","outcome","timeMs"];
  const semanticOperations=["lifecycle","first-read","reconcile","reconciled-read","publish","failed","finish"];
  const semanticPhases=["start","returned","threw","discarded"],semanticOutcomes=["none","no-data-error","denied","invalid","retryable","other-data-error","thrown"];
  const semanticCounters={ignoredFrame:0,invalid:0,oversized:0,omitted:0,ordinalGap:0,clockUnavailable:0,clockDiscontinuity:0,ticketDiscontinuity:0,uninstallUnavailable:0,attachUnavailable:0};
  const semanticIncrement=(key:keyof typeof semanticCounters,count=1)=>{semanticCounters[key]=Math.min(1_000_000,semanticCounters[key]+count);};
  const semanticTickets=new Map<number,{ticket:number;events:SemanticEvent[];incomplete:boolean}>();
  let semanticActive=true,semanticAcceptInstall=true,semanticCorrelated=true;
  let semanticLatest:number|null=null,semanticLastCurrent:number|null=null,semanticLastClock:number|null=null,semanticOwner:SemanticOwner|undefined;
  const semanticDisable=()=>{semanticActive=false;semanticAcceptInstall=false;};
  const semanticBound=<T,>(operation:()=>Promise<T>,milliseconds:number):Promise<{ok:true;value:T}|{ok:false}>=>new Promise(resolve=>{
    let settled=false;
    const complete=(outcome:{ok:true;value:T}|{ok:false})=>{if(settled)return;settled=true;clearTimeout(timer);resolve(outcome);};
    const timer=setTimeout(()=>complete({ok:false}),milliseconds);
    try { const pending=operation();Promise.prototype.then.call(pending,(value:T)=>complete({ok:true,value}),()=>complete({ok:false})); }
    catch { complete({ok:false}); }
  });
  const semanticDispose=async(owned:SemanticOwner)=>{
    const outcome=await semanticBound(()=>owned.dispose(),semanticBounds.disposeMs);
    if(!outcome.ok)semanticIncrement("uninstallUnavailable");
  };
  const semanticReceive=(source:{page:Page;frame:import("@playwright/test").Frame},raw:unknown)=>{
    try {
      if(!semanticActive||!semanticCorrelated){semanticIncrement("omitted");return;}
      if(source.page!==h.page||source.frame!==h.page.mainFrame()){semanticIncrement("ignoredFrame");return;}
      if(!raw||typeof raw!=="object"||Array.isArray(raw)){semanticIncrement("invalid");return;}
      const keys=Object.keys(raw);
      if(keys.length!==7||keys.some(key=>!semanticKeys.includes(key))){semanticIncrement("invalid");return;}
      const {ticket,currentTicket,ordinal,operation,phase,outcome,timeMs}=raw as Record<string,unknown>;
      if([operation,phase,outcome].some(value=>typeof value==="string"&&value.length>512)){semanticIncrement("oversized");return;}
      if(!Number.isSafeInteger(ticket)||Number(ticket)<1||Number(ticket)>1_000_000||!Number.isSafeInteger(currentTicket)||Number(currentTicket)<1||Number(currentTicket)>1_000_000||!Number.isSafeInteger(ordinal)||Number(ordinal)<1||Number(ordinal)>16||typeof operation!=="string"||!semanticOperations.includes(operation)||typeof phase!=="string"||!semanticPhases.includes(phase)||typeof outcome!=="string"||!semanticOutcomes.includes(outcome)||(timeMs!==null&&(typeof timeMs!=="number"||!Number.isFinite(timeMs)||timeMs<0||timeMs>3_600_000))){semanticIncrement("invalid");return;}
      const event:SemanticEvent={ticket:ticket as number,currentTicket:currentTicket as number,ordinal:ordinal as number,operation:operation as SemanticEvent["operation"],phase:phase as SemanticEvent["phase"],outcome:outcome as SemanticEvent["outcome"],timeMs:timeMs as number|null};
      if(Buffer.byteLength(JSON.stringify(event),"utf8")>512){semanticIncrement("oversized");return;}
      if((semanticLastCurrent!==null&&event.currentTicket<semanticLastCurrent)||event.ticket>event.currentTicket){semanticIncrement("ticketDiscontinuity");semanticCorrelated=false;for(const row of semanticTickets.values())row.incomplete=true;return;}
      if(event.timeMs!==null&&semanticLastClock!==null&&event.timeMs<semanticLastClock){semanticIncrement("clockDiscontinuity");semanticCorrelated=false;for(const row of semanticTickets.values())row.incomplete=true;return;}
      semanticLastCurrent=event.currentTicket;if(event.timeMs!==null)semanticLastClock=event.timeMs;
      let row=semanticTickets.get(event.ticket);
      if(!row){
        if(semanticTickets.size===8){const oldest=Math.min(...semanticTickets.keys());if(event.ticket<oldest){semanticIncrement("omitted");return;}semanticIncrement("omitted",semanticTickets.get(oldest)!.events.length||1);semanticTickets.delete(oldest);}
        row={ticket:event.ticket,events:[],incomplete:false};semanticTickets.set(event.ticket,row);
      }
      const previous=row.events.at(-1)?.ordinal??0;
      if(row.events.length>=16){row.incomplete=true;semanticIncrement("omitted");return;}
      if(event.ordinal!==previous+1||(previous===0&&(event.operation!=="lifecycle"||event.phase!=="start"))){row.incomplete=true;semanticIncrement("ordinalGap");if(event.ordinal<=previous)return;}
      if(event.timeMs===null){row.incomplete=true;semanticIncrement("clockUnavailable");}
      row.events.push(event);semanticLatest=Math.max(semanticLatest??0,event.ticket);
    } catch { semanticIncrement("invalid"); }
  };
  const semanticInstall=async()=>{
    const outcome=await semanticBound(()=>{
      const pending=h.page.exposeBinding("__kopplasSchedulingReadSemanticV1",semanticReceive);
      Promise.prototype.then.call(pending,(owned:SemanticOwner)=>{
        if(!semanticAcceptInstall||!semanticActive){void semanticDispose(owned).catch(()=>semanticIncrement("uninstallUnavailable"));}
        else semanticOwner=owned;
      },()=>{});
      return pending;
    },semanticBounds.installMs);
    if(!outcome.ok){semanticDisable();semanticIncrement("uninstallUnavailable");}
  };
  const semanticFinalize=async()=>{
    semanticDisable();
    const owned=semanticOwner;semanticOwner=undefined;
    if(owned)await semanticDispose(owned);
    const envelope=()=>({schemaVersion:1,attribution:"owned-client-read-lifecycle-only",latestObservedTicket:semanticLatest,tickets:[...semanticTickets.values()].sort((a,b)=>a.ticket-b.ticket),counters:semanticCounters,observationClosed:true});
    try {
      let body=Buffer.from(JSON.stringify(envelope()));
      while(body.byteLength>65536&&semanticTickets.size>1){const oldest=Math.min(...semanticTickets.keys());semanticIncrement("omitted",semanticTickets.get(oldest)!.events.length||1);semanticTickets.delete(oldest);body=Buffer.from(JSON.stringify(envelope()));}
      if(body.byteLength>65536){semanticIncrement("attachUnavailable");return;}
      const attached=await semanticBound(()=>testInfo.attach("scheduling-dense-read-semantic",{body,contentType:"application/json"}),semanticBounds.attachMs);
      if(!attached.ok)semanticIncrement("attachUnavailable");
    } catch { semanticIncrement("attachUnavailable"); }
  };
  // SEMANTIC-READ-END
  // DENSE-FUNCTIONAL-BEGIN: same-document continuous closure; no functional event stream leaves the page.
  type DenseGate = { readonly owner: string; baseline: () => Promise<1>; arm: () => 0; wait: () => Promise<1>; check: (complete: boolean) => 0; disable: () => 0 };
  let functionalOwner: string | undefined, functionalAccept = true;
  let functionalInstallPending: Promise<{ dispose: () => Promise<void> }> | undefined, functionalScript: { dispose: () => Promise<void> } | undefined;
  let functionalDisposal: Promise<void> | undefined, functionalCleanup: { clear: Promise<unknown>; script: Promise<unknown> } | undefined;
  let functionalFailure: Error | undefined;
  const functionalUnavailable = () => new Error("Required Dense scheduling phase unavailable.");
  const functionalRecordFailure = () => { functionalFailure ??= functionalUnavailable(); };
  const functionalEvaluate = (operation: "baseline" | "arm" | "wait" | "check" | "complete" | "disable") => {
    const pending = h.page.evaluate(({ operation, owner }) => {
      const target = window as Window & { __kopplasSchedulingDenseGateV1?: DenseGate };
      const descriptor = Object.getOwnPropertyDescriptor(target, "__kopplasSchedulingDenseGateV1");
      const gate = descriptor && "value" in descriptor ? descriptor.value as DenseGate : undefined;
      if (typeof owner !== "string" || !gate || Object.getOwnPropertyDescriptor(gate, "owner")?.value !== owner) throw new Error("Required Dense scheduling phase unavailable.");
      if (operation === "baseline") return gate.baseline();
      if (operation === "arm") return gate.arm();
      if (operation === "wait") return gate.wait();
      if (operation === "check" || operation === "complete") return gate.check(operation === "complete");
      return gate.disable();
    }, { operation, owner: functionalOwner }).catch(() => { throw functionalUnavailable(); });
    void pending.catch(() => {}); // Rejection observation does not cancel an evaluate command.
    return pending;
  };
  const functionalDispose = (owned: { dispose: () => Promise<void> }) => {
    if (!functionalDisposal) {
      try { functionalDisposal = owned.dispose(); } catch { functionalDisposal = Promise.reject(functionalUnavailable()); }
      void functionalDisposal.catch(functionalRecordFailure);
    }
    return functionalDisposal;
  };
  const functionalBeginCleanup = () => {
    functionalAccept = false;
    if (!functionalCleanup) {
      const initiate = (operation: () => Promise<unknown>) => {
        let pending: Promise<unknown>;
        try { pending = operation(); } catch { pending = Promise.reject(functionalUnavailable()); }
        void pending.catch(functionalRecordFailure);
        return pending;
      };
      // Start current-state release and future-script removal independently, without awaiting a phase.
      const clear = initiate(() => functionalEvaluate("disable"));
      const script = initiate(async () => {
        const owned = functionalScript ?? await functionalInstallPending;
        if (!owned) throw functionalUnavailable();
        await functionalDispose(owned);
      });
      functionalCleanup = { clear, script };
    }
    return functionalCleanup;
  };
  const installDenseGate = () => {
    functionalOwner ??= globalThis.crypto.randomUUID();
    const pending = h.page.addInitScript(({ origin, owner }) => {
      if (window !== window.top || window.location.origin !== origin || window.location.pathname !== "/scheduling") return;
      const target = window as Window & { __kopplasSchedulingReadSemanticV1?: (event: unknown) => unknown; __kopplasSchedulingDenseGateV1?: DenseGate };
      const key = "__kopplasSchedulingReadSemanticV1", stateKey = "__kopplasSchedulingDenseGateV1", document = window.document;
      if (stateKey in target) return; // A foreign state is never overwritten or adopted.
      const prior = Object.getOwnPropertyDescriptor(target, key);
      const unavailable = () => new Error("Required Dense scheduling phase unavailable.");
      type Ticket = { step: number; revised: boolean };
      const active = new Map<number, Ticket>(); // Never evict unfinished work to manufacture availability.
      let fault = false, disabled = false, started = 0, successful = 0, armed: number | undefined;
      let waiter: { kind: "baseline" | "action"; promise: Promise<1>; resolve: (value: 1) => void; reject: (error: Error) => void } | undefined;
      const poison = () => { fault = true; waiter?.reject(unavailable()); waiter = undefined; };
      const owns = () => window.document === document && window === window.top && window.location.origin === origin && window.location.pathname === "/scheduling"
        && Object.getOwnPropertyDescriptor(target, stateKey)?.value === gate && Object.getOwnPropertyDescriptor(target, key)?.value === wrapper;
      const guard = () => { if (fault || disabled || !owns()) throw unavailable(); };
      const idle = () => started > 0 && active.size === 0 && successful === started;
      const actionComplete = () => armed !== undefined && started === armed && idle();
      const flush = () => {
        if (waiter && (waiter.kind === "baseline" ? armed === undefined && idle() : actionComplete())) {
          const owned = waiter; waiter = undefined; owned.resolve(1);
        }
      };
      const wait = (kind: "baseline" | "action") => {
        guard();
        if (started === 0 || (kind === "baseline" ? armed !== undefined : armed === undefined)) throw unavailable();
        if (kind === "baseline" ? idle() : actionComplete()) return Promise.resolve<1>(1);
        if (waiter) throw unavailable();
        let resolve!: (value: 1) => void, reject!: (error: Error) => void;
        const promise = new Promise<1>((yes, no) => { resolve = yes; reject = no; });
        void promise.catch(() => {});
        waiter = { kind, promise, resolve, reject }; return promise;
      };
      const gate: DenseGate = {
        owner,
        baseline: () => wait("baseline"),
        arm: () => { guard(); if (!idle() || armed !== undefined || waiter) throw unavailable(); armed = started + 1; return 0; },
        wait: () => wait("action"),
        check: complete => { guard(); if (!actionComplete() || waiter) throw unavailable(); if (complete) armed = undefined; return 0; },
        disable: () => {
          let valid = !fault && !disabled && owns() && armed === undefined && idle() && !waiter;
          disabled = true; waiter?.reject(unavailable()); waiter = undefined; active.clear(); started = 0; successful = 0; armed = undefined;
          try {
            if (Object.getOwnPropertyDescriptor(target, key)?.value === wrapper && prior) Object.defineProperty(target, key, prior);
            else valid = false;
          } catch { valid = false; }
          try { if (Object.getOwnPropertyDescriptor(target, stateKey)?.value === gate) delete target.__kopplasSchedulingDenseGateV1; else valid = false; } catch { valid = false; }
          if (!valid) throw unavailable(); return 0;
        },
      };
      const receive = (raw: unknown) => {
        try {
          if (fault || disabled || !owns() || !raw || typeof raw !== "object" || Array.isArray(raw)) { poison(); return; }
          const descriptors = Object.getOwnPropertyDescriptors(raw), keys = ["ticket", "currentTicket", "ordinal", "operation", "phase", "outcome", "timeMs"];
          if (Reflect.ownKeys(descriptors).length !== 7 || keys.some(key => !descriptors[key] || !("value" in descriptors[key]!))) { poison(); return; }
          const event = raw as { ticket: number; currentTicket: number; ordinal: number; operation: string; phase: string; outcome: string; timeMs: number | null };
          if (!Number.isSafeInteger(event.ticket) || event.ticket < 1 || event.ticket > 1_000_000 || !Number.isSafeInteger(event.currentTicket) || !Number.isSafeInteger(event.ordinal) || event.ordinal < 1 || event.ordinal > 16
            || !(event.timeMs === null || typeof event.timeMs === "number" && Number.isFinite(event.timeMs) && event.timeMs >= 0 && event.timeMs <= 3_600_000)) { poison(); return; }
          if (event.operation === "lifecycle" && event.phase === "start") {
            if (event.ordinal !== 1 || event.ticket !== started + 1 || event.currentTicket !== event.ticket || active.size >= 32 || (armed !== undefined && event.ticket !== armed)) { poison(); return; }
            started = event.ticket; active.set(event.ticket, { step: 0, revised: false });
          }
          const row = active.get(event.ticket);
          if (!row || event.currentTicket !== started || event.ordinal !== row.step + 1) { poison(); return; }
          if (event.operation === "lifecycle" && event.phase === "discarded" && event.ticket < started && event.outcome === "none"
            && (row.step === 4 || row.revised && row.step === 8)) {
            if (armed === event.ticket) { poison(); return; }
            active.delete(event.ticket); flush(); return;
          }
          if (row.step === 6 && event.operation === "reconciled-read" && event.phase === "start") row.revised = true;
          const order = ["lifecycle/start", "lifecycle/returned", "first-read/start", "first-read/returned", "reconcile/start", "reconcile/returned",
            ...(row.revised ? ["reconciled-read/start", "reconciled-read/returned"] : []), "publish/start", "publish/returned", "finish/start", "finish/returned"];
          const expectedOutcome = event.phase === "returned" && (event.operation === "first-read" || event.operation === "reconciled-read") ? "no-data-error" : "none";
          if (typeof event.operation !== "string" || typeof event.phase !== "string" || `${event.operation}/${event.phase}` !== order[row.step] || event.outcome !== expectedOutcome) { poison(); return; }
          row.step++;
          if (row.step === order.length) {
            if (event.ticket !== started) { poison(); return; }
            successful = event.ticket; active.delete(event.ticket); flush();
          }
        } catch { poison(); }
      };
      const wrapper = function(this: unknown, event: unknown) {
        "use strict";
        receive(event);
        try {
          const returned: unknown = Reflect.apply(prior!.value, this, [event]);
          if (returned !== undefined) {
            try {
              const branch = Promise.prototype.then.call(returned, () => {}, () => { poison(); });
              void Promise.prototype.then.call(branch, undefined, () => { poison(); });
            } catch { poison(); } // No arbitrary thenable getter/call or assimilation.
          }
          return returned;
        } catch (error) { poison(); throw error; }
      };
      Object.freeze(gate);
      Object.defineProperty(target, stateKey, { value: gate, configurable: true });
      if (!prior || !("value" in prior) || typeof prior.value !== "function" || !prior.configurable) { poison(); return; }
      try { Object.defineProperty(target, key, { ...prior, value: wrapper }); } catch { poison(); }
    }, { origin: denseOrigin, owner: functionalOwner });
    functionalInstallPending = pending;
    void pending.then(owned => {
      functionalScript = owned;
      if (!functionalAccept) { void functionalDispose(owned).catch(functionalRecordFailure); }
    }, functionalRecordFailure).catch(functionalRecordFailure);
    return pending;
  };
  // DENSE-FUNCTIONAL-END
  let densePrimary: unknown, denseHasPrimary = false;
  try {
    for (const listen of denseListen) { try { listen(); } catch { denseIncrement("unavailable"); } }
  // DENSE-TRANSPORT-END setup
  try { await semanticInstall(); } catch { semanticDisable();semanticIncrement("uninstallUnavailable"); }
  if (!semanticActive || !semanticOwner) throw functionalUnavailable();
  await installDenseGate();
  const shared = [h.ids.role, h.ids.proposal, h.ids.collision, ...h.laterIds].sort();
  for (const [view, modes] of [["Schema", ["day", "week", "month"]], ["Resurser", ["day", "week"]], ["Team", ["week"]], ["Beläggning", ["day", "week", "month"]], ["Min kalender", ["day", "week"]]] as [View, ("day" | "week" | "month")[]][]) {
    for (const mode of modes) {
      denseContext = { view, mode, phase: "open" };
      if (view === "Schema" && mode === "day") {
        await h.open(view, mode);
      } else {
        const viewIds: Record<View, string> = { Schema: "schema", Resurser: "resources", Team: "team", Beläggning: "capacity", "Min kalender": "personal" };
        const tab = h.page.getByTestId(`scheduling-view-${viewIds[view]}`);
        await expect(tab).toHaveCount(1);
        await expect(tab).toHaveJSProperty("tagName", "BUTTON");
        await expect(tab).toHaveAttribute("role", "tab");
        await expect(tab).toBeVisible();
        await expect(tab).toBeEnabled();
        const selected = await tab.getAttribute("aria-selected");
        expect(selected === "true" || selected === "false").toBe(true);
        if (selected === "false") await tab.click();
        await h.settle();
        await expect(tab).toHaveAttribute("aria-selected", "true");
        const date = h.page.getByLabel("Datum", { exact: true });
        await expect(date).toHaveCount(1);
        await expect(date).toHaveJSProperty("tagName", "INPUT");
        await expect(date).toHaveJSProperty("type", "date");
        await expect(date).toBeVisible();
        await expect(date).toBeEnabled();
        const currentDate = await date.inputValue();
        expect(typeof currentDate === "string").toBe(true);
        if (currentDate !== DATE) await date.fill(DATE);
        await h.settle();
        await expect(date).toHaveValue(DATE);
        const period = h.page.getByLabel("Period", { exact: true });
        await expect(period).toHaveCount(1);
        await expect(period).toHaveJSProperty("tagName", "SELECT");
        await expect(period).toBeVisible();
        await expect(period).toBeEnabled();
        const currentMode = await period.inputValue();
        const allowedModes: readonly string[] = view === "Team" ? ["week"] : view === "Resurser" || view === "Min kalender" ? ["day", "week"] : ["day", "week", "month"];
        expect(allowedModes.includes(currentMode)).toBe(true);
        if (currentMode !== mode) await period.selectOption(mode);
        await h.settle();
        await expect(period).toHaveValue(mode);
      }
      denseContext = { view, mode, phase: "sharedFilters" };
      for(const [label,desired] of [["Person",h.people[0]!],["Arbetsroll",h.scenario.workRoleId],["Jobb",h.scenario.jobId],["Kund",h.scenario.customerId]] as const){
        const filter=h.page.getByLabel(label,{exact:true});
        await expect(filter).toHaveCount(1);
        await expect(filter).toHaveJSProperty("tagName","SELECT");
        await expect(filter).toBeVisible();
        await expect(filter).toBeEnabled();
        const changed = await filter.inputValue()!==desired;
        if(changed) {
          await functionalEvaluate("baseline"); await functionalEvaluate("arm");
          await h.page.getByLabel(label,{exact:true}).selectOption(desired);
          await functionalEvaluate("wait"); await functionalEvaluate("check");
          await h.settle();
        }
        await expect(filter).toHaveValue(desired);
        if(changed) await functionalEvaluate("complete");
      }
      denseContext = { view, mode, phase: "assertions" };
      if (view === "Beläggning") await expect(visibleCell(h, DATE)).toContainText("Bokat 210 min / budget 480 min");
      else if (view === "Schema" && mode === "month") {
        await h.page.locator(`[data-testid="schema-density-day"][data-date="${DATE}"]`).click(); await h.settle();
        expect(await h.visibleIds()).toEqual([h.ids.role, h.ids.proposal, h.ids.collision].sort());
      } else {
        const expected = view === "Min kalender" ? [h.ids.role] : mode === "day" ? [h.ids.role, h.ids.proposal, h.ids.collision].sort() : shared;
        expect(await h.visibleIds()).toEqual(expected);
        if (view === "Min kalender") await expect(h.page.locator(`[aria-label="${mode === "day" ? "Egen agenda" : "Egen veckokalender"}"]:visible`)).toBeVisible();
      }
      if (mode === "week") {
        if (view === "Schema" || view === "Resurser" || view === "Min kalender") {
          await h.block(h.ids.role).scrollIntoViewIfNeeded();
        }
        await attachVisual(h.page, testInfo, ({ Schema: "desktop-schema-week", Resurser: "desktop-resources-week", Team: "desktop-team-week", Beläggning: "desktop-capacity-week", "Min kalender": "desktop-personal-calendar-week" })[view]);
      }
      denseContext = { view, mode, phase: "toolbar" };
      const before = await h.sqlBookings(), trigger = h.page.getByTestId("scheduling-new-booking");
      await trigger.click(); await expect(h.editor).toBeVisible();
      await functionalEvaluate("baseline"); await functionalEvaluate("arm");
      await h.editor.getByTestId("booking-close").click();
      const discard = h.page.getByTestId("booking-discard");
      if (await discard.isVisible()) await discard.click();
      await expect(h.editor).toHaveCount(0);
      await functionalEvaluate("wait"); await functionalEvaluate("check");
      await h.settle();
      await expect(trigger).toBeFocused();
      await functionalEvaluate("complete");
      expect(await h.sqlBookings()).toEqual(before);
    }
  }
  const released = functionalBeginCleanup();
  await Promise.all([released.clear, released.script]); // Confirm owned restoration before diagnostic binding disposal on success.
  if (functionalFailure) throw functionalFailure;
  } catch (error) { densePrimary = error; denseHasPrimary = true; }
  finally {
    const released = functionalBeginCleanup();
    semanticDisable();
    // Start every original finalizer even if an owned release or another finalizer never settles.
    const semanticFinal = semanticFinalize().catch(() => { semanticIncrement("uninstallUnavailable"); });
    const transportFinal = denseFinalize().catch(() => { /* Optional diagnostics cannot replace the test failure. */ });
    try { await Promise.all([released.clear, released.script]); } catch { functionalRecordFailure(); }
    await Promise.all([semanticFinal, transportFinal]);
  }
  if (denseHasPrimary) throw densePrimary;
  if (functionalFailure) throw functionalFailure;
});


// This delivery controller never supplies native identity or functional evidence.
// Original public Request/Response, finished()->text(), phase gates and failures remain authoritative.
function roleDeliveryRequire(ok: unknown): asserts ok { if (!ok) throw new Error("Required scheduling response delivery unavailable."); }
async function roleDeliveryWithin<T>(work: Promise<T>, ms = 3000): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try { return await Promise.race([work, new Promise<never>((_, no) => { timer = setTimeout(() => no(new Error("Required scheduling response delivery unavailable.")), Math.max(0, ms)); })]); }
  finally { clearTimeout(timer); }
}
function roleDeliveryBytes(text: string, encoded: boolean, cap: number) {
  if (encoded) {
    roleDeliveryRequire(text.length <= 4 * Math.ceil(cap / 3) && /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text));
    const bytes = Buffer.from(text, "base64");
    roleDeliveryRequire(bytes.length <= cap && bytes.toString("base64") === text); return bytes;
  }
  roleDeliveryRequire(text.length <= cap && Buffer.byteLength(text, "utf8") <= cap);
  const bytes = Buffer.from(text, "utf8"); roleDeliveryRequire(bytes.toString("utf8") === text); return bytes;
}
function roleDeliveryHeaders(input: { name: string; value: string }[] | undefined) {
  roleDeliveryRequire(input && input.length <= 64);
  const selected = new Map<string, string>(); let total = 0;
  for (const { name, value } of input) {
    roleDeliveryRequire(typeof name === "string" && typeof value === "string"); total += Buffer.byteLength(name) + Buffer.byteLength(value) + 4;
    roleDeliveryRequire(total <= 16384 && /^[!#$%&'*+.^_\x60|~0-9A-Za-z-]+$/.test(name) && !/[^\t\x20-\x7e]/.test(value));
    const key = name.toLowerCase();
    roleDeliveryRequire(!["set-cookie", "set-cookie2", "location", "x-action-redirect", "trailer", "upgrade"].includes(key));
    if (!["content-type", "content-encoding", "content-length", "transfer-encoding", "x-action-revalidated", "x-nextjs-postponed", "x-nextjs-stale-time", "x-action-not-found"].includes(key)) continue;
    roleDeliveryRequire(!selected.has(key)); selected.set(key, value.trim());
  }
  roleDeliveryRequire(/^text\/x-component(?:;\s*charset=utf-8)?$/i.test(selected.get("content-type") ?? ""));
  const encoding = selected.get("content-encoding")?.toLowerCase() ?? "identity", length = selected.get("content-length"), transfer = selected.get("transfer-encoding");
  roleDeliveryRequire(["identity", "gzip", "br"].includes(encoding) && (length === undefined || /^(0|[1-9][0-9]{0,8})$/.test(length)));
  roleDeliveryRequire(transfer === undefined || (transfer.toLowerCase() === "chunked" && length === undefined));
  roleDeliveryRequire(encoding === "identity" || length === undefined);
  roleDeliveryRequire(!selected.has("x-nextjs-postponed") && !selected.has("x-action-not-found"));
  const expected = length === undefined ? undefined : Number(length); roleDeliveryRequire(expected === undefined || expected <= 262144);
  for (const key of ["content-encoding", "transfer-encoding", "content-length"]) selected.delete(key);
  return { expected, headers: [...selected].map(([name, value]) => ({ name, value })) };
}
function createRoleResponseDelivery(session: import("@playwright/test").CDPSession, origin: string, frame: string, retain: (error: unknown) => void, closeOwnedPage: () => Promise<void>) {
  const unavailable = new Error("Required scheduling response delivery unavailable.");
  let accepting = true, enabled = false, broken = false, phase: { date: string; admitted: number; fulfilled: number } | undefined;
  let phases = 0, totalBytes = 0, reads = 0, nonTargets = 0, pendingTargets = 0, taking = 0, closed = false;
  const pending = new Set<Promise<void>>(), streams = new Set<string>(), ids = new Set<string>();
  const streamClosers = new Set<() => Promise<void>>(); // Bounded by the existing four eligible acquisitions.
  let releasing: Promise<void> | undefined, serial: Promise<void> = Promise.resolve();
  const fail = () => { broken = true; try { retain(unavailable); } catch { /* Existing arbiter cannot be replaced by optional diagnostics. */ } };
  const check = () => { roleDeliveryRequire(accepting && enabled && !broken); };
  const onClose = () => { closed = true; if (accepting) fail(); };
  // Parse and discard event-only raw request/header fields synchronously; retain only bounded command/control input.
  const classify = (event: { requestId: string; frameId: string; request: { url: string; method: string; headers: Record<string, string>; postData?: string }; responseStatusCode?: number; responseErrorReason?: string; redirectedRequestId?: string; responseHeaders?: {name:string;value:string}[] }) => {
    roleDeliveryRequire(typeof event.requestId === "string" && event.requestId.length > 0 && event.requestId.length <= 256);
    const id = event.requestId, url = new URL(event.request.url);
    if (url.origin !== origin || url.pathname !== "/scheduling" || event.request.method !== "POST") return { id, target: false as const };
    const keys = Object.keys(event.request.headers); roleDeliveryRequire(keys.length <= 64);
    const action = keys.filter(key => key.toLowerCase() === "next-action");
    if (!action.length) return { id, target: false as const };
    roleDeliveryRequire(action.length === 1 && !!event.request.headers[action[0]!]);
    // This is independent eligibility only. The helper's original expected-input public Request Set remains the authority.
    const raw = event.request.postData; roleDeliveryRequire(typeof raw === "string" && Buffer.byteLength(raw) <= 4096);
    const input: unknown = JSON.parse(raw), first = Array.isArray(input) ? input[0] : undefined;
    const exact = (value: unknown, names: string[]): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value) && Object.keys(value).length === names.length && names.every(key => Object.hasOwn(value, key));
    roleDeliveryRequire(Array.isArray(input) && input.length === 1 && raw.trim() === JSON.stringify(input) && exact(first, ["view", "mode", "date", "filters"]));
    roleDeliveryRequire(phase && event.frameId === frame && !event.redirectedRequestId && !event.responseErrorReason && event.responseStatusCode === 200);
    roleDeliveryRequire(first.view === "personal" && first.mode === "week" && first.date === phase.date);
    const filters = first.filters; roleDeliveryRequire(exact(filters, ["personIds", "workRoleIds", "jobIds", "customerIds", "status"]) && filters.status === "planned");
    roleDeliveryRequire(["personIds", "workRoleIds", "jobIds", "customerIds"].every(key => Array.isArray(filters[key]) && filters[key].length === 0));
    roleDeliveryRequire(!ids.has(id) && ids.size < 4 && phase.admitted < 2); const headers = roleDeliveryHeaders(event.responseHeaders);
    ids.add(id); phase.admitted++; return { id, target: true as const, ownedPhase: phase, ...headers };
  };
  const onPaused = (event: Parameters<typeof classify>[0]) => {
    if (!accepting) { fail(); return; }
    let selected: ReturnType<typeof classify>;
    try { check(); roleDeliveryRequire(pending.size < 64); selected = classify(event); }
    catch { fail(); return; } // Unknown ownership is never guessed or silently continued.
    let bodyTaken = false;
    const run = async () => {
      check(); // A queued/late body cannot start acquisition after disable.
      if (!selected.target) { roleDeliveryRequire(++nonTargets <= 64); await roleDeliveryWithin(session.send("Fetch.continueRequest", { requestId: selected.id })); return; }
      pendingTargets++; taking++; let body: Buffer | undefined, expired = false;
      let acquired: { handle: string; close: () => Promise<void> } | undefined;
      const register = (reply: { stream: string }) => {
        const handle = reply.stream;
        roleDeliveryRequire(typeof handle === "string" && handle.length > 0 && handle.length <= 256);
        if (acquired) { roleDeliveryRequire(acquired.handle === handle); return acquired; }
        roleDeliveryRequire(!streams.has(handle)); streams.add(handle);
        let closing: Promise<void> | undefined;
        const close = (): Promise<void> => {
          if (!closing) {
            try {
              closing = roleDeliveryWithin(session.send("IO.close", { handle })).then(() => {
                streams.delete(handle); streamClosers.delete(close);
              }, () => { fail(); throw unavailable; });
            } catch { fail(); closing = Promise.reject(unavailable); }
            void closing.catch(() => fail());
          }
          return closing;
        };
        acquired = { handle, close }; streamClosers.add(close); return acquired;
      };
      try {
        const acquisition = session.send("Fetch.takeResponseBodyAsStream", { requestId: selected.id });
        // Register the owned close obligation BEFORE state rejection. Timeout does not cancel acquisition.
        void acquisition.then(reply => {
          let owned: ReturnType<typeof register>;
          try { owned = register(reply); } catch { fail(); return; }
          if (!accepting || broken || expired) void owned.close().catch(() => fail());
        }, () => fail()).catch(() => fail());
        const reply = await roleDeliveryWithin(acquisition);
        const owned = register(reply); // Same cached registration as the settlement handler, even when broken/expired.
        check(); bodyTaken = true;
        const handle = owned.handle;
        body = Buffer.alloc(262144); let used = 0, eof = false; const deadline = performance.now() + 10000;
        while (!eof) {
          check(); roleDeliveryRequire(++reads <= 32); const remaining = deadline - performance.now(); roleDeliveryRequire(remaining > 0);
          const chunk = await roleDeliveryWithin(session.send("IO.read", { handle, size: 16384 }), Math.min(3000, remaining));
          check(); roleDeliveryRequire(typeof chunk.data === "string" && typeof chunk.eof === "boolean" && (chunk.base64Encoded === undefined || typeof chunk.base64Encoded === "boolean"));
          const bytes = roleDeliveryBytes(chunk.data, chunk.base64Encoded === true, 16384);
          roleDeliveryRequire((bytes.length > 0 || chunk.eof) && totalBytes + bytes.length <= 262144 && used + bytes.length <= body.length);
          totalBytes += bytes.length; bytes.copy(body, used); used += bytes.length; eof = chunk.eof;
        }
        await owned.close(); taking--;
        check(); roleDeliveryRequire(used > 0 && (selected.expected === undefined || selected.expected === used));
        const data = body.subarray(0, used).toString("base64"); roleDeliveryRequire(data.length <= 4 * Math.ceil(262144 / 3));
        // Release is independent ofâ€”and precedes the client result that waits forâ€”this delivery.
        await roleDeliveryWithin(session.send("Fetch.fulfillRequest", { requestId: selected.id, responseCode: 200, responseHeaders: [...selected.headers, { name: "content-length", value: String(used) }], body: data }));
        check(); roleDeliveryRequire(phase === selected.ownedPhase); selected.ownedPhase.fulfilled++;
      } catch (error) {
        expired = true;
        if (acquired) void acquired.close().catch(() => fail());
        throw error;
      } finally { body?.fill(0); pendingTargets--; }
    };
    // At most two response bodies are eligible in a phase. Serialize acquisition, not client completion,
    // so only one fixed256KiB held buffer exists; aggregate bytes/reads remain shared across both phases.
    const task = selected.target ? serial.then(run) : run();
    const work = task.catch(() => { fail(); if (!bodyTaken && accepting) { /* No speculative command on an uncertain takeover. Original finalizer closes the owned Page. */ } });
    if (selected.target) serial = work;
    pending.add(work); void work.then(() => pending.delete(work), () => pending.delete(work));
  };
  session.on("Fetch.requestPaused", onPaused); session.on("close", onClose);
  return {
    async enable() { try { await roleDeliveryWithin(session.send("Fetch.enable", { patterns: [{ urlPattern: origin + "/scheduling*", requestStage: "Response" }] })); enabled = true; check(); } catch { fail(); throw unavailable; } },
    arm(date: string) { check(); roleDeliveryRequire(!phase && pendingTargets === 0 && phases < 2 && /^\d{4}-\d{2}-\d{2}$/.test(date) && new Date(date + "T00:00:00Z").toISOString().slice(0,10) === date); phase = { date, admitted: 0, fulfilled: 0 }; phases++; },
    async complete() { check(); const owned = phase; roleDeliveryRequire(owned); await roleDeliveryWithin(Promise.all([...pending])); check(); roleDeliveryRequire(phase === owned && pendingTargets === 0 && owned.admitted >= 1 && owned.admitted <= 2 && owned.fulfilled === owned.admitted); phase = undefined; },
    dispose(success: boolean) {
      if (!releasing) {
        const valid = !broken && enabled && !phase && pendingTargets === 0 && pending.size === 0 && taking === 0 && streams.size === 0 && phases === 2;
        accepting = false; // Disable synchronously before invoking any owned cleanup.
        let detachFault = false;
        try { session.off("Fetch.requestPaused", onPaused); } catch { detachFault = true; fail(); }
        try { session.off("close", onClose); } catch { detachFault = true; fail(); }
        releasing = (async () => {
          if (!success || taking > 0 || pendingTargets > 0 || !valid) {
            // Initiate every registered owned stream close independently; cached close prevents duplicate IO.close.
            void Promise.allSettled([...streamClosers].map(close => close())).then(results => {
              if (results.some(result => result.status === "rejected")) fail();
            }).catch(() => fail());
            // Stream takeover forbids continuation while incomplete. Initiate the SAME cached original owned close;
            // independent original gate/SQL/Auth/Booking finalizers must already be started by the caller.
            let closing: Promise<void>;
            try { closing = closeOwnedPage(); } catch (error) { try { retain(error); } catch {} fail(); throw unavailable; }
            // Late close settlement still owns detach, but an unconfirmed close cannot authorize changing an incomplete request.
            void closing.then(() => session.detach(), error => { try { retain(error); } catch {} fail(); }).catch(() => fail());
            try { await roleDeliveryWithin(closing); } catch (error) { try { retain(error); } catch {} fail(); }
            // Closed-target cleanup is not successful method release; always refuse this branch.
            throw unavailable;
          }
          // Both phases and original native/client gates completed. No pending body command may be disabled.
          const results = await Promise.allSettled([
            ...[...streamClosers].map(close => close()),
            roleDeliveryWithin(session.send("Fetch.disable")),
          ]);
          const removed = results.every(result => result.status === "fulfilled");
          try { await roleDeliveryWithin(session.detach()); } catch { fail(); }
          if (!removed || detachFault || broken || closed) throw unavailable;
        })();
        void releasing.catch(() => fail());
      }
      return releasing;
    },
  };
}


// The transport owns raw in-memory protocol data. Apply the already-qualified E09 recorder boundary only to this case.
const roleResponseTest = test.extend<{ _setupArtifacts: void; _combinedContextOptions: Record<string, unknown>; _optionContextReuseMode: string }>({
  _setupArtifacts: async ({ playwright, _combinedContextOptions, _optionContextReuseMode }, provide, testInfo) => {
    const version = playwrightPackage.version;
    if (version !== "1.61.1" || process.env.DEBUG || process.env.DEBUG_FILE || process.env.PWDEBUG || process.env.NODE_DEBUG || process.env.PW_TEST_REUSE_CONTEXT || _optionContextReuseMode !== "none") throw new Error("Required scheduling response recording boundary unavailable.");
    // The runner may already have initialized in-memory retry tracing. Disable it before any context or sensitive command.
    type CaseTracing = { startIfNeeded: (value: "off") => Promise<void>; traceOptions: () => unknown; _shouldCaptureTrace: () => boolean; _options?: unknown; _liveTraceFile?: unknown; _temporaryTraceFiles: unknown[]; _traceEvents: unknown[] };
    const tracing = (testInfo as unknown as { _tracing?: CaseTracing })._tracing;
    if (!tracing || typeof tracing.startIfNeeded !== "function" || typeof tracing.traceOptions !== "function" || typeof tracing._shouldCaptureTrace !== "function" || !Array.isArray(tracing._temporaryTraceFiles) || !Array.isArray(tracing._traceEvents) || !_combinedContextOptions || typeof _combinedContextOptions !== "object" || Array.isArray(_combinedContextOptions)) throw new Error("Required scheduling response recording boundary unavailable.");
    await tracing.startIfNeeded("off");
    if (tracing.traceOptions() !== undefined || tracing._options !== undefined || tracing._shouldCaptureTrace() !== false || tracing._liveTraceFile !== undefined || tracing._temporaryTraceFiles.length !== 0) throw new Error("Required scheduling response recording boundary unavailable.");
    type Listener = { runBeforeCreateBrowserContext: (options: Record<string, unknown>) => Promise<void> };
    const hooks = (playwright as unknown as { _instrumentation?: { addListener: (value: Listener) => void; removeListener: (value: Listener) => void } })._instrumentation;
    if (!hooks || typeof hooks.addListener !== "function" || typeof hooks.removeListener !== "function") throw new Error("Required scheduling response recording boundary unavailable.");
    const listener: Listener = { async runBeforeCreateBrowserContext(options) { for (const [key, value] of Object.entries(_combinedContextOptions)) if (!(key in options)) options[key] = value; if (options.recordHar || options.recordVideo) throw new Error("Required scheduling response recording boundary unavailable."); } };
    hooks.addListener(listener); try { await provide(); } finally { hooks.removeListener(listener); }
  },
});

roleResponseTest("[P0] 15.1-INT-001 AC2 manager five views; own agenda rejects peer lifecycle and input tampering; denied role", async ({ schedulingViews: h, resourcePage: managerPage }, testInfo) => {
  lifecycle.activate(managerPage, testInfo.retry); lifecyclePages.set(testInfo, managerPage);
  lifecycle.mark(managerPage, "seed", "enter");
  await h.seed(); lifecycle.mark(managerPage, "seed", "fulfilled"); lifecycle.mark(managerPage, "initial-signin", "enter"); await h.signIn("manager"); lifecycle.mark(managerPage, "initial-signin", "fulfilled"); lifecycle.mark(managerPage, "initial-open", "enter"); await h.open("Resurser"); lifecycle.mark(managerPage, "initial-open", "fulfilled");
  await expect(managerPage.getByRole("tab")).toHaveCount(5);
  await expect(managerPage.locator('[aria-label="Behöver omfördelas"]')).toContainText(h.scenario.description);
  // Preserve the established HTTP fixture origin before the original target is retired.
  const captureOrigin = new URL(managerPage.url()).origin;
  const page = await h.openOwnRolePage();
  lifecyclePages.set(testInfo, page);
  const payloads: string[] = [];
  const captures: Promise<{ ok: true } | { ok: false; error: unknown } | { ok: "abandoned" }>[] = [];
  const abandoned = Symbol("scheduling attempt abandoned");
  let shutdownStarted = false, captureActivated = false, responseAdmissionOpen = false, trackerOpen = true;
  type RequestEventWindow = "before-open" | "while-open" | "after-close" | "unobserved" | "capacity-unavailable" | "internal-unavailable";
  let requestEventWindows: WeakMap<import("@playwright/test").Request, RequestEventWindow> | null = null;
  let requestEventObserved = 0, requestEventUnavailable = false, requestEventHasOpened = false;
  try { requestEventWindows = new WeakMap(); } catch { requestEventUnavailable = true; }
  const observeRequestEvent = (request: import("@playwright/test").Request) => {
    if (shutdownStarted || !trackerOpen) return;
    try {
      if (!requestEventWindows || requestEventWindows.has(request) || requestEventUnavailable || requestEventObserved >= 256) return;
      const window = captureActivated && responseAdmissionOpen ? "while-open" : requestEventHasOpened ? "after-close" : "before-open";
      requestEventWindows.set(request, window); requestEventObserved++;
    } catch { requestEventUnavailable = true; }
  };
  const observedRequestEventWindow = (request: import("@playwright/test").Request): RequestEventWindow => {
    try {
      if (!requestEventWindows) return "internal-unavailable";
      const known = requestEventWindows.get(request);
      if (known === "before-open" || known === "while-open" || known === "after-close") return known;
      if (known !== undefined) { requestEventUnavailable = true; return "internal-unavailable"; }
      return requestEventUnavailable ? "internal-unavailable" : requestEventObserved >= 256 ? "capacity-unavailable" : "unobserved";
    } catch { requestEventUnavailable = true; return "internal-unavailable"; }
  };
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
  let responseDelivery: ReturnType<typeof createRoleResponseDelivery> | undefined;
  const releaseResponseDelivery = (success: boolean) => responseDelivery?.dispose(success) ?? Promise.resolve();
  const guardProgress = () => { ensureActive(); if (hasFailure) throw firstFailure; };
  const guardedStage = async <T,>(operation: () => Promise<T>): Promise<T> => {
    guardProgress();
    try {
      const value = await awaitActive(Promise.race([operation(), failed]));
      guardProgress(); return value as T;
    } catch (error) { ensureActive(); recordFailure(error); throw firstFailure; }
  };
  const guardedSignIn = async (identity: "montor" | "denied") => {
    lifecycle.mark(page, "guarded-signin", "enter");
    guardProgress();
    JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8"));
    guardProgress();
    const credentials = h.users[identity === "montor" ? 1 : 2]!;
    if (identity === "denied") await guardedStage(() => adminQuery("update public.tenant_memberships set status='active' where id=$1 and tenant_id=$2", [h.memberships[2], h.scenario.tenantId]));
    lifecycle.mark(page, "cookie-clear", "enter");
    await guardedStage(() => page.context().clearCookies());
    lifecycle.mark(page, "cookie-clear", "fulfilled");
    lifecycle.mark(page, "login-goto", "enter");
    await guardedStage(() => page.goto("/login"));
    lifecycle.mark(page, "login-goto", "fulfilled");
    await guardedStage(() => page.getByLabel("E-post").fill(credentials.email));
    await guardedStage(() => page.getByLabel("Lösenord").fill(credentials.password));
    lifecycle.mark(page, "login-submit", "enter");
    await guardedStage(() => page.getByRole("button", { name: "Logga in" }).click());
    lifecycle.mark(page, "login-submit", "fulfilled");
    lifecycle.mark(page, "dashboard-assert", "enter");
    await guardedStage(() => expect(page).toHaveURL(identity === "montor" ? "/my-day" : "/dashboard"));
    lifecycle.mark(page, "dashboard-assert", "fulfilled");
  };
  const guardedSettle = async () => {
    lifecycle.mark(page, "settle", "enter");
    await guardedStage(() => page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))));
    await guardedStage(() => expect(page.getByText("Läser planering…", { exact: true })).toHaveCount(0));
  };
  // Functional phase completion stays in this document; no lifecycle stream is exported.
  type RoleGate = { readonly owner: string; wait: () => Promise<1 | 2>; arm: () => void; check: (count: number) => void; disable: (complete: boolean, count: number) => void };
  let roleOwner: string | undefined; // Created only on actual install; never returned or logged.
  let roleScript: { dispose: () => Promise<void> } | undefined, roleAccept = true, roleReleased = false;
  let rolePhase: ReturnType<typeof h.beginRoleReadPhase> | undefined, roleLastCount = 0;
  let roleCleanup: { clear: Promise<unknown>; script: Promise<unknown> } | undefined;
  const roleEvaluate = (operation: "wait" | "arm" | "check" | "disable", count = 0, complete = false) => {
    const pending = page.evaluate(({ operation, count, complete, owner }) => {
      const gate = (window as Window & { __kopplasSchedulingRoleGateV1?: RoleGate }).__kopplasSchedulingRoleGateV1;
      if (typeof owner !== "string" || !gate || Object.getOwnPropertyDescriptor(gate, "owner")?.value !== owner) throw new Error("Required scheduling client phase unavailable.");
      if (operation === "wait") return gate.wait();
      if (operation === "arm") { gate.arm(); return 0; }
      if (operation === "check") { gate.check(count); return 0; }
      gate.disable(complete, count); return 0;
    }, { operation, count, complete, owner: roleOwner }).catch(() => { throw new Error("Required scheduling client command unavailable."); });
    void pending.catch(() => {}); // A caller race never cancels this command.
    return pending;
  };
  const beginRoleCleanup = (complete: boolean) => {
    roleAccept = false;
    if (complete) {
      try {
        const requests = rolePhase?.requests();
        if (!requests || requests.length !== roleLastCount || requests.some(request => admitted.get(request)?.phase !== "complete")) throw new Error("Required scheduling native phase unavailable.");
      } catch (error) { recordFailure(error); complete = false; }
    }
    const phase = rolePhase; rolePhase = undefined;
    try { phase?.close(); } catch { recordFailure(new Error("Required scheduling phase release unavailable.")); complete = false; }
    if (!roleCleanup) {
      const initiate = (operation: () => Promise<unknown>) => {
        let pending: Promise<unknown>;
        try { pending = operation(); } catch { pending = Promise.reject(new Error("Required scheduling owned cleanup unavailable.")); }
        pending = pending.catch(() => { throw new Error("Required scheduling owned cleanup unavailable."); });
        void pending.catch(error => { recordFailure(error); });
        return pending;
      };
      // Initiate BOTH commands now, before awaiting either; the existing shutdown is independent.
      const clear = initiate(() => roleEvaluate("disable", roleLastCount, complete));
      const owned = roleScript; roleScript = undefined;
      const script = initiate(() => owned ? owned.dispose() : Promise.reject(new Error("Required scheduling init removal unverified.")));
      roleCleanup = { clear, script };
    }
    return roleCleanup;
  };
  const installRoleGate = () => {
    roleOwner ??= globalThis.crypto.randomUUID();
    const pending = page.addInitScript(({ origin, owner }) => {
      if (window !== window.top || window.location.origin !== origin || window.location.pathname !== "/scheduling") return;
      const target = window as Window & { __kopplasSchedulingReadSemanticV1?: (event: unknown) => unknown; __kopplasSchedulingRoleGateV1?: RoleGate };
      const key = "__kopplasSchedulingReadSemanticV1", stateKey = "__kopplasSchedulingRoleGateV1";
      const unavailable = () => new Error("Required scheduling client phase unavailable.");
      if (stateKey in target) return; // Never overwrite foreign/ambiguous ownership.
      const prior = Object.getOwnPropertyDescriptor(target, key);
      let fault = false, disabled = false, ticket = 1, step = 0, revised = false, complete = false;
      let resolve!: (count: 1 | 2) => void, reject!: (error: Error) => void;
      let waiter: Promise<1 | 2>;
      const resetWaiter = () => { waiter = new Promise<1 | 2>((yes, no) => { resolve = yes; reject = no; }); void waiter.catch(() => {}); };
      resetWaiter();
      const poison = () => { fault = true; reject(unavailable()); };
      const owns = () => Object.getOwnPropertyDescriptor(target, stateKey)?.value === gate && Object.getOwnPropertyDescriptor(target, key)?.value === wrapper;
      const check = (count: number) => { if (fault || disabled || !owns() || !complete || count !== (revised ? 2 : 1)) throw unavailable(); };
      const gate: RoleGate = {
        owner,
        wait: () => { if (fault || disabled || !owns()) throw unavailable(); return waiter; },
        arm: () => { check(revised ? 2 : 1); if (ticket !== 1) throw unavailable(); ticket = 2; step = 0; revised = false; complete = false; resetWaiter(); },
        check,
        disable: (requireComplete, count) => {
          let valid = false;
          try { if (requireComplete) check(count); else if (!owns()) throw unavailable(); valid = true; } catch { /* Still disable and restore owned state independently. */ }
          disabled = true; reject(unavailable());
          try {
            if (Object.getOwnPropertyDescriptor(target, key)?.value === wrapper) {
              if (prior) Object.defineProperty(target, key, prior); else delete target.__kopplasSchedulingReadSemanticV1;
            } else valid = false;
          } catch { valid = false; }
          try { if (Object.getOwnPropertyDescriptor(target, stateKey)?.value === gate) delete target.__kopplasSchedulingRoleGateV1; else valid = false; } catch { valid = false; }
          step = 0; complete = false; revised = false; ticket = 0;
          if (!valid) throw unavailable();
        },
      };
      const receive = (raw: unknown) => {
        try {
          if (disabled || fault || !owns() || complete || !raw || typeof raw !== "object" || Array.isArray(raw)) { poison(); return; }
          const descriptors = Object.getOwnPropertyDescriptors(raw), keys = ["ticket", "currentTicket", "ordinal", "operation", "phase", "outcome", "timeMs"];
          if (Reflect.ownKeys(descriptors).length !== 7 || keys.some(key => !descriptors[key] || !("value" in descriptors[key]!))) { poison(); return; }
          const event = raw as { ticket: number; currentTicket: number; ordinal: number; operation: string; phase: string; outcome: string; timeMs: number | null };
          if (event.ticket !== ticket || event.currentTicket !== ticket || event.ordinal !== step + 1 || !Number.isSafeInteger(event.ordinal) ||
            !(typeof event.timeMs === "number" && Number.isFinite(event.timeMs) && event.timeMs >= 0 && event.timeMs <= 3_600_000)) { poison(); return; }
          if (step === 6 && event.operation === "reconciled-read" && event.phase === "start") revised = true;
          const order = ["lifecycle/start", "lifecycle/returned", "first-read/start", "first-read/returned", "reconcile/start", "reconcile/returned",
            ...(revised ? ["reconciled-read/start", "reconciled-read/returned"] : []), "publish/start", "publish/returned", "finish/start", "finish/returned"];
          const expectedOutcome = event.phase === "returned" && (event.operation === "first-read" || event.operation === "reconciled-read") ? "no-data-error" : "none";
          if (typeof event.operation !== "string" || typeof event.phase !== "string" || `${event.operation}/${event.phase}` !== order[step] || event.outcome !== expectedOutcome) { poison(); return; }
          step++;
          if (step === order.length) { complete = true; resolve(revised ? 2 : 1); }
        } catch { poison(); }
      };
      const wrapper = function(this: unknown, event: unknown) {
        "use strict";
        receive(event);
        try {
          const returned: unknown = prior ? Reflect.apply(prior.value, this, [event]) : undefined;
          if (returned !== undefined) {
            // Native Promise observation only; no arbitrary thenable assimilation.
            try { void Promise.prototype.then.call(returned, () => {}, () => { poison(); }).catch(() => {}); } catch { poison(); }
          }
          return returned;
        } catch (error) { poison(); throw error; }
      };
      Object.freeze(gate);
      Object.defineProperty(target, stateKey, { value: gate, configurable: true });
      if ((!prior && key in target) || (prior && (!("value" in prior) || typeof prior.value !== "function" || !prior.configurable))) { poison(); return; }
      try { Object.defineProperty(target, key, { value: wrapper, writable: true, configurable: true }); } catch { poison(); }
    }, { origin: captureOrigin, owner: roleOwner }).catch(() => { throw new Error("Required scheduling client installation unavailable."); });
    // Register before the caller can race: late installation still owns a disposal obligation.
    void pending.then(owned => {
      if (roleAccept) roleScript = owned;
      else { try { void owned.dispose().catch(() => {}); } catch { /* Failure remains unverified; never success. */ } }
    }, error => { recordFailure(error); }).catch(error => { recordFailure(error); });
    return pending;
  };
  const qualifyRolePhase = async () => {
    const count = await guardedStage(() => roleEvaluate("wait"));
    if (count !== 1 && count !== 2) throw new Error("Required scheduling client phase unavailable.");
    roleLastCount = count;
    await drain(); guardProgress(); await guardedSettle(); guardProgress();
    const requests = rolePhase?.requests();
    if (!requests || requests.length !== count || requests.some(request => admitted.get(request)?.phase !== "complete")) throw new Error("Required scheduling native phase unavailable.");
    await guardedStage(() => roleEvaluate("check", count)); guardProgress();
  };
  type NativeCapture = {
    request: import("@playwright/test").Request; response: import("@playwright/test").Response;
    requestOrdinal: number; captureOrdinal: number; queryPresent: boolean | null;
    phase: "response" | "finished" | "body" | "complete";
    responseMs: number | null; finishedStartMs: number | null; finishedEndMs: number | null;
    bodyStartMs: number | null; bodyEndMs: number | null; requestFailedMs: number | null;
  };
  const admitted = new WeakMap<import("@playwright/test").Request, NativeCapture>();
  // Controlled-target association is observation only; no result changes admission.
  type TargetAssociationRecord = {
    kind: "scheduling-target-association-v1"; schemaVersion: 1;
    navigation: "not-invoked" | "pending" | "fulfilled-response" | "fulfilled-null" | "rejected" | "unavailable";
    failedRequest: "first-native-snapshot" | "none" | "unavailable";
    targetRelation: "same-returned-target" | "different-returned-target-redirect-unresolved" | "no-failed-request" | "target-unavailable" | "internal-unavailable";
    actionRead: "not-post" | "post-shape-unverified" | "method-unavailable" | "no-failed-request";
    availability: "informative" | "unavailable"; emission: "attempt-finalization";
  };
  const validTargetAssociation = (record: TargetAssociationRecord) => {
    if (Object.keys(record).join(",") !== "kind,schemaVersion,navigation,failedRequest,targetRelation,actionRead,availability,emission"
      || record.kind !== "scheduling-target-association-v1" || record.schemaVersion !== 1 || record.emission !== "attempt-finalization"
      || !["not-invoked","pending","fulfilled-response","fulfilled-null","rejected","unavailable"].includes(record.navigation)
      || !["first-native-snapshot","none","unavailable"].includes(record.failedRequest)
      || !["same-returned-target","different-returned-target-redirect-unresolved","no-failed-request","target-unavailable","internal-unavailable"].includes(record.targetRelation)
      || !["not-post","post-shape-unverified","method-unavailable","no-failed-request"].includes(record.actionRead)
      || !["informative","unavailable"].includes(record.availability)) return false;
    if (record.failedRequest === "none") return record.targetRelation === "no-failed-request" && record.actionRead === "no-failed-request" && record.availability === "unavailable";
    if (record.actionRead === "no-failed-request" || record.targetRelation === "no-failed-request") return false;
    const related = record.targetRelation === "same-returned-target" || record.targetRelation === "different-returned-target-redirect-unresolved";
    if (record.availability === "informative") return record.navigation === "fulfilled-response" && record.failedRequest === "first-native-snapshot" && related;
    return !related && (record.failedRequest !== "unavailable" || record.actionRead === "method-unavailable");
  };
  const targetAssociation = (() => {
    let enabled = true, selected = false, fault = false;
    let navigation: TargetAssociationRecord["navigation"] = "not-invoked";
    let failedRequest: import("@playwright/test").Request | null = null, returnedTarget: import("@playwright/test").Request | null = null;
    let actionRead: TargetAssociationRecord["actionRead"] = "no-failed-request";
    const select = (request: import("@playwright/test").Request) => {
      if (!enabled || selected) return;
      selected = true; actionRead = "method-unavailable";
      try { failedRequest = request; } catch { fault = true; }
    };
    const method = (value: "GET" | "POST" | "other" | "unavailable") => {
      if (!enabled || !selected) return;
      actionRead = value === "POST" ? "post-shape-unverified" : value === "GET" || value === "other" ? "not-post" : "method-unavailable";
    };
    const observe = (original: Promise<import("@playwright/test").Response | null>) => {
      if (!enabled) return;
      navigation = "pending";
      try {
        const branch = Promise.prototype.then.call(original, (response: import("@playwright/test").Response | null) => {
          if (!enabled) return;
          try {
            if (response === null) { navigation = "fulfilled-null"; return; }
            navigation = "fulfilled-response";
            const request = response.request();
            if (!request || (typeof request !== "object" && typeof request !== "function")) { fault = true; return; }
            returnedTarget = request;
          } catch { fault = true; }
        }, () => { if (enabled) navigation = "rejected"; });
        // Consume derived rejection independently; the original Promise is returned by the caller.
        Promise.prototype.then.call(branch, undefined, () => { if (enabled) fault = true; });
      } catch { fault = true; }
    };
    const finish = () => {
      if (!enabled) return;
      enabled = false;
      let relation: TargetAssociationRecord["targetRelation"] = selected ? "target-unavailable" : "no-failed-request";
      let availability: TargetAssociationRecord["availability"] = "unavailable";
      try {
        if (selected && fault) relation = "internal-unavailable";
        else if (selected && navigation === "fulfilled-response" && failedRequest && returnedTarget) {
          const failedEntry = admitted.get(failedRequest), targetEntry = admitted.get(returnedTarget);
          if (failedEntry?.request === failedRequest && targetEntry?.request === returnedTarget) {
            relation = failedRequest === returnedTarget ? "same-returned-target" : "different-returned-target-redirect-unresolved";
            availability = "informative";
          }
        }
      } catch { relation = "internal-unavailable"; }
      const record: TargetAssociationRecord = {
        kind: "scheduling-target-association-v1", schemaVersion: 1, navigation,
        failedRequest: selected ? failedRequest ? "first-native-snapshot" : "unavailable" : "none",
        targetRelation: relation, actionRead, availability, emission: "attempt-finalization",
      };
      failedRequest = null; returnedTarget = null;
      try {
        if (!validTargetAssociation(record)) return;
        const json = JSON.stringify(record);
        if (typeof json !== "string" || Buffer.byteLength(json, "utf8") > 1024) return;
        console.info("[scheduling-target-association] " + json);
      } catch { /* Missing output is unavailable, never permission to retry or proceed. */ }
    };
    return { select, method, observe, finish };
  })();
  // PASSIVE-NETWORK-BEGIN attempt
  const passive = createSchedulingPassiveMetadata(page, captureOrigin, request => admitted.get(request)?.requestOrdinal);
  schedulingPassiveShutdowns.set(testInfo, passive.stop);
  // PASSIVE-NETWORK-END attempt
  let requestOrdinal = 0, captureCount = 0, fulfilledCount = 0, rejectedCount = 0;
  let preAdmissionCancellationCount = 0;
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
    try { targetAssociation.select(entry.request); } catch { /* Observation never changes snapshot selection. */ }
    try {
      updateTiming(() => {
        if (trigger === "requestfailed") entry.requestFailedMs = relativeTime();
        else if (trigger === "body-rejected") entry.bodyEndMs = relativeTime();
        else entry.finishedEndMs = relativeTime();
      });
      const rawMethod = entry.request.method();
      const method = typeof rawMethod !== "string" ? "unavailable" : rawMethod === "GET" || rawMethod === "POST" ? rawMethod : "other";
      try { targetAssociation.method(method); } catch { /* Reuse only the existing closed classification. */ }
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
        requestEventWindow: observedRequestEventWindow(entry.request),
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
    if (!captureActivated) {
      if (wasLive) preAdmissionCancellationCount = Math.min(preAdmissionCancellationCount + 1, 1000);
      return;
    }
    const entry = admitted.get(request);
    if (!entry && !wasLive) return;
    let reason: unknown = unavailableReason;
    try { const failure = request.failure(), text = failure?.errorText; if (typeof text === "string") reason = text; } catch { /* Use only the fixed unavailable carrier. */ }
    lifecycle.mark(page, "request-failed", "event", request);
    recordFailure(reason);
    wake();
    if (entry) snapshot(entry, "requestfailed");
  };
  const readRequest = (request: import("@playwright/test").Request) => {
    if (shutdownStarted || !trackerOpen) return;
    const url = new URL(request.url());
    if (url.origin !== captureOrigin || url.pathname !== "/scheduling") return;
    try { observeRequestEvent(request); } catch { /* Observation cannot alter existing live tracking. */ }
    lifecycle.mark(page, "request-admitted", "event", request, undefined, undefined, "scheduling");
    live.add(request); generation++; wake();
  };
  const readFinished = (request: import("@playwright/test").Request) => {
    lifecycle.mark(page, "request-finished", "event", request);
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
    lifecycle.mark(page, "response-admitted", "event", request, entry.requestOrdinal, entry.captureOrdinal, "scheduling");
    updateTiming(() => { entry.queryPresent = url.search !== ""; entry.responseMs = relativeTime(); });
    const capture = (async () => {
      updateTiming(() => { entry.phase = "finished"; entry.finishedStartMs = relativeTime(); });
      lifecycle.mark(page, "finished-call", "invoked", request);
      const failure = await response.finished();
      lifecycle.mark(page, "finished-call", "fulfilled", request);
      ensureActive();
      updateTiming(() => { entry.finishedEndMs = relativeTime(); });
      if (failure) throw failure;
      updateTiming(() => { entry.phase = "body"; entry.bodyStartMs = relativeTime(); });
      lifecycle.mark(page, "body-call", "invoked", request);
      const payload = await response.text();
      lifecycle.mark(page, "body-call", "fulfilled", request);
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
    lifecycle.mark(page, "drain", "enter");
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
    lifecycle.mark(page, "barrier-wait", "enter");
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
      lifecycle.mark(page, "barrier-action", "invoked");
      try { return await awaitActive(action()); }
      catch (error) { ensureActive(); recordFailure(error); throw firstFailure; }
    }
  };
  const shutdown = () => {
    if (shutdownStarted) return;
    beginRoleCleanup(false);
    void releaseResponseDelivery(false).catch(error => recordFailure(error));
    try { targetAssociation.finish(); } catch { /* Owned observation cannot block original cleanup. */ }
    lifecycle.mark(page, "shutdown", "requested");
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
    try { targetAssociation.finish(); } catch { /* Disable before any original cleanup can throw. */ }
    lifecycle.mark(page, "close-window", "enter");
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
  const openCaptureWindow = () => {
    lifecycle.mark(page, "capture-open", "enter"); guardProgress();
    // Post-login background cancellations are diagnostic, never privacy evidence.
    console.info("[scheduling-pre-admission] " + JSON.stringify({ cancellationCount: preAdmissionCancellationCount, privacyCredit: false }));
    captureActivated = true; responseAdmissionOpen = true; page.on("response", read);
    requestEventHasOpened = true;
  };
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
    await guardedSignIn("montor"); guardProgress();
    // AC2 controls direct role entry after retiring the preceding landing document.
    await guardedStage(() => page.goto("about:blank"));
    await guardedStage(async () => {
      let neutralDocument = false;
      try { neutralDocument = page.url() === "about:blank"; } catch { /* Only the fixed closed assertion may escape. */ }
      expect(neutralDocument, "Controlled role-read neutral document unavailable.").toBe(true);
    }); guardProgress();
    await guardedStage(installRoleGate); guardProgress();
    const attaching = page.context().newCDPSession(page);
    let acceptSession = true, transferredSession = false;
    let detachingSession: Promise<void> | undefined;
    const detachUntransferred = (owned: import("@playwright/test").CDPSession) => detachingSession ??= owned.detach();
    const responseSetupFailure = new Error("Required scheduling response delivery unavailable.");
    void attaching.then(owned => { if (!acceptSession && !transferredSession) void detachUntransferred(owned).catch(() => recordFailure(responseSetupFailure)); }, () => {}).catch(() => recordFailure(responseSetupFailure));
    try {
      const owned = await guardedStage(() => roleDeliveryWithin(attaching).catch(() => { throw responseSetupFailure; }));
      const runtime = await guardedStage(() => roleDeliveryWithin(owned.send("Browser.getVersion")).catch(() => { throw responseSetupFailure; }));
      roleDeliveryRequire(/^(?:Headless)?Chrome\/149\.0\.7827\.55$/.test(runtime.product));
      const { frameTree: { frame } } = await guardedStage(() => roleDeliveryWithin(owned.send("Page.getFrameTree")).catch(() => { throw responseSetupFailure; }));
      roleDeliveryRequire(!!frame.id && !frame.parentId);
      responseDelivery = createRoleResponseDelivery(owned, captureOrigin, frame.id, recordFailure, () => h.closeOwnRolePage());
      transferredSession = true;
      await guardedStage(() => responseDelivery!.enable()); guardProgress();
    } finally { acceptSession = false; if (!transferredSession) void attaching.then(detachUntransferred).catch(() => recordFailure(responseSetupFailure)); }
    const mountedDate = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm", year: "numeric", month: "2-digit", day: "2-digit" }).format(new Date());
    responseDelivery!.arm(mountedDate);
    rolePhase = h.beginRoleReadPhase(captureOrigin, mountedDate);
    await test.step("Role initial required flow", async () => {
      const targetResponse = await test.step("Role initial controlled navigation", async () => {
        const response = await navigateAfterBarrier(() => {
          // Open only after the existing barrier drains post-login traffic, directly
          // before this controlled tampered navigation. Later failures remain fatal.
          openCaptureWindow();
          const originalNavigation = page.goto(`/scheduling?view=resources&person=${h.extraProfiles[2]}&tenant=${h.scenario.tenantIds[1]}`);
          try { targetAssociation.observe(originalNavigation); } catch { /* Keep the exact original navigation Promise. */ }
          return originalNavigation;
        });
        guardProgress(); return response;
      });
      await test.step("Role initial native drain", async () => { await drain(); guardProgress(); });
      await test.step("Role initial complete client and native qualification", async () => {
        expect(targetResponse).not.toBeNull();
        expect(targetResponse!.ok()).toBe(true);
        // A background/partial body cannot substitute for the actual target payload.
        expect(admitted.get(targetResponse!.request())?.phase).toBe("complete");
        await qualifyRolePhase(); guardProgress();
      });
      await test.step("Role initial UI settlement", async () => { await guardedSettle(); guardProgress(); });
    });
    await guardedStage(() => responseDelivery!.complete()); guardProgress();
    rolePhase.close(); rolePhase = undefined;
    await guardedStage(() => roleEvaluate("arm")); guardProgress();
    responseDelivery!.arm(DATE);
    rolePhase = h.beginRoleReadPhase(captureOrigin, DATE);
    lifecycle.mark(page, "date-fill", "enter");
    await navigateAfterBarrier(() => page.getByLabel("Datum", { exact: true }).fill(DATE)); guardProgress(); await guardedSettle(); guardProgress(); await drain(); guardProgress();
    await qualifyRolePhase(); guardProgress();
    await guardedStage(() => responseDelivery!.complete()); guardProgress();
    await guardedStage(() => expect(page.getByRole("tab")).toHaveCount(1)); await guardedStage(() => expect(page.getByRole("tab")).toHaveText("Min kalender"));
    const visibleIds = await guardedStage(() => h.visibleIds()); guardProgress(); expect(visibleIds).toEqual([h.ids.role, h.ids.collision].sort());
    await guardedStage(() => expect(page.getByLabel("Person", { exact: true })).toHaveCount(0)); await guardedStage(() => expect(page.getByTestId("scheduling-new-booking")).toHaveCount(0));
    await guardedStage(() => expect(page.getByText("Behöver omfördelas", { exact: true })).toHaveCount(0));
    await guardedStage(() => expect(page.getByText(h.scenario.assigneeLabels[0]!, { exact: false })).toHaveCount(0));
  } catch (error) {
    if (error === abandoned) throw error;
    recordFailure(error);
  } finally {
    if (hasFailure || shutdownStarted) { beginRoleCleanup(false); void releaseResponseDelivery(false).catch(error => recordFailure(error)); }
    else {
      try {
        const cleanup = beginRoleCleanup(true);
        await guardedStage(() => cleanup.clear);
        await guardedStage(() => cleanup.script);
        await guardedStage(() => releaseResponseDelivery(true)); guardProgress();
        roleReleased = true;
      } catch (error) { if (error !== abandoned) recordFailure(error); }
    }
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
    if (!roleReleased) throw new Error("Required scheduling client release unverified.");
    await guardedSignIn("denied"); guardProgress(); await guardedStage(() => page.goto("/scheduling"));
    await guardedStage(() => expect(page.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible()); await guardedStage(() => expect(page.getByTestId("scheduling-workspace")).toHaveCount(0));
    await guardedStage(() => h.closeOwnRolePage()); guardProgress();
  } catch (error) { if (error === abandoned) throw error; recordFailure(error); }
  ensureActive();
  if (hasFailure) throw firstFailure;
  } catch (error) { if (error !== abandoned) throw error; }
  finally { beginRoleCleanup(false); void releaseResponseDelivery(false).catch(error => recordFailure(error)); void h.closeOwnRolePage().catch(error => recordFailure(error)); if (!shutdownStarted) schedulingAttemptShutdowns.delete(testInfo); }
  // PASSIVE-NETWORK-BEGIN final
  } finally { try { targetAssociation.finish(); } catch { /* Preserve the original primary carrier. */ } lifecycle.mark(page, "attempt-end", "event"); passive.stop(hasFailure); schedulingPassiveShutdowns.delete(testInfo); }
  // PASSIVE-NETWORK-END final
});

// Focus regression: refresh must resolve the visible source instance, including week duplicates.
for (const host of ["Schema", "Resurser"] as const) {
  test(`[P1] 15.1 focus restoration ${host} day/week origins and disappeared source`, async ({ schedulingViews: h }) => {
    await h.seed(); await h.page.setViewportSize({ width: 1440, height: 1000 });
    for (const period of ["day", "week"] as const) {
      await h.open(host, period);
      for (const kind of ["article", "edit", "resize"] as const) {
        const block = host === "Resurser" ? h.row().getByTestId(`scheduling-booking-${h.ids.proposal}`) : h.block(h.ids.proposal);
        const trigger = kind === "article" ? block : block.getByRole("button", { name: kind === "edit" ? "Redigera / flytta" : "Ändra längd", exact: true });
        if (kind === "article") {
          await trigger.focus(); await h.dragBooking(trigger, h.slot(host, "2026-10-12T14:30"));
        } else { await trigger.focus(); await trigger.press("Enter"); }
        await expect(h.editor).toBeVisible(); await h.cancel();
        await expect(trigger).toBeFocused(); await expect(trigger).toBeVisible();
        if (host === "Schema") {
          await expect(h.page.locator('[data-focus-instance="schema-agenda"]')).toBeHidden();
        }
      }
    }
    // Move outside this day: the original source has no current equivalent after persistence.
    await h.open(host, "day");
    const block = host === "Resurser" ? h.row().getByTestId(`scheduling-booking-${h.ids.proposal}`) : h.block(h.ids.proposal);
    await block.getByRole("button", { name: "Redigera / flytta", exact: true }).click();
    await h.editor.getByTestId("booking-start").fill("2026-10-16T14:30");
    await h.editor.getByTestId("booking-end").fill("2026-10-16T15:00");
    await expect(h.editor.getByTestId("booking-availability")).toBeVisible();
    await save(h);
    // Success replaces booking-start, so the form-filtered h.editor is no longer its dialog identity.
    const savedDialog = h.page.getByRole("dialog").filter({ has: h.page.getByTestId("booking-editor") });
    await savedDialog.getByTestId("booking-close").click();
    await expect(savedDialog).toHaveCount(0); await expect(h.editor).toHaveCount(0); await h.settle();
    await expect(block).toHaveCount(0);
    await expect(h.page.getByRole("tab", { selected: true })).toBeFocused();
    await expect(h.page.getByRole("tab", { selected: true })).toBeVisible();
    const persisted = (await h.sqlBookings()).find(row => row.id === h.ids.proposal);
    expect(persisted).toMatchObject({ startsAt: interval("2026-10-16T14:30", "2026-10-16T15:00").startsAt,
      endsAt: interval("2026-10-16T14:30", "2026-10-16T15:00").endsAt });
  });
}

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
          await h.dragBooking(trigger, h.slot(host, operation === "move" ? expected.startsLocal : "2026-10-12T13:00", operation === "move" && host === "Resurser" ? h.people[2] : h.people[0]));
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
      await h.cancel(); await expect(trigger).toBeFocused(); await expect(trigger).toBeVisible(); expect(await h.sqlBookings()).toEqual(before);
      await propose(); await h.review(); await save(h);
      const after = await h.sqlBookings(); expect(after).toHaveLength(before.length);
      expect(after.filter(row => row.id !== h.ids.proposal)).toEqual(before.filter(row => row.id !== h.ids.proposal));
      expect(after.find(row => row.id === h.ids.proposal)).toEqual({ id: h.ids.proposal, startsAt: expected.startsAt, endsAt: expected.endsAt, assigneeIds: [...expected.assigneeIds].sort() });
      const states = await adminQuery<{ status: string }>("select status from public.booking_conflicts where tenant_id=$1 and (booking_id=$2 or related_booking_id=$2)", [h.scenario.tenantId, h.ids.proposal]);
      expect(states.some(row => row.status === "accepted")).toBe(true);
      expect(states.some(row => row.status === "open")).toBe(true);
      await expect(h.editor).toHaveCount(0); await h.reloadAndOpen(h.ids.proposal, host, expected); await expectEditor(h, expected); await h.cancel();
    }
  });
}

// Only the qualified empty-phone producer changes lineage; existing Role recorder is inherited unchanged.
const ownedRetirementTest = roleResponseTest.extend<{ schedulingViews: SchedulingViewsHarness }>({
  schedulingViews: async ({ schedulingViews: h }, provide, testInfo) => {
    const retirement = h.prepareOwnedEmptyPhone(body => testInfo.attach("scheduling-empty-phone", { body, contentType: "image/png" }));
    let present = false, error: unknown;
    try { await provide(h); } catch (failure) { present = true; error = failure; }
    await retirement.complete({ present, error, passed: testInfo.status === "passed" && testInfo.errors.length === 0 });
  },
});


/** Arm inside the original test runnable, not a potentially paused fixture-setup slot. */
function ownedExpiryBody(run: (fixtures: { schedulingViews: SchedulingViewsHarness }, info: TestInfo) => Promise<void>) {
  return async ({ schedulingViews: h }: { schedulingViews: SchedulingViewsHarness }, info: TestInfo) => {
    const fixtures = { schedulingViews: h };
    try {
      type Slot = { timeout: number; elapsed: number };
      type Manager = { defaultSlot: () => Slot; currentSlotDeadline: () => number; _running?: { slot: Slot; start: number; runnable: { type: string; fixture?: unknown } } };
      const manager = (info as unknown as { _timeoutManager?: Manager })._timeoutManager;
      if (playwrightPackage.version !== "1.61.1" || !manager || typeof manager.defaultSlot !== "function" || typeof manager.currentSlotDeadline !== "function") throw new Error("Owned scheduling expiry pinned API unavailable.");
      const slot = manager.defaultSlot(), running = manager._running;
      if (!running || running.slot !== slot || running.runnable.type !== "test" || running.runnable.fixture !== undefined || slot.timeout !== 180_000 || !Number.isFinite(slot.elapsed) || slot.elapsed < 0 || !Number.isFinite(running.start)) throw new Error("Owned scheduling expiry functional slot unavailable.");
      const requireRoot = createRequire(path.join(process.cwd(), "package.json"));
      const requireTest = createRequire(requireRoot.resolve("@playwright/test/package.json"));
      const requirePlaywright = createRequire(requireTest.resolve("playwright/package.json"));
      const clock = requirePlaywright("playwright-core/lib/coreBundle").iso.monotonicTime as () => number;
      if (typeof clock !== "function") throw new Error("Owned scheduling expiry clock unavailable.");
      const deadline = manager.currentSlotDeadline();
      if (deadline !== running.start + (slot.timeout - slot.elapsed)) throw new Error("Owned scheduling expiry deadline ownership unavailable.");
      fixtures.schedulingViews.armOwnedEmptyPhoneExpiry(deadline, clock, (callback, delay) => setTimeout(callback, delay), handle => clearTimeout(handle as ReturnType<typeof setTimeout>));
      const value = await run(fixtures, info);
      fixtures.schedulingViews.finishOwnedEmptyPhoneFunctional();
      return value;
    } catch (error) { fixtures.schedulingViews.failOwnedEmptyPhone(error); throw error; }
  };
}

ownedRetirementTest("[P1] 15.1-E2E-008 AC6 arbetsroll/no-role lanes, multi-assignee rows and current reassignment lifecycle", ownedExpiryBody(async ({ schedulingViews: h }) => {
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
  await h.open("Team");
  await expect.poll(() => h.visibleIds(roleLane)).toEqual([h.ids.role, h.ids.proposal, h.ids.collision].sort());
  await expect.poll(() => h.visibleIds(noRole)).toEqual([h.ids.noRole, h.ids.inactive, h.ids.zero, h.ids.hidden].sort());
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
    await h.lifecycle(status, archived); await h.open("Resurser");
    await expect.poll(() => h.visibleIds(lane)).toEqual(expected ? [h.ids.inactive] : []);
    if (!expected) await expect(lane).toContainText("Inga bokningar behöver omfördelas.");
  }
}));

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
  await page.reload(); await h.settle(); expect(await state()).toEqual(defaults);
  // Storage denial falls back to today's week; inspect fixture bookings in their own week.
  await h.open("Schema", "week"); expect(await state()).toEqual(defaults);
  expect((await h.visibleIds()).length).toBe(7);
});
test("[P1] 15.1-COMP-001 AC3 observed real read transport failure hides stale/empty/count until retry", async ({ schedulingViews: h }, testInfo) => {
  await h.seed(); await h.open("Schema"); await h.filter("Jobb", h.scenario.jobId);
  const readViewport = h.page.viewportSize()!, readOrigin = new URL(h.page.url()).origin;
  const readMatcher = (url: URL) => url.origin === readOrigin && url.pathname === "/scheduling";
  let releaseRead!: () => void, markReadStarted!: () => void;
  const readGate = new Promise<void>(resolve => { releaseRead = resolve; }), readStarted = new Promise<void>(resolve => { markReadStarted = resolve; });
  let readHeld = false, heldReadTask: Promise<void> | undefined;
  const holdRead = (route: import("@playwright/test").Route) => {
    const request = route.request();
    if (readHeld || request.method() !== "POST" || !request.headers()["next-action"]) return route.fallback();
    let first: unknown;
    try { const body = request.postData(); if (!body || body.length > 32768 || Buffer.byteLength(body, "utf8") > 65536) return route.fallback(); const value = JSON.parse(body); first = Array.isArray(value) ? value[0] : undefined; } catch { return route.fallback(); }
    if (!first || typeof first !== "object" || !("view" in first) || !("filters" in first) || !("mode" in first)) return route.fallback();
    readHeld = true; markReadStarted();
    heldReadTask = (async () => { await readGate; await route.fallback(); })();
    void heldReadTask.catch(() => {}); return heldReadTask;
  };
  await h.page.route(readMatcher, holdRead);
  const failed = await h.failNextRead();
  let readCaptureError: unknown, readCaptureFailed = false;
  const readCleanup: string[] = [];
  try {
    await h.page.getByRole("tab", { name: "Schema", exact: true }).click(); await readStarted;
    for (const viewport of [{ width: 1440, height: 1000, suffix: "desktop" }, { width: 360, height: 640, suffix: "phone" }]) {
      await h.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(h.page.getByText("Läser planering…", { exact: true })).toBeVisible();
      await attachVisual(h.page, testInfo, `workspace-read-loading-${viewport.suffix}`);
    }
  } catch (error) { readCaptureError = error; readCaptureFailed = true; }
  finally {
    try { releaseRead(); } catch { readCleanup.push("release"); }
    try { await h.page.unroute(readMatcher, holdRead); } catch { readCleanup.push("unroute"); }
    try { if (heldReadTask) await heldReadTask; } catch { readCleanup.push("read-settlement"); }
    try { await h.page.setViewportSize(readViewport); } catch { readCleanup.push("viewport"); }
  }
  if (readCaptureFailed) throw readCaptureError;
  if (readCleanup.length) throw new Error(`Read capture cleanup failed: ${readCleanup.join(", ")}`);
  await failed.failed;
  await expect(h.page.getByTestId("scheduling-workspace").getByRole("alert")).toContainText("Planeringen kunde inte läsas");
  let readErrorCapture: unknown, readErrorCaptureFailed = false;
  try {
    for (const viewport of [{ width: 1440, height: 1000, suffix: "desktop" }, { width: 360, height: 640, suffix: "phone" }]) {
      await h.page.setViewportSize({ width: viewport.width, height: viewport.height });
      await expect(h.page.getByTestId("scheduling-workspace").getByRole("alert")).toBeVisible();
      await attachVisual(h.page, testInfo, `workspace-read-error-${viewport.suffix}`);
    }
  } catch (error) { readErrorCapture = error; readErrorCaptureFailed = true; }
  finally { try { await h.page.setViewportSize(readViewport); } catch (error) { if (!readErrorCaptureFailed) { readErrorCapture = error; readErrorCaptureFailed = true; } } }
  if (readErrorCaptureFailed) throw readErrorCapture;
  expect(await h.visibleIds()).toEqual([]); await expect(h.page.getByText(/Inga bokningar matchar/)).toHaveCount(0);
  await expect(h.page.getByText(/^Konflikter \(/)).toHaveCount(0);
  // An aborted action cannot confirm current planner authority; Retry must restore it.
  for (const filter of ["Person", "Arbetsroll", "Jobb", "Kund", "Status"]) await expect(h.page.getByLabel(filter, { exact: true })).toHaveCount(0);
  await expect(h.page.getByTestId("scheduling-new-booking")).toHaveCount(0);
  await expect(h.page.getByRole("button", { name: "Välj intervall", exact: true })).toHaveCount(0);
  // Date navigation issues another real read. Observe its failure before Retry.
  const selectedDate = "2026-10-14", navigationFailed = await h.failNextRead();
  const navigationRequest = h.page.waitForRequest(request => {
    if (request.method() !== "POST" || !request.headers()["next-action"]) return false;
    try { const value = JSON.parse(request.postData() ?? "null")?.[0]; return value?.view === "schema" && value?.date === selectedDate && value?.filters?.jobIds?.[0] === h.scenario.jobId; }
    catch { return false; }
  });
  await h.page.getByLabel("Datum", { exact: true }).fill(selectedDate);
  await Promise.all([navigationFailed.failed, navigationRequest]);
  await expect(h.page.getByTestId("scheduling-workspace").getByRole("alert")).toContainText("Planeringen kunde inte läsas");
  await expect(h.page.getByLabel("Datum", { exact: true })).toHaveValue(selectedDate);
  expect(await h.visibleIds()).toEqual([]); await expect(h.page.getByText(/Inga bokningar matchar/)).toHaveCount(0);
  await expect(h.page.getByText(/^Konflikter \(/)).toHaveCount(0);
  for (const filter of ["Person", "Arbetsroll", "Jobb", "Kund", "Status"]) await expect(h.page.getByLabel(filter, { exact: true })).toHaveCount(0);
  await expect(h.page.getByTestId("scheduling-new-booking")).toHaveCount(0);
  await expect(h.page.getByRole("button", { name: "Välj intervall", exact: true })).toHaveCount(0);
  await h.page.getByRole("button", { name: "Försök igen", exact: true }).click(); await h.settle();
  await expect(h.page.getByLabel("Datum", { exact: true })).toHaveValue(selectedDate);
  await expect(h.page.getByLabel("Jobb", { exact: true })).toHaveValue(h.scenario.jobId);
  await expect(h.page.getByTestId("scheduling-workspace").getByRole("alert")).toHaveCount(0); expect(await h.visibleIds()).toEqual([h.ids.role, h.ids.proposal, h.ids.collision].sort());
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
  let desktop_dialog_origin_draftError: unknown, desktop_dialog_origin_draftFailed = false;
  try { await page.setViewportSize({ width: 1440, height: 1000 }); await attachVisual(page, testInfo, "desktop-dialog-origin-draft"); }
  catch (error) { desktop_dialog_origin_draftError = error; desktop_dialog_origin_draftFailed = true; }
  finally { try { await page.setViewportSize({ width: 360, height: 640 }); } catch (error) { if (!desktop_dialog_origin_draftFailed) { desktop_dialog_origin_draftError = error; desktop_dialog_origin_draftFailed = true; } } }
  if (desktop_dialog_origin_draftFailed) throw desktop_dialog_origin_draftError;
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
  let desktop_dialog_origin_save_failureError: unknown, desktop_dialog_origin_save_failureFailed = false;
  try { await page.setViewportSize({ width: 1440, height: 1000 }); await attachVisual(page, testInfo, "desktop-dialog-origin-save-failure"); }
  catch (error) { desktop_dialog_origin_save_failureError = error; desktop_dialog_origin_save_failureFailed = true; }
  finally { try { await page.setViewportSize({ width: 360, height: 640 }); } catch (error) { if (!desktop_dialog_origin_save_failureFailed) { desktop_dialog_origin_save_failureError = error; desktop_dialog_origin_save_failureFailed = true; } } }
  if (desktop_dialog_origin_save_failureFailed) throw desktop_dialog_origin_save_failureError;
  const confirmed = await h.observeConfirmedSave(); await h.editor.getByTestId("booking-retry").click(); await confirmed.confirmed;
  page.off("request", capture); expect(attempts).toHaveLength(2); expect(attempts[1]).toEqual(attempts[0]);
  await expect(page.getByTestId("booking-save-status")).toHaveText(/sparad/i); await expect(h.editor).toHaveCount(0); expect((await h.sqlBookings()).length).toBe(before.length + 1);
  await attachVisual(page, testInfo, "phone-confirmed-retry");
  let desktop_dialog_origin_confirmed_retryError: unknown, desktop_dialog_origin_confirmed_retryFailed = false;
  try { await page.setViewportSize({ width: 1440, height: 1000 }); await attachVisual(page, testInfo, "desktop-dialog-origin-confirmed-retry"); }
  catch (error) { desktop_dialog_origin_confirmed_retryError = error; desktop_dialog_origin_confirmed_retryFailed = true; }
  finally { try { await page.setViewportSize({ width: 360, height: 640 }); } catch (error) { if (!desktop_dialog_origin_confirmed_retryFailed) { desktop_dialog_origin_confirmed_retryError = error; desktop_dialog_origin_confirmed_retryFailed = true; } } }
  if (desktop_dialog_origin_confirmed_retryFailed) throw desktop_dialog_origin_confirmed_retryError;
});
test("[P1] 15.1-COMP-003 AC8 month density drilldown and long multi-assignee labels at 360x640", async ({ schedulingViews: h, resourcePage: page }, testInfo) => {
  await h.seed(); await h.open("Schema", "month"); const density = page.locator(`[data-testid="schema-density-day"][data-date="${DATE}"]`); await expect(density).toHaveText("5 bokningar · öppna dag"); await density.click(); await h.settle();
  expect(await h.visibleIds()).toEqual([h.ids.role, h.ids.noRole, h.ids.inactive, h.ids.proposal, h.ids.collision].sort());
  await page.setViewportSize({ width: 360, height: 640 }); await h.open("Schema");
  await expect(h.block(h.ids.role)).toContainText(h.scenario.description); for (const label of h.scenario.assigneeLabels) await expect(h.block(h.ids.role)).toContainText(label);
  await h.block(h.ids.role).scrollIntoViewIfNeeded();
  await attachVisual(page, testInfo, "phone-long-multi-assignee-labels");
});
