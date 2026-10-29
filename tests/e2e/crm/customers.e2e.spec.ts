/**
 * Story 3.2 — CRM tenant-admin UX E2E (browser journeys) against the REAL app + local
 * Supabase stack + the two-tenant fixture (with seeded CRM rows). Run by the `e2e` CI job.
 *
 * COVERAGE (Story 3.2 Test Requirements / AC1-AC7):
 *   AC1 → /customers renders the populated list; search/filter narrows it; no-results state.
 *   AC4 → creating a customer via the dialog persists (round-trips createCustomer 3.1).
 *   AC3 → a validation failure shows a FIELD-ASSOCIATED error + summary and PRESERVES input.
 *   AC3 → dialog open moves focus IN; Escape/close returns focus to the trigger.
 *   AC6 → the shell shows exactly the active manifest nav and none of the deferred labels.
 *   AC5 → anonymous /customers and /customers/<id> redirect to /login.
 *   P0  → the /customers LIST never contains a personnummer; the detail shows it masked.
 *
 * Reuses the `signIn`/`waitForHydrated` helpers (client islands must be HYDRATED before
 * interaction — poll for `__react*` keys; clicking pre-hydration native-submits).
 */
import { test as base, expect, type Page, type Locator, type Route, type Request as BrowserRequest } from "@playwright/test";
// Optional local attachment to the resource-guard-owned browser; CI retains its normal fixture.
const test = process.env.E2E_CDP_ENDPOINT ? base.extend({
  browser: [async ({ playwright }, use) => {
    const endpoint = new URL(process.env.E2E_CDP_ENDPOINT!);
    if (endpoint.hostname !== "127.0.0.1") throw new Error("Local owned browser endpoint required");
    const browser = await playwright.chromium.connectOverCDP(endpoint.href);
    await use(browser);
    await browser.close(); // Disconnects this client; lifecycle remains with the root guard.
  }, {scope: "worker"}],
}) : base;
import { readFileSync, mkdirSync, appendFileSync } from "node:fs";
import path from "node:path";
import { expectActiveAdminNavigation } from "../support/active-admin-navigation";
import { adminExec, adminQuery, closeAdminPool } from "../../factories/admin-sql";
import { createTwoTenantFixture, cleanupFixture } from "../../factories/tenants";

async function captureRecordState(page: Page, state: string) {
  const folder = process.env.E35_CAPTURE_DIR;
  if (!folder) return;
  mkdirSync(folder, {recursive:true});
  const viewport = page.viewportSize();
  const filename = `${state}-${viewport?.width}x${viewport?.height}.png`;
  const fullPage=process.env.E35_CAPTURE_VIEWPORT_ONLY!=="1";
  await page.bringToFront();
  await page.screenshot({animations:"disabled",path:path.join(folder,filename),fullPage});
  appendFileSync(path.join(folder,"captures.jsonl"),JSON.stringify({file:filename,state,viewport,fullPage,
    candidate:process.env.E35_CAPTURE_REVISION ?? "uncommitted working tree",
    source:state==="controlled-checked-read-503-document-fallback"?"controlled synthetic503document, not application error UI":"implemented production-server UI",
    classification:state.startsWith("controlled-")?"controlled fault or enlargement/occlusion proxy; no physical-device proof":"actual rendered UI; transport faults remain test-controlled where named",
    url:new URL(page.url()).pathname})+"\n");
}

/** Computed solid-color composites, including ancestor alpha; no token-only contrast claim. */
async function renderedContrast(page: Page, locator: Locator, state: string, outline=false, disabled=false) {
  const measured=await locator.evaluate((node,{outline}) => {
    const canvas=document.createElement("canvas"); canvas.width=canvas.height=1;
    const ctx=canvas.getContext("2d")!;
    const rgba=(color:string) => {ctx.clearRect(0,0,1,1);ctx.fillStyle=color;ctx.fillRect(0,0,1,1);return Array.from(ctx.getImageData(0,0,1,1).data).map((v,i)=>i===3?v/255:v);};
    const over=(fg:number[],bg:number[]) => [0,1,2].map((i)=>fg[i]*fg[3]+bg[i]*(1-fg[3])).concat(1);
    const ancestors:Element[]=[]; for(let el:Element|null=node;el;el=el.parentElement) ancestors.unshift(el);
    let background=[255,255,255,1];
    for(const el of ancestors) background=over(rgba(getComputedStyle(el).backgroundColor),background);
    const css=getComputedStyle(node), foreground=over(rgba(outline?css.outlineColor:css.color),background);
    const luminance=(color:number[]) => color.slice(0,3).map((v)=>{const c=v/255;return c<=0.04045?c/12.92:((c+0.055)/1.055)**2.4;}).reduce((n,v,i)=>n+v*[0.2126,0.7152,0.0722][i],0);
    const a=luminance(foreground),b=luminance(background);
    return {foreground,background,ratio:(Math.max(a,b)+0.05)/(Math.min(a,b)+0.05),color:css.color,backgroundColor:css.backgroundColor,outlineColor:css.outlineColor,outlineWidth:css.outlineWidth,opacity:css.opacity};
  },{outline});
  if(outline) expect(parseFloat(measured.outlineWidth)).toBeGreaterThan(0);
  if(!disabled) expect(measured.ratio,`${state} rendered composite`).toBeGreaterThanOrEqual(outline?3:4.5);
  const file=path.resolve("tmp/private/story35-3/round1-rendered-contrast.jsonl");
  appendFileSync(file,JSON.stringify({state,viewport:page.viewportSize(),candidate:process.env.E35_CAPTURE_REVISION??"uncommitted Round1 source",kind:outline?"nontext focus":"text",disabled,threshold:disabled?"inactive control exempt":outline?3:4.5,...measured,limits:"Solid computed sRGB ancestor composites; no pixel/image/physical-device/color-vision or full-page audit"})+"\n");
}

interface CrmFixture {
  readonly tenantA: { readonly name: string };
  readonly adminA: { readonly email: string; readonly password: string };
  readonly crm: {
    readonly company: { readonly id: string; readonly displayName: string; readonly orgNr: string };
    readonly private: {
      readonly id: string;
      readonly displayName: string;
      readonly personnummer: string;
    };
    readonly facilityId: string;
  };
}

const fixture: CrmFixture = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "e2e", ".auth", "fixture.json"),
    "utf8",
  ),
);

/** Poll for React hydration before interacting (see auth spec for rationale). */
async function waitForHydrated(locator: Locator): Promise<void> {
  await locator.waitFor({ state: "visible" });
  await locator.evaluate(
    (el) =>
      new Promise<void>((resolve) => {
        const ready = () => Object.keys(el).some((k) => k.startsWith("__react"));
        const tick = () => (ready() ? resolve() : requestAnimationFrame(tick));
        tick();
      }),
  );
}

async function signIn(page: Page, email: string, password: string): Promise<void> {
  await page.goto("/login");
  const submit = page.getByRole("button", { name: "Logga in" });
  await waitForHydrated(submit);
  await page.getByLabel("E-post").fill(email);
  await page.getByLabel("Lösenord").fill(password);
  await submit.click();
  await expect(page).toHaveURL(/\/dashboard/);
}

async function openPhoneNavigation(page: Page): Promise<void> {
  const trigger=page.getByRole("button",{name:"Öppna meny",exact:true});
  if(await trigger.isVisible()) { await waitForHydrated(trigger); await trigger.click(); }
}

const DEFERRED_LABELS = [
  "Pilotstöd",
  "Migrering",
  "Fortnox",
  "Leverantör",
  "Uthyrning",
  "Tillgångar",
];

