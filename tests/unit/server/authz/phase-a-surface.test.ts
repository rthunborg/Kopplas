import assert from "node:assert/strict";
import { test } from "node:test";
import {
  canAccessPhaseARoute,
  resolveLandingRoute,
  resolvePhaseANavigation,
} from "@/server/authz/phase-a-surface";

test("[P0] 11.2-UNIT-001 navigation and landing are derived from the active matrix", () => {
  const sales = resolvePhaseANavigation(["saljare"]);
  assert.deepEqual(sales.map((item) => item.href), ["/dashboard", "/customers", "/quotes"]);
  assert.equal(resolveLandingRoute(["saljare"]), "/dashboard");
  assert.equal(resolveLandingRoute(["montor"]), "/dashboard");
  assert.equal(resolveLandingRoute([]), null);
});

test("[P0] 11.2-UNIT-002 direct route authority denies absent routes and permits role unions", () => {
  assert.equal(canAccessPhaseARoute(["montor"], "/settings"), false);
  assert.equal(canAccessPhaseARoute(["montor"], "/dashboard"), true);
  assert.equal(canAccessPhaseARoute(["montor"], "/files"), false);
  assert.equal(canAccessPhaseARoute(["saljare"], "/calculations"), false);
  assert.equal(canAccessPhaseARoute(["saljare", "projektledare"], "/jobs/abc"), true);
  assert.equal(canAccessPhaseARoute(["unknown" as never], "/dashboard"), false);
});

test("15.1-AC2 scheduling route uses exact existing booking view role unions", () => {
  for (const role of ["tenant_admin", "projektledare", "montor"] as const) assert.equal(canAccessPhaseARoute([role], "/scheduling"), true);
  for (const role of ["saljare", "ekonomi"] as const) assert.equal(canAccessPhaseARoute([role], "/scheduling"), false);
  assert.equal(canAccessPhaseARoute(["saljare", "montor"], "/scheduling"), true);
});
