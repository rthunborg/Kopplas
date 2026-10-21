"use server";

/**
 * Job-detail server actions (Story 7.3, Task 4.5) — the ONLY write path the job-detail UI uses.
 * This `"use server"` action wires the React 19 `useActionState` form pattern to the EXISTING
 * `updateJob` envelope command. The mutation goes through
 * `runCommand(updateJob, { client: createSupabaseServerClient(), input })`:
 *
 *   - `client` is the per-request, cookie-bound RLS server client (anon key ONLY — NEVER a
 *     service-role key; the containment guards enforce this). It NEVER writes a job table directly
 *     — only the command writes, and only after the server-side validate → ownership gates.
 *   - `input` is the raw parsed form values (ONLY the four Phase-A-safe fields). The command's
 *     `validateInput` (which REJECTS any unknown/immutable field) is the authority; the client-side
 *     read-only rendering of the immutable refs is a UX nicety, not the guarantee.
 *
 * The typed `Result` is mapped to a `JobActionState`: `ok` revalidates the detail + list paths;
 * `VALIDATION_FAILED`/`TENANT_ACCESS_DENIED` are generic messages; a transient `SERVER_ERROR` is a
 * RETRYABLE failure. Since 2026-07-14 (owner decision) `createJobAction` adds the STANDALONE
 * create path (the `createJob` command — NULL source refs, no connect-later mechanism); delete /
 * archive still have NO surface. NO new auth/error/audit mechanism, NO direct table write.
 */
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { runCommand, type CommandDbClient } from "@/server/commands/envelope";
import { COMMAND_MESSAGES } from "@/server/commands/command-errors";
import { createJob, updateJob } from "@/server/commands/jobs";
import { createSignedFileAccess } from "@/server/commands/files";
import { JOB_ACTION_INITIAL, type JobActionState } from "./action-state";
import {
  JOB_EVIDENCE_PREVIEW_INITIAL,
  type JobEvidencePreviewState,
} from "./evidence-preview-state";

/** Read a string form field, treating a present-but-empty value as an explicit clear (null). */
function clearableText(form: FormData, name: string): string | null | undefined {
  const v = form.get(name);
  if (typeof v !== "string") return undefined;
  const trimmed = v.trim();
  return trimmed.length > 0 ? trimmed : null;
}

/**
 * The job allowed-edit action (React `useActionState` signature: (prevState, formData)). Wires the
 * job edit form to the `updateJob` command. ONLY the four Phase-A-safe fields are read from the form
 * — the immutable source/commitment fields are NEVER accepted (the command validator rejects them).
 */
export async function updateJobAction(
  _prev: JobActionState,
  form: FormData,
): Promise<JobActionState> {
  const jobId = form.get("id");
  const values: Record<string, string> = {};

  const input: Record<string, unknown> = { id: jobId };
  // Only carry a field the form actually submitted (an absent field = unchanged).
  if (form.has("title")) {
    const title = clearableText(form, "title");
    input.title = title;
    if (typeof title === "string") values.title = title;
  }
  if (form.has("status")) {
    const status = form.get("status");
    if (typeof status === "string" && status.length > 0) {
      input.status = status;
      values.status = status;
    }
  }
  if (form.has("planned_start_date")) {
    const start = clearableText(form, "planned_start_date");
    input.planned_start_date = start;
    if (typeof start === "string") values.planned_start_date = start;
  }
  if (form.has("planned_end_date")) {
    const end = clearableText(form, "planned_end_date");
    input.planned_end_date = end;
    if (typeof end === "string") values.planned_end_date = end;
  }

  const client = (await createSupabaseServerClient()) as unknown as CommandDbClient;
  const result = await runCommand(updateJob, { client, input });

  if (result.ok) {
    revalidatePath("/jobs");
    if (typeof jobId === "string" && jobId.length > 0) {
      revalidatePath(`/jobs/${jobId}`);
    }
    return {
      ...JOB_ACTION_INITIAL,
      status: "success",
      targetId: result.data.targetId,
    };
  }

  return {
    ...JOB_ACTION_INITIAL,
    status: "error",
    code: result.code,
    formError: result.message || COMMAND_MESSAGES[result.code],
    values,
  };
}

/**
 * The standalone-create action (owner decision 2026-07-14; React `useActionState` signature) —
 * the ONLY write path the `/jobs` list's "Skapa nytt jobb" form uses. Wires the form to the
 * `createJob` envelope command: ONLY customer_id + the optional title/planned dates are read from
 * the form — source refs / status / tenant_id are NEVER accepted (the command validator hard-rejects
 * any unknown key; the resolved tenant is the only tenant authority). On success revalidates
 * `/jobs` and returns the new job id so the list island can `router.push('/jobs/{id}')`.
 */
