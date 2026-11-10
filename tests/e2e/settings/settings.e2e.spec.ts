/**
 * Story 3.3 — ATDD RED-PHASE scaffold: Settings UI E2E (Company settings + Quote
 * terms) against the REAL app + local Supabase stack + the two-tenant fixture.
 *
 * 🔴 RED PHASE — the whole suite is `test.describe.skip(...)` so the green `e2e` CI
 * job is UNPERTURBED until dev ships `/settings/company` + `/settings/quote-terms`
 * (force-dynamic server pages), the `src/components/settings/**` forms, and the
 * `src/features/settings/actions.ts` `"use server"` actions delegating to the
 * commands. Un-skip in the GREEN phase.
 *
 * MIRRORS the Story 3.2 CRM e2e pattern EXACTLY (signIn / waitForHydrated helpers,
 * the seeded two-tenant fixture, `getByLabel` + `aria-invalid`/`aria-describedby`
 * field-association assertions). The data-testids / Swedish labels asserted below are
 * the UI CONTRACT dev must implement to turn these GREEN.
 *
 * The LOAD-BEARING contracts these tests pin (the story encodes them):
 *   - Sign-off WARNING (P0, AC2): a NOT-approved quote_terms record renders a clear,
 *     non-color-only WARNING ("kräver godkännande av ägare/juridik"); saving the terms
 *     TEXT does NOT approve them — only the deliberate "Markera som godkänd" action
 *     does; an approved record shows "Godkänd av …" with who+when.
 *   - VAT rate validation (P0, AC4): an out-of-range VAT rate is rejected with a
 *     FIELD-ASSOCIATED error (aria-invalid + aria-describedby → error node) and the
 *     input is PRESERVED on failure. The rate displays as a percent but stores basis
 *     points; no VAT CALCULATION is performed (Epic 4).
 *   - Route auth + nav (P0, AC4): anon → /login; nav stays exactly aligned with active manifest
 *     modules (no new settings nav item; no /settings/pricing — Story 3.4).
 */
import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync } from "node:fs";
import path from "node:path";
import { adminQuery } from "../../factories/admin-sql";
import { expectActiveAdminNavigation } from "../support/active-admin-navigation";

interface SettingsFixture {
  readonly adminA: { readonly email: string; readonly password: string };
}

const fixture: SettingsFixture = JSON.parse(
  readFileSync(
    path.join(process.cwd(), "tests", "e2e", ".auth", "fixture.json"),
    "utf8",
  ),
);

/** Poll for React hydration before interacting (CRM-spec rationale). */
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

