/** Story 15.6 essential connected journeys — active acceptance scenarios.
 * Source: spec-15-6-min-dag-the-field-landing.md AC1–7; inspected TimeReportEntry,
 * TimeReportForm, time-reports.e2e.spec.ts and resource-cdp-attachment patterns.
 * Runtime coverage requires the configured production server and real fixture stack.
 * Accessible composition bindings: Min dag/Agenda/Mina jobb/Ändringar i
 * planeringen regions; my-day-booking-{id}; my-day-job-{id}; Datum date control;
 * Föregående vecka/Nästa vecka. Bind these to implemented accessible composition
 * at the production composition seam. Uppdatera/Försök igen/actions/error copy come from the spec.
 * Existing filing dialog, labels, attempt serialization and success ID are real.
 * Read interception assumes the existing Next Server Action transport on /my-day;
 * reconcile its actual serialization, never add a test-only endpoint or grant.
 *
 * playwright-utils two gates: config=true, package.json dependency absent, so the
 * mandate is NOT bound. Reuse existing resourcePage/login/SQL factory functions;
 * native route/waitForResponse are documented below. Optional utility adoption
 * belongs to a separately authorized framework task; no install/shared fixture.
 * Imports perform no DB/browser setup. Full RLS/DST/DTO matrices belong to the
 * companion suites; exhaustive visual/manual matrices remain release work.
 */
import { createHash, randomUUID } from "node:crypto";
import { open } from "node:fs/promises";
import { isDeepStrictEqual } from "node:util";
import type { CDPSession, Locator, Page, Request, Route, TestInfo } from "@playwright/test";
import playwrightPackage from "@playwright/test/package.json";
import { test, expect } from "./support/resource-cdp-attachment";
import {
  REPORT_DATE, filingAttempt, filingDialog, hydrated, signIn,
  withTimeReportBrowserFixture, type FilingAttempt, type ReportSnapshot,
  type TimeReportBrowserFixture,
} from "./support/time-reports-atdd";
import { adminQuery } from "../factories/admin-sql";
import { E09FixtureError, type E09FixtureOptions, adminInsertFacility } from "../factories/tenants";
import { SCOPE_MANIFEST } from "@/scope/manifest";
import { TENANT_CONTEXT_MESSAGES } from "@/server/auth/tenant-context";

const jobsActive = SCOPE_MANIFEST.modules.some(module => module.id === "jobs" && module.status === "active");
const bookingCard = (page: Page, id: string) => page.getByTestId(`my-day-booking-${id}`);
const agenda = (page: Page) => page.getByRole("region", { name: "Agenda", exact: true });
const ownJobs = (page: Page) => page.getByRole("region", { name: "Mina jobb", exact: true });
const notices = (page: Page) => page.getByRole("region", { name: "Ändringar i planeringen", exact: true });

async function openDay(page: Page, date = REPORT_DATE): Promise<void> {
  await page.goto("/my-day");
  const selected = page.getByLabel("Datum", { exact: true });
  await hydrated(selected);
  await selected.fill(date);
  await expect(selected).toHaveValue(date);
}

async function assertPhoneFits(page: Page): Promise<void> {
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
}

/** REL22 opt-in preliminary originals, never acceptance or a generated reference.
 * Only fixed aliases/computed presentation data leave evaluate; no DOM/text/input/network/session dumps.
 */
async function rel22Capture(page: Page, info: TestInfo, state: string, anchor: Locator): Promise<void> {
  if (process.env.E15_REL22_CAPTURE !== "1") return;
  const original = page.viewportSize();
  if (!original) throw new Error("REL22 requires a fixed original viewport.");
  const scroll = await page.evaluate(() => ({ x: window.scrollX, y: window.scrollY }));
  const focus = await page.evaluateHandle(() => document.activeElement);
  let failed = false, first: unknown;
  const retain = (error: unknown) => { if (!failed) { failed = true; first = error; } };
  try {
    for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport);
      await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
      await expect(anchor).toBeVisible();
      await anchor.scrollIntoViewIfNeeded();
      const samples = await anchor.evaluate(root => {
        type RGB = [number, number, number]; type RGBA = [number, number, number, number];
        const rgba = (value: string): RGBA | null => {
          const match = /^rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\)$/.exec(value);
          if (!match) return null;
          const c = [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] as RGBA;
          return c.every(Number.isFinite) && c.slice(0, 3).every(v => v >= 0 && v <= 255) && c[3] >= 0 && c[3] <= 1 ? c : null;
        };
        const over = (a: RGBA, b: RGB): RGB => [0, 1, 2].map(i => a[i]! * a[3] + b[i]! * (1 - a[3])) as RGB;
        const luminance = (rgb: RGB) => rgb.map(v => v / 255).map(v => v <= 0.04045 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4).reduce((sum, v, i) => sum + v * [0.2126, 0.7152, 0.0722][i]!, 0);
        const candidates = [root, ...root.querySelectorAll("h1,h2,h3,p,label,button,a,input,select,textarea,[role=status],[role=alert]")];
        const active = document.activeElement;
        if (active && root.contains(active) && !candidates.includes(active)) candidates.unshift(active);
        const visible = candidates.filter(element => { const box = element.getBoundingClientRect(), style = getComputedStyle(element); return box.width > 0 && box.height > 0 && box.bottom > 0 && box.right > 0 && box.top < innerHeight && box.left < innerWidth && style.visibility === "visible" && style.display !== "none"; });
        return { overflow: visible.length > 24, records: visible.slice(0, 24).map((element, index) => {
          const style = getComputedStyle(element), box = element.getBoundingClientRect();
          const layers: RGBA[] = []; let cursor: Element | null = element, unsupported = false, depth = 0;
          while (cursor && depth++ < 32) {
            const backing = getComputedStyle(cursor), color = rgba(backing.backgroundColor);
            if (!color || backing.backgroundImage !== "none" || Number(backing.opacity) !== 1 || backing.filter !== "none" || backing.mixBlendMode !== "normal") unsupported = true;
            if (color) layers.push(color);
            cursor = cursor.parentElement;
          }
          if (cursor) unsupported = true;
          let background: RGB | null = null;
          for (const color of layers.reverse()) {
            if (color[3] === 1) background = color.slice(0, 3) as RGB;
            else if (background) background = over(color, background);
            else if (color[3] !== 0) unsupported = true;
          }
          const foreground = rgba(style.color), rendered = foreground && background ? over(foreground, background) : null;
          const supported = !unsupported && background !== null && rendered !== null;
          const a = supported ? luminance(rendered!) : 0, b = supported ? luminance(background!) : 0;
          return { alias: `sample-${index}`, kind: element.matches("button,a,input,select,textarea") ? "control" : "text-or-surface",
            foreground, background: supported ? background : null, renderedForeground: supported ? rendered : null,
            contrastRatio: supported ? Number(((Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05)).toFixed(6)) : null,
            availability: supported ? "flat-composite-measured" : "unsupported-or-unresolved-surface",
            fontPx: Number.parseFloat(style.fontSize), fontWeight: Number.parseInt(style.fontWeight, 10) || null,
            focused: element === active, disabled: (element as HTMLButtonElement).disabled === true,
            outlineColor: rgba(style.outlineColor), outlinePx: Number.parseFloat(style.outlineWidth), focusBoundaryContrast: "unassessed",
            bounds: [box.x, box.y, box.width, box.height].map(v => Math.round(v * 100) / 100) };
        }) };
      });
      const stem = `rel22-${state}-${viewport.width}x${viewport.height}`;
      const metadata = Buffer.from(JSON.stringify({ schemaVersion: 1, evidence: "preliminary-presentation-only", state, viewport, retry: info.retry,
        method: "sRGB-relative-luminance/alpha-over-flat-opaque-ancestors", acceptance: "unassessed", samples }), "utf8");
      if (metadata.length > 32768) throw new Error("REL22 presentation record exceeds its bound.");
      const png = await page.screenshot({ fullPage: false, scale: "css" });
      if (png.length > 4 * 1024 * 1024) throw new Error("REL22 original PNG exceeds its bound.");
      await info.attach(stem, { body: png, contentType: "image/png" });
      await info.attach(stem + "-presentation", { body: metadata, contentType: "application/json" });
    }
  } catch (error) { retain(error); }
  finally {
    try { await page.setViewportSize(original); } catch (error) { retain(error); }
    try { await focus.evaluate(element => { if (!(element instanceof HTMLElement) || !element.isConnected) throw new Error("REL22 focus restoration unavailable."); element.focus({ preventScroll: true }); if (document.activeElement !== element) throw new Error("REL22 focus restoration unverified."); }); } catch (error) { retain(error); }
    try { await page.evaluate(({ x, y }) => window.scrollTo(x, y), scroll); } catch (error) { retain(error); }
    try { await focus.dispose(); } catch (error) { retain(error); }
  }
  if (failed) throw first;
}

/** E02-only exact primary observation. Existing REL22 captures stay byte-for-byte intact.
 * Computed flat-paint evidence is conditional; no raster/reference/acceptance claim.
 */
