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
import { readFileSync } from "node:fs";
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

import { mkdir, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { execFileSync } from "node:child_process";
import type { TestInfo, Request as BrowserRequest } from "@playwright/test";
import { createTwoTenantFixture, cleanupFixture } from "../../factories/tenants";
async function producerCapture(page: Page, info: TestInfo, surface: string, state: string) {
    const anchor = surface === "company" ? page.locator("form").filter({ has: page.getByLabel("Företagsnamn") }) : surface === "terms" ? page.getByRole("heading", { name: "Offertvillkor", level: 1 }) : page.getByTestId(surface === "work-role" ? "work-roles-editor" : "articles-editor");
    await anchor.evaluate(el => el.scrollIntoView({ block: "start" }));
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
    await writeFile(path.join(dir, `${state}.json`), JSON.stringify({ candidateSha: candidate, buildSha: candidate, server: "next start", serverPid: boot.serverPid, runnerPid: boot.ownerPid, runId: boot.runId, serverStartedAt: boot.startedAt, controlledTransport: state === "unknown" || state === "loading", configuredCommand: "node node_modules/next/dist/bin/next build && node --require ./tests/support/job-events-fetch-fault.cjs node_modules/next/dist/bin/next start", configurationSha256: createHash("sha256").update(readFileSync("playwright.config.ts")).digest("hex"), synthetic: true, fixture: "test-owned createTwoTenantFixture; no external data", route: new URL(page.url()).pathname, surface, state, viewport, fullViewport: true, pngSha256: createHash("sha256").update(png).digest("hex"), test: info.title, project: info.project.name, result: "Actual configured production-server application capture after named state assertions", capturedAt: new Date().toISOString() }, null, 2));
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
                await producerCapture(page, info, spec.surface, "loading");
                createLoss.release();
                await expect(editor.getByTestId("operation-unconfirmed")).toBeVisible();
                await expect(editor.getByRole("button", { name: "Ny post" })).toBeDisabled();
                await producerCapture(page, info, spec.surface, "unknown");
                await editor.getByRole("button", { name: "Kontrollera resultat" }).click();
                await expect(editor.getByTestId("settings-saved")).toBeVisible();
                expect(new Set(createLoss.identities).size).toBe(1);
                await createLoss.clear();
                let row = editor.getByRole("listitem").filter({ hasText: `Synthetic ${spec.surface}` });
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
                await producerCapture(page, info, spec.surface, "finished");
            }
        }
        finally {
            await cleanupFixture(own);
        }
    });