test.describe("Settings UI — Company + Quote terms (Story 3.3 E2E)", () => {
  test("AC4: anonymous visits to /settings/company and /settings/quote-terms redirect to /login", async ({
    page,
  }) => {
    await page.goto("/settings/company");
    await expect(page).toHaveURL(/\/login(\?|$)/);
    await page.goto("/settings/quote-terms");
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("AC4: the Company settings screen renders (Företagsinställningar) with a VAT-rate field", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/company");
    await expect(
      page.getByRole("heading", { name: "Företagsinställningar", level: 1 }),
    ).toBeVisible();
    await expect(page.getByLabel("Företagsnamn")).toBeVisible();
    await expect(page.getByLabel("Momssats")).toBeVisible();
  });

  test("AC4/AC5: an out-of-range VAT rate is rejected with a FIELD-ASSOCIATED error and input is preserved", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/company");

    const name = page.getByLabel("Företagsnamn");
    await waitForHydrated(name);
    await name.fill("Kopplas Pilot AB");
    const vat = page.getByLabel("Momssats");
    await vat.fill("250"); // 250 % — out of the [0,100] % range (> 10000 bp)
    await page.getByRole("button", { name: "Spara" }).click();

    // Field-associated error: the VAT input is aria-invalid + describedby its error node.
    await expect(vat).toHaveAttribute("aria-invalid", "true");
    const describedBy = await vat.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
    // The blocking summary is present and the previously-entered input is PRESERVED.
    await expect(page.getByTestId("form-error-summary")).toContainText(/.+/);
    await expect(name).toHaveValue("Kopplas Pilot AB");
    await expect(vat).toHaveValue("250");
  });

  test("AC4: a valid Company settings save round-trips (the rate persists as a percent display)", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/company");
    const name = page.getByLabel("Företagsnamn");
    await waitForHydrated(name);
    await name.fill("Kopplas Pilot AB");
    await page.getByLabel("Momssats").fill("25");
    await page.getByRole("button", { name: "Spara" }).click();
    await expect(page.getByTestId("settings-saved")).toBeVisible();

    // Reload reads the persisted value via the RLS client (force-dynamic).
    await page.reload();
    await expect(page.getByLabel("Företagsnamn")).toHaveValue("Kopplas Pilot AB");
    await expect(page.getByLabel("Momssats")).toHaveValue("25");
  });

  test("AC2: the Quote-terms screen shows the NOT-approved WARNING by default (sign-off status, non-color-only)", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/quote-terms");
    await expect(
      page.getByRole("heading", { name: "Offertvillkor", level: 1 }),
    ).toBeVisible();
    // The not-approved WARNING is a TESTED contract, not just copy. It carries TEXT
    // (not color alone) and names the owner/legal sign-off requirement.
    const warning = page.getByTestId("quote-terms-signoff-warning");
    await expect(warning).toBeVisible();
    await expect(warning).toContainText(/godkännande av ägare\/juridik/i);
  });

  test("AC2: saving the terms TEXT does NOT approve them — the WARNING persists after an edit-save", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/quote-terms");
    const terms = page.getByLabel("Offertvillkor");
    await waitForHydrated(terms);
    await terms.fill(`Villkor ${Date.now().toString(36)} (platshållartext)`);
    await page.getByRole("button", { name: "Spara villkor" }).click();
    await expect(page.getByTestId("settings-saved")).toBeVisible();

    // Editing/saving the wording must NEVER auto-approve: the not-approved WARNING
    // is STILL shown, and there is no "Godkänd av …" status from a mere text save.
    await expect(page.getByTestId("quote-terms-signoff-warning")).toBeVisible();
    await expect(page.getByTestId("quote-terms-approved-status")).toHaveCount(0);
  });

  test("AC2: the deliberate 'Markera som godkänd' action transitions to an APPROVED status (who + when)", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/quote-terms");
    // Ensure a saved terms record exists first.
    const terms = page.getByLabel("Offertvillkor");
    await waitForHydrated(terms);
    await terms.fill("Villkor att godkänna (platshållartext)");
    await page.getByRole("button", { name: "Spara villkor" }).click();
    await expect(page.getByTestId("settings-saved")).toBeVisible();

    // The deliberate human sign-off action — the ONLY path to approval.
    const approve = page.getByRole("button", { name: "Markera som godkänd" });
    await waitForHydrated(approve);
    await approve.click();

    // Approved status now shows who + when; the not-approved warning is gone.
    await expect(page.getByTestId("quote-terms-approved-status")).toContainText(
      /Godkänd av/i,
    );
    await expect(page.getByTestId("quote-terms-signoff-warning")).toHaveCount(0);
    await page.getByLabel("Offertvillkor").fill("Ändrat utkast efter godkännandet");
    await expect(page.getByText(/Utkastet har osparad ordalydelse/)).toBeVisible();
    await expect(page.getByTestId("quote-terms-approved-status")).toContainText(/Sparade villkor.*Godkänd av/i);
    await expect(page.getByTestId("quote-terms-signoff-warning")).toHaveCount(0);
  });

  test("AC4: the nav stays EXACTLY aligned with active manifest modules — no new settings nav item, no /settings/pricing", async ({
    page,
  }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/company");
    const nav = page.getByRole("navigation", { name: "Huvudnavigation" }).first();
    await expectActiveAdminNavigation(nav);
    // /settings/pricing belongs to Story 3.4 — it must NOT be reachable/linked here.
    await expect(nav.getByRole("link", { name: "Prissättning" })).toHaveCount(0);
  });
});

