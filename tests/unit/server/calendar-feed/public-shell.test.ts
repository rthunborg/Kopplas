import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { test } from "node:test";

// Repo-relative expected file is approved in T4. This source-presence RED probe
// has no browser/server/DB effects and is not runtime public-isolation evidence.
// P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test.skip("[P0] 15.5-UNIT-018 AC7 exact public GET route exists with dynamic no-store behavior", async () => {
  const source = await readFile(resolve(process.cwd(), "src/app/(public)/calendar/feed/[token]/route.ts"), "utf8");
  assert.match(source, /\bGET\b/);
  assert.match(source, /force-dynamic|no-store/);
  assert.doesNotMatch(source, /supabase-server-client|resolveTenantContext|AppShell/);
});
type ShellDriver = { middleware(path: string, hostileCookies: boolean): { authCalls: number; envReadsBeforeBypass: number; cookieCalls: number; bypassed: boolean };
  dependencies(): string[]; effectivePublicSurfaces(): string[] };
async function driver(): Promise<ShellDriver> { throw new Error("15.5 RED: bind actual middleware and transitive containment scanner; no regex-only runtime claim"); }
// P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test.skip("[P0] 15.5-UNIT-019 AC7 only exact single-token public feed bypasses before auth/env/cookies", async () => {
  const subject = await driver(), raw = Buffer.alloc(32, 9).toString("base64url");
  assert.deepEqual(subject.middleware(`/calendar/feed/${raw}`, true), { authCalls: 0, envReadsBeforeBypass: 0, cookieCalls: 0, bypassed: true });
  for (const path of ["/calendar/feed", `/calendar/feed/${raw}/extra`, `/calendar/feed/${raw}/`, "/settings/calendar", `/calendar/feeds/${raw}`]) {
    assert.equal(subject.middleware(path, false).bypassed, false);
  }
});
// P4 RED: activate in P5 after binding the real subject and confirming the failing assertion.
test.skip("[P0] 15.5-UNIT-020 AC7 AC9 transitive imports exclude cookie/session/service/client-secret dependencies", async () => {
  const subject = await driver();
  const closure = subject.dependencies();
  assert.ok(closure.some(path => path.endsWith("supabase-public-client.ts")));
  for (const forbidden of ["supabase-server-client", "resolve-tenant-context", "AppShell", "next/headers", "service-role", "getUser", "refreshSession"]) {
    assert.equal(closure.some(path => path.includes(forbidden)), false, `public transitive dependency ${forbidden}`);
  }
  // ADR-B004 permits three eventual surfaces, but assets is still pending.
  // The active manifest adds calendar_feed to the existing unsubscribe only.
  assert.deepEqual(new Set(subject.effectivePublicSurfaces()), new Set(["calendar_feed", "unsubscribe"]));
});
