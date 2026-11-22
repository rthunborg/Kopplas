"use server";
import { revalidatePath } from "next/cache";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { runCommand, type Command, type CommandDbClient } from "@/server/commands/envelope";
import { COMMAND_MESSAGES } from "@/server/commands/command-errors";
import { type OperationKind, type OperationReceipt, isOperationUuid } from "@/features/settings/mutation-attempt";
import { reconcileSettingsOperation } from "@/server/commands/settings/operation-recovery";
import { updateCompanySettings } from "@/server/commands/settings/company-settings";
import { updateQuoteTerms, approveQuoteTerms } from "@/server/commands/settings/quote-terms";
import { SETTINGS_ACTION_INITIAL, type SettingsActionState } from "./action-state";
import { parseCompanySettingsForm, parseQuoteTermsForm, parseApproveTermsForm, type ParsedSettingsForm } from "./form-parsing";
async function run(command: Command<never, OperationReceipt>, parsed: ParsedSettingsForm, formData: FormData, kind: OperationKind, path: string): Promise<SettingsActionState> {
    const identity = { operationId: isOperationUuid(parsed.input.operationId) ? parsed.input.operationId : null, targetId: isOperationUuid(parsed.input.targetId) ? parsed.input.targetId : null };
    const base = { ...SETTINGS_ACTION_INITIAL, ...identity, values: parsed.values };
    if (Object.keys(parsed.fieldErrors).length)
        return { ...base, status: "error", code: "VALIDATION_FAILED", formError: COMMAND_MESSAGES.VALIDATION_FAILED, fieldErrors: parsed.fieldErrors };
    const client = (await createSupabaseServerClient()) as unknown as CommandDbClient;
    // Captured context is a precondition only. The envelope resolves current
    // authority; the typed adapter compares these validated IDs with that context.
    if (!isOperationUuid(formData.get("contextTenantId")) || !isOperationUuid(formData.get("contextActorId")))
        return { ...base, status: "error", code: "VALIDATION_FAILED", formError: COMMAND_MESSAGES.VALIDATION_FAILED };
    const result = formData.get("reconcile") === "1" ? await runCommand(reconcileSettingsOperation, { client, input: { ...parsed.input, kind }, correlationId: identity.operationId }) : await runCommand(command, { client, input: parsed.input, correlationId: identity.operationId });
    if (!result.ok)
        return { ...base, status: "error", code: result.code, formError: result.message };
    if ("unconfirmed" in result.data)
        return { ...base, status: "unconfirmed", formError: "Åtgärdens resultat är ännu inte bekräftat. Behåll försöket och kontrollera igen." };
    revalidatePath(path);
    return { ...base, ...result.data, status: "success" };
}
export async function saveCompanySettingsAction(_prev: SettingsActionState, form: FormData): Promise<SettingsActionState> { return run(updateCompanySettings as unknown as Command<never, OperationReceipt>, parseCompanySettingsForm(form), form, "company.save", "/settings/company"); }
export async function saveQuoteTermsAction(_prev: SettingsActionState, form: FormData): Promise<SettingsActionState> { return run(updateQuoteTerms as unknown as Command<never, OperationReceipt>, parseQuoteTermsForm(form), form, "terms.save", "/settings/quote-terms"); }
export async function approveTermsAction(_prev: SettingsActionState, form: FormData): Promise<SettingsActionState> { return run(approveQuoteTerms as unknown as Command<never, OperationReceipt>, parseApproveTermsForm(form), form, "terms.approve", "/settings/quote-terms"); }
