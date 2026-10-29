"use client";

/**
 * Customer list (Story 3.2, Task 1) — search + filter + ALL FIVE lifecycle states,
 * mounted by the server `/customers` page over the RLS-scoped list projection.
 *
 * The projection EXCLUDES personnummer entirely (it never reaches this client), so the
 * list can never render or search it (the private-data posture is structural, not a
 * comment). Search runs client-side over the already-fetched, RLS-scoped page (a
 * pragmatic choice for the pilot's small per-tenant data set — Task 1.3); the URL
 * search param keeps list state on a detail round-trip is handled by the server page.
 *
 * Lifecycle states (AC1) are DISTINCT, clearly-labelled, and never color-only:
 *   - failed   → the server read errored (passed in as `loadError`); retry affordance.
 *   - empty    → no customers exist yet; invite to create the first.
 *   - no-results → search/filter matched nothing (distinct from empty).
 *   - loading  → the client filter transition (a spinner-free skeleton is overkill for
 *     a client-side filter; the populated list updates synchronously).
 *   - duplicate-like warning → surfaced in the create dialog (non-blocking advisory).
 */
import { useMemo, useState } from "react";
import Link, { useLinkStatus } from "next/link";
import { CustomerDialog } from "./CustomerDialog";
import { CustomerTypeBadge } from "./CustomerTypeBadge";
import {
  CUSTOMER_TYPE_LABELS,
  matchesQuery,
  toCustomerListItem,
  type CustomerListItem,
  type CustomerListRow,
} from "./customer-presentation";
import type { CustomerType } from "@/server/commands/crm/validation";

const TYPE_FILTERS: ReadonlyArray<{ value: string; label: string }> = [
  { value: "all", label: "Alla kundtyper" },
  ...(
    Object.entries(CUSTOMER_TYPE_LABELS) as [CustomerType, string][]
  ).map(([value, label]) => ({ value, label })),
];

