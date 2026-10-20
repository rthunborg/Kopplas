/** 16.5 activated thin bindings to actual normal-client workspace/event readers.
 * No policy, redaction, service client, environment or database work lives in this adapter.
 * Playwright-utils flag=true/package absent; existing Node/Vitest runners apply.
 */
import type { TestServerClient } from "../factories/tenants";
import type { JobsDepthFixture } from "./jobs-depth-atdd";
import type { JobDetail } from "@/features/jobs/types";
export type WorkspaceFixture = JobsDepthFixture;
export type WorkspaceQuery = { tab?: string; workOrder?: string };
export type SafeJobEvent = { id: string; eventType: string; occurredAt: string };
export type AssignmentLabel = { state: "named" | "assigned-name-unavailable" | "unassigned" | "unavailable"; label: string | null };
export type WorkspaceHeader = { id: string; type: "order" | "projekt"; title: string | null; status: string;
  customer: string | null; site: string | null; contact: string | null; plannedStartDate: string | null;
  plannedEndDate: string | null; responsibleProjectManager: AssignmentLabel; lead: AssignmentLabel };
export type Workspace = { jobId: string; header: WorkspaceHeader; detail: JobDetail; selectedTab: string;
  tabs: readonly { id: string; label: string }[];
  schedule?: { bookings: readonly { id: string; jobId: string | null; startsAt: string; endsAt: string }[];
    canManage: boolean; error: string | null; options?: unknown };
  events?: { rows: readonly SafeJobEvent[]; error: string | null };
  workOrders?: { rows: readonly { id: string; jobId: string }[] }; cardOptions?: unknown };
export type WorkspaceRead = { workspace: Workspace | null; error: string | null };
export async function withWorkspaceFixture(run: (fixture: WorkspaceFixture) => Promise<void>): Promise<void> {
  const { withJobsDepthFixture } = await import("./jobs-depth-atdd");
  await withJobsDepthFixture(run);
}
export async function readWorkspace(client: TestServerClient, jobId: string, query: WorkspaceQuery = {}): Promise<WorkspaceRead> {
  const path = "@/server/read-models/job-workspace";
  const binding = await import(path) as { readJobWorkspace: (client: TestServerClient, id: string, query: WorkspaceQuery) => Promise<WorkspaceRead> };
  return binding.readJobWorkspace(client, jobId, query);
}
export async function readWorkspaceEvents(client: TestServerClient, jobId: string): Promise<{ rows: readonly SafeJobEvent[]; error: string | null }> {
  const path = "@/server/read-models/job-events";
  const binding = await import(path) as { readJobEvents: (client: TestServerClient, id: string) => Promise<{ rows: readonly SafeJobEvent[]; error: string | null }> };
  return binding.readJobEvents(client, jobId);
}
