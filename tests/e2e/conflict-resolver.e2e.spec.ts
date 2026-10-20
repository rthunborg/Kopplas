/**
 * Story 15.3 essential production-host journeys: planned, unexecuted RED scaffolds.
 * Resume only after the actual resolver, migration and isolated fixture lane land;
 * reconcile the TEST-OWNED bindings below, then remove each test.skip deliberately.
 *
 * Confidence 7/10: frozen AC1–8; existing resourcePage, withBookingFixture,
 * bookingCommand and realSeriesInput/reviewRealSeries patterns were source-read.
 * No browser verification. Existing login/editor/date bindings were source-read;
 * every conflict-* test ID, resolver radio/checkbox label and ledger field below
 * is a provisional TEST CONTRACT, not an observed selector or production DTO.
 * Resolve those names against actual source before activation. Specifically bind
 * ledger command_id/actor_id/action/outcome/created_at/audit_event_id, notification
 * logical_subject_id to its immutable event, and actual Next-action input identity.
 * No fabricated command result, successful network stub or receipt-only evidence.
 * playwright-utils deviation: flag=true but package absent from package.json;
 * two-gate mandate is inactive. Reuse the existing guarded vanilla fixture.
 */
import { test, expect } from "./support/resource-cdp-attachment";
import type { Page, Request, Route } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { adminQuery } from "../factories/admin-sql";
import { bookingCommand, bookingInput, bookingSnapshot, seedBookingParents,
  withBookingFixture, type BookingFixture, type DurableRow } from "../support/bookings-atdd";
import { realSeriesInput, reviewRealSeries } from "../support/booking-series-atdd";
import { runCommand } from "@/server/commands/envelope";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";

const reason = "Reviewed the complete current conflict and agreed with affected staff";
const resolver = (page: Page) => page.getByTestId("conflict-resolver");
const detail = (page: Page) => resolver(page).getByTestId("conflict-detail");
const editor = (page: Page) => page.getByRole("dialog").filter({ has: page.getByTestId("booking-editor") });

/** Read physical rows independently, including private outcomes and both tenants. */
async function physical(fx: BookingFixture) {
  const read = async (table: "booking_series" | "booking_conflict_resolutions" | "notifications") =>
    (await adminQuery<{ row: DurableRow }>(`select to_jsonb(t) row from public.${table} t
      where tenant_id=any($1::uuid[]) order by tenant_id,id`, [fx.tenantIds])).map(x => x.row);
  const [base, series, resolutions, notifications] = await Promise.all([
    bookingSnapshot(fx.tenantIds), read("booking_series"), read("booking_conflict_resolutions"), read("notifications"),
  ]);
  return { ...base, series, resolutions, notifications };
}
type Snapshot = Awaited<ReturnType<typeof physical>>;

async function signIn(page: Page, fx: BookingFixture) {
  // playwright-utils deviation: no installed auth-session provider; actual login.
  await page.goto("/login");
  await page.getByLabel("E-post").fill(fx.base.adminA.email);
  await page.getByLabel("Lösenord").fill(fx.base.adminA.password);
  await page.getByRole("button", { name: "Logga in", exact: true }).click();
  await expect(page).toHaveURL(/\/dashboard$/);
  await page.goto("/scheduling");
  await page.getByTestId("scheduling-view-schema").click();
  await page.getByLabel("Datum", { exact: true }).fill("2026-10-12");
  await page.getByLabel("Period", { exact: true }).selectOption("day");
  await expect(page.getByText("Läser planering…", { exact: true })).toHaveCount(0);
}

