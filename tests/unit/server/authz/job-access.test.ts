import { test } from "node:test";
import assert from "node:assert/strict";
import { jobAccess } from "@/server/authz/job-access";
import { resolveCapability, resolveSensitiveFieldEntitlement } from "@/server/authz/permission-matrix";

/**
 * Story 16.2 AC03/04 presentation descriptors, never SQL authorization evidence.
 * jobAccess is the ACTUAL existing function. The optional second argument and
 * three scoped fields below are a PROPOSED trusted-server-facts adapter contract,
 * not a frozen production DTO. Adapt to the implementation without weakening
 * role/relationship assertions. Never pass client assertions as trusted facts.
 * Direct RPC, locks, current eligibility and revocation are integration coverage.
 */
type TrustedJobFacts = {
  readonly tenantId: string;
  readonly jobId: string;
  readonly actorMembershipActive: boolean;
  readonly actorProfileActive: boolean;
  readonly currentLead: { readonly tenantId: string; readonly jobId: string } | null;
};
type ScopedDescriptor = ReturnType<typeof jobAccess> & {
  readonly canManageCrew?: boolean;
  readonly canSetLead?: boolean;
  readonly canUpdatePlannedDates?: boolean;
};
const scopedJobAccess = jobAccess as unknown as (
  roles: readonly unknown[] | undefined, trusted?: TrustedJobFacts
) => ScopedDescriptor;

const tenantA = "tenant-A";
const jobA = "job-A";
const jobB = "job-B";
function ownLead(overrides: Partial<TrustedJobFacts> = {}): TrustedJobFacts {
  return {
    tenantId: tenantA, jobId: jobA, actorMembershipActive: true,
    actorProfileActive: true, currentLead: { tenantId: tenantA, jobId: jobA }, ...overrides,
  };
}

test.skip("[P0] 16.2-AUTHZ-001 current lead of any nonmanager role gets own-job crew/dates without full-card or designation", () => {
  for (const role of ["saljare", "ekonomi", "montor"]) {
    const access = scopedJobAccess([role], ownLead());
    // Deliberate bounded RED probe: existing function returns undefined here.
    assert.equal(access.canManageCrew, true, role);
    assert.equal(access.canUpdatePlannedDates, true, role);
    assert.equal(access.canSetLead, false, role);
    assert.equal(access.edit, false, role);
    assert.equal(access.create, false, role);
    assert.equal(access.viewAll, false, role);
    assert.equal(access.viewAssigned, true, role);
    assert.equal(resolveCapability({ roles: [role], module: "jobs", capability: "Jobs.Edit" }).granted, false);
  }
});

test.skip("[P0] 16.2-AUTHZ-002 lead A cannot manage B and absent/revoked/foreign lead facts fail closed", () => {
  const deniedFacts: (TrustedJobFacts | undefined)[] = [
    undefined,
    ownLead({ jobId: jobB }),
    ownLead({ currentLead: null }),
    ownLead({ actorMembershipActive: false }),
    ownLead({ actorProfileActive: false }),
    ownLead({ currentLead: { tenantId: "tenant-B", jobId: jobA } }),
  ];
  for (const facts of deniedFacts) {
    const access = scopedJobAccess(["saljare"], facts);
    assert.equal(access.canManageCrew, false);
    assert.equal(access.canUpdatePlannedDates, false);
    assert.equal(access.canSetLead, false);
    assert.equal(access.edit, false);
    assert.equal(access.viewAll, false);
    assert.equal(access.viewAssigned, false);
  }
});

test.skip("[P0] 16.2-AUTHZ-003 independent manager union keeps existing rights and money remains separately entitled", () => {
  for (const managerRole of ["tenant_admin", "projektledare"]) {
    for (const roles of [[managerRole, "montor"], ["montor", managerRole]]) {
      const access = scopedJobAccess(roles, ownLead({ currentLead: null }));
      assert.equal(access.canManageCrew, true);
      assert.equal(access.canUpdatePlannedDates, true);
      assert.equal(access.canSetLead, true);
      assert.equal(access.edit, true);
      assert.equal(access.create, true);
      assert.equal(access.viewAll, true);
    }
  }
  // Designation cannot become a blanket JobEdit or money grant. Existing
  // independent Säljare/Ekonomi money rights remain effective as their own union.
  assert.equal(scopedJobAccess(["montor"], ownLead()).edit, false);
  assert.equal(resolveSensitiveFieldEntitlement({
    roles: ["montor"], module: "quotes", field: "cost_price_ore",
  }).withheld, true);
  assert.equal(resolveSensitiveFieldEntitlement({
    roles: ["montor", "saljare"], module: "quotes", field: "sales_price_ore",
  }).withheld, false);
  assert.equal(resolveSensitiveFieldEntitlement({
    roles: ["montor", "saljare"], module: "quotes", field: "cost_price_ore",
  }).withheld, true);
  assert.equal(resolveSensitiveFieldEntitlement({
    roles: ["montor", "ekonomi"], module: "quotes", field: "cost_price_ore",
  }).withheld, false);
});
