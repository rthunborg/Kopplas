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