/** Real existing checked setup; no resolver-derived expectations or fake rows. */
async function seed(fx: BookingFixture) {
  const parents = await seedBookingParents(fx.base.tenantA.id);
  const job = await runCommand(parents.createJob, { client: fx.adminClient as never,
    input: { customer_id: parents.customerId, title: "Resolver workshop job" } });
  if (!job.ok) throw new Error(`Actual checked job setup failed: ${job.code}`);
  for (const person of [fx.adminProfile.id, fx.ownProfile.id, fx.coworkerProfile.id]) {
    await adminQuery("update public.person_profiles set default_work_role_id=$3 where tenant_id=$1 and id=$2",
      [fx.base.tenantA.id, person, parents.workRoleId]);
    for (let weekday = 1; weekday <= 7; weekday++) await adminQuery(`insert into public.person_work_hours
      (tenant_id,person_profile_id,entry_kind,weekday,starts_at,ends_at) values($1,$2,'weekly_shift',$3,'07:00','17:00')`,
    [fx.base.tenantA.id, person, weekday]);
  }
  const add = async (description: string, startsAt: string, endsAt: string, assignees: string[]) => {
    const input = bookingInput(assignees, { description, startsAt, endsAt,
      workRoleId: parents.workRoleId, customerId: parents.customerId, jobId: job.data.targetId });
    const result = await bookingCommand("create", fx.adminClient, input);
    if (!result.ok) throw new Error(`Actual checked booking setup failed: ${result.code}`);
    return result.data.bookingId;
  };
  const marker = `Resolver ${randomUUID()}`;
  // Each pair is one complete logical group with its own affected person.
  // Group count and participants are literal setup oracles, not detector outputs.
  const move = await add(`${marker} move`, "2026-10-12T06:00:00Z", "2026-10-12T07:00:00Z", [fx.adminProfile.id]);
  const peer = await add(`${marker} peer`, "2026-10-12T06:30:00Z", "2026-10-12T07:30:00Z", [fx.adminProfile.id]);
  const accept = await add(`${marker} accept`, "2026-10-12T09:00:00Z", "2026-10-12T10:00:00Z", [fx.ownProfile.id]);
  const other = await add(`${marker} other`, "2026-10-12T09:30:00Z", "2026-10-12T10:30:00Z", [fx.ownProfile.id]);
  return { parents, marker, move, peer, accept, other, add };
}

/** The proposed row selector binds the chosen booking; never select arbitrary first. */
async function choose(page: Page, bookingId: string, bookingLabel: string) {
  await resolver(page).getByTestId(`conflict-for-booking-${bookingId}`).click();
  await detail(page).getByRole("radio", { name: bookingLabel, exact: true }).check();
}

async function committed(fx: BookingFixture, before: Snapshot) {
  await expect.poll(async () => (await physical(fx)).resolutions.length,
    { message: "one independently persisted resolver command, not an HTTP receipt" }).toBe(before.resolutions.length + 1);
  return physical(fx);
}

function event(before: Snapshot, after: Snapshot, fx: BookingFixture,
  action: "move" | "accept" | "series", outcome: "resolved" | "accepted" | "remaining", recipients: string[]) {
  const added = after.resolutions.filter(row => !before.resolutions.some(old => old.id === row.id));
  expect(added).toHaveLength(1);
  const row = added[0]!;
  // Provisional SQL projection names: reconcile with final migration, never alias a receipt.
  expect(row).toMatchObject({ tenant_id: fx.base.tenantA.id, actor_id: fx.base.adminA.id, action, outcome });
  expect(row.command_id).toEqual(expect.any(String));
  expect(row.created_at).toEqual(expect.stringMatching(/^\d{4}-\d\d-\d\dT/));
  expect(after.audit.filter(audit => audit.id === row.audit_event_id)).toHaveLength(1);
  const notes = after.notifications.filter(note => note.logical_subject_id === row.id);
  expect(notes.map(note => note.recipient_user_id).sort()).toEqual([...recipients].sort());
  expect(notes.every(note => note.category === "booking.changed")).toBe(true);
  expect(new Set(notes.map(note => note.id)).size).toBe(recipients.length);
  return row;
}

