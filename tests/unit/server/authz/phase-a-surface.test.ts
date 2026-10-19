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

// Route admission never substitutes for SQL member/assignee row scope.
test("16.1 assigned jobs navigation admits Montor direct job routes without unrelated routes", () => {
  assert.equal(canAccessPhaseARoute(["montor"], "/jobs"), true);
  assert.equal(canAccessPhaseARoute(["montor"], "/jobs/any-candidate-id"), true);
  assert.equal(canAccessPhaseARoute(["montor"], "/customers"), false);
  assert.equal(resolvePhaseANavigation(["montor"]).filter((item) => item.href === "/jobs").length, 1);
});