async function rel22E02SubmitCapture(page: Page, info: TestInfo, form: Locator,
  owned: NonNullable<Awaited<ReturnType<Locator["elementHandle"]>>>,
  state: "e02-submit-enabled" | "e02-submit-keyboard-focus" | "e02-submit-held-pending", onFailure: (error: unknown) => void,
  cleanupStage: (stage: string, run: () => Promise<unknown>, capMs?: number) => Promise<void>): Promise<void> {
  if (process.env.E15_REL22_CAPTURE !== "1") return;
  if (info.retry !== 0 && info.retry !== 1) throw new Error("REL22 E02 retry outside configured bound.");
  const pending = state === "e02-submit-held-pending", keyboard = state === "e02-submit-keyboard-focus";
  const label = pending ? "Sparar…" : "Rapportera tid";
  const original = page.viewportSize();
  if (!original) throw new Error("REL22 E02 fixed viewport unavailable.");
  const saved = await owned.evaluateHandle(node => {
    const ancestors: { node: Element; left: number; top: number }[] = [];
    let cursor: Element | null = node;
    while (cursor && ancestors.length < 32) {
      ancestors.push({ node: cursor, left: cursor.scrollLeft, top: cursor.scrollTop });
      cursor = cursor.parentElement;
    }
    if (cursor) throw new Error("REL22 E02 scroll ownership exceeds bound.");
    return { focus: document.activeElement, ancestors, x: scrollX, y: scrollY };
  });
  let failed = false, first: unknown;
  const retain = (error: unknown, stage: string) => {
    if (!failed) { failed = true; first = error; onFailure(error); }
    else info.annotations.push({ type: "rel22-e02-secondary", description: stage });
  };
  try {
    for (const viewport of [{ width: 360, height: 640 }, { width: 1280, height: 800 }]) {
      await page.setViewportSize(viewport);
      await expect(form.locator('button[type="submit"]')).toHaveCount(1);
      const primary = form.getByRole("button", { name: label, exact: true });
      await expect(primary).toHaveCount(1);
      await expect(primary).toHaveText(label);
      await expect(primary).toBeVisible();
      expect(await primary.evaluate((node, originalNode) => node === originalNode && node.isConnected, owned)).toBe(true);
      expect(await owned.evaluate(node => node instanceof HTMLButtonElement && node.disabled)).toBe(pending);
      if (pending) await expect(form.getByRole("status")).toHaveText("Sparar…");
      if (keyboard) {
        // Establish a keyboard starting point, then prove the actual native Tab result.
        await form.getByLabel("Anteckning", { exact: true }).focus();
        await page.keyboard.press("Tab");
        await expect(primary).toBeFocused();
        expect(await owned.evaluate(node => node.matches(":focus-visible"))).toBe(true);
      }
      await owned.scrollIntoViewIfNeeded();
      const sample = await owned.evaluate((node, expected) => {
        type RGB = [number, number, number]; type RGBA = [number, number, number, number];
        const rgba = (value: string): RGBA | null => {
          const match = /^rgba?\(([\d.]+)[, ]+([\d.]+)[, ]+([\d.]+)(?:[, /]+([\d.]+))?\)$/.exec(value);
          if (!match) return null;
          const c = [Number(match[1]), Number(match[2]), Number(match[3]), match[4] === undefined ? 1 : Number(match[4])] as RGBA;
          return c.every(Number.isFinite) && c.slice(0, 3).every(v => v >= 0 && v <= 255) && c[3] >= 0 && c[3] <= 1 ? c : null;
        };
        const over = (a: RGBA, b: RGB): RGB => [0, 1, 2].map(i => a[i]! * a[3] + b[i]! * (1 - a[3])) as RGB;
        const luminance = (rgb: RGB) => rgb.map(v => v / 255).map(v => v <= .04045 ? v / 12.92 : ((v + .055) / 1.055) ** 2.4)
          .reduce((sum, v, i) => sum + v * [.2126, .7152, .0722][i]!, 0);
        const numeric = (value: string) => { const result = Number.parseFloat(value); return Number.isFinite(result) ? result : null; };
        const boxArray = (box: DOMRect) => [box.x, box.y, box.width, box.height].map(v => Math.round(v * 100) / 100);
        const reasons = new Set<"identity" | "label-structure" | "text-paint" | "pseudo-content" | "color-syntax" | "compositing" |
          "ancestor-bound" | "backdrop-unresolved" | "viewport-clipped" | "ancestor-clipped" | "occluded" | "rect-bound">();
        const style = getComputedStyle(node), box = node.getBoundingClientRect();
        const identity = node instanceof HTMLButtonElement && node.type === "submit" && node.isConnected;
        if (!identity) reasons.add("identity");
        const children = [...node.childNodes];
        const directText = children.length === 1 && children[0]?.nodeType === Node.TEXT_NODE && node.childElementCount === 0;
        const labelMatchesExpected = directText && children[0]?.textContent === expected;
        if (!directText || !labelMatchesExpected) reasons.add("label-structure");
        const range = document.createRange();
        if (directText) range.selectNodeContents(node);
        const allRects = directText ? [...range.getClientRects()] : [];
        if (allRects.length === 0 || allRects.length > 8) reasons.add("rect-bound");
        const rects = allRects.slice(0, 8);
        const pseudoClear = (element: Element) => ["::before", "::after"].every(pseudo => {
          const content = getComputedStyle(element, pseudo).content; return content === "none" || content === "normal";
        });
        const ownPseudoClear = pseudoClear(node);
        const color = rgba(style.color), fillValue = style.getPropertyValue("-webkit-text-fill-color");
        const fill = fillValue === "currentcolor" || fillValue === "currentColor" ? color : rgba(fillValue);
        const textStrokePx = numeric(style.getPropertyValue("-webkit-text-stroke-width"));
        const textPaintSupported = !!fill && style.textShadow === "none" && textStrokePx === 0 && style.textTransform === "none"
          && style.getPropertyValue("background-clip") !== "text" && style.getPropertyValue("-webkit-background-clip") !== "text";
        if (!textPaintSupported) reasons.add("text-paint");
        const layers: RGBA[] = []; let cursor: Element | null = node, depth = 0, minOpacity = 1;
        const frame = Math.max(0, numeric(style.outlineWidth) ?? 0) + Math.max(0, numeric(style.outlineOffset) ?? 0);
        const focused = document.activeElement === node, focusVisible = node.matches(":focus-visible");
        const margin = focused && focusVisible ? frame : 0;
        const viewportContained = box.left - margin >= 0 && box.top - margin >= 0 && box.right + margin <= innerWidth && box.bottom + margin <= innerHeight
          && rects.every(rect => rect.left >= 0 && rect.top >= 0 && rect.right <= innerWidth && rect.bottom <= innerHeight);
        if (!viewportContained) reasons.add("viewport-clipped");
        while (cursor && depth++ < 32) {
          const backing = getComputedStyle(cursor), background = rgba(backing.backgroundColor), opacity = Number(backing.opacity);
          minOpacity = Math.min(minOpacity, opacity);
          if (!background) reasons.add("color-syntax"); else layers.push(background);
          if (!Number.isFinite(opacity) || opacity !== 1 || backing.backgroundImage !== "none" || backing.filter !== "none"
            || backing.getPropertyValue("backdrop-filter") !== "none" || backing.mixBlendMode !== "normal"
            || backing.clipPath !== "none" || backing.getPropertyValue("mask-image") !== "none" || backing.transform !== "none") reasons.add("compositing");
          if (!pseudoClear(cursor)) reasons.add("pseudo-content");
          if (cursor !== node) {
            const clip = cursor.getBoundingClientRect();
            const clipsX = /^(hidden|clip|scroll|auto)$/.test(backing.overflowX), clipsY = /^(hidden|clip|scroll|auto)$/.test(backing.overflowY);
            if ((clipsX && (box.left - margin < clip.left || box.right + margin > clip.right))
              || (clipsY && (box.top - margin < clip.top || box.bottom + margin > clip.bottom))) reasons.add("ancestor-clipped");
          }
          cursor = cursor.parentElement;
        }
        if (cursor) reasons.add("ancestor-bound");
        if (!ownPseudoClear) reasons.add("pseudo-content");
        // Bounded hit tests qualify the CSS association; they do not certify raster glyphs.
        const hitBoxes = [box, ...rects];
        for (const rect of hitBoxes) {
          for (const [fx, fy] of [[.1, .1], [.9, .1], [.5, .5], [.1, .9], [.9, .9]]) {
            const hit = document.elementFromPoint(rect.left + rect.width * fx!, rect.top + rect.height * fy!);
            if (hit !== node && (!hit || !node.contains(hit))) reasons.add("occluded");
          }
        }
        let background: RGB | null = null;
        for (const layer of layers.reverse()) {
          if (layer[3] === 1) background = layer.slice(0, 3) as RGB;
          else if (background) background = over(layer, background);
          else if (layer[3] !== 0) reasons.add("backdrop-unresolved");
        }
        if (!background) reasons.add("backdrop-unresolved");
        const supported = reasons.size === 0 && fill !== null && background !== null;
        const rendered = supported ? over(fill!, background!) : null;
        const a = rendered ? luminance(rendered) : 0, b = supported ? luminance(background!) : 0;
        const ratio = supported ? Number(((Math.max(a, b) + .05) / (Math.min(a, b) + .05)).toFixed(6)) : null;
        const outlineStyle = ["none", "solid", "dashed", "dotted", "double"].includes(style.outlineStyle) ? style.outlineStyle : "other";
        return { alias: "e02-primary-submit", sameControlIdentity: identity, typeSubmit: identity, labelMatchesExpected,
          nativeDisabled: node instanceof HTMLButtonElement && node.disabled, focused, matchesFocusVisible: focusVisible,
          visible: box.width > 0 && box.height > 0 && style.visibility === "visible" && style.display !== "none",
          directTextSupported: directText, pseudoSupported: ownPseudoClear, textFillSupported: textPaintSupported,
          foreground: color, textFill: fill, background: supported ? background : null, renderedForeground: rendered,
          contrastRatio: ratio, conditionalTextThresholdMet: ratio === null ? null : ratio >= 4.5,
          fontPx: numeric(style.fontSize), fontWeight: numeric(style.fontWeight), interFamilyPresent: /\bInter\b/.test(style.fontFamily),
          ownOpacity: numeric(style.opacity), minimumAncestorOpacity: Number.isFinite(minOpacity) ? minOpacity : null,
          textStrokePx, minHeightPx: numeric(style.minHeight), radiusPx: numeric(style.borderTopLeftRadius),
          outline: { style: outlineStyle, color: rgba(style.outlineColor), widthPx: numeric(style.outlineWidth), offsetPx: numeric(style.outlineOffset),
            boundaryContrastRatio: null, availability: "UNKNOWN", reason: "outer-backing-unqualified" },
          bounds: boxArray(box), textRects: rects.map(boxArray), viewportContained,
          availability: supported ? "conditional-flat-composite" : "UNKNOWN", reasons: [...reasons],
          clippingAndOcclusion: "bounded-css-and-hit-test-association", rasterGlyphPaint: "unassessed" };
      }, label);
      expect(sample.sameControlIdentity && sample.typeSubmit && sample.labelMatchesExpected && sample.visible).toBe(true);
      expect(sample.nativeDisabled).toBe(pending);
      if (keyboard) expect(sample.focused && sample.matchesFocusVisible).toBe(true);
      const stem = `rel22-${state}-${viewport.width}x${viewport.height}`;
      const metadata = Buffer.from(JSON.stringify({ schemaVersion: 1, evidence: "preliminary-exact-submit", state, viewport, retry: info.retry,
        method: "sRGB-relative-luminance/alpha-over-flat-opaque-ancestors", acceptance: "unassessed", sample }), "utf8");
      if (metadata.length > 32768) throw new Error("REL22 E02 exact-submit record exceeds bound.");
      const png = await page.screenshot({ fullPage: false, scale: "css" });
      if (png.length > 4 * 1024 * 1024) throw new Error("REL22 E02 original PNG exceeds retained bound.");
      await info.attach(stem, { body: png, contentType: "image/png" });
      await info.attach(stem + "-submit-measurement", { body: metadata, contentType: "application/json" });
    }
  } catch (error) { retain(error, "observation"); }
  finally {
    // Four independent stages share at most the existing 15s operation allowance.
    // A deadline classifies an unsettled operation; it never cancels or closes it.
    const stageCap = 15000 / 4;
    try { await cleanupStage("viewport-restore", () => page.setViewportSize(original), stageCap); } catch (error) { retain(error, "viewport-restore"); }
    try { await cleanupStage("focus-restore", () => saved.evaluate((snapshot, disabled) => {
      const focus = snapshot.focus;
      if (!(focus instanceof HTMLElement) || !focus.isConnected) throw new Error("REL22 E02 focus restoration unavailable.");
      if (document.activeElement !== focus) {
        if (disabled || focus.matches(":disabled")) throw new Error("REL22 E02 pending focus restoration unqualified.");
        focus.focus({ preventScroll: true });
      }
      if (document.activeElement !== focus) throw new Error("REL22 E02 focus restoration unverified.");
    }, pending), stageCap); } catch (error) { retain(error, "focus-restore"); }
    try { await cleanupStage("scroll-restore", () => saved.evaluate(snapshot => {
      for (const entry of snapshot.ancestors) {
        if (!entry.node.isConnected) throw new Error("REL22 E02 scroll restoration unavailable.");
        entry.node.scrollLeft = entry.left; entry.node.scrollTop = entry.top;
      }
      window.scrollTo(snapshot.x, snapshot.y);
      if (window.scrollX !== snapshot.x || window.scrollY !== snapshot.y
        || snapshot.ancestors.some(entry => entry.node.scrollLeft !== entry.left || entry.node.scrollTop !== entry.top)) {
        throw new Error("REL22 E02 scroll restoration unverified.");
      }
    }), stageCap); } catch (error) { retain(error, "scroll-restore"); }
    try { await cleanupStage("snapshot-dispose", () => saved.dispose(), stageCap); } catch (error) { retain(error, "snapshot-dispose"); }
  }
  if (failed) throw first;
}

/** E02-only whole-target phone originals. No activation, DOM/style changes or new filing.
 * Geometry/hit tests qualify framing only; paint, reference and acceptance remain unassessed.
 */
