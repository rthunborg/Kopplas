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
import { readFileSync, readlinkSync, readdirSync, realpathSync } from "node:fs";
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
type ProducerReadTerminal = { kind: "finished" | "failed"; request: BrowserRequest };
function producerReadIssue(stage: string, error: unknown) {
    const category = error instanceof Error && ["TimeoutError", "TargetClosedError", "Error"].includes(error.name) ? error.name : "unknown";
    return new Error(`Released read ${stage} failed (${category})`); // Never serialize native error messages/causes.
}
function observeProducerReadTerminal(page: Page, routePath: string) {
    let held: BrowserRequest | undefined, observed: ProducerReadTerminal | undefined, actionResponseSeen = false;
    let resolve!: (outcome: ProducerReadTerminal) => void;
    const outcome = new Promise<ProducerReadTerminal>(done => { resolve = done; });
    const diagnostics = { version: 1, matchingGets: { total: 0, prefetch: 0, unmarkedUndetermined: 0, unexpectedMarker: 0, unknown: 0 }, exact: { prefetchClass: "unobserved", actionResponseBeforeHold: false, responseSeen: false, statusClass: "none", failureCategory: "none" }, order: [] as string[], orderTruncated: false };
    const mark = (stage: string) => { if (diagnostics.order.length < 24) diagnostics.order.push(stage); else diagnostics.orderTruncated = true; };
    const matching = (request: BrowserRequest) => new URL(request.url()).pathname === routePath;
    const prefetchClass = (request: BrowserRequest) => {
        try {
            const headers = request.headers(), marker = headers["next-router-prefetch"];
            if (marker !== undefined && !["1", "2", "3"].includes(marker)) return "unexpectedMarker";
            return ["1", "2", "3"].includes(marker ?? "") || Boolean(headers["next-router-segment-prefetch"]) || headers.purpose === "prefetch" ? "prefetch" : "unmarkedUndetermined";
        }
        catch { return "unknown"; }
    };
    const requested = (request: BrowserRequest) => {
        try {
            if (!matching(request) || request.method() !== "GET" || request.headers().rsc !== "1") return;
            const kind = prefetchClass(request);
            diagnostics.matchingGets.total = Math.min(65535, diagnostics.matchingGets.total + 1);
            diagnostics.matchingGets[kind] = Math.min(65535, diagnostics.matchingGets[kind] + 1);
        } catch { mark("request-class-unavailable"); }
    };
    const responded = (response: import("@playwright/test").Response) => {
        try {
            const request = response.request();
            if (matching(request) && request.method() === "POST" && Boolean(request.headers()["next-action"])) { actionResponseSeen = true; mark("action-response"); }
            if (request === held) { diagnostics.exact.responseSeen = true; const status = response.status(); diagnostics.exact.statusClass = status >= 100 && status < 600 ? `${Math.floor(status / 100)}xx` : "other"; mark("exact-response"); }
        } catch { mark("response-class-unavailable"); }
    };
    const record = (kind: ProducerReadTerminal["kind"], request: BrowserRequest) => {
        if (request !== held || observed) return;
        if (kind === "failed") {
            try { const failure = request.failure()?.errorText; diagnostics.exact.failureCategory = ["net::ERR_ABORTED", "net::ERR_FAILED", "net::ERR_CONNECTION_RESET", "net::ERR_CONNECTION_REFUSED", "net::ERR_EMPTY_RESPONSE", "net::ERR_NETWORK_CHANGED", "net::ERR_TIMED_OUT"].includes(failure ?? "") ? failure! : "other"; }
            catch { diagnostics.exact.failureCategory = "unavailable"; }
        }
        mark(`terminal-${kind}`); observed = { kind, request }; resolve(observed);
    };
    const finished = (request: BrowserRequest) => record("finished", request), failed = (request: BrowserRequest) => record("failed", request);
    page.on("request", requested); page.on("response", responded); page.on("requestfinished", finished); page.on("requestfailed", failed);
    return { outcome, mark, summary: () => JSON.parse(JSON.stringify(diagnostics)) as typeof diagnostics, bind: (request: BrowserRequest) => {
        held = request; diagnostics.exact.prefetchClass = prefetchClass(request); diagnostics.exact.actionResponseBeforeHold = actionResponseSeen; mark("exact-held");
        if (request.failure()) failed(request);
    }, dispose: () => { page.off("request", requested); page.off("response", responded); page.off("requestfinished", finished); page.off("requestfailed", failed); mark("observers-disposed"); } };
}
function producerReadSettlement(hold: { releaseHeld: () => Promise<void>; dispose: () => Promise<void>; request: () => BrowserRequest | undefined }, terminal: ReturnType<typeof observeProducerReadTerminal>) {
    type Settlement = { kind: "not-held"; response: null } | (ProducerReadTerminal & { response: Awaited<ReturnType<BrowserRequest["response"]>> });
    let cached: Promise<Settlement> | undefined;
    return () => cached ??= (async () => {
        let timer: ReturnType<typeof setTimeout> | undefined, phase = "release", expired = false;
        const errors: Error[] = [];
        let result: Settlement | undefined;
        const deadline = new Promise<never>((_, reject) => { timer = setTimeout(() => { expired = true; reject(new Error("Released read combined deadline exhausted")); }, 10_000); });
        try {
            result = await Promise.race([
                (async (): Promise<Settlement> => {
                    terminal.mark("release-start");
                    try { await hold.releaseHeld(); terminal.mark("fallback-complete"); } catch (error) { errors.push(producerReadIssue("release", error)); terminal.mark("release-error"); }
                    phase = "terminal";
                    const observed = hold.request() ? await terminal.outcome : undefined;
                    phase = "completed-response";
                    const response = observed?.kind === "finished" ? await observed.request.response() : null;
                    return observed ? { ...observed, response } : { kind: "not-held", response: null };
                })(), deadline,
            ]);
        } catch (error) { errors.push(expired ? new Error(`Released read combined deadline exhausted: ${phase}`) : producerReadIssue(phase, error)); }
        finally {
            phase = "disposal"; terminal.mark("unroute-start");
            try {
                const disposal = hold.dispose(); // Attempt even after expiry; an expired budget can never verify disposal.
                if (expired) { void disposal.catch(() => undefined); throw new Error("Released read disposal deadline exhausted"); }
                await Promise.race([disposal, deadline]); terminal.mark("disposal-verified");
            }
            catch (error) { errors.push(expired ? new Error("Released read disposal unverified within combined deadline") : producerReadIssue("disposal", error)); terminal.mark("disposal-unverified"); }
            finally { if (timer) clearTimeout(timer); terminal.dispose(); }
        }
        if (errors.length) {
            if (result?.kind === "failed") errors.unshift(new Error("Released read terminal=failed; no delivered-read credit"));
            throw new AggregateError(errors, "Released read release/terminal/disposal failed");
        }
        return result!;
    })();
}
async function holdNextProducerTransport(page: Page, routePath: string, transport: "action" | "refresh", onHeld?: (request: BrowserRequest) => void) {
    let release!: () => void, arrived!: () => void, settled!: () => void;
    const gate = new Promise<void>(r => { release = r; });
    const seen = new Promise<void>(r => { arrived = r; });
    const done = new Promise<void>(r => { settled = r; });
    let held = false, heldRequest: BrowserRequest | undefined, releaseError: unknown;
    const matcher = (url: URL) => url.pathname === routePath;
    const handler = async (route: import("@playwright/test").Route) => {
        const request = route.request();
        const matches = transport === "action" ? request.method() === "POST" && Boolean(request.headers()["next-action"])
            : request.method() === "GET" && request.headers()["rsc"] === "1";
        if (held || !matches) { await route.fallback(); return; }
        held = true;
        heldRequest = request;
        onHeld?.(request);
        arrived();
        try { await gate; await route.fallback(); }
        catch (error) { releaseError = error; if (!onHeld) throw error; }
        finally { settled(); }
    };
    await page.route(matcher, handler);
    const releaseHeld = async () => { release(); if (held) await done; if (releaseError) throw releaseError; };
    const dispose = () => page.unroute(matcher, handler);
    return { seen, release, request: () => heldRequest, releaseHeld, dispose, clear: async () => { release(); if (held) await done; await dispose(); } };
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
type ProducerPlaywrightEntry = { family: "@playwright/test" | "playwright"; canonical: string };
function producerPlaywrightEntry(script: string, fsPath = path, resolveRealPath: (file: string) => string = realpathSync, read: (file: string, encoding: "utf8") => string = readFileSync): ProducerPlaywrightEntry | undefined {
    // Preserve a recognizable original launcher even if its loaded entrypoint was
    // unlinked or a conventional symlink resolves outside the named package.
    let knownFamily = /(?:^|\/)node_modules\/(?:(?:@playwright\/test|playwright)\/cli\.js|\.bin\/playwright)$/.test(fsPath.normalize(script));
    let canonical: string;
    try { canonical = resolveRealPath(script); }
    catch { if (knownFamily) throw new Error("P-E5 family=playwright reason=entrypoint-unavailable"); return; }
    knownFamily ||= /node_modules\/(?:@playwright\/test|playwright)\/cli\.js$/.test(canonical);
    if (fsPath.basename(canonical) !== "cli.js") {
        if (knownFamily) throw new Error("P-E5 family=playwright reason=canonical-entrypoint-mismatch");
        return;
    }
    const directory = fsPath.dirname(canonical);
    let pkg;
    try { pkg = JSON.parse(read(fsPath.join(directory, "package.json"), "utf8")); }
    catch { if (knownFamily) throw new Error("P-E5 family=playwright reason=package-identity-unavailable"); return; }
    if (pkg.name !== "@playwright/test" && pkg.name !== "playwright") {
        if (knownFamily) throw new Error("P-E5 family=playwright reason=package-identity-mismatch");
        return;
    }
    const bin = typeof pkg.bin === "string" ? pkg.bin : pkg.bin?.playwright;
    let binCanonical: string | undefined;
    try { if (typeof bin === "string") binCanonical = resolveRealPath(fsPath.resolve(directory, bin)); } catch { /* Fixed reason only, no fsPath payload. */ }
    if (binCanonical !== canonical) throw new Error("P-E5 family=playwright reason=package-bin-mismatch");
    return { family: pkg.name, canonical };
}
function producerPlaywrightInvocation(args: readonly string[], cwd: string | (() => string), identify: (script: string) => ProducerPlaywrightEntry | undefined, unclassified?: (role: "parsed" | "opaque") => void, inspectedScript?: (canonical: string) => void, fsPath = path, resolveRealPath: (file: string) => string = realpathSync): ProducerPlaywrightEntry | undefined {
    // Absolute scripts and proven non-test commands do not require another
    // process's cwd. An unresolved relative test/ambiguous launch still refuses.
    const resolveScript = (script: string, subcommand: "test" | "unresolved", resolutionBranch: "unsupported-option" | "non-test-script" | "test-script") => {
        if (fsPath.isAbsolute(script)) return fsPath.normalize(script);
        try { return fsPath.resolve(typeof cwd === "string" ? cwd : cwd(), script); }
        catch (error) {
            const code = (error as NodeJS.ErrnoException).code;
            throw Object.assign(new Error("P-E5 family=node reason=consumer-cwd-unavailable"), {
                producerErrorCategory: ["EACCES", "EPERM", "ENOENT", "ESRCH"].includes(code ?? "") ? code : "other",
                producerScriptFamily: /(?:^|\/)node_modules\/(?:(?:@playwright\/test|playwright)\/cli\.js|\.bin\/playwright)$/.test(fsPath.normalize(script)) ? "playwright-hint" : "unclassified",
                producerSubcommandCategory: subcommand,
                producerResolutionBranch: resolutionBranch,
            });
        }
    };
    let index = 1;
    while (args[index]?.startsWith("-")) {
        const option = args[index];
        if (option === "--") { index++; break; }
        if (["-e", "--eval", "-p", "--print"].includes(option) || option.startsWith("--eval=") || option.startsWith("--print=")) { unclassified?.("opaque"); return; } // Inline program, not an inspectable script.
        if (["-r", "--require", "--import", "--loader", "--experimental-loader", "--conditions", "-C"].includes(option)) { if (!args[index + 1]) throw new Error("P-E5 family=node reason=missing-startup-option-value"); index += 2; continue; }
        if (option.startsWith("--") && option.includes("=") || ["--no-warnings", "--enable-source-maps", "--experimental-strip-types", "--trace-warnings", "--inspect", "--inspect-brk"].includes(option)) { index++; continue; }
        // Never accept an arbitrary argv payload just because it contains test.
        // An unsupported Node launch with a real Playwright CLI is a refusal,
        // including foreign projects, not an ignored consumer.
        if (args.slice(index + 1).some(arg => identify(resolveScript(arg, "unresolved", "unsupported-option")))) throw new Error("P-E5 family=playwright reason=unsupported-node-launch");
        unclassified?.("opaque");
        return;
    }
    if (!args[index]) { unclassified?.("opaque"); return; }
    if (args[index + 1] !== "test") {
        // A confirmed Node with rewritten/opaque argv cannot be dismissed by
        // missing tokens. Normal inspectable non-test scripts remain distinct.
        if (unclassified) {
            const script = resolveScript(args[index], "unresolved", "non-test-script");
            try { const canonical = resolveRealPath(script); inspectedScript?.(canonical); unclassified("parsed"); } catch { unclassified("opaque"); }
        }
        return;
    }
    const script = resolveScript(args[index], "test", "test-script"), result = identify(script);
    if (!result && unclassified) { try { const canonical = resolveRealPath(script); inspectedScript?.(canonical); unclassified("parsed"); } catch { unclassified("opaque"); } }
    return result;
}
function producerNodeInvocation(args: readonly string[], cwd: string | (() => string), identify: (script: string) => ProducerPlaywrightEntry | undefined, requireInspectable: boolean, inspectedScript?: (canonical: string) => void, fsPath = path, resolveRealPath: (file: string) => string = realpathSync): ProducerPlaywrightEntry | undefined {
    let role: "parsed" | "opaque" = "opaque";
    const invocation = producerPlaywrightInvocation(args, cwd, identify, requireInspectable ? value => { role = value; } : undefined, inspectedScript, fsPath, resolveRealPath);
    if (requireInspectable && !invocation && role === "opaque") throw new Error("P-E5 family=node reason=opaque-node-consumer");
    return invocation;
}
type ProducerExecutableKind = "node" | "non-node" | "unknown";
function producerDriverInvocation(args: readonly string[], cwd: string | (() => string), identify: (script: string) => ProducerPlaywrightEntry | undefined,
    executable: ProducerExecutableKind, owner: boolean): ProducerPlaywrightEntry | undefined {
    if (owner && executable !== "node") throw new Error(`P-E5 family=node reason=owner-executable-${executable === "non-node" ? "contradiction" : "unverified"}`);
    if (executable === "non-node") return;
    const nodeLaunch = /(?:^|\/)(?:node|nodejs|npm|npx|pnpm)(?:$|\s)/.test(args[0] ?? "");
    const playwrightEvidence = args.some(arg => /(?:^|\/)node_modules\/(?:(?:@playwright\/test|playwright)\/cli\.js|\.bin\/playwright)$/.test(path.normalize(arg))
        || /^npm (?:exec|x) (?:playwright|@playwright\/test)(?:@[^\s]+)?(?:\s|$)/.test(arg));
    if (executable === "unknown" && !nodeLaunch && !playwrightEvidence) return;
    try {
        const invocation = producerNodeInvocation(args, cwd, identify, true);
        if (owner && !invocation) throw new Error("P-E5 family=playwright reason=owner-entrypoint-unclassified");
        return invocation;
    } catch (error) { throw Object.assign(error as Error, { producerAffirmativeSignal: executable === "node" ? "kernel-node" : nodeLaunch && playwrightEvidence ? "both" : nodeLaunch ? "node-launch" : "playwright-entrypoint" }); }
}
type ProducerBrowserInspection = {
    Config?: { Cmd?: unknown; Entrypoint?: unknown }; Path?: string; Args?: unknown;
    HostConfig?: { Init?: boolean; PidMode?: string }; State?: { Running?: boolean; Pid?: number };
};
function producerBrowserLauncherPid(inspected: ProducerBrowserInspection, expected: readonly string[], top: string,
    status: (pid: number) => string, processStat: (pid: number) => string, args: readonly string[]): number {
    const refuse = () => { throw new Error("P-E5 family=node reason=browser-launcher-unverified"); };
    // Role evidence never exempts a parsed/opaque test command, even in this container.
    if (args.some(arg => /(?:^|\s)test(?:\s|$)/.test(arg))) refuse();
    const init = inspected.State?.Pid;
    if (!Number.isSafeInteger(init) || init! <= 1 || !inspected.State?.Running || inspected.HostConfig?.Init !== true
        || inspected.HostConfig.PidMode !== "" || JSON.stringify(inspected.Config?.Cmd) !== JSON.stringify(expected)
        || inspected.Config?.Entrypoint != null && JSON.stringify(inspected.Config.Entrypoint) !== "[]"
        || inspected.Path !== expected[0] || JSON.stringify(inspected.Args) !== JSON.stringify(expected.slice(1))) refuse();
    const lines = top.trim().split("\n");
    if (lines.shift()?.trim().replace(/\s+/g, " ") !== "PID PPID") refuse();
    const rows = lines.map(line => { const match = /^\s*(\d+)\s+(\d+)\s*$/.exec(line); if (!match) return refuse(); return { pid: Number(match[1]), parent: Number(match[2]) }; });
    if (new Set(rows.map(row => row.pid)).size !== rows.length || !rows.some(row => row.pid === init)) refuse();
    const children = rows.filter(row => row.parent === init);
    if (children.length !== 1) refuse(); // No descendant/container-wide allowance.
    const launcher = children[0].pid;
    const parseStat = (pid: number) => {
        const raw = processStat(pid), end = raw.lastIndexOf(")"), fields = raw.slice(end + 2).trim().split(/\s+/);
        if (Number(raw.slice(0, raw.indexOf(" "))) !== pid || end < 0 || !/^\d+$/.test(fields[19] ?? "")) return refuse();
        return { parent: Number(fields[1]), started: fields[19] };
    };
    const beforeInit = parseStat(init!), beforeLauncher = parseStat(launcher);
    const parseStatus = (pid: number) => {
        const raw = status(pid), id = Number(/^Pid:\s+(\d+)$/m.exec(raw)?.[1]), parent = Number(/^PPid:\s+(\d+)$/m.exec(raw)?.[1]);
        const namespace = /^NSpid:\s+([\d\t ]+)$/m.exec(raw)?.[1].trim().split(/\s+/).map(Number);
        if (id !== pid || !namespace || namespace.length < 2 || namespace[0] !== pid || !namespace.every(Number.isSafeInteger)) return refuse();
        return { parent, namespace };
    };
    const initStatus = parseStatus(init!), launcherStatus = parseStatus(launcher);
    if (launcherStatus.parent !== init || beforeLauncher.parent !== init || initStatus.parent !== beforeInit.parent
        || rows.find(row => row.pid === init)?.parent !== initStatus.parent || initStatus.namespace.at(-1) !== 1
        || launcherStatus.namespace.at(-1)! <= 1 || initStatus.namespace.length !== launcherStatus.namespace.length
        || JSON.stringify(initStatus.namespace.slice(1, -1)) !== JSON.stringify(launcherStatus.namespace.slice(1, -1))
        || JSON.stringify(beforeInit) !== JSON.stringify(parseStat(init!)) || JSON.stringify(beforeLauncher) !== JSON.stringify(parseStat(launcher))) refuse();
    return launcher;
}
type ProducerNamespaceMapping = { hostPid: number; pid: number; parent: number; started: string; initStarted: string };
type ProducerNamespaceInput = ProducerNamespaceMapping & { cmdlineSha256: string; version: string; service?: string; serviceMain?: boolean };
type ProducerNamespaceOutput = { pid: number; parent: number; started: string; kind: "blocked" | "test" | "non-test" | "non-node"; executable: "unknown" | "node" | "non-node"; binding: "none" | "canonical-cli" | "pinned-cli" | "ordinary-script" | "service-main" | "non-node"; family: "none" | "playwright" | "@playwright/test"; reason: "none" | "identity-unavailable" | "opaque-node" };
function producerBrowserMemberMapping(inspected: ProducerBrowserInspection, expected: readonly string[], top: string,
    status: (pid: number) => string, processStat: (pid: number) => string, args: readonly string[], candidate: number): ProducerNamespaceMapping {
    producerBrowserLauncherPid(inspected, expected, top, status, processStat, args);
    return producerNamespaceMemberMapping(inspected, top, status, processStat, candidate);
}
function producerNamespaceMemberMapping(inspected: ProducerBrowserInspection, top: string, status: (pid: number) => string,
    processStat: (pid: number) => string, candidate: number): ProducerNamespaceMapping {
    const fail = (stage = "mapping-unverified") => { throw Object.assign(new Error("P-E5 family=node reason=namespace-membership-unverified"), { producerNamespaceStage: stage }); };
    const rows = top.trim().split("\n").slice(1).map(line => { const m = /^\s*(\d+)\s+(\d+)\s*$/.exec(line); if (!m) return fail(); return { pid: Number(m[1]), parent: Number(m[2]) }; });
    const row = rows.find(value => value.pid === candidate); if (!row) return fail("nonmember");
    const identity = (pid: number) => {
        const text = status(pid), raw = processStat(pid), fields = raw.slice(raw.lastIndexOf(")") + 2).trim().split(/\s+/);
        const namespace = /^NSpid:\s+([\d\t ]+)$/m.exec(text)?.[1].trim().split(/\s+/).map(Number);
        const parent = Number(/^PPid:\s+(\d+)$/m.exec(text)?.[1]);
        if (Number(/^Pid:\s+(\d+)$/m.exec(text)?.[1]) !== pid || Number(raw.slice(0, raw.indexOf(" "))) !== pid
            || !namespace || namespace.length < 2 || namespace[0] !== pid || !namespace.every(Number.isSafeInteger)
            || parent !== Number(fields[1]) || !/^\d{1,24}$/.test(fields[19] ?? "")) return fail();
        return { namespace, parent, started: fields[19] };
    };
    const init = identity(inspected.State!.Pid!), member = identity(candidate);
    if (init.namespace.at(-1) !== 1) return fail("parent-or-namespace-unverified");
    if (member.parent !== row.parent || member.namespace.length !== init.namespace.length
        || JSON.stringify(member.namespace.slice(1, -1)) !== JSON.stringify(init.namespace.slice(1, -1))) return fail("parent-or-namespace-unverified");
    let parent = 0;
    if (candidate !== inspected.State!.Pid) {
        if (!rows.some(value => value.pid === member.parent)) return fail("parent-unverified");
        const parentIdentity = identity(member.parent);
        if (parentIdentity.namespace.length !== member.namespace.length || JSON.stringify(parentIdentity.namespace.slice(1, -1)) !== JSON.stringify(member.namespace.slice(1, -1))) return fail();
        parent = parentIdentity.namespace.at(-1)!;
    }
    if (JSON.stringify(init) !== JSON.stringify(identity(inspected.State!.Pid!)) || JSON.stringify(member) !== JSON.stringify(identity(candidate))) return fail("instance-changed");
    return { hostPid: candidate, pid: member.namespace.at(-1)!, parent, started: member.started, initStarted: init.started };
}
function producerNamespaceClassify(input: ProducerNamespaceInput, fsPath = path, read: (file: string, encoding: "utf8") => string = readFileSync, link = readlinkSync, resolveRealPath: (file: string) => string = realpathSync, hash = createHash): ProducerNamespaceOutput {
    const output: ProducerNamespaceOutput = { pid: input.pid, parent: input.parent, started: input.started, kind: "blocked", executable: "unknown", binding: "none", family: "none", reason: "identity-unavailable" };
    try {
        if (!Number.isSafeInteger(input.pid) || input.pid <= 0 || !Number.isSafeInteger(input.parent) || input.parent < 0
            || !/^\d{1,24}$/.test(input.started) || !/^[a-f0-9]{64}$/.test(input.cmdlineSha256) || !/^\d+\.\d+\.\d+$/.test(input.version)) return output;
        const snapshot = () => {
            const base = `/proc/${input.pid}`, raw = read(`${base}/stat`, "utf8"), fields = raw.slice(raw.lastIndexOf(")") + 2).trim().split(/\s+/);
            const status = read(`${base}/status`, "utf8"), cmdline = read(`${base}/cmdline`, "utf8");
            const executable = link(`${base}/exe`), cwd = link(`${base}/cwd`);
            if (Number(raw.slice(0, raw.indexOf(" "))) !== input.pid || Number(/^Pid:\s+(\d+)$/m.exec(status)?.[1]) !== input.pid
                || Number(fields[1]) !== input.parent || Number(/^PPid:\s+(\d+)$/m.exec(status)?.[1]) !== input.parent || fields[19] !== input.started
                || hash("sha256").update(cmdline).digest("hex") !== input.cmdlineSha256 || cmdline.length > 65536 || executable.length > 4096 || cwd.length > 4096) throw new Error("unstable");
            return { executable, cwd, cmdline };
        };
        const packageSnapshots = new Map<string, string>(), canonicalSnapshots = new Map<string, string>();
        const checkedRead = (file: string, encoding: "utf8") => {
            const value = read(file, encoding);
            if (fsPath.basename(file) === "package.json") { if (packageSnapshots.has(file) && packageSnapshots.get(file) !== value) throw new Error("package-changed"); packageSnapshots.set(file, value); }
            return value;
        };
        const checkedRealPath = (file: string) => {
            const value = resolveRealPath(file);
            if (canonicalSnapshots.has(file) && canonicalSnapshots.get(file) !== value) throw new Error("entry-changed");
            canonicalSnapshots.set(file, value); return value;
        };
        const before = snapshot(), args = before.cmdline.split("\0");
        const node = /^(?:node|nodejs)(?: \(deleted\))?$/.test(fsPath.basename(before.executable));
        output.executable = node ? "node" : "non-node";
        if (!node) { output.kind = "non-node"; output.binding = "non-node"; }
        else {
            let inspected: string | undefined;
            const entry = producerNodeInvocation(args, before.cwd, script => producerPlaywrightEntry(script, fsPath, checkedRealPath, checkedRead), true, canonical => { inspected = canonical; }, fsPath, checkedRealPath);
            if (entry) {
                const pkg = JSON.parse(checkedRead(fsPath.join(fsPath.dirname(entry.canonical), "package.json"), "utf8"));
                output.kind = "test"; output.family = entry.family;
                output.binding = pkg.version === input.version ? "pinned-cli" : "canonical-cli";
            } else if (inspected) {
                const cli = producerPlaywrightEntry(inspected, fsPath, checkedRealPath, checkedRead);
                if (cli) {
                    const pkg = JSON.parse(checkedRead(fsPath.join(fsPath.dirname(cli.canonical), "package.json"), "utf8"));
                    if (pkg.version !== input.version) throw new Error("version");
                    output.binding = "pinned-cli"; output.family = cli.family;
                } else output.binding = "ordinary-script";
                output.kind = "non-test";
            } else { output.reason = "opaque-node"; return output; }
        }
        if (JSON.stringify(before) !== JSON.stringify(snapshot())) throw new Error("unstable");
        for (const [file, value] of packageSnapshots) if (read(file, "utf8") !== value) throw new Error("package-changed");
        for (const [file, value] of canonicalSnapshots) if (resolveRealPath(file) !== value) throw new Error("entry-changed");
        output.reason = "none"; return output;
    } catch (error) {
        return { ...output, kind: "blocked", binding: "none", family: "none", reason: (error as Error).message === "P-E5 family=node reason=opaque-node-consumer" ? "opaque-node" : "identity-unavailable" };
    }
}
// CLI v2.115.0 commit18ae43a3 embedded manifest + exact builders: no Cmd,
// Entrypoint/User override. Unexpected linked-version pins or custom registries
// change the resolved reference and therefore fail this CLOSED reference set.
function producerClosedStackServices() {
    const handoff = "a15ac9589c04baf9da95b08e0e79b5cf1d75ab8dc64e06a5e68e4ceb0ad7c8ea";
    return [
        { key: "studio", section: "studio", name: "/supabase_studio_kopplas", repository: "studio", tag: "2026.08.17-sha-0c1da8f", script: "apps/studio/server.js", cwd: "/app", alias: "studio", port: "3000/tcp", hostPort: "54323", handoff },
        { key: "storage", section: "storage", name: "/supabase_storage_kopplas", repository: "storage-api", tag: "v1.69.11", script: "dist/start/server.js", cwd: "/app", alias: "storage", port: "5000/tcp", hostPort: "", handoff },
        { key: "pgmeta", section: "studio", name: "/supabase_pg_meta_kopplas", repository: "postgres-meta", tag: "v0.98.0", script: "dist/server/server.js", cwd: "/usr/src/app", alias: "pg_meta", port: "8080/tcp", hostPort: "", handoff },
    ] as const;
}
type ProducerClosedService = ReturnType<typeof producerClosedStackServices>[number];
type ProducerServiceContainer = ProducerBrowserInspection & { Id?: string; Image?: string; Name?: string; Created?: string; Mounts?: { Destination?: string }[];
    Config?: NonNullable<ProducerBrowserInspection["Config"]> & { Image?: string; User?: string; WorkingDir?: string; Labels?: Record<string, string>; ExposedPorts?: Record<string, unknown> };
    NetworkSettings?: { Networks?: Record<string, { NetworkID?: string; Aliases?: string[] }>; Ports?: Record<string, { HostIp?: string; HostPort?: string }[] | null> } };
function producerClosedServiceEnabled(service: ProducerClosedService, config: string): boolean {
    const section = config.split(new RegExp(`^\\[${service.section}\\]\\s*$`, "m"))[1]?.split(/^\[/m)[0];
    return Boolean(section && /^enabled\s*=\s*true\s*(?:#.*)?$/m.test(section));
}
function producerValidateClosedService(service: ProducerClosedService, config: string, inspected: ProducerServiceContainer,
    imageRef: { Id?: string; RepoTags?: string[]; Config?: ProducerServiceContainer["Config"] }, imageId: { Id?: string; Config?: ProducerServiceContainer["Config"] },
    db: ProducerServiceContainer, gateway: ProducerServiceContainer, checkoutTime: number, now: number): void {
    const fail = () => { throw new Error("P-E5 family=node reason=closed-service-unverified"); };
    const section = config.split(new RegExp(`^\\[${service.section}\\]\\s*$`, "m"))[1]?.split(/^\[/m)[0];
    if (!producerClosedServiceEnabled(service, config)) fail();
    if (service.key === "studio" && (!/^port\s*=\s*54323\s*(?:#.*)?$/m.test(section!) || !/^api_url\s*=\s*"http:\/\/127\.0\.0\.1"\s*(?:#.*)?$/m.test(section!))) fail();
    const refs = [`supabase/${service.repository}:${service.tag}`, `public.ecr.aws/supabase/${service.repository}:${service.tag}`, `ghcr.io/supabase/${service.repository}:${service.tag}`];
    const created = Date.parse(inspected.Created ?? ""), expectedCmd = ["node", service.script], expectedEntry = ["docker-entrypoint.sh"];
    if (!/^[a-f0-9]{64}$/.test(inspected.Id ?? "") || inspected.Name !== service.name || !inspected.State?.Running || !Number.isSafeInteger(inspected.State.Pid) || inspected.State.Pid! <= 1
        || inspected.Config?.Labels?.["com.supabase.cli.project"] !== "kopplas" || !Number.isFinite(created) || created < checkoutTime || created > now
        || !refs.includes(inspected.Config?.Image ?? "") || !/^sha256:[a-f0-9]{64}$/.test(inspected.Image ?? "") || imageRef.Id !== inspected.Image || imageId.Id !== inspected.Image
        || !imageRef.RepoTags?.includes(inspected.Config!.Image!) || JSON.stringify(imageRef.Config) !== JSON.stringify(imageId.Config)) fail();
    const defaults = imageId.Config;
    if (!defaults || JSON.stringify(defaults.Cmd) !== JSON.stringify(expectedCmd) || JSON.stringify(defaults.Entrypoint) !== JSON.stringify(expectedEntry)
        || typeof defaults.User !== "string" || defaults.User.length > 128 || defaults.WorkingDir !== service.cwd || !Object.hasOwn(defaults.ExposedPorts ?? {}, service.port)
        || inspected.Config!.User !== defaults.User || inspected.Config!.WorkingDir !== defaults.WorkingDir || JSON.stringify(inspected.Config!.Cmd) !== JSON.stringify(defaults.Cmd)
        || JSON.stringify(inspected.Config!.Entrypoint) !== JSON.stringify(defaults.Entrypoint) || inspected.Path !== expectedEntry[0] || JSON.stringify(inspected.Args) !== JSON.stringify(expectedCmd)
        || inspected.HostConfig?.PidMode !== "" || inspected.HostConfig.Init === true) fail();
    const common = Object.values(db.NetworkSettings?.Networks ?? {}).map(value => value.NetworkID).filter(id => /^[a-f0-9]{64}$/.test(id ?? "") && Object.values(gateway.NetworkSettings?.Networks ?? {}).some(value => value.NetworkID === id));
    const networks = Object.values(inspected.NetworkSettings?.Networks ?? {});
    if (networks.length !== 1 || !common.includes(networks[0].NetworkID) || !networks[0].Aliases?.includes(service.alias)) fail();
    const ports = Object.values(inspected.NetworkSettings?.Ports ?? {}).flatMap(value => value ?? []);
    if (service.hostPort ? !inspected.NetworkSettings?.Ports?.[service.port]?.some(value => value.HostPort === service.hostPort && ["127.0.0.1", "0.0.0.0"].includes(value.HostIp ?? "")) || ports.some(value => value.HostPort !== service.hostPort)
        : ports.length !== 0) fail();
    for (const mount of inspected.Mounts ?? []) {
        const destination = mount.Destination?.replace(/\/$/, "");
        if (!destination || [service.cwd, "/usr/local/bin/docker-entrypoint.sh"].some(file => file === destination || file.startsWith(destination + "/"))) fail();
    }
}
function producerNamespaceOpaqueMain(input: ProducerNamespaceInput, prior: ProducerNamespaceOutput, fsPath = path,
    read: (file: string, encoding: "utf8") => string = readFileSync, link = readlinkSync, resolveRealPath: (file: string) => string = realpathSync, hash = createHash): ProducerNamespaceOutput {
    try {
        const service = producerClosedStackServices().find(value => value.key === input.service);
        if (prior.kind !== "blocked" || prior.reason !== "opaque-node" || !service || input.serviceMain !== true || input.pid !== 1 || input.parent !== 0) return prior;
        const expectedScript = fsPath.posix.join(service.cwd, service.script), handoffPath = "/usr/local/bin/docker-entrypoint.sh";
        const snapshot = () => {
            const raw = read("/proc/1/stat", "utf8"), fields = raw.slice(raw.lastIndexOf(")") + 2).trim().split(/\s+/), status = read("/proc/1/status", "utf8");
            const cmdline = read("/proc/1/cmdline", "utf8"), executable = link("/proc/1/exe"), cwd = link("/proc/1/cwd");
            if (Number(raw.slice(0, raw.indexOf(" "))) !== 1 || Number(fields[1]) !== 0 || fields[19] !== input.started || Number(/^Pid:\s+(\d+)$/m.exec(status)?.[1]) !== 1
                || Number(/^PPid:\s+(\d+)$/m.exec(status)?.[1]) !== 0 || !/^(?:node|nodejs)$/.test(fsPath.basename(executable)) || cmdline.split("\0").some(arg => /(?:^|\s)test(?:\s|$)/.test(arg))
                || hash("sha256").update(cmdline).digest("hex") !== input.cmdlineSha256 || resolveRealPath(expectedScript) !== expectedScript
                || hash("sha256").update(read(handoffPath, "utf8")).digest("hex") !== service.handoff) throw new Error("unverified");
            return { executable, cwd, cmdline, scriptHash: hash("sha256").update(read(expectedScript, "utf8")).digest("hex"), handoff: hash("sha256").update(read(handoffPath, "utf8")).digest("hex") };
        };
        const before = snapshot(); if (JSON.stringify(before) !== JSON.stringify(snapshot())) throw new Error("changed");
        return { ...prior, kind: "non-test", executable: "node", binding: "service-main", family: "none", reason: "none" };
    } catch { return { ...prior, kind: "blocked", binding: "none", family: "none", reason: "identity-unavailable" }; }
}

function producerNamespaceProgram(): string {
    // Trusted source only; the sole argument contains bounded numeric identity,
    // a cmdline digest and the reviewed version, never argv/cwd/environment.
    return `"use strict";const fs=require("node:fs"),path=require("node:path"),{createHash}=require("node:crypto");
const deadline=Date.now()+3000;
const readFileSync=(file,encoding)=>{if(Date.now()>deadline)throw Error("deadline");const fd=fs.openSync(file,"r");try{const bytes=Buffer.alloc(65537);let size=0,count;while((count=fs.readSync(fd,bytes,size,bytes.length-size,null))>0){size+=count;if(size>=bytes.length)throw Error("size");}return bytes.subarray(0,size).toString(encoding);}finally{fs.closeSync(fd);}};
const realpathSync=fs.realpathSync,readlinkSync=fs.readlinkSync;
${producerPlaywrightEntry.toString()}
${producerPlaywrightInvocation.toString()}
${producerNodeInvocation.toString()}
${producerNamespaceClassify.toString()}
${producerClosedStackServices.toString()}
${producerNamespaceOpaqueMain.toString()}
try{const input=JSON.parse(process.argv[1]);const result=producerNamespaceClassify(input,path,readFileSync,readlinkSync,realpathSync,createHash);const final=producerNamespaceOpaqueMain(input,result,path,readFileSync,readlinkSync,realpathSync,createHash);process.stdout.write(JSON.stringify(final));}catch{process.stdout.write("{}");}`;
}
function producerNamespaceOutput(raw: string, input: ProducerNamespaceInput): ProducerNamespaceOutput {
    const fail = () => { throw new Error("P-E5 family=node reason=namespace-output-unverified"); };
    try {
        if (Buffer.byteLength(raw, "utf8") > 2048) return fail();
        const value = JSON.parse(raw);
        if (!value || JSON.stringify(Object.keys(value).sort()) !== JSON.stringify(["binding", "executable", "family", "kind", "parent", "pid", "reason", "started"])) return fail();
        if (value.pid !== input.pid || value.parent !== input.parent || value.started !== input.started
            || !["blocked", "test", "non-test", "non-node"].includes(value.kind) || !["unknown", "node", "non-node"].includes(value.executable)
            || !["none", "canonical-cli", "pinned-cli", "ordinary-script", "service-main", "non-node"].includes(value.binding)
            || !["none", "playwright", "@playwright/test"].includes(value.family) || !["none", "identity-unavailable", "opaque-node"].includes(value.reason)) return fail();
        if (value.kind === "blocked" ? value.binding !== "none" || value.family !== "none" || value.reason === "none"
            : value.reason !== "none" || value.kind === "non-node" && (value.executable !== "non-node" || value.binding !== "non-node" || value.family !== "none")
                || value.kind !== "non-node" && value.executable !== "node"
                || value.kind === "test" && (!["canonical-cli", "pinned-cli"].includes(value.binding) || value.family === "none")
                || value.kind === "non-test" && (!["pinned-cli", "ordinary-script", "service-main"].includes(value.binding)
                    || ["ordinary-script", "service-main"].includes(value.binding) && value.family !== "none" || value.binding === "pinned-cli" && value.family === "none"
                    || value.binding === "service-main" && (input.serviceMain !== true || input.pid !== 1 || input.parent !== 0 || !producerClosedStackServices().some(service => service.key === input.service)))) return fail();
        return value;
    } catch { return fail(); }
}

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
    const installedCli = producerPlaywrightEntry(path.resolve("node_modules/@playwright/test/cli.js"));
    if (!installedCli) throw new Error("P-E5 family=playwright reason=installed-cli-unverified");
    const browserRuntime = await import("../../../scripts/ci/browser-runtime.mjs");
    const exactBrowserLauncher = (candidate: number, args: readonly string[]) => {
        const owner = browserRuntime.assertHostedRunner();
        const receipt = JSON.parse(readFileSync(path.join(process.env.RUNNER_TEMP!, `browser-runtime-${process.env.GITHUB_JOB}.json`), "utf8"));
        const inspected = JSON.parse(execFileSync("docker", ["inspect", receipt.containerId], { encoding: "utf8", timeout: 15_000, maxBuffer: 1_000_000 }))[0];
        browserRuntime.validateBrowserReceipt(receipt, owner, inspected);
        const configured = browserRuntime.browserContainerArgs(owner);
        const command = configured.slice(configured.indexOf(browserRuntime.PLAYWRIGHT_IMAGE) + 1);
        const top = execFileSync("docker", ["top", receipt.containerId, "-eo", "pid,ppid"], { encoding: "utf8", timeout: 15_000, maxBuffer: 1_000_000 });
        const launcher = producerBrowserLauncherPid(inspected, command, top,
            pid => readFileSync(`/proc/${pid}/status`, "utf8"), pid => readFileSync(`/proc/${pid}/stat`, "utf8"), args);
        return launcher === candidate;
    };
    const inspectBrowserMember = (candidate: number, args: readonly string[], cmdlineSha256: string): ProducerNamespaceOutput => {
        let stage = "membership-unverified";
        try {
            const owner = browserRuntime.assertHostedRunner();
            const receipt = JSON.parse(readFileSync(path.join(process.env.RUNNER_TEMP!, `browser-runtime-${process.env.GITHUB_JOB}.json`), "utf8"));
            if (!/^[a-f0-9]{64}$/.test(receipt.containerId ?? "") || receipt.owner !== owner || receipt.image !== browserRuntime.PLAYWRIGHT_IMAGE) throw new Error("receipt");
            const configured = browserRuntime.browserContainerArgs(owner), command = configured.slice(configured.indexOf(browserRuntime.PLAYWRIGHT_IMAGE) + 1);
            const mapping = () => {
                const inspected = JSON.parse(execFileSync("docker", ["inspect", receipt.containerId], { encoding: "utf8", timeout: 5000, maxBuffer: 1_000_000, stdio: ["ignore", "pipe", "ignore"] }))[0];
                browserRuntime.validateBrowserReceipt(receipt, owner, inspected);
                const top = execFileSync("docker", ["top", receipt.containerId, "-eo", "pid,ppid"], { encoding: "utf8", timeout: 5000, maxBuffer: 65536, stdio: ["ignore", "pipe", "ignore"] });
                return producerBrowserMemberMapping(inspected, command, top, pid => readFileSync(`/proc/${pid}/status`, "utf8"), pid => readFileSync(`/proc/${pid}/stat`, "utf8"), args, candidate);
            };
            const before = mapping(), input: ProducerNamespaceInput = { ...before, cmdlineSha256, version: browserRuntime.PLAYWRIGHT_VERSION };
            stage = "member-read-unavailable";
            const raw = execFileSync("docker", ["exec", receipt.containerId, "node", "-e", producerNamespaceProgram(), JSON.stringify(input)], { encoding: "utf8", timeout: 5000, maxBuffer: 2048, stdio: ["ignore", "pipe", "ignore"] });
            const result = producerNamespaceOutput(raw, input);
            stage = "member-instance-changed";
            if (JSON.stringify(before) !== JSON.stringify(mapping()) || createHash("sha256").update(readFileSync(`/proc/${candidate}/cmdline`)).digest("hex") !== cmdlineSha256) throw new Error("changed");
            return result;
        } catch (error) {
            const reported = (error as { producerNamespaceStage?: string }).producerNamespaceStage;
            const safeStage = ["nonmember", "parent-or-namespace-unverified", "parent-unverified", "instance-changed", "mapping-unverified"].includes(reported ?? "") ? reported : stage;
            throw Object.assign(new Error("P-E5 family=node reason=namespace-inspection-unverified"), { producerNamespaceStage: safeStage });
        } // Never expose Docker/helper stderr, argv or paths.
    };
    const inspectClosedStackMember = (candidate: number, args: readonly string[], cmdlineSha256: string): ProducerNamespaceOutput => {
        let stage = "closed-service-unverified";
        try {
            const config = readFileSync("supabase/config.toml", "utf8");
            const docker = (argv: readonly string[], limit = 1_000_000) => execFileSync("docker", [...argv], { encoding: "utf8", timeout: 5000, maxBuffer: limit, stdio: ["ignore", "pipe", "ignore"] });
            for (const service of producerClosedStackServices()) {
                if (!producerClosedServiceEnabled(service, config)) continue;
                const mapping = () => {
                    const [db, gateway] = JSON.parse(docker(["inspect", stack.db.Id, stack.gateway.Id]));
                    runtime.validateStackIdentity({ ...stack, db, gateway, now: Date.now() });
                    if (db.Id !== stack.db.Id || gateway.Id !== stack.gateway.Id) throw new Error("stack");
                    const inspected = JSON.parse(docker(["inspect", service.name.slice(1)]))[0] as ProducerServiceContainer;
                    const refs = [`supabase/${service.repository}:${service.tag}`, `public.ecr.aws/supabase/${service.repository}:${service.tag}`, `ghcr.io/supabase/${service.repository}:${service.tag}`];
                    if (!refs.includes(inspected.Config?.Image ?? "")) throw new Error("reference");
                    const byRef = JSON.parse(docker(["image", "inspect", inspected.Config!.Image!]))[0];
                    if (!/^sha256:[a-f0-9]{64}$/.test(byRef.Id ?? "") || byRef.Id !== inspected.Image) throw new Error("image");
                    const byId = JSON.parse(docker(["image", "inspect", byRef.Id]))[0];
                    producerValidateClosedService(service, config, inspected, byRef, byId, db, gateway, stack.checkoutTime, Date.now());
                    const top = docker(["top", inspected.Id!, "-eo", "pid,ppid"], 65536);
                    const member = producerNamespaceMemberMapping(inspected, top, pid => readFileSync(`/proc/${pid}/status`, "utf8"), pid => readFileSync(`/proc/${pid}/stat`, "utf8"), candidate);
                    return { container: inspected.Id!, image: inspected.Image!, mainPid: inspected.State!.Pid!, member };
                };
                let before: ReturnType<typeof mapping>;
                try { before = mapping(); }
                catch (error) { if ((error as { producerNamespaceStage?: string }).producerNamespaceStage === "nonmember") continue; throw error; }
                const input: ProducerNamespaceInput = { ...before.member, cmdlineSha256, version: browserRuntime.PLAYWRIGHT_VERSION, service: service.key,
                    serviceMain: before.mainPid === candidate && before.member.pid === 1 && before.member.parent === 0 };
                stage = "closed-member-read-unavailable";
                const raw = docker(["exec", before.container, "node", "-e", producerNamespaceProgram(), JSON.stringify(input)], 2048);
                const result = producerNamespaceOutput(raw, input);
                stage = "closed-member-instance-changed";
                if (JSON.stringify(before) !== JSON.stringify(mapping()) || createHash("sha256").update(readFileSync(`/proc/${candidate}/cmdline`)).digest("hex") !== cmdlineSha256) throw new Error("changed");
                return result;
            }
            stage = "closed-set-nonmember"; throw new Error("nonmember");
        } catch { throw Object.assign(new Error("P-E5 family=node reason=closed-service-inspection-unverified"), { producerNamespaceStage: stage }); }
    };
    const consumers: number[] = [];
    for (const entry of readdirSync("/proc").filter(value => /^\d+$/.test(value))) {
        let args: string[], cmdlineSha256: string;
        try { const raw = readFileSync(`/proc/${entry}/cmdline`); args = raw.toString("utf8").split("\0"); cmdlineSha256 = createHash("sha256").update(raw).digest("hex"); } catch { continue; }
        let invocation: ProducerPlaywrightEntry | undefined;
        let executable: ProducerExecutableKind = "unknown", executableError = "none";
        try { executable = /^(?:node|nodejs)(?: \(deleted\))?$/.test(path.basename(readlinkSync(`/proc/${entry}/exe`))) ? "node" : "non-node"; }
        catch (error) { const code = (error as NodeJS.ErrnoException).code; executableError = ["EACCES", "EPERM", "ENOENT", "ESRCH"].includes(code ?? "") ? code! : "other"; }
        try {
            invocation = producerDriverInvocation(args, () => readlinkSync(`/proc/${entry}/cwd`), producerPlaywrightEntry, executable, Number(entry) === boot.ownerPid);
        }
        catch (error) {
            const detail = error as { message?: string; producerErrorCategory?: string; producerScriptFamily?: string; producerSubcommandCategory?: string; producerResolutionBranch?: string; producerAffirmativeSignal?: string };
            const refusal = /^P-E5 family=(playwright|node) reason=([a-z-]+)$/.exec(detail.message ?? "");
            // An exact already-validated server or job-owned launcher is a
            // non-test role, never a general PID/container/title exemption.
            const testVeto = args.some(arg => /(?:^|\s)test(?:\s|$)/.test(arg));
            let roleOutcome = "not-eligible";
            if (["consumer-cwd-unavailable", "opaque-node-consumer"].includes(refusal?.[2] ?? "") && !testVeto) {
                if (Number(entry) === boot.serverPid) continue;
                try {
                    if (exactBrowserLauncher(Number(entry), args)) continue;
                    roleOutcome = "validated-launcher-pid-mismatch";
                    let inspected: ProducerNamespaceOutput;
                    try { inspected = inspectBrowserMember(Number(entry), args, cmdlineSha256); }
                    catch (error) {
                        if ((error as { producerNamespaceStage?: string }).producerNamespaceStage !== "nonmember") throw error;
                        inspected = inspectClosedStackMember(Number(entry), args, cmdlineSha256);
                    }
                    if (inspected.kind === "test") { consumers.push(Number(entry)); continue; }
                    if (inspected.kind === "non-test" || inspected.kind === "non-node") continue;
                    roleOutcome = "namespace-identity-blocked";
                }
                catch (error) {
                    const value = (error as { producerNamespaceStage?: string }).producerNamespaceStage;
                    const stage = ["nonmember", "parent-or-namespace-unverified", "parent-unverified", "instance-changed", "mapping-unverified", "membership-unverified", "member-read-unavailable", "member-instance-changed", "closed-service-unverified", "closed-set-nonmember", "closed-member-read-unavailable", "closed-member-instance-changed"].includes(value ?? "") ? value : "unverified";
                    const signal = ["kernel-node", "both", "node-launch", "playwright-entrypoint"].includes(detail.producerAffirmativeSignal ?? "") ? detail.producerAffirmativeSignal : "unverified";
                    throw new Error(`P-E5 family=node reason=browser-launcher-unverified pid=${entry} errorCategory=role-proof-unavailable scriptFamily=unclassified subcommandCategory=unresolved executable=${executable} executableError=${executableError} resolutionBranch=role-proof testVeto=false roleOutcome=namespace-${stage} affirmativeSignal=${signal}`);
                }
            } else if (["consumer-cwd-unavailable", "opaque-node-consumer"].includes(refusal?.[2] ?? "") && testVeto) roleOutcome = "test-veto";
            // No argv, environment, cwd or package payload enters diagnostics.
            const family = refusal?.[1] ?? "node", reason = refusal?.[2] ?? "consumer-inspection-failed";
            const category = ["EACCES", "EPERM", "ENOENT", "ESRCH", "other"].includes(detail.producerErrorCategory ?? "") ? detail.producerErrorCategory : "none";
            const scriptFamily = detail.producerScriptFamily === "playwright-hint" ? "playwright-hint" : refusal?.[1] === "playwright" ? "playwright" : "unclassified";
            const subcommand = detail.producerSubcommandCategory === "test" ? "test" : "unresolved";
            const branch = ["unsupported-option", "non-test-script", "test-script"].includes(detail.producerResolutionBranch ?? "") ? detail.producerResolutionBranch : refusal?.[2] === "opaque-node-consumer" ? "opaque-node" : "dispatch";
            throw new Error(`P-E5 family=${family} reason=${reason} pid=${entry} errorCategory=${category} scriptFamily=${scriptFamily} subcommandCategory=${subcommand} executable=${executable} executableError=${executableError} resolutionBranch=${branch} testVeto=${testVeto} roleOutcome=${roleOutcome}`);
        }
        if (!invocation) {
            if (Number(entry) === boot.ownerPid) throw new Error("P-E5 family=playwright reason=owner-entrypoint-unclassified");
            continue;
        }
        if (Number(entry) === boot.ownerPid && invocation.canonical !== installedCli.canonical) throw new Error("P-E5 family=playwright reason=owner-cli-mismatch");
        consumers.push(Number(entry)); // Other project paths remain consumers and fail exclusivity.
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
      'columns',(select jsonb_agg(jsonb_build_object('number',a.attnum,'name',a.attname,'dropped',a.attisdropped,'aclNull',a.attacl is null,'acl',(select coalesce(jsonb_agg(to_jsonb(e) order by e.grantor,e.grantee,e.privilege_type,e.is_grantable),'[]'::jsonb) from aclexplode(a.attacl) e)) order by a.attnum) from pg_attribute a where a.attrelid=c.oid and a.attnum>0),
      'alternativeTable',exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) e where e.privilege_type='SELECT' and (e.grantee=0 or e.grantee<>u.oid and pg_has_role(u.oid,e.grantee,'MEMBER'))),
      'alternativeColumn',exists(select 1 from pg_attribute a cross join lateral aclexplode(a.attacl) e where a.attrelid=c.oid and e.privilege_type='SELECT' and (e.grantee=0 or e.grantee=u.oid or pg_has_role(u.oid,e.grantee,'MEMBER'))),
      'dependent',exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) e where e.grantor=u.oid and e.privilege_type='SELECT') or exists(select 1 from pg_attribute a cross join lateral aclexplode(a.attacl) e where a.attrelid=c.oid and e.grantor=u.oid and e.privilege_type='SELECT'),
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
            const readTerminal = observeProducerReadTerminal(page, spec.route); // Arm before route registration or action dispatch.
            let hold: Awaited<ReturnType<typeof holdNextProducerTransport>>;
            try { hold = await holdNextProducerTransport(page, spec.route, "refresh", readTerminal.bind); }
            catch (error) { readTerminal.dispose(); throw producerReadIssue("registration", error); }
            const releaseAndSettleRead = producerReadSettlement(hold, readTerminal);
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
                const settledRead = await releaseAndSettleRead();
                if (settledRead.kind !== "finished") throw new Error("Released read did not deliver the required completed response");
                expect(settledRead.request).toBe(readRequest);
                const response = settledRead.response; expect(response).not.toBeNull();
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
                try { await writeFile(path.resolve("playwright-report/35-7-p/released-read-diagnostics.jsonl"), JSON.stringify({ table: spec.table, ...readTerminal.summary() }) + "\n", { flag: "a", mode: 0o600 }); }
                catch { const diagnosticError = new Error("Released read categorical diagnostics could not be retained"); damaged = true; cleanupError = cleanupError ? new AggregateError([cleanupError, diagnosticError], "Read cleanup/diagnostics failed") : diagnosticError; }
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
