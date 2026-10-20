/** Story 11.1 ATDD RED — code-owned multi-role permission matrix. */
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  PERMISSION_MATRIX,
  resolveCapability,
  resolveSensitiveFieldEntitlement,
} from "@/server/authz/permission-matrix";

test("15.1-AC2 scheduling references one exact resource Bookings.View grant", () => {
  assert.equal(PERMISSION_MATRIX.resources["Bookings.View"], PERMISSION_MATRIX.scheduling["Bookings.View"]);
  assert.deepEqual(PERMISSION_MATRIX.scheduling["Bookings.View"].roles, ["tenant_admin", "projektledare", "montor"]);
  assert.deepEqual(PERMISSION_MATRIX.resources["Bookings.Manage"].roles, ["tenant_admin", "projektledare"]);
  assert.equal(resolveCapability({roles:["montor"],module:"scheduling",capability:"Bookings.Manage"}).granted, false);
});

test("[P0] 11.1-UNIT-001 legacy tenant_admin remains a role when membership_roles has no rows", () => {
  assert.equal(
    resolveCapability({ roles: ["tenant_admin"], module: "foundation", capability: "Memberships.Manage" }).granted,
    true,
  );
});

test("[P0] 11.1-UNIT-002 permission decisions are an order-independent union of held roles", () => {
  const forward = resolveCapability({ roles: ["montor", "saljare"], module: "quotes", capability: "Quotes.ViewSalesPrice" });
  const reverse = resolveCapability({ roles: ["saljare", "montor"], module: "quotes", capability: "Quotes.ViewSalesPrice" });
  assert.equal(forward.granted, true);
  assert.deepEqual(reverse, forward);
});

test("[P0] 11.1-UNIT-003 omitted, empty, unknown, or malformed matrix inputs deny by default", () => {
  for (const input of [
    { roles: [], module: "foundation", capability: "Memberships.Manage" },
    { roles: ["unknown"], module: "foundation", capability: "Memberships.Manage" },
    { roles: ["tenant_admin"], module: "unknown", capability: "Read" },
    { roles: ["tenant_admin"], module: "foundation", capability: "unknown" },
  ]) assert.equal(resolveCapability(input).granted, false);
});

test("[P0] 11.1-UNIT-006 malformed injected permission matrices deny fail-closed", () => {
  for (const matrix of [
    null,
    "not-a-matrix",
    { foundation: { "Memberships.Manage": {} } },
    { foundation: { "Memberships.Manage": { roles: "tenant_admin" } } },
    { foundation: { "Memberships.Manage": { roles: ["unknown_role"] } } },
  ]) {
    assert.equal(
      resolveCapability({
        roles: ["tenant_admin"],
        module: "foundation",
        capability: "Memberships.Manage",
        matrix,
      }).granted,
      false,
    );
  }
});

test("[P0] 11.1-UNIT-004 a sensitive field is withheld only when no held role grants it", () => {
  assert.equal(resolveSensitiveFieldEntitlement({ roles: ["montor", "projektledare"], module: "quotes", field: "cost_price_ore" }).withheld, false);
  assert.equal(resolveSensitiveFieldEntitlement({ roles: ["montor", "saljare"], module: "quotes", field: "cost_price_ore" }).withheld, true);
});

test("14.2 booking read/write capabilities preserve Montor own-read permission and deny mutation",()=>{
 for(const role of ["tenant_admin","projektledare","montor","saljare","ekonomi"]){
  assert.equal(resolveCapability({roles:[role],module:"resources",capability:"Bookings.View"}).granted,["tenant_admin","projektledare","montor"].includes(role));
  assert.equal(resolveCapability({roles:[role],module:"resources",capability:"Bookings.Manage"}).granted,["tenant_admin","projektledare"].includes(role));
 }
});


test("15.4 ReportOwn and Review preserve the exact reporting/reviewer role union", () => {
  assert.deepEqual(PERMISSION_MATRIX.scheduling["TimeReports.ReportOwn"].roles, ["tenant_admin", "projektledare", "montor"]);
  assert.deepEqual(PERMISSION_MATRIX.scheduling["TimeReports.Review"].roles, ["tenant_admin", "projektledare"]);
  for (const role of ["tenant_admin", "projektledare", "montor", "saljare", "ekonomi"] as const) {
    assert.equal(resolveCapability({roles:[role],module:"scheduling",capability:"TimeReports.ReportOwn"}).granted, ["tenant_admin","projektledare","montor"].includes(role));
    assert.equal(resolveCapability({roles:[role],module:"scheduling",capability:"TimeReports.Review"}).granted, ["tenant_admin","projektledare"].includes(role));
  }
  assert.equal(resolveCapability({roles:["saljare","montor"],module:"scheduling",capability:"TimeReports.ReportOwn"}).granted,true);
  assert.equal(resolveCapability({roles:["saljare","montor"],module:"scheduling",capability:"TimeReports.Review"}).granted,false);
  assert.equal(resolveCapability({roles:["ekonomi","projektledare"],module:"scheduling",capability:"TimeReports.Review"}).granted,true);
});
