/**
 * Story 3.4 — ATDD RED-PHASE scaffold: Pricing UI E2E (/settings/pricing —
 * Prissättning: work roles + optional articles) against the REAL app + local Supabase
 * stack + the two-tenant fixture.
 *
 * 🔴 RED PHASE — the whole suite is `test.describe.skip(...)` so the green `e2e` CI job
 * is UNPERTURBED until dev ships `/settings/pricing` (force-dynamic server page), the
 * `src/components/pricing/**` editors (work-role + article forms with the kronor↔öre
 * money input), and the `src/features/pricing/actions.ts` `"use server"` actions
 * delegating to the commands. Un-skip in the GREEN phase.
 *
 * MIRRORS the Story 3.3 settings e2e pattern EXACTLY (signIn / waitForHydrated helpers,
 * the seeded two-tenant fixture, `getByLabel` + `aria-invalid`/`aria-describedby` field
 * association). The data-testids / Swedish labels asserted below are the UI CONTRACT dev
 * must implement to turn these GREEN.
 *
 * The LOAD-BEARING contracts these tests pin (the story encodes them):
 *   - Money input validation (P0, AC2/AC5): a NEGATIVE/FLOAT rate is rejected with a
 *     FIELD-ASSOCIATED error (aria-invalid + aria-describedby → error node) and the
 *     input is PRESERVED. The money input DISPLAYS kronor ("850,00") but STORES öre.
 *   - Round-trip (P0, AC5): a valid work role + a valid article SAVE and round-trip
 *     through the envelope command on reload.
 *   - No-supplier-scope in the UI (P0, AC3): NO supplier/sync/import control appears in
 *     the article editor.
 *   - Route auth + nav (P0, AC5): anon → /login; nav stays exactly aligned with active manifest
 *     modules — pricing adds NO new nav item (it lives under the existing Inställningar
 *     hub), so "Prissättning" is reachable from /settings but is NOT a top-nav link.
 */
import { test, expect, type Page, type Locator } from "@playwright/test";
import { readFileSync, readlinkSync, readdirSync } from "node:fs";
import path from "node:path";
import { expectActiveAdminNavigation } from "../support/active-admin-navigation";

interface PricingFixture {
  readonly adminA: { readonly email: string; readonly password: string };
}

const fixture: PricingFixture = JSON.parse(
  readFileSync(path.join(process.cwd(), "tests", "e2e", ".auth", "fixture.json"), "utf8"),
);

/** Poll for React hydration before interacting. */
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

test.describe("Pricing UI — Work roles + Articles (Story 3.4 E2E)", () => {
  test("AC5: an anonymous visit to /settings/pricing redirects to /login", async ({ page }) => {
    await page.goto("/settings/pricing");
    await expect(page).toHaveURL(/\/login(\?|$)/);
  });

  test("AC5: the Pricing screen renders (Prissättning) with work-role + article editors", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/pricing");
    await expect(page.getByRole("heading", { name: "Prissättning", level: 1 })).toBeVisible();
    // Both editors are present (the work-role list + the article list).
    await expect(page.getByTestId("work-roles-editor")).toBeVisible();
    await expect(page.getByTestId("articles-editor")).toBeVisible();
  });

  test("AC2/AC5: a NEGATIVE work-role rate is rejected with a FIELD-ASSOCIATED error and input is preserved", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/pricing");

    const name = page.getByLabel("Benämning");
    await waitForHydrated(name);
    await name.fill("Montör");
    const sell = page.getByLabel("Pris (kr/tim)");
    await sell.fill("-50"); // a negative price — must be rejected
    await page.getByRole("button", { name: "Spara roll" }).click();

    // Field-associated error: the price input is aria-invalid + describedby its error node.
    await expect(sell).toHaveAttribute("aria-invalid", "true");
    const describedBy = await sell.getAttribute("aria-describedby");
    expect(describedBy).toBeTruthy();
    await expect(page.locator(`#${describedBy}`)).toBeVisible();
    // The blocking summary is present and the previously-entered input is PRESERVED.
    // Scope to the work-roles editor — the page has two editors, each with its own
    // form-error-summary region (the article editor's stays empty on a work-role submit).
    await expect(
      page.getByTestId("work-roles-editor").getByTestId("form-error-summary"),
    ).toContainText(/.+/);
    await expect(name).toHaveValue("Montör");
    await expect(sell).toHaveValue("-50");
  });

  test("AC2/AC5: a FLOAT-with-too-many-decimals rate is rejected (öre precision, field-associated)", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/pricing");
    const name = page.getByLabel("Benämning");
    await waitForHydrated(name);
    await name.fill("Elektriker");
    await page.getByLabel("Pris (kr/tim)").fill("850,005"); // sub-öre precision
    await page.getByRole("button", { name: "Spara roll" }).click();
    await expect(page.getByLabel("Pris (kr/tim)")).toHaveAttribute("aria-invalid", "true");
  });

  test("AC5: a valid work role SAVES and round-trips (kronor display, öre stored)", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/pricing");
    const name = page.getByLabel("Benämning");
    await waitForHydrated(name);
    const roleName = `Montör ${Date.now().toString(36)}`;
    await name.fill(roleName);
    await page.getByLabel("Pris (kr/tim)").fill("850,00"); // Swedish comma → 85000 öre
    const editor = page.getByTestId("work-roles-editor");
    await page.getByRole("button", { name: "Spara roll" }).click();
    await expect(editor.getByTestId("settings-saved")).toBeVisible();

    // Reload reads the persisted value via the RLS client (force-dynamic). The saved role
    // row shows the kronor display "850,00 kr/tim" — match the role row inside the editor
    // (page-level "850,00" is ambiguous with the input-hint text).
    await page.reload();
    await expect(editor.getByText(roleName)).toBeVisible();
    await expect(editor.getByText("850,00 kr/tim")).toBeVisible(); // displayed as kronor
  });

  test("AC3/AC5: a valid article SAVES and round-trips; NO supplier control appears in the article editor", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/pricing");
    const editor = page.getByTestId("articles-editor");
    const articleName = page.getByLabel("Artikelnamn");
    await waitForHydrated(articleName);
    const name = `Kabel ${Date.now().toString(36)}`;
    await articleName.fill(name);
    await page.getByLabel("Enhetspris (kr)").fill("12,50");
    await page.getByRole("button", { name: "Spara artikel" }).click();
    await expect(editor.getByTestId("settings-saved")).toBeVisible();

    // HARD no-supplier-scope: NO supplier/sync/import control is rendered in the editor.
    await expect(editor.getByLabel(/leverantör|supplier/i)).toHaveCount(0);
    await expect(editor.getByLabel(/synk|sync|import|fortnox/i)).toHaveCount(0);

    await page.reload();
    await expect(page.getByText(name)).toBeVisible();
  });

  test("AC2/AC5: a work role can be ARCHIVED then REACTIVATED (archive is a reversible door, not one-way)", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/pricing");
    const editor = page.getByTestId("work-roles-editor");
    const activeList = editor.getByRole("list").first();
    const name = page.getByLabel("Benämning");
    await waitForHydrated(name);

    // Create a fresh role so this test owns a row it can archive/reactivate deterministically.
    const roleName = `Reaktivera ${Date.now().toString(36)}`;
    await name.fill(roleName);
    await page.getByLabel("Pris (kr/tim)").fill("500,00");
    await page.getByRole("button", { name: "Spara roll" }).click();
    await expect(editor.getByTestId("settings-saved")).toBeVisible();
    // The saved role appears in the active list (revalidatePath re-renders the server page).
    const activeRow = activeList.locator("li", { hasText: roleName });
    await expect(activeRow).toHaveCount(1);

    // ARCHIVE it — the row leaves the active list once the server action + revalidate settle.
    await activeRow.getByRole("button", { name: "Arkivera" }).click();
    await expect(activeList.getByText(roleName)).toHaveCount(0);

    // The archived row is reachable behind the "Visa arkiverade" toggle.
    await editor.getByRole("button", { name: /Visa arkiverade/ }).click();
    const archived = editor.getByTestId("work-roles-archived");
    const archivedRow = archived.locator("li", { hasText: roleName });
    await expect(archivedRow).toHaveCount(1);

    // REACTIVATE it — the SAME row returns to the active list (un-archived, not re-created).
    await archivedRow.getByRole("button", { name: "Återaktivera" }).click();
    await expect(activeList.getByText(roleName)).toBeVisible();
  });

  test("AC5: the nav stays EXACTLY aligned with active manifest modules — pricing adds NO new top-nav item", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings/pricing");
    const nav = page.getByRole("navigation", { name: "Huvudnavigation" }).first();
    await expectActiveAdminNavigation(nav);
    // Prissättning lives UNDER Inställningar — it is NOT a top-nav link.
    await expect(nav.getByRole("link", { name: "Prissättning" })).toHaveCount(0);
  });

  test("AC5: the Inställningar hub links to /settings/pricing (Prissättning) — the 3.3 hub omitted it", async ({ page }) => {
    await signIn(page, fixture.adminA.email, fixture.adminA.password);
    await page.goto("/settings");
    await expect(page.getByRole("link", { name: "Prissättning" })).toBeVisible();
  });
});

