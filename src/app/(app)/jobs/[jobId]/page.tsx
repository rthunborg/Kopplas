import { readTimeReportActionDescriptor } from "@/server/read-models/time-reports";
import Link from "next/link";
import {notFound} from "next/navigation";
import type {ReactNode} from "react";
import {JobDetailView} from "@/components/jobs/JobDetailView";
import {JobWorkspaceShell, JobWorkspaceRetry} from "@/components/jobs/JobWorkspaceShell";
import {JobWorkspaceSchedule} from "@/components/jobs/JobWorkspaceSchedule";
import {JobEventsPanel} from "@/components/jobs/JobEventsPanel";
import {JobUpgradeDialog} from "@/components/jobs/JobUpgradeDialog";
import {JobWorkOrdersPanel} from "@/components/jobs/JobWorkOrdersPanel";
import {EntityFilePanel} from "@/components/files/EntityFilePanel";
import {EntityDocumentsLink} from "@/components/documents/EntityDocumentsLink";
import {readEntityDocumentsLink} from "@/server/read-models/document-context";
import {readEntityFiles} from "@/features/files/read";
import {readJobWorkspace} from "@/server/read-models/job-workspace";
import {resolveTenantContext} from "@/server/auth/resolve-tenant-context";
import {resolveCapability} from "@/server/authz/permission-matrix";
export const dynamic = "force-dynamic";
/** Stable root admission precedes every file/document/panel consumer. */
export default async function JobDetailPage({params, searchParams}: {
  params: Promise<{jobId: string}>; searchParams?: Promise<{tab?: string; workOrder?: string}>;
}) {
  const {jobId} = await params;
  const {workspace, error} = await readJobWorkspace(undefined, jobId, await searchParams);
  if (error) return <section className="mx-auto max-w-3xl p-4"><div role="alert" data-testid="job-detail-failed" className="rounded-lg border border-red-300 bg-red-50 p-6">
    <p className="text-sm font-medium text-red-800">Jobbet kunde inte läsas in.</p><p className="mt-1 text-sm text-red-700">{error}</p>
    <JobWorkspaceRetry>Försök igen</JobWorkspaceRetry>
    <Link href="/jobs" className="mt-4 inline-flex min-h-11 items-center rounded-md border border-red-300 bg-white px-3 text-sm text-red-800">Tillbaka till jobb</Link>
  </div></section>;
  if (!workspace) notFound();
  const {detail, members} = workspace;
  const context = await resolveTenantContext();
  const roles = context.ok ? context.data.roles ?? [context.data.role] : [];
  const reportAction = workspace.schedule ? await readTimeReportActionDescriptor() : undefined;
  const canDocuments = resolveCapability({roles, module: "documents", capability: "Documents.View"}).granted;
  const canFiles = workspace.tabs.some(tab => tab.id === "files");
  const filesRead = canFiles ? await readEntityFiles({ownerType: "job", ownerId: jobId}) : null;
  const workOrderFiles: Record<string, ReactNode> = {};
  if (workspace.workOrders && canFiles) {
    await Promise.all(workspace.workOrders.rows.filter(row => row.id === workspace.selectedWorkOrderId).map(async row => {
      const read = await readEntityFiles({ownerType: "work_order", ownerId: row.id});
      workOrderFiles[row.id] = <>
        {canDocuments && <EntityDocumentsLink link={await readEntityDocumentsLink({module: "jobs", ownerType: "work_order", ownerId: row.id})} />}
        <EntityFilePanel ownerType="work_order" ownerId={row.id} parentJobId={jobId} purpose="job_evidence" ownerLabel={row.title} files={read.files} readError={read.error} testIdSuffix={`work-order-${row.id}`} />
      </>;
    }));
  }
  const workOrders = workspace.workOrders ? <JobWorkOrdersPanel jobId={jobId} initial={workspace.workOrders} initialWorkOrderId={workspace.selectedWorkOrderId} filesPanels={workOrderFiles} />
    : <section role="alert" data-testid="job-work-orders-read-failed" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800"><p>{workspace.workOrdersError}</p><JobWorkspaceRetry>Hämta arbetsorder igen</JobWorkspaceRetry></section>;
  return <JobWorkspaceShell header={workspace.header} tabs={workspace.tabs} canBook={workspace.schedule?.canManage === true && workspace.schedule.options?.canManage === true}
    actions={detail.entitlement?.canEdit && detail.type && members.ok ? <JobUpgradeDialog jobId={jobId} type={detail.type} expectedState={members.projection.expectedState} /> : undefined}
    panels={{overview: <div className="space-y-6"><JobDetailView detail={detail} members={members.ok ? members.projection : undefined} membersError={members.ok ? undefined : members.message} cardOptions={workspace.cardOptions} />{workspace.events && <JobEventsPanel events={workspace.events} compact />}</div>,
      "work-orders": workOrders,
      schedule: workspace.schedule && <JobWorkspaceSchedule reportAction={reportAction} schedule={workspace.schedule} jobId={jobId} customerId={detail.customerId} />,
      files: filesRead && <div className="space-y-4">
        {canDocuments && <EntityDocumentsLink link={await readEntityDocumentsLink({module: "jobs", ownerType: "job", ownerId: jobId})} />}
        <EntityFilePanel ownerType="job" ownerId={jobId} purpose="job_evidence" ownerLabel={detail.title ?? detail.currentCustomerName ?? "Jobb"} files={filesRead.files} readError={filesRead.error} />
      </div>,
      events: workspace.events && <JobEventsPanel events={workspace.events} />}} />;
}
