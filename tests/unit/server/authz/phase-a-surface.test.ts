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
  assert.equal(resolveLandingRoute(["montor"]), "/my-day");
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

// Route admission never substitutes for SQL member/assignee row scope.
test("16.1 assigned jobs navigation admits Montor direct job routes without unrelated routes", () => {
  assert.equal(canAccessPhaseARoute(["montor"], "/jobs"), true);
  assert.equal(canAccessPhaseARoute(["montor"], "/jobs/any-candidate-id"), true);
  assert.equal(canAccessPhaseARoute(["montor"], "/customers"), false);
  assert.equal(resolvePhaseANavigation(["montor"]).filter((item) => item.href === "/jobs").length, 1);
});


test("[P0] 16.2 trusted lead admission adds jobs only while tenant landing and unrelated routes remain role based", () => {
  for (const role of ["saljare", "ekonomi"] as const) {
    const ordinary = resolvePhaseANavigation([role]);
    const lead = resolvePhaseANavigation([role], true);
    assert.deepEqual(lead.filter((item) => item.href !== "/jobs"), ordinary);
    assert.equal(lead.some((item) => item.href === "/jobs"), true);
    assert.equal(canAccessPhaseARoute([role], "/jobs/own-job", true), true);
    assert.equal(canAccessPhaseARoute([role], "/jobs", false), false);
    assert.equal(canAccessPhaseARoute([role], "/settings", true), false);
  }
});

// Story 15.6 RED: append-only; historical active assertions remain untouched.
test("[P0] 15.6-UNIT-A01 AC1 normalized pure Montor lands on the single authorized Min dag item", () => {
  for (const roles of [["montor"], ["montor", "montor"], ["unknown", "montor", null]]) {
    assert.equal(resolveLandingRoute(roles), "/my-day");
    assert.equal(resolvePhaseANavigation(roles).filter(item => item.href === "/my-day").length, 1);
  }
  assert.equal(canAccessPhaseARoute(["montor"], "/my-day"), true);
});

test("[P0] 15.6-UNIT-A02 AC1 mixed office unions preserve existing office landing priority regardless of order", () => {
  for (const office of ["tenant_admin", "projektledare", "saljare", "ekonomi"] as const) {
    const expected = resolveLandingRoute([office]);
    assert.equal(expected, "/dashboard");
    assert.equal(resolveLandingRoute([office, "montor"]), expected);
    assert.equal(resolveLandingRoute(["montor", office, office]), expected);
  }
});

test("[P0] 15.6-UNIT-A03 AC1 absent Bookings.View has no direct/nav grant and no landing loop", () => {
  for (const role of ["saljare", "ekonomi"] as const) {
    assert.equal(canAccessPhaseARoute([role], "/my-day"), false);
    assert.equal(resolvePhaseANavigation([role]).some(item => item.href === "/my-day"), false);
    assert.equal(resolveLandingRoute([role]), "/dashboard");
  }
  assert.equal(canAccessPhaseARoute([], "/my-day"), false);
  assert.equal(resolveLandingRoute([]), null);
  assert.equal(resolveLandingRoute(["unknown"]), null);
});
