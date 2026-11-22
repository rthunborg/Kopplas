import { Suspense } from "react";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
/**
 * `/settings/quote-terms` (Offertvillkor) — the tenant-owned quote terms editor with
 * the owner/legal SIGN-OFF status/warning (Story 3.3, Task 4.1 / AC2).
 *
 * A SERVER component over the RLS-scoped settings read: it reads the tenant's
 * quote_terms on the per-request cookie-bound RLS client (anon key — NEVER
 * service-role) and hands the values + sign-off state to the client `QuoteTermsEditor`
 * island. A tenant with no terms row yet renders an empty editor — and a null/empty
 * terms record is, by definition, NOT approved (the not-approved WARNING shows).
 *
 * `force-dynamic` because this route reads per-request auth/data (the `(app)` layout is
 * the auth boundary). This page adds NO auth mechanism.
 */
import Link from "next/link";
import { QuoteTermsEditor } from "@/components/settings/QuoteTermsEditor";
import { readQuoteTerms } from "@/features/settings/read";

export const dynamic = "force-dynamic";

export default function QuoteTermsPage() {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-gutter-field sm:p-gutter">
      <div className="flex flex-col gap-2">
        <Link
          href="/settings"
          className="inline-flex min-h-control-lg items-center self-start rounded-control text-label text-text-secondary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          ← Inställningar
        </Link>
        <h1 className="text-title font-semibold text-text-primary">Offertvillkor</h1>
        <p className="text-label text-text-secondary">
          Återanvändbara offertvillkor för din organisation. Villkoren godkänns av
          ägare/juridik innan de används i skarpa offerter.
        </p>
      </div>

      <Suspense fallback={<p role="status" className="text-body text-text-secondary">Hämtar offertvillkor…</p>}>
        <QuoteTermsContent />
      </Suspense>
    </div>
  );
}

async function QuoteTermsContent() {
  const contextResult = await resolveTenantContext();
  const operationContext = contextResult.ok ? { tenantId: contextResult.data.tenantId, actorId: contextResult.data.userId } : null;
  const { terms, error } = await readQuoteTerms();

  const defaults = {
    operationContext,
    readToken: crypto.randomUUID(),
    write_revision: terms?.write_revision ?? null,
    readError: error !== null,
    id: terms?.id ?? null,
    terms_text: terms?.terms_text ?? "",
    approved_at: terms?.approved_at ?? null,
    approved_by: terms?.approved_by ?? null,
  };

  return (
    <>
      {error && (
        <p
          role="alert"
          className="max-w-2xl rounded-control border border-risk-text bg-risk-surface px-3 py-2 text-label text-risk-text"
        >
          {error}
        </p>
      )}

      <QuoteTermsEditor defaults={defaults} />
    </>
  );
}