export function CustomerList({
  rows,
  loadError,
}: {
  /** The RLS-scoped list projection rows (personnummer is NOT among them). */
  readonly rows: readonly CustomerListRow[];
  /** When the server read errored, the generic Swedish message (no leaked detail). */
  readonly loadError: string | null;
}) {
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [createOpen, setCreateOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sort, setSort] = useState("name-asc");

  const items = useMemo<CustomerListItem[]>(
    () => rows.map(toCustomerListItem),
    [rows],
  );

  const filtered = useMemo(() => {
    return items.filter(
      (it) =>
        (typeFilter === "all" || it.type === typeFilter) &&
        matchesQuery(it, query),
    ).sort((a, b) => {
      const direction = sort === "name-desc" ? -1 : 1;
      return direction * a.displayName.localeCompare(b.displayName, "sv") || a.id.localeCompare(b.id);
    });
  }, [items, query, typeFilter, sort]);

  // ── FAILED state ──────────────────────────────────────────────────────────────
  if (loadError) {
    return (
      <section className="mx-auto max-w-5xl">
        <ListHeader onCreate={() => setCreateOpen(true)} />
        <div
          role="alert"
          data-testid="customers-failed"
          className="mt-6 rounded-card border border-risk-text bg-risk-surface p-6"
        >
          <p className="flex items-center gap-2 text-body font-medium text-risk-text">
            <ErrorIcon />
            Kundlistan kunde inte läsas in.
          </p>
          <p className="mt-1 text-body text-risk-text">{loadError}</p>
          <Link
            href="/customers"
            className="mt-4 inline-flex min-h-control-lg items-center rounded-control border border-risk-text bg-card px-3 py-1.5 text-body font-medium text-risk-text hover:bg-risk-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Försök igen
          </Link>
        </div>
      </section>
    );
  }

  const isEmpty = items.length === 0;
  const isNoResults = !isEmpty && filtered.length === 0;

  return (
    <section className="mx-auto max-w-5xl">
      <ListHeader onCreate={() => setCreateOpen(true)} />

      {!isEmpty && (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          <div className="flex min-w-0 flex-1 flex-col gap-1">
            <label htmlFor="customer-search" className="text-label font-medium text-text-secondary">
              Sök kund
            </label>
            <input
              id="customer-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Namn, e-post, telefon, ort eller org.nr"
              className="min-h-control-lg rounded-control border-0 bg-sunken px-3 py-2 text-body text-text-primary placeholder:text-text-tertiary focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="customer-type-filter" className="text-label font-medium text-text-secondary">
              Filtrera typ
            </label>
            <select
              id="customer-type-filter"
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="min-h-control-lg rounded-control border-0 bg-sunken px-3 py-2 text-body text-text-primary focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink"
            >
              {TYPE_FILTERS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="customer-sort" className="text-label font-medium text-text-secondary">Sortera kunder</label>
            <select id="customer-sort" value={sort} onChange={(e) => setSort(e.target.value)} className="min-h-control-lg rounded-control border-0 bg-sunken px-3 py-2 text-body text-text-primary focus-visible:outline focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink">
              <option value="name-asc">Namn stigande A–Ö</option>
              <option value="name-desc">Namn fallande Ö–A</option>
            </select>
          </div>
          <button type="button" onClick={() => { setQuery(""); setTypeFilter("all"); }} className="min-h-control-lg rounded-control border border-border-strong bg-card px-3 text-label font-medium text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Återställ filter</button>
        </div>
      )}

      {/* ── EMPTY state ── */}
      {isEmpty && (
        <div
          data-testid="customers-empty"
          className="mt-6 rounded-card border border-dashed border-border-strong bg-card px-ds-8 py-ds-12 text-center"
        >
          <p className="text-ds-17 font-medium text-text-primary">Inga kunder ännu</p>
          <p className="mx-auto mt-1 max-w-80 text-table text-text-secondary">
            Skapa din första kund för att komma igång.
          </p>
          <button
            type="button"
            onClick={() => setCreateOpen(true)}
            className="mt-4 inline-flex min-h-control-lg items-center rounded-control bg-ink px-4 py-2 text-body font-medium text-white hover:bg-n-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
          >
            Ny kund
          </button>
        </div>
      )}

      {/* ── NO-RESULTS state (distinct from empty) ── */}
      {isNoResults && (
        <div
          data-testid="customers-no-results"
          className="mt-6 rounded-card border border-dashed border-border-strong bg-card px-ds-8 py-ds-12 text-center"
        >
          <p className="text-ds-17 font-medium text-text-primary">Inga träffar</p>
          <p className="mx-auto mt-1 max-w-80 text-table text-text-secondary">
            Ingen kund matchar din sökning eller ditt filter. Justera och försök igen.
          </p>
        </div>
      )}

      {/* ── POPULATED list ── */}
      {!isEmpty && !isNoResults && (
        <div role="region" aria-label="Kundlista, rulla i sidled för fler kolumner" tabIndex={0} className="mt-6 overflow-x-auto rounded-card border border-border-subtle bg-card focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
          <table className="min-w-full divide-y divide-border-subtle text-table tabular-nums">
            <caption className="sr-only">Kundlista</caption>
            <thead className="bg-sunken text-left text-micro font-medium uppercase text-text-tertiary">
              <tr>
                <th scope="col" className="px-row-inline py-row-block">Välj</th>
                <th scope="col" aria-sort={sort === "name-asc" ? "ascending" : "descending"} className="px-row-inline py-row-block">Kund</th>
                <th scope="col" className="px-row-inline py-row-block">Typ</th>
                <th scope="col" className="px-row-inline py-row-block">Org.nr</th>
                <th scope="col" className="px-row-inline py-row-block">Ort</th>
                <th scope="col" className="px-row-inline py-row-block">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border-subtle" data-testid="customers-table-body">
              {filtered.map((it) => (
                <tr key={it.id} data-selected={selectedId === it.id ? "true" : "false"} className={selectedId === it.id ? "bg-selected" : "hover:bg-hover"}>
                  <td className="relative px-row-inline py-row-block">
                    {selectedId === it.id && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-ds-1 bg-ink" />}
                    <input type="checkbox" aria-label={`Välj ${it.displayName}`} checked={selectedId === it.id} onChange={() => setSelectedId(selectedId === it.id ? null : it.id)} className="min-h-control-lg min-w-control-lg accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" />
                  </td>
                  <td className="px-row-inline py-row-block">
                    <Link
                      href={`/customers/${it.id}`}
                      className="inline-flex min-h-control-lg items-center font-medium text-text-primary underline underline-offset-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      <CustomerNavigationLabel name={it.displayName} />
                    </Link>
                  </td>
                  <td className="px-row-inline py-row-block">
                    <CustomerTypeBadge type={it.type} />
                  </td>
                  <td className="px-row-inline py-row-block text-text-secondary">{it.identifier ?? "—"}</td>
                  <td className="px-row-inline py-row-block text-text-secondary">{it.city ?? "—"}</td>
                  <td className="px-row-inline py-row-block">
                    {it.isArchived ? (
                      <span className="inline-flex items-center gap-ds-3 text-ds-14 text-text-primary">
                        <span aria-hidden="true" className="size-ds-3 shrink-0 rounded-full bg-text-tertiary" /> Arkiverad
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-ds-3 text-ds-14 text-text-primary">
                        <span aria-hidden="true" className="size-ds-3 shrink-0 rounded-full bg-signal" /> Aktiv
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <CustomerDialog
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        mode="create"
        existingCustomers={items}
      />
    </section>
  );
}

function ListHeader({ onCreate }: { onCreate: () => void }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-title font-medium text-text-primary">Kunder</h1>
      <button
        type="button"
        onClick={onCreate}
        data-testid="new-customer-button"
        className="inline-flex min-h-control-lg items-center gap-2 rounded-control bg-ink px-4 py-2 text-body font-medium text-white hover:bg-n-800 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink"
      >
        <PlusIcon /> Ny kund
      </button>
    </div>
  );
}

function PlusIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-4">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function ErrorIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="size-5">
      <path d="M12 9v3.75m0 3.75h.008M10.06 3.54 1.7 18a1.5 1.5 0 0 0 1.3 2.25h18a1.5 1.5 0 0 0 1.3-2.25L13.94 3.54a1.5 1.5 0 0 0-2.88 0Z" />
    </svg>
  );
}
function CustomerNavigationLabel({name}: {readonly name: string}) {
  const {pending} = useLinkStatus();
  return <>{name}{pending && <span role="status" className="ml-2 text-caption text-text-tertiary">Laddar kund…</span>}</>;
}