import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import type { TestInfo, Request as BrowserRequest } from "@playwright/test";
import { createTwoTenantFixture, cleanupFixture } from "../../factories/tenants";

test("E35-7 ATDD company validation links to the invalid VAT field on a phone", async ({ page }) => {
    const own = await createTwoTenantFixture();
    try {
        await page.setViewportSize({ width: 360, height: 640 });
        await signIn(page, own.adminA.email, own.adminA.password);
        await page.goto("/settings");
        await page.getByRole("link", { name: /^Företagsinställningar/ }).click();
        await expect(page).toHaveURL(/\/settings\/company$/);
        await expect(page.getByTestId("company-empty-defaults")).toBeVisible();
        const name = page.getByLabel("Företagsnamn");
        await waitForHydrated(name);
        const save = page.getByRole("button", { name: "Spara", exact: true });
        const draft = "Kopplas Provbolag AB";
        await name.fill(draft);
        const vat = page.getByLabel("Momssats");
        await vat.fill("250");
        await save.click();
        await expect(vat).toHaveAttribute("aria-invalid", "true");
        await expect(vat).toHaveAccessibleDescription(/.+/);
        await expect(name).toHaveValue(draft);
        await expect(vat).toHaveValue("250");
        await expect(page.getByTestId("settings-saved")).toHaveCount(0);

        const errorLink = page.getByTestId("form-error-summary").getByRole("link", { name: /moms/i });
        await expect(errorLink).toBeVisible();
        await errorLink.press("Enter");
        await expect(vat).toBeFocused();
        await expect(vat).toBeInViewport();

        await vat.fill("25");
        await save.click();
        await expect(page.getByTestId("settings-saved")).toContainText("Aktuella uppgifter är bekräftade.");
        await expect(page.getByTestId("company-empty-defaults")).toHaveCount(0);
        await page.reload();
        await expect(name).toHaveValue(draft);
        await expect(vat).toHaveValue("25");
    } finally {
        await cleanupFixture(own);
    }
});

test("E35-7 cancels a settings link and Back without replacing the terms draft or history", async ({ page }) => {
    const own = await createTwoTenantFixture();
    try {
        await page.setViewportSize({ width: 360, height: 640 });
        await signIn(page, own.adminA.email, own.adminA.password);
        await page.goto("/settings");
        await page.getByRole("link", { name: /^Offertvillkor/ }).click();
        const terms = page.getByLabel("Offertvillkor");
        await waitForHydrated(terms);
        const before = await page.evaluate(() => ({
            href: location.href,
            index: (window as Window & { navigation?: { currentEntry: { index: number } } }).navigation?.currentEntry.index,
            length: history.length,
        }));
        expect(before.index).toEqual(expect.any(Number));
        const whitespaceDraft = " \n ";
        await terms.fill(whitespaceDraft);
        await expect(page.getByText(/Utkastet har osparade ändringar i blanksteg/)).toBeVisible();
        const backLink = page.getByRole("link", { name: "← Inställningar" });

        const linkPrompt = page.waitForEvent("dialog");
        const click = backLink.click();
        await (await linkPrompt).dismiss();
        await click;
        await expect(terms).toHaveValue(whitespaceDraft);

        const traversePrompt = page.waitForEvent("dialog");
        const back = page.evaluate(() => history.back());
        await (await traversePrompt).dismiss();
        await back;
        await expect(terms).toHaveValue(whitespaceDraft);
        expect(await page.evaluate(() => ({
            href: location.href,
            index: (window as Window & { navigation?: { currentEntry: { index: number } } }).navigation?.currentEntry.index,
            length: history.length,
        }))).toEqual(before);

        const discardPrompt = page.waitForEvent("dialog");
        const leave = backLink.click();
        await (await discardPrompt).accept();
        await leave;
        await expect(page).toHaveURL(/\/settings$/);
        await page.getByRole("link", { name: /^Offertvillkor/ }).click();
        await expect(page.getByLabel("Offertvillkor")).toHaveValue("");
    } finally {
        await cleanupFixture(own);
    }
});

