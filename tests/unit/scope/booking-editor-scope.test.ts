/**
 * Skipped RED new editor scope contract with actual manifest continuity.
 * RED is the missing real editor binding, not the already-passing manifest.
 * Checks rendered controls/links; no product source scans or UI execution claim.
 */
import assert from "node:assert/strict";
import { test } from "node:test";
import { SCOPE_MANIFEST } from "@/scope/manifest";
import { booking } from "@/tests-support/booking-editor-contract";
import { validateCreateBooking } from "@/server/commands/bookings/validation";

// RED: missing actual production binding; activate task-by-task and confirm failure before implementation.
test("[P0] 14.4-GOV-001 active resources command rejects E15 fields while scheduling activation retains future E15 command exclusions", () => {
  const resources = SCOPE_MANIFEST.modules.find((module) => module.id === "resources");
  const scheduling = SCOPE_MANIFEST.modules.find((module) => module.id === "scheduling");
  assert.equal(resources?.status, "active");
  assert.equal(scheduling?.status, "active");
  assert.deepEqual(scheduling?.navItems, [{route:"/scheduling",group:"primary",requiredCapability:"Bookings.View"},{route:"/my-day",group:"primary",requiredCapability:"Bookings.View"},{route:"/time-reports",group:"primary",requiredCapability:"TimeReports.ReportOwn"}]);
  for (const surface of ["tenantTables", "widgets", "notificationCategories", "publicSurfaces", "fileOwnerTypes"] as const) {
    assert.deepEqual(scheduling?.[surface], surface === "tenantTables" ? ["booking_series", "booking_conflict_resolutions", "time_reports", "calendar_feed_tokens"] : surface === "notificationCategories" ? ["booking.changed", "time_report.nudge"] : surface === "publicSurfaces" ? ["calendar_feed"] : [], surface);
  }
  const input = {...booking(),commandId: "aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa"};
  assert.equal(validateCreateBooking(input).ok, true);
  for (const forbidden of ["recurrencePattern", "recurrenceUntil", "occurrenceScope", "reportTime", "resolveConflict", "calendarFeed", "notifyAssignees"]) {
    assert.deepEqual(validateCreateBooking({...input,[forbidden]: "unauthorized"}), {ok: false,code: "VALIDATION_FAILED"}, forbidden);
  }
});