export async function createJobAction(
  _prev: JobActionState,
  form: FormData,
): Promise<JobActionState> {
  const values: Record<string, string> = {};
  const input: Record<string, unknown> = { customer_id: form.get("customer_id") };
  const customerIdRaw = form.get("customer_id");
  if (typeof customerIdRaw === "string") values.customer_id = customerIdRaw;
  // Only carry a field the form actually submitted with a value (absent = born NULL).
  const title = clearableText(form, "title");
  if (typeof title === "string") {
    input.title = title;
    values.title = title;
  }
  const plannedStart = clearableText(form, "planned_start_date");
  if (typeof plannedStart === "string") {
    input.planned_start_date = plannedStart;
    values.planned_start_date = plannedStart;
  }
  const plannedEnd = clearableText(form, "planned_end_date");
  if (typeof plannedEnd === "string") {
    input.planned_end_date = plannedEnd;
    values.planned_end_date = plannedEnd;
  }

  const client = (await createSupabaseServerClient()) as unknown as CommandDbClient;
  const result = await runCommand(createJob, { client, input });

  if (result.ok) {
    // Revalidate the list AND the new detail route (the list+detail discipline the quote
    // actions follow) — the island lands the admin on `/jobs/{id}` right after.
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${result.data.targetId}`);
    return {
      ...JOB_ACTION_INITIAL,
      status: "success",
      targetId: result.data.targetId,
    };
  }

  return {
    ...JOB_ACTION_INITIAL,
    status: "error",
    code: result.code,
    formError: result.message || COMMAND_MESSAGES[result.code],
    values,
  };
}

/**
 * The evidence preview action (React `useActionState` signature). Mints a SHORT-LIVED SIGNED URL
 * for the job's linked evidence file via the EXISTING `createSignedFileAccess` command (RLS-scoped
 * signing — a cross-tenant/anon caller is denied at the DB; never a public URL). Reuses the 8.1
 * signed-access funnel VERBATIM — 7.3 builds NO competing file/evidence store (R-814 STOP). Only
 * shown when the acceptance carries an evidence FILE (an external `evidence_reference` is plain text
 * and needs no signing). The signed URL lives only in the returned state (never logged).
 */
export async function previewJobEvidenceAction(
  _prev: JobEvidencePreviewState,
  form: FormData,
): Promise<JobEvidencePreviewState> {
  const fileId = form.get("file_id");
  const input: Record<string, unknown> = { file_id: fileId };

  const client = (await createSupabaseServerClient()) as unknown as CommandDbClient;
  const result = await runCommand(createSignedFileAccess, { client, input });

  if (result.ok) {
    return {
      ...JOB_EVIDENCE_PREVIEW_INITIAL,
      status: "success",
      signedUrl: result.data.signedUrl,
      expiresAt: result.data.expiresAt,
    };
  }

  return {
    ...JOB_EVIDENCE_PREVIEW_INITIAL,
    status: "error",
    code: result.code,
    formError: result.message || COMMAND_MESSAGES[result.code],
  };
}
import { createJobCard, updateJobCard } from "@/server/commands/jobs/save-job-card";

/** The command validates the complete closed input; the action adds no authority. */
export async function saveJobCardAction(input: Record<string, unknown>): Promise<
  { ok: true; jobId: string } | { ok: false; message: string; code: string }
> {
  try {
    const client = (await createSupabaseServerClient()) as unknown as CommandDbClient;
    const result = await runCommand(input.id ? updateJobCard : createJobCard, { client, input });
    if (!result.ok) return { ok: false, message: result.message || COMMAND_MESSAGES[result.code], code: result.code };
    revalidatePath("/jobs");
    revalidatePath(`/jobs/${result.data.jobId}`);
    return { ok: true, jobId: result.data.jobId };
  } catch {
    return { ok: false, message: "Jobbet är inte bekräftat sparat. Försök igen.", code: "SERVER_ERROR" };
  }
}

import { assignJobMember, removeJobMember, setJobLead } from "@/server/commands/jobs/job-members";
import { updateJobPlanDates } from "@/server/commands/jobs/job-plan-dates";
import { readJobMembers, type JobMembersProjection } from "@/server/read-models/job-members";
type MemberActionResult = {ok: true; projection: JobMembersProjection} | {ok: false; code: string; message: string};
/** Each action has a fixed operation; callers cannot select a command through input. */
async function memberAction(command: typeof assignJobMember | typeof removeJobMember | typeof setJobLead | typeof updateJobPlanDates,
  input: Record<string, unknown>): Promise<MemberActionResult> {
  try {
    const client = await createSupabaseServerClient();
    const result = await runCommand(command as import("@/server/commands/envelope").Command<unknown, {jobId: string}>, {
      client: client as unknown as CommandDbClient, input,
      correlationId: typeof input.commandId === "string" ? input.commandId : undefined,
    });
    if (!result.ok) return {ok: false, code: result.code, message: result.code === "PREVIEW_STALE"
      ? "Jobbet har ändrats. Hämta aktuella uppgifter och försök igen." : result.message || COMMAND_MESSAGES[result.code]};
    revalidatePath("/jobs"); revalidatePath(`/jobs/${result.data.jobId}`);
    return {ok: true, projection: await readJobMembers(client, result.data.jobId)};
  } catch { return {ok: false, code: "SERVER_ERROR", message: "Ändringen är inte bekräftad sparad. Försök igen eller hämta aktuella uppgifter."}; }
}
export async function assignJobMemberAction(input: Record<string, unknown>): Promise<MemberActionResult> { return memberAction(assignJobMember, input); }
export async function removeJobMemberAction(input: Record<string, unknown>): Promise<MemberActionResult> { return memberAction(removeJobMember, input); }
export async function setJobLeadAction(input: Record<string, unknown>): Promise<MemberActionResult> { return memberAction(setJobLead, input); }
export async function updateJobPlanDatesAction(input: Record<string, unknown>): Promise<MemberActionResult> { return memberAction(updateJobPlanDates, input); }
export async function refetchJobMembersAction(jobId: string): Promise<MemberActionResult> {
  try { return {ok: true, projection: await readJobMembers(undefined, jobId)}; }
  catch { return {ok: false, code: "SERVER_ERROR", message: "Uppgifterna kunde inte hämtas. Försök igen."}; }
}

import { createWorkOrder, updateWorkOrder, setWorkOrderAssignees, setWorkOrderStatus,
  setWorkOrderDependencies, setJobWorkOrderDependencies } from "@/server/commands/jobs/work-orders";
import { readJobWorkOrders, type JobWorkOrdersProjection } from "@/server/read-models/job-work-orders";

type WorkOrderActionResult = {ok: true; projection: JobWorkOrdersProjection; workOrderId?: string}
  | {ok: false; code: string; message: string};
/** Fixed action bindings; the checked command and SQL resolve current authority. */
async function workOrderAction(command: typeof createWorkOrder | typeof updateWorkOrder | typeof setWorkOrderAssignees
  | typeof setWorkOrderStatus | typeof setWorkOrderDependencies | typeof setJobWorkOrderDependencies,
  input: Record<string, unknown>): Promise<WorkOrderActionResult> {
  try {
    const client = await createSupabaseServerClient();
    const result = await runCommand(command as import("@/server/commands/envelope").Command<unknown, {jobId: string; workOrderId?: string}>, {
      client: client as unknown as CommandDbClient, input,
      correlationId: typeof input.commandId === "string" ? input.commandId : undefined,
    });
    if (!result.ok) return {ok: false, code: result.code, message: result.code === "PREVIEW_STALE"
      ? "Jobbet har ändrats. Hämta aktuella uppgifter och kontrollera ändringen innan du försöker igen."
      : result.message || COMMAND_MESSAGES[result.code]};
    revalidatePath("/jobs"); revalidatePath(`/jobs/${result.data.jobId}`);
    return {ok: true, projection: await readJobWorkOrders(client, result.data.jobId), workOrderId: result.data.workOrderId};
  } catch { return {ok: false, code: "SERVER_ERROR", message: "Ändringen är inte bekräftad sparad. Dina uppgifter finns kvar."}; }
}
export async function createWorkOrderAction(input: Record<string, unknown>): Promise<WorkOrderActionResult> { return workOrderAction(createWorkOrder, input); }
export async function updateWorkOrderAction(input: Record<string, unknown>): Promise<WorkOrderActionResult> { return workOrderAction(updateWorkOrder, input); }
export async function setWorkOrderAssigneesAction(input: Record<string, unknown>): Promise<WorkOrderActionResult> { return workOrderAction(setWorkOrderAssignees, input); }
export async function setWorkOrderStatusAction(input: Record<string, unknown>): Promise<WorkOrderActionResult> { return workOrderAction(setWorkOrderStatus, input); }
export async function setWorkOrderDependenciesAction(input: Record<string, unknown>): Promise<WorkOrderActionResult> { return workOrderAction(setWorkOrderDependencies, input); }
export async function setJobWorkOrderDependenciesAction(input: Record<string, unknown>): Promise<WorkOrderActionResult> { return workOrderAction(setJobWorkOrderDependencies, input); }
export async function refetchJobWorkOrdersAction(jobId: string): Promise<WorkOrderActionResult> {
  try { return {ok: true, projection: await readJobWorkOrders(undefined, jobId)}; }
  catch { return {ok: false, code: "SERVER_ERROR", message: "Arbetsorder kunde inte hämtas. Försök igen."}; }
}

/** One-way upgrade uses the same independent Jobs.Edit command admission as full-card writes. */
export async function upgradeJobToProjektAction(input: unknown) {
  const {upgradeJobToProjekt}=await import("@/server/commands/jobs/upgrade-job-to-projekt");
  const client=await createSupabaseServerClient();
  const result=await runCommand(upgradeJobToProjekt,{client:client as unknown as CommandDbClient,input});
  if(result.ok) {revalidatePath("/jobs");revalidatePath(`/jobs/${result.data.jobId}`);}
  return result;
}
