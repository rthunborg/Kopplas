/**
 * Story16.4 RED essential actual BookingEntry -> BookingEditor consumers.
 * Spec SHA256 a722320bc86a1e5e1b75f216b87d3a8a64eeb5f5170bbea930ef1dd45364ad13.
 * These are skipped acceptance scaffolds, not executed coverage.
 * NEW/REPLACEABLE assumptions: booking-job-presence/earliest-hint/desired-warning/
 * latest-breach and booking-demand-{total,allocated,residual,capacity,shortfall}
 * IDs and Swedish hint copy. Reconcile actual accessible presentation and DTO/
 * Next-action serialization before activation. Never add an isolated test widget
 * or test-only route to satisfy these journeys. Existing booking entry, editor,
 * options retry, inputs, preview/save/summary selectors are inspected source.
 *
 * playwright-utils deviations: flag=true/package absent, two-gate mandate inactive.
 * Use resourcePage, existing login/real normal-JWT fixtures, test.step, bounded
 * expect.poll and exact Next action observation/real-response hold. No package or
 * merged fixture added. No service/browser/DB work happens during collection.
 * Pure/API suites own arithmetic/DST/pool/role/proof matrices; browser owns only
 * these two essential usable flows. No exhaustive release/visual/manual gate.
 */
import { test, expect } from "../support/resource-cdp-attachment";
import type { Locator, Page, Request, Route } from "@playwright/test";
import { createJobsDepthFixture, type JobsDepthFixture } from "../../support/jobs-depth-atdd";
import { demandScenario, jobSemanticsSnapshot, readBookingSemantics, saveCard } from "../../support/job-semantics-atdd";
import type { BookingInput } from "../../support/bookings-atdd";

type Credentials = { email: string; password: string };
// playwright-utils deviation: project auth-session provider/package absent.
async function signIn(page: Page, credentials: Credentials) {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in", exact: true });
  await ready(submit);
  await page.getByLabel("E-post", { exact: true }).fill(credentials.email);
  await page.getByLabel("Lösenord", { exact: true }).fill(credentials.password);
  await submit.click();
  await expect(page).not.toHaveURL(/\/login(?:\?|$)/);
}
// playwright-utils deviation: bounded observable condition, never a fixed delay.
async function ready(locator: Locator) {
  await locator.waitFor({ state: "visible" });
  await expect.poll(() => locator.evaluate(element =>
    Object.keys(element).some(key => key.startsWith("__react"))), { timeout: 10_000 }).toBe(true);
}
async function openJobBooking(page: Page, jobId: string) {
  await page.goto(`/jobs/${jobId}`);
  const entry = page.getByTestId("booking-entry-job");
  await ready(entry);
  await entry.click();
  const form = page.getByTestId("booking-editor");
  await expect(form).toBeVisible();
  await expect(form.getByTestId("booking-job")).toHaveValue(jobId);
  return form;
}
function action(request: Request, jobId: string, description: string, operation: "preview" | "save", selectedJobId=jobId): BookingInput | null {
  if (request.method() !== "POST" || !request.headers()["next-action"]
    || new URL(request.url()).pathname !== `/jobs/${jobId}`) return null;
  try {
    const args: unknown = JSON.parse(request.postData() ?? "null");
    if (!Array.isArray(args) || args.length !== 1 || !args[0] || typeof args[0] !== "object") return null;
    const candidate = args[0] as Record<string, unknown>;
    return candidate.jobId === selectedJobId && candidate.description === description && Array.isArray(candidate.assigneeIds)
      && typeof candidate.commandId === "string"
      && (operation === "save" ? "editorReview" in candidate : !("editorReview" in candidate))
      ? candidate as BookingInput : null;
  } catch { return null; }
}
async function elapsed(form: Locator) {
  const start = await form.getByTestId("booking-start").inputValue();
  const end = await form.getByTestId("booking-end").inputValue();
  // Same ordinary October local date: pure suite owns Stockholm/DST conversion.
  return (Date.parse(end + ":00Z") - Date.parse(start + ":00Z")) / 60_000;
}
async function presence(form: Locator, state: "required" | "not-required" | "unknown") {
  const hint = form.getByTestId("booking-job-presence");
  await expect(hint).toHaveAttribute("data-state", state); // replaceable presentation seam
  await expect(hint).toContainText(state === "required" ? /krävs/i : state === "not-required" ? /krävs inte/i : /okänd|okänt/i);
}
async function advice(form: Locator, values: readonly number[]) {
  for (const [index, name] of ["total", "allocated", "residual", "capacity", "shortfall"].entries()) {
    // Units are person-minutes throughout; plain values avoid layout/rounding assertions.
    await expect(form.getByTestId(`booking-demand-${name}`)).toHaveAttribute("data-person-minutes", String(values[index]));
  }
}
async function schedule(f: JobsDepthFixture, people: readonly string[]) {
  for (const id of people) {
    const result = await f.fx.adminClient.rpc("save_person_schedule_with_audit", {
      p_tenant_id: f.fx.base.tenantA.id, p_actor_user_id: f.fx.base.adminA.id,
      p_correlation_id: crypto.randomUUID(), p_person_profile_id: id,
      p_schedule: [1, 2, 3, 4, 5].map(weekday => ({ weekday, start: "08:00", end: "16:00", breaks: [] })),
    });
    if (result.error) throw result.error;
  }
}
// playwright-utils deviation: observe exact actual save before triggering; persisted
// readback, not HTTP200 alone, proves success.
async function save(page: Page, form: Locator, jobId: string, description: string) {
  await expect(form.getByTestId("booking-save")).toBeEnabled();
  const reply = page.waitForResponse(response => action(response.request(), jobId, description, "save") !== null);
  await form.getByTestId("booking-save").click();
  const response = await reply;
  expect(response.ok()).toBe(true);
  await expect(form.getByTestId("booking-save-status")).toContainText("Sparad i systemet");
  return action(response.request(), jobId, description, "save")!;
}

