"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { runCommand, type Command, type CommandDbClient } from "@/server/commands/envelope";
import { COMMAND_MESSAGES } from "@/server/commands/command-errors";
import { type OperationKind, type OperationReceipt, isOperationUuid } from "@/features/settings/mutation-attempt";
import { reconcilePricingOperation } from "@/server/commands/settings/operation-recovery";
import { upsertWorkRole, archiveWorkRole, reactivateWorkRole } from "@/server/commands/pricing/work-roles";
import { upsertArticle, archiveArticle, reactivateArticle } from "@/server/commands/pricing/articles";
import { PRICING_ACTION_INITIAL, type PricingActionState } from "./action-state";
import { parseWorkRoleForm, parseArticleForm, parseArchiveForm, type ParsedPricingForm } from "./form-parsing";
async function run(command: Command<never, OperationReceipt>, parsed: ParsedPricingForm, formData: FormData, kind: OperationKind, path: string): Promise<PricingActionState> {
    const identity = { operationId: isOperationUuid(parsed.input.operationId) ? parsed.input.operationId : null, targetId: isOperationUuid(parsed.input.targetId) ? parsed.input.targetId : null };
    const base = { ...PRICING_ACTION_INITIAL, ...identity, values: parsed.values, form: kind.startsWith("work_role") ? "work_role" as const : "article" as const };
    if (Object.keys(parsed.fieldErrors).length)
        return { ...base, status: "error", code: "VALIDATION_FAILED", formError: COMMAND_MESSAGES.VALIDATION_FAILED, fieldErrors: parsed.fieldErrors };
    const client = (await createSupabaseServerClient()) as unknown as CommandDbClient;
    // Captured context is a precondition only. The envelope resolves current
    // authority; the typed adapter compares these validated IDs with that context.
    if (!isOperationUuid(formData.get("contextTenantId")) || !isOperationUuid(formData.get("contextActorId")))
        return { ...base, status: "error", code: "VALIDATION_FAILED", formError: COMMAND_MESSAGES.VALIDATION_FAILED };
    const result = formData.get("reconcile") === "1" ? await runCommand(reconcilePricingOperation, { client, input: { ...parsed.input, kind }, correlationId: identity.operationId }) : await runCommand(command, { client, input: parsed.input, correlationId: identity.operationId });
    if (!result.ok)
        return { ...base, status: "error", code: result.code, formError: result.message };
    if ("unconfirmed" in result.data)
        return { ...base, status: "unconfirmed", formError: "Åtgärdens resultat är ännu inte bekräftat. Behåll försöket och kontrollera igen." };
    revalidatePath(path);
    return { ...base, ...result.data, status: "success" };
}
export async function saveWorkRoleAction(_prev: PricingActionState, form: FormData): Promise<PricingActionState> { return run(upsertWorkRole as unknown as Command<never, OperationReceipt>, parseWorkRoleForm(form), form, form.get("id") ? "work_role.update" : "work_role.create", "/settings/pricing"); }
export async function archiveWorkRoleAction(_prev: PricingActionState, form: FormData): Promise<PricingActionState> { return run(archiveWorkRole as unknown as Command<never, OperationReceipt>, parseArchiveForm(form), form, "work_role.archive", "/settings/pricing"); }
export async function reactivateWorkRoleAction(_prev: PricingActionState, form: FormData): Promise<PricingActionState> { return run(reactivateWorkRole as unknown as Command<never, OperationReceipt>, parseArchiveForm(form), form, "work_role.reactivate", "/settings/pricing"); }
export async function saveArticleAction(_prev: PricingActionState, form: FormData): Promise<PricingActionState> { return run(upsertArticle as unknown as Command<never, OperationReceipt>, parseArticleForm(form), form, form.get("id") ? "article.update" : "article.create", "/settings/pricing"); }
export async function archiveArticleAction(_prev: PricingActionState, form: FormData): Promise<PricingActionState> { return run(archiveArticle as unknown as Command<never, OperationReceipt>, parseArchiveForm(form), form, "article.archive", "/settings/pricing"); }
export async function reactivateArticleAction(_prev: PricingActionState, form: FormData): Promise<PricingActionState> { return run(reactivateArticle as unknown as Command<never, OperationReceipt>, parseArchiveForm(form), form, "article.reactivate", "/settings/pricing"); }