test("E35-7 hides company write controls after current membership is revoked", async ({ page }) => {
    const own = await createTwoTenantFixture();
    try {
        await signIn(page, own.adminA.email, own.adminA.password);
        await page.goto("/settings/company");
        const name = page.getByLabel("Företagsnamn");
        await waitForHydrated(name);
        await name.fill("Bolaget med återkallad åtkomst");
        const before = await adminQuery(
            "select id from public.audit_events where tenant_id=$1 order by id",
            [own.tenantA.id],
        );
        const affected = await adminQuery(
            "update public.tenant_memberships set status='disabled' where tenant_id=$1 and user_id=$2 returning id",
            [own.tenantA.id, own.adminA.id],
        );
        expect(affected).toHaveLength(1);
        await page.getByRole("button", { name: "Spara", exact: true }).click();
        await expect(page.getByRole("alert").filter({ hasText: "Du har inte behörighet att utföra åtgärden." })).toBeVisible();
        await expect(name).toBeHidden();
        await expect(page.getByRole("button", { name: "Spara", exact: true })).toHaveCount(0);
        await expect(page.getByTestId("settings-saved")).toHaveCount(0);
        expect(await adminQuery("select id from public.company_settings where tenant_id=$1", [own.tenantA.id])).toEqual([]);
        expect(await adminQuery(
            "select id from public.audit_events where tenant_id=$1 order by id",
            [own.tenantA.id],
        )).toEqual(before);
    } finally {
        await cleanupFixture(own);
    }
});