async function rel22E02PhoneTargetCapture(page: Page, info: TestInfo, target: Locator,
  state: "e02-unknown-outcome-phone-target-whole" | "e02-server-confirmed-phone-target-whole",
  onFailure: (error: unknown) => void,
  cleanupStage: (stage: string, run: () => Promise<unknown>, capMs?: number) => Promise<void>): Promise<void> {
  if (process.env.E15_REL22_CAPTURE !== "1") return;
  if (info.retry !== 0 && info.retry !== 1) throw new Error("REL22 E02 phone retry outside configured bound.");
  const original = page.viewportSize();
  if (!original) throw new Error("REL22 E02 phone fixed viewport unavailable.");
  await expect(target).toHaveCount(1);
  const unknown = state === "e02-unknown-outcome-phone-target-whole";
  const saved = await target.evaluateHandle((node, retry) => {
    const context = node.parentElement, dialog = node.closest('[role="dialog"]');
    const header = dialog?.firstElementChild;
    const identity = retry ? node instanceof HTMLButtonElement && node.type === "button"
      && node.textContent === "Försök igen med samma försök"
      && context?.firstElementChild?.textContent === "Svaret saknas. Uppgifterna är låsta tills samma försök har bekräftats."
      : node.getAttribute("data-testid") === "time-report-submit-status" && node.textContent === "Rapporterad"
        && context?.getAttribute("role") === "status";
    if (!identity || !context || !dialog || !header || header.contains(node) || !header.querySelector("h2")) {
      throw new Error("REL22 E02 phone target/context identity unavailable.");
    }
    const ancestors: { node: Element; left: number; top: number }[] = [];
    let cursor: Element | null = node;
    while (cursor && ancestors.length < 32) {
      ancestors.push({ node: cursor, left: cursor.scrollLeft, top: cursor.scrollTop });
      cursor = cursor.parentElement;
    }
    if (cursor) throw new Error("REL22 E02 phone ancestor ownership exceeds bound.");
    return { node, context, dialog, header, ancestors, focus: document.activeElement, x: scrollX, y: scrollY };
  }, unknown);
  let failed = false, first: unknown;
  const retain = (error: unknown, stage: string) => {
    if (!failed) { failed = true; first = error; onFailure(error); }
    else info.annotations.push({ type: "rel22-e02-secondary", description: stage });
  };
  let sample: unknown = null, png: Buffer | undefined;
  const restored = { viewport: false, focus: false, scroll: false, disposed: false };
  try {
    await page.setViewportSize({ width: 360, height: 640 });
    // Only ordinary scrolling of the already owned ancestry. The actual header and
    // client scrollports determine the exposure area; no assumed pixel correction.
    await saved.evaluate(snapshot => {
      const { context, header } = snapshot;
      context.scrollIntoView({ block: "center", inline: "nearest", behavior: "instant" });
      for (let pass = 0; pass < 2; pass++) {
        for (const entry of snapshot.ancestors) {
          const port = entry.node, style = getComputedStyle(port), box = port.getBoundingClientRect();
          const rect = context.getBoundingClientRect(), head = header.getBoundingClientRect();
          const left = Math.max(0, box.left + port.clientLeft), right = Math.min(innerWidth, box.left + port.clientLeft + port.clientWidth);
          let top = Math.max(0, box.top + port.clientTop);
          const bottom = Math.min(innerHeight, box.top + port.clientTop + port.clientHeight);
          if (!port.contains(header) && head.right > left && head.left < right && head.bottom > top && head.top < bottom) top = head.bottom;
          if (/^(auto|scroll)$/.test(style.overflowY) && port.scrollHeight > port.clientHeight && bottom > top) {
            port.scrollTop += (rect.top + rect.bottom - top - bottom) / 2;
          }
          if (/^(auto|scroll)$/.test(style.overflowX) && port.scrollWidth > port.clientWidth && right > left) {
            port.scrollLeft += (rect.left + rect.right - left - right) / 2;
          }
        }
      }
    });
    await page.evaluate(() => new Promise<void>(done => requestAnimationFrame(() => requestAnimationFrame(() => done()))));
    const measurement = await saved.evaluate(snapshot => {
      const { node, context, header, dialog } = snapshot;
      const rounded = (value: number) => Math.round(value * 100) / 100;
      const bounds = (box: DOMRect) => [box.x, box.y, box.width, box.height].map(rounded);
      const reasons = new Set<string>();
      const box = context.getBoundingClientRect(), targetBox = node.getBoundingClientRect(), head = header.getBoundingClientRect();
      const viewport = visualViewport;
      if (innerWidth !== 360 || innerHeight !== 640 || !viewport || viewport.scale !== 1 || viewport.offsetLeft !== 0
        || viewport.offsetTop !== 0 || viewport.width !== 360 || viewport.height !== 640) reasons.add("viewport-mapping");
      if (!node.isConnected || !context.isConnected || !header.isConnected || !dialog.contains(node)) reasons.add("identity");
      if (document.activeElement !== snapshot.focus) reasons.add("focus-changed");
      let left = 0, top = 0, right = innerWidth, bottom = innerHeight;
      const ports: { alias: string; bounds: number[]; clipX: boolean; clipY: boolean; scroll: number[] }[] = [];
      for (const [index, entry] of snapshot.ancestors.entries()) {
        const ancestor = entry.node, style = getComputedStyle(ancestor), rect = ancestor.getBoundingClientRect();
        if (style.clipPath !== "none" || style.getPropertyValue("mask-image") !== "none" || style.transform !== "none"
          || /paint|strict|content/.test(style.contain)) reasons.add("unsupported-clipping");
        if (style.visibility !== "visible" || style.display === "none" || Number(style.opacity) !== 1) reasons.add("ancestor-visibility");
        if (ancestor === node || ancestor === context) continue;
        const clipX = /^(auto|scroll|hidden|clip)$/.test(style.overflowX), clipY = /^(auto|scroll|hidden|clip)$/.test(style.overflowY);
        const portLeft = rect.left + ancestor.clientLeft, portTop = rect.top + ancestor.clientTop;
        if (clipX) { left = Math.max(left, portLeft); right = Math.min(right, portLeft + ancestor.clientWidth); }
        if (clipY) { top = Math.max(top, portTop); bottom = Math.min(bottom, portTop + ancestor.clientHeight); }
        if (clipX || clipY) ports.push({ alias: `ancestor-${index}`, bounds: [portLeft, portTop, ancestor.clientWidth, ancestor.clientHeight].map(rounded),
          clipX, clipY, scroll: [ancestor.scrollLeft, ancestor.scrollTop].map(rounded) });
      }
      if (head.right > left && head.left < right && head.bottom > top && head.top < bottom) top = head.bottom;
      const contains = (rect: DOMRect, margin = 0) => rect.width > 0 && rect.height > 0 && rect.left - margin >= left
        && rect.top - margin >= top && rect.right + margin <= right && rect.bottom + margin <= bottom;
      if (!contains(box) || !contains(targetBox)) reasons.add("target-context-clipped");
      const targetStyle = getComputedStyle(node);
      const focusMargin = document.activeElement === node && node.matches(":focus-visible")
        ? Math.max(0, Number.parseFloat(targetStyle.outlineWidth) || 0) + Math.max(0, Number.parseFloat(targetStyle.outlineOffset) || 0) : 0;
      if (!contains(targetBox, focusMargin)) reasons.add("focus-outline-clipped");
      if (document.activeElement === node && targetStyle.boxShadow !== "none") reasons.add("focus-shadow-unqualified");
      const range = document.createRange(); range.selectNodeContents(context);
      const rects = [...range.getClientRects()];
      if (rects.length === 0 || rects.length > 32) reasons.add("context-rect-bound");
      for (const rect of rects.slice(0, 32)) if (!contains(rect)) reasons.add("context-content-clipped");
      const elements = [context, ...context.querySelectorAll("*")];
      if (elements.length > 16) reasons.add("context-element-bound");
      let hitTests = 0;
      for (const element of elements.slice(0, 16)) {
        const style = getComputedStyle(element), rect = element.getBoundingClientRect();
        if (style.display === "none" || style.visibility !== "visible" || Number(style.opacity) !== 1) reasons.add("context-visibility");
        if (rect.width <= 0 || rect.height <= 0) { reasons.add("context-empty-box"); continue; }
        for (const [fx, fy] of [[.01, .01], [.99, .01], [.5, .5], [.01, .99], [.99, .99]]) {
          const hit = document.elementFromPoint(rect.left + rect.width * fx!, rect.top + rect.height * fy!); hitTests++;
          if (!hit || (hit !== element && !element.contains(hit))) reasons.add("context-occluded");
        }
      }
      // Explicit header intersection plus bounded hit tests also covers this sheet's
      // non-sticky, non-scrolling header sibling. No whole-paint occlusion claim.
      return { alias: "e02-phone-target", sameTargetIdentity: true, bounds: bounds(targetBox), contextBounds: bounds(box),
        headerBounds: bounds(head), effectiveVisibleArea: [left, top, right - left, bottom - top].map(rounded), ports,
        contextRects: rects.slice(0, 32).map(bounds), hitTests, focusUnchanged: document.activeElement === snapshot.focus,
        focusOutlineMargin: rounded(focusMargin), viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio,
          visualWidth: viewport?.width, visualHeight: viewport?.height, scale: viewport?.scale, offsetX: viewport?.offsetLeft, offsetY: viewport?.offsetTop },
        qualifiedWholeTargetFraming: reasons.size === 0, reasons: [...reasons], rasterPaint: "unassessed", acceptance: "unassessed" };
    });
    sample = measurement;
    png = await page.screenshot({ fullPage: false, scale: "css" });
    if (png.length > 4 * 1024 * 1024) { png = undefined; throw new Error("REL22 E02 phone PNG exceeds retained bound."); }
    if (!measurement.qualifiedWholeTargetFraming) throw new Error("REL22 E02 phone whole-target framing unqualified; see bounded diagnostic measurement.");
  } catch (error) { retain(error, "phone-target-observation"); }
  finally {
    const cap = 15000 / 4;
    try { await cleanupStage("phone-viewport-restore", async () => {
      await page.setViewportSize(original); expect(page.viewportSize()).toEqual(original); restored.viewport = true;
    }, cap); } catch (error) { retain(error, "phone-viewport-restore"); }
    try { await cleanupStage("phone-focus-restore", async () => {
      await saved.evaluate(snapshot => {
        const focus = snapshot.focus;
        if (!(focus instanceof HTMLElement) || !focus.isConnected) throw new Error("REL22 E02 phone focus restoration unavailable.");
        if (document.activeElement !== focus) {
          if (focus.matches(":disabled")) throw new Error("REL22 E02 phone disabled focus restoration unqualified.");
          focus.focus({ preventScroll: true });
        }
        if (document.activeElement !== focus) throw new Error("REL22 E02 phone focus restoration unverified.");
      }); restored.focus = true;
    }, cap); } catch (error) { retain(error, "phone-focus-restore"); }
    try { await cleanupStage("phone-scroll-restore", async () => {
      await saved.evaluate(snapshot => {
        for (const entry of snapshot.ancestors) {
          if (!entry.node.isConnected) throw new Error("REL22 E02 phone scroll restoration unavailable.");
          entry.node.scrollLeft = entry.left; entry.node.scrollTop = entry.top;
        }
        window.scrollTo(snapshot.x, snapshot.y);
        if (scrollX !== snapshot.x || scrollY !== snapshot.y
          || snapshot.ancestors.some(entry => entry.node.scrollLeft !== entry.left || entry.node.scrollTop !== entry.top)) {
          throw new Error("REL22 E02 phone scroll restoration unverified.");
        }
      }); restored.scroll = true;
    }, cap); } catch (error) { retain(error, "phone-scroll-restore"); }
    try { await cleanupStage("phone-snapshot-dispose", async () => { await saved.dispose(); restored.disposed = true; }, cap); }
    catch (error) { retain(error, "phone-snapshot-dispose"); }
  }
  const stem = `rel22-${state}-360x640`;
  const metadata = Buffer.from(JSON.stringify({ schemaVersion: 1, evidence: "preliminary-phone-target-framing", state,
    viewport: { width: 360, height: 640 }, retry: info.retry, acceptance: "unassessed", sample, restored,
    outcome: failed ? "failed-or-unqualified" : "whole-target-framing-observed" }), "utf8");
  try {
    if (metadata.length > 32768) throw new Error("REL22 E02 phone measurement exceeds retained bound.");
    if (png) await info.attach(stem, { body: png, contentType: "image/png" });
    await info.attach(stem + "-framing-measurement", { body: metadata, contentType: "application/json" });
  } catch (error) { retain(error, "phone-target-attachments"); }
  if (failed) throw first;
}

type MyDayFixture = TimeReportBrowserFixture & { jobless: string; shared: string; allDay: string; facilityId: string; address: string };
/** Only fresh factory-owned tenants/rows. Outer fixture owns report/audit/job
 * cleanup; this local extension owns its three bookings, facility and notifications.
 * Existing immutable booking metadata/SQL seed shape is reused, never report INSERT.
 */
