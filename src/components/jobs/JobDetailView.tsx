/**
 * Job/order detail view (Story 7.3, Task 3 / AC1/AC4/AC5) — the read/traceability UX for one
 * accepted job. A SERVER component: it receives the assembled `JobDetail` (money + frozen commitment
 * names DISPLAYED from the immutable `quote_acceptances`/`quote_versions` refs — never re-derived;
 * R-708) and renders:
 *   - a SOURCE-TRACEABILITY block (AC1): the source quote version (a LINK to
 *     `/quotes/[quoteId]/versions/[versionId]` + quote number), the acceptance evidence (a signed
 *     file link OR the external reference), the accepted price + source sent total (öre → kronor via
 *     the existing `oreToKronorString`), customer/facility/contact, planned dates, files, events;
 *   - the ALLOWED-EDIT affordance (AC4): the `JobEditDialog` exposing ONLY title/status/planned
 *     dates. EVERY immutable field is DISPLAY-ONLY — NO edit control renders for the source refs /
 *     accepted price / source total / evidence / accepted timestamp / channel (UX-DR26; the coming
 *     7.4 trigger is the DB backstop, but 7.3 must not even offer the affordance).
 *
 * SCOPE GUARD (AC2/AC3, R-711): NO deferred-module surface (the `job-non-scope` guardrail enforces
 * the exact forbidden token/route list). Status is a Phase-A order-lifecycle set, NOT field-worker
 * states. NO create/delete affordance (a job is only created by the 7.2 transaction). NO duplicate
 * job / second create affordance / error state on the idempotency deep-link (AC5).
 */
import Link from "next/link";
import { oreToKronorString } from "@/features/calculations/money-input";
import { type JobDetail } from "@/features/jobs/types";
import { JobCardForm, type JobCardOptions } from "./JobCardForm";
import { JobMembersPanel } from "./JobMembersPanel";
import type { JobMembersProjection } from "@/server/read-models/job-members";
import { JobEditDialog } from "./JobEditDialog";
import {JobWorkspaceRetry} from "./JobWorkspaceShell";
import { JobEvidenceLink } from "./JobEvidenceLink";

function formatDate(iso: string | null): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toLocaleDateString("sv-SE");
}

