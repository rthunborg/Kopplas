/** Story 15.1 actual authenticated acceptance. Skips confer no coverage.
 * 14.4-E2E-006 (empty-slot click/drag portion) is exercised at both real hosts. */
import { test, expect, interval, DATE, type View, type Interval, type SchedulingViewsHarness } from "./support/scheduling-views-atdd";
import type { Locator, Page, TestInfo } from "@playwright/test";
import { adminQuery } from "../factories/admin-sql";

test.describe.configure({ mode: "serial" });
test.setTimeout(180_000);
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

test("[P0] 15.1-INT-001 AC2 manager five views; own agenda rejects peer lifecycle and input tampering; denied role", async ({ schedulingViews: h, resourcePage: page }) => {
  await h.seed(); await h.signIn("manager"); await h.open("Resurser");
  await expect(page.getByRole("tab")).toHaveCount(5);
  await expect(page.locator('[aria-label="Behöver omfördelas"]')).toContainText(h.scenario.description);
  await h.signIn("montor");
  const payloads: string[] = [];
  const captureOrigin = new URL(page.url()).origin;
  const captures: Promise<{ ok: true } | { ok: false; error: unknown }>[] = [];
  let hasFailure = false, firstFailure: unknown;
  let notifyFailure!: () => void;
  const failed = new Promise<void>(resolve => { notifyFailure = resolve; });
  const recordFailure = (error: unknown) => {
    if (hasFailure) return;
    hasFailure = true; firstFailure = error; notifyFailure();
  };
  const read = (response: import("@playwright/test").Response) => {
    const url = new URL(response.url());
    if (url.origin !== captureOrigin || url.pathname !== "/scheduling" || !response.ok()) return;
    const capture = (async () => {
      const failure = await response.finished();
      if (failure) throw failure;
      payloads.push(await response.text());
    })();
    // Register and handle rejection in the same event turn. The drain retains
    // and rethrows the original error; a missing CDP body is never empty data.
    captures.push(capture.then(() => ({ ok: true as const }), error => { recordFailure(error); return { ok: false as const, error }; }));
  };
  const drain = async () => {
    let cursor = 0;
    if (hasFailure) throw firstFailure;
    while (cursor < captures.length) {
      if (hasFailure) throw firstFailure;
      const end = captures.length, batch = captures.slice(cursor, end);
      await Promise.race([Promise.all(batch), failed]);
      if (hasFailure) throw firstFailure;
      cursor = end;
    }
    if (hasFailure) throw firstFailure;
  };
  page.on("response", read);
  try {
    await page.goto(`/scheduling?view=resources&person=${h.extraProfiles[2]}&tenant=${h.scenario.tenantIds[1]}`); await h.settle(); await drain();
    await page.getByLabel("Datum", { exact: true }).fill(DATE); await h.settle(); await drain();
    await expect(page.getByRole("tab")).toHaveCount(1); await expect(page.getByRole("tab")).toHaveText("Min kalender");
    expect(await h.visibleIds()).toEqual([h.ids.role, h.ids.collision].sort());
    await expect(page.getByLabel("Person", { exact: true })).toHaveCount(0); await expect(page.getByTestId("scheduling-new-booking")).toHaveCount(0);
    await expect(page.getByText("Behöver omfördelas", { exact: true })).toHaveCount(0);
    await expect(page.getByText(h.scenario.assigneeLabels[0]!, { exact: false })).toHaveCount(0);
  } catch (error) {
    recordFailure(error);
  } finally {
    try { page.off("response", read); } catch (error) { recordFailure(error); }
    // A failing test keeps all rejection handlers attached but never waits on
    // another unresolved capture. Success must drain the detached final buffer.
    if (!hasFailure) { try { await drain(); } catch (error) { recordFailure(error); } }
  }
  if (hasFailure) throw firstFailure;
  try {
    expect(payloads.length).toBeGreaterThan(0);
    for (const payload of payloads) { expect(payload).not.toContain(h.users[2]!.email); expect(payload).not.toContain('"needsReassignment":'); }
    await h.signIn("denied"); await page.goto("/scheduling");
    await expect(page.getByRole("heading", { name: "Ingen åtkomst", exact: true })).toBeVisible(); await expect(page.getByTestId("scheduling-workspace")).toHaveCount(0);
  } catch (error) { recordFailure(error); }
  if (hasFailure) throw firstFailure;
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