import { mkdir, writeFile, open, stat, realpath } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import type { TestInfo, Request as BrowserRequest } from "@playwright/test";
import { createTwoTenantFixture, cleanupFixture, makeAuthedServerClient } from "../../factories/tenants";
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
    let held = false, heldRequest: BrowserRequest | undefined;
    const matcher = (url: URL) => url.pathname === routePath;
    const handler = async (route: import("@playwright/test").Route) => {
        const request = route.request();
        const matches = transport === "action" ? request.method() === "POST" && Boolean(request.headers()["next-action"])
            : request.method() === "GET" && request.headers()["rsc"] === "1";
        if (held || !matches) { await route.fallback(); return; }
        held = true;
        heldRequest = request; // Retain the exact intercepted transport, including failure exits.
        arrived();
        try { await gate; await route.fallback(); } finally { settled(); }
    };
    await page.route(matcher, handler);
    return { seen, release, request: () => heldRequest, clear: async () => { release(); if (held) await done; await page.unroute(matcher, handler); } };
}
async function operationIdOf(request: BrowserRequest): Promise<string> {
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
    test(`P-E1/E2/E3 pricing all eight operation forms ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
        const own = await createTwoTenantFixture();
        await page.setViewportSize(viewport);
        try {
            await signIn(page, own.adminA.email, own.adminA.password);
            await page.goto("/settings/pricing");
            await waitForHydrated(page.getByLabel("Benämning"));
            for (const spec of [{ id: "work-roles-editor", surface: "work-role", name: "Benämning", price: "Pris (kr/tim)", save: "Spara roll", archived: "work-roles-archived" }, { id: "articles-editor", surface: "article", name: "Artikelnamn", price: "Enhetspris (kr)", save: "Spara artikel", archived: "articles-archived" }]) {
                const editor = page.getByTestId(spec.id);
                await producerCapture(page, info, spec.surface, "empty");
                await editor.getByLabel(spec.name).fill(`Synthetic ${spec.surface}`);
                await editor.getByLabel(spec.price).fill("-1");
                await editor.getByRole("button", { name: spec.save }).click();
                await expect(editor.getByLabel(spec.price)).toHaveAttribute("aria-invalid", "true");
                await producerCapture(page, info, spec.surface, "error");
                await editor.getByLabel(spec.price).fill("12,50");
                const createLoss = await loseCommittedReply(page, "/settings/pricing");
                await editor.getByRole("button", { name: spec.save }).dblclick();
                await createLoss.seen;
                expect(createLoss.identities).toHaveLength(1);
                try {
                    await expect(editor.getByRole("button", { name: "Sparar…", exact: true })).toBeDisabled();
                    await expect(editor.getByLabel(spec.name)).toBeDisabled();
                    await producerCapture(page, info, spec.surface, "loading");
                } finally { createLoss.release(); }
                await expect(editor.getByTestId("operation-unconfirmed")).toBeVisible();
                await expect(editor.getByRole("button", { name: "Ny post" })).toBeDisabled();
                if (viewport.width === 360) await assertProducerTouchTargets(editor, ["Kontrollera resultat", "Försök igen med samma uppgifter"]);
                await producerCapture(page, info, spec.surface, "unknown");
                const reconcileHold = await holdNextProducerTransport(page, "/settings/pricing", "action");
                try {
                    await editor.getByRole("button", { name: "Kontrollera resultat" }).click();
                    await reconcileHold.seen;
                    await expect(editor.getByRole("button", { name: "Kontrollera resultat" })).toBeDisabled();
                    await expect(editor.getByRole("button", { name: "Försök igen med samma uppgifter" })).toBeDisabled();
                    await producerCapture(page, info, spec.surface, "reconcile-pending");
                } finally { await reconcileHold.clear(); }
                await expect(editor.getByTestId("settings-saved")).toBeVisible();
                expect(new Set(createLoss.identities).size).toBe(1);
                await createLoss.clear();
                const activeRow = editor.locator("li").filter({ hasText: `Synthetic ${spec.surface}` }).filter({ has: page.getByRole("button", { name: "Redigera", exact: true }) });
                let row = activeRow;
                await expect(row).toHaveCount(1);
                await row.getByRole("button", { name: "Redigera" }).click();
                await editor.getByLabel(spec.price).fill("25,00");
                const editLoss = await loseCommittedReply(page, "/settings/pricing", false);
                await editor.getByRole("button", { name: spec.save }).click();
                await editLoss.seen;
                editLoss.release();
                await expect(editor.getByTestId("operation-unconfirmed")).toBeVisible();
                await editor.getByRole("button", { name: "Försök igen med samma uppgifter" }).click();
                await expect(editor.getByTestId("settings-saved")).toBeVisible();
                expect(new Set(editLoss.identities).size).toBe(1);
                await editLoss.clear();
                await expect(row).toContainText("25,00");
                const archiveLoss = await loseCommittedReply(page, "/settings/pricing");
                await row.getByRole("button", { name: "Arkivera" }).click();
                await archiveLoss.seen;
                archiveLoss.release();
                await expect(editor.getByTestId("operation-unconfirmed")).toBeVisible();
                await editor.getByRole("button", { name: "Kontrollera resultat" }).click();
                await expect(editor.getByTestId("operation-unconfirmed")).toHaveCount(0);
                expect(new Set(archiveLoss.identities).size).toBe(1);
                await archiveLoss.clear();
                await editor.getByRole("button", { name: /Visa arkiverade/ }).click();
                row = editor.getByTestId(spec.archived).getByRole("listitem").filter({ hasText: `Synthetic ${spec.surface}` });
                await expect(row).toHaveCount(1);
                await expect(activeRow).toHaveCount(0);
                await expect(row.getByRole("button", { name: "Återaktivera" })).toBeEnabled();
                await producerCapture(page, info, spec.surface, "archived-restore", row);
                await expect(row.getByRole("button", { name: "Återaktivera" })).toBeInViewport();
                const restoreLoss = await loseCommittedReply(page, "/settings/pricing");
                await row.getByRole("button", { name: "Återaktivera" }).click();
                await restoreLoss.seen;
                restoreLoss.release();
                await expect(editor.getByTestId("operation-unconfirmed")).toBeVisible();
                await editor.getByRole("button", { name: "Kontrollera resultat" }).click();
                await expect(editor.getByTestId("operation-unconfirmed")).toHaveCount(0);
                expect(new Set(restoreLoss.identities).size).toBe(1);
                await restoreLoss.clear();
                await expect(editor.getByRole("list").first()).toContainText(`Synthetic ${spec.surface}`);
                await expect(activeRow).toHaveCount(1);
                await expect(activeRow).toContainText("25,00");
                await expect(activeRow.getByRole("button", { name: "Arkivera" })).toBeEnabled();
                await expect(row).toHaveCount(0);
                await expect(editor.getByTestId("settings-saved")).toContainText("Aktuella uppgifter är bekräftade.");
                await producerCapture(page, info, spec.surface, "finished", activeRow);
                await expect(activeRow.getByRole("button", { name: "Arkivera" })).toBeInViewport();
                await expect(editor.getByTestId("settings-saved")).toBeInViewport();
            }
        }
        finally {
            await cleanupFixture(own);
        }
    });

for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 640 }])
test(`R1-1 pricing drafts retain their revision across stale rejection and neighboring editor success ${viewport.width}x${viewport.height}`, async ({ page }, info) => {
    test.setTimeout(120_000);
    const own = await createTwoTenantFixture();
    let other: Page | undefined;
    const specs = [
        { id: "work-roles-editor", surface: "work-role", name: "Benämning", price: "Pris (kr/tim)", save: "Spara roll", label: "Pinned role" },
        { id: "articles-editor", surface: "article", name: "Artikelnamn", price: "Enhetspris (kr)", save: "Spara artikel", label: "Pinned article" },
    ];
    try {
        await page.setViewportSize(viewport);
        await signIn(page, own.adminA.email, own.adminA.password);
        await page.goto("/settings/pricing");
        await waitForHydrated(page.getByLabel("Benämning"));
        for (const spec of specs) {
            const editor = page.getByTestId(spec.id);
            await editor.getByLabel(spec.name).fill(spec.label);
            await editor.getByLabel(spec.price).fill("10,00");
            await editor.getByRole("button", { name: spec.save }).click();
            await expect(editor.getByRole("listitem").filter({ hasText: spec.label })).toHaveCount(1);
        }
        other = await page.context().newPage();
        await other.goto("/settings/pricing");
        await waitForHydrated(other.getByLabel("Benämning"));
        for (const [index, spec] of specs.entries()) {
            const editor = page.getByTestId(spec.id), remote = other.getByTestId(spec.id);
            const row = editor.getByRole("listitem").filter({ hasText: spec.label });
            const remoteRow = remote.getByRole("listitem").filter({ hasText: spec.label });
            await row.getByRole("button", { name: "Redigera" }).click();
            await editor.getByLabel(spec.price).fill("11,00");
            await remoteRow.getByRole("button", { name: "Redigera" }).click();
            await remote.getByLabel(spec.price).fill("20,00");
            await remote.getByRole("button", { name: spec.save }).click();
            await expect(remoteRow).toContainText("20,00");
            await editor.getByRole("button", { name: spec.save }).click();
            await expect(editor.getByRole("button", { name: "Uppdatera och granska" })).toBeVisible();
            await expect(editor.getByTestId("pricing-current-facts")).toContainText("20,00");
            await expect(editor.getByLabel(spec.price)).toHaveValue("11,00");
            await expect(editor.getByRole("button", { name: spec.save })).toBeDisabled();
            if (viewport.width === 360) await assertProducerTouchTargets(editor, ["Uppdatera och granska", "Använd aktuella uppgifter"]);
            const staleAnchor = viewport.width === 360 && spec.surface === "work-role" ? editor.getByRole("button", { name: "Uppdatera och granska", exact: true }) : editor.getByTestId("pricing-current-facts");
            const staleBlock = viewport.width === 1440 && spec.surface === "article" || viewport.width === 360 && spec.surface === "work-role" ? "start" : "center";
            if (viewport.width === 1440 || spec.surface === "work-role") {
                await staleAnchor.evaluate((element, block: "center" | "start") => element.scrollIntoView({ block }), staleBlock);
                await expect(editor.getByLabel(spec.price)).toBeInViewport({ ratio: 1 });
            }
            await producerCapture(page, info, spec.surface, "stale", staleAnchor, staleBlock);
            if (viewport.width === 1440 || spec.surface === "work-role") await expect(editor.getByLabel(spec.price)).toBeInViewport({ ratio: 1 });
            if (viewport.width === 360 && spec.surface === "work-role") {
                await expect(editor.getByTestId("pricing-current-facts").getByText(/20,00/)).toBeInViewport({ ratio: 1 });
                await expect(editor.getByRole("button", { name: "Använd aktuella uppgifter", exact: true })).toBeInViewport({ ratio: 1 });
                await expect(editor.getByRole("button", { name: "Uppdatera och granska", exact: true })).toBeInViewport({ ratio: 1 });
            }
            if (viewport.width === 360 && spec.surface === "article") {
                await producerCapture(page, info, spec.surface, "stale-draft", editor.getByLabel(spec.price));
                await expect(editor.getByLabel(spec.price)).toBeInViewport();
            }
            await editor.getByRole("button", { name: "Använd aktuella uppgifter" }).click();
            await expect(editor.getByLabel(spec.price)).toHaveValue("20,00");
            await editor.getByLabel(spec.price).fill("21,00");
            await remoteRow.getByRole("button", { name: "Redigera" }).click();
            await remote.getByLabel(spec.price).fill("30,00");
            await remote.getByRole("button", { name: spec.save }).click();
            await expect(remoteRow).toContainText("30,00");
            const neighborSpec = specs[1-index], neighbor = page.getByTestId(neighborSpec.id);
            await neighbor.getByRole("button", { name: "Ny post" }).click();
            await neighbor.getByLabel(neighborSpec.name).fill(`Neighbor refresh ${index}`);
            await neighbor.getByLabel(neighborSpec.price).fill("99,00");
            await neighbor.getByRole("button", { name: neighborSpec.save }).click();
            await expect(neighbor.getByRole("listitem").filter({ hasText: `Neighbor refresh ${index}` })).toHaveCount(1);
            await expect(editor.getByTestId("pricing-current-facts")).toContainText("30,00");
            await expect(editor.getByLabel(spec.price)).toHaveValue("21,00");
            await expect(editor.getByRole("button", { name: spec.save })).toBeDisabled();
            if (viewport.width === 360) await assertProducerTouchTargets(editor, ["Använd aktuella uppgifter"]);
            const neighbor_staleAnchor = viewport.width === 360 && spec.surface === "work-role" ? editor.getByTestId("pricing-current-facts") : editor.getByTestId("pricing-current-facts");
            const neighbor_staleBlock = viewport.width === 1440 && spec.surface === "article" || viewport.width === 360 && spec.surface === "work-role" ? "start" : "center";
            if (viewport.width === 1440 || spec.surface === "work-role") {
                await neighbor_staleAnchor.evaluate((element, block: "center" | "start") => element.scrollIntoView({ block }), neighbor_staleBlock);
                await expect(editor.getByLabel(spec.price)).toBeInViewport({ ratio: 1 });
            }
            await producerCapture(page, info, spec.surface, "neighbor-stale", neighbor_staleAnchor, neighbor_staleBlock);
            if (viewport.width === 1440 || spec.surface === "work-role") await expect(editor.getByLabel(spec.price)).toBeInViewport({ ratio: 1 });
            if (viewport.width === 360 && spec.surface === "work-role") {
                await expect(editor.getByTestId("pricing-current-facts").getByText(/30,00/)).toBeInViewport({ ratio: 1 });
                await expect(editor.getByRole("button", { name: "Använd aktuella uppgifter", exact: true })).toBeInViewport({ ratio: 1 });
            }
            if (viewport.width === 360 && spec.surface === "article") {
                await producerCapture(page, info, spec.surface, "neighbor-stale-draft", editor.getByLabel(spec.price));
                await expect(editor.getByLabel(spec.price)).toBeInViewport();
            }
            await editor.getByRole("button", { name: "Använd aktuella uppgifter" }).click();
            await expect(editor.getByLabel(spec.price)).toHaveValue("30,00");
            await editor.getByLabel(spec.price).fill("31,00");
            const receiptRequest = page.waitForRequest(request => new URL(request.url()).pathname === "/settings/pricing" && request.method() === "POST" && Boolean(request.headers()["next-action"]));
            await editor.getByRole("button", { name: spec.save }).click();
            const historicalOperationId = await operationIdOf(await receiptRequest);
            await expect(row).toContainText("31,00");
            await expect(editor.getByTestId("settings-saved")).toContainText("Aktuella uppgifter är bekräftade.");
            const historicalReceipt = await editor.getByTestId("settings-saved").elementHandle();
            expect(historicalReceipt).not.toBeNull();
            // A normal checked UI edit changes the SAME target after this receipt.
            // Only the secondary page reloads; the receipt-bearing page stays mounted.
            await other.goto("/settings/pricing");
            await waitForHydrated(other.getByLabel("Benämning"));
            await expect(remoteRow).toContainText("31,00");
            await remoteRow.getByRole("button", { name: "Redigera" }).click();
            await remote.getByLabel(spec.price).fill("41,00");
            await remote.getByRole("button", { name: spec.save }).click();
            await expect(remoteRow).toContainText("41,00");
            await expect(remote.getByTestId("settings-saved")).toContainText("Aktuella uppgifter är bekräftade.");
            const laterActionRequests: BrowserRequest[] = [];
            const observeLaterAction = (request: BrowserRequest) => {
                if (new URL(request.url()).pathname === "/settings/pricing" && request.method() === "POST" && request.headers()["next-action"]) laterActionRequests.push(request);
            };
            page.on("request", observeLaterAction);
            try {
                // Neighbor success performs the existing authorized reread without
                // resetting/replaying the historical target's controller or receipt.
                await neighbor.getByRole("button", { name: "Ny post" }).click();
                await neighbor.getByLabel(neighborSpec.name).fill(`Current newer refresh ${index}`);
                await neighbor.getByLabel(neighborSpec.price).fill("99,00");
                await neighbor.getByRole("button", { name: neighborSpec.save }).click();
                await expect(neighbor.getByRole("listitem").filter({ hasText: `Current newer refresh ${index}` })).toHaveCount(1);
                await expect(row).toContainText("41,00");
                await expect(editor.getByTestId("pricing-current-facts")).toContainText("41,00");
                await expect(editor.getByLabel(spec.price)).toHaveValue("31,00");
                await expect(editor.getByRole("button", { name: spec.save })).toBeDisabled();
                await expect(editor.getByTestId("settings-saved")).toContainText("Det tidigare försöket slutfördes.");
                await expect(editor.getByTestId("settings-saved")).toContainText("Nyare ändringar finns. Granska aktuella uppgifter.");
                await expect(editor.getByTestId("settings-saved")).not.toContainText("Aktuella uppgifter är bekräftade.");
                expect(await historicalReceipt!.evaluate(element => element.isConnected)).toBe(true);
                expect(await historicalReceipt!.textContent()).toContain("Nyare ändringar finns. Granska aktuella uppgifter.");
                expect(laterActionRequests).toHaveLength(1);
                expect(await operationIdOf(laterActionRequests[0])).not.toBe(historicalOperationId);
                await producerCapture(page, info, spec.surface, "current-newer", editor.getByTestId("pricing-current-facts"), "start");
                await expect(editor.getByTestId("pricing-current-facts")).toBeInViewport();
                await expect(editor.getByTestId("pricing-current-facts").getByText(/41,00/)).toBeVisible();
                await expect(editor.getByTestId("pricing-current-facts").getByText(/41,00/)).toBeInViewport({ ratio: 1 });
                await expect(editor.getByTestId("settings-saved")).toBeInViewport({ ratio: 1 });
                if (viewport.width === 360) {
                    // Preserve the primary receipt/current41 overview, then show
                    // the retained actual31 input in a separate uncropped viewport.
                    const phonePriceSupplement = editor.getByLabel(spec.price);
                    await expect(phonePriceSupplement).toHaveValue("31,00");
                    await expect(phonePriceSupplement).toBeVisible();
                    await producerCapture(page, info, spec.surface, "current-newer-draft", phonePriceSupplement);
                    await expect(phonePriceSupplement).toBeInViewport({ ratio: 1 });
                    await expect(phonePriceSupplement).toHaveValue("31,00");
                }
            } finally { page.off("request", observeLaterAction); }

        }
    } finally {
        await other?.close();
        await cleanupFixture(own);
    }
});


// Human-authorized CI-only effects. No local invocation is admitted, and this
// append-only job claim deliberately refuses ALL worker/test retries after entry.
async function qualifyProducerBoundedEffects(info: TestInfo) {
    const runtime = await import("../../../scripts/ci/with-calendar-feed-runtime.mjs");
    runtime.validateAdmission("browser", process.env, process.platform);
    expect(info.config.workers).toBe(1);
    expect(info.config.fullyParallel).toBe(false);
    expect(info.parallelIndex).toBe(0);
    expect(info.project.name).toBe("chromium");
    expect(info.config.projects).toHaveLength(1);
    expect(await realpath(process.cwd())).toBe(await realpath(process.env.GITHUB_WORKSPACE!));
    const checkout = await stat(path.join(process.cwd(), ".git"));
    expect(checkout.isDirectory()).toBe(true);
    const containers = JSON.parse(execFileSync("docker", ["inspect", "supabase_db_kopplas", "supabase_kong_kopplas"], { encoding: "utf8", timeout: 15_000, maxBuffer: 2_000_000 }));
    const status = JSON.parse(execFileSync("supabase", ["status", "--output", "json"], { encoding: "utf8", timeout: 15_000, maxBuffer: 2_000_000 }));
    const stack = { db: containers[0], gateway: containers[1], checkoutTime: checkout.birthtimeMs, now: Date.now(), status };
    runtime.validateStackIdentity(stack); // Existing fresh GitHub stack authority.
    const boot = JSON.parse(readFileSync("test-results/private/job-events-fetch-fault.json.startup.json", "utf8"));
    expect(boot.runId).toMatch(/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i);
    expect(boot.runId).toBe(process.env.E2E_JOB_EVENTS_FETCH_FAULT_RUN_ID);
    expect(Number.isSafeInteger(boot.ownerPid) && boot.ownerPid > 0).toBe(true);
    expect(Number.isSafeInteger(boot.serverPid) && boot.serverPid > 0 && boot.serverPid !== boot.ownerPid).toBe(true);
    expect(boot.origin).toBe(status.API_URL);
    expect(boot.applicationUrl).toBe("http://127.0.0.1:3100");
    expect(boot.startedAt).toBeGreaterThanOrEqual(checkout.birthtimeMs);
    expect(boot.startedAt).toBeLessThanOrEqual(Date.now());
    const servers = Array.isArray(info.config.webServer) ? info.config.webServer : [info.config.webServer];
    expect(servers).toHaveLength(1);
    expect(servers[0]?.reuseExistingServer).toBe(false);
    // Worker config re-evaluates process.pid; only the actual server's
    // initial launch environment can corroborate the nonce-bound runner PID.
    // Select fixed non-secret binding fields in memory; never dump environ.
    const startupBinding = readFileSync(`/proc/${boot.serverPid}/environ`, "utf8").split("\0")
        .filter(entry => entry.startsWith("E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID=") || entry.startsWith("E2E_JOB_EVENTS_FETCH_FAULT_STARTUP="));
    expect(startupBinding.sort()).toEqual([`E2E_JOB_EVENTS_FETCH_FAULT_OWNER_PID=${boot.ownerPid}`, "E2E_JOB_EVENTS_FETCH_FAULT_STARTUP=true"].sort());
    const ancestors = new Set<number>();
    let pid = process.pid, wrapperPid: number | undefined;
    for (let depth = 0; pid > 1 && depth < 32; depth++) {
        ancestors.add(pid);
        const args = readFileSync(`/proc/${pid}/cmdline`, "utf8").split("\0").filter(Boolean);
        const cwd = readlinkSync(`/proc/${pid}/cwd`);
        if (args.some(arg => path.resolve(cwd, arg) === path.resolve("scripts/ci/with-calendar-feed-runtime.mjs")) && args.at(-1) === "browser") wrapperPid = pid;
        pid = Number(/^PPid:\s+(\d+)$/m.exec(readFileSync(`/proc/${pid}/status`, "utf8"))?.[1] ?? 0);
    }
    expect(ancestors.has(boot.ownerPid)).toBe(true);
    expect(wrapperPid).toBeDefined();
    const serverArgs = readFileSync(`/proc/${boot.serverPid}/cmdline`, "utf8").split("\0");
    expect(await realpath(`/proc/${boot.serverPid}/cwd`)).toBe(await realpath(process.cwd()));
    // The installed Next start-server sets its process title to next-server.
    expect(serverArgs.includes("start") && serverArgs.some(arg => arg.endsWith("node_modules/next/dist/bin/next")) || /^next-server \(v[0-9.]+\)/.test(serverArgs[0])).toBe(true);
    const sockets = readdirSync(`/proc/${boot.serverPid}/fd`).flatMap(fd => { try { return [readlinkSync(`/proc/${boot.serverPid}/fd/${fd}`)]; } catch { return []; } });
    const tcp = readFileSync("/proc/net/tcp", "utf8");
    const socketIds = new Set(sockets.map(link => /^socket:\[(\d+)\]$/.exec(link)?.[1]).filter(Boolean));
    // The unchanged browser command can bind IPv4/IPv6 wildcard. Require an
    // actual listening socket owned by the nonce-bound PID, not a port probe.
    const wildcardOwned = [tcp, readFileSync("/proc/net/tcp6", "utf8")].some(table => table.split("\n").slice(1).some(line => {
        const fields = line.trim().split(/\s+/), address = fields[1]?.split(":");
        return address?.[1] === "0C1C" && ["00000000", "0100007F", "00000000000000000000000000000000", "00000000000000000000000001000000"].includes(address[0]) && fields[3] === "0A" && socketIds.has(fields[9]);
    }));
    expect(runtime.ownsListenerRecord(3100, sockets, tcp) || wildcardOwned).toBe(true);
    // A fresh isolated job plus the single configured worker is not permission
    // to affect another runner: inspect actual host CLI consumers as well.
    const consumers: number[] = [];
    for (const entry of readdirSync("/proc").filter(value => /^\d+$/.test(value))) {
        let args: string[];
        try { args = readFileSync(`/proc/${entry}/cmdline`, "utf8").split("\0"); } catch { continue; }
        if (args.some(arg => /\/node_modules\/(?:@playwright\/test|playwright)\/cli\.js$/.test(arg)) && args.includes("test")) consumers.push(Number(entry));
    }
    expect(consumers).toEqual([boot.ownerPid]);
    const head = execFileSync("git", ["rev-parse", "HEAD"], { encoding: "utf8" }).trim();
    const event = JSON.parse(readFileSync(process.env.GITHUB_EVENT_PATH!, "utf8"));
    expect(head).toBe(event.pull_request?.head?.sha ?? process.env.GITHUB_SHA);
    // Outside outputDir/reportDir: a restarted Playwright runner clears those.
    // This fixed ignored job journal survives workers, retries AND runner restarts.
    const directory = path.resolve("tmp/private/35-7-p-ci-effects");
    expect(path.relative(info.project.outputDir, directory).startsWith("..")).toBe(true);
    await mkdir(directory, { recursive: true });
    expect(await realpath(directory)).toBe(directory);
    // Fixed per job, NOT per retry, viewport, worker, server nonce or test attempt.
    const file = path.join(directory, `35-7-p-effects-${process.env.GITHUB_RUN_ID}-${process.env.GITHUB_RUN_ATTEMPT}-${process.env.GITHUB_JOB}.jsonl`);
    const journal = await open(file, "wx", 0o600); // Existing = consumed/uncertain; fail before reading any new baseline.
    const record = async (fact: Readonly<Record<string, unknown>>) => {
        const line = JSON.stringify(fact) + "\n";
        await journal.writeFile(line); await journal.sync(); // Authority is the durable job claim, never the report copy.
        const report = path.resolve("playwright-report/35-7-p");
        await mkdir(report, { recursive: true });
        await writeFile(path.join(report, "bounded-method-journal.jsonl"), line, { flag: "a", mode: 0o600 });
    };
    try {
        await record({ state: "claimed-no-effects", run: process.env.GITHUB_RUN_ID, attempt: process.env.GITHUB_RUN_ATTEMPT, job: process.env.GITHUB_JOB, head, nonce: boot.runId, runner: boot.ownerPid, server: boot.serverPid, wrapper: wrapperPid, db: stack.db.Id, gateway: stack.gateway.Id });
        const directoryHandle = await open(directory, "r");
        try { await directoryHandle.sync(); } finally { await directoryHandle.close(); }
    } catch (error) { await journal.close(); throw error; }
    return { runtime, stack, record, close: () => journal.close() };
}

type ProducerAclTuple = { grantor: string; grantee: string; privilege: string; grantable: boolean };
type ProducerAcl = { owner: string; tableAcl: ProducerAclTuple[]; columns: unknown[]; authSuper: boolean; authBypass: boolean; alternativeTable: boolean; alternativeColumn: boolean; dependent: boolean; hasSelect: boolean; hasColumnSelect: boolean };
async function producerAclSnapshot(db: import("pg").Client, table: string): Promise<ProducerAcl> {
    const result = await db.query(`select jsonb_build_object(
      'owner',pg_get_userbyid(c.relowner),'oid',c.oid,'kind',c.relkind,'aclNull',c.relacl is null,
      'rls',c.relrowsecurity,'forceRls',c.relforcerowsecurity,
      'authSuper',u.rolsuper,'authBypass',u.rolbypassrls,
      'roles',(select jsonb_agg(jsonb_build_array(r.oid,r.rolname,r.rolsuper,r.rolinherit,r.rolbypassrls) order by r.oid) from pg_roles r),
      'memberships',(select coalesce(jsonb_agg(to_jsonb(m) order by m.roleid,m.member,m.grantor),'[]'::jsonb) from pg_auth_members m),
      'tableAcl',(select jsonb_agg(jsonb_build_object('grantor',pg_get_userbyid(e.grantor),'grantee',case when e.grantee=0 then 'PUBLIC' else pg_get_userbyid(e.grantee) end,'privilege',e.privilege_type,'grantable',e.is_grantable) order by e.grantor,e.grantee,e.privilege_type,e.is_grantable) from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) e),
      'columns',(select jsonb_agg(jsonb_build_object('number',a.attnum,'name',a.attname,'dropped',a.attisdropped,'aclNull',a.attacl is null,'acl',(select coalesce(jsonb_agg(to_jsonb(e) order by e.grantor,e.grantee,e.privilege_type,e.is_grantable),'[]'::jsonb) from aclexplode(coalesce(a.attacl,'{}'::aclitem[])) e)) order by a.attnum) from pg_attribute a where a.attrelid=c.oid and a.attnum>0),
      'alternativeTable',exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) e where e.privilege_type='SELECT' and (e.grantee=0 or e.grantee<>u.oid and pg_has_role(u.oid,e.grantee,'MEMBER'))),
      'alternativeColumn',exists(select 1 from pg_attribute a cross join lateral aclexplode(coalesce(a.attacl,'{}'::aclitem[])) e where a.attrelid=c.oid and e.privilege_type='SELECT' and (e.grantee=0 or e.grantee=u.oid or pg_has_role(u.oid,e.grantee,'MEMBER'))),
      'dependent',exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) e where e.grantor=u.oid and e.privilege_type='SELECT') or exists(select 1 from pg_attribute a cross join lateral aclexplode(coalesce(a.attacl,'{}'::aclitem[])) e where a.attrelid=c.oid and e.grantor=u.oid and e.privilege_type='SELECT'),
      'hasSelect',has_table_privilege(u.oid,c.oid,'SELECT'),'hasColumnSelect',has_any_column_privilege(u.oid,c.oid,'SELECT')) as snapshot
      from pg_class c join pg_namespace n on n.oid=c.relnamespace cross join pg_roles u
      where n.nspname='public' and c.relname=$1 and c.relkind='r' and u.rolname='authenticated'`, [table]);
    expect(result.rows).toHaveLength(1);
    return result.rows[0].snapshot as ProducerAcl;
}
async function producerCapturedFacts(request: BrowserRequest) {
    const form = await new globalThis.Request("http://capture.invalid", { method: "POST", headers: { "content-type": request.headers()["content-type"] }, body: new Uint8Array(request.postDataBuffer()!) }).formData();
    const field = (name: string) => { const values = [...form.entries()].filter(([key]) => key.endsWith(name)).map(([, value]) => value); expect(values).toHaveLength(1); expect(typeof values[0]).toBe("string"); return String(values[0]); };
    return { operation: field("operationId"), target: field("targetId"), tenant: field("contextTenantId"), actor: field("contextActorId"), expectedRevision: field("expectedRevision") };
}

test("P-E5 CI-only bounded real read-unavailable and one historical target-missing example", async ({ page }, info) => {
    test.setTimeout(120_000);
    const admission = await qualifyProducerBoundedEffects(info); // Before DB connection, fixtures or effects.
    const db = admission.runtime.createCalendarFeedDatabaseClient(admission.stack, "proof");
    db.on("error", () => { /* Native secrets/connection internals never logged. Query/close still fail. */ });
    let own: Awaited<ReturnType<typeof createTwoTenantFixture>> | undefined;
    let damaged = false, methodError: unknown;
    try {
        await db.connect();
        await admission.runtime.readCalendarFeedSetupAuthority(db);
        const privacy = await admission.runtime.readCalendarFeedPrivacyPreflight(db);
        expect(privacy.controls.every(control => control.matchesRequired)).toBe(true);
        const began = (await db.query("select clock_timestamp()::text as started")).rows[0].started as string;
        own = await createTwoTenantFixture();
        const fixture = own;
        const ordinary = await makeAuthedServerClient(fixture.adminA);
        await signIn(page, fixture.adminA.email, fixture.adminA.password);
        let deletionReceipt: { operation: string; target: string; revision: string; creation: string } | undefined;
        let retainedReceipt: Awaited<ReturnType<Locator["elementHandle"]>> | undefined;
        const cases = [
            { table: "company_settings", route: "/settings/company", surface: "company", name: "Företagsnamn", price: null, save: "Spara", kind: "company.save" },
            { table: "quote_terms", route: "/settings/quote-terms", surface: "terms", name: "Offertvillkor", price: null, save: "Spara villkor", kind: "terms.save" },
            { table: "work_roles", route: "/settings/pricing", surface: "work-role", name: "Benämning", price: "Pris (kr/tim)", save: "Spara roll", kind: "work_role.update" },
            { table: "articles", route: "/settings/pricing", surface: "article", name: "Artikelnamn", price: "Enhetspris (kr)", save: "Spara artikel", kind: "article.update" },
        ] as const;
        for (const spec of cases) {
            expect(damaged).toBe(false);
            await page.setViewportSize({ width: 1440, height: 900 });
            await page.goto(spec.route);
            const scope = spec.price ? page.getByTestId(spec.surface === "article" ? "articles-editor" : "work-roles-editor") : page.locator("body");
            await waitForHydrated(scope.getByLabel(spec.name));
            const label = `Bounded owned ${spec.surface}`;
            await scope.getByLabel(spec.name).fill(label);
            let creation: string | undefined;
            if (spec.price) {
                await scope.getByLabel(spec.price).fill("10,00");
                const createdRequest = page.waitForRequest(request => request.method() === "POST" && Boolean(request.headers()["next-action"]) && new URL(request.url()).pathname === spec.route);
                await scope.getByRole("button", { name: spec.save, exact: true }).click();
                creation = (await producerCapturedFacts(await createdRequest)).operation;
                const row = scope.getByRole("listitem").filter({ hasText: label });
                await expect(row).toHaveCount(1);
                await row.getByRole("button", { name: "Redigera", exact: true }).click();
                await scope.getByLabel(spec.price).fill("31,00");
            }
            const before = await producerAclSnapshot(db, spec.table);
            expect(before.owner).toBe("postgres");
            expect(before.authSuper || before.authBypass || before.alternativeTable || before.alternativeColumn || before.dependent).toBe(false);
            expect(before.hasSelect && before.hasColumnSelect).toBe(true);
            const tuples = before.tableAcl.filter(tuple => tuple.grantee === "authenticated" && tuple.privilege === "SELECT");
            expect(tuples).toHaveLength(1);
            const tuple = tuples[0];
            expect(tuple.grantor).toBe(before.owner);
            expect(typeof tuple.grantable).toBe("boolean");
            const faultShape = { ...before, tableAcl: before.tableAcl.filter(entry => entry !== tuple), hasSelect: false, hasColumnSelect: false };
            const hold = await holdNextProducerTransport(page, spec.route, "refresh");
            let releasedReadSettlement: Promise<void> | undefined;
            const releaseAndSettleRead = () => releasedReadSettlement ??= (async () => {
                let timer: ReturnType<typeof setTimeout> | undefined;
                try {
                    await Promise.race([
                        (async () => {
                            const failures: unknown[] = [];
                            try { await hold.clear(); } catch (error) { failures.push(error); }
                            // Handler release errors must not skip the terminal-wait attempt.
                            const request = hold.request();
                            if (request) try {
                                const response = await request.response();
                                if (response) {
                                    const failure = await response.finished();
                                    if (failure && !request.failure()) throw failure;
                                } else if (!request.failure()) throw new Error("Released read has no verified terminal response or request failure");
                            } catch (error) { failures.push(error); }
                            if (failures.length) throw new AggregateError(failures, "Released read cleanup failed");
                        })(),
                        new Promise<never>((_, reject) => { timer = setTimeout(() => reject(new Error("Released read terminal settlement timed out")), 10_000); }),
                    ]);
                } finally { if (timer) clearTimeout(timer); }
            })();
            const actionRequest = page.waitForRequest(request => request.method() === "POST" && Boolean(request.headers()["next-action"]) && new URL(request.url()).pathname === spec.route);
            const reread = page.waitForRequest(request => request.method() === "GET" && request.headers()["rsc"] === "1" && new URL(request.url()).pathname === spec.route);
            void actionRequest.catch(() => undefined); void reread.catch(() => undefined);
            let revoked = false, transaction = false, scenarioError: unknown, cleanupError: unknown;
            let ordinaryBefore: { id: string; write_revision: string } | undefined;
            try {
                await scope.getByRole("button", { name: spec.save, exact: true }).click();
                await hold.seen;
                const facts = await producerCapturedFacts(await actionRequest);
                expect(facts.tenant).toBe(fixture.tenantA.id); expect(facts.actor).toBe(fixture.adminA.id);
                const proof = await db.query(`select p.committed_revision as revision,t.id from public.settings_pricing_operations p join public.${spec.table} t on t.id=p.target_id and t.tenant_id=p.tenant_id and t.write_revision=p.committed_revision where p.id=$1 and p.correlation_id=p.id and p.tenant_id=$2 and p.actor_user_id=$3 and p.target_id=$4 and p.operation_kind=$5`, [facts.operation, fixture.tenantA.id, fixture.adminA.id, facts.target, spec.kind]);
                expect(proof.rows).toHaveLength(1);
                await expect(scope.getByTestId("settings-saved")).toBeVisible();
                const historical = await scope.getByTestId("settings-saved").elementHandle();
                expect(historical).not.toBeNull();
                const predicate = () => ordinary.from(spec.table).select("id,write_revision").eq("tenant_id", fixture.tenantA.id).eq("id", facts.target).single();
                const initialRead = await predicate(); expect(initialRead.error).toBeNull();
                ordinaryBefore = initialRead.data as { id: string; write_revision: string };
                expect(ordinaryBefore.write_revision).toBe(proof.rows[0].revision);
                {
                    const pendingReceipt = scope.getByTestId("settings-saved");
                    const separateCopy = spec.table === "quote_terms" ? "Aktuella uppgifter läses separat." : "Aktuella uppgifter hämtas separat.";
                    const readError = spec.price ? scope.getByTestId("pricing-current-unavailable") : page.getByRole("alert").filter({ hasText: "Ett tillfälligt fel inträffade. Försök igen om en stund." });
                    const assertPendingBranch = async () => {
                        await expect(readError).toHaveCount(0);
                        await expect(pendingReceipt).toContainText(separateCopy);
                        await expect(pendingReceipt).not.toContainText("Aktuella uppgifter är bekräftade.");
                        if (spec.table === "quote_terms") {
                            // Terms separate-copy also renders after matching confirmation.
                            // A fresh saved-current panel + no approval form excludes that:
                            // confirmsOwnWrite would adopt matching defaults and hide the panel.
                            await expect(scope.getByTestId("terms-current-facts").getByText(label, { exact: true })).toBeVisible();
                            await expect(scope.getByRole("button", { name: "Markera som godkänd", exact: true })).toHaveCount(0);
                        }
                    };
                    await assertPendingBranch();
                    await expect(scope.getByTestId("operation-unconfirmed")).toHaveCount(0);
                    await expect(scope.getByRole("button", { name: "Sparar…", exact: true })).toHaveCount(0); // Current reread pending, never save-busy.
                    await expect(scope.getByRole("button", { name: "Uppdatera och granska", exact: true })).toHaveCount(0);
                    const heldRead = hold.request(); expect(heldRead).toBeDefined();
                    let heldReadTerminal = false;
                    void heldRead!.response().then(() => { heldReadTerminal = true; }, () => { heldReadTerminal = true; });
                    const adopt = scope.getByRole("button", { name: "Använd aktuella uppgifter", exact: true });
                    const hasAdopt = await adopt.count(); expect(hasAdopt).toBeLessThanOrEqual(1);
                    for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 640 }]) {
                        await page.setViewportSize(viewport);
                        const pendingAnchor = hasAdopt ? adopt : pendingReceipt;
                        await pendingAnchor.evaluate(element => element.scrollIntoView({ block: "start" }));
                        await expect(pendingReceipt).toBeInViewport({ ratio: 1 });
                        if (hasAdopt) await expect(adopt).toBeInViewport({ ratio: 1 });
                        expect(heldReadTerminal).toBe(false);
                        await assertPendingBranch();
                        await producerCapture(page, info, spec.surface, "receipt-read-pending", pendingAnchor, "start");
                        await expect(pendingReceipt).toBeInViewport({ ratio: 1 });
                        if (hasAdopt) await expect(adopt).toBeInViewport({ ratio: 1 });
                        expect(heldReadTerminal).toBe(false);
                        await assertPendingBranch();
                    }
                }
                // finally is armed BEFORE the committed revoke; fsync intent first.
                await admission.record({ state: "revoke-intent", table: spec.table, before });
                revoked = true;
                await db.query("begin"); transaction = true;
                await db.query('set local role "postgres"');
                await db.query(`revoke select on table public.${spec.table} from authenticated restrict`);
                expect(await producerAclSnapshot(db, spec.table)).toEqual(faultShape);
                await db.query("commit"); transaction = false;
                await admission.record({ state: "revoke-committed", table: spec.table });
                const denied = await predicate(); expect(denied.error?.code).toBe("42501");
                const readRequest = await reread;
                await releaseAndSettleRead();
                const response = await readRequest.response(); expect(response).not.toBeNull(); await response!.finished();
                if (spec.price) {
                    await expect(scope.getByTestId("pricing-current-unavailable")).toBeVisible();
                    await expect(scope.getByTestId("settings-saved")).toContainText("Aktuella uppgifter är inte tillgängliga.");
                    await expect(scope.getByText(spec.surface === "article" ? /Inga artiklar/ : /Inga arbetsroller/)).toHaveCount(0);
                } else await expect(page.getByRole("alert").filter({ hasText: "Ett tillfälligt fel inträffade. Försök igen om en stund." })).toBeVisible();
                await expect(scope.getByTestId("settings-saved")).not.toContainText("Aktuella uppgifter är bekräftade.");
                await expect(scope.getByTestId("settings-saved")).not.toContainText("Posten finns inte längre");
                await expect(scope.getByLabel(spec.name)).toBeDisabled();
                await expect(scope.getByRole("button", { name: spec.save, exact: true })).toBeDisabled();
                expect(await historical!.evaluate(element => element.isConnected)).toBe(true);
                const unavailable = spec.price ? scope.getByTestId("pricing-current-unavailable") : page.getByRole("alert").filter({ hasText: "Ett tillfälligt fel inträffade. Försök igen om en stund." });
                // A committed receipt with a failed read has no unknown/conflict recovery controls.
                await expect(scope.getByRole("button", { name: /^(Kontrollera resultat|Försök igen med samma uppgifter|Uppdatera och granska|Använd aktuella uppgifter)$/ })).toHaveCount(0);
                for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 640 }]) {
                    await page.setViewportSize(viewport);
                    await unavailable.evaluate(element => element.scrollIntoView({ block: "start" }));
                    await expect(unavailable).toBeInViewport({ ratio: 1 });
                    await expect(scope.getByTestId("settings-saved")).toBeInViewport({ ratio: 1 });
                    await producerCapture(page, info, spec.surface, "read-unavailable", unavailable, "start");
                    await expect(scope.getByTestId("settings-saved")).toBeInViewport({ ratio: 1 });
                    await expect(unavailable).toBeInViewport({ ratio: 1 });
                    if (viewport.width === 360) {
                        await producerCapture(page, info, spec.surface, "read-unavailable-draft", scope.getByLabel(spec.name));
                        await expect(scope.getByLabel(spec.name)).toBeInViewport({ ratio: 1 });
                        await expect(scope.getByLabel(spec.name)).toBeDisabled();
                    }
                }
                if (spec.table === "articles") { deletionReceipt = { operation: facts.operation, target: facts.target, revision: proof.rows[0].revision, creation: creation! }; retainedReceipt = historical; }
            } catch (error) { scenarioError = error; }
            finally {
                try { await releaseAndSettleRead(); }
                catch (error) { damaged = true; cleanupError = error; } // Keep unsettled fixtures in disposable-job custody.
                // Exact ACL recovery is still attempted even if transport settlement failed.
                if (revoked) {
                    try {
                        if (transaction) { await db.query("rollback"); transaction = false; }
                        const current = await producerAclSnapshot(db, spec.table);
                        if (JSON.stringify(current) !== JSON.stringify(before)) {
                            expect(current).toEqual(faultShape); // Never repair an ambiguous/different baseline.
                            await db.query("begin"); transaction = true;
                            await db.query('set local role "postgres"');
                            await db.query(`grant select on table public.${spec.table} to authenticated${tuple.grantable ? " with grant option" : ""}`);
                            await db.query("commit"); transaction = false;
                        }
                        expect(await producerAclSnapshot(db, spec.table)).toEqual(before);
                        const restored = await ordinary.from(spec.table).select("id,write_revision").eq("tenant_id", fixture.tenantA.id).eq("id", ordinaryBefore!.id).single();
                        expect(restored.error).toBeNull(); expect(restored.data).toEqual(ordinaryBefore);
                        await admission.record({ state: "restore-verified", table: spec.table });
                    } catch (error) { damaged = true; cleanupError = cleanupError ? new AggregateError([cleanupError, error], "Transport and ACL cleanup both failed") : error; }
                }
            }
            if (scenarioError || cleanupError) throw new AggregateError([scenarioError, cleanupError].filter(error => error !== undefined), "Bounded read scenario/cleanup failed; no further fault or retry admitted");
        }
        // One total fresh article target, not one per viewport/worker/retry.
        expect(deletionReceipt).toBeDefined();
        const target = deletionReceipt!;
        const article = page.getByTestId("articles-editor"), neighbor = page.getByTestId("work-roles-editor");
        const refreshArticle = async (label: string) => {
            await neighbor.getByRole("button", { name: "Ny post" }).click();
            await neighbor.getByLabel("Benämning").fill(label); await neighbor.getByLabel("Pris (kr/tim)").fill("19,00");
            await neighbor.getByRole("button", { name: "Spara roll" }).click();
            await expect(neighbor.getByRole("listitem").filter({ hasText: label })).toHaveCount(1);
        };
        await refreshArticle("Bounded restored-read refresh");
        await expect(article.getByTestId("settings-saved")).toContainText("Aktuella uppgifter är bekräftade.");
        let transaction = false, deletionError: unknown;
        try {
            await db.query("begin"); transaction = true;
            await db.query("set local lock_timeout='2s'");
            await db.query("lock table public.articles in share row exclusive mode");
            const proof = await db.query(`select t.id from public.articles t join public.settings_pricing_operations p on p.target_id=t.id and p.tenant_id=t.tenant_id join public.settings_pricing_operations created on created.id=$6 and created.target_id=t.id and created.tenant_id=t.tenant_id and created.actor_user_id=p.actor_user_id and created.operation_kind='article.create' where t.id=$1 and t.tenant_id=$2 and t.write_revision=$3 and p.id=$4 and p.actor_user_id=$5 and p.committed_revision=t.write_revision and p.operation_kind='article.update' and t.created_at>=$7::timestamptz for update of t`, [target.target, fixture.tenantA.id, target.revision, target.operation, fixture.adminA.id, target.creation, began]);
            expect(proof.rows).toHaveLength(1);
            const unexpectedDeleteTriggers = await db.query("select 1 from pg_trigger where tgrelid='public.articles'::regclass and not tgisinternal and tgenabled<>'D' and (tgtype::int & 8)=8");
            expect(unexpectedDeleteTriggers.rows).toHaveLength(0);
            expect((await db.query("select 1 from pg_rewrite where ev_class='public.articles'::regclass and rulename<>'_RETURN'")).rows).toHaveLength(0);
            const unconstrainedReferences = await db.query("select 1 from pg_attribute a join pg_class c on c.oid=a.attrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and a.attnum>0 and not a.attisdropped and a.attname ~ '(^|_)article_ids?$' and not exists(select 1 from pg_constraint f where f.contype='f' and f.conrelid=c.oid and a.attnum=any(f.conkey) and f.confrelid='public.articles'::regclass)");
            expect(unconstrainedReferences.rows).toHaveLength(0);
            const foreignKeys = await db.query(`select n.nspname as schema,c.relname as relation,array_agg(a.attname order by pair.ordinality) as local,array_agg(b.attname order by pair.ordinality) as remote from pg_constraint f join pg_class c on c.oid=f.conrelid join pg_namespace n on n.oid=c.relnamespace cross join lateral unnest(f.conkey,f.confkey) with ordinality pair(local,remote,ordinality) join pg_attribute a on a.attrelid=f.conrelid and a.attnum=pair.local join pg_attribute b on b.attrelid=f.confrelid and b.attnum=pair.remote where f.contype='f' and f.confrelid='public.articles'::regclass group by f.oid,n.nspname,c.relname order by f.oid`);
            const quote = (identifier: string) => '"' + identifier.replaceAll('"', '""') + '"';
            for (const reference of foreignKeys.rows as { schema: string; relation: string; local: string[]; remote: string[] }[]) {
                const table = `${quote(reference.schema)}.${quote(reference.relation)}`;
                await db.query(`lock table ${table} in share mode`);
                const linked = await db.query(`select 1 from ${table} r join public.articles t on ${reference.local.map((name, index) => `r.${quote(name)}=t.${quote(reference.remote[index])}`).join(" and ")} where t.id=$1 and t.tenant_id=$2 limit 1`, [target.target, fixture.tenantA.id]);
                expect(linked.rows).toHaveLength(0);
            }
            await admission.record({ state: "ONE-delete-intent-budget-consumed", table: "articles", tenant: fixture.tenantA.id, actor: fixture.adminA.id, ...target });
            const deleted = await db.query("delete from public.articles a where a.id=$1 and a.tenant_id=$2 and a.write_revision=$3 and exists(select 1 from public.settings_pricing_operations p where p.id=$4 and p.correlation_id=p.id and p.tenant_id=a.tenant_id and p.target_id=a.id and p.committed_revision=a.write_revision and p.actor_user_id=$5 and p.operation_kind='article.update') returning a.id", [target.target, fixture.tenantA.id, target.revision, target.operation, fixture.adminA.id]);
            expect(deleted.rows).toEqual([{ id: target.target }]);
            await db.query("commit"); transaction = false;
            await admission.record({ state: "ONE-delete-committed", target: target.target });
        } catch (error) { deletionError = error; }
        finally {
            if (transaction) try { await db.query("rollback"); } catch (error) { deletionError = new AggregateError([deletionError, error].filter(value => value !== undefined), "Delete outcome/rollback unverified; budget remains consumed"); }
        }
        if (deletionError) throw deletionError;
        expect((await db.query("select 1 from public.articles where id=$1 and tenant_id=$2", [target.target, fixture.tenantA.id])).rows).toHaveLength(0);
        expect((await db.query("select 1 from public.settings_pricing_operations where id=$1 and tenant_id=$2 and actor_user_id=$3 and target_id=$4 and committed_revision=$5", [target.operation, fixture.tenantA.id, fixture.adminA.id, target.target, target.revision])).rows).toHaveLength(1);
        await refreshArticle("Bounded missing-target refresh");
        await expect(article.getByTestId("settings-saved")).toContainText("Posten finns inte längre i aktuella uppgifter.");
        await expect(article.getByTestId("pricing-current-facts")).toContainText("Ingen aktuell post finns.");
        await expect(article.getByText(/Inga artiklar/)).toBeVisible();
        await expect(article.getByRole("button", { name: "Spara artikel" })).toBeDisabled();
        expect(await retainedReceipt!.evaluate(element => element.isConnected)).toBe(true);
        for (const viewport of [{ width: 1440, height: 900 }, { width: 360, height: 640 }]) {
            await page.setViewportSize(viewport);
            const missingFacts = article.getByTestId("pricing-current-facts");
            const adopt = article.getByRole("button", { name: "Använd aktuella uppgifter", exact: true });
            await missingFacts.evaluate(element => element.scrollIntoView({ block: "start" }));
            await expect(article.getByTestId("settings-saved")).toBeInViewport({ ratio: 1 });
            await expect(adopt).toBeInViewport({ ratio: 1 });
            await expect(article.getByText("Ingen aktuell post finns.", { exact: true })).toBeInViewport({ ratio: 1 });
            await producerCapture(page, info, "article", "current-missing-empty", missingFacts, "start");
            await expect(article.getByTestId("settings-saved")).toBeInViewport({ ratio: 1 });
            await expect(adopt).toBeInViewport({ ratio: 1 });
            await expect(article.getByText("Ingen aktuell post finns.", { exact: true })).toBeInViewport({ ratio: 1 });
            await expect(article.getByText(/Inga artiklar/)).toBeInViewport({ ratio: 1 });
            if (viewport.width === 360) {
                await producerCapture(page, info, "article", "current-missing-draft", article.getByLabel("Enhetspris (kr)"));
                await expect(article.getByLabel("Enhetspris (kr)")).toBeInViewport({ ratio: 1 });
                await expect(article.getByLabel("Enhetspris (kr)")).toHaveValue("31,00");
            }
        }
        await admission.record({ state: "all-effects-and-restoration-verified", deletions: 1 });
    } catch (error) { methodError = error; }
    finally {
        // Closing a session is not a DCL rollback. Retain ALL scenario/cleanup
        // failures, and leave damaged fixtures to disposable-job custody.
        const failures: unknown[] = methodError === undefined ? [] : [methodError];
        try { await db.end(); } catch (error) { failures.push(error); }
        try { if (own && !damaged) await cleanupFixture(own); } catch (error) { failures.push(error); }
        try { await admission.close(); } catch (error) { failures.push(error); }
        if (failures.length) throw new AggregateError(failures, "Bounded producer effects failed; retry is refused by durable job claim");
    }
});
