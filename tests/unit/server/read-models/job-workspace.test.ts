import { test } from "node:test";
import assert from "node:assert/strict";
import type { WorkspaceHeader } from "../../../support/job-workspace-atdd";

// Proposed pure header binding; adapt its signature to the final production projection,
// retaining all privacy/identity assertions. It must never perform directory reads.
async function header(detail: Record<string, unknown>, members: unknown, options?: unknown): Promise<WorkspaceHeader> {
  const path = "@/server/read-models/job-workspace";
  const binding = await import(path) as { projectJobWorkspaceHeader: (detail: Record<string, unknown>, members: unknown, options?: unknown) => WorkspaceHeader };
  return binding.projectJobWorkspaceHeader(detail, members, options);
}
const detail = (type: "order" | "projekt" = "order") => ({ id: "job", type, title: "Byt elcentral", status: "in_progress",
  currentCustomerName: "Verkstaden", facilityName: "Hall A", contactName: "Kontaktperson",
  plannedStartDate: "2026-10-21", plannedEndDate: "2026-10-23",
  card: { responsible_project_manager_id: "pl" } });
const members = { ok: true, projection: { members: [{ id: "member", personProfileId: "pl", label: "Projektledare", designation: "arbetsledare" }], leadPersonProfileId: "pl" } };

test.skip("[P0] 16.5-UNIT-HEADER-01 Order and Projekt retain real identity, chips, dates and authorized labels", async () => {
  for (const type of ["order", "projekt"] as const) {
    assert.deepEqual(await header(detail(type), members), { id: "job", type, title: "Byt elcentral", status: "in_progress",
      customer: "Verkstaden", site: "Hall A", contact: "Kontaktperson", plannedStartDate: "2026-10-21", plannedEndDate: "2026-10-23",
      responsibleProjectManager: { state: "named", label: "Projektledare" }, lead: { state: "named", label: "Projektledare" } });
  }
});

test.skip("[P0] 16.5-UNIT-HEADER-02 assigned nonmember PL is distinct from unassigned and read failure", async () => {
  const invisible = { ok: true, projection: { members: [], leadPersonProfileId: null } };
  assert.deepEqual((await header(detail(), invisible)).responsibleProjectManager, { state: "assigned-name-unavailable", label: null });
  assert.deepEqual((await header({ ...detail(), card: { responsible_project_manager_id: null } }, invisible)).responsibleProjectManager,
    { state: "unassigned", label: null });
  assert.deepEqual((await header(detail(), { ok: false, message: "Läsningen misslyckades" })).responsibleProjectManager,
    { state: "unavailable", label: null });
});

test.skip("[P0] 16.5-UNIT-HEADER-03 only already entitled manager picker supplies a missing PL name; raw fields never escape", async () => {
  const result = await header({ ...detail(), acceptedPriceOre: 125000, supplier: { name: "Privat" } },
    { ok: true, projection: { members: [], leadPersonProfileId: null } },
    { projectManagers: [{ id: "pl", label: "Ansvarig PL", email: "synthetic@example.test", auth_user_id: "private" }] });
  assert.deepEqual(result.responsibleProjectManager, { state: "named", label: "Ansvarig PL" });
  const serialized = JSON.stringify(result);
  for (const key of ["acceptedPriceOre", "supplier", "email", "auth_user_id", "projectManagers"]) assert.equal(serialized.includes(key), false, key);
});
