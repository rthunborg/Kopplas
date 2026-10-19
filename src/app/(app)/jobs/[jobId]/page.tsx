import { EntityDocumentsLink } from "@/components/documents/EntityDocumentsLink";
import { readEntityDocumentsLink } from "@/server/read-models/document-context";
/**
 * `/jobs/[jobId]` (Jobb/Order-detalj) — the job/order detail read UX (Story 7.3, Task 3).
 *
 * A SERVER component: it server-fetches the job detail (the `jobs` row + the immutable
 * `quote_acceptances`/`quote_versions` refs + linked files + events) by id via the per-request RLS
 * client (anon key — NEVER service-role). A foreign/other-tenant id is invisible under RLS → zero
 * rows → `notFound()` (a GENERIC not-found that NEVER reveals whether the job exists in another
 * tenant). A read error renders the generic failed state. Every money value + frozen commitment name
 * is DISPLAYED from the immutable reference — no recompute (R-708).
 *
 * `force-dynamic` because the route reads per-request auth/data; the `(app)` layout is the auth
 * boundary (this page adds no auth mechanism). This is the deep-link target the accepted quote
 * version points at (AC5 idempotency mirror).
 */
import Link from "next/link";
import { notFound } from "next/navigation";
import { JobDetailView } from "@/components/jobs/JobDetailView";
import { EntityFilePanel } from "@/components/files/EntityFilePanel";
import { readJobDetailForPage } from "@/features/jobs/read";
import { readEntityFiles } from "@/features/files/read";
import { BookingEntry } from "@/components/resources/BookingEntry";
import { readBookingHost, readBookingEditorOptions } from "@/features/resources/bookings-read";

import { readJobMembersForPage } from "@/server/read-models/job-members";
import { readJobCardOptions } from "@/server/read-models/my-jobs";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";

export const dynamic = "force-dynamic";

export default async function JobDetailPage({
  params,
}: {
  params: Promise<{ jobId: string }>;
}) {
  const { jobId } = await params;
  const { detail, error } = await readJobDetailForPage(jobId);

  if (error) {
    return (
      <section className="mx-auto max-w-3xl">
        <div
          role="alert"
          data-testid="job-detail-failed"
          className="rounded-lg border border-red-300 bg-red-50 p-6"
        >
          <p className="text-sm font-medium text-red-800">
            Jobbet kunde inte läsas in.
          </p>
          <p className="mt-1 text-sm text-red-700">{error}</p>
          <Link
            href="/jobs"
            className="mt-4 inline-flex rounded-md border border-red-300 bg-white px-3 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100"
          >
            Tillbaka till jobb
          </Link>
        </div>
      </section>
    );
  }

  if (!detail) {
    // Invisible under RLS (or genuinely absent) → GENERIC not-found, no leakage.
    notFound();
  }

  // Story 8.2 — the job's own-tenant evidence files for the entity file panel (RLS-scoped).
  const context = await resolveTenantContext();
  const roles = context.ok ? context.data.roles ?? [context.data.role] : [];
  const can = (module: string, capability: string) => resolveCapability({ roles, module, capability }).granted;
  const filesRead = can("files", "Files.View") ? await readEntityFiles({ ownerType: "job", ownerId: jobId }) : null;
  const canBook = can("resources", "Bookings.Manage");
  const bookingHost = canBook ? await readBookingHost({ jobId }) : null;
  const bookingOptions = canBook ? await readBookingEditorOptions() : null;
  const cardOptions = detail.entitlement?.canEdit ? await readJobCardOptions() : undefined;
  const memberRead = await readJobMembersForPage(undefined, jobId);

  return (
    <JobDetailView
      detail={detail}
      members={memberRead.ok ? memberRead.projection : undefined}
      membersError={memberRead.ok ? undefined : memberRead.message}
      cardOptions={cardOptions}
      bookingPanel={bookingHost && bookingOptions ? <BookingEntry {...bookingHost} options={bookingOptions} jobId={jobId} customerId={detail.customerId ?? undefined} host="job" /> : undefined}
      filesPanel={filesRead ?
        <>
        {can("documents", "Documents.View") && <EntityDocumentsLink link={await readEntityDocumentsLink({ module: "jobs", ownerType: "job", ownerId: jobId })} />}
        <EntityFilePanel
          ownerType="job"
          ownerId={jobId}
          purpose="job_evidence"
          ownerLabel={detail.title ?? detail.currentCustomerName ?? "Jobb"}
          files={filesRead.files}
          readError={filesRead.error}
        />
        </> : undefined
      }
    />
  );
}
