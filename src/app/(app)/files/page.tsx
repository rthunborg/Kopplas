import { Suspense } from "react";
import { randomUUID } from "node:crypto";
import { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { executeBoundDocumentLifecycle } from "@/server/commands/documents/lifecycle";
import { DocumentsWorkspace } from "@/components/documents/DocumentFilters";
import { readDocuments } from "@/server/read-models/documents";
import { parseDocumentFilters, type DocumentFilters } from "@/features/documents/filters";
import { readCustomerList } from "@/features/crm/read";
import { readCalculationList } from "@/features/calculations/read";
import { readJobList } from "@/features/jobs/read";
export const dynamic = "force-dynamic";
export default async function FilesPage({ searchParams }: { readonly searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams, params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) for (const item of Array.isArray(value) ? value : value === undefined ? [] : [value]) params.append(key, item);
  const filters = parseDocumentFilters(params);
  if (!filters.ok) return <section className="p-3 md:p-6"><h1 className="text-2xl font-semibold">Dokument</h1><div data-testid="documents-filter-error"><p role="alert">{filters.message}</p><a href="/files" className="text-blue-700 underline">Rensa filter</a></div></section>;
  return <Suspense fallback={<section className="flex flex-col gap-6 p-6"><h1 className="text-2xl font-semibold text-zinc-900">Dokument</h1><p role="status">Läser in dokument…</p></section>}><DocumentsContent filters={filters.data} /></Suspense>;
}
async function DocumentsContent({ filters }: { readonly filters: DocumentFilters }) {
  const client = await createSupabaseServerClient();
  const documents = await readDocuments({ client, filters });
  const context = documents.ok ? await resolveTenantContext({ client }) : null;
  const [customers, calculations, jobs] = documents.ok ? await Promise.all([readCustomerList(), readCalculationList(), readJobList()]) : [{ rows: [], error: null }, { rows: [], error: null }, { rows: [], error: null }];
  const data = documents.ok ? documents.data.descriptor.data : null;
  // A bounded, fresh archived projection may offer undo only for checked ordinary restore hints.
  const undoRead = documents.ok && filters.mode === "active" ? await readDocuments({ client, filters: { ...filters, mode: "archived", cursor: undefined } }) : null;
  const undoRows = undoRead?.ok ? undoRead.data.descriptor.data.rows.filter(row => row.canRestore) : [];
  const actions = [...(data?.rows ?? []), ...undoRows].map(row => {
    const tenantId = context?.ok ? context.data.tenantId : "";
    const actorUserId = context?.ok ? context.data.userId : "";
    const linkId = row.linkId, fileId = row.fileId;
    const archiveCorrelationId = randomUUID(), restoreCorrelationId = randomUUID();
    // Next encrypts each closure's minimal captured tuple, bound to its action ID.
    async function archiveDocumentAction(input: unknown) {
      "use server";
      return executeBoundDocumentLifecycle(input, { tenantId, actorUserId, linkId, fileId, operation: "archive", correlationId: archiveCorrelationId });
    }
    async function restoreDocumentAction(input: unknown) {
      "use server";
      return executeBoundDocumentLifecycle(input, { tenantId, actorUserId, linkId, fileId, operation: "restore", correlationId: restoreCorrelationId });
    }
    return { linkId, archiveDocumentAction, restoreDocumentAction };
  });
  return <DocumentsWorkspace key={context?.ok ? `${context.data.tenantId}:${context.data.userId}` : "unavailable"} authorityIdentity={context?.ok ? `${context.data.tenantId}:${context.data.userId}` : "unavailable"} actions={actions} undoRows={undoRows} rows={data?.rows ?? []} initialFilters={filters} facets={data?.facets ?? { module: [], ownerType: [], purpose: [] }} total={data?.total ?? 0} nextCursor={data?.nextCursor ?? null} loadError={documents.ok ? null : documents.message}
    uploadOwnerOptions={{ customer: customers.rows.map(c => ({ id: c.id, label: c.display_name })), calculation: calculations.rows.map(c => ({ id: c.id, label: c.customer_display_name ? `${c.title} — ${c.customer_display_name}` : c.title })), job: jobs.rows.map(j => ({ id: j.id, label: j.title ?? `${j.customerDisplayName ?? "Jobb"} (${j.id.slice(0, 8)})` })) }}
    uploadOptionsLoadError={customers.error !== null || calculations.error !== null || jobs.error !== null} />;
}
