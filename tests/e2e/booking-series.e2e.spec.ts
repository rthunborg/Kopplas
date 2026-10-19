/**
 * Story 15.2 essential production-host journeys. All are unexecuted RED scaffolds.
 * Existing hosts/selectors were inspected in source, never browser-verified here.
 * All recurrence-only test IDs and values below are proposed TEST BINDINGS,
 * not observed UI or extra product requirements. Reconcile during implementation.
 * Swedish scope labels come from the approved story. No invented HTTP endpoint.
 * playwright-utils deviation: true flag + absent dependency closes package gate;
 * use the existing guarded resourcePage fixture, not unavailable library imports.
 */
import { test, expect, novemberSlots, type BookingSeriesHarness, type SeriesScenario,
  type SeriesSnapshot, type OccurrenceRow } from "./support/booking-series-atdd";
import type { Page, Locator } from "@playwright/test";

async function dragSeriesProposal(page: Page, source: Locator, target: Locator): Promise<void> {
    await source.scrollIntoViewIfNeeded();
    const start = await source.evaluate(element => {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      const article = element.tagName === "ARTICLE";
      // Article padding belongs to its draggable surface, not nested edit/resize buttons.
      const x = rect.left + (article ? parseFloat(style.paddingLeft) / 2 : rect.width / 2);
      const y = rect.top + (article ? parseFloat(style.paddingTop) / 2 : rect.height / 2);
      const travel = 16; // Deliberate physical activation, independent of subsequent scrolling.
      const owns = (atX: number) => {
        if (!Number.isFinite(atX) || !Number.isFinite(y) || atX <= 0 || y <= 0 || atX >= innerWidth || y >= innerHeight) return false;
        const hit = document.elementFromPoint(atX, y);
        return hit?.closest('[draggable="true"]') === element &&
          (!article || !hit.closest('a, button, input, select, textarea, [contenteditable="true"]'));
      };
      const direction = owns(x + travel) ? 1 : owns(x - travel) ? -1 : 0;
      if (!element.matches('[draggable="true"]') || !owns(x) || !direction) return null;
      // Verify the entire activation corridor, not only endpoints.
      for (let step = 1; step <= travel; step++) if (!owns(x + direction * step)) return null;
      return { x, y, activatedX: x + direction * travel };
    });
    if (!start) throw new Error("Native booking drag has no visible source-owned activation corridor");
    await page.mouse.move(start.x, start.y);
    await page.mouse.down();
    try {
      await page.mouse.move(start.activatedX, start.y, { steps: 4 });
      await target.scrollIntoViewIfNeeded();
      const destination = await target.evaluate(element => {
        const rect = element.getBoundingClientRect(), x = rect.left + rect.width / 2, y = rect.top + rect.height / 2;
        const owns = (atX: number) => {
          if (atX <= 0 || y <= 0 || atX >= innerWidth || y >= innerHeight) return false;
          const hit = document.elementFromPoint(atX, y);
          return hit !== null && (hit === element || element.contains(hit));
        };
        // Two distinct moves within the real target produce native dragover before release.
        const insideX = owns(x + 2) ? x + 2 : owns(x - 2) ? x - 2 : null;
        return owns(x) && insideX !== null ? { x, y, insideX } : null;
      });
      if (!destination) throw new Error("Native booking drag target has no unobstructed visible drop area");
      await page.mouse.move(destination.x, destination.y, { steps: 8 });
      await page.mouse.move(destination.insideX, destination.y);
    } finally { await page.mouse.up(); }
  }

const editor = (page: Page) => page.getByRole("dialog").filter({ has: page.getByTestId("booking-editor") });
const preview = (page: Page) => editor(page).getByTestId("booking-recurrence-preview");
const scopeDialog = (page: Page) => page.getByRole("dialog").filter({has:page.getByTestId("booking-series-scope-dialog")});
const slot = (snapshot: SeriesSnapshot, date: string): OccurrenceRow => {
  const matches = snapshot.occurrences.filter(row => row.nominalDate === date);
  expect(matches, `exactly one durable nominal slot ${date}`).toHaveLength(1);
  return matches[0]!;
};

