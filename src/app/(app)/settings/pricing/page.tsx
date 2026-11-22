import { setTimeout as delay } from "node:timers/promises";
import { Suspense, use } from "react";
import type { EditorOperationContext } from "@/features/settings/mutation-attempt";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
/**
 * `/settings/pricing` (Prissättning) — work roles + optional minimal articles (Story
 * 3.4, Task 4.1; architecture §4).
 *
 * A SERVER component over the RLS-scoped pricing reads: it reads the tenant's work roles
 * + articles on the per-request cookie-bound RLS client (anon key — NEVER service-role)
 * and hands the values to the client editor islands. A tenant with no rows yet renders
 * empty editors (the first save INSERTs a row via the 3.4 upsert command).
 *
 * `force-dynamic` because this route reads per-request auth/data (the `(app)` layout is
 * the auth boundary; only the `build` gate catches a missing one). This page adds NO
 * auth mechanism and NO new nav item — Prissättning lives UNDER the existing
 * Inställningar tree.
 */
import Link from "next/link";
import { WorkRolesEditor } from "@/components/pricing/WorkRolesEditor";
import { ArticlesEditor } from "@/components/pricing/ArticlesEditor";
import {
  readArchivedArticles,
  readArchivedWorkRoles,
  readArticles,
  readWorkRoles,
} from "@/features/pricing/read";

export const dynamic = "force-dynamic";

const LOADING_DELAY_MS = 120;

export default async function PricingSettingsPage() {
  const contextResult = await resolveTenantContext();
  const operationContext = contextResult.ok
    ? { tenantId: contextResult.data.tenantId, actorId: contextResult.data.userId }
    : null;
  const pendingReads = readPricing();
  // Brief reads finish with the page. Slow reads show the loading label without
  // discarding or restarting the original authorized queries.
  const timer = new AbortController();
  const loadingDelay = delay(LOADING_DELAY_MS, null, { signal: timer.signal });
  const reads = await Promise.race([pendingReads, loadingDelay]).finally(() => timer.abort());

  return (
    <div className="flex min-w-0 flex-col gap-8 p-gutter-field sm:p-gutter">
      <div className="flex flex-col gap-2">
        <Link
          href="/settings"
          className="inline-flex min-h-control-lg items-center self-start rounded-control text-label text-text-secondary underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          ← Inställningar
        </Link>
        <h1 className="text-title font-semibold text-text-primary">Prissättning</h1>
        <p className="text-label text-text-secondary">
          Hantera återanvändbara timpriser för arbetsroller och enhetspriser för manuella artiklar.
        </p>
      </div>

      <Suspense fallback={<p role="status" className="text-body text-text-secondary">Hämtar arbetsroller och artiklar…</p>}>
        <PricingEditors result={reads ?? pendingReads} operationContext={operationContext} />
      </Suspense>
    </div>
  );
}

function readPricing() {
  return Promise.all([
    readWorkRoles(),
    readArticles(),
    readArchivedWorkRoles(),
    readArchivedArticles(),
  ]);
}

function PricingEditors({ result, operationContext }: {
  readonly result: ReturnType<typeof readPricing> | Awaited<ReturnType<typeof readPricing>>;
  readonly operationContext: EditorOperationContext | null;
}) {
  const reads = result instanceof Promise ? use(result) : result;
  const [
    { workRoles, error: workRolesError },
    { articles, error: articlesError },
    { workRoles: archivedWorkRoles, error: archivedWorkRolesError },
    { articles: archivedArticles, error: archivedArticlesError },
  ] = reads;
  const readToken = crypto.randomUUID();
  return (
    <>
      <WorkRolesEditor
        readError={Boolean(workRolesError || archivedWorkRolesError)}
        readToken={readToken}
        operationContext={operationContext}
        workRoles={workRoles}
        archivedWorkRoles={archivedWorkRoles}
      />
      <ArticlesEditor
        readError={Boolean(articlesError || archivedArticlesError)}
        readToken={readToken}
        operationContext={operationContext}
        articles={articles}
        archivedArticles={archivedArticles}
      />
    </>
  );
}