test.describe("Story16.4 essential real booking consumers — RED", () => {
  test("[P0] 16.4-Consumer-E01 actual job entry defaults D120 elapsed; job changes refresh only untouched defaults, and explicit/edit intervals plus distinct hints persist", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    try {
      await page.setViewportSize({ width: 360, height: 640 });
      const known = f.jobs.editable.id, other = f.jobs.memberOrder.id, unknown = f.jobs.unrelated.id;
      const common = { planned_start_date: "2026-10-20", planned_end_date: "2026-10-22",
        earliest_date: "2026-10-19", desired_date: "2026-10-20", latest_date: "2026-10-21",
        requiredWorkRoleIds: [], accessWindows: null };
      await saveCard(f, known, { ...common, estimated_duration_minutes: 120, crew_size: 2,
        planned_travel_minutes: 30, customer_presence_required: true });
      await saveCard(f, other, { ...common, estimated_duration_minutes: 90, customer_presence_required: false });
      await saveCard(f, unknown, { ...common, estimated_duration_minutes: null, customer_presence_required: null });
      await page.clock.setFixedTime(new Date("2026-10-18T06:00:00Z"));
      await schedule(f, [f.fx.ownProfile.id]);
      await signIn(page, f.credentials.manager);
      const form = await openJobBooking(page, known); // actual BookingEntry host, no isolated widget
      await expect.poll(() => elapsed(form)).toBe(120); // D, neither N*D=240 nor D+T=150
      await presence(form, "required");
      const initialStart = await form.getByTestId("booking-start").inputValue();
      await expect(form.getByTestId("booking-job-earliest-hint")).toContainText("2026-10-19");
      expect(initialStart).toBe("2026-10-19T08:00");
      await form.getByTestId("booking-job").selectOption(other);
      await expect.poll(() => elapsed(form)).toBe(90);
      await expect(form.getByTestId("booking-start")).toHaveValue(initialStart);
      await presence(form, "not-required");
      await form.getByTestId("booking-job").selectOption(unknown);
      await expect.poll(() => elapsed(form)).toBe(60); // honest existing fallback, no known estimate
      await presence(form, "unknown");
      await form.getByTestId("booking-job").selectOption(known);
      await expect.poll(() => elapsed(form)).toBe(120);

      // Explicit end/user-edited interval is retained when selected-job hints change.
      await form.getByTestId("booking-start").fill("2026-10-22T08:00");
      await form.getByTestId("booking-end").fill("2026-10-22T09:15");
      for (const id of [other, unknown, known]) {
        await form.getByTestId("booking-job").selectOption(id);
        await expect(form.getByTestId("booking-start")).toHaveValue("2026-10-22T08:00");
        await expect(form.getByTestId("booking-end")).toHaveValue("2026-10-22T09:15");
      }
      await presence(form, "required");
      await expect(form.getByTestId("booking-job-desired-warning")).toContainText("2026-10-20");
      await expect(form.getByTestId("booking-job-latest-breach")).toContainText("2026-10-21");
      await expect(form.getByTestId("booking-job-earliest-hint")).toContainText("2026-10-19");
      const description = `16.4 explicit interval ${known}`;
      await form.getByTestId("booking-description").fill(description);
      const preview = page.waitForResponse(reply => action(reply.request(), known, description, "preview") !== null);
      await form.getByTestId(`booking-assignee-option-${f.fx.ownProfile.id}`).check();
      expect((await preview).ok()).toBe(true);
      await expect(form.getByTestId("booking-review-current-warnings")).toHaveCount(0);
      await expect(form.getByTestId("booking-override-reason")).toHaveCount(0);
      const before = await jobSemanticsSnapshot(f);
      const sent = await save(page, form, known, description); // date warnings do not create hard save prohibition
      expect(sent).toMatchObject({ jobId: known, startsAt: "2026-10-22T06:00:00.000Z", endsAt: "2026-10-22T07:15:00.000Z" });
      const after = await jobSemanticsSnapshot(f);
      const rows = after.bookings.filter(row => !before.bookings.some(old => old.id === row.id));
      expect(rows).toEqual([expect.objectContaining({ job_id: known, description,
        starts_at: "2026-10-22T06:00:00+00:00", ends_at: "2026-10-22T07:15:00+00:00" })]);
      expect(after.conflicts).toEqual(before.conflicts); // soft date/demand advice is never persisted conflict debt
      const bookingId = String(rows[0].id);
      await saveCard(f, known, { ...common, estimated_duration_minutes: 180, customer_presence_required: true });
      await page.reload();
      await page.getByTestId(`booking-summary-${bookingId}`).getByTestId("booking-edit").click();
      const reopened = page.getByTestId("booking-editor");
      await expect(reopened.getByTestId("booking-start")).toHaveValue("2026-10-22T08:00");
      await expect(reopened.getByTestId("booking-end")).toHaveValue("2026-10-22T09:15");
      await expect.poll(() => elapsed(reopened)).toBe(75);
      await presence(reopened, "required");
    } finally { await f.dispose(); }
  });

  test("[P0] 16.4-Consumer-E02 actual capacity advice counts candidate once; preview/save/reload stays advisory and stale responses retain the newer draft", async ({ resourcePage: page }) => {
    const f = await createJobsDepthFixture();
    let hold: ((route: Route) => Promise<void>) | undefined;
    let release = () => {};
    try {
      const s = await demandScenario(f, 360, 120, 240);
      await saveCard(f, s.jobId, { planned_start_date: "2026-10-20", planned_end_date: "2026-10-20",
        earliest_date: "2026-10-19", desired_date: "2026-10-20", latest_date: "2026-10-21",
        accessWindows: null, requiredWorkRoleIds: [] });
      if (!s.currentBookingId) throw new Error("Real current booking required");
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, f.credentials.manager);
      await page.goto(`/jobs/${s.jobId}`);
      const summary = page.getByTestId(`booking-summary-${s.currentBookingId}`);
      await ready(summary);
      await summary.getByTestId("booking-edit").click();
      let form = page.getByTestId("booking-editor");
      for (const id of s.people) await expect(form.getByTestId(`booking-assignee-option-${id}`)).toBeChecked();
      await advice(form, [300, 120, 180, 120, 60]);
      const description = `16.4 matched pool ${s.jobId}`;
      const preview = page.waitForResponse(reply => action(reply.request(), s.jobId, description, "preview") !== null);
      await form.getByTestId("booking-description").fill(description);
      expect((await preview).ok()).toBe(true);
      await advice(form, [300, 120, 180, 120, 60]);
      await expect(form.getByTestId("booking-review-current-warnings")).toHaveCount(0);
      await expect(form.getByTestId("booking-override-reason")).toHaveCount(0);
      const before = await jobSemanticsSnapshot(f);
      const sent = await save(page, form, s.jobId, description);
      expect(sent.bookingId).toBe(s.currentBookingId);
      const after = await jobSemanticsSnapshot(f);
      expect(after.bookings).toHaveLength(before.bookings.length);
      expect(after.conflicts).toEqual(before.conflicts);
      expect(after.audit.length - before.audit.length).toBe(1);
      // Supplemental readback uses the actual production consumer, never local arithmetic.
      const checked = await readBookingSemantics(f.fx.plannerClient, { ...sent, intervalSource: "existing" });
      expect(checked.advisory).toEqual({ state: "known", totalDemand: 300, allocatedCurrentJob: 120,
        remainingDemand: 180, remainingCapacity: 120, shortfall: 60 });
      await page.reload();
      await summary.getByTestId("booking-edit").click();
      form = page.getByTestId("booking-editor");
      await advice(form, [300, 120, 180, 120, 60]);

      const oldDraft = `old preview ${s.jobId}`, newerDraft = `new unsent draft ${s.jobId}`;
      let reached!: () => void;
      const captured = new Promise<void>(resolve => { reached = resolve; });
      const released = new Promise<void>(resolve => { release = resolve; });
      let used = false;
      // playwright-utils deviation: hold one genuine old preview response, not a
      // synthesized result; exact predicate is armed before editing triggers it.
      hold = async route => {
        if (used || !action(route.request(), s.jobId, oldDraft, "preview")) { await route.continue(); return; }
        used = true;
        const actual = await route.fetch();
        expect(actual.ok()).toBe(true);
        reached();
        await released;
        await route.fulfill({ response: actual });
      };
      await page.route("**/*", hold);
      await form.getByTestId("booking-description").fill(oldDraft);
      await captured;
      await saveCard(f, s.jobId, { estimated_duration_minutes: 150, crew_size: 2, planned_travel_minutes: 10,
        planned_start_date: "2026-10-20", planned_end_date: "2026-10-20", earliest_date: "2026-10-19",
        desired_date: "2026-10-20", latest_date: "2026-10-21", customer_presence_required: false,
        accessWindows: null, requiredWorkRoleIds: [] });
      const noBookingWrite = await jobSemanticsSnapshot(f);
      const newestPreview = page.waitForResponse(reply => action(reply.request(), s.jobId, newerDraft, "preview") !== null);
      await form.getByTestId("booking-description").fill(newerDraft);
      release();
      expect((await newestPreview).ok()).toBe(true);
      await expect(form.getByTestId("booking-description")).toHaveValue(newerDraft);
      await expect(form.getByTestId("booking-save-status")).toHaveCount(0);
      await form.getByTestId("booking-options-retry").click();
      await presence(form, "not-required");
      await advice(form, [320, 120, 200, 120, 80]);
      await expect(form.getByTestId("booking-description")).toHaveValue(newerDraft);
      expect((await jobSemanticsSnapshot(f)).bookings).toEqual(noBookingWrite.bookings);
      await expect(form.getByTestId("booking-review-current-warnings")).toHaveCount(0);
      await expect(form.getByTestId("booking-override-reason")).toHaveCount(0);
      const currentSave = await save(page, form, s.jobId, newerDraft);
      expect(currentSave.bookingId).toBe(s.currentBookingId);
      const final = await jobSemanticsSnapshot(f);
      expect(final.bookings).toHaveLength(noBookingWrite.bookings.length);
      expect(final.bookings.find(row => row.id === s.currentBookingId)?.description).toBe(newerDraft);
      expect(final.conflicts).toEqual(noBookingWrite.conflicts);
      expect(final.audit.length - noBookingWrite.audit.length).toBe(1);
      await page.reload();
      await summary.getByTestId("booking-edit").click();
      await expect(page.getByTestId("booking-description")).toHaveValue(newerDraft);
      await advice(page.getByTestId("booking-editor"), [320, 120, 200, 120, 80]);
      await presence(page.getByTestId("booking-editor"), "not-required");
    } finally {
      release();
      if (hold) await page.unroute("**/*", hold);
      await f.dispose();
    }
  });

  test("[P0] 16.4-Consumer-E03 actual new defaults follow earliest and CRM clears; delayed options preserve newer job/interval edits",async({resourcePage:page})=>{
    const f=await createJobsDepthFixture();let hold:((route:Route)=>Promise<void>)|undefined;let release=()=>{};
    try {
      const known=f.jobs.editable.id,other=f.jobs.memberOrder.id;
      await saveCard(f,known,{estimated_duration_minutes:120,earliest_date:"2026-10-20",accessWindows:null,requiredWorkRoleIds:[]});
      await saveCard(f,other,{estimated_duration_minutes:90,earliest_date:"2026-10-22",accessWindows:null,requiredWorkRoleIds:[]});
      await page.clock.setFixedTime(new Date("2026-10-18T06:00:00Z"));
      await signIn(page,f.credentials.manager);const form=await openJobBooking(page,known);
      await expect(form.getByTestId("booking-start")).toHaveValue("2026-10-20T08:00");await expect.poll(()=>elapsed(form)).toBe(120);
      await form.getByTestId("booking-job").selectOption(other);
      await expect(form.getByTestId("booking-start")).toHaveValue("2026-10-22T08:00");await expect.poll(()=>elapsed(form)).toBe(90);
      await saveCard(f,other,{estimated_duration_minutes:90,earliest_date:"2026-10-23",accessWindows:null,requiredWorkRoleIds:[]});
      await form.getByTestId("booking-description").fill("Refresh current earliest");
      await expect(form.getByTestId("booking-start")).toHaveValue("2026-10-23T08:00");await expect.poll(()=>elapsed(form)).toBe(90);
      for(const field of ["customer","facility","contact"]) {
        const control=form.getByTestId(`booking-${field}`);await control.selectOption(await control.inputValue());
        await expect(form.getByTestId("booking-job")).toHaveValue("");await expect.poll(()=>elapsed(form)).toBe(60);
        await form.getByTestId("booking-job").selectOption(other);await expect.poll(()=>elapsed(form)).toBe(90);
      }
      let reached!:()=>void;const captured=new Promise<void>(resolve=>{reached=resolve;}),released=new Promise<void>(resolve=>{release=resolve;});let used=false;
      hold=async route=>{
        const request=route.request();let args:unknown;try{args=JSON.parse(request.postData() ?? "null");}catch{}
        if(used || request.method() !== "POST" || !request.headers()["next-action"] || new URL(request.url()).pathname !== `/jobs/${known}` || !Array.isArray(args) || args.length !== 0){await route.continue();return;}
        used=true;const actual=await route.fetch();expect(actual.ok()).toBe(true);reached();await released;await route.fulfill({response:actual});
      };
      await page.route("**/*",hold);await form.getByTestId("booking-options-retry").click();await captured;
      await form.getByTestId("booking-start").fill("2026-10-24T10:00");await form.getByTestId("booking-end").fill("2026-10-24T10:45");
      await form.getByTestId("booking-job").selectOption(known);await form.getByTestId("booking-description").fill("new interval retained after options");
      release();await expect(form.getByTestId("booking-options-retry")).toBeEnabled();
      await expect(form.getByTestId("booking-job")).toHaveValue(known);await expect(form.getByTestId("booking-start")).toHaveValue("2026-10-24T10:00");await expect(form.getByTestId("booking-end")).toHaveValue("2026-10-24T10:45");
      await expect(form.getByTestId("booking-save-status")).toHaveCount(0);
    } finally {release();if(hold)await page.unroute("**/*",hold);await f.dispose();}
  });
  test("[P0] 16.4-Consumer-E04 untouched fold start and same-wall-time changed end retain canonical UTC defaults",async({resourcePage:page})=>{
    const f=await createJobsDepthFixture();
    try {
      const known=f.jobs.editable.id,other=f.jobs.memberOrder.id;
      await saveCard(f,known,{estimated_duration_minutes:60,earliest_date:null,desired_date:null,latest_date:null,accessWindows:null,requiredWorkRoleIds:[]});
      await saveCard(f,other,{estimated_duration_minutes:60,earliest_date:null,desired_date:null,latest_date:null,accessWindows:null,requiredWorkRoleIds:[]});
      await page.clock.setFixedTime(new Date("2026-10-25T01:30:00Z"));await signIn(page,f.credentials.manager);
      let form=await openJobBooking(page,known);await expect.poll(()=>elapsed(form)).toBe(60);
      const identity="second fold start retained";await form.getByTestId("booking-description").fill(identity);
      const changed=page.waitForRequest(request=>{const input=action(request,known,identity,"preview",other);return input?.jobId===other && input.startsAt==="2026-10-25T01:00:00.000Z" && input.endsAt==="2026-10-25T02:00:00Z";});
      await form.getByTestId("booking-job").selectOption(other);await changed;
      await expect(form.getByTestId("booking-start")).toHaveValue("2026-10-25T02:00");await expect(form.getByTestId("booking-end")).toHaveValue("2026-10-25T03:00");
      await saveCard(f,known,{estimated_duration_minutes:30,earliest_date:null,desired_date:null,latest_date:null,accessWindows:null,requiredWorkRoleIds:[]});
      await form.getByTestId("booking-close").click();await form.getByTestId("booking-discard").click();
      await page.clock.setFixedTime(new Date("2026-10-25T00:00:00Z"));form=await openJobBooking(page,known);
      await expect(form.getByTestId("booking-end")).toHaveValue("2026-10-25T02:30");
      await saveCard(f,known,{estimated_duration_minutes:90,earliest_date:null,desired_date:null,latest_date:null,accessWindows:null,requiredWorkRoleIds:[]});
      const description="same wall end different instant";
      const fresh=page.waitForRequest(request=>{const input=action(request,known,description,"preview");return !!input && Date.parse(input.endsAt)===Date.parse("2026-10-25T01:30:00Z");});
      await form.getByTestId("booking-description").fill(description);await fresh;
      await expect(form.getByTestId("booking-end")).toHaveValue("2026-10-25T02:30");
      const edited=page.waitForRequest(request=>{const input=action(request,known,description,"preview");return !!input && Date.parse(input.startsAt)===Date.parse("2026-10-25T00:30:00Z") && Date.parse(input.endsAt)===Date.parse("2026-10-25T02:00:00Z");});
      await form.getByTestId("booking-start").fill("2026-10-25T02:30");await edited;
    } finally {await f.dispose();}
  });
});

