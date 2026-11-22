/** Closed, mounted-form protocol for settings and manual pricing only (ADR-B014). */
export const OPERATION_KINDS = ["company.save", "terms.save", "terms.approve", "work_role.create", "work_role.update", "work_role.archive", "work_role.reactivate", "article.create", "article.update", "article.archive", "article.reactivate"] as const;
export type OperationKind = typeof OPERATION_KINDS[number];
export interface OperationPreconditions {
    readonly operationId: string;
    readonly targetId: string;
    /** null means explicitly observed absence, never a failed read. */
    readonly expectedRevision: string | null;
    readonly contextTenantId?: string;
    readonly contextActorId?: string;
}
export interface OperationReceipt {
    readonly operationId: string;
    readonly targetId: string;
    readonly committedRevision: string;
    readonly committedAt: string;
    readonly approvedAt: string | null;
}
export const isOperationUuid = (v: unknown): v is string => typeof v === "string" && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(v);
export function operationPreconditions(raw: Record<string, unknown>): OperationPreconditions | null {
    if (!isOperationUuid(raw.operationId) || !isOperationUuid(raw.targetId) || !(raw.expectedRevision === null || isOperationUuid(raw.expectedRevision)))
        return null;
    if ((raw.contextTenantId !== undefined || raw.contextActorId !== undefined) && (!isOperationUuid(raw.contextTenantId) || !isOperationUuid(raw.contextActorId)))
        return null;
    return { ...(raw.contextTenantId !== undefined ? { contextTenantId: raw.contextTenantId as string, contextActorId: raw.contextActorId as string } : {}), operationId: raw.operationId.toLowerCase(), targetId: raw.targetId.toLowerCase(), expectedRevision: raw.expectedRevision === null ? null : raw.expectedRevision.toLowerCase() };
}
export function operationFormFields(form: FormData): Record<string, unknown> {
    return { ...(form.has("contextTenantId") ? { contextTenantId: form.get("contextTenantId"), contextActorId: form.get("contextActorId") } : {}), operationId: form.get("operationId"), targetId: form.get("targetId"), expectedRevision: form.get("expectedRevision") === "absent" ? null : form.get("expectedRevision") };
}
export interface MutationAttempt extends OperationPreconditions {
    readonly kind: OperationKind;
    readonly generation: number;
    readonly context: string;
    readonly candidate: Readonly<Record<string, unknown>>;
    readonly entries: readonly (readonly [
        string,
        string
    ])[];
    readonly phase: "pending" | "unknown" | "committed" | "rejected";
}
export function captureAttempt(input: {
    kind: OperationKind;
    generation: number;
    context: string;
    targetId: string;
    expectedRevision: string | null;
    form: FormData;
    operationId: string;
    candidate: Readonly<Record<string, unknown>>;
}): MutationAttempt {
    const entries: [
        string,
        string
    ][] = [];
    input.form.forEach((value, key) => { if (typeof value === "string")
        entries.push([key, value]); });
    return Object.freeze({ kind: input.kind, generation: input.generation, context: input.context, candidate: Object.freeze({ ...input.candidate }), targetId: input.targetId, expectedRevision: input.expectedRevision, operationId: input.operationId, entries: Object.freeze(entries.map(e => Object.freeze(e))), phase: "pending" });
}
export function attemptForm(attempt: MutationAttempt): FormData {
    const form = new FormData();
    for (const [key, value] of attempt.entries)
        form.append(key, value);
    form.set("operationId", attempt.operationId);
    form.set("targetId", attempt.targetId);
    form.set("expectedRevision", attempt.expectedRevision ?? "absent");
    return form;
}
export function settleAttempt(attempt: MutationAttempt, result: {
    operationId: string | null;
    targetId: string | null;
    status: string;
    code?: string | null;
    committedRevision?: string | null;
}): MutationAttempt {
    // A late/neighboring result cannot settle this generation. Ambiguity is sticky:
    // a later per-call rejection says nothing about the delayed original request.
    if (result.operationId !== attempt.operationId || result.targetId !== attempt.targetId)
        return attempt;
    if (attempt.phase === "committed")
        return attempt;
    const committed = result.status === "success" && isOperationUuid(result.committedRevision);
    const phase = committed ? "committed" : attempt.phase === "unknown" || result.status === "unconfirmed" || result.status === "success" || result.code === "SERVER_ERROR" ? "unknown" : "rejected";
    return Object.freeze({ ...attempt, phase });
}
export function attemptBlocksReplacement(attempt: MutationAttempt | null): boolean { return attempt?.phase === "pending" || attempt?.phase === "unknown"; }
export interface EditorOperationContext {
    readonly tenantId: string;
    readonly actorId: string;
}

/** A draft's expected facts belong to its displayed values, never refreshed props. */
export function sameDraftBaseline(a: { readonly id: string | null; readonly write_revision: string | null }, b: { readonly id: string | null; readonly write_revision: string | null }): boolean {
    return a.id === b.id && a.write_revision === b.write_revision;
}
/** Matches the existing terms parser/validator canonicalization. */
export function canonicalTermsEqual(draft: string, saved: string): boolean { return draft.trim() === saved.trim(); }
/** Failed reads never establish absence or a current revision, even after a receipt. */
export function currentTargetStatus(hasCurrentRead: boolean, readError: boolean, rows: readonly { readonly id: string; readonly write_revision: string }[], targetId: string | null, committedRevision: string | null): "unavailable" | "pending" | "missing" | "newer" | "confirmed" {
    if (readError) return "unavailable";
    if (!hasCurrentRead) return "pending";
    const row = rows.find(row => row.id === targetId);
    return !row ? "missing" : row.write_revision === committedRevision ? "confirmed" : "newer";
}