export function JobDetailView({
  detail,
  cardOptions,
  members,
  membersError,
}: {
  readonly detail: JobDetail;
  readonly cardOptions?: JobCardOptions;
  readonly members?: JobMembersProjection;
  readonly membersError?: string;
}) {
  const canEdit = detail.entitlement?.canEdit ?? true;
  const protectedMoney = detail.entitlement?.protectedMoney ?? true;
  const versionHref =
    detail.quoteId && detail.quoteVersionId
      ? `/quotes/${detail.quoteId}/versions/${detail.quoteVersionId}`
      : null;
  // STANDALONE job (owner decision 2026-07-14): both source refs NULL — no acceptance/commitment
  // exists, so the source-traceability block is replaced by a plain origin note (never a
  // fabricated 0 kr commitment).
  const isStandalone = detail.quoteAcceptanceId === null;

  return (
    <section
      data-testid="job-detail"
      aria-labelledby="job-detail-heading"
      className="flex min-w-0 flex-col gap-6"
    >
      {members && <JobMembersPanel jobId={detail.id} initial={members} />}
      {membersError && <section role="alert" data-testid="job-members-read-failed" className="rounded-lg border border-red-300 bg-red-50 p-4 text-sm text-red-800">
        <p>{membersError}</p><JobWorkspaceRetry>Hämta medlemmar igen</JobWorkspaceRetry>
      </section>}
      {!protectedMoney && <p role="note" data-testid="job-economy-entitlement" className="text-sm text-zinc-600">Ekonomiska uppgifter är inte tillgängliga</p>}
      {detail.card && <section data-testid="job-operational-card" className="rounded-lg border border-zinc-200 bg-white p-4 text-sm">
        <h2 className="mb-3 font-semibold">Jobbkort</h2>
        <dl className="grid min-w-0 grid-cols-1 gap-3 sm:grid-cols-2">
          {Object.entries({
            "Anläggning": detail.facilityName,
            "Kontakt": detail.contactName,
            "Typ": detail.type === "projekt" ? "Projekt" : "Order",
            "Prioritet": ({low:"Låg",normal:"Normal",high:"Hög",urgent:"Brådskande"} as Record<string,string>)[detail.card.priority] ?? "Okänt",
            "Uppskattad tid (minuter)": detail.card.estimated_duration_minutes,
            "Planerad restid (minuter)": detail.card.planned_travel_minutes,
            "Antal personer": detail.card.crew_size,
            "Tidigast": detail.card.earliest_date,
            "Önskat datum": detail.card.desired_date,
            "Senast": detail.card.latest_date,
            "Kundens närvaro": detail.card.customer_presence_required == null ? "Okänt" : detail.card.customer_presence_required ? "Krävs" : "Krävs inte",
            "Yrkesrollskrav": detail.card.requiredWorkRoleIds == null ? "Okända" : detail.card.requiredWorkRoleIds.length === 0 ? "Inga krav" : `${detail.card.requiredWorkRoleIds.length} valda yrkesroller`,
            "Tillträde": detail.card.accessWindows == null ? "Okänt" : detail.card.accessWindows.length === 0 ? "Inget tidsintervall tillåtet" : `${detail.card.accessWindows.length} tidsintervall`,
            "Adress": detail.location ? [detail.location.street,detail.location.postalCode,detail.location.city,detail.location.countryCode].filter(Boolean).join(", ") : "Okänd",
          }).map(([label,value]) => <div key={label} className="min-w-0"><dt className="text-zinc-600">{label}</dt><dd className="break-words text-zinc-900">{value ?? "Okänt"}</dd></div>)}
        </dl>
        {detail.card.accessWindows && detail.card.accessWindows.length > 0 && <ul className="mt-3 flex flex-col gap-1">{detail.card.accessWindows.map((window,i) => <li key={i}>{new Date(window.startsAt).toLocaleString("sv-SE",{timeZone:"Europe/Stockholm"})} – {new Date(window.endsAt).toLocaleString("sv-SE",{timeZone:"Europe/Stockholm"})} (Stockholm)</li>)}</ul>}
      </section>}
      {detail.dependencyWarnings?.map((warning) => warning.status === "clear" ? null : <p key={warning.prerequisiteJobId} role="note" data-testid={warning.status === "warning" ? "job-dependency-warning" : "job-dependency-unknown"} className="rounded-md border border-zinc-300 p-3 text-sm">{warning.status === "warning" ? "Ett föregående jobb slutar efter det här jobbets planerade start." : "Datum saknas för att bedöma ett föregående jobb."} <Link href={`/jobs/${warning.prerequisiteJobId}`} className="underline">Öppna föregående jobb</Link></p>)}

      {/* ── SOURCE TRACEABILITY (AC1, read-only immutable refs) ────────────────── */}
      {/* A STANDALONE job has NO acceptance/commitment — render an origin note instead of the
          commitment block (money stays absent; nothing is fabricated). */}
      {protectedMoney && (isStandalone ? (
        <div
          data-testid="job-standalone-origin"
          role="note"
          className="rounded-lg border border-zinc-200 bg-white p-4 text-sm text-zinc-700"
        >
          <h2 className="mb-1 text-lg font-semibold text-zinc-900">
            Ursprung och åtagande
          </h2>
          <p>
            Fristående jobb — skapat direkt utan källoffert. Det finns ingen
            accepterad offert eller något åtagande kopplat till jobbet.
          </p>
        </div>
      ) : (
      <div
        data-testid="job-source-traceability"
        className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-4"
      >
        <h2 className="text-lg font-semibold text-zinc-900">Ursprung och åtagande</h2>

        <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {/* Source quote version — a LINK to the version (display-only ref). */}
          <div className="flex flex-col gap-1">
            <dt className="text-zinc-600">Källoffert (version):</dt>
            <dd>
              {versionHref ? (
                <Link
                  href={versionHref}
                  data-testid="job-source-quote-version"
                  className="font-medium text-blue-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  {detail.quoteNumber
                    ? `Offert #${detail.quoteNumber}`
                    : "Öppna offertversion"}
                </Link>
              ) : (
                <span data-testid="job-source-quote-version" className="text-zinc-900">
                  {detail.quoteNumber ? `Offert #${detail.quoteNumber}` : "—"}
                </span>
              )}
            </dd>
          </div>

          {/* FROZEN commitment names (from the version snapshot — display only). */}
          <div className="flex flex-col gap-1">
            <dt className="text-zinc-600">Kund (vid acceptans):</dt>
            <dd data-testid="job-commitment-customer" className="text-zinc-900">
              {detail.commitmentCustomerName ?? "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-zinc-600">Anläggning:</dt>
            <dd className="text-zinc-900">{detail.commitmentFacilityName ?? "—"}</dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-zinc-600">Kontakt:</dt>
            <dd className="text-zinc-900">{detail.commitmentContactName ?? "—"}</dd>
          </div>

          {/* Accepted price + source sent total — DISPLAYED from the immutable acceptance row.
              A null value renders an em dash, NEVER a fabricated "0 kr" (R-708: display the
              frozen ref verbatim, never mask an absent value with a money-looking zero). */}
          <div className="flex flex-col gap-1">
            <dt className="text-zinc-600">Accepterat pris:</dt>
            <dd data-testid="job-accepted-price" className="font-semibold text-zinc-900">
              {detail.acceptedPriceOre != null
                ? `${oreToKronorString(detail.acceptedPriceOre)} kr`
                : "—"}
            </dd>
          </div>
          <div className="flex flex-col gap-1">
            <dt className="text-zinc-600">Ursprunglig offertsumma:</dt>
            <dd data-testid="job-source-sent-total" className="text-zinc-900">
              {detail.sourceSentTotalOre != null
                ? `${oreToKronorString(detail.sourceSentTotalOre)} kr`
                : "—"}
            </dd>
          </div>

          {detail.channel && (
            <div className="flex flex-col gap-1">
              <dt className="text-zinc-600">Kanal:</dt>
              <dd className="text-zinc-900">{detail.channel}</dd>
            </div>
          )}
          <div className="flex flex-col gap-1">
            <dt className="text-zinc-600">Accepterad:</dt>
            <dd className="text-zinc-900">{formatDate(detail.acceptedAt)}</dd>
          </div>
        </dl>

        {/* Acceptance evidence (a signed file link OR the external reference). */}
        <div className="border-t border-zinc-200 pt-3">
          <h3 className="mb-1 text-sm font-medium text-zinc-800">Bevis för acceptans</h3>
          <JobEvidenceLink
            evidenceFileId={detail.evidenceFileId}
            evidenceReference={detail.evidenceReference}
            evidenceFileName={
              detail.files.find((f) => f.fileId === detail.evidenceFileId)?.displayName ??
              null
            }
          />
        </div>

        {detail.adjustmentReason && (
          <p className="text-sm text-zinc-700">
            <span className="text-zinc-600">Justeringsskäl: </span>
            {detail.adjustmentReason}
          </p>
        )}

        {/* ── CORRECTION-BOUNDARY NOTICE (Story 7.4, AC1) ─────────────────────── */}
        {/* The accepted commitment (accepted price, source sent total, evidence, source version, */}
        {/* acceptance timestamp/channel) + the job's immutable source refs are LOCKED at BOTH the */}
        {/* command and DB layers (7.4-INT-01/02). This notice EXPLAINS the boundary as TEXT (a11y — */}
        {/* not color alone): corrections require an approved audited workflow, NOT a silent edit. */}
        {/* SCOPE GUARD (R-714 STOP): explanatory ONLY — NO "request correction" action, NO edit */}
        {/* affordance for any immutable field (none renders — every immutable field is display-only */}
        {/* above; the 7.3 allowed-edit dialog exposes ONLY title/status/planned dates below). */}
        <div
          data-testid="job-accepted-lock-notice"
          role="note"
          className="border-t border-zinc-200 pt-3 text-sm text-zinc-700"
        >
          <p>
            Det accepterade åtagandet är{" "}
            <span className="font-medium text-zinc-900">låst</span> — accepterat pris,
            ursprunglig offertsumma, bevis, källoffertversion samt tidpunkt och kanal för
            acceptansen kan inte redigeras här. Korrigeringar kräver ett{" "}
            <span className="font-medium text-zinc-900">godkänt granskat arbetsflöde</span>,
            inte en tyst ändring.
          </p>
        </div>
      </div>
      ))}

      {/* ── ALLOWED-EDIT AFFORDANCE (AC4) — title / status / planned dates ONLY ── */}
      {canEdit && <div className="rounded-lg border border-zinc-200 bg-white p-4">
        <h2 className="mb-2 text-sm font-semibold text-zinc-900">Redigera</h2>
        <JobEditDialog
          jobId={detail.id}
          title={detail.title}
          status={detail.status}
          plannedStartDate={detail.plannedStartDate}
          plannedEndDate={detail.plannedEndDate}
        />
      </div>}
      {canEdit && cardOptions && <section className="rounded-lg border border-zinc-200 bg-white p-4"><JobCardForm key={detail.id} jobId={detail.id} options={cardOptions} initial={{ ...detail.card, type: detail.type ?? "order", title: detail.title, customer_id: detail.customerId, planned_start_date: detail.plannedStartDate, planned_end_date: detail.plannedEndDate }} /></section>}

    </section>
  );
}

