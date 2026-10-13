import type { DocumentContextResult } from "@/server/read-models/document-context";

/** Minimal server-rendered entry; its projection has already passed current source authority. */
export function EntityDocumentsLink({ link }: { readonly link: DocumentContextResult }) {
  if (link.state !== "available" || !link.entitlements.canOpenDocuments || !link.data.href) return null;
  return <a href={link.data.href} className="inline-block rounded text-sm text-blue-700 underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600">Visa i Dokument</a>;
}
