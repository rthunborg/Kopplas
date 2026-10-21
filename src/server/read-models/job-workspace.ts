import type {createSupabaseServerClient} from "@/server/db/supabase-server-client";
import type {JobDetail} from "@/features/jobs/types";
import type {BookingHostReadResult, BookingEditorOptions} from "@/features/resources/booking-action-state";
import {availableJobWorkspaceTabs, selectJobWorkspaceTab, type JobWorkspaceTabDescriptor, type JobWorkspaceTab} from "@/features/jobs/job-workspace-domain";
import {SCOPE_MANIFEST} from "@/scope/manifest";
import {resolveTenantContext} from "@/server/auth/resolve-tenant-context";
import {resolveCapability} from "@/server/authz/permission-matrix";
import {readJobMembersForPage, type JobMembersReadResult} from "./job-members";
import {readJobWorkOrdersForPage, type JobWorkOrdersReadResult} from "./job-work-orders";
import {readJobCardOptions, type JobCardOptions} from "./my-jobs";
import {readJobEvents, type JobEventsReadResult} from "./job-events";
export type AssignmentLabel = {readonly state: "named" | "assigned-name-unavailable" | "unassigned" | "unavailable"; readonly label: string | null};
export type JobWorkspaceHeader = {
  readonly id: string; readonly type: "order" | "projekt"; readonly title: string | null; readonly status: string;
  readonly customer: string | null; readonly site: string | null; readonly contact: string | null;
  readonly plannedStartDate: string | null; readonly plannedEndDate: string | null;
  readonly responsibleProjectManager: AssignmentLabel; readonly lead: AssignmentLabel;
};
type HeaderDetail = Pick<JobDetail, "id" | "title" | "status" | "currentCustomerName" | "facilityName" | "contactName" | "plannedStartDate" | "plannedEndDate" | "type"> & {
  card?: {responsible_project_manager_id?: string | null};
};
type HeaderMembers = {ok: true; projection: {members: readonly {personProfileId: string; label: string}[]; leadPersonProfileId: string | null}} | {ok: false; message: string};
/** Only projections the caller already independently owns may supply personal labels. */
export function projectJobWorkspaceHeader(detail: HeaderDetail, members: HeaderMembers, options?: Pick<JobCardOptions, "projectManagers" | "error">): JobWorkspaceHeader {
  function assignment(id: string | null | undefined, allowPicker = false): AssignmentLabel {
    if (!id) return {state: "unassigned", label: null};
    const label = (members.ok ? members.projection.members.find(person => person.personProfileId === id)?.label : undefined)
      ?? (allowPicker && !options?.error ? options?.projectManagers.find(person => person.id === id)?.label : undefined);
    if (label) return {state: "named", label};
    return {state: !members.ok || (allowPicker && options?.error) ? "unavailable" : "assigned-name-unavailable", label: null};
  }
  return {id: detail.id, type: detail.type === "projekt" ? "projekt" : "order", title: detail.title, status: detail.status,
    customer: detail.currentCustomerName, site: detail.facilityName ?? null, contact: detail.contactName ?? null,
    plannedStartDate: detail.plannedStartDate, plannedEndDate: detail.plannedEndDate,
    responsibleProjectManager: assignment(detail.card?.responsible_project_manager_id, true),
    lead: members.ok ? assignment(members.projection.leadPersonProfileId) : {state: "unavailable", label: null}};
}
export type JobWorkspace = {
  readonly jobId: string; readonly header: JobWorkspaceHeader; readonly detail: JobDetail;
  readonly tabs: readonly JobWorkspaceTabDescriptor[]; readonly selectedTab: JobWorkspaceTab;
  readonly members: JobMembersReadResult; readonly workOrders?: Extract<JobWorkOrdersReadResult, {ok: true}>["projection"];
  readonly workOrdersError?: string; readonly selectedWorkOrderId?: string;
  readonly schedule?: BookingHostReadResult & {readonly options?: BookingEditorOptions};
  readonly events?: JobEventsReadResult; readonly cardOptions?: JobCardOptions;
};
export type JobWorkspaceReadResult = {readonly workspace: JobWorkspace | null; readonly error: string | null};
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
const FAILED = "Jobbet kunde inte hÃ¤mtas. FÃ¶rsÃ¶k igen.";
/** Root admission first; every subordinate reader retains its own current JWT/RLS authority. */
export async function readJobWorkspace(injectedClient: Client | undefined, jobId: string, query: {tab?: string; workOrder?: string} = {}): Promise<JobWorkspaceReadResult> {
  try {
    const client = injectedClient ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const {readJobDetail} = await import("@/features/jobs/read");
    const rawDetail = await readJobDetail(client as unknown as import("@/features/jobs/read").JobReadClient, jobId);
    if (!rawDetail) return {workspace: null, error: null};
    const context = await resolveTenantContext({client});
    if (!context.ok) return {workspace: null, error: context.code === "SERVER_ERROR" ? FAILED : null};
    const roles = context.data.roles ?? [context.data.role];
    const can = (module: string, capability: string) => resolveCapability({roles, module, capability}).granted;
    const tabs = availableJobWorkspaceTabs({modules: SCOPE_MANIFEST.modules, jobAdmitted: true, can});
    if (!tabs.length) return {workspace: null, error: null};
    const has = (id: JobWorkspaceTab) => tabs.some(tab => tab.id === id);
    // Legacy detail events carry reference/channel; they are never a workspace presentation DTO.
    const detail: JobDetail = {...rawDetail, events: []};
    const [members, orders, cardOptions, events] = await Promise.all([
      readJobMembersForPage(client, jobId), has("work-orders") ? readJobWorkOrdersForPage(client, jobId) : undefined,
      detail.entitlement?.canEdit ? readJobCardOptions(client) : undefined,
      has("events") ? readJobEvents(client as unknown as import("./job-events").JobEventsClient, jobId) : undefined,
    ]);
    let schedule: JobWorkspace["schedule"];
    if (has("schedule")) {
      const {readBookingHost, readBookingEditorOptions} = await import("@/features/resources/bookings-read");
      const host = await readBookingHost({jobId}, client);
      schedule = {...host, ...(host.canManage ? {options: await readBookingEditorOptions({client})} : {})};
    }
    return {workspace: {jobId, detail, header: projectJobWorkspaceHeader(detail, members, cardOptions), tabs,
      selectedTab: selectJobWorkspaceTab({availableTabs: tabs.map(tab => tab.id), tab: query.tab, workOrder: query.workOrder}),
      members, ...(orders?.ok ? {workOrders: orders.projection,
        ...(orders.projection.rows.some(row => row.id === query.workOrder) ? {selectedWorkOrderId: query.workOrder} : {})}
        : orders ? {workOrdersError: orders.message} : {}),
      ...(schedule ? {schedule} : {}), ...(events ? {events} : {}), ...(cardOptions ? {cardOptions} : {})}, error: null};
  } catch { return {workspace: null, error: FAILED}; }
}
