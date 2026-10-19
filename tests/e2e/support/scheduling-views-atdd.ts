/** Real hosts/JWT fixtures/Next actions/SQL readback. No resource launch.
 * Read transport failure is distinct from the late-page integration evidence. */
import { test as base, expect, type BookingEditorHarness, type Scenario } from "./booking-editor-atdd";
import type { Page, Locator } from "@playwright/test";
import { randomUUID } from "node:crypto";
import { readFileSync } from "node:fs";
import path from "node:path";
import * as lifecycle from "./scheduling-lifecycle-metadata";
import { admin, deleteAuthUser, type FixtureUser } from "../../factories/tenants";
import { adminQuery, adminSession } from "../../factories/admin-sql";

export type Host = "Schema" | "Resurser";
export type View = Host | "Team" | "Beläggning" | "Min kalender";
export type Interval = { startsLocal: string; endsLocal: string; startsAt: string; endsAt: string; assigneeIds: string[] };
export type DurableBooking = { id: string; startsAt: string; endsAt: string; assigneeIds: string[] };
const views = { Schema: "schema", Resurser: "resources", Team: "team", Beläggning: "capacity", "Min kalender": "personal" } as const;
export const DATE = "2026-10-12";
/** Independent fixed October conversion; no production projector/time helper. */
export function interval(start: string, end: string, assigneeIds: string[] = []): Interval {
  const utc = (local: string) => new Date(Date.parse(`${local}:00+02:00`)).toISOString();
  return { startsLocal: start, endsLocal: end, startsAt: utc(start), endsAt: utc(end), assigneeIds };
}
export class SchedulingViewsHarness {
  scenario!: Scenario;
  ids = { role: randomUUID(), noRole: randomUUID(), inactive: randomUUID(), proposal: randomUUID(), collision: randomUUID(), zero: randomUUID(), hidden: randomUUID() };
  people: string[] = [];
  ownPerson = "";
  users: FixtureUser[] = [];
  memberships: string[] = [];
  extraProfiles: string[] = [];
  laterIds: string[] = [];
  private readFailureArmed = false;
  private failedReadResolve: (() => void) | undefined;
  private readonly readRoute = async (route: import("@playwright/test").Route) => {
    const request = route.request(); let input: unknown;
    try { input = JSON.parse(request.postData() ?? "null"); } catch { /* Unrelated request. */ }
    const first = Array.isArray(input) ? input[0] : null;
    if (this.readFailureArmed && request.method() === "POST" && request.headers()["next-action"] && first &&
        typeof first === "object" && "view" in first && "filters" in first && "mode" in first) {
      this.readFailureArmed = false; await lifecycle.observeAbort(this.page, "scheduling-injected-read", () => route.abort("failed")); this.failedReadResolve?.();
    } else await route.fallback();
  };
  constructor(readonly page: Page, private readonly bookingEditor: BookingEditorHarness) {}
  get editor(): Locator { return this.page.getByRole("dialog").filter({ has: this.page.getByTestId("booking-start") }); }
  block(id: string): Locator { return this.page.locator(`[data-testid="scheduling-booking-${id}"]:visible`).first(); }
  async seed(laterPages = false): Promise<void> {
    this.scenario = await this.bookingEditor.seed("conflict-free"); this.people = [...this.scenario.assigneeIds];
    // Dedicated PL/self, Montör and denied Säljare; shared fixture roles never change.
    for (const role of ["projektledare", "montor", "saljare"] as const) {
      const email = `${this.scenario.description}-${role}@example.test`, password = `Synthetic-${randomUUID()}-Aa1!`;
      const { data, error } = await admin().auth.admin.createUser({ email, password, email_confirm: true });
      if (error || !data.user) throw new Error("Scheduling scoped auth fixture unavailable");
      this.users.push({ id: data.user.id, email, password });
      const member = randomUUID(), profile = randomUUID(); this.memberships.push(member); this.extraProfiles.push(profile);
      await adminQuery("insert into public.tenant_memberships(id,tenant_id,user_id,role,status) values($1,$2,$3,$4,'active')", [member, this.scenario.tenantId, data.user.id, role]);
      await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id,default_work_role_id) values($1,$2,$3,$4)", [profile, this.scenario.tenantId, member, this.scenario.workRoleId]);
      for (let day = 1; day <= 5; day++) await adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,weekday,starts_at,ends_at) values($1,$2,'weekly_shift',$3,'08:00','16:00')", [this.scenario.tenantId, profile, day]);
    }
    this.ownPerson = this.extraProfiles[0]!; this.people.push(this.extraProfiles[1]!);
    await this.insert(this.ids.role, "09:00", "10:00", [this.people[0]!, this.people[1]!, this.ownPerson, this.extraProfiles[1]!], this.scenario.workRoleId);
    await this.insert(this.ids.noRole, "10:00", "10:30", [this.people[1]!]);
    await this.insert(this.ids.inactive, "14:00", "14:30", [this.extraProfiles[2]!]);
    await adminQuery("update public.tenant_memberships set status='disabled' where id=$1 and tenant_id=$2", [this.memberships[2], this.scenario.tenantId]);
    await this.insert(this.ids.proposal, "11:00", "12:00", this.people.slice(0, 2), this.scenario.workRoleId);
    await this.insert(this.ids.collision, "12:00", "13:30", [this.people[0]!, this.people[2]!], this.scenario.workRoleId);
    await this.insert(this.ids.zero, "09:00", "10:00", [this.people[0]!], null, "2026-10-13");
    await this.insert(this.ids.hidden, "08:00", "17:00", [this.people[0]!], null, "2026-10-14");
    await adminQuery("insert into public.person_work_hours(tenant_id,person_profile_id,entry_kind,local_date,exception_kind) values($1,$2,'exception','2026-10-13','absence'),($1,$2,'exception','2026-10-15','absence')", [this.scenario.tenantId, this.people[0]]);
    if (laterPages) {
      this.laterIds = Array.from({ length: 501 }, () => randomUUID());
      await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,create_command_id,create_payload_digest,create_result)
        select id,$1,'2026-10-16T07:00:00Z','2026-10-16T07:01:00Z',$2,$3,$4,$5,gen_random_uuid(),repeat('a',64),jsonb_build_object('bookingId',id)
        from unnest($6::uuid[]) id`, [this.scenario.tenantId, this.scenario.description + " later", this.scenario.workRoleId, this.scenario.jobId, this.scenario.customerId, this.laterIds]);
      await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,id,$2 from unnest($3::uuid[]) id", [this.scenario.tenantId, this.people[0], this.laterIds]);
    }
    await this.page.route("**/*", this.readRoute); await this.signIn();
  }
  private async insert(id: string, start: string, end: string, assignees: string[], role: string | null = null, date = DATE): Promise<void> {
    const i = interval(`${date}T${start}`, `${date}T${end}`);
    await adminQuery("insert into public.bookings(id,tenant_id,starts_at,ends_at,description,work_role_id,job_id,customer_id,create_command_id,create_payload_digest,create_result) values($1::uuid,$2,$3,$4,$5,$6,$7,$8,$9,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))", [id, this.scenario.tenantId, i.startsAt, i.endsAt, this.scenario.description + " " + id, role, role ? this.scenario.jobId : null, role ? this.scenario.customerId : null, randomUUID()]);
    await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,$2,id from unnest($3::uuid[]) id", [this.scenario.tenantId, id, assignees]);
  }
  async signIn(identity: "admin" | "manager" | "montor" | "denied" | "other-tenant" = "admin"): Promise<void> {
    const fixture = JSON.parse(readFileSync(path.join(process.cwd(), "tests/e2e/.auth/fixture.json"), "utf8")) as { adminB: FixtureUser };
    const credentials = identity === "admin" ? this.scenario.credentials : identity === "other-tenant" ? fixture.adminB : this.users[identity === "manager" ? 0 : identity === "montor" ? 1 : 2]!;
    if (identity === "denied") await adminQuery("update public.tenant_memberships set status='active' where id=$1 and tenant_id=$2", [this.memberships[2], this.scenario.tenantId]);
    await this.page.context().clearCookies(); await this.page.goto("/login");
    await this.page.getByLabel("E-post").fill(credentials.email); await this.page.getByLabel("Lösenord").fill(credentials.password);
    await this.page.getByRole("button", { name: "Logga in" }).click(); await expect(this.page).toHaveURL(/\/dashboard$/);
  }
  async settle(): Promise<void> {
    await this.page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
    await expect(this.page.getByText("Läser planering…", { exact: true })).toHaveCount(0);
  }
  async open(view: View, mode: "day" | "week" | "month" = "week", date = DATE): Promise<void> {
    if (!this.page.url().includes("/scheduling")) { await this.page.goto("/scheduling"); await this.settle(); }
    const tab = this.page.getByTestId(`scheduling-view-${views[view]}`);
    try { await expect(tab).toBeVisible(); }
    catch (cause) {
      // Only absent-host failures collect these bounded, generic UI facts.
      // Never attach page HTML, query inputs, fixture identities or auth state.
      const workspace = this.page.getByTestId("scheduling-workspace");
      const genericMessages = (texts: string[]) => texts.filter(text => /Planeringen kunde inte läsas|behörighet.*planeringen|Planeringens val är ogiltiga|Läser planering|Sparade inställningar återställdes/.test(text)).map(text => text.slice(0, 300));
      const diagnostic = {
        path: new URL(this.page.url()).pathname,
        workspace: await workspace.count(),
        alerts: genericMessages(await this.page.getByRole("alert").allTextContents()),
        statuses: genericMessages(await workspace.getByRole("status").allTextContents()),
        tabs: await this.page.getByRole("tab").evaluateAll(nodes => nodes.filter(node => (node as HTMLElement).getClientRects().length > 0).map(node => ({ label: node.textContent, testId: node.getAttribute("data-testid") })).filter(node => /^(Schema|Resurser|Team|Beläggning|Min kalender)$/.test(node.label ?? ""))),
        headings: (await this.page.getByRole("heading").allTextContents()).filter(text => /^(Planering|Ingen åtkomst)$/.test(text)),
      };
      throw new Error(`Scheduling host unavailable: ${JSON.stringify(diagnostic)}`, { cause });
    }
    await tab.click(); await this.settle();
    await this.page.getByLabel("Datum", { exact: true }).fill(date); await this.settle();
    await this.page.getByLabel("Period", { exact: true }).selectOption(mode); await this.settle();
  }
  async filter(label: string, value: string): Promise<void> { await this.page.getByLabel(label, { exact: true }).selectOption(value); await this.settle(); }
  async applySharedFilters(): Promise<void> {
    await this.filter("Person", this.people[0]!); await this.filter("Arbetsroll", this.scenario.workRoleId);
    await this.filter("Jobb", this.scenario.jobId); await this.filter("Kund", this.scenario.customerId);
  }
  async visibleIds(root: Locator = this.page.getByTestId("scheduling-workspace")): Promise<string[]> {
    return [...new Set(await root.locator('[data-testid^="scheduling-booking-"]:visible').evaluateAll(nodes => nodes.map(n => n.getAttribute("data-testid")!.slice("scheduling-booking-".length))))].sort();
  }
  slot(host: Host, local: string, person = this.people[0]!, schemaPerson = ""): Locator {
    const at = interval(local, local).startsAt.replace(".000Z", ".000000Z");
    return this.page.getByTestId(host === "Schema" ? "schema-slot" : "resources-slot").and(this.page.locator(`[data-start="${at}"][data-person="${host === "Schema" ? schemaPerson : person}"]`));
  }
  row(person = this.people[0]!): Locator { return this.page.getByTestId(`resource-row-${person}`); }
  /** Native booking drag: activate before target auto-scroll can reuse the same screen point. */
  async dragBooking(source: Locator, target: Locator): Promise<void> {
    await source.scrollIntoViewIfNeeded();
    const selection = await source.evaluate(element => {
      const rect = element.getBoundingClientRect(), style = getComputedStyle(element);
      const article = element.tagName === "ARTICLE";
      const travel = 16; // Deliberate physical activation, independent of subsequent scrolling.
      const owns = (x: number, y: number) => {
        if (!Number.isFinite(x) || !Number.isFinite(y) || x <= 0 || y <= 0 || x >= innerWidth || y >= innerHeight) return false;
        const hit = document.elementFromPoint(x, y);
        return hit?.closest('[draggable="true"]') === element &&
          (!article || !hit.closest('a, button, input, select, textarea, [contenteditable="true"]'));
      };
      const attempts: { x: number; y: number; dx: number; dy: number; badX: number; badY: number; hitTag: string | null; hitKind: string; sourceOwned: boolean }[] = [];
      const corridor = (x: number, y: number, dx: number, dy: number) => {
        for (let step = 0; step <= travel; step++) {
          const atX = x + dx * step, atY = y + dy * step;
          if (owns(atX, atY)) continue;
          const hit = Number.isFinite(atX) && Number.isFinite(atY) ? document.elementFromPoint(atX, atY) : null;
          const testId = hit?.closest("[data-testid]")?.getAttribute("data-testid") ?? "";
          attempts.push({ x, y, dx, dy, badX: atX, badY: atY, hitTag: hit?.tagName.toLowerCase() ?? null,
            hitKind: testId.startsWith("scheduling-booking-") ? "booking" : testId === "scheduling-resize" ? "resize" : testId.endsWith("-slot") ? "slot" : "other",
            sourceOwned: hit?.closest('[draggable="true"]') === element });
          return null;
        }
        return { x, y, activatedX: x + dx * travel, activatedY: y + dy * travel };
      };
      // Preserve the already-proven Schema path first, including its direction choice.
      const x = rect.left + (article ? parseFloat(style.paddingLeft) / 2 : rect.width / 2);
      const y = rect.top + (article ? parseFloat(style.paddingTop) / 2 : rect.height / 2);
      const direction = owns(x + travel, y) ? 1 : owns(x - travel, y) ? -1 : 0;
      const draggable = element.matches('[draggable="true"]');
      if (draggable && owns(x, y) && direction) {
        const point = corridor(x, y, direction, 0);
        if (point) return { point, diagnostic: null };
      } else corridor(x, y, direction || 1, 0);

      // A clipped card can still expose a legitimate padding edge. Intersect ancestor clips.
      const visible = { left: Math.max(0, rect.left), top: Math.max(0, rect.top), right: Math.min(innerWidth, rect.right), bottom: Math.min(innerHeight, rect.bottom) };
      for (let ancestor = element.parentElement; ancestor; ancestor = ancestor.parentElement) {
        const css = getComputedStyle(ancestor), box = ancestor.getBoundingClientRect();
        if (/auto|scroll|hidden|clip/.test(css.overflowX)) {
          visible.left = Math.max(visible.left, box.left + ancestor.clientLeft);
          visible.right = Math.min(visible.right, box.left + ancestor.clientLeft + ancestor.clientWidth);
        }
        if (/auto|scroll|hidden|clip/.test(css.overflowY)) {
          visible.top = Math.max(visible.top, box.top + ancestor.clientTop);
          visible.bottom = Math.min(visible.bottom, box.top + ancestor.clientTop + ancestor.clientHeight);
        }
      }
      const number = (value: string) => parseFloat(value) || 0;
      const padding = { left: number(style.paddingLeft), right: number(style.paddingRight), top: number(style.paddingTop), bottom: number(style.paddingBottom) };
      const inner = { left: rect.left + number(style.borderLeftWidth), right: rect.right - number(style.borderRightWidth), top: rect.top + number(style.borderTopWidth), bottom: rect.bottom - number(style.borderBottomWidth) };
      // Four padding bands for an article; the intended resize button uses its own interior.
      const bands = article ? [
        { ...inner, bottom: inner.top + padding.top }, { ...inner, top: inner.bottom - padding.bottom },
        { ...inner, right: inner.left + padding.left }, { ...inner, left: inner.right - padding.right },
      ] : [inner];
      if (draggable) for (const band of bands) {
        const left = Math.max(band.left, visible.left), right = Math.min(band.right, visible.right);
        const top = Math.max(band.top, visible.top), bottom = Math.min(band.bottom, visible.bottom);
        if (right <= left || bottom <= top) continue;
        // At most two corridors per band; no search loop, retry or guessed outside point.
        if (right - left > travel) {
          const point = corridor(left + Math.min(1, (right - left - travel) / 2), (top + bottom) / 2, 1, 0);
          if (point) return { point, diagnostic: null };
        }
        if (bottom - top > travel) {
          const point = corridor((left + right) / 2, top + Math.min(1, (bottom - top - travel) / 2), 0, 1);
          if (point) return { point, diagnostic: null };
        }
      }
      return { point: null, diagnostic: { rect: { left: rect.left, top: rect.top, width: rect.width, height: rect.height }, visible, padding, draggable, article, attempts } };
    });
    const start = selection.point;
    if (!start) throw new Error(`Native booking drag has no visible source-owned activation corridor: ${JSON.stringify(selection.diagnostic)}`);
    await this.page.mouse.move(start.x, start.y);
    await this.page.mouse.down();
    try {
      await this.page.mouse.move(start.activatedX, start.activatedY, { steps: 4 });
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
      await this.page.mouse.move(destination.x, destination.y, { steps: 8 });
      await this.page.mouse.move(destination.insideX, destination.y);
    } finally { await this.page.mouse.up(); }
  }
  async fillRequired(assignees: string[] = [this.people[0]!]): Promise<void> {
    await this.editor.getByTestId("booking-description").fill(this.scenario.description + " browser-created");
    await this.editor.getByTestId("booking-work-role").selectOption(this.scenario.workRoleId);
    for (const id of assignees) await this.editor.getByTestId(`booking-assignee-option-${id}`).check();
    await expect(this.editor.getByTestId("booking-availability")).toBeVisible();
  }
  async cancel(): Promise<void> {
    await this.editor.getByTestId("booking-close").click();
    const discard = this.page.getByTestId("booking-discard");
    if (await discard.isVisible()) await discard.click();
    await expect(this.editor).toHaveCount(0); await this.settle();
  }
  async sqlBookings(): Promise<DurableBooking[]> {
    const rows = await adminQuery<DurableBooking>(`select b.id,b.starts_at::text as "startsAt",b.ends_at::text as "endsAt",coalesce(array_agg(a.person_profile_id order by a.person_profile_id) filter(where a.person_profile_id is not null),'{}') as "assigneeIds"
      from public.bookings b left join public.booking_assignees a on a.booking_id=b.id and a.tenant_id=b.tenant_id where b.tenant_id=$1 and b.description like $2 group by b.id order by b.id`, [this.scenario.tenantId, this.scenario.description + "%"]);
    return rows.map(row => ({ ...row, startsAt: new Date(row.startsAt).toISOString(), endsAt: new Date(row.endsAt).toISOString() }));
  }
  observeConfirmedSave() { return this.bookingEditor.observeNextConfirmedSave(); }
  failNextSaveOnce() { return this.bookingEditor.failNextSaveOnce(); }
  async reloadAndOpen(id: string, host: Host, expected: Interval): Promise<void> {
    await this.page.reload();
    // Reload restores application defaults, which can use today's date. Re-establish
    // this persistence check's host and interval through the real toolbar first.
    await this.open(host, "day", expected.startsLocal.slice(0, 10));
    await this.block(id).getByRole("button", { name: "Redigera / flytta", exact: true }).click();
  }
  async review(): Promise<void> {
    await expect(this.editor.getByTestId("booking-review-current-warnings")).toBeVisible();
    const checks = this.editor.getByTestId("booking-conflict-panel").locator('article input[type="checkbox"]');
    expect(await checks.count()).toBeGreaterThan(0); await checks.first().check();
    await this.editor.getByTestId("booking-review-current-warnings").check();
    await this.editor.getByTestId("booking-override-reason").fill("Reviewed current scheduling proposal; accept selected collision only");
  }
  async failNextRead(): Promise<{ failed: Promise<void> }> {
    this.readFailureArmed = true; return { failed: new Promise<void>(resolve => { this.failedReadResolve = resolve; }) };
  }
  async lifecycle(status: "active" | "disabled" | "ended", archive = false): Promise<void> {
    await adminQuery("update public.tenant_memberships set status=$3 where id=$1 and tenant_id=$2", [this.memberships[2], this.scenario.tenantId, status]);
    await adminQuery("update public.person_profiles set archived_at=case when $3 then statement_timestamp() else null end where id=$1 and tenant_id=$2", [this.extraProfiles[2], this.scenario.tenantId, archive]);
    await this.page.reload(); await this.settle();
  }
  async resetProposal(): Promise<void> {
    await adminQuery("update public.bookings set starts_at='2026-10-12T09:00:00Z',ends_at='2026-10-12T10:00:00Z' where id=$1 and tenant_id=$2", [this.ids.proposal, this.scenario.tenantId]);
    await adminQuery("delete from public.booking_assignees where booking_id=$1 and tenant_id=$2", [this.ids.proposal, this.scenario.tenantId]);
    await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) select $1,$2,id from unnest($3::uuid[]) id", [this.scenario.tenantId, this.ids.proposal, this.people.slice(0, 2)]);
  }
  async addProposalPeer(): Promise<void> {
    await this.insert(randomUUID(), "12:30", "13:00", [this.people[1]!], this.scenario.workRoleId);
  }
  async dispose(): Promise<void> {
    lifecycle.mark(this.page, "scheduling-dispose", "enter");
    if (!this.scenario) return; await this.page.unroute("**/*", this.readRoute);
    // Delete our dependent bookings before extra profiles. Base fixture owns
    // its two original people, CRM/work role and removes them afterwards.
    await adminSession(async ({ query }) => {
      await query("begin");
      try {
        await query("set local session_replication_role=replica");
        await query("delete from public.audit_events where tenant_id=$1 and target_id in(select id from public.bookings where tenant_id=$1 and description like $2)", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.booking_conflicts where tenant_id=$1 and (booking_id in(select id from public.bookings where tenant_id=$1 and description like $2) or related_booking_id in(select id from public.bookings where tenant_id=$1 and description like $2))", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.booking_assignees where tenant_id=$1 and booking_id in(select id from public.bookings where tenant_id=$1 and description like $2)", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.bookings where tenant_id=$1 and description like $2", [this.scenario.tenantId, this.scenario.description + "%"]);
        await query("delete from public.person_work_hours where tenant_id=$1 and person_profile_id=any($2::uuid[])", [this.scenario.tenantId, this.extraProfiles]);
        await query("delete from public.person_profiles where tenant_id=$1 and id=any($2::uuid[])", [this.scenario.tenantId, this.extraProfiles]);
        await query("delete from public.membership_roles where tenant_id=$1 and membership_id=any($2::uuid[])", [this.scenario.tenantId, this.memberships]);
        await query("delete from public.tenant_memberships where tenant_id=$1 and id=any($2::uuid[])", [this.scenario.tenantId, this.memberships]);
        await query("commit");
      } catch (error) { await query("rollback"); throw error; }
    });
    for (const user of this.users) await deleteAuthUser(user.id);
  }
}
export const test = base.extend<{ schedulingViews: SchedulingViewsHarness }>({
  schedulingViews: async ({ resourcePage, bookingEditor }, provide) => {
    const harness = new SchedulingViewsHarness(resourcePage, bookingEditor);
    try { await provide(harness); } finally { await harness.dispose(); }
  },
});
export { expect };