test.describe("CRM tenant-admin UX (Story 3.2 E2E)", () => {
  test("AC5: an anonymous visitor to /customers and /customers/<id> is redirected to /login", async ({
    page,
  }) => {
    await page.goto("/customers");
    await expect(page).toHaveURL(/\/login(\?|$)/);
    await page.goto(`/customers/${fixture.crm.company.id}`);
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("AC1: /customers renders the populated list; search narrows it; no-results state appears", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");

    await expect(page.getByRole("heading", { name: "Kunder", level: 1 })).toBeVisible();
    // Both seeded customers are present in the populated list.
    await expect(page.getByText(fixture.crm.company.displayName)).toBeVisible();
    await expect(page.getByText(fixture.crm.private.displayName)).toBeVisible();

    // Search narrows to the company by name.
    const search = page.getByLabel("Sök kund");
    await waitForHydrated(search);
    await search.fill(fixture.crm.company.displayName);
    await expect(page.getByText(fixture.crm.company.displayName)).toBeVisible();
    await expect(page.getByText(fixture.crm.private.displayName)).toHaveCount(0);

    // A non-matching search reaches the DISTINCT no-results state.
    await search.fill("zzz-no-such-customer-zzz");
    await expect(page.getByTestId("customers-no-results")).toBeVisible();
  });

  test("AC1 search by org_nr: the company is findable by its org number", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");
    const search = page.getByLabel("Sök kund");
    await waitForHydrated(search);
    await search.fill(fixture.crm.company.orgNr);
    await expect(page.getByText(fixture.crm.company.displayName)).toBeVisible();
  });

  test("AC1 filter by type: filtering to Privatperson hides the company customer", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");
    const filter = page.getByLabel("Filtrera typ");
    await waitForHydrated(filter);
    await filter.selectOption("private");
    await expect(page.getByText(fixture.crm.private.displayName)).toBeVisible();
    await expect(page.getByText(fixture.crm.company.displayName)).toHaveCount(0);
  });

  test("P0: the /customers LIST never contains a personnummer value", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");
    await expect(page.getByText(fixture.crm.private.displayName)).toBeVisible();
    // The full DOM + the page source must NOT contain the seeded personnummer.
    const body = await page.locator("body").innerText();
    expect(body).not.toContain(fixture.crm.private.personnummer);
    const html = await page.content();
    expect(html).not.toContain(fixture.crm.private.personnummer);
  });

  test("P0/AC2: the private customer DETAIL shows the personnummer MASKED (not clear-text by default)", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto(`/customers/${fixture.crm.private.id}`);
    await expect(
      page.getByRole("heading", { name: fixture.crm.private.displayName, level: 1 }),
    ).toBeVisible();
    const pnr = page.getByTestId("customer-personnummer");
    await expect(pnr).toBeVisible();
    // Masked by default: the clear-text value is NOT shown, but the last 4 digits are.
    await expect(pnr).not.toHaveText(fixture.crm.private.personnummer);
    await expect(pnr).toContainText(fixture.crm.private.personnummer.slice(-4));
    // Reveal-on-click surfaces the full value (the access-controlled detail surface).
    const reveal = page.getByRole("button", { name: "Visa" });
    await waitForHydrated(reveal);
    await reveal.click();
    await expect(pnr).toHaveText(fixture.crm.private.personnummer);
  });

  test("AC4: creating a customer via the dialog persists and appears in the list", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");

    const newName = `Created Co ${Date.now().toString(36)}`;
    const openBtn = page.getByTestId("new-customer-button");
    await waitForHydrated(openBtn);
    await openBtn.click();

    const dialog = page.getByRole("dialog", { name: "Ny kund" });
    await expect(dialog).toBeVisible();
    await dialog.getByLabel("Kundtyp").selectOption("company");
    await dialog.getByLabel("Visningsnamn").fill(newName);
    await dialog.getByLabel("Organisationsnummer").fill("556000-1234");
    await dialog.getByRole("button", { name: "Spara" }).click();

    // The dialog closes and the new customer appears in the revalidated list.
    await expect(dialog).toHaveCount(0);
    await expect(page.getByText(newName)).toBeVisible();
  });

  test("AC3: a validation failure shows a field-associated error + summary and preserves input", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");

    const openBtn = page.getByTestId("new-customer-button");
    await waitForHydrated(openBtn);
    await openBtn.click();
    const dialog = page.getByRole("dialog", { name: "Ny kund" });
    await expect(dialog).toBeVisible();

    // Company type, fill display_name, but LEAVE org_nr blank → validation failure.
    await dialog.getByLabel("Kundtyp").selectOption("company");
    const nameInput = dialog.getByLabel("Visningsnamn");
    await nameInput.fill("Incomplete Co");
    await dialog.getByRole("button", { name: "Spara" }).click();

    // Field-associated error: the org_nr input is aria-invalid and describedby its error.
    const orgInput = dialog.getByLabel("Organisationsnummer");
    await expect(orgInput).toHaveAttribute("aria-invalid", "true");
    const describedBy = await orgInput.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(dialog.locator(`#${describedBy}`)).toBeVisible();
    // The blocking summary is present and the dialog stayed open with input preserved.
    await expect(dialog.getByTestId("form-error-summary")).toContainText(/.+/);
    await expect(nameInput).toHaveValue("Incomplete Co");
  });

  test("AC3: opening a dialog moves focus IN; Escape closes and returns focus to the trigger", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");

    const openBtn = page.getByTestId("new-customer-button");
    await waitForHydrated(openBtn);
    await openBtn.click();
    const dialog = page.getByRole("dialog", { name: "Ny kund" });
    await expect(dialog).toBeVisible();

    // Focus moved INTO the dialog (the first field — Kundtyp select).
    await expect(dialog.getByLabel("Kundtyp")).toBeFocused();

    // Escape closes and returns focus to the invoking trigger (predictable focus).
    await page.keyboard.press("Escape");
    await expect(dialog).toHaveCount(0);
    await expect(openBtn).toBeFocused();
  });

  test("AC6: the shell shows EXACTLY the active manifest nav and NONE of the deferred labels", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");

    await openPhoneNavigation(page);
    const nav = page.getByRole("navigation", { name: "Huvudnavigation" }).first();
    await expectActiveAdminNavigation(nav);

    // No deferred-module label appears anywhere on the page (nav, body, or detail).
    const body = await page.locator("body").innerText();
    for (const deferred of DEFERRED_LABELS) {
      expect(body).not.toContain(deferred);
    }
  });

  test("AC2: the detail hub shows honest 'not yet built' areas and NO deferred-module section", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto(`/customers/${fixture.crm.company.id}`);
    await expect(
      page.getByRole("heading", { name: fixture.crm.company.displayName, level: 1 }),
    ).toBeVisible();
    // Facilities + Contacts sub-sections are present and populated (seeded).
    await expect(page.getByRole("heading", { name: "Anläggningar" })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Kontakter" })).toBeVisible();
    // Honest "not yet built" related areas exist; no deferred-module label leaks.
    await expect(page.getByTestId("not-built-area").first()).toBeVisible();
    const body = await page.locator("body").innerText();
    for (const deferred of DEFERRED_LABELS) {
      expect(body).not.toContain(deferred);
    }
  });

  test("AC2: a non-existent / other-tenant customer id renders a GENERIC not-found (no leakage)", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    // A random UUID the caller does not own → invisible under RLS → generic not-found.
    await page.goto("/customers/00000000-0000-0000-0000-000000000000");
    await expect(page.getByTestId("customer-not-found")).toBeVisible();
  });
});

// Story 35.3 active ATDD RED. Existing vanilla runner retained: playwright-utils
// is not installed. These gates observe real multipart FormData + Next actions;
// they never manufacture a successful action or use an invented customer API.
test.afterAll(async () => { await closeAdminPool(); });

