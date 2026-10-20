/** Story 16.5 RED. Pinned spec C84BE8587D0F84F4BFCCC4B8BB1635B534E687D372FA9086D3CC87350299EE8F.
 * Proposed domain export/signature/tab-query names are replaceable binding assumptions.
 * Expected sets below are independently authored from the approved consumer contract;
 * the resolver is real production authority, never a test-side tab filter or new grant.
 * Lazy variable imports inside skipped bodies keep unimplemented modules collection-safe.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { SCOPE_MANIFEST } from "@/scope/manifest";

type Tab = "overview" | "work-orders" | "schedule" | "files" | "events";
type Domain = {
  availableJobWorkspaceTabs(input: {
    modules: typeof SCOPE_MANIFEST.modules;
    jobAdmitted: boolean;
    can: (module: string, capability: string) => boolean;
  }): readonly { id: Tab; label: string }[];
  selectJobWorkspaceTab(input: {
    availableTabs: readonly Tab[]; tab?: string | null; workOrder?: string | null;
  }): Tab;
  jobWorkspaceHref(input: { jobId: string; tab: Tab; query: URLSearchParams }): string;
};

test.skip("[P0] 16.5-D01 real matrix and manifest yield five manager tabs and current member/lead subsets without implicit grants", async () => {
  const path = "@/features/jobs/job-workspace-domain";
  const domain = await import(path) as Domain;
  const cases = [
    { roles: ["tenant_admin"], admitted: true, expected: ["overview", "work-orders", "schedule", "files", "events"] },
    { roles: ["projektledare"], admitted: true, expected: ["overview", "work-orders", "schedule", "files", "events"] },
    { roles: ["montor"], admitted: true, expected: ["overview", "work-orders", "schedule", "events"] },
    // Current designated Sales lead is admitted by the checked relational root;
    // that relation grants neither tenant-wide Bookings.View nor Files.View.
    { roles: ["saljare"], admitted: true, expected: ["overview", "work-orders", "events"] },
    { roles: ["montor"], admitted: false, expected: [] },
    { roles: ["ekonomi"], admitted: false, expected: [] },
    { roles: ["tenant_admin"], admitted: false, expected: [] },
  ];
  for (const row of cases) {
    const actual = domain.availableJobWorkspaceTabs({ modules: SCOPE_MANIFEST.modules, jobAdmitted: row.admitted,
      can: (module, capability) => resolveCapability({ roles: row.roles, module, capability }).granted });
    assert.deepEqual(actual.map(tab => tab.id), row.expected, JSON.stringify(row));
  }
  const manager = domain.availableJobWorkspaceTabs({ modules: SCOPE_MANIFEST.modules, jobAdmitted: true,
    can: (module, capability) => resolveCapability({ roles: ["projektledare"], module, capability }).granted });
  assert.deepEqual(manager.map(tab => tab.label), ["Översikt", "Arbetsorder", "Schema", "Filer", "Händelser"]);
  assert.equal(resolveCapability({ roles: ["montor"], module: "resources", capability: "Bookings.Manage" }).granted, false);
  assert.equal(resolveCapability({ roles: ["saljare"], module: "files", capability: "Files.View" }).granted, false);
});

test.skip("[P0] 16.5-D02 Schema consumes active E14 resources independently of pending scheduling; inactive owners remove their consumers", async () => {
  const path = "@/features/jobs/job-workspace-domain";
  const domain = await import(path) as Domain;
  assert.equal(SCOPE_MANIFEST.modules.find(module => module.id === "resources")?.status, "active");
  assert.equal(SCOPE_MANIFEST.modules.find(module => module.id === "scheduling")?.status, "pending");
  const can = (module: string, capability: string) => resolveCapability({ roles: ["projektledare"], module, capability }).granted;
  for (const [inactive, expected] of [
    [[], ["overview", "work-orders", "schedule", "files", "events"]],
    [["resources"], ["overview", "work-orders", "files", "events"]],
    [["files"], ["overview", "work-orders", "schedule", "events"]],
    [["jobs"], []],
  ] as const) {
    // Vary only descriptor activation input, never mutate the authoritative manifest.
    const modules = SCOPE_MANIFEST.modules.map(module => inactive.some(id => id === module.id)
      ? { ...module, status: "pending" as const } : module);
    assert.deepEqual(domain.availableJobWorkspaceTabs({ modules, jobAdmitted: true, can }).map(tab => tab.id), expected);
  }
  const closed = domain.availableJobWorkspaceTabs({ modules: SCOPE_MANIFEST.modules, jobAdmitted: true, can });
  assert.deepEqual(new Set(closed.map(tab => tab.id)), new Set(["overview", "work-orders", "schedule", "files", "events"]));
});

test.skip("[P1] 16.5-D03 bounded query selection rejects unknown/unavailable tabs and preserves old workOrder-only links", async () => {
  const path = "@/features/jobs/job-workspace-domain";
  const domain = await import(path) as Domain;
  const availableTabs: Tab[] = ["overview", "work-orders", "schedule", "events"];
  for (const tab of [undefined, null, "", "economy", "payment-plan", "suppliers", "files", "__proto__", "SCHEDULE"])
    assert.equal(domain.selectJobWorkspaceTab({ availableTabs, tab }), "overview");
  for (const tab of availableTabs)
    assert.equal(domain.selectJobWorkspaceTab({ availableTabs, tab }), tab);
  assert.equal(domain.selectJobWorkspaceTab({ availableTabs, workOrder: "child-id" }), "work-orders");
  assert.equal(domain.selectJobWorkspaceTab({ availableTabs: ["overview", "events"], workOrder: "child-id" }), "overview");
  assert.equal(domain.selectJobWorkspaceTab({ availableTabs, tab: "events", workOrder: "child-id" }), "events");
  assert.equal(domain.selectJobWorkspaceTab({ availableTabs, tab: "unknown", workOrder: "child-id" }), "overview");
});

test.skip("[P1] 16.5-D04 tab URLs preserve the stable job, child selection and unrelated return query without mutating the input", async () => {
  const path = "@/features/jobs/job-workspace-domain";
  const domain = await import(path) as Domain;
  const jobId = "11111111-1111-4111-8111-111111111111";
  const query = new URLSearchParams("workOrder=child-id&returnTo=%2Ffiles%3Fsearch%3Dboard&tab=overview");
  const before = query.toString();
  const url = new URL(domain.jobWorkspaceHref({ jobId, tab: "work-orders", query }), "https://workspace.invalid");
  assert.equal(url.pathname, `/jobs/${jobId}`);
  assert.equal(url.searchParams.get("tab"), "work-orders");
  assert.equal(url.searchParams.get("workOrder"), "child-id");
  assert.equal(url.searchParams.get("returnTo"), "/files?search=board");
  assert.equal(query.toString(), before);
  assert.equal(domain.selectJobWorkspaceTab({ availableTabs: ["overview", "work-orders"],
    tab: url.searchParams.get("tab"), workOrder: url.searchParams.get("workOrder") }), "work-orders");
});