async function signIn(page: Page, s: SeriesScenario): Promise<void> {
  // playwright-utils deviation: no installed auth-session provider; real existing login.
  await page.goto("/login");
  await page.getByLabel("E-post").fill(s.credentials.email);
  await page.getByLabel("Lösenord").fill(s.credentials.password);
  await page.getByRole("button", { name: "Logga in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
}
async function scheduling(page: Page, date = "2026-11-02"): Promise<void> {
  await page.goto("/scheduling");
  await page.getByTestId("scheduling-view-schema").click();
  await page.getByLabel("Datum", { exact: true }).fill(date);
  await page.getByLabel("Period", { exact: true }).selectOption("day");
  await page.getByLabel("Status", { exact: true }).selectOption("all");
  await expect(page.getByText("Läser planering…", { exact: true })).toHaveCount(0);
}
async function draft(page: Page, s: SeriesScenario, count: 8 | 12 | 13): Promise<void> {
  const sheet = editor(page), first = novemberSlots(count)[0]!;
  await sheet.getByTestId("booking-description").fill(s.description);
  await sheet.getByTestId("booking-start").fill(first.startsLocal);
  await sheet.getByTestId("booking-end").fill(first.endsLocal);
  await sheet.getByTestId("booking-work-role").selectOption(s.workRoleId);
  await sheet.getByTestId(`booking-assignee-option-${s.assigneeId}`).check();
  // Proposed recurrence binding: existing standalone editor remains the host.
  await sheet.getByTestId("booking-recurrence-enabled").check();
  await sheet.getByTestId("booking-recurrence-preset").selectOption("weekly");
  for(const weekday of ["Mån","Tis","Ons","Tor","Fre","Lör"])await sheet.getByTestId("booking-recurrence-weekdays").getByRole("checkbox",{name:weekday,exact:true}).check();
  await sheet.getByTestId("booking-recurrence-end-mode").selectOption("count");
  await sheet.getByTestId("booking-recurrence-count").fill(String(count));
}
async function ready(page: Page, total: 8 | 12 | 13): Promise<void> {
  await expect(preview(page)).toHaveAttribute("data-state", "ready");
  await expect(preview(page)).toHaveAttribute("data-total", String(total));
  await expect(preview(page).getByTestId("booking-recurrence-preview-row")).toHaveCount(Math.min(10, total));
}
async function save(page: Page, h: BookingSeriesHarness, submitId: "booking-save" | "booking-retry" = "booking-save"): Promise<void> {
  const observed = await h.observeNextSave();
  await editor(page).getByTestId(submitId).click();
  await observed.committed;
  await expect(editor(page).getByTestId("booking-save-status")).toHaveText("Sparad i systemet");
  await expect(editor(page).getByTestId("booking-unsent")).toHaveCount(0);
  await editor(page).getByTestId("booking-close").click();
}
async function openOccurrence(page: Page, row: OccurrenceRow, scope: "Endast detta tillfälle" | "Detta och kommande"): Promise<void> {
  await scheduling(page, row.startsAt.slice(0, 10));
  await page.getByTestId(`scheduling-booking-${row.id}`).getByRole("button", { name: "Redigera / flytta", exact: true }).click();
  // Proposed dialog bindings; the two scope names are approved story wording.
  await expect(scopeDialog(page)).toHaveAttribute("role", "dialog");
  await scopeDialog(page).getByRole("radio", { name: scope, exact: true }).check();
  await scopeDialog(page).getByTestId("booking-series-scope-confirm").click();
  await expect(editor(page)).toBeVisible();
}

test.describe("Story 15.2 essential connected series smoke — RED", () => {
  test("[P0] 15.2-E2E-001 AC4 AC5 AC8 create, reload, edit/cancel exceptions, split, reload keeps real identities", async ({ resourcePage: page, bookingSeries: h }) => {
    const s = await h.seed("clean");
    await signIn(page, s);
    const before = await h.snapshot();
    await scheduling(page);
    await page.getByTestId("scheduling-new-booking").click();
    await draft(page, s, 8);
    await ready(page, 8);
    await save(page, h);
    await page.reload();
    const created = await h.snapshot();
    expect(created.series.length - before.series.length).toBe(1);
    expect(created.occurrences.length - before.occurrences.length).toBe(8);
    for (const expected of novemberSlots(8)) {
      expect(slot(created, expected.date)).toMatchObject({ startsAt: expected.startsAt, endsAt: expected.endsAt,
        description: s.description, status: "planned", isException: false, assigneeIds: [s.assigneeId] });
    }
    const sourceId = slot(created, "2026-11-02").seriesId;
    // Prefix exception, prefix tombstone, suffix exception, suffix tombstone.
    await openOccurrence(page, slot(created, "2026-11-02"), "Endast detta tillfälle");
    await editor(page).getByTestId("booking-description").fill(`${s.description} prefix exception`);
    await save(page, h);
    await openOccurrence(page, slot(created, "2026-11-03"), "Endast detta tillfälle");
    await editor(page).getByTestId("booking-status").selectOption("cancelled");
    await save(page, h);
    await openOccurrence(page, slot(created, "2026-11-06"), "Endast detta tillfälle");
    await editor(page).getByTestId("booking-start").fill("2026-11-06T10:00");
    await editor(page).getByTestId("booking-end").fill("2026-11-06T11:00");
    await save(page, h);
    await openOccurrence(page, slot(created, "2026-11-07"), "Endast detta tillfälle");
    await editor(page).getByTestId("booking-status").selectOption("cancelled");
    await save(page, h);
    const exceptions = await h.snapshot();
    expect(slot(exceptions, "2026-11-02")).toMatchObject({ id: slot(created, "2026-11-02").id, isException: true, description: `${s.description} prefix exception` });
    expect(slot(exceptions, "2026-11-03")).toMatchObject({ id: slot(created, "2026-11-03").id, isException: true, status: "cancelled" });
    expect(slot(exceptions, "2026-11-06")).toMatchObject({ id: slot(created, "2026-11-06").id, isException: true, startsAt: "2026-11-06T09:00:00.000000Z", endsAt: "2026-11-06T10:00:00.000000Z" });
    expect(slot(exceptions, "2026-11-07")).toMatchObject({ id: slot(created, "2026-11-07").id, isException: true, status: "cancelled" });

    await openOccurrence(page, slot(exceptions, "2026-11-05"), "Detta och kommande");
    await editor(page).getByTestId("booking-description").fill(`${s.description} successor`);
    await expect(preview(page)).toHaveAttribute("data-state", "ready");
    await save(page, h);
    await page.reload();
    const split = await h.snapshot();
    expect(split.series).toHaveLength(created.series.length + 1);
    expect(split.series.find(row => row.id === sourceId)).toMatchObject({ lastNominalDate: "2026-11-04" });
    const successor = split.series.filter(row => row.predecessorId === sourceId);
    expect(successor).toHaveLength(1);
    expect(split.occurrences).toHaveLength(created.occurrences.length);
    for (const row of exceptions.occurrences) {
      const after = slot(split, row.nominalDate);
      expect(after).toMatchObject({ id: row.id, startsAt: row.startsAt, endsAt: row.endsAt,
        status: row.status, isException: row.isException, assigneeIds: row.assigneeIds,
        seriesId: row.nominalDate < "2026-11-05" ? sourceId : successor[0]!.id,
        description: row.isException || row.nominalDate < "2026-11-05" ? row.description : `${s.description} successor` });
    }
    // Independent resource read model agrees after navigation/reload.
    await page.goto("/jobs");
    await page.reload();
    await expect(page.getByTestId(`booking-summary-${slot(split, "2026-11-06").id}`)).toContainText("avviker från serien");
    await expect(page.getByTestId(`booking-summary-${slot(split, "2026-11-07").id}`)).toContainText("Avbruten");
    await expect(page.getByTestId(`booking-summary-${slot(split, "2026-11-07").id}`)).toContainText("avviker från serien");
    expect(await h.snapshot()).toEqual(split);
  });

  test("[P0] 15.2-E2E-002 AC2 AC8 first ten have glyphs while complete warning review includes occurrence twelve", async ({ resourcePage: page, bookingSeries: h }) => {
    const s = await h.seed("warnings-after-ten");
    await signIn(page, s);
    const before = await h.snapshot();
    await page.goto("/jobs");
    await page.getByTestId("booking-entry-toolbar").click();
    await draft(page, s, 12);
    await ready(page, 12);
    const entries = preview(page).getByTestId("booking-recurrence-preview-row");
    for (const [index, expected] of novemberSlots(12).slice(0, 10).entries()) {
      await expect(entries.nth(index)).toHaveAttribute("data-nominal-date", expected.date);
      await expect(entries.nth(index).getByTestId("booking-series-conflict-glyph")).toHaveAccessibleName(s.glyphLabelsByDate[expected.date]!);
    }
    const warnings = editor(page).getByTestId("booking-conflict-panel").getByRole("article");
    expect(s.warnings.some(warning => warning.dates.includes("2026-11-14"))).toBe(true);
    await expect(warnings).toHaveCount(s.warnings.length);
    for (const warning of s.warnings) {
      const item = warnings.filter({ hasText: warning.label }).filter({hasText:warning.dates[0]!});
      await expect(item).toHaveCount(1);
      await expect(item).toContainText(warning.label);
      for (const date of warning.dates) await expect(item).toContainText(date);
      await item.getByRole("checkbox").setChecked(warning.selected);
    }
    // Full review and a reason are required even when no warning is selected.
    await editor(page).getByTestId("booking-save").click();
    await expect(editor(page).getByRole("alert")).toBeVisible();
    expect(await h.snapshot()).toEqual(before);
    await editor(page).getByTestId("booking-review-current-warnings").check();
    await editor(page).getByTestId("booking-override-reason").fill("Reviewed every occurrence, including warning after the first ten");
    await save(page, h, "booking-retry");
    await page.reload();
    const after = await h.snapshot();
    expect(after.occurrences.length - before.occurrences.length).toBe(12);
    for (const warning of s.warnings) {
      const persisted = after.conflicts.filter(row => row.logicalId === warning.logicalId);
      expect(persisted.length).toBeGreaterThan(0);
      expect(persisted.every(row => row.status === (warning.selected ? "accepted" : "open"))).toBe(true);
      for (const date of warning.dates) expect(persisted.some(row => row.occurrenceIds.includes(slot(after, date).id))).toBe(true);
    }
  });

  test("[P0] 15.2-E2E-003 AC2 AC8 pending, failed and obsolete preview cannot authorize the latest candidate", async ({ resourcePage: page, bookingSeries: h }) => {
    const s = await h.seed("preview-race");
    await signIn(page, s);
    const before = await h.snapshot();
    // Arm before navigation/action; adapter observes real action traffic only.
    const hold = await h.holdNextPreview({ count: 12, description: s.description });
    await scheduling(page);
    await page.getByTestId("scheduling-new-booking").click();
    await draft(page, s, 12);
    await hold.started;
    await expect(editor(page).getByTestId("booking-save")).toBeDisabled();
    await expect(editor(page).getByTestId("booking-unsent")).toHaveText("Utkast ej skickat");
    await hold.release();
    await ready(page, 12);
    await editor(page).getByTestId("booking-review-current-warnings").check();
    await editor(page).getByTestId("booking-override-reason").fill("Review applies to count twelve only");
    const race = await h.raceNextPreviews();
    await editor(page).getByTestId("booking-recurrence-count").fill("13");
    await race.olderStarted;
    await editor(page).getByTestId("booking-description").fill(`${s.description} latest`);
    await expect(editor(page).getByTestId("booking-save")).toBeDisabled();
    await race.releaseOlder();
    await race.newerStarted;
    await expect(editor(page).getByTestId("booking-save")).toBeDisabled();
    await race.releaseNewer();
    await race.settled;
    await ready(page, 13);
    await expect(preview(page)).toHaveAttribute("data-candidate-description", `${s.description} latest`);
    const latestWarnings = editor(page).getByTestId("booking-conflict-panel").getByRole("article");
    await expect(latestWarnings).toHaveCount(s.latestWarnings.length);
    for (const warning of s.latestWarnings) await expect(latestWarnings.filter({ hasText: warning.label }).filter({hasText:warning.dates[0]!})).toHaveCount(1);
    // The held older response cannot mark the latest candidate ready before its response.
    await expect(editor(page).getByTestId("booking-review-current-warnings")).not.toBeChecked();
    await expect(editor(page).getByTestId("booking-override-reason")).toHaveValue("");
    const failure = await h.failNextPreviewOnce();
    await editor(page).getByTestId("booking-recurrence-count").fill("12");
    await failure.failed;
    await expect(preview(page)).toHaveAttribute("data-state", "failed");
    await expect(editor(page).getByTestId("booking-save")).toBeDisabled();
    await expect(editor(page).getByTestId("booking-save-status")).toHaveCount(0);
    expect(await h.snapshot()).toEqual(before);
    await preview(page).getByTestId("booking-series-preview-retry").click();
    await ready(page, 12);
    await expect(editor(page).getByTestId("booking-description")).toHaveValue(`${s.description} latest`);
    expect(await h.snapshot()).toEqual(before);
  });

  test("[P0] 15.2-E2E-004 AC2 AC8 genuine review made stale by current facts rejects without partial writes", async ({ resourcePage: page, bookingSeries: h }) => {
    const s = await h.seed("warnings-after-ten");
    await signIn(page, s);
    await scheduling(page);
    await page.getByTestId("scheduling-new-booking").click();
    await draft(page, s, 12);
    await ready(page, 12);
    await editor(page).getByTestId("booking-review-current-warnings").check();
    await editor(page).getByTestId("booking-override-reason").fill("Current genuine review before owned peer facts change");
    await editor(page).getByTestId("booking-conflict-panel").getByRole("checkbox").first().check();
    await h.invalidateCurrentReviewByOwnedFactChange();
    const afterFactChange = await h.snapshot();
    const stale = await h.observeNextStaleSaveRejection();
    await editor(page).getByTestId("booking-save").click();
    await stale.rejected;
    await expect(editor(page).getByTestId("booking-save-error")).toBeVisible();
    await expect(editor(page).getByTestId("booking-save-status")).toHaveCount(0);
    await expect(editor(page).getByTestId("booking-unsent")).toBeVisible();
    await expect(editor(page).getByTestId("booking-description")).toHaveValue(s.description);
    expect(await h.snapshot()).toEqual(afterFactChange);
    // A stale save refreshes facts but never retries persistence or carries review.
    await ready(page, 12);
    await expect(editor(page).getByTestId("booking-review-current-warnings")).not.toBeChecked();
    await expect(editor(page).getByTestId("booking-override-reason")).toHaveValue("");
    for(const selection of await editor(page).getByTestId("booking-conflict-panel").getByRole("checkbox").all())await expect(selection).not.toBeChecked();
    // Fresh facts alone do not authorize persistence: the planner must review again.
    await editor(page).getByTestId("booking-retry").click();
    await expect(editor(page).getByTestId("booking-save-error")).toHaveText("Granska aktuella varningar och ange en orsak.");
    expect(await h.snapshot()).toEqual(afterFactChange);
    await editor(page).getByTestId("booking-review-current-warnings").check();
    await editor(page).getByTestId("booking-override-reason").fill("Explicit fresh review of the changed current facts");
    await save(page, h, "booking-retry");
    const saved = await h.snapshot();
    expect(saved.occurrences.length - afterFactChange.occurrences.length).toBe(12);
  });

  test("[P0] 15.2-E2E-005 AC8 lost committed response stays unknown until explicit exact retry with one durable result", async ({ resourcePage: page, bookingSeries: h }) => {
    const s = await h.seed("clean");
    await signIn(page, s);
    const before = await h.snapshot();
    const loss = await h.loseNextCommittedSaveResponseOnce();
    await scheduling(page);
    await page.getByTestId("scheduling-new-booking").click();
    await draft(page, s, 8);
    await ready(page, 8);
    await editor(page).getByTestId("booking-save").click();
    const attempt = await loss.committed;
    await expect(editor(page).getByTestId("booking-unresolved-save")).toBeVisible();
    await expect(editor(page).getByTestId("booking-unsent")).toBeVisible();
    await expect(editor(page).getByTestId("booking-save-status")).toHaveCount(0);
    await expect(editor(page).getByTestId("booking-description")).toHaveValue(s.description);
    await expect(editor(page).getByTestId("booking-description")).toBeDisabled();
    await expect(editor(page).getByTestId("booking-close")).toBeDisabled();
    await h.settleTransport();
    expect(h.attempts()).toEqual([attempt]); // No automatic replay/new command.
    const committed = await h.snapshot();
    expect(committed.series.length - before.series.length).toBe(1);
    expect(committed.occurrences.length - before.occurrences.length).toBe(8);
    expect(committed.outcomes.filter(row => row.commandId === attempt.commandId)).toHaveLength(1);
    expect(committed.audit.filter(row => row.targetId === attempt.proposedSeriesId && row.command === "createBookingSeries")).toHaveLength(1);
    expect(committed.occurrences.map(row => row.id).sort()).toEqual([...attempt.proposedOccurrenceIds].sort());
    const retry = await h.observeNextSave();
    await editor(page).getByTestId("booking-retry").click();
    const replay = await retry.committed;
    expect(replay).toEqual(attempt);
    expect(h.attempts()).toEqual([attempt, attempt]);
    await expect(editor(page).getByTestId("booking-save-status")).toHaveText("Sparad i systemet");
    expect(await h.snapshot()).toEqual(committed); // Includes raw rows, audit and outcome.
    await editor(page).getByTestId("booking-close").click();
    await page.reload();
    expect(await h.snapshot()).toEqual(committed);
  });

  test("[P1] 15.2-E2E-006 AC4 AC8 phone keyboard scopes, unsent failure and explicit retry preserve cancellation", async ({ resourcePage: page, bookingSeries: h }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    const s = await h.seed("existing-series");
    await signIn(page, s);
    const before = await h.snapshot();
    const row = before.occurrences.find(item => item.id === s.existingOccurrenceId)!;
    expect(row).toBeDefined();
    await page.goto("/jobs");
    const invoke = page.getByTestId(`booking-summary-${row.id}`).getByTestId("booking-edit");
    await invoke.focus();
    await invoke.press("Enter");
    const scope = scopeDialog(page);
    await expect(scope).toHaveAttribute("aria-modal", "true");
    const only = scope.getByRole("radio", { name: "Endast detta tillfälle", exact: true });
    const future = scope.getByRole("radio", { name: "Detta och kommande", exact: true });
    await expect(only).toBeFocused();
    await expect(future).toBeEnabled();
    await only.press("ArrowDown");
    await expect(future).toBeFocused();
    await future.press("Space");
    await expect(future).toBeChecked();
    await future.press("ArrowUp");
    await only.press("Space");
    await only.press("Tab");
    await expect(scope.getByTestId("booking-series-scope-confirm")).toBeFocused();
    await scope.getByTestId("booking-series-scope-confirm").press("Enter");
    await expect(editor(page).getByTestId("booking-work-role-filter")).toBeFocused();
    await editor(page).getByTestId("booking-status").selectOption("cancelled");
    await editor(page).getByTestId("booking-close").focus();
    await editor(page).getByTestId("booking-close").press("Enter");
    await expect(page.getByRole("alertdialog", { name: "Kasta utkast?" })).toBeVisible();
    await expect(editor(page).getByTestId("booking-keep-editing")).toBeFocused();
    await editor(page).getByTestId("booking-keep-editing").press("Enter");
    await expect(editor(page).getByTestId("booking-status")).toHaveValue("cancelled");
    expect(await h.snapshot()).toEqual(before);
    const failure = await h.failNextSaveBeforeCommitOnce();
    await editor(page).getByTestId("booking-save").click();
    await failure.failed;
    await expect(editor(page).getByTestId("booking-save-error")).toBeVisible();
    await expect(editor(page).getByTestId("booking-unsent")).toHaveText("Utkast ej skickat");
    await expect(editor(page).getByTestId("booking-save-status")).toHaveCount(0);
    await expect(editor(page).getByTestId("booking-status")).toHaveValue("cancelled");
    expect(await h.snapshot()).toEqual(before);
    const confirmed = await h.observeNextSave();
    await editor(page).getByTestId("booking-retry").focus();
    await editor(page).getByTestId("booking-retry").press("Enter");
    await confirmed.committed;
    await expect(editor(page).getByTestId("booking-save-status")).toHaveText("Sparad i systemet");
    await editor(page).getByTestId("booking-close").press("Enter");
    await page.reload();
    const after = await h.snapshot();
    expect(after.occurrences).toHaveLength(before.occurrences.length);
    expect(after.occurrences.find(item => item.id === row.id)).toMatchObject({ ...row, status: "cancelled", isException: true });
    for (const peer of before.occurrences.filter(item => item.id !== row.id)) expect(after.occurrences.find(item => item.id === peer.id)).toEqual(peer);
    await expect(page.getByTestId(`booking-summary-${row.id}`)).toContainText("Avbruten");
    await expect(page.getByTestId(`booking-summary-${row.id}`)).toContainText("avviker från serien");
    const bounds = await page.getByTestId(`booking-summary-${row.id}`).boundingBox();
    expect(bounds).not.toBeNull();
    expect(bounds!.x).toBeGreaterThanOrEqual(0);
    expect(bounds!.x + bounds!.width).toBeLessThanOrEqual(360);
  });
});

test("[P0] 15.2-E2E-007 stale following preview and save recover current metadata without losing draft or review boundary",async({resourcePage:page,bookingSeries:h})=>{
  const s=await h.seed('existing-series');await signIn(page,s);const initial=await h.snapshot();
  await openOccurrence(page,slot(initial,'2026-11-02'),'Detta och kommande');await ready(page,8);
  await h.invalidateCurrentSeriesByOwnedOccurrenceEdit();
  await editor(page).getByTestId('booking-description').fill(`${s.description} retained draft`);await ready(page,8);
  await h.invalidateCurrentReviewByOwnedFactChange();
  await editor(page).getByTestId('booking-description').fill(`${s.description} retained draft reviewed`);await ready(page,8);
  await editor(page).getByTestId('booking-review-current-warnings').check();
  await editor(page).getByTestId('booking-override-reason').fill('Old admission must be cleared');
  const warnings=editor(page).getByTestId('booking-conflict-panel').getByRole('article');await warnings.first().getByRole('checkbox').check();
  await h.invalidateCurrentSeriesByOwnedOccurrenceEdit();const before=await h.snapshot(),stale=await h.observeNextStaleSaveRejection();
  await editor(page).getByTestId('booking-save').click();await stale.rejected;expect(await h.snapshot()).toEqual(before);await ready(page,8);
  await expect(editor(page).getByTestId('booking-description')).toHaveValue(`${s.description} retained draft reviewed`);
  await expect(editor(page).getByTestId('booking-review-current-warnings')).not.toBeChecked();await expect(editor(page).getByTestId('booking-override-reason')).toHaveValue('');
  await expect(warnings.first().getByRole('checkbox')).not.toBeChecked();
  await editor(page).getByTestId('booking-retry').click();expect(await h.snapshot()).toEqual(before);
  await editor(page).getByTestId('booking-review-current-warnings').check();await editor(page).getByTestId('booking-override-reason').fill('Explicit new review');
  await save(page,h,'booking-retry');const after=await h.snapshot();expect(after.series.length).toBe(before.series.length+1);
  expect(after.occurrences.filter(row=>!row.isException).every(row=>row.description===`${s.description} retained draft reviewed`)).toBe(true);
});

test("[P0] 15.2-E2E-008 actual resource drag and resize proposals survive following scope and persist",async({resourcePage:page,bookingSeries:h})=>{
  await page.setViewportSize({width:1440,height:1000});const s=await h.seed('gesture-series');await signIn(page,s);
  await scheduling(page);await page.getByTestId('scheduling-view-resources').click();await expect(page.getByText('Läser planering…',{exact:true})).toHaveCount(0);
  const source=page.getByTestId(`resource-row-${s.assigneeId}`).getByTestId(`scheduling-booking-${s.existingOccurrenceId}`);
  const destination=page.getByTestId('resources-slot').and(page.locator(`[data-person="${s.replacementAssigneeId}"][data-start="2026-11-02T10:00:00.000000Z"]`));
  await dragSeriesProposal(page,source,destination);
  await expect(scopeDialog(page).getByRole('radio',{name:'Detta och kommande',exact:true})).toBeEnabled();
  await scopeDialog(page).getByRole('radio',{name:'Detta och kommande',exact:true}).check();await scopeDialog(page).getByTestId('booking-series-scope-confirm').click();await ready(page,8);
  await expect(editor(page).getByTestId('booking-start')).toHaveValue('2026-11-02T11:00');await expect(editor(page).getByTestId('booking-end')).toHaveValue('2026-11-02T12:00');
  await expect(editor(page).getByTestId(`booking-assignee-option-${s.replacementAssigneeId}`)).toBeChecked();await save(page,h);
  const moved=await h.snapshot();expect(moved.occurrences.every(row=>row.assigneeIds.length===1&&row.assigneeIds[0]===s.replacementAssigneeId&&row.startsAt.endsWith('T10:00:00.000000Z')&&row.endsAt.endsWith('T11:00:00.000000Z'))).toBe(true);
  await scheduling(page);await page.getByTestId('scheduling-view-resources').click();await expect(page.getByText('Läser planering…',{exact:true})).toHaveCount(0);
  const current=slot(moved,'2026-11-02');
  const resize=page.getByTestId(`resource-row-${s.replacementAssigneeId}`).getByTestId(`scheduling-booking-${current.id}`).getByTestId('scheduling-resize');
  const end=page.getByTestId('resources-slot').and(page.locator(`[data-person="${s.replacementAssigneeId}"][data-start="2026-11-02T13:30:00.000000Z"]`));
  await dragSeriesProposal(page,resize,end);await expect(scopeDialog(page).getByRole('radio',{name:'Detta och kommande',exact:true})).toBeEnabled();
  await scopeDialog(page).getByRole('radio',{name:'Detta och kommande',exact:true}).check();await scopeDialog(page).getByTestId('booking-series-scope-confirm').click();await ready(page,8);
  await expect(editor(page).getByTestId('booking-start')).toHaveValue('2026-11-02T11:00');await expect(editor(page).getByTestId('booking-end')).toHaveValue('2026-11-02T15:00');await save(page,h);
  expect((await h.snapshot()).occurrences.every(row=>row.startsAt.endsWith('T10:00:00.000000Z')&&row.endsAt.endsWith('T14:00:00.000000Z'))).toBe(true);
});

test("[P0] 15.2-E2E-009 effective inactive template assignee remains visible and removable for following edit",async({resourcePage:page,bookingSeries:h})=>{
  const s=await h.seed('retained-assignee');await signIn(page,s);const before=await h.snapshot();
  await openOccurrence(page,slot(before,'2026-11-02'),'Detta och kommande');
  const retained=editor(page).getByTestId(`booking-assignee-option-${s.assigneeId}`);await expect(retained).toBeVisible();await expect(retained).toBeChecked();
  await retained.click();await expect(retained).toHaveCount(0);await editor(page).getByTestId(`booking-assignee-option-${s.replacementAssigneeId}`).check();await ready(page,8);await save(page,h);
  const after=await h.snapshot();expect(after.occurrences.every(row=>row.assigneeIds.length===1&&row.assigneeIds[0]===s.replacementAssigneeId)).toBe(true);
  const target=h.attempts().at(-1)!.proposedSeriesId!;const defaults=after.rawOwnedRows!.booking_series!.find(row=>row.id===target)!.defaults as {assigneeIds:string[]};
  expect(defaults.assigneeIds).toEqual([s.replacementAssigneeId]);
});