async function openCustomerEditor(page: Page, id = fixture.crm.company.id, navigate = true) {
  if (navigate) await page.goto(`/customers/${id}`);
  const trigger = page.getByTestId("edit-customer-button");
  await waitForHydrated(trigger);
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Redigera kund" });
  await expect(dialog).toBeVisible();
  return dialog;
}
async function openCustomerCreate(page: Page, marker: string) {
  await page.goto("/customers");
  const trigger = page.getByTestId("new-customer-button");
  await waitForHydrated(trigger);
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Ny kund" });
  await dialog.getByLabel("Kundtyp").selectOption("company");
  await dialog.getByLabel("Visningsnamn").fill(marker);
  await dialog.getByLabel("Organisationsnummer").fill("556677-8899");
  return dialog;
}
async function customerSnapshot(marker: string) {
  return adminQuery<{ id: string; display_name: string; phone: string | null; city: string | null; archived_at: string | null; audits: number }>(
    `select c.id, c.display_name, c.phone, c.city, c.archived_at,
       (select count(*)::integer from public.audit_events a where a.target_id = c.id and a.target_type = 'customer') as audits
     from public.customers c where c.display_name = $1 order by c.id`, [marker],
  );
}
function actionField(form: FormData, name: string) {
  const values = [...form.entries()].filter(([key]) => key === name || key.endsWith(`_${name}`));
  expect(values).toHaveLength(1);
  expect(typeof values[0][1]).toBe("string");
  return String(values[0][1]);
}
async function customerActionForm(request: BrowserRequest): Promise<FormData | null> {
  if (request.method() !== "POST" || !request.headers()["next-action"]
    || !/^\/customers(?:\/[0-9a-f-]+)?$/.test(new URL(request.url()).pathname)) return null;
  const contentType = request.headers()["content-type"] ?? "";
  expect(contentType).toContain("multipart/form-data");
  const bytes = request.postDataBuffer();
  expect(bytes).not.toBeNull();
  return new Response(new Uint8Array(bytes!), { headers: { "content-type": contentType } }).formData();
}
async function customerActionGate(page: Page, marker: string, mode: "hold" | "before-forward" | "lose-response", snapshotMarker=marker) {
  let resolveObserved!: () => void, rejectObserved!: (error: unknown) => void, release!: () => void;
  const observed = new Promise<void>((resolve, reject) => { resolveObserved = resolve; rejectObserved = reject; });
  void observed.catch(() => undefined);
  const released = new Promise<void>((resolve) => { release = resolve; });
  let resolveDelivered!: () => void, rejectDelivered!: (error: unknown) => void;
  const delivered = new Promise<void>((resolve,reject) => { resolveDelivered=resolve; rejectDelivered=reject; });
  void delivered.catch(() => undefined);
  let attempts = 0;
  const handler = async (route: Route) => {
    try {
      const form = await customerActionForm(route.request());
      if (!form || ![...form.values()].some((value) => typeof value === "string" && value === marker)) {
        await route.fallback(); return;
      }
      attempts += 1;
      if (mode === "before-forward") { await route.abort("failed"); resolveObserved(); resolveDelivered(); return; }
      const response = await route.fetch();
      expect(response.ok()).toBe(true); // Transport only: independent physical read follows.
      if (mode === "lose-response") {
        const rows = await customerSnapshot(snapshotMarker);
        expect(rows).toHaveLength(1);
        expect(rows[0].audits).toBe(snapshotMarker===marker?1:2);
        await route.abort("failed"); resolveObserved(); resolveDelivered(); return;
      }
      resolveObserved();
      await released;
      await route.fulfill({ response }); resolveDelivered();
    } catch (error) { rejectObserved(error); rejectDelivered(error); throw error; }
  };
  // playwright-utils deviation: package absent; existing real route.fetch/abort pattern.
  await page.route("**/*", handler);
  return { observed, attempts: () => attempts, dispose: async () => { release(); try { if(attempts>0) await delivered; } finally { await page.unroute("**/*", handler); } } };
}