async function assertProducerTouchTargets(scope: Page | Locator, names: readonly string[]) {
    for (const name of names) {
        const control = scope.getByRole("button", { name, exact: true });
        await expect(control).toBeVisible();
        const box = await control.boundingBox();
        expect(box, `${name} has an actual visible hit target`).not.toBeNull();
        expect(box!.height, `${name} phone hit target`).toBeGreaterThanOrEqual(44);
    }
}
async function producerCapture(page: Page, info: TestInfo, surface: string, state: string, explicitAnchor?: Locator, anchorBlock: "center" | "start" = "center") {
    const scope = surface === "company" || surface === "terms" ? page.locator("body") : page.getByTestId(surface === "work-role" ? "work-roles-editor" : "articles-editor");
    const anchor = explicitAnchor ?? (state === "loading" ? scope.getByRole("button", { name: "Sparar…", exact: true })
        : state === "unknown" || state.endsWith("-pending") ? scope.getByTestId("operation-unconfirmed")
        : state === "stale" || state === "neighbor-stale" ? scope.getByTestId(surface === "company" ? "company-current-facts" : surface === "terms" ? "terms-current-facts" : "pricing-current-facts")
        : state === "error" ? scope.locator('[aria-invalid="true"]').first().locator("..")
        : state === "finished" ? scope.getByTestId(surface === "terms" ? "quote-terms-approved-status" : "settings-saved")
        : surface === "company" ? page.getByLabel("Företagsnamn") : surface === "terms" ? page.getByLabel("Offertvillkor") : scope);
    await expect(anchor).toBeVisible();
    await anchor.evaluate((el, block) => el.scrollIntoView({ block }), anchorBlock);
    await expect(anchor).toBeInViewport();
    if (state === "loading") await expect(anchor).toBeDisabled();
    const boot = JSON.parse(readFileSync(path.join(process.cwd(), "test-results/private/job-events-fetch-fault.json.startup.json"), "utf8"));
    expect(boot.runId).toBe(process.env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID);
    expect(boot.applicationUrl).toBe(new URL(page.url()).origin);
    expect(Number.isSafeInteger(boot.serverPid)).toBe(true);
    const viewport = page.viewportSize()!;
    const dir = path.join(process.cwd(), "playwright-report", "35-7-p", `${surface}-${viewport.width}x${viewport.height}`);
    await mkdir(dir, { recursive: true });
    const file = path.join(dir, `${state}.png`);
    const png = await page.screenshot({ path: file, fullPage: false });
    const candidate = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    await writeFile(path.join(dir, `${state}.json`), JSON.stringify({ candidateSha: candidate, buildSha: candidate, server: "next start", serverPid: boot.serverPid, runnerPid: boot.ownerPid, runId: boot.runId, serverStartedAt: boot.startedAt, controlledTransport: state === "unknown" || state === "loading" || state.endsWith("-pending") || state === "refresh-notice", captureAnchor: await anchor.evaluate(el => ({ tag: el.tagName, id: el.id, text: el.textContent?.trim().slice(0, 160) })), configuredCommand: "node node_modules/next/dist/bin/next build && node --require ./tests/support/job-events-fetch-fault.cjs node_modules/next/dist/bin/next start", configurationSha256: createHash("sha256").update(readFileSync("playwright.config.ts")).digest("hex"), synthetic: true, fixture: "test-owned createTwoTenantFixture; no external data", route: new URL(page.url()).pathname, surface, state, viewport, fullViewport: true, pngSha256: createHash("sha256").update(png).digest("hex"), test: info.title, project: info.project.name, result: "Actual configured production-server application capture after named state assertions", capturedAt: new Date().toISOString() }, null, 2));
}
async function holdNextProducerTransport(page: Page, routePath: string, transport: "action" | "refresh") {
    let release!: () => void, arrived!: () => void, settled!: () => void;
    const gate = new Promise<void>(r => { release = r; });
    const seen = new Promise<void>(r => { arrived = r; });
    const done = new Promise<void>(r => { settled = r; });
    let held = false;
    const matcher = (url: URL) => url.pathname === routePath;
    const handler = async (route: import("@playwright/test").Route) => {
        const request = route.request();
        const matches = transport === "action" ? request.method() === "POST" && Boolean(request.headers()["next-action"])
            : request.method() === "GET" && request.headers()["rsc"] === "1";
        if (held || !matches) { await route.fallback(); return; }
        held = true;
        arrived();
        try { await gate; await route.fallback(); } finally { settled(); }
    };
    await page.route(matcher, handler);
    return { seen, release, clear: async () => { release(); if (held) await done; await page.unroute(matcher, handler); } };
}
async function operationIdOf(request: BrowserRequest) {
    const body = request.postDataBuffer();
    if (!body)
        throw new Error("Missing server action body");
    const form = await new globalThis.Request("http://capture.invalid", { method: "POST", headers: { "content-type": request.headers()["content-type"] }, body: new Uint8Array(body) }).formData();
    let id: string | null = null;
    form.forEach((value, key) => { if (key.endsWith("operationId") && typeof value === "string")
        id = value; });
    if (!id)
        throw new Error("Missing captured operation identity before dispatch");
    return id;
}
async function loseCommittedReply(page: Page, routePath: string, afterCommit = true) {
    let release!: () => void, arrived!: () => void;
    const gate = new Promise<void>(r => { release = r; }), seen = new Promise<void>(r => { arrived = r; });
    const identities: string[] = [];
    let first = true;
    await page.route(`**${routePath}`, async (route) => {
        if (route.request().method() !== "POST" || !route.request().headers()["next-action"]) {
            await route.continue();
            return;
        }
        identities.push(await operationIdOf(route.request()));
        if (first) {
            first = false;
            if (afterCommit) {
                const response = await route.fetch();
                expect(response.ok()).toBe(true);
            }
            arrived();
            await gate;
            await route.abort("connectionfailed");
        }
        else
            await route.continue();
    });
    return { seen, release, identities, clear: () => page.unroute(`**${routePath}`) };
}
for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 640 }])
    test(`P-E1/E2/E3/E4 settings capture/recover/stale ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
        const own = await createTwoTenantFixture();
        await page.setViewportSize(viewport);
        try {
            await signIn(page, own.adminA.email, own.adminA.password);
            await page.goto("/settings/company");
            await waitForHydrated(page.getByLabel("Företagsnamn"));
            await producerCapture(page, info, "company", "empty");
            await page.getByLabel("Företagsnamn").fill("Synthetic producer company");
            await page.getByLabel("Momssats").fill("250");
            await page.getByRole("button", { name: "Spara", exact: true }).click();
            await expect(page.getByLabel("Momssats")).toHaveAttribute("aria-invalid", "true");
            const vatErrorId = await page.getByLabel("Momssats").getAttribute("aria-describedby");
            expect(vatErrorId).toBeTruthy();
            const vatError = page.locator(`[id="${vatErrorId}"]`);
            await expect(vatError).toBeVisible();
            await producerCapture(page, info, "company", "error", page.getByLabel("Momssats").locator(".."));
            await expect(vatError).toBeInViewport();
            await page.getByLabel("Momssats").fill("25");
            let sent = 0;
            page.on("request", request => { if (request.method() === "POST" && request.headers()["next-action"])
                sent++; });
            await page.context().setOffline(true);
            await page.getByRole("button", { name: "Spara", exact: true }).click();
            await expect(page.getByText("Du är offline. Ingen begäran skickades. Utkastet är inte sparat.")).toBeVisible();
            expect(sent).toBe(0);
            await page.context().setOffline(false);
            const loss = await loseCommittedReply(page, "/settings/company");
            await page.getByRole("button", { name: "Spara", exact: true }).dblclick();
            await loss.seen;
            expect(loss.identities).toHaveLength(1);
            try {
                await expect(page.getByRole("button", { name: "Sparar…", exact: true })).toBeDisabled();
                await expect(page.getByLabel("Företagsnamn")).toBeDisabled();
                await producerCapture(page, info, "company", "loading");
            } finally { loss.release(); }
            await expect(page.getByTestId("operation-unconfirmed")).toBeVisible();
            if (viewport.width === 360) await assertProducerTouchTargets(page, ["Kontrollera resultat", "Försök igen med samma uppgifter"]);
            await producerCapture(page, info, "company", "unknown");
            await expect(page.getByLabel("Företagsnamn")).toBeDisabled();
            await page.getByRole("link", { name: "← Inställningar" }).click();
            await expect(page).toHaveURL(/settings\/company$/);
            const reconcileHold = await holdNextProducerTransport(page, "/settings/company", "action");
            try {
                await page.getByRole("button", { name: "Kontrollera resultat" }).click();
                await reconcileHold.seen;
                await expect(page.getByRole("button", { name: "Kontrollera resultat" })).toBeDisabled();
                await expect(page.getByRole("button", { name: "Försök igen med samma uppgifter" })).toBeDisabled();
                await producerCapture(page, info, "company", "reconcile-pending");
            } finally { await reconcileHold.clear(); }
            await expect(page.getByTestId("settings-saved")).toBeVisible();
            expect(loss.identities.length).toBeGreaterThanOrEqual(2);
            expect(new Set(loss.identities).size).toBe(1);
            await loss.clear();
            await expect(page.getByTestId("settings-saved")).toContainText("Aktuella uppgifter är bekräftade.");
            await producerCapture(page, info, "company", "finished");
            await page.reload();
            await page.getByLabel("Företagsnamn").fill("Retry before original reached server");
            const absentLoss = await loseCommittedReply(page, "/settings/company", false);
            await page.getByRole("button", { name: "Spara", exact: true }).click();
            await absentLoss.seen;
            absentLoss.release();
            await expect(page.getByTestId("operation-unconfirmed")).toBeVisible();
            await page.getByRole("button", { name: "Kontrollera resultat" }).click();
            await expect(page.getByTestId("operation-unconfirmed")).toBeVisible();
            await page.getByRole("button", { name: "Försök igen med samma uppgifter" }).click();
            await expect(page.getByTestId("settings-saved")).toBeVisible();
            expect(new Set(absentLoss.identities).size).toBe(1);
            await absentLoss.clear();
            await page.reload();
            const other = await page.context().newPage();
            await other.goto("/settings/company");
            await waitForHydrated(other.getByLabel("Företagsnamn"));
            await other.getByLabel("Företagsnamn").fill("Newer current company");
            await other.getByRole("button", { name: "Spara", exact: true }).click();
            await expect(other.getByTestId("settings-saved")).toBeVisible();
            await page.getByLabel("Företagsnamn").fill("Retained stale draft");
            await page.getByRole("button", { name: "Spara", exact: true }).click();
            await expect(page.getByRole("button", { name: "Uppdatera och granska" })).toBeVisible();
            await expect(page.getByLabel("Företagsnamn")).toHaveValue("Retained stale draft");
            await expect(page.getByTestId("company-current-facts")).toContainText("Newer current company");
            await expect(page.getByRole("button", { name: "Spara", exact: true })).toBeDisabled();
            if (viewport.width === 360) await assertProducerTouchTargets(page, ["Uppdatera och granska", "Använd aktuella uppgifter"]);
            if (viewport.width === 360) {
                const refresh = page.getByRole("button", { name: "Uppdatera och granska", exact: true });
                const adopt = page.getByRole("button", { name: "Använd aktuella uppgifter", exact: true });
                await refresh.evaluate(element => element.scrollIntoView({ block: "start" }));
                await expect(refresh).toBeInViewport({ ratio: 1 });
                await expect(adopt).toBeInViewport({ ratio: 1 });
                await producerCapture(page, info, "company", "stale", refresh, "start");
                await expect(refresh).toBeInViewport({ ratio: 1 });
                await expect(adopt).toBeInViewport({ ratio: 1 });
            } else await producerCapture(page, info, "company", "stale");
            if (viewport.width === 360) {
                await producerCapture(page, info, "company", "stale-draft", page.getByLabel("Företagsnamn"));
                await expect(page.getByLabel("Företagsnamn")).toBeInViewport();
            }
            const refreshHold = await holdNextProducerTransport(page, "/settings/company", "refresh");
            try {
                await page.getByRole("button", { name: "Uppdatera och granska" }).click();
                await refreshHold.seen;
                const refreshNotice = page.getByText("Aktuella uppgifter hämtas. Granska dem innan ett nytt medvetet försök.", { exact: true });
                await expect(refreshNotice).toBeVisible();
                await expect(page.getByLabel("Företagsnamn")).toHaveValue("Retained stale draft");
                await producerCapture(page, info, "company", "refresh-notice", refreshNotice);
            } finally { await refreshHold.clear(); }
            await expect(page.getByLabel("Företagsnamn")).toHaveValue("Retained stale draft");
            await page.getByRole("button", { name: "Använd aktuella uppgifter" }).click();
            await expect(page.getByLabel("Företagsnamn")).toHaveValue("Newer current company");
            await expect(page.getByRole("button", { name: "Spara", exact: true })).toBeEnabled();
            await other.close();
            await page.goto("/settings/quote-terms");
            await waitForHydrated(page.getByLabel("Offertvillkor"));
            await producerCapture(page, info, "terms", "empty");
            await page.getByRole("button", { name: "Spara villkor" }).click();
            await expect(page.getByLabel("Offertvillkor")).toHaveAttribute("aria-invalid", "true");
            await producerCapture(page, info, "terms", "error");
            await page.getByLabel("Offertvillkor").fill(" \nExact reviewed synthetic wording\n ");
            const saveLoss = await loseCommittedReply(page, "/settings/quote-terms");
            await page.getByRole("button", { name: "Spara villkor" }).click();
            await saveLoss.seen;
            try {
                await expect(page.getByRole("button", { name: "Sparar…", exact: true })).toBeDisabled();
                await expect(page.getByLabel("Offertvillkor")).toBeDisabled();
                await producerCapture(page, info, "terms", "loading");
            } finally { saveLoss.release(); }
            await expect(page.getByTestId("operation-unconfirmed")).toBeVisible();
            if (viewport.width === 360) await assertProducerTouchTargets(page, ["Kontrollera resultat", "Försök igen med samma uppgifter"]);
            await producerCapture(page, info, "terms", "unknown");
            const retryHold = await holdNextProducerTransport(page, "/settings/quote-terms", "action");
            try {
                await page.getByRole("button", { name: "Försök igen med samma uppgifter" }).click();
                await retryHold.seen;
                await expect(page.getByRole("button", { name: "Kontrollera resultat" })).toBeDisabled();
                await expect(page.getByRole("button", { name: "Försök igen med samma uppgifter" })).toBeDisabled();
                if (viewport.width === 360) {
                    const busySubmit = page.getByRole("button", { name: "Sparar…", exact: true });
                    await expect(busySubmit).toBeDisabled();
                    await busySubmit.evaluate(element => element.scrollIntoView({ block: "center" }));
                    await expect(busySubmit).toBeInViewport({ ratio: 1 });
                    await producerCapture(page, info, "terms", "retry-pending", busySubmit);
                    await expect(busySubmit).toBeInViewport({ ratio: 1 });
                } else await producerCapture(page, info, "terms", "retry-pending");
            } finally { await retryHold.clear(); }
            await expect(page.getByTestId("settings-saved")).toBeVisible();
            expect(new Set(saveLoss.identities).size).toBe(1);
            await saveLoss.clear();
            await expect(page.getByRole("button", { name: "Markera som godkänd" })).toBeEnabled();
            await expect(page.getByTestId("quote-terms-signoff-warning")).toBeVisible();
            await expect(page.getByTestId("quote-terms-approved-status")).toHaveCount(0);
            await producerCapture(page, info, "terms", "saved-unapproved", page.getByLabel("Offertvillkor").locator(".."));
            await expect(page.getByRole("button", { name: "Markera som godkänd" })).toBeInViewport();
            await page.getByLabel("Offertvillkor").fill("Unsaved dirty wording");
            await expect(page.getByRole("button", { name: "Markera som godkänd" })).toBeDisabled();
            await producerCapture(page, info, "terms", "dirty-approval-disabled", page.getByLabel("Offertvillkor").locator(".."));
            await expect(page.getByRole("button", { name: "Markera som godkänd" })).toBeInViewport();
            await page.getByLabel("Offertvillkor").fill("Exact reviewed synthetic wording");
            const approveLoss = await loseCommittedReply(page, "/settings/quote-terms");
            await page.getByRole("button", { name: "Markera som godkänd" }).click();
            await approveLoss.seen;
            approveLoss.release();
            await expect(page.getByTestId("operation-unconfirmed")).toBeVisible();
            await page.getByRole("button", { name: "Kontrollera resultat" }).click();
            await expect(page.getByTestId("quote-terms-approved-status")).toBeVisible();
            expect(new Set(approveLoss.identities).size).toBe(1);
            await approveLoss.clear();
            await producerCapture(page, info, "terms", "finished");
            const newerTerms = await page.context().newPage();
            try {
                await newerTerms.goto("/settings/quote-terms");
                await waitForHydrated(newerTerms.getByLabel("Offertvillkor"));
                await newerTerms.getByLabel("Offertvillkor").fill("Newer current terms");
                await newerTerms.getByRole("button", { name: "Spara villkor" }).click();
                await expect(newerTerms.getByTestId("settings-saved")).toBeVisible();
                await page.getByLabel("Offertvillkor").fill("Retained stale terms draft");
                await page.getByRole("button", { name: "Spara villkor" }).click();
                await expect(page.getByRole("button", { name: "Uppdatera och granska" })).toBeVisible();
                await expect(page.getByTestId("terms-current-facts")).toContainText("Newer current terms");
                await expect(page.getByLabel("Offertvillkor")).toHaveValue("Retained stale terms draft");
                await expect(page.getByRole("button", { name: "Spara villkor" })).toBeDisabled();
                if (viewport.width === 360) await assertProducerTouchTargets(page, ["Uppdatera och granska", "Använd aktuella uppgifter"]);
                await producerCapture(page, info, "terms", "stale");
                if (viewport.width === 360) {
                    await producerCapture(page, info, "terms", "stale-draft", page.getByLabel("Offertvillkor"));
                    await expect(page.getByLabel("Offertvillkor")).toBeInViewport();
                }
                await page.getByRole("button", { name: "Använd aktuella uppgifter" }).click();
                await expect(page.getByLabel("Offertvillkor")).toHaveValue("Newer current terms");
                await expect(page.getByRole("button", { name: "Markera som godkänd" })).toBeEnabled();
            } finally { await newerTerms.close(); }
        }
        finally {
            await page.context().setOffline(false);
            await cleanupFixture(own);
        }
    });
