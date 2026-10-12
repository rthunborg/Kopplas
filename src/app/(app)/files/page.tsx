import { Suspense } from "react";
import { FileIndexList } from "@/components/files/FileIndexList";
import { readDocuments } from "@/server/read-models/documents";
import { ownerCategoryLabel } from "@/features/files/file-index";
import { readCustomerList } from "@/features/crm/read";
import { readCalculationList } from "@/features/calculations/read";
import { readJobList } from "@/features/jobs/read";

export const dynamic = "force-dynamic";
export default async function FilesPage({ searchParams }: { readonly searchParams: Promise<{ cursor?: string | string[]; search?: string | string[]; owner?: string | string[] }> }) {
  const query = await searchParams;
  // Match URLSearchParams.get: repeated query keys deterministically use the first
  // scalar value. Arrays never reach the reader or string-only client controls.
  const first = (value: string | string[] | undefined): string | undefined => Array.isArray(value) ? value[0] : value;
  const cursor = first(query.cursor); const search = first(query.search); const owner = first(query.owner);
  return <Suspense fallback={<section className="flex flex-col gap-6 p-6"><h1 className="text-2xl font-semibold text-zinc-900">Dokument</h1><p role="status">Läser in dokument…</p></section>}><DocumentsContent cursor={cursor} search={search} owner={owner} /></Suspense>;
}
async function DocumentsContent({ cursor, search, owner }: { readonly cursor?: string; readonly search?: string; readonly owner?: string }) {
  const documents = await readDocuments({ cursor, filter: { search, ownerCategory: owner } });
  // Current authority is resolved before reading any contextual upload options.
  const [customerResult, calculationResult, jobResult] = documents.ok ? await Promise.all([
    readCustomerList(), readCalculationList(), readJobList(),
  ]) : [{ rows: [], error: null }, { rows: [], error: null }, { rows: [], error: null }];
  const uploadOwnerOptions = {
    customer: customerResult.rows.map(c => ({ id: c.id, label: c.display_name })),
    calculation: calculationResult.rows.map(c => ({ id: c.id, label: c.customer_display_name ? `${c.title} — ${c.customer_display_name}` : c.title })),
    job: jobResult.rows.map(j => ({ id: j.id, label: j.title ?? `${j.customerDisplayName ?? "Jobb"} (${j.id.slice(0, 8)})` })),
  };
  return <FileIndexList
    rows={documents.ok ? documents.data.descriptor.data.rows.map(row => ({ ...row, ownerCategory: ownerCategoryLabel(row.ownerType) ?? "" })) : []}
    initialSearch={search ?? ""}
    initialOwnerCategory={owner ?? ""}
    ownerTypes={documents.ok ? documents.data.descriptor.data.ownerTypes : []}
    loadError={documents.ok ? null : documents.message}
    nextCursor={documents.ok ? documents.data.descriptor.data.nextCursor : null}
    uploadOwnerOptions={uploadOwnerOptions}
    uploadOptionsLoadError={customerResult.error !== null || calculationResult.error !== null || jobResult.error !== null}
  />;
}