async function withMyDayFixture(run: (f: MyDayFixture) => Promise<void>, options?: E09FixtureOptions): Promise<void> {
  await withTimeReportBrowserFixture(async f => {
    const tenant = f.fx.base.tenantA.id;
    const ids = [randomUUID(), randomUUID(), randomUUID()];
    const [booking] = await adminQuery<{ customer_id: string }>(
      "select customer_id from public.bookings where tenant_id=$1 and id=$2", [tenant, f.ownBooking]);
    const facilityId = await adminInsertFacility({ tenant_id: tenant, customer_id: booking.customer_id, name: `${f.marker} site` });
    const address = "Ångvägen 12 & gården, 123 45 Stockholm";
    try {
      await adminQuery("update public.facilities set address_line1=$3,postal_code='123 45',city='Stockholm' where tenant_id=$1 and id=$2",
        [tenant, facilityId, "Ångvägen 12 & gården"]);
      await adminQuery("update public.bookings set facility_id=$3 where tenant_id=$1 and id=$2", [tenant, f.ownBooking, facilityId]);
      for (const [index, id] of ids.entries()) {
        await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,job_id,all_day,
          create_command_id,create_payload_digest,create_result)
          values($1,$2,$3,$4,$5,$6,$7,$8,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`,
        [id, tenant, index === 2 ? "2026-10-14T22:00:00Z" : `${REPORT_DATE}T${index === 0 ? "10" : "04"}:00:00Z`,
          index === 2 ? "2026-10-15T22:00:00Z" : `${REPORT_DATE}T${index === 0 ? "11" : "05"}:00:00Z`,
          `${f.marker} ${index === 0 ? "jobless" : index === 1 ? "shared" : "all-day"}`, index === 1 ? f.job.id : null, index === 2, randomUUID()]);
        await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)",
          [tenant, id, f.fx.ownProfile.id]);
      }
      await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)",
        [tenant, ids[1], f.fx.coworkerProfile.id]);
      await run({ ...f, jobless: ids[0], shared: ids[1], allDay: ids[2], facilityId, address });
    } finally {
      await adminQuery("delete from public.notifications where tenant_id=$1", [tenant]);
      await adminQuery("delete from public.booking_assignees where tenant_id=$1 and booking_id=any($2::uuid[])", [tenant, ids]);
      await adminQuery("delete from public.bookings where tenant_id=$1 and id=any($2::uuid[])", [tenant, ids]);
      await adminQuery("update public.bookings set facility_id=null where tenant_id=$1 and id=$2", [tenant, f.ownBooking]);
      await adminQuery("delete from public.facilities where tenant_id=$1 and id=$2", [tenant, facilityId]);
    }
  }, options);
}

/** Existing Next action identity + existing ReportInput, extended to its new host.
 * filingAttempt is inspected source, not a fabricated /api/... contract.
 */
function isFiling(request: Request, marker: string): boolean {
  return request.method() === "POST" && !!request.headers()["next-action"]
    && new URL(request.url()).pathname === "/my-day" && (request.postData() ?? "").includes(marker);
}
function isDayRead(request: Request): boolean {
  return request.method() === "POST" && !!request.headers()["next-action"]
    && new URL(request.url()).pathname === "/my-day"
    && !(request.postData() ?? "").includes('"attemptId"');
}

async function keyboardActivate(page: Page, control: Locator): Promise<void> {
  await control.focus();
  await expect(control).toBeFocused();
  await page.keyboard.press("Enter");
}

function barrier<T>() {
  let resolve!: (value: T) => void, reject!: (error: unknown) => void;
  const promise = new Promise<T>((done, fail) => { resolve = done; reject = fail; });
  void promise.catch(() => undefined);
  return { promise, resolve, reject };
}

async function nativeDrag(page: Page, touch: CDPSession, origin: Locator, dx: number, dy: number): Promise<void> {
  await page.evaluate(() => window.scrollTo(0, 0));
  const bounds = await origin.boundingBox();
  expect(bounds).not.toBeNull();
  const x = bounds!.x + bounds!.width / 2, y = bounds!.y + bounds!.height / 2;
  expect(x + dx).toBeGreaterThan(0); expect(x + dx).toBeLessThan(360);
  expect(y + dy).toBeGreaterThan(0); expect(y + dy).toBeLessThan(640);
  await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
  for (const fraction of [0.15, 0.35, 0.6, 0.8, 1]) await touch.send("Input.dispatchTouchEvent", {
    type: "touchMove", touchPoints: [{ x: x + dx * fraction, y: y + dy * fraction, id: 1 }],
  });
  await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
}

test.describe("15.6 Min dag essential production-server journeys", () => {
  test("[P0] 15.6-E01 pure Montör lands on today's phone agenda, ordered own cards, explicit map click and same-job workspace", async ({ resourcePage: page }, testInfo) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      const mapRequests: string[] = [];
      const mapTraffic = /(?:google\.[^/]+\/maps|maps\.google|maps\.apple|openstreetmap|geocod)/i;
      // External map requests must result from a deliberate link click only.
      page.context().on("request", request => { if (mapTraffic.test(request.url())) mapRequests.push(request.url()); });
      await signIn(page, f.fx.users.montor);
      await expect(page).toHaveURL(/\/my-day(?:\?|$)/);
      const selected = page.getByLabel("Datum", { exact: true });
      await hydrated(selected);
      await expect(selected).toHaveValue(new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date()));
      await page.getByRole("button", { name: "Öppna meny", exact: true }).click();
      await expect(page.getByRole("link", { name: "Min dag", exact: true }).filter({ visible: true })).toBeVisible();
      await page.keyboard.press("Escape");
      await selected.fill(REPORT_DATE);
      for (const id of [f.shared, f.ownBooking, f.jobless]) await expect(bookingCard(page, id)).toHaveCount(1);
      await expect(bookingCard(page, f.peerBooking)).toHaveCount(0);
      await expect(agenda(page).getByRole("article")).toHaveCount(3);
      const order = await agenda(page).getByRole("article").evaluateAll(cards => cards.map(card => card.getAttribute("data-testid")));
      expect(order).toEqual([f.shared, f.ownBooking, f.jobless].map(id => `my-day-booking-${id}`));
      const own = bookingCard(page, f.ownBooking);
      await expect(own).toContainText("08:00");
      await expect(own).toContainText("10:00");
      if (jobsActive) await expect(own).toContainText(f.job.title);
      await expect(own).toContainText(f.marker); // Customer display_name from the existing fixture.
      const map = own.getByRole("link", { name: /Ångvägen/ });
      await expect(map).toBeVisible();
      const href = await map.getAttribute("href");
      expect(href).not.toBeNull();
      const destination = new URL(href!);
      expect(destination.protocol).toBe("https:");
      expect([...destination.searchParams.values()].join(" ")).toContain("Ångvägen 12 & gården");
      expect([...destination.searchParams.values()].join(" ")).toContain("Stockholm");
      expect(mapRequests).toEqual([]);
      // Block the outbound navigation; the gesture and encoded href are sufficient
      // essential smoke, with no provider call needed for this acceptance test.
      await expect(bookingCard(page, f.jobless).getByRole("link", { name: "Öppna jobbet", exact: true })).toHaveCount(0);
      await expect(bookingCard(page, f.jobless).getByRole("link", { name: /karta|adress/i })).toHaveCount(0);
      await assertPhoneFits(page);
      await rel22Capture(page, testInfo, "e01-populated-day", agenda(page));
      if (jobsActive) {
        const open = own.getByRole("link", { name: "Öppna jobbet", exact: true });
        await expect(open).toHaveAttribute("href", `/jobs/${f.job.id}`);
        await open.click();
        await expect(page).toHaveURL(new RegExp(`/jobs/${f.job.id}(?:\\?|$)`));
        await expect(page.getByTestId("job-workspace-header")).toContainText(f.job.title);
        await openDay(page);
      }
      await page.context().route(mapTraffic, route => route.abort("blockedbyclient"));
      const explicitMapRequest = page.context().waitForEvent("request", request => mapTraffic.test(request.url()));
      await bookingCard(page, f.ownBooking).getByRole("link", { name: /Ångvägen/ }).click({ noWaitAfter: true });
      expect((await explicitMapRequest).url()).toBe(href);
      expect(mapRequests).toHaveLength(1);
    });
  });

  test("[P0] 15.6-E02 exact inline prefill, unknown committed response, frozen same attempt and one durable own report", async ({ resourcePage: page }, testInfo) => {
    // E02-body elapsed bound only; fixture time may precede this callback clock.
    const captureStarted = process.env.E15_REL22_CAPTURE === "1" ? performance.now() : undefined;
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      const reportBooking = jobsActive ? f.ownBooking : f.jobless;
      const reportJob = jobsActive ? f.job.id : null;
      const reportStart = jobsActive ? "08:00" : "12:00";
      const reportEnd = jobsActive ? "10:00" : "13:00";
      const reportMinutes = jobsActive ? 120 : 60;
      const before = await f.snapshot();
      const attempts: FilingAttempt[] = [];
      let committed!: (snapshot: ReportSnapshot) => void;
      let rejectCommit!: (error: unknown) => void;
      const commit = new Promise<ReportSnapshot>((resolve, reject) => { committed = resolve; rejectCommit = reject; });
      void commit.catch(() => undefined);
      // playwright-utils deviation: dependency absent; real action fetch commits,
      // SQL proves it, then abort loses only the response. No fulfilled fake success.
      const observation = captureStarted === undefined ? undefined : (() => {
        const entered = barrier<void>(), release = barrier<void>(), failure = barrier<never>();
        let failed = false, first: unknown;
        const retain = (error: unknown, stage: string) => {
          release.resolve(undefined); // Every failure, including a deadline, releases the same owned gate.
          if (!failed) { failed = true; first = error; failure.reject(error); }
          else testInfo.annotations.push({ type: "rel22-e02-secondary", description: stage });
        };
        const within = async <T,>(work: Promise<T>, stage: string, capMs = 15000): Promise<T> => {
          // Observe rejection immediately; an eventual failure remains consequential after a deadline.
          void work.catch(error => retain(error, stage));
          const ms = Math.min(15000, capMs, testInfo.timeout - (performance.now() - captureStarted));
          let timer: ReturnType<typeof setTimeout> | undefined;
          try {
            if (ms <= 0) throw new Error("REL22 E02 body operation budget exhausted.");
            return await Promise.race([work, new Promise<never>((_, reject) => {
              timer = setTimeout(() => {
                const error = new Error("REL22 E02 bounded operation did not settle.");
                retain(error, stage); reject(error);
              }, ms);
            })]);
          } catch (error) { retain(error, stage); throw error; }
          finally { if (timer !== undefined) clearTimeout(timer); }
        };
        const cleanupWork = new Set<{ stage: string; run: () => Promise<unknown>; work?: Promise<unknown>;
          settlement: "pending" | "fulfilled" | "rejected" }>();
        const cleanupStage = async (stage: string, run: () => Promise<unknown>, capMs = 15000): Promise<void> => {
          // Keep the owned closure/handle and native promise until actual fulfillment.
          // Rejection or a deadline preserves truthful failed/unsettled custody.
          const custody: { stage: string; run: () => Promise<unknown>; work?: Promise<unknown>;
            settlement: "pending" | "fulfilled" | "rejected" } = { stage, run, settlement: "pending" };
          cleanupWork.add(custody);
          try {
            custody.work = run(); // Invoke every later stage even if the body budget is exhausted.
            void custody.work.then(() => { custody.settlement = "fulfilled"; cleanupWork.delete(custody); }, error => {
              custody.settlement = "rejected"; retain(error, stage);
            });
            await within(custody.work, stage, capMs);
          } catch (error) {
            if (!custody.work) custody.settlement = "rejected";
            retain(error, stage);
            testInfo.annotations.push({ type: "rel22-e02-cleanup-custody", description: `${stage}:${custody.settlement}` });
            throw error;
          }
        };
        return { entered, release, failure, retain, within, cleanupStage, cleanupWork, work: new Set<Promise<void>>(),
          activation: undefined as Promise<void> | undefined, capture: undefined as Promise<void> | undefined,
          control: undefined as NonNullable<Awaited<ReturnType<Locator["elementHandle"]>>> | undefined,
          outcome: () => ({ failed, first }) };
      })();
      if (observation) void commit.catch(error => observation.retain(error, "commit"));
      const handler = (route: Route) => {
        if (!isFiling(route.request(), f.marker)) return route.fallback();
        const work = (async () => {
        try {
          attempts.push(filingAttempt(route.request()));
          if (attempts.length !== 1) { expect(attempts.at(-1)).toEqual(attempts[0]); await route.continue(); return; }
          const response = await route.fetch();
          expect(response.ok()).toBe(true);
          const state = await f.snapshot();
          const rows = state.reports.filter(row => row.note === f.marker);
          expect(rows).toHaveLength(1);
          expect(rows[0]).toMatchObject({ tenant_id: f.fx.base.tenantA.id, user_id: f.fx.users.montor.id,
            report_date: REPORT_DATE, duration_minutes: reportMinutes, booking_id: reportBooking, job_id: reportJob, status: "submitted" });
          expect(state.reports.length - before.reports.length).toBe(1);
          expect(state.audit.filter(row => row.target_id === rows[0].id)).toHaveLength(1);
          expect(state.audit.length - before.audit.length).toBe(1);
          let holdFailed = false, holdError: unknown;
          if (observation) {
            observation.entered.resolve(undefined);
            try { await observation.within(observation.release.promise, "hold-release"); }
            catch (error) { holdFailed = true; holdError = error; }
          }
          await route.abort("failed");
          committed(state);
          if (holdFailed) throw holdError;
        } catch (error) { rejectCommit(error); throw error; }
        })();
        if (observation) {
          observation.work.add(work);
          void work.then(() => observation.work.delete(work), error => {
            observation.work.delete(work); observation.retain(error, "owned-handler");
          });
        }
        return work;
      };
      await page.route("**/*", handler); // Installed before navigation/submit.
      try {
        await signIn(page, f.fx.users.montor);
        await openDay(page);
        await bookingCard(page, reportBooking).getByRole("button", { name: "Rapportera tid", exact: true }).click();
        const form = filingDialog(page);
        await expect(form.getByLabel("Datum", { exact: true })).toHaveValue(REPORT_DATE);
        await expect(form.getByLabel("Start", { exact: true })).toHaveValue(`${REPORT_DATE}T${reportStart}`);
        await expect(form.getByLabel("Slut", { exact: true })).toHaveValue(`${REPORT_DATE}T${reportEnd}`);
        await expect(form.getByLabel("Jobb", { exact: true })).toHaveValue(reportJob ?? "");
        await form.getByLabel("Anteckning", { exact: true }).fill(f.marker);
        await rel22Capture(page, testInfo, "e02-prefilled-draft", form);
        if (observation) {
          const primary = form.locator('button[type="submit"]');
          await expect(primary).toHaveCount(1);
          observation.control = await primary.elementHandle() ?? undefined;
          if (!observation.control) throw new Error("REL22 E02 primary control unavailable.");
          observation.capture = rel22E02SubmitCapture(page, testInfo, form, observation.control, "e02-submit-enabled", error => observation.retain(error, "exact-control-observer"), observation.cleanupStage);
          await observation.within(observation.capture, "enabled-observation");
          observation.capture = rel22E02SubmitCapture(page, testInfo, form, observation.control, "e02-submit-keyboard-focus", error => observation.retain(error, "exact-control-observer"), observation.cleanupStage);
          await observation.within(observation.capture, "keyboard-observation");
          expect(page.viewportSize()).toEqual({ width: 360, height: 640 });
          const action = form.getByRole("button", { name: "Rapportera tid", exact: true });
          expect(await action.evaluate((node, originalNode) => node === originalNode, observation.control)).toBe(true);
          await expect(action).toBeEnabled();
          // Start the original single activation, but never let its auto-wait admit the hold.
          observation.activation = keyboardActivate(page, action);
          void observation.activation.catch(error => observation.retain(error, "activation"));
          await observation.within(Promise.race([observation.entered.promise, observation.failure.promise]), "hold-entry");
          try {
            expect(attempts).toHaveLength(1);
            observation.capture = rel22E02SubmitCapture(page, testInfo, form, observation.control, "e02-submit-held-pending", error => observation.retain(error, "exact-control-observer"), observation.cleanupStage);
            await observation.within(observation.capture, "pending-observation");
            expect(page.viewportSize()).toEqual({ width: 360, height: 640 });
          } finally { observation.release.resolve(undefined); }
          await observation.within(observation.activation, "activation-settlement");
        } else {
          await keyboardActivate(page, form.getByRole("button", { name: "Rapportera tid", exact: true }));
        }
        const durable = observation ? await observation.within(commit, "commit-settlement") : await commit;
        await expect(form.getByText("Osänd", { exact: true })).toBeVisible();
        await expect(form.getByTestId("time-report-submit-status")).toHaveCount(0);
        await expect(form.getByLabel("Anteckning", { exact: true })).toHaveValue(f.marker);
        await expect(form.getByLabel("Start", { exact: true })).toBeDisabled();
        await rel22Capture(page, testInfo, "e02-unknown-outcome", form);
        expect(attempts).toHaveLength(1);
        expect(attempts[0]).toMatchObject({ date: REPORT_DATE, minutes: reportMinutes, bookingId: reportBooking, jobId: reportJob, note: f.marker });
        const retry = form.getByRole("button", { name: "Försök igen med samma försök", exact: true });
        if (observation) {
          observation.capture = rel22E02PhoneTargetCapture(page, testInfo, retry, "e02-unknown-outcome-phone-target-whole",
            error => observation.retain(error, "phone-target-observer"), observation.cleanupStage);
          await observation.within(observation.capture, "unknown-phone-target-observation");
        }
        // playwright-utils deviation: observe the real existing filing action before retry.
        const confirmation = page.waitForResponse(reply => isFiling(reply.request(), f.marker));
        await keyboardActivate(page, retry);
        expect((await confirmation).ok()).toBe(true);
        await expect(form.getByTestId("time-report-submit-status")).toHaveText("Rapporterad");
        expect(attempts).toHaveLength(2);
        expect(attempts[1]).toEqual(attempts[0]);
        expect(await f.snapshot()).toEqual(durable);
        await rel22Capture(page, testInfo, "e02-server-confirmed", form);
        if (observation) {
          observation.capture = rel22E02PhoneTargetCapture(page, testInfo, form.getByTestId("time-report-submit-status"), "e02-server-confirmed-phone-target-whole",
            error => observation.retain(error, "phone-target-observer"), observation.cleanupStage);
          await observation.within(observation.capture, "confirmed-phone-target-observation");
        }
        await assertPhoneFits(page);
        const refresh = page.getByRole("button", { name: "Uppdatera", exact: true });
        await expect(refresh).toBeEnabled();
        await page.keyboard.press("Escape");
        await expect(form).toHaveCount(0);
        await expect(page.getByRole("heading", { name: "Min dag", exact: true })).toBeFocused();
        await rel22Capture(page, testInfo, "e02-restored-focus", page.getByRole("heading", { name: "Min dag", exact: true }));
        expect(await f.snapshot()).toEqual(durable);
        await page.reload();
        expect(await f.snapshot()).toEqual(durable); // Reload must not refile.
      } catch (error) {
        if (!observation) throw error;
        observation.retain(error, "journey");
      } finally {
        if (observation) {
          observation.release.resolve(undefined);
          const cleanup = async (stage: string, run: () => Promise<unknown>) => {
            try { await observation.cleanupStage(stage, run); } catch (error) { observation.retain(error, stage); }
          };
          // Classify every actually-started owned operation before unroute/fixture cleanup.
          // A timed-out drain is failure/unknown custody, never evidence of settlement.
          if (observation.capture) await cleanup("capture-drain", () => observation.capture!);
          for (const work of [...observation.work]) await cleanup("handler-drain", () => work);
          if (observation.activation) await cleanup("activation-drain", () => observation.activation!);
          await cleanup("owned-unroute", () => page.unroute("**/*", handler));
          if (observation.control) await cleanup("control-dispose", () => observation.control!.dispose());
          // Preserve pending/rejected cleanup closures and capture/activation/control references.
          // A deadline alone never proves settlement, disposal or closed custody.
        } else { await page.unroute("**/*", handler); }
      }
      const result = observation?.outcome();
      if (result?.failed) throw result.first;
    });
  });

  test("[P0] 15.6-E03 keyboard refresh failure clears lists, retries current date and a real pull fetches changed server facts", async ({ resourcePage: page }, testInfo) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      // Configured runner is Chromium; this uses native browser touch input,
      // including feature detection before mount, rather than DOM dispatchEvent.
      const touch = await page.context().newCDPSession(page);
      await touch.send("Emulation.setTouchEmulationEnabled", { enabled: true, maxTouchPoints: 1 });
      try {
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      let fail = false, delayNext = false, readRequests = 0, queuedFailureHeld = false;
      let oldRequest: Request | undefined;
      const oldFetched = barrier<void>(), releaseOld = barrier<void>(), oldDelivered = barrier<void>();
      const releaseQueuedFailure = barrier<void>();
      // playwright-utils deviation: dependency absent; fault the actual read action,
      // not a guessed REST endpoint. Keep interception installed before refresh.
      const handler = async (route: Route) => {
        if (!isDayRead(route.request())) { await route.fallback(); return; }
        readRequests += 1;
        if (delayNext) {
          delayNext = false;
          oldRequest = route.request();
          try {
            const response = await route.fetch();
            expect(response.ok()).toBe(true);
            oldFetched.resolve(undefined);
            await releaseOld.promise;
            await route.fulfill({ response });
            oldDelivered.resolve(undefined);
          } catch (error) { oldFetched.reject(error); oldDelivered.reject(error); throw error; }
          return;
        }
        if (fail) {
          if (!queuedFailureHeld) { queuedFailureHeld = true; await releaseQueuedFailure.promise; }
          await route.abort("failed"); return;
        }
        await route.fallback();
      };
      await page.route("**/*", handler);
      try {
        // Next 16 serializes Server Actions, including REFRESH. Exercise its
        // actual queued order: selection changes while the older real response
        // is held, then the queued selection fails after that response arrives.
        // E09 independently covers true NAVIGATE preemption and a late response.
        delayNext = true;
        await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
        await oldFetched.promise;
        await rel22Capture(page, testInfo, "e03-held-read-loading", page.getByText("Hämtar planeringen…", { exact: true }));
        fail = true;
        await page.getByLabel("Datum", { exact: true }).fill("2026-10-13");
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        expect(readRequests).toBe(1);
        const queuedSelection = page.waitForRequest(request => isDayRead(request));
        const finishedOld = page.waitForEvent("requestfinished", request => request === oldRequest);
        releaseOld.resolve(undefined);
        await oldDelivered.promise;
        await queuedSelection;
        await finishedOld;
        // Keep the newer request pending while the older real Flight response
        // decodes and commits. A removed generation/selection guard must expose
        // its old cards here, rather than having the next failure hide the bug.
        await page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve()))));
        expect(queuedFailureHeld).toBe(true);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        await expect(agenda(page).getByRole("article")).toHaveCount(0);
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByText("Anslutning krävs", { exact: true })).toHaveCount(0);
        releaseQueuedFailure.resolve(undefined);
        await expect(page.getByText("Anslutning krävs", { exact: true })).toBeVisible();
        await expect(agenda(page).getByRole("article")).toHaveCount(0);
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        fail = false;
        await page.getByLabel("Datum", { exact: true }).fill(REPORT_DATE);
        await expect(bookingCard(page, f.ownBooking)).toBeVisible();
        fail = true;
        await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
        await expect(page.getByText("Anslutning krävs", { exact: true })).toBeVisible();
        await expect(agenda(page).getByRole("article")).toHaveCount(0);
        await expect(ownJobs(page).getByRole("link")).toHaveCount(0);
        await expect(page.getByRole("link", { name: "Öppna jobbet", exact: true })).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Rapportera tid", exact: true })).toHaveCount(0);
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toHaveCount(0);
        await rel22Capture(page, testInfo, "e03-read-failed", page.getByRole("alert").filter({ has: page.getByText("Anslutning krävs", { exact: true }) }).filter({ has: page.getByRole("button", { name: "Försök igen", exact: true }) }));
        const failedSelectionRead = page.waitForRequest(request => isDayRead(request));
        await page.getByLabel("Datum", { exact: true }).fill("2026-10-13");
        await failedSelectionRead;
        await expect(page.getByText("Anslutning krävs", { exact: true })).toBeVisible();
        fail = false;
        await keyboardActivate(page, page.getByRole("button", { name: "Försök igen", exact: true }));
        await expect(bookingCard(page, f.missingBooking)).toBeVisible();
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        await expect(page.getByText("Anslutning krävs", { exact: true })).toHaveCount(0);

        await rel22Capture(page, testInfo, "e03-explicit-retry", agenda(page));
        const changedDescription = `${f.marker} fresh after real pull`;
        await expect(bookingCard(page, f.missingBooking)).not.toContainText(changedDescription);
        await adminQuery("update public.bookings set description=$3 where tenant_id=$1 and id=$2",
          [f.fx.base.tenantA.id, f.missingBooking, changedDescription]);
        // MyDayWorkspace handles a downward pull over 80px from window top.
        // Its heading is a stable noninteractive start surface inside that owner;
        // the agenda can start below the phone fold after the week controls.
        // Native input, a real read and changed persisted content prove refresh.
        await page.evaluate(() => window.scrollTo(0, 0));
        const bounds = await page.getByRole("heading", { name: "Min dag", exact: true }).boundingBox();
        expect(bounds).not.toBeNull();
        const x = bounds!.x + bounds!.width / 2, y = bounds!.y + 12;
        expect(y).toBeGreaterThanOrEqual(0);
        expect(y + 140).toBeLessThan(640);
        // playwright-utils deviation: absent package; observe the current real
        // read before the native touch gesture, with no fabricated response.
        const pulledRead = page.waitForResponse(reply => isDayRead(reply.request()));
        await touch.send("Input.dispatchTouchEvent", { type: "touchStart", touchPoints: [{ x, y, id: 1 }] });
        for (const distance of [20, 45, 80, 110, 140]) {
          await touch.send("Input.dispatchTouchEvent", {
            type: "touchMove", touchPoints: [{ x, y: y + distance, id: 1 }],
          });
        }
        await touch.send("Input.dispatchTouchEvent", { type: "touchEnd", touchPoints: [] });
        expect((await pulledRead).ok()).toBe(true);
        await expect(bookingCard(page, f.missingBooking)).toContainText(changedDescription);
        await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        const gestures: Request[] = [];
        const observeGestureRead = (request: Request) => { if (isDayRead(request)) gestures.push(request); };
        page.on("request", observeGestureRead);
        try {
          // Swiping an interactive control must neither navigate nor refresh.
          await nativeDrag(page, touch, page.getByRole("button", { name: "Uppdatera", exact: true }), -100, 0);
          await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
          expect(gestures).toHaveLength(0);
          const nextWeekRead = page.waitForResponse(reply => isDayRead(reply.request()));
          await nativeDrag(page, touch, page.getByRole("heading", { name: "Min dag", exact: true }), -100, 0);
          expect((await nextWeekRead).ok()).toBe(true);
          await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-20");
          await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
          expect(gestures).toHaveLength(1);
          const previousWeekRead = page.waitForResponse(reply => isDayRead(reply.request()));
          await nativeDrag(page, touch, page.getByRole("heading", { name: "Min dag", exact: true }), 100, 0);
          expect((await previousWeekRead).ok()).toBe(true);
          await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-13");
          await expect(bookingCard(page, f.missingBooking)).toContainText(changedDescription);
          expect(gestures).toHaveLength(2);
        } finally { page.off("request", observeGestureRead); }
      } finally { releaseOld.resolve(undefined); releaseQueuedFailure.resolve(undefined); await page.unrouteAll({ behavior: "wait" }); }
      } finally {
        try { await touch.send("Emulation.setTouchEmulationEnabled", { enabled: false }); }
        finally { await touch.detach(); }
      }
    });
  });

  test("[P1] 15.6-E04 successful empty agenda differs from own-jobs empty; jobless card has no invented destination", async ({ resourcePage: page }, testInfo) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 360, height: 640 });
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      const jobless = bookingCard(page, f.jobless);
      await expect(jobless).toBeVisible();
      await expect(jobless.getByRole("link")).toHaveCount(0);
      const weekdayButtons = page.locator('[aria-label="Välj dag"]').getByRole("button");
      await expect(weekdayButtons).toHaveCount(7);
      for (const button of await weekdayButtons.all()) {
        const bounds = await button.boundingBox();
        expect(bounds).not.toBeNull();
        expect(bounds!.width).toBeGreaterThanOrEqual(44);
        expect(bounds!.height).toBeGreaterThanOrEqual(44);
      }
      expect(await page.getByRole("main").count()).toBe(1);
      await keyboardActivate(page, page.getByRole("button", { name: "Visa hela veckan", exact: true }));
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await expect(bookingCard(page, f.missingBooking)).toBeVisible();
      await expect(bookingCard(page, f.allDay)).toBeVisible();
      await expect(bookingCard(page, f.allDay)).toContainText("Heldag");
      await expect(bookingCard(page, f.allDay)).toContainText(/15.*okt/i);
      await rel22Capture(page, testInfo, "e04-populated-week", agenda(page));
      await keyboardActivate(page, page.getByRole("button", { name: "Visa vald dag", exact: true }));
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await expect(bookingCard(page, f.missingBooking)).toHaveCount(0);
      await expect(bookingCard(page, f.allDay)).toHaveCount(0);
      await assertPhoneFits(page);
      // Accessible arrow names provide the specified keyboard alternative
      // to a week swipe; the selected day must move with the displayed week.
      await keyboardActivate(page, page.getByRole("button", { name: "Nästa vecka", exact: true }));
      await expect(page.getByLabel("Datum", { exact: true })).toHaveValue("2026-10-19");
      await keyboardActivate(page, page.getByRole("button", { name: "Föregående vecka", exact: true }));
      await expect(page.getByLabel("Datum", { exact: true })).toHaveValue(REPORT_DATE);
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await page.getByLabel("Datum", { exact: true }).fill("2026-10-14");
      await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
      await expect(page.getByText("Anslutning krävs", { exact: true })).toHaveCount(0);
      await rel22Capture(page, testInfo, "e04-empty-agenda", agenda(page));
      if (jobsActive) {
        await expect(ownJobs(page)).toBeVisible();
        await expect(ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`)).toBeVisible();
        await adminQuery("update public.job_members set archived_at=now() where tenant_id=$1 and job_id=$2 and person_profile_id=$3",
          [f.fx.base.tenantA.id, f.otherJob.id, f.fx.ownProfile.id]);
        // The first job is related by own booking assignment, so remove that
        // relationship as well before expecting a genuinely empty personal list.
        await adminQuery("delete from public.booking_assignees where tenant_id=$1 and person_profile_id=$2", [f.fx.base.tenantA.id, f.fx.ownProfile.id]);
        await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
        await expect(ownJobs(page).getByRole("link")).toHaveCount(0);
        // The own-jobs empty state is distinct from the booking empty state.
        await expect(ownJobs(page).getByText("Inga tilldelade jobb", { exact: true })).toBeVisible();
        await rel22Capture(page, testInfo, "e04-empty-own-jobs", ownJobs(page));
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
      } else await expect(ownJobs(page)).toHaveCount(0);
      const selected = page.getByLabel("Datum", { exact: true });
      await expect(selected).toHaveAttribute("min", "0001-01-08");
      await expect(selected).toHaveAttribute("max", "9999-12-26");
      for (const [boundary, direction, invalid] of [
        ["0001-01-08", "Föregående vecka", "0001-01-01"],
        ["9999-12-26", "Nästa vecka", "9999-12-31"],
      ]) {
        await selected.fill(boundary);
        await expect(selected).toHaveValue(boundary);
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toBeVisible();
        await expect(page.getByRole("button", { name: direction, exact: true })).toBeDisabled();
        await expect(selected).toHaveValue(boundary);
        await selected.fill(invalid);
        const dateError = page.locator("#my-day-date-error");
        await expect(dateError).toHaveAttribute("role", "alert");
        await expect(dateError).toBeVisible();
        await expect(dateError).toHaveText("Välj ett datum inom det tillgängliga intervallet.");
        await expect(selected).toHaveValue(boundary);
        await expect(page.getByRole("heading", { name: "Min dag", exact: true })).toBeVisible();
      }
      await assertPhoneFits(page);
    });
  });

  test("[P1] 15.6-E05 active jobs render own current designation and preserve identity; pending jobs contribute no UI", async ({ resourcePage: page }, testInfo) => {
    await withMyDayFixture(async f => {
      await adminQuery("update public.job_members set designation='arbetsledare' where tenant_id=$1 and job_id=$2 and person_profile_id=$3",
        [f.fx.base.tenantA.id, f.otherJob.id, f.fx.ownProfile.id]);
      await adminQuery("update public.jobs set status='in_progress' where tenant_id=$1 and id=$2", [f.fx.base.tenantA.id, f.otherJob.id]);
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      if (!jobsActive) {
        await expect(ownJobs(page)).toHaveCount(0);
        await expect(bookingCard(page, f.ownBooking).getByRole("link", { name: "Öppna jobbet", exact: true })).toHaveCount(0);
        // Zero jobs-query/payload proof is server/unit/integration-owned; E2E
        // must not mutate the manifest or manufacture a pending app response.
        return;
      }
      const row = ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`);
      await expect(row).toContainText(f.otherJob.title);
      await expect(row).toContainText(f.marker);
      await expect(row).toContainText("Pågår");
      await expect(row).toContainText(/arbetsledare/i);
      await expect(ownJobs(page).getByTestId(`my-day-job-${f.job.id}`)).toContainText("Skapad");
      const link = row.getByRole("link");
      await expect(link).toHaveAttribute("href", `/jobs/${f.otherJob.id}`);
      await rel22Capture(page, testInfo, "e05-active-own-jobs", ownJobs(page));
      await link.click();
      await expect(page).toHaveURL(new RegExp(`/jobs/${f.otherJob.id}(?:\\?|$)`));
      await expect(page.getByTestId("job-workspace-header")).toContainText(f.otherJob.title);
      await adminQuery("update public.jobs set status='done' where tenant_id=$1 and id=$2", [f.fx.base.tenantA.id, f.otherJob.id]);
      await openDay(page);
      await expect(ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`)).toHaveCount(0);
      await adminQuery("update public.jobs set status='created' where tenant_id=$1 and id=$2", [f.fx.base.tenantA.id, f.otherJob.id]);
      await adminQuery("update public.job_members set archived_at=now() where tenant_id=$1 and job_id=$2 and person_profile_id=$3",
        [f.fx.base.tenantA.id, f.otherJob.id, f.fx.ownProfile.id]);
      await openDay(page);
      await expect(ownJobs(page).getByTestId(`my-day-job-${f.otherJob.id}`)).toHaveCount(0);
    });
  });

  test("[P1] 15.6-E06 own unread booking.changed is a safe generic banner with its existing route", async ({ resourcePage: page }, testInfo) => {
    await withMyDayFixture(async f => {
      // Existing recipient/category rows, with newer unrelated notices exceeding
      // a transport page: category filtering must precede the five-row page.
      await adminQuery(`insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,created_at)
        select $1,$2,'quote.follow_up_due','Unrelated notice',$3,'/quotes',gen_random_uuid(),
          '2026-10-13T09:00:00Z'::timestamptz + i * interval '1 second'
        from generate_series(1,101) i`, [f.fx.base.tenantA.id, f.fx.users.montor.id, `${f.marker} unrelated category`]);
      const bookingBodies = Array.from({ length: 6 }, (_, index) => index === 5
        ? "En bokning i din planering har ändrats." : `En bokning i din planering har ändrats. Meddelande ${index}.`);
      for (const [index, body] of bookingBodies.entries()) await adminQuery(`insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,created_at)
        values($1,$2,'booking.changed','Planeringen har ändrats',$3,'/scheduling',$4,$5)`,
        [f.fx.base.tenantA.id, f.fx.users.montor.id, body, randomUUID(), `2026-10-12T09:0${index}:00Z`]);
      // Peer/read notices cannot occupy or contribute to either visible page.
      for (const [recipient, readAt, body] of [
        [f.fx.users.projektledare.id, null, `${f.marker} peer private notice`],
        [f.fx.users.montor.id, "2026-10-12T09:00:00Z", `${f.marker} already read`],
      ] as const) await adminQuery(`insert into public.notifications(tenant_id,recipient_user_id,category,title,body,route,logical_subject_id,read_at)
        values($1,$2,'booking.changed','Planeringen har ändrats',$3,'/scheduling',$4,$5)`,
      [f.fx.base.tenantA.id, recipient, body, randomUUID(), readAt]);
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      const banner = notices(page);
      await expect(banner).toBeVisible();
      await expect(banner).toContainText("Planeringen har ändrats");
      await expect(banner).toContainText("En bokning i din planering har ändrats.");
      await expect(banner).not.toContainText(`${f.marker} peer private notice`);
      await expect(banner).not.toContainText(`${f.marker} already read`);
      await expect(banner).not.toContainText(/flyttad.*(?:idag|imorgon)|bokning.*2026-10-12/i);
      await expect(banner.getByRole("link")).toHaveCount(5);
      expect(await banner.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href")))).toEqual(Array(5).fill("/scheduling"));
      expect(await banner.getByRole("link").evaluateAll(links => links.map(link => link.getAttribute("href")))).not.toContain(`/scheduling/${f.ownBooking}`);
      await expect(banner).not.toContainText(`${f.marker} unrelated category`);
      await expect(banner.getByText(bookingBodies[0], { exact: true })).toHaveCount(0);
      await rel22Capture(page, testInfo, "e06-schedule-change", banner);
      const continuation = page.waitForResponse(reply => isDayRead(reply.request()) && (reply.request().postData() ?? "").includes('"noticePage":2'));
      await keyboardActivate(page, banner.getByRole("button", { name: "Visa fler ändringar", exact: true }));
      expect((await continuation).ok()).toBe(true);
      await expect(banner.getByText(bookingBodies[0], { exact: true })).toBeVisible();
      await expect(banner.getByRole("link")).toHaveCount(1);
      await expect(banner.getByRole("link")).toHaveAttribute("href", "/scheduling");
      await expect(banner.getByRole("link")).not.toHaveAttribute("href", new RegExp(f.ownBooking));
      await expect(banner.getByRole("button", { name: "Visa fler ändringar", exact: true })).toHaveCount(0);
      await expect(banner).not.toContainText(`${f.marker} peer private notice`);
      await expect(banner).not.toContainText(`${f.marker} already read`);
      await expect(banner).not.toContainText(`${f.marker} unrelated category`);
      await keyboardActivate(page, banner.getByRole("button", { name: "Föregående ändringar", exact: true }));
      await expect(banner.getByText(bookingBodies[5], { exact: true })).toBeVisible();
      await keyboardActivate(page, page.getByRole("button", { name: "Uppdatera", exact: true }));
      await expect(banner.getByText("En bokning i din planering har ändrats.", { exact: true })).toHaveCount(1);
    });
  });

  test("[P0] 15.6-E07 direct route requires login/current booking entitlement and office landing remains stable", async ({ resourcePage: page }, testInfo) => {
    await withMyDayFixture(async f => {
      await page.context().clearCookies();
      await page.goto("/my-day");
      await expect(page).toHaveURL(/\/login(?:\?|$)/);
      await expect(agenda(page)).toHaveCount(0);
      await signIn(page, f.fx.users.saljare); // Existing role lacks Bookings.View.
      await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
      await page.goto("/my-day");
      await expect(page.getByText(TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED, { exact: true })).toBeVisible();
      await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
      await expect(page.getByRole("link", { name: "Min dag", exact: true })).toHaveCount(0);
      await rel22Capture(page, testInfo, "e07-denied-role", page.getByText(TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED, { exact: true }));
      await signIn(page, f.fx.roleUnionUser); // Current PL + salesperson office union.
      await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
      await signIn(page, f.fx.users.montor);
      await openDay(page);
      await expect(bookingCard(page, f.ownBooking)).toBeVisible();
      await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and id=$2",
        [f.fx.base.tenantA.id, f.fx.ownProfile.membershipId]);
      try {
        await page.reload();
        await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
        await expect(page.getByRole("button", { name: "Rapportera tid", exact: true })).toHaveCount(0);
        await expect(page.getByText("inga bokningar ännu", { exact: true })).toHaveCount(0);
        await expect(page.getByText(TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED, { exact: true })).toBeVisible();
        await rel22Capture(page, testInfo, "e07-revoked-membership", page.getByText(TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED, { exact: true }));
      } finally {
        await adminQuery("update public.tenant_memberships set status='active' where tenant_id=$1 and id=$2",
          [f.fx.base.tenantA.id, f.fx.ownProfile.membershipId]);
      }
    });
  });

  test("[P0] 15.6-E08 manager's Min dag is still own-person and excludes other assignees' cards/actions", async ({ resourcePage: page }, testInfo) => {
    await withMyDayFixture(async f => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await signIn(page, f.fx.users.projektledare);
      await expect(page).toHaveURL(/\/dashboard(?:\?|$)/);
      await openDay(page);
      await expect(bookingCard(page, f.peerBooking)).toBeVisible();
      await expect(bookingCard(page, f.shared)).toHaveCount(1);
      await expect(bookingCard(page, f.ownBooking)).toHaveCount(0);
      await expect(bookingCard(page, f.jobless)).toHaveCount(0);
      await expect(bookingCard(page, f.missingBooking)).toHaveCount(0);
      await expect(agenda(page).getByRole("article")).toHaveCount(2);
      await expect(page.getByRole("combobox", { name: "Person", exact: true })).toHaveCount(0);
      await expect(agenda(page)).not.toContainText(/(?:pris|kostnad|marginal|timpris|offertnummer)/i);
      await rel22Capture(page, testInfo, "e08-manager-own-person", agenda(page));
      await assertPhoneFits(page);
    });
  });

  // Only E09 uses this pinned Playwright 1.61.1 fixture override. The ordinary
  // recorder instruments API calls before the case can sanitize errors, and
  // its error context can include a page snapshot even with tracing off.
  type E09ContextListener = { runBeforeCreateBrowserContext: (options: Record<string, unknown>) => Promise<void> };
  const privateE09 = test.extend<{ _setupArtifacts: void; _combinedContextOptions: Record<string, unknown> }>({
    trace: "off",
    screenshot: "off",
    video: "off",
    _setupArtifacts: async ({ playwright, _combinedContextOptions }, provide) => {
      if (playwrightPackage.version !== "1.61.1" || process.env.DEBUG || process.env.DEBUG_FILE || process.env.PWDEBUG
        || process.env.NODE_DEBUG || process.env.PW_TEST_REUSE_CONTEXT) {
        throw new Error("E09 Playwright version, debug or context reuse configuration refused");
      }
      // Preserve the normal context-default hook without enabling recording.
      // Playwright's ordinary context factory relies on this hook for baseURL
      // and device options. The attached fixture can still supply overrides.
      const { _instrumentation: instrumentation } = playwright as unknown as { _instrumentation?: {
        addListener(listener: E09ContextListener): void;
        removeListener(listener: E09ContextListener): void;
      } };
      if (!instrumentation || typeof instrumentation.addListener !== "function" || typeof instrumentation.removeListener !== "function") {
        throw new Error("E09 Playwright context configuration unavailable");
      }
      const defaults: E09ContextListener = {
        async runBeforeCreateBrowserContext(options) {
          for (const [key, value] of Object.entries(_combinedContextOptions)) {
            if (!(key in options)) options[key] = value;
          }
          if (options.recordHar || options.recordVideo) throw new Error("E09 browser context recording refused");
        },
      };
      instrumentation.addListener(defaults);
      try { await provide(); } finally { instrumentation.removeListener(defaults); }
    },
  });

  // E09_REPLAY_HELPERS_BEGIN
  const e09Limits = {
    manifest: 2 * 1024 * 1024, arguments: 2048, headers: 16 * 1024, headerCount: 64,
    body: 256 * 1024, chunk: 16 * 1024, chunks: 32,
    commandMs: 3000, selectionMs: 12000, streamMs: 10000, terminalMs: 5000, nonTargets: 64,
  };
  type E09Failure = "setup" | "binding" | "filing" | "headers" | "encoding" | "stream"
    | "timeout" | "overflow" | "projection" | "early-terminal" | "continued-request" | "session-closed"
    | "missing-reply" | "rejected-reply" | "missing-terminal" | "late-failure"
    | "journey" | "cleanup";
  class E09Error extends Error {
    constructor(readonly category: E09Failure) { super(`E09: ${category}`); }
  }
  function e09Require(condition: unknown, category: E09Failure): asserts condition {
    if (!condition) throw new E09Error(category);
  }
  async function e09Within<T>(run: Promise<T>, ms: number, category: E09Failure = "timeout"): Promise<T> {
    let timer: ReturnType<typeof setTimeout> | undefined;
    try {
      return await Promise.race([run, new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new E09Error(category)), Math.max(0, ms));
      })]);
    } finally { clearTimeout(timer); }
  }
  function e09Object(value: unknown): Record<string, unknown> | undefined {
    if (value && typeof value === "object" && !Array.isArray(value)) return value as Record<string, unknown>;
  }
  function e09Parse(text: string): unknown {
    try { return JSON.parse(text); } catch { return undefined; }
  }
  function e09ActionIds(manifest: unknown) {
    const node = e09Object(e09Object(manifest)?.node);
    const edge = e09Object(e09Object(manifest)?.edge);
    e09Require(node && edge, "binding");
    const lookup = (filename: string, exportedName: string) => {
      const matches = (entries: Record<string, unknown>) => Object.entries(entries).filter(([, record]) =>
        e09Object(record)?.filename === filename && e09Object(record)?.exportedName === exportedName);
      const candidates = matches(node);
      e09Require(candidates.length === 1 && matches(edge).length === 0, "binding");
      const [id, record] = candidates[0];
      const workers = e09Object(e09Object(record)?.workers);
      e09Require(/^[a-f0-9]{42}$/.test(id) && workers && Object.keys(workers).some(key => key.endsWith("/my-day/page")), "binding");
      return id;
    };
    return {
      read: lookup("src/features/my-day/actions.ts", "readMyDayAction"),
      file: lookup("src/features/time-reports/actions.ts", "fileTimeReportAction"),
    };
  }
  async function e09BuildActionIds() {
    // The configured Next production server builds in the runner's cwd.
    const file = await open(".next/server/server-reference-manifest.json", "r");
    try {
      const bytes = Buffer.alloc(e09Limits.manifest + 1);
      const { bytesRead } = await file.read(bytes, 0, bytes.length, 0);
      e09Require(bytesRead < bytes.length && (await file.stat()).size === bytesRead, "binding");
      return e09ActionIds(e09Parse(bytes.toString("utf8", 0, bytesRead)));
    } finally { await file.close(); }
  }

  type E09Request = {
    url: string; method: string; headers: Record<string, unknown>;
    postData?: string; postDataEntries?: { bytes?: string }[];
  };
  function e09RequestHeader(request: E09Request, name: string) {
    const entries = Object.entries(request.headers).filter(([key]) => key.toLowerCase() === name);
    e09Require(entries.length <= 1, "binding");
    const value = entries[0]?.[1];
    e09Require(value === undefined || typeof value === "string", "binding");
    return value;
  }
  function e09Base64(text: string, cap: number, category: E09Failure) {
    e09Require(text.length <= 4 * Math.ceil(cap / 3), "overflow");
    e09Require(/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(text), category);
    const bytes = Buffer.from(text, "base64");
    e09Require(bytes.length <= cap, "overflow");
    e09Require(bytes.toString("base64") === text, category);
    return bytes;
  }
  function e09Args(request: E09Request, fallback?: string) {
    e09Require(/^text\/plain(?:;\s*charset=utf-8)?$/i.test(e09RequestHeader(request, "content-type") ?? ""), "binding");
    let raw = request.postData ?? fallback;
    if (request.postDataEntries !== undefined) {
      const [entry] = request.postDataEntries;
      e09Require(request.postDataEntries.length === 1 && typeof entry?.bytes === "string", "binding");
      const decoded = new TextDecoder("utf-8", { fatal: true }).decode(e09Base64(entry.bytes, e09Limits.arguments, "binding"));
      e09Require(raw === undefined || raw === decoded, "binding");
      raw = decoded;
    }
    e09Require(raw !== undefined && Buffer.byteLength(raw) <= e09Limits.arguments, "binding");
    const args = e09Parse(raw);
    const argument = Array.isArray(args) && args.length === 1 ? e09Object(args[0]) : undefined;
    e09Require(argument && raw === JSON.stringify([argument]), "binding");
    return { raw, argument };
  }
  function e09ReadArgs(input: Record<string, unknown>) {
    e09Require(Object.keys(input).length === 3
      && input.date === REPORT_DATE && input.mode === "day" && input.noticePage === 1, "binding");
  }

  type E09Header = { name: string; value: string };
  function e09ResponseHeaders(headers: E09Header[] | undefined) {
    e09Require(headers && headers.length <= e09Limits.headerCount, "headers");
    const selected = new Map<string, string>();
    let total = 0;
    for (const { name, value } of headers) {
      total += Buffer.byteLength(name) + Buffer.byteLength(value) + 4;
      e09Require(total <= e09Limits.headers && /^[!#$%&'*+.^_`|~0-9A-Za-z-]+$/.test(name) && !/[^\t\x20-\x7e]/.test(value), "headers");
      const key = name.toLowerCase();
      e09Require(!["set-cookie", "set-cookie2", "location", "x-action-redirect", "trailer", "upgrade"].includes(key), "headers");
      // Reconstruct only the fields consumed by the pinned action reducer.
      if (!["content-type", "content-encoding", "content-length", "transfer-encoding", "x-action-revalidated",
        "x-nextjs-postponed", "x-nextjs-stale-time", "x-action-not-found"].includes(key)) continue;
      e09Require(!selected.has(key), "headers");
      selected.set(key, value.trim());
    }
    e09Require(/^text\/x-component(?:;\s*charset=utf-8)?$/i.test(selected.get("content-type") ?? ""), "headers");
    const encoding = selected.get("content-encoding")?.toLowerCase() ?? "identity";
    // Chromium 149 decodes in URLRequestHttpJob or passes client-side
    // decoding types to DevToolsURLLoaderInterceptor, which installs the
    // decoding pipe before returning the stream. Accept only singleton
    // encodings on that path and still require the decoded Flight result.
    e09Require(["identity", "gzip", "br"].includes(encoding), "encoding");
    const length = selected.get("content-length"), transfer = selected.get("transfer-encoding");
    e09Require(length === undefined || /^(0|[1-9][0-9]{0,8})$/.test(length), "headers");
    e09Require(transfer === undefined || (transfer.toLowerCase() === "chunked" && length === undefined), "headers");
    // A compressed wire length is not a decoded byte count. Next's
    // streaming compression removes it; refuse other compressed framing.
    e09Require(encoding === "identity" || length === undefined, "headers");
    e09Require(!selected.has("x-nextjs-postponed") && !selected.has("x-action-not-found"), "headers");
    const expectedBytes = length === undefined ? undefined : Number(length);
    e09Require(expectedBytes === undefined || expectedBytes <= e09Limits.body, "overflow");
    for (const name of ["content-encoding", "transfer-encoding", "content-length"]) selected.delete(name);
    return { expectedBytes, headers: Array.from(selected, ([name, value]) => ({ name, value })) };
  }
  type E09Chunk = { data: string; base64Encoded?: boolean; eof: boolean };
  async function e09ReadBody(read: (size: number) => Promise<E09Chunk>, ms = e09Limits.streamMs) {
    const body = Buffer.alloc(e09Limits.body);
    let used = 0;
    const deadline = performance.now() + ms;
    for (let index = 0; index < e09Limits.chunks; index++) {
      const remaining = deadline - performance.now();
      e09Require(remaining > 0, "timeout");
      const chunk = await e09Within(read(e09Limits.chunk), Math.min(remaining, e09Limits.commandMs));
      e09Require(typeof chunk.data === "string" && typeof chunk.eof === "boolean"
        && (chunk.base64Encoded === undefined || typeof chunk.base64Encoded === "boolean"), "stream");
      e09Require(chunk.base64Encoded || (chunk.data.length <= e09Limits.chunk && Buffer.byteLength(chunk.data) <= e09Limits.chunk), "overflow");
      const bytes = chunk.base64Encoded ? e09Base64(chunk.data, e09Limits.chunk, "stream") : Buffer.from(chunk.data, "utf8");
      e09Require(bytes.length <= e09Limits.chunk && used + bytes.length <= e09Limits.body, "overflow");
      e09Require(chunk.base64Encoded || bytes.toString("utf8") === chunk.data, "stream");
      e09Require(bytes.length > 0 || chunk.eof, "stream");
      bytes.copy(body, used);
      used += bytes.length;
      if (chunk.eof) return body.subarray(0, used);
    }
    throw new E09Error("overflow");
  }
  function e09Projection(body: Buffer, context: string, ownBooking: string, otherBooking: string) {
    // Pinned production Flight action envelope root points to the settled
    // action result row. A UUID anywhere in an unrelated row is insufficient.
    let text: string;
    try { text = new TextDecoder("utf-8", { fatal: true }).decode(body); }
    catch { throw new E09Error("projection"); }
    const lines = text.split("\n");
    const find = (row: string) => {
      const found = lines.filter(line => line.startsWith(row + ":"));
      e09Require(found.length === 1, "projection");
      return e09Object(e09Parse(found[0].slice(row.length + 1)));
    };
    const action = find("0")?.a;
    e09Require(typeof action === "string" && /^\$@[a-f0-9]+$/.test(action), "projection");
    const result = find(action.slice(2)), data = e09Object(result?.data);
    e09Require(result?.ok === true && result.renderContextKey === context
      && data?.date === REPORT_DATE && data.mode === "day" && data.noticePage === 1 && Array.isArray(data.bookings), "projection");
    const bookings = data.bookings.map(booking => e09Object(booking)?.id);
    e09Require(bookings.filter(id => id === ownBooking).length === 1 && !bookings.includes(otherBooking), "projection");
  }
  type E09Terminal = { event: "finished" | "failed"; phase: "early" | "late";
    category: "none" | "aborted" | "content-length" | "decoding" | "connection" | "other" };
  type E09Outcome = "not-sent" | "reply-unknown" | "reply-rejected"
    | "accepted-no-terminal" | "accepted-failed" | "accepted-finished";
  function e09FailureCategory(errorText: string): E09Terminal["category"] {
    switch (errorText) {
      case "net::ERR_ABORTED": return "aborted";
      case "net::ERR_CONTENT_LENGTH_MISMATCH": return "content-length";
      case "net::ERR_CONTENT_DECODING_FAILED": return "decoding";
      case "net::ERR_CONNECTION_ABORTED":
      case "net::ERR_CONNECTION_CLOSED":
      case "net::ERR_CONNECTION_FAILED":
      case "net::ERR_CONNECTION_REFUSED":
      case "net::ERR_CONNECTION_RESET": return "connection";
      default: return "other";
    }
  }
  async function e09Fulfill(send: () => Promise<unknown>, terminal: Promise<E09Terminal>, accept: () => void, ms = e09Limits.commandMs,
    terminalMs = e09Limits.terminalMs): Promise<E09Outcome> {
    try {
      const reply = await e09Within(send(), ms);
      // A successful direct Chromium Fetch.fulfillRequest result is empty.
      if (!e09Object(reply) || Object.keys(reply as object).length !== 0) return "reply-unknown";
    } catch (error) {
      // Playwright's pinned CRSession formats a reply error using the actual
      // command method. Session closure/timeout have no such reply proof.
      return error instanceof Error && /^(?:cdpSession\.send: )?Protocol error \(Fetch\.fulfillRequest\): /.test(error.message)
        ? "reply-rejected" : "reply-unknown";
    }
    accept();
    try {
      const observed = await e09Within(terminal, terminalMs, "missing-terminal");
      if (observed.phase !== "late") return "accepted-no-terminal";
      return observed.event === "finished" ? "accepted-finished" : "accepted-failed";
    } catch { return "accepted-no-terminal"; }
  }
  // E09_REPLAY_HELPERS_END

  function e09Transport(session: CDPSession, url: string, frameId: string, action: Awaited<ReturnType<typeof e09BuildActionIds>>,
    marker: string, context: string, ownBooking: string, otherBooking: string) {
    const ready = barrier<void>(), terminal = barrier<E09Terminal>();
    const sessionClosed = barrier<void>();
    const pending = new Set<Promise<void>>();
    let selection: { networkId: string; args: string; fetchId?: string } | undefined;
    let prepared: { headers: E09Header[]; body: Buffer } | undefined;
    let failure: E09Failure | undefined, observed: E09Terminal | undefined;
    let outcome: E09Outcome = "not-sent";
    let sent = false, accepted = false, closing = false, closed = false, filing = 0, nonTargets = 0;
    let sessionClose: "before-send" | "awaiting-reply" | "after-accepted" | null = null;
    let stream: string | undefined, taking = false, eof = false;
    const fail = (category: E09Failure) => {
      failure ??= category;
      ready.reject(new E09Error(category));
    };
    const check = () => { if (failure) throw new E09Error(failure); };
    const sameRoute = (request: E09Request, frame: string | undefined) => request.url === url
      && request.method === "POST" && frame === frameId;
    const onNetwork = (event: { requestId: string; frameId?: string; request: E09Request; redirectResponse?: unknown }) => {
      if (closing) return;
      try {
        e09Require(!selection || event.requestId !== selection.networkId, "binding");
        if (!sameRoute(event.request, event.frameId)) return;
        const id = e09RequestHeader(event.request, "next-action");
        if (id !== action.file && id !== action.read) return;
        e09Require(!event.redirectResponse && !!event.requestId, "binding");
        const { raw, argument } = e09Args(event.request);
        if (id === action.file) {
          e09Require(filing === 0 && !selection && argument.note === marker, "filing");
          e09Require(typeof argument.attemptId === "string"
            && /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(argument.attemptId)
            && typeof argument.date === "string" && Number.isInteger(argument.minutes), "filing");
          filing++;
        } else {
          e09Require(filing === 1 && !selection, "binding");
          e09ReadArgs(argument);
          selection = { networkId: event.requestId, args: raw };
        }
      } catch (error) { fail(error instanceof E09Error ? error.category : "binding"); }
    };
    const onTerminal = (requestId: string, event: E09Terminal["event"], category: E09Terminal["category"]) => {
      if (closing || requestId !== selection?.networkId) return;
      if (observed) { fail("binding"); return; }
      observed = { event, category, phase: sent ? "late" : "early" };
      terminal.resolve(observed);
      if (!sent) fail("early-terminal");
    };
    const onFinished = ({ requestId }: { requestId: string }) => onTerminal(requestId, "finished", "none");
    const onFailed = ({ requestId, errorText }: { requestId: string; errorText: string }) =>
      onTerminal(requestId, "failed", e09FailureCategory(errorText));
    const onClose = () => {
      closed = true;
      sessionClosed.resolve(undefined);
      if (closing) return;
      sessionClose = !sent ? "before-send" : accepted ? "after-accepted" : "awaiting-reply";
      if (!sent) fail("session-closed");
      if (!observed) terminal.reject(new E09Error("session-closed"));
    };
    const onPaused = (event: {
      requestId: string; networkId?: string; frameId: string; request: E09Request; responseStatusCode?: number;
      responseErrorReason?: string; redirectedRequestId?: string; responseHeaders?: E09Header[];
    }) => {
      if (closing) return;
      let target = false;
      const pause = async () => {
        target = sameRoute(event.request, event.frameId) && e09RequestHeader(event.request, "next-action") === action.read;
        if (!target && (!selection || event.networkId !== selection.networkId)) {
          e09Require(++nonTargets <= e09Limits.nonTargets, "overflow");
          await e09Within(session.send("Fetch.continueRequest", { requestId: event.requestId }), e09Limits.commandMs);
          return;
        }
        e09Require(target && selection && !!event.requestId && event.networkId === selection.networkId
          && !selection.fetchId && !event.redirectedRequestId, "binding");
        selection.fetchId = event.requestId;
        check();
        // Fetch may omit post data. Use its exact same-session Network ID
        // to read the payload and reject any conflicting bytes or argument.
        const supplied = event.request.postData !== undefined || event.request.postDataEntries !== undefined;
        const fallback = supplied ? undefined : (await e09Within(
          session.send("Network.getRequestPostData", { requestId: selection.networkId }), e09Limits.commandMs)).postData;
        const { raw, argument } = e09Args(event.request, fallback);
        e09ReadArgs(argument);
        e09Require(raw === selection.args && event.responseStatusCode === 200 && !event.responseErrorReason, "binding");
        const { headers, expectedBytes } = e09ResponseHeaders(event.responseHeaders);
        check();
        e09Require(!closing, "cleanup");
        taking = true;
        stream = (await e09Within(session.send("Fetch.takeResponseBodyAsStream", { requestId: selection.fetchId }), e09Limits.commandMs)).stream;
        e09Require(typeof stream === "string" && stream.length > 0, "stream");
        const body = await e09ReadBody(size => {
          check();
          e09Require(!closing, "cleanup");
          return session.send("IO.read", { handle: stream!, size });
        });
        eof = true;
        await e09Within(session.send("IO.close", { handle: stream }), e09Limits.commandMs);
        stream = undefined;
        e09Require(expectedBytes === undefined || expectedBytes === body.length, "headers");
        e09Projection(body, context, ownBooking, otherBooking);
        check();
        prepared = { headers: [...headers, { name: "content-length", value: String(body.length) }], body };
        ready.resolve(undefined);
      };
      if (pending.size >= e09Limits.nonTargets) { fail("overflow"); return; }
      const work = pause().catch(error => fail(error instanceof E09Error ? error.category : target ? "stream" : "continued-request"));
      pending.add(work);
      void work.then(() => pending.delete(work));
    };
    session.on("Network.requestWillBeSent", onNetwork);
    session.on("Network.loadingFinished", onFinished);
    session.on("Network.loadingFailed", onFailed);
    session.on("Fetch.requestPaused", onPaused);
    session.on("close", onClose);
    return {
      async enable() {
        await e09Within(session.send("Network.enable", { maxPostDataSize: e09Limits.arguments }), e09Limits.commandMs);
        await e09Within(session.send("Fetch.enable", { patterns: [{ urlPattern: url + "*", requestStage: "Response" }] }), e09Limits.commandMs);
      },
      waitUntilHeld: () => e09Within(ready.promise, e09Limits.selectionMs),
      async release() {
        check();
        e09Require(selection?.fetchId && prepared && !sent && !observed && eof && !stream, "binding");
        const { fetchId } = selection;
        const { headers, body } = prepared;
        prepared = undefined;
        const encoded = body.toString("base64");
        e09Require(encoded.length <= 4 * Math.ceil(e09Limits.body / 3), "overflow");
        // EOF proves only that CDP exposed all bytes. Both the replacement
        // reply and the original Network ID's late terminal are required.
        sent = true;
        outcome = await e09Fulfill(() => session.send("Fetch.fulfillRequest", {
          requestId: fetchId, responseCode: 200, responseHeaders: headers, body: encoded,
        }), terminal.promise, () => { accepted = true; });
      },
      requireSuccess() {
        check();
        if (outcome === "reply-rejected") throw new E09Error("rejected-reply");
        if (outcome === "accepted-no-terminal") throw new E09Error("missing-terminal");
        if (outcome === "accepted-failed") throw new E09Error("late-failure");
        e09Require(outcome === "accepted-finished" && filing === 1, "missing-reply");
      },
      async cleanup(page: Page) {
        closing = true;
        prepared = undefined;
        let clean = !closed;
        try {
          await e09Within(Promise.all(pending), e09Limits.streamMs, "cleanup");
          if (stream) {
            await e09Within(session.send("IO.close", { handle: stream }), e09Limits.commandMs, "cleanup");
            stream = undefined;
          }
          if (failure || (taking && !eof) || (selection && !selection.fetchId)
            || outcome === "reply-unknown" || outcome === "accepted-no-terminal") {
            // Close the fixture target when a paused response is ambiguous.
            // CDP also forbids changing requests before stream EOF.
            await e09Within(page.close(), e09Limits.commandMs, "cleanup");
            e09Require(page.isClosed(), "cleanup");
            await e09Within(sessionClosed.promise, e09Limits.commandMs, "cleanup");
          } else {
            if (selection?.fetchId && !observed) {
              await e09Within(session.send("Fetch.failRequest", {
                requestId: selection.fetchId, errorReason: "Aborted",
              }), e09Limits.commandMs, "cleanup");
            }
            await e09Within(session.send("Fetch.disable"), e09Limits.commandMs, "cleanup");
            await e09Within(session.send("Network.disable"), e09Limits.commandMs, "cleanup");
            await e09Within(session.detach(), e09Limits.commandMs, "cleanup");
          }
        } catch {
          clean = false;
          await e09Within(page.close(), e09Limits.commandMs, "cleanup").catch(() => undefined);
        } finally {
          session.off("Network.requestWillBeSent", onNetwork);
          session.off("Network.loadingFinished", onFinished);
          session.off("Network.loadingFailed", onFailed);
          session.off("Fetch.requestPaused", onPaused);
          session.off("close", onClose);
        }
        e09Require(clean, "cleanup");
        check();
      },
      record() { return { outcome, terminal: observed ?? null, sessionClose }; },
    };
  }

  privateE09("[P0] 15.6-E09 a real tenant-switch RSC navigation discards the prior report owner and ignores its late read", async ({ resourcePage: page }, testInfo) => {
    let stage: "setup" | "a-ui" | "held-read" | "durability" | "b-navigation" | "b-ui" | "release" | "late-isolation" = "setup";
    let failure: E09Failure | undefined, cleanupFailed = false;
    let transport: ReturnType<typeof e09Transport> | undefined;
    const remember = (error: unknown, fallback: E09Failure) => { failure ??= error instanceof E09Error ? error.category : fallback; };
    const verifyUi = async (predicate: () => Promise<boolean>) => {
      await e09Within((async () => {
        const deadline = performance.now() + 15000;
        while (performance.now() < deadline) {
          if (await predicate()) return;
          await new Promise(resolve => setTimeout(resolve, 50));
        }
        throw new E09Error("journey");
      })(), 15000, "journey");
    };
    try {
      const baseURL = testInfo.project.use.baseURL;
      e09Require(baseURL, "setup");
      const url = new URL("/my-day", baseURL);
      const action = await e09BuildActionIds();
      await withMyDayFixture(async f => {
        const tenantA = f.fx.base.tenantA.id, tenantB = f.fx.base.tenantB.id;
        const user = f.fx.users.montor;
        const contextA = createHash("sha256").update(JSON.stringify([user.id, tenantA])).digest("hex");
        const membershipB = randomUUID(), profileB = randomUUID(), bookingB = randomUUID();
        const markerB = `my-day-current-context-${randomUUID()}`;
        const dateB = new Intl.DateTimeFormat("sv-SE", { timeZone: "Europe/Stockholm" }).format(new Date());
        let session: CDPSession | undefined;
        let attaching = false;
        try {
          await page.setViewportSize({ width: 1280, height: 800 });
          const before = await f.snapshot();
          // Deterministic authority: A is older until explicitly revoked.
          // Both tenants and every row here belong to this factory invocation.
          await adminQuery(`insert into public.tenant_memberships(id,tenant_id,user_id,role,status,created_at)
            select $1,$2,$3,'montor','active',created_at + interval '1 day'
            from public.tenant_memberships where tenant_id=$4 and id=$5`,
            [membershipB, tenantB, user.id, tenantA, f.fx.ownProfile.membershipId]);
          await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id) values($1,$2,$3)", [profileB, tenantB, membershipB]);
          await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,description,create_command_id,create_payload_digest,create_result)
            values($1,$2,$3,$4,$5,$6,repeat('a',64),jsonb_build_object('bookingId',$1::uuid::text))`,
            [bookingB, tenantB, `${dateB}T06:00:00Z`, `${dateB}T07:00:00Z`, markerB, randomUUID()]);
          await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)", [tenantB, bookingB, profileB]);

          // The same real login/date/keyboard path, with value-free assertion
          // failures for this case's reporters.
          stage = "a-ui";
          await page.context().clearCookies();
          await page.goto(new URL("/login", url).href);
          const login = page.getByRole("button", { name: "Logga in", exact: true });
          await hydrated(login);
          await page.getByLabel("E-post", { exact: true }).fill(user.email);
          await page.getByLabel("Lösenord", { exact: true }).fill(user.password);
          await login.click();
          await verifyUi(async () => new URL(page.url()).pathname !== "/login");
          await page.goto(url.href);
          const selected = page.getByLabel("Datum", { exact: true });
          await hydrated(selected);
          await selected.fill(REPORT_DATE);
          await verifyUi(async () => (await selected.inputValue()) === REPORT_DATE);
          await verifyUi(() => bookingCard(page, f.ownBooking).isVisible());
          await verifyUi(async () => (await bookingCard(page, bookingB).count()) === 0);
          const reportBooking = jobsActive ? f.ownBooking : f.jobless;
          await bookingCard(page, reportBooking).getByRole("button", { name: "Rapportera tid", exact: true }).click();
          const form = filingDialog(page);
          await form.getByLabel("Anteckning", { exact: true }).fill(f.marker);
          const submit = form.getByRole("button", { name: "Rapportera tid", exact: true });
          await submit.focus();
          await verifyUi(() => submit.evaluate(element => document.activeElement === element));

          stage = "held-read";
          attaching = true;
          session = await e09Within(page.context().newCDPSession(page), e09Limits.commandMs);
          const { product } = await e09Within(session.send("Browser.getVersion"), e09Limits.commandMs);
          e09Require(/^(?:Headless)?Chrome\/149\.0\.7827\.55$/.test(product), "setup");
          const { frameTree: { frame } } = await e09Within(session.send("Page.getFrameTree"), e09Limits.commandMs);
          e09Require(frame.url === url.href && !!frame.id && !frame.parentId, "binding");
          transport = e09Transport(session, url.href, frame.id, action, f.marker, contextA, f.ownBooking, bookingB);
          await transport.enable();
          await page.keyboard.press("Enter");
          await transport.waitUntilHeld();

          stage = "durability";
          await verifyUi(async () => (await form.getByTestId("time-report-submit-status").textContent())?.trim() === "Rapporterad");
          const durable = await f.snapshot();
          const rows = durable.reports.filter(row => row.note === f.marker);
          e09Require(rows.length === 1 && rows[0].tenant_id === tenantA && rows[0].user_id === user.id
            && rows[0].booking_id === reportBooking && rows[0].job_id === (jobsActive ? f.job.id : null)
            && rows[0].status === "submitted", "journey");
          e09Require(durable.reports.length - before.reports.length === 1
            && durable.audit.filter(row => row.target_id === rows[0].id).length === 1, "journey");
          await page.keyboard.press("Escape");
          await verifyUi(async () => (await form.count()) === 0);
          await adminQuery("update public.tenant_memberships set status='disabled' where tenant_id=$1 and id=$2",
            [tenantA, f.fx.ownProfile.membershipId]);

          // ACTION_NAVIGATE preempts the queued refresh. The actual same-page
          // link performs a new force-dynamic B RSC navigation while A is held.
          stage = "b-navigation";
          const [reply] = await Promise.all([
            page.waitForResponse(response => {
              const target = new URL(response.url()), request = response.request();
              return target.origin === url.origin && target.pathname === url.pathname
                && request.method() === "GET" && request.headers()["rsc"] === "1";
            }, { timeout: 15000 }),
            page.getByRole("link", { name: "Min dag", exact: true }).filter({ visible: true }).click(),
          ]);
          e09Require(reply.ok(), "journey");
          const bCard = bookingCard(page, bookingB);
          const hasB = async () => (await bCard.textContent())?.includes(markerB) === true;
          stage = "b-ui";
          await verifyUi(async () => (await page.getByLabel("Datum", { exact: true }).inputValue()) === dateB);
          await verifyUi(hasB);
          await verifyUi(async () => (await bookingCard(page, f.ownBooking).count()) === 0);
          await verifyUi(async () => (await form.count()) === 0);

          stage = "release";
          await transport.release();
          stage = "late-isolation";
          // Preserve the post-release UI and persistence assertions even
          // when the diagnostic observed a reply rejection or native failure.
          await e09Within(page.evaluate(() => new Promise<void>(resolve => requestAnimationFrame(() => requestAnimationFrame(() => resolve())))),
            e09Limits.commandMs, "journey");
          await verifyUi(hasB);
          await verifyUi(async () => (await agenda(page).getByRole("article").count()) === 1);
          for (const id of [f.ownBooking, f.shared, f.jobless, f.missingBooking, f.allDay]) {
            await verifyUi(async () => (await bookingCard(page, id).count()) === 0);
          }
          await verifyUi(async () => (await ownJobs(page).getByRole("link").count()) === 0);
          await verifyUi(async () => (await form.count()) === 0);
          await verifyUi(async () => (await page.getByTestId(`time-report-entry-${reportBooking}`).count()) === 0);
          e09Require(isDeepStrictEqual(await f.snapshot(), durable), "journey");
          transport.requireSuccess();
        } catch (error) {
          remember(error, "journey");
        } finally {
          try {
            if (transport) await transport.cleanup(page);
            else if (session) await e09Within(session.detach(), e09Limits.commandMs, "cleanup");
            else if (attaching) {
              await e09Within(page.close(), e09Limits.commandMs, "cleanup");
              e09Require(page.isClosed(), "cleanup");
            }
          } catch (error) {
            if (!(error instanceof E09Error) || error.category === "cleanup") cleanupFailed = true;
            remember(error, "cleanup");
          }
          const cleanupQueries = [
            ["update public.tenant_memberships set status='active' where tenant_id=$1 and id=$2", [tenantA, f.fx.ownProfile.membershipId]],
            ["delete from public.booking_assignees where tenant_id=$1 and booking_id=$2", [tenantB, bookingB]],
            ["delete from public.bookings where tenant_id=$1 and id=$2", [tenantB, bookingB]],
            ["delete from public.person_profiles where tenant_id=$1 and id=$2", [tenantB, profileB]],
            ["delete from public.membership_roles where tenant_id=$1 and membership_id=$2", [tenantB, membershipB]],
            ["delete from public.tenant_memberships where tenant_id=$1 and id=$2", [tenantB, membershipB]],
          ] as const;
          for (const [sql, args] of cleanupQueries) {
            try { await adminQuery(sql, args); } catch { cleanupFailed = true; }
          }
        }
      }, { e09Strict: true });
    } catch (error) {
      if (stage !== "setup" || (error instanceof E09FixtureError && error.cleanupFailed)) cleanupFailed = true; // Factory teardown can throw after the journey.
      remember(error, "setup");
    }
    try {
      const record = transport?.record() ?? { outcome: "not-sent", terminal: null, sessionClose: null };
      await testInfo.attach("my-day-e09-bounded-replay", {
        contentType: "application/json",
        body: JSON.stringify({ stage, failure: failure ?? null, cleanupFailed, ...record }),
      });
    } catch { failure ??= "cleanup"; }
    if (failure || cleanupFailed) throw new E09Error(failure ?? "cleanup");
  });
});
