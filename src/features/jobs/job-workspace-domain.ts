/** Closed current-job consumers. Relational job admission is not a tenant-wide grant. */
export const JOB_WORKSPACE_TABS = [
  {id: "overview", label: "Översikt"}, {id: "work-orders", label: "Arbetsorder"},
  {id: "schedule", label: "Schema"}, {id: "files", label: "Filer"}, {id: "events", label: "Händelser"},
] as const;
export type JobWorkspaceTab = typeof JOB_WORKSPACE_TABS[number]["id"];
export type JobWorkspaceTabDescriptor = typeof JOB_WORKSPACE_TABS[number];
export function availableJobWorkspaceTabs(input: {
  modules: readonly {id: string; status: string}[]; jobAdmitted: boolean;
  can: (module: string, capability: string) => boolean;
}): readonly JobWorkspaceTabDescriptor[] {
  const active = (id: string) => input.modules.some(module => module.id === id && module.status === "active");
  if (!input.jobAdmitted || !active("jobs")) return [];
  return JOB_WORKSPACE_TABS.filter(tab => tab.id === "schedule"
    ? active("resources") && input.can("resources", "Bookings.View")
    : tab.id === "files" ? active("files") && input.can("files", "Files.View") : true);
}
export function selectJobWorkspaceTab(input: {
  availableTabs: readonly JobWorkspaceTab[]; tab?: string | null; workOrder?: string | null;
}): JobWorkspaceTab {
  const requested = input.tab == null && input.workOrder ? "work-orders" : input.tab;
  return input.availableTabs.find(id => id === requested) ?? "overview";
}
export function jobWorkspaceHref(input: {jobId: string; tab: JobWorkspaceTab; query: URLSearchParams}): string {
  const query = new URLSearchParams(input.query);
  query.set("tab", input.tab);
  return `/jobs/${encodeURIComponent(input.jobId)}?${query}`;
}

/** History restoration must never silently replace another child's protected draft. */
export function reconcileJobWorkspaceChild(input: {
  current: {id: string | null; key: string} | null; requestedId: string | null;
  visibleIds: readonly string[]; protectedDraft: boolean;
}): {kind: "keep"} | {kind: "select" | "protect"; id: string | null} {
  const id = input.requestedId && input.visibleIds.includes(input.requestedId) ? input.requestedId : null;
  if ((input.current?.id ?? null) === id) return {kind: "keep"};
  return {kind: input.protectedDraft ? "protect" : "select", id};
}
/** A late completion uses the live query; only explicit child navigation activates its tab. */
export function jobWorkspaceChildHref(input: {jobId: string; workOrderId: string | null; query: URLSearchParams; activate?: boolean}): string {
  const query = new URLSearchParams(input.query);
  if (input.activate) query.set("tab", "work-orders");
  if (input.workOrderId) query.set("workOrder", input.workOrderId); else query.delete("workOrder");
  return `/jobs/${encodeURIComponent(input.jobId)}${query.size ? `?${query}` : ""}`;
}