test.describe("15.3 essential resolver smoke — RED; all coverage planned/unexecuted", () => {
  test.skip("[P0] 15.3-E2E-001 AC1–6 chip → complete detail → fix/accept → reload/history/notification", async ({ resourcePage: page }) => {
    await withBookingFixture(async fx => {
      const s = await seed(fx);
      await signIn(page, fx);
      await page.getByRole("button", { name: "Konflikter (2)", exact: true }).click();
      await expect(resolver(page).getByTestId("conflict-scope")).toContainText("12 oktober 2026");
      await expect(resolver(page).getByTestId("conflict-queue-row")).toHaveCount(2);
      await expect(resolver(page).getByTestId("conflict-person-group")).toHaveCount(2);
      await choose(page, s.move, `${s.marker} move`);
      for (const id of [s.move, s.peer]) await expect(detail(page).getByTestId(`conflict-participant-${id}`)).toBeVisible();
      await expect(detail(page)).toContainText("Resolver workshop job");
      await expect(detail(page)).toContainText("Workshop customer");
      await expect(detail(page)).toContainText("Dubbelbokning");
      await expect(detail(page).getByTestId("conflict-breach-window")).toContainText("08:30");
      await detail(page).getByRole("button", { name: "Flytta", exact: true }).click();
      await expect(resolver(page).getByTestId("conflict-available-slot").first()).toContainText("ledig");
      // Manual explicit selection stays available; convenience suggestions confer no authority.
      await editor(page).getByTestId("booking-start").fill("2026-10-12T14:00");
      await editor(page).getByTestId("booking-end").fill("2026-10-12T15:00");
      await expect(resolver(page).getByTestId("conflict-preview")).toHaveAttribute("data-state", "ready");
      const beforeMove = await physical(fx);
      await resolver(page).getByTestId("conflict-confirm").click();
      const moved = await committed(fx, beforeMove);
      const fixed = event(beforeMove, moved, fx, "move", "resolved", [fx.base.adminA.id]);
      expect(moved.bookings.find(row => row.id === s.move)).toMatchObject({ starts_at: "2026-10-12T12:00:00+00:00", ends_at: "2026-10-12T13:00:00+00:00" });
      expect(moved.bookings.find(row => row.id === s.peer)).toEqual(beforeMove.bookings.find(row => row.id === s.peer));
      const targetKeys = beforeMove.conflicts.filter(row => row.booking_id === s.move || row.related_booking_id === s.move).map(row => row.natural_key);
      expect(targetKeys.length).toBeGreaterThan(0);
      const resolved = moved.conflicts.filter(row => targetKeys.includes(row.natural_key));
      expect(resolved).toHaveLength(targetKeys.length);
      expect(resolved.every(row => row.status === "resolved")).toBe(true);
      await choose(page, s.accept, `${s.marker} accept`);
      await detail(page).getByRole("button", { name: "Acceptera konflikt", exact: true }).click();
      await resolver(page).getByLabel("Orsak", { exact: true }).fill("   ");
      await expect(resolver(page).getByTestId("conflict-confirm")).toBeDisabled();
      await resolver(page).getByLabel("Orsak", { exact: true }).fill(reason);
      await resolver(page).getByRole("checkbox", { name: "Acceptera vald konflikt", exact: true }).check();
      const beforeAccept = await physical(fx);
      await resolver(page).getByTestId("conflict-confirm").click();
      const accepted = await committed(fx, beforeAccept);
      const decision = event(beforeAccept, accepted, fx, "accept", "accepted", [fx.users.montor.id]);
      expect(accepted.bookings).toEqual(beforeAccept.bookings); // Acceptance changes no booking/exception.
      expect(accepted.assignees).toEqual(beforeAccept.assignees);
      const acceptedKeys = beforeAccept.conflicts.filter(row => row.booking_id === s.accept || row.related_booking_id === s.accept).map(row => row.natural_key);
      expect(acceptedKeys.length).toBeGreaterThan(0);
      const selectedRows = accepted.conflicts.filter(row => acceptedKeys.includes(row.natural_key));
      expect(selectedRows).toHaveLength(acceptedKeys.length);
      expect(selectedRows.every(row => row.status === "accepted")).toBe(true);
      expect(accepted.conflicts.filter(row => !acceptedKeys.includes(row.natural_key)))
        .toEqual(beforeAccept.conflicts.filter(row => !acceptedKeys.includes(row.natural_key)));
      await page.reload();
      await expect(resolver(page).getByTestId("conflict-queue-row")).toHaveCount(0);
      await expect(resolver(page).getByTestId("conflict-last-checked")).toBeVisible();
      await resolver(page).getByRole("checkbox", { name: "Visa accepterade", exact: true }).check();
      await expect(resolver(page).getByTestId(`conflict-for-booking-${s.accept}`)).toHaveCount(1);
      await resolver(page).getByRole("tab", { name: "Händelser", exact: true }).click();
      for (const row of [fixed, decision]) await expect(resolver(page).getByTestId(`conflict-history-${row.id}`)).toContainText(String(row.created_at));
      await page.getByRole("button", { name: /^Notiser(?:,|$)/ }).click();
      await expect(page.getByRole("dialog", { name: "Notiser", exact: true })).toContainText(String(accepted.notifications.find(n => n.logical_subject_id === fixed.id)!.title));
      expect(await physical(fx)).toEqual(accepted); // Rendering/history reads add no duplicate effects.
    });
  });

  test.skip("[P0] 15.3-E2E-002 AC4 AC7 bounded common-series fix preserves IDs, exceptions and tombstones", async ({ resourcePage: page }) => {
    await withBookingFixture(async fx => {
      const s = await seed(fx);
      const baseInput = realSeriesInput(fx);
      const input = realSeriesInput(fx, { rule: { ...baseInput.rule, count: 4 }, template: { ...baseInput.template,
        workRoleId: s.parents.workRoleId, description: `${s.marker} series`, assigneeIds: [fx.coworkerProfile.id] } });
      const review = await reviewRealSeries(fx, input);
      const created = await runCommand(createBookingSeries, { client: fx.adminClient as never, input: review.input });
      if (!created.ok) throw new Error(`Actual checked series setup failed: ${created.code}`);
      const ids = created.data.occurrenceIds;
      expect(ids).toHaveLength(4);
      const original = await physical(fx);
      // Two existing occurrence edits create one exception and one cancelled tombstone.
      for (const [id, status] of [[ids[2]!, "planned"], [ids[3]!, "cancelled"]] as const) {
        const row = original.bookings.find(b => b.id === id)!;
        const changed = await bookingCommand("update", fx.adminClient, bookingInput([fx.coworkerProfile.id], {
          bookingId: id, startsAt: String(row.starts_at), endsAt: String(row.ends_at),
          workRoleId: s.parents.workRoleId, description: `${s.marker} retained ${status}`, status,
        }));
        if (!changed.ok) throw new Error(`Actual checked occurrence setup failed: ${changed.code}`);
      }
      await s.add(`${s.marker} series peer`, "2026-10-12T05:30:00Z", "2026-10-12T06:30:00Z", [fx.coworkerProfile.id]);
      await s.add(`${s.marker} sibling peer`, "2026-10-13T05:30:00Z", "2026-10-13T06:30:00Z", [fx.coworkerProfile.id]);
      const before = await physical(fx);
      await signIn(page, fx);
      await page.getByRole("button", { name: /^Konflikter \(\d+\)$/ }).click();
      await choose(page, ids[0]!, `${s.marker} series`);
      await detail(page).getByRole("button", { name: "Åtgärda hela serien", exact: true }).click();
      await editor(page).getByTestId("booking-start").fill("2026-10-12T14:00");
      await editor(page).getByTestId("booking-end").fill("2026-10-12T15:00");
      await expect(resolver(page).getByTestId("conflict-preview")).toHaveAttribute("data-state", "ready");
      for (const id of ids.slice(2)) await expect(resolver(page).getByTestId(`conflict-preserved-occurrence-${id}`)).toBeVisible();
      await resolver(page).getByTestId("conflict-confirm").click();
      const after = await committed(fx, before);
      event(before, after, fx, "series", "resolved", [fx.users.projektledare.id]);
      expect(after.bookings.filter(b => b.series_id === input.seriesId).map(b => b.id).sort()).toEqual([...ids].sort());
      for (const [index, date] of ["2026-10-12", "2026-10-13"].entries()) {
        expect(after.bookings.find(b => b.id === ids[index])).toMatchObject({ series_id: input.seriesId,
          starts_at: `${date}T12:00:00+00:00`, ends_at: `${date}T13:00:00+00:00`, is_exception: false });
      }
      for (const id of ids.slice(2)) expect(after.bookings.find(b => b.id === id)).toEqual(before.bookings.find(b => b.id === id));
      const segment = after.series.find(row => row.id === input.seriesId)!;
      expect(segment).toMatchObject({ predecessor_id: null, successor_id: null, rule: before.series.find(row => row.id === input.seriesId)!.rule });
      expect(after.bookings.filter(b => b.series_id !== input.seriesId)).toEqual(before.bookings.filter(b => b.series_id !== input.seriesId));
      expect(after.conflicts.filter(c => c.status === "accepted")).toEqual(before.conflicts.filter(c => c.status === "accepted"));
      await page.reload();
      expect(await physical(fx)).toEqual(after);
      // >10-warning review, DST and segmented lineage permutations remain REQUIRED
      // DEVELOPMENT integration activation gaps, never deferred release coverage.
    });
  });

  test.skip("[P1] 15.3-E2E-003 AC5 AC8 connected 360×640 keyboard failure retains input until explicit retry", async ({ resourcePage: page }) => {
    await withBookingFixture(async fx => {
      const s = await seed(fx);
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, fx);
      const chip = page.getByRole("button", { name: "Konflikter (2)", exact: true });
      await chip.focus(); await chip.press("Enter");
      const row = resolver(page).getByTestId(`conflict-for-booking-${s.accept}`);
      await row.focus(); await row.press("Enter");
      const target = detail(page).getByRole("radio", { name: `${s.marker} accept`, exact: true });
      await target.focus(); await target.press("Space");
      const accept = detail(page).getByRole("button", { name: "Acceptera konflikt", exact: true });
      await accept.focus(); await accept.press("Enter");
      const input = resolver(page).getByLabel("Orsak", { exact: true });
      await input.fill(reason);
      const selected = resolver(page).getByRole("checkbox", { name: "Acceptera vald konflikt", exact: true });
      await selected.focus(); await selected.press("Space");
      const before = await physical(fx), attempts: Record<string, unknown>[] = [];
      const businessInput = (request: Request): Record<string, unknown> | null => {
        if (request.method() !== "POST" || !request.headers()["next-action"]) return null;
        try { const data = JSON.parse(request.postData() ?? "null")?.[0];
          return typeof data?.commandId === "string" ? data : null; } catch { return null; }
      };
      // TEST binding: confirm invokes the actual Next action carrying commandId.
      // Abort once BEFORE server execution. Never fulfill a successful response.
      const intercept = async (route: Route) => {
        const data = businessInput(route.request());
        if (!data) { await route.continue(); return; }
        attempts.push(data); await route.abort("failed");
        await page.unroute("**/*", intercept);
      };
      const observeRetry = (request: Request) => { const data = businessInput(request); if (data) attempts.push(data); };
      await page.route("**/*", intercept);
      try {
        await resolver(page).getByTestId("conflict-confirm").focus();
        await resolver(page).getByTestId("conflict-confirm").press("Enter");
        await expect(resolver(page).getByRole("alert")).toBeVisible();
        await expect(resolver(page).getByTestId("conflict-unsent")).toBeVisible();
        await expect(resolver(page).getByTestId("conflict-success")).toHaveCount(0);
        await expect(input).toHaveValue(reason);
        await expect(selected).toBeChecked();
        expect(await physical(fx)).toEqual(before);
        expect(attempts).toHaveLength(1);
        page.on("request", observeRetry);
        const retry = resolver(page).getByRole("button", { name: "Försök igen", exact: true });
        await retry.focus(); await expect(retry).toBeFocused(); await retry.press("Enter");
        const after = await committed(fx, before);
        const decision = event(before, after, fx, "accept", "accepted", [fx.users.montor.id]);
        expect(attempts).toHaveLength(2);
        expect(attempts[1]).toEqual(attempts[0]); // Stable command and unchanged reviewed input.
        expect(decision.command_id).toBe(attempts[0]!.commandId);
        expect(after.bookings).toEqual(before.bookings);
        expect(after.assignees).toEqual(before.assignees);
        await expect(resolver(page).getByTestId("conflict-success")).toBeVisible();
        await page.reload(); expect(await physical(fx)).toEqual(after);
        await resolver(page).getByRole("checkbox", { name: "Visa accepterade", exact: true }).check();
        await expect(resolver(page).getByTestId(`conflict-for-booking-${s.accept}`)).toBeVisible();
      } finally { page.off("request", observeRetry); await page.unroute("**/*", intercept); }
    });
  });
});