test.describe("35.3 customer records acceptance (active RED, configured Chromium)", () => {
  test("B01 E35-3-T-AC1/AC2 loaded/no-match: independent selection, sort and reset preserve identity", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/customers");
    const table = page.getByRole("table", { name: "Kundlista" });
    await expect(table.getByRole("columnheader", { name: "Kund", exact: true })).toBeVisible();
    await captureRecordState(page,"customers-loaded");
    const selectCompany = table.getByRole("checkbox", { name: `Välj ${fixture.crm.company.displayName}`, exact: true });
    await selectCompany.focus(); await page.keyboard.press("Space");
    await expect(selectCompany).toBeChecked();
    await renderedContrast(page,table.getByRole("link",{name:fixture.crm.company.displayName,exact:true}),"selected row text");
    await captureRecordState(page,"customers-selected");
    await expect(page).toHaveURL(/\/customers$/);
    const sort = page.getByRole("combobox", { name: /sortera/i });
    const descending = await sort.getByRole("option", { name: /fallande/i }).getAttribute("value");
    expect(descending).toBeTruthy();
    await sort.selectOption(descending!);
    const renderedOrder=() => table.locator("tbody a").evaluateAll((links) => links.map((link) => link.textContent));
    // Canonical fixture is Acme El AB… before Anna Privat…; assert identities, not a copied comparator.
    const descOrder=await renderedOrder();
    expect(descOrder).toContain(fixture.crm.private.displayName); expect(descOrder).toContain(fixture.crm.company.displayName);
    expect(descOrder.indexOf(fixture.crm.private.displayName)).toBeLessThan(descOrder.indexOf(fixture.crm.company.displayName));
    await sort.selectOption({label:"Namn stigande A–Ö"});
    const ascOrder=await renderedOrder();
    expect(ascOrder).toContain(fixture.crm.private.displayName); expect(ascOrder).toContain(fixture.crm.company.displayName);
    expect(ascOrder.indexOf(fixture.crm.company.displayName)).toBeLessThan(ascOrder.indexOf(fixture.crm.private.displayName));
    await expect(table.getByRole("columnheader",{name:"Kund",exact:true})).toHaveAttribute("aria-sort","ascending");
    await expect(selectCompany).toBeChecked();
    await page.getByLabel("Sök kund").fill("35.3-no-match");
    await expect(page.getByTestId("customers-no-results")).toBeVisible();
    await captureRecordState(page,"customers-no-match");
    await page.getByRole("button", { name: /återställ/i }).click();
    await expect(selectCompany).toBeChecked();
    await table.getByRole("link", { name: fixture.crm.company.displayName, exact: true }).click();
    await expect(page).toHaveURL(new RegExp(`/customers/${fixture.crm.company.id}$`));
    await captureRecordState(page,"customer-detail-loaded");
  });

  test("B02 E35-3-T-validation/confirmed AC3: summary links focus the actual invalid field and retain unsent input", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    const marker = `35.3 validated ${crypto.randomUUID()}`, dialog = await openCustomerCreate(page, marker);
    await captureRecordState(page,"customer-create-draft");
    await dialog.getByLabel("E-post").fill("invalid");
    await dialog.getByLabel("Ort").fill("Västerås");
    await dialog.getByRole("button", { name: "Spara", exact: true }).click();
    await expect(dialog.getByLabel("E-post")).toHaveAttribute("aria-invalid", "true");
    await dialog.getByTestId("form-error-summary").getByRole("link").first().click();
    await expect(dialog.getByLabel("E-post")).toBeFocused();
    await expect(dialog.getByLabel("Ort")).toHaveValue("Västerås");
    await captureRecordState(page,"customer-validation");
    expect(await customerSnapshot(marker)).toEqual([]);
    await dialog.getByLabel("E-post").fill("record@example.test");
    await dialog.getByRole("button", { name: "Spara", exact: true }).click();
    await expect(dialog).toHaveCount(0);
    const rows = await customerSnapshot(marker);
    expect(rows).toHaveLength(1); expect(rows[0].city).toBe("Västerås"); expect(rows[0].audits).toBe(1);
    await page.reload();
    await expect(page.getByRole("link", { name: marker, exact: true })).toBeVisible();
  });

  test("B03 E35-3-T-error-retry AC3/AC7: archive cancel and confirm retain customer identity and soft archive", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    const marker = `35.3 archive ${crypto.randomUUID()}`, dialog = await openCustomerCreate(page, marker);
    await dialog.getByRole("button", { name: "Spara", exact: true }).click(); await expect(dialog).toHaveCount(0);
    const before = await customerSnapshot(marker); expect(before).toHaveLength(1);
    await page.getByRole("link", { name: marker, exact: true }).click();
    await page.getByRole("button", { name: "Arkivera kund", exact: true }).click();
    await page.getByRole("button", { name: "Avbryt", exact: true }).click();
    expect(await customerSnapshot(marker)).toEqual(before);
    await page.getByRole("button", { name: "Arkivera kund", exact: true }).click();
    await renderedContrast(page,page.getByRole("button",{name:"Arkivera kund",exact:true}),"destructive confirm text");
    await page.getByRole("button", { name: "Arkivera kund", exact: true }).click();
    await expect(page).toHaveURL(/\/customers$/);
    const after = await customerSnapshot(marker); expect(after).toHaveLength(1);
    expect(after[0].id).toBe(before[0].id); expect(after[0].archived_at).not.toBeNull();
    expect(after[0].audits).toBe(before[0].audits + 1);
  });

  test("B03 R3 offline archive: zero dispatch and no hint until one explicit confirmed retry after reconnect",async({page,context}) => {
    await signIn(page,fixture.adminA.email,fixture.adminA.password);
    const marker=`35.3 offline archive ${crypto.randomUUID()}`,created=await openCustomerCreate(page,marker);
    await created.getByRole("button",{name:"Spara",exact:true}).click(); await expect(created).toHaveCount(0);
    const before=await customerSnapshot(marker); expect(before).toHaveLength(1);
    await page.getByRole("link",{name:marker,exact:true}).click();
    await page.getByRole("button",{name:"Arkivera kund",exact:true}).click();
    const hintBefore=await page.evaluate(()=>Object.entries(sessionStorage)); expect(hintBefore).toEqual([]);
    let attempts=0;
    const count=(request:BrowserRequest)=>{if(request.method()==="POST"&&request.headers()["next-action"]) attempts++;};
    page.on("request",count);
    try {
      await context.setOffline(true); expect(await page.evaluate(()=>navigator.onLine)).toBe(false);
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click();
      await expect(page.getByRole("alert").filter({hasText:"Anslutning krävs."})).toHaveText("Anslutning krävs. Arkiveringen är inte skickad. Försök igen med Arkivera när du är ansluten.");
      expect(attempts).toBe(0); expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hintBefore);
      expect(await customerSnapshot(marker)).toEqual(before);
      await captureRecordState(page,"customer-archive-connection-required");
      await context.setOffline(false); expect(await page.evaluate(()=>navigator.onLine)).toBe(true);
      await expect(page.getByRole("button",{name:"Arkivera kund",exact:true})).toBeEnabled();
      expect(attempts).toBe(0); expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hintBefore);
      expect(await customerSnapshot(marker)).toEqual(before);
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click();
      await expect(page).toHaveURL(/\/customers$/);
      expect(attempts).toBe(1); expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hintBefore);
      const after=await customerSnapshot(marker); expect(after).toHaveLength(1);
      expect(after[0].id).toBe(before[0].id); expect(after[0].archived_at).not.toBeNull(); expect(after[0].audits).toBe(before[0].audits+1);
    } finally {await context.setOffline(false); page.off("request",count);}
  });

  test("B03 R1 archive: pending edit exclusion and requested Back history survive one real archive",async({page}) => {
    await signIn(page,fixture.adminA.email,fixture.adminA.password);
    const marker=`35.3 archive history ${crypto.randomUUID()}`,created=await openCustomerCreate(page,marker);
    await created.getByRole("button",{name:"Spara",exact:true}).click(); await expect(created).toHaveCount(0);
    const id=(await customerSnapshot(marker))[0].id;
    // Build real same-document Dashboard -> list -> detail history using existing navigation.
    await openPhoneNavigation(page); await page.getByRole("link",{name:"Dashboard",exact:true}).click();
    await expect(page.getByRole("heading",{name:"Dashboard",exact:true})).toBeVisible();
    const dashboardKey=await page.evaluate(()=>(window as unknown as {navigation:{currentEntry:{key:string}}}).navigation.currentEntry.key);
    await openPhoneNavigation(page); await page.getByRole("link",{name:"Kunder",exact:true}).click();
    await expect(page.getByTestId("new-customer-button")).toBeVisible();
    await page.getByRole("link",{name:marker,exact:true}).click();
    const historyState=()=>page.evaluate(()=>({url:location.href,length:history.length,key:(window as unknown as {navigation:{currentEntry:{key:string}}}).navigation.currentEntry.key}));
    const gate=await customerActionGate(page,id,"hold",marker);
    try {
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click();
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click(); await gate.observed;
      await expect(page.getByTestId("edit-customer-button")).toBeDisabled();
      const hint=await page.evaluate(()=>Object.entries(sessionStorage)); expect(hint).toHaveLength(1);
      await page.goBack(); await expect(page).toHaveURL(/\/customers$/);
      await page.goBack(); await expect(page).toHaveURL(/\/dashboard$/);
      const requested=await historyState(); expect(requested.key).toBe(dashboardKey);
      // Observed framework path retains A DOM; URL alone does not establish a new journey.
      await expect(page.getByRole("heading",{name:marker,exact:true})).toBeVisible();
      await expect(page.getByTestId("edit-customer-button")).toBeDisabled();
      expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hint);
      await gate.dispose();
      await expect(page).toHaveURL(/\/dashboard$/);
      await expect(page.getByRole("heading",{name:"Dashboard",exact:true})).toBeVisible();
      expect(await historyState()).toEqual(requested);
      expect(gate.attempts()).toBe(1);
      const row=(await customerSnapshot(marker))[0]; expect(row.archived_at).not.toBeNull(); expect(row.audits).toBe(2);
      await page.goForward(); await expect(page.getByTestId("new-customer-button")).toBeVisible();
      await page.goForward(); await expect(page).toHaveURL(new RegExp(`/customers/${id}$`));
      const returned=await openCustomerEditor(page,id,false); await returned.getByLabel("Ort").fill("Returned after terminal draft");
      expect((await customerSnapshot(marker))[0].audits).toBe(2);
      await expect(returned.getByLabel("Ort")).toHaveValue("Returned after terminal draft");
      await expect(page).toHaveURL(new RegExp(`/customers/${id}$`));
    } finally {await gate.dispose();}
  });

  test("B03 R1 archive: lost real response blocks replay through reopen and remount",async({page,context}) => {
    await signIn(page,fixture.adminA.email,fixture.adminA.password);
    const marker=`35.3 archive lost ${crypto.randomUUID()}`,created=await openCustomerCreate(page,marker);
    await created.getByRole("button",{name:"Spara",exact:true}).click(); await expect(created).toHaveCount(0);
    const id=(await customerSnapshot(marker))[0].id; await page.getByRole("link",{name:marker,exact:true}).click();
    const gate=await customerActionGate(page,id,"lose-response",marker);
    try {
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click();
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click(); await gate.observed;
      await expect(page.getByText("Arkiveringens resultat är obekräftat.",{exact:false})).toBeVisible();
      await expect(page.getByRole("button",{name:"Arkivera kund",exact:true})).toBeDisabled();
      await page.getByRole("button",{name:"Avbryt",exact:true}).click();
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click();
      await expect(page.getByRole("button",{name:"Arkivera kund",exact:true})).toBeDisabled();
      const hint=await page.evaluate(()=>Object.entries(sessionStorage)); expect(hint).toHaveLength(1);
      expect(JSON.stringify(hint)).not.toContain(id); expect(JSON.stringify(hint)).not.toContain(marker);
      await context.setOffline(true); expect(await page.evaluate(()=>navigator.onLine)).toBe(false);
      await expect(page.getByRole("button",{name:"Arkivera kund",exact:true})).toBeDisabled();
      expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hint);
      await context.setOffline(false); expect(await page.evaluate(()=>navigator.onLine)).toBe(true);
      await expect(page.getByRole("button",{name:"Arkivera kund",exact:true})).toBeDisabled();
      expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hint);
      await page.reload();
      const reopened=await openCustomerEditor(page,id,false);
      await expect(reopened.getByRole("button",{name:"Spara",exact:true})).toBeDisabled();
      expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hint);
      expect(gate.attempts()).toBe(1); const row=(await customerSnapshot(marker))[0]; expect(row.archived_at).not.toBeNull(); expect(row.audits).toBe(2);
    } finally {await context.setOffline(false); await gate.dispose();}
  });

  test("B03 R1 archive: unavailable storage prevents dispatch and preserves the whole snapshot",async({page}) => {
    await signIn(page,fixture.adminA.email,fixture.adminA.password);
    await page.addInitScript(()=>{Object.defineProperty(window,"sessionStorage",{configurable:true,get:()=>{throw new DOMException("Controlled unavailable","SecurityError");}});});
    await page.goto(`/customers/${fixture.crm.company.id}`);
    const before=await customerSnapshot(fixture.crm.company.displayName),gate=await customerActionGate(page,fixture.crm.company.id,"hold",fixture.crm.company.displayName);
    try {
      await page.getByRole("button",{name:"Arkivera kund",exact:true}).click();
      await expect(page.getByRole("button",{name:"Arkivera kund",exact:true})).toBeDisabled();
      expect(gate.attempts()).toBe(0); expect(await customerSnapshot(fixture.crm.company.displayName)).toEqual(before);
    } finally {await gate.dispose();}
  });

  test("B05 R1 offline before dispatch retains input without a hint; explicit reconnect saves once",async({page,context}) => {
    await signIn(page,fixture.adminA.email,fixture.adminA.password);
    const marker=`35.3 offline ${crypto.randomUUID()}`,dialog=await openCustomerCreate(page,marker);
    const before=await page.evaluate(()=>Object.entries(sessionStorage)); let attempts=0;
    const count=(request:BrowserRequest)=>{if(request.method()==="POST"&&request.headers()["next-action"]) attempts++;};
    page.on("request",count);
    try {
      await context.setOffline(true); expect(await page.evaluate(()=>navigator.onLine)).toBe(false);
      await dialog.getByRole("button",{name:"Spara",exact:true}).click();
      await expect(dialog.getByText(/Anslutning krävs/)).toBeVisible();
      await expect(dialog.getByLabel("Visningsnamn")).toHaveValue(marker); expect(attempts).toBe(0);
      expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(before); expect(await customerSnapshot(marker)).toEqual([]);
      await context.setOffline(false); expect(await page.evaluate(()=>navigator.onLine)).toBe(true);
      await dialog.getByRole("button",{name:"Spara",exact:true}).click(); await expect(dialog).toHaveCount(0);
      expect(attempts).toBe(1); expect((await customerSnapshot(marker))[0].audits).toBe(1);
    } finally {await context.setOffline(false); page.off("request",count);}
  });

  test("B04 E35-3-T-submitting/confirmed AC3/AC5: one real attempt and busy Escape/close protection", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    const marker = `35.3 pending ${crypto.randomUUID()}`, gate = await customerActionGate(page, marker, "hold");
    try {
      const dialog = await openCustomerCreate(page, marker);
      await dialog.getByRole("button", { name: "Spara", exact: true }).dblclick(); await gate.observed;
      await page.keyboard.press("Enter"); await page.keyboard.press("Escape");
      await expect(dialog).toBeVisible(); await expect(dialog.getByLabel("Visningsnamn")).toHaveValue(marker);
      expect(gate.attempts()).toBe(1);
      await captureRecordState(page,"customer-pending");
      await expect(dialog.getByRole("button", { name: "Avbryt", exact: true })).toBeDisabled();
      await expect(dialog.getByLabel("Visningsnamn")).toBeDisabled();
      await renderedContrast(page,dialog.getByRole("button",{name:"Sparar…",exact:true}),"disabled pending save",false,true);
    } finally { await gate.dispose(); }
    await expect(page.getByRole("dialog", { name: "Ny kund" })).toHaveCount(0);
    expect((await customerSnapshot(marker))[0].audits).toBe(1);
  });

  for (const mode of ["before-forward", "lose-response"] as const) {
    test(`B05 E35-3-T-connection-required/unknown AC6: ${mode} retains unconfirmed input and blocks replay after remount`, async ({ page }) => {
      await signIn(page, fixture.adminA.email, fixture.adminA.password);
      const marker = `35.3 unknown ${crypto.randomUUID()}`, gate = await customerActionGate(page, marker, mode);
      try {
        const dialog = await openCustomerCreate(page, marker);
        await dialog.getByRole("button", { name: "Spara", exact: true }).click(); await gate.observed;
        await expect(dialog).toBeVisible(); await expect(dialog.getByLabel("Visningsnamn")).toHaveValue(marker);
        await expect(dialog.getByText(/obekräft|inte.*bekräft|okänt/i).first()).toBeVisible();
        await expect(dialog.getByRole("button", { name: "Spara", exact: true })).toBeDisabled();
        expect(gate.attempts()).toBe(1);
        await captureRecordState(page,`customer-unknown-${mode}`);
        const rows = await customerSnapshot(marker);
        expect(rows).toHaveLength(mode === "before-forward" ? 0 : 1);
        // Test knowledge of undispatched transport is not a production rollback receipt.
        page.once("dialog", async (prompt) => { await prompt.accept(); });
        await page.reload();
        const reopened = await openCustomerCreate(page, marker);
        await expect(reopened.getByRole("button", { name: "Spara", exact: true })).toBeDisabled();
        expect(gate.attempts()).toBe(1); expect(await customerSnapshot(marker)).toEqual(rows);
        const storage = await page.evaluate(() => Object.values(sessionStorage));
        expect(storage.join(" ")).not.toContain(marker);
        expect(storage.join(" ")).not.toContain(fixture.crm.private.personnummer);
        expect(storage.join(" ")).not.toContain(fixture.crm.company.id);
      } finally { await gate.dispose(); }
    });
  }

  test("B06 E35-3-T-stale/late-result/confirmed AC6/AC7: two real editors preserve conflict draft until explicit fresh review", async ({ page, context }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    const marker = `35.3 conflict ${crypto.randomUUID()}`, created = await openCustomerCreate(page, marker);
    await created.getByRole("button", { name: "Spara", exact: true }).click(); await expect(created).toHaveCount(0);
    const id = (await customerSnapshot(marker))[0].id;
    const first = await openCustomerEditor(page, id), secondPage = await context.newPage();
    await captureRecordState(page,"customer-edit-loaded");
    try {
      // Independent browser page/action-state instance; same entitled tenant actor.
      const second = await openCustomerEditor(secondPage, id);
      await second.getByLabel("Telefon").fill("+46706666666");
      await second.getByRole("button", { name: "Spara", exact: true }).click(); await expect(second).toHaveCount(0);
      await first.getByLabel("Ort").fill("Malmö");
      const submitted = page.waitForRequest((request) => request.method() === "POST" && !!request.headers()["next-action"]
        && (request.postData() ?? "").includes(marker));
      await first.getByRole("button", { name: "Spara", exact: true }).click();
      const form = await customerActionForm(await submitted);
      expect(form).not.toBeNull();
      const expected: unknown = JSON.parse(actionField(form!, "expected_customer"));
      expect(expected).toMatchObject({ id, phone: null, city: null, archived_at: null });
      expect(Object.keys(expected as object).sort()).toEqual([
        "id", "customer_type", "display_name", "personnummer", "org_nr", "contact_name", "email", "phone",
        "address_line1", "address_line2", "postal_code", "city", "archived_at",
      ].sort());
      await expect(first).toBeVisible(); await expect(first.getByText(/ändrats|aktuell.*uppgift/i).first()).toBeVisible();
      await expect(first.getByLabel("Ort")).toHaveValue("Malmö");
      await captureRecordState(page,"customer-conflict");
      const afterB = await customerSnapshot(marker); expect(afterB[0].phone).toBe("+46706666666"); expect(afterB[0].city).toBeNull();
      const priorBaseline=await first.locator('input[name="expected_customer"]').inputValue();
      let reads=0,release!:()=>void,observed!:()=>void,delivered!:()=>void;
      const readHeld=new Promise<void>((resolve)=>{release=resolve;}),readObserved=new Promise<void>((resolve)=>{observed=resolve;}),readDelivered=new Promise<void>((resolve)=>{delivered=resolve;});
      const refreshHandler=async(route:Route)=>{
        const request=route.request();
        if(request.method()!=="GET"||new URL(request.url()).pathname!==`/customers/${id}`||!request.headers().rsc||request.headers()["next-router-prefetch"]) {await route.fallback();return;}
        reads++;
        const response=await route.fetch(); observed(); await readHeld; await route.fulfill({response}); delivered();
      };
      await page.route("**/*",refreshHandler);
      try {
        const historyBefore=await page.evaluate(()=>({url:location.href,length:history.length}));
        await first.getByRole("button",{name:/hämta.*aktuell|uppdatera.*granska/i}).click();
        const consent=page.getByRole("alertdialog"); await expect(consent).toContainText(/Utkastet kastas/);
        await consent.getByRole("button",{name:"Fortsätt redigera",exact:true}).click();
        await expect(first.getByLabel("Ort")).toHaveValue("Malmö");
        expect(await first.locator('input[name="expected_customer"]').inputValue()).toBe(priorBaseline);
        expect(await page.evaluate(()=>({url:location.href,length:history.length}))).toEqual(historyBefore); expect(reads).toBe(0);
        await first.getByRole("button",{name:/hämta.*aktuell|uppdatera.*granska/i}).click();
        await context.setOffline(true);
        await consent.getByRole("button",{name:"Kasta utkast och hämta aktuella uppgifter",exact:true}).click();
        await expect(first.getByText(/Anslutning krävs/)).toBeVisible();
        await expect(first.getByLabel("Ort")).toHaveValue("Malmö");
        expect(await first.locator('input[name="expected_customer"]').inputValue()).toBe(priorBaseline);
        expect(await page.evaluate(()=>({url:location.href,length:history.length}))).toEqual(historyBefore); expect(reads).toBe(0);
        await context.setOffline(false);
        await first.getByRole("button",{name:/hämta.*aktuell|uppdatera.*granska/i}).click();
        await consent.getByRole("button",{name:"Kasta utkast och hämta aktuella uppgifter",exact:true}).click(); await readObserved;
        expect(reads).toBe(1);
        await expect(first.getByLabel("Ort")).toBeDisabled(); await expect(first.getByLabel("Telefon")).toBeDisabled();
        await page.keyboard.type("Must not replace the pending draft");
        await expect(first.getByLabel("Ort")).toHaveValue("Malmö");
        release(); await readDelivered;
      } finally {await context.setOffline(false);release(); await page.unroute("**/*",refreshHandler);}
      await expect(first.getByLabel("Telefon")).toHaveValue("+46706666666");
      await expect(first.getByLabel("Ort")).toHaveValue("");
      await expect(first.getByLabel("Ort")).toBeEnabled();
      await first.getByLabel("Ort").fill("Malmö");
      await first.getByRole("button", { name: "Spara", exact: true }).click(); await expect(first).toHaveCount(0);
      expect((await customerSnapshot(marker))[0]).toMatchObject({ id, phone: "+46706666666", city: "Malmö", audits: 3 });
      // A genuine controlled503 demonstrates the supported native fallback AFTER explicit abandonment.
      const third=await openCustomerEditor(page,id), fourth=await openCustomerEditor(secondPage,id);
      await fourth.getByLabel("Telefon").fill("+46707777777");
      await fourth.getByRole("button",{name:"Spara",exact:true}).click(); await expect(fourth).toHaveCount(0);
      await third.getByLabel("Ort").fill("Explicitly abandoned before503");
      await third.getByRole("button",{name:"Spara",exact:true}).click();
      await expect(third.getByRole("button",{name:/hämta.*aktuell|uppdatera.*granska/i})).toBeVisible();
      const beforeFailure=await customerSnapshot(marker); expect(beforeFailure[0].audits).toBe(4);
      const hintBefore=await page.evaluate(()=>Object.entries(sessionStorage));
      const failureHandler=async(route:Route)=>{
        const request=route.request();
        if(request.method()==="GET"&&new URL(request.url()).pathname===`/customers/${id}`) {
          await route.fulfill({status:503,contentType:"text/html; charset=utf-8",body:"<!doctype html><title>Kontrollerat hämtningsfel</title><p>Hämtningen misslyckades. Försök igen i webbläsaren.</p>"});
        } else await route.fallback();
      };
      await page.route("**/*",failureHandler);
      try {
        await third.getByRole("button",{name:/hämta.*aktuell|uppdatera.*granska/i}).click();
        await expect(page.getByRole("alertdialog")).toContainText(/webbläsarens försök igen/);
        const documentFailure=page.waitForResponse((response)=>response.request().resourceType()==="document"&&response.status()===503);
        await page.getByRole("button",{name:"Kasta utkast och hämta aktuella uppgifter",exact:true}).click();
        await documentFailure;
        await expect(page.getByText("Hämtningen misslyckades. Försök igen i webbläsaren.",{exact:true})).toBeVisible();
        expect(await customerSnapshot(marker)).toEqual(beforeFailure);
        expect(await page.evaluate(()=>Object.entries(sessionStorage))).toEqual(hintBefore);
        await expect(page.getByRole("dialog")).toHaveCount(0);
        await expect(page.getByText(/Kunden sparades|Sparat/, {exact:false})).toHaveCount(0);
        await captureRecordState(page,"controlled-checked-read-503-document-fallback");
      } finally {await page.unroute("**/*",failureHandler);}
    } finally { await secondPage.close(); }
  });

  for (const traversal of ["back", "forward"] as const) {
    test(`B07 E35-3-T-dirty-navigation/focus-dialog AC5: ${traversal} is cancelled before URL/history commit`, async ({ page }) => {
      await signIn(page, fixture.adminA.email, fixture.adminA.password);
      await page.goto("/customers");
      await page.getByRole("link", {name:fixture.crm.company.displayName,exact:true}).click();
      await expect(page).toHaveURL(new RegExp(`/customers/${fixture.crm.company.id}$`));
      if (traversal === "forward") {
        await openPhoneNavigation(page);
        await page.getByRole("link", {name:"Kunder",exact:true}).click(); await page.goBack();
      }
      const editor = await openCustomerEditor(page, fixture.crm.company.id, false);
      await editor.getByLabel("Ort").fill("Unsent 35.3 draft");
      const before = await page.evaluate(() => {
        const nav = (window as unknown as { navigation?: { currentEntry?: { key: string } } }).navigation;
        return { url: location.href, length: history.length, key: nav?.currentEntry?.key };
      });
      expect(before.key).toBeTruthy();
      await page.evaluate(() => {
        const scope = window as unknown as { __crmTraversalEntries: string[]; navigation: EventTarget & { currentEntry: { key: string } } };
        scope.__crmTraversalEntries = [];
        scope.navigation.addEventListener("currententrychange", () => { scope.__crmTraversalEntries.push(scope.navigation.currentEntry.key); });
      });
      await page.evaluate((direction) => { if (direction === "back") history.back(); else history.forward(); }, traversal);
      const decision = page.getByRole("alertdialog"); await expect(decision).toBeVisible();
      expect(await page.evaluate(() => (window as unknown as { __crmTraversalEntries: string[] }).__crmTraversalEntries)).toEqual([]);
      expect(await page.evaluate(() => ({ url: location.href, length: history.length,
        key: (window as unknown as { navigation: { currentEntry: { key: string } } }).navigation.currentEntry.key }))).toEqual(before);
      await decision.getByRole("button", { name: /fortsätt.*redigera|stanna|avbryt/i }).click();
      await expect(editor.getByLabel("Ort")).toHaveValue("Unsent 35.3 draft");
      expect(await page.evaluate(() => (window as unknown as { __crmTraversalEntries: string[] }).__crmTraversalEntries)).toEqual([]);
      expect(await page.evaluate(() => ({ url: location.href, length: history.length,
        key: (window as unknown as { navigation: { currentEntry: { key: string } } }).navigation.currentEntry.key }))).toEqual(before);
    });
  }

  test("B06 E35-3-T-loading/late-result AC2/AC5: delayed A read cannot replace the newer B selection", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    let release!: () => void, observed!: () => void, rejectObserved!: (error: unknown) => void;
    let resolveDelivered!: () => void, rejectDelivered!: (error: unknown) => void;
    const held = new Promise<void>((resolve) => { release = resolve; });
    const started = new Promise<void>((resolve, reject) => { observed = resolve; rejectObserved = reject; });
    const delivered = new Promise<void>((resolve, reject) => { resolveDelivered = resolve; rejectDelivered = reject; });
    void started.catch(() => undefined);
    void delivered.catch(() => undefined);
    const handler = async (route: Route) => {
      const request = route.request();
      if (request.method() !== "GET" || new URL(request.url()).pathname !== `/customers/${fixture.crm.company.id}`
        || !request.headers().rsc || request.headers()["next-router-prefetch"]) { await route.fallback(); return; }
      try {
        const response = await route.fetch(); observed(); await held; await route.fulfill({ response }); resolveDelivered();
      } catch (error) { rejectObserved(error); rejectDelivered(error); throw error; }
    };
    await page.route("**/*", handler);
    try {
      await page.goto("/customers");
      const selected = page.getByRole("checkbox", { name: `Välj ${fixture.crm.company.displayName}`, exact: true });
      await selected.check();
      await page.getByRole("link", { name: fixture.crm.company.displayName, exact: true }).click({ noWaitAfter: true });
      await started;
      await expect(selected).toBeChecked();
      await expect(page.getByTestId("customers-empty")).toHaveCount(0);
      await expect(page.getByRole("status").filter({ hasText: /laddar|hämtar/i }).first()).toBeVisible();
      await captureRecordState(page,"customer-loading");
      await page.getByRole("link", { name: fixture.crm.private.displayName, exact: true }).click();
      await expect(page.getByRole("heading", { name: fixture.crm.private.displayName, exact: true })).toBeVisible();
      release();
      await delivered;
      await expect(page).toHaveURL(new RegExp(`/customers/${fixture.crm.private.id}$`));
      await expect(page.getByRole("heading", { name: fixture.crm.private.displayName, exact: true })).toBeVisible();
    } finally { release(); await page.unroute("**/*", handler); }
  });

  test("B07 E35-3-T-focus-dialog/dirty-navigation AC5: focus wraps and cancelling dirty Escape retains the draft", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    const marker = `35.3 dirty ${crypto.randomUUID()}`, dialog = await openCustomerCreate(page, marker);
    const save = dialog.getByRole("button", { name: "Spara", exact: true }); await save.focus();
    await page.keyboard.press("Tab");
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    await page.keyboard.press("Shift+Tab");
    expect(await dialog.evaluate((node) => node.contains(document.activeElement))).toBe(true);
    const before = page.url(); await page.keyboard.press("Escape");
    const decision = page.getByRole("alertdialog"); await expect(decision).toBeVisible();
    await expect(decision.getByRole("button",{name:"Fortsätt redigera"})).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(decision.getByRole("button",{name:"Spara och fortsätt"})).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(decision.getByRole("button",{name:"Fortsätt redigera"})).toBeFocused();
    await decision.getByRole("button", { name: /fortsätt.*redigera|stanna|avbryt/i }).click();
    await expect(dialog.getByLabel("Visningsnamn")).toHaveValue(marker); expect(page.url()).toBe(before);
    expect(await customerSnapshot(marker)).toEqual([]);
    await page.keyboard.press("Escape");
    await expect(decision).toBeVisible();
    await captureRecordState(page,"customer-dirty-decision");
    await decision.getByRole("button",{name:"Kasta ändringar"}).click();
    await expect(dialog).toHaveCount(0);
    expect(await customerSnapshot(marker)).toEqual([]);
    const savedMarker=`${marker} saved`, saveDialog=await openCustomerCreate(page,savedMarker);
    await saveDialog.getByLabel("Organisationsnummer").fill("");
    await page.keyboard.press("Escape");
    const saveDecision=page.getByRole("alertdialog");
    await saveDecision.getByRole("button",{name:"Spara och fortsätt"}).click();
    await expect(saveDialog).toBeVisible();
    await expect(saveDialog.getByLabel("Organisationsnummer")).toHaveAttribute("aria-invalid","true");
    await expect(page).toHaveURL(/\/customers$/);
    expect(await customerSnapshot(savedMarker)).toEqual([]);
    await saveDecision.getByRole("button",{name:"Fortsätt redigera"}).click();
    await saveDialog.getByLabel("Organisationsnummer").fill("556677-8899");
    await page.keyboard.press("Escape");
    await saveDecision.getByRole("button",{name:"Spara och fortsätt"}).click();
    await expect(saveDialog).toHaveCount(0);
    const saved=await customerSnapshot(savedMarker);
    expect(saved).toHaveLength(1); expect(saved[0].audits).toBe(1);
  });

  test("B05 E35-3-T-unknown AC6: unavailable safety storage fails closed before dispatch", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.addInitScript(() => { Object.defineProperty(window, "sessionStorage", { configurable: true,
      get: () => { throw new DOMException("Controlled storage unavailable", "SecurityError"); } }); });
    const marker = `35.3 storage ${crypto.randomUUID()}`, gate = await customerActionGate(page, marker, "hold");
    try {
      const dialog = await openCustomerCreate(page, marker);
      await expect(dialog.getByRole("button", { name: "Spara", exact: true })).toBeDisabled();
      await expect(dialog.getByText(/säker.*spara|inte.*bekräft|obekräft/i).first()).toBeVisible();
      expect(gate.attempts()).toBe(0); expect(await customerSnapshot(marker)).toEqual([]);
    } finally { await gate.dispose(); }
  });

  test("B05 E35-3-T-unknown AC6: corrupt unresolved hint cannot enable a fresh customer command", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    const beforeKeys = await page.evaluate(() => Object.keys(sessionStorage));
    const marker = `35.3 corrupt ${crypto.randomUUID()}`, gate = await customerActionGate(page, marker, "lose-response");
    try {
      const dialog = await openCustomerCreate(page, marker);
      await dialog.getByRole("button", { name: "Spara", exact: true }).click(); await gate.observed;
      const hintKeys = await page.evaluate((existing) => Object.keys(sessionStorage).filter((key) => !existing.includes(key)), beforeKeys);
      expect(hintKeys).toHaveLength(1);
      // Discover the actual written hint instead of prescribing a storage key/API.
      await page.evaluate((key) => sessionStorage.setItem(key, "{corrupt-35.3"), hintKeys[0]);
      page.once("dialog", async (prompt) => { await prompt.accept(); }); await page.reload();
      const reopened = await openCustomerCreate(page, marker);
      await expect(reopened.getByRole("button", { name: "Spara", exact: true })).toBeDisabled();
      expect(gate.attempts()).toBe(1); expect((await customerSnapshot(marker))[0].audits).toBe(1);
    } finally { await gate.dispose(); }
  });

  test("B08 E35-3-T-AC4: connected 360×640 targets, labeled overflow and visible actions/errors", async ({ page }) => {
    await page.setViewportSize({ width: 360, height: 640 });
    await signIn(page, fixture.adminA.email, fixture.adminA.password); await page.goto("/customers");
    const region = page.getByRole("region", { name: /kundlista/i }); await expect(region).toBeVisible();
    await expect(region).toHaveAttribute("tabindex", "0");
    const marker = `35.3 phone ${crypto.randomUUID()}`, dialog = await openCustomerCreate(page, marker);
    for (const label of ["Visningsnamn", "Organisationsnummer", "E-post", "Ort"]) {
      const control = dialog.getByLabel(label); await control.scrollIntoViewIfNeeded();
      const box = await control.boundingBox(); expect(box?.height).toBeGreaterThanOrEqual(44);
    }
    await dialog.getByLabel("E-post").fill("invalid");
    const save = dialog.getByRole("button", { name: "Spara", exact: true }); await save.scrollIntoViewIfNeeded(); await save.click();
    await expect(dialog.getByTestId("form-error-summary")).toBeVisible();
    await captureRecordState(page,"customer-phone-validation");
    const email=dialog.getByLabel("E-post"); await email.focus();
    await renderedContrast(page,email,"invalid field text");
    await renderedContrast(page,email,"invalid field focus against field",true);
    await renderedContrast(page,dialog.getByTestId("form-error-summary").getByRole("alert"),"validation summary text");
    const baselineHeight=(await email.boundingBox())!.height;
    // Controlled CSS zoom is an enlargement/reflow proxy, not physical device/browser-menu zoom.
    await page.setViewportSize({width:600,height:1280});
    await page.evaluate(()=>{document.documentElement.style.zoom="2";});
    await email.scrollIntoViewIfNeeded();
    const enlarged=(await email.boundingBox())!; expect(enlarged.height).toBeGreaterThanOrEqual(baselineHeight*1.9);
    expect(enlarged.x).toBeGreaterThanOrEqual(0); expect(enlarged.x+enlarged.width).toBeLessThanOrEqual(601);
    // Own form reflows at 300px effective width; global AppShell/table overflow is unowned.
    expect(await dialog.locator("form").evaluate((form)=>form.scrollWidth<=form.clientWidth+1)).toBe(true);
    await save.scrollIntoViewIfNeeded(); await expect(save).toBeInViewport();
    await captureRecordState(page,"controlled-css-zoom-200percent");
    await page.evaluate(()=>{document.documentElement.style.zoom="1";});
    // A 320px visible viewport models occlusion; it does not summon or prove an OS keyboard.
    await page.setViewportSize({width:360,height:320});
    const summary=dialog.getByTestId("form-error-summary"); await summary.scrollIntoViewIfNeeded(); await expect(summary).toBeInViewport();
    await summary.getByRole("link").first().click(); await expect(email).toBeFocused();
    await email.scrollIntoViewIfNeeded(); await expect(email).toBeInViewport();
    await save.scrollIntoViewIfNeeded(); await expect(save).toBeInViewport();
    const hit=await save.evaluate((button)=>{const box=button.getBoundingClientRect();return {top:box.top,bottom:box.bottom,reachable:button.contains(document.elementFromPoint(box.x+box.width/2,box.y+box.height/2))};});
    expect(hit.top).toBeGreaterThanOrEqual(0); expect(hit.bottom).toBeLessThanOrEqual(320); expect(hit.reachable).toBe(true);
    await save.click(); await expect(email).toHaveValue("invalid"); expect(await customerSnapshot(marker)).toEqual([]);
    await captureRecordState(page,"controlled-visible-viewport-occlusion");
  });

  test("B09 E35-3-T-empty/denied/revoked AC6: successful empty differs from foreign denial and live revocation", async ({ page }) => {
    const isolated = await createTwoTenantFixture();
    try {
      await signIn(page, isolated.adminA.email, isolated.adminA.password);
      await page.goto("/customers");
      await expect(page.getByTestId("customers-empty")).toBeVisible();
      await captureRecordState(page,"customers-empty");
      await expect(page.getByTestId("customers-failed")).toHaveCount(0);
      await expect(page.getByTestId("customers-no-results")).toHaveCount(0);
      await page.goto(`/customers/${fixture.crm.private.id}`);
      await expect(page.getByTestId("customer-not-found")).toBeVisible();
      expect(await page.content()).not.toContain(fixture.crm.private.personnummer);
      expect(await page.content()).not.toContain(fixture.crm.private.displayName);
      const marker = `35.3 revoked ${crypto.randomUUID()}`, dialog = await openCustomerCreate(page, marker);
      await adminExec("update public.tenant_memberships set status = 'disabled' where tenant_id = $1 and user_id = $2", [isolated.tenantA.id, isolated.adminA.id]);
      await dialog.getByRole("button", { name: "Spara", exact: true }).click();
      await expect(dialog).toBeVisible(); await expect(dialog.getByRole("alert")).toBeVisible();
      await expect(dialog.getByLabel("Visningsnamn")).toHaveValue(marker);
      await expect(dialog.getByRole("button",{name:"Spara",exact:true})).toBeDisabled();
      expect(await customerSnapshot(marker)).toEqual([]);
    } finally { await cleanupFixture(isolated); }
  });

  test("B10 E35-3-T-AC5/AC7 inherited contracts: facility/contact labels, summary, cancel and focus remain usable", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto(`/customers/${fixture.crm.company.id}`);
    for (const [triggerId, title] of [["new-facility-button", "Ny anläggning"], ["new-contact-button", "Ny kontakt"]] as const) {
      const trigger = page.getByTestId(triggerId); await waitForHydrated(trigger); await trigger.click();
      const dialog = page.getByRole("dialog", { name: title }); await expect(dialog).toBeVisible();
      const name = dialog.getByRole("textbox", { name: "Namn", exact: true });
      await expect(name).toBeFocused();
      await dialog.getByRole("button", { name: "Spara", exact: true }).click();
      await expect(name).toHaveAttribute("aria-invalid", "true");
      const errorId = await name.getAttribute("aria-describedby"); expect(errorId).toBeTruthy();
      await expect(dialog.locator(`[id="${errorId}"]`)).toBeVisible();
      await expect(dialog.getByTestId("form-error-summary")).toContainText(/.+/);
      await captureRecordState(page,`inherited-${triggerId}`);
      await dialog.getByRole("button", { name: "Avbryt", exact: true }).click();
      await expect(dialog).toHaveCount(0); await expect(trigger).toBeFocused();
    }
    const inheritedFixture = JSON.parse(readFileSync(path.join(process.cwd(),"tests/e2e/.auth/fixture.json"),"utf8")) as {calc:{id:string;title:string}};
    await page.goto(`/calculations/${inheritedFixture.calc.id}`);
    await expect(page.getByTestId("calculation-editor")).toBeVisible();
    await expect(page.getByLabel("Titel",{exact:true})).toHaveValue(inheritedFixture.calc.title);
    await captureRecordState(page,"inherited-calculation-field");
    await page.goto("/files");
    const uploadTrigger=page.getByTestId("upload-file-button"); await waitForHydrated(uploadTrigger); await uploadTrigger.click();
    await page.getByTestId("file-index-upload-owner-type").selectOption("calculation");
    await page.getByTestId("file-index-upload-owner").selectOption(inheritedFixture.calc.id);
    await expect(page.getByTestId("file-index-upload-form").locator('input[name="purpose"]')).toHaveValue("calculation_attachment");
    await captureRecordState(page,"inherited-file-index-select");
  });
});
