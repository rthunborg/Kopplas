import { readTimeReportActionDescriptor } from "@/server/read-models/time-reports";
import { EntityDocumentsLink } from "@/components/documents/EntityDocumentsLink";
import { readEntityDocumentsLink } from "@/server/read-models/document-context";
/**
 * `/customers/[customerId]` (Kund hub) — the customer detail (Story 3.2, Task 2).
 *
 * A SERVER component: it server-fetches the single customer (+ active facilities and
 * contacts) by id via the per-request RLS client (anon key — NEVER service-role). A
 * foreign/other-tenant id is invisible under RLS → zero rows → a GENERIC "not found / no
 * access" state that NEVER reveals whether the row exists in another tenant (no
 * cross-tenant leakage). A read error renders the generic failed state.
 *
 * `force-dynamic` because the route reads per-request auth/data; the `(app)` layout is
 * the auth boundary (this page adds no auth mechanism).
 */
import Link from "next/link";
import { CustomerDetail } from "@/components/crm/CustomerDetail";
import { EntityFilePanel } from "@/components/files/EntityFilePanel";
import { readCustomerDetail } from "@/features/crm/read";
import { readEntityFiles } from "@/features/files/read";
import { BookingEntry } from "@/components/resources/BookingEntry";
import { readBookingHost, readBookingEditorOptions } from "@/features/resources/bookings-read";

export const dynamic = "force-dynamic";

export default async function CustomerDetailPage({
  params,
}: {
  params: Promise<{ customerId: string }>;
}) {
  const { customerId } = await params;
  const { customer, facilities, contacts, error } =
    await readCustomerDetail(customerId);
  // Story 8.2 — the own-tenant linked files for the customer + each facility + each contact
  // (RLS-scoped; a cross-tenant id returns zero rows). Fetched in PARALLEL, only when we have
  // a customer to render the panels for.
  const [filesRead, facilityFiles, contactFiles] = customer
    ? await Promise.all([
        readEntityFiles({ ownerType: "customer", ownerId: customerId }),
        Promise.all(
          facilities.map(async (f) => ({
            id: f.id,
            name: f.name,
            read: await readEntityFiles({ ownerType: "facility", ownerId: f.id }),
            documentsLink: await readEntityDocumentsLink({ module: "crm", ownerType: "facility", ownerId: f.id }),
          })),
        ),
        Promise.all(
          contacts.map(async (c) => ({
            id: c.id,
            name: c.name,
            read: await readEntityFiles({ ownerType: "contact", ownerId: c.id }),
            documentsLink: await readEntityDocumentsLink({ module: "crm", ownerType: "contact", ownerId: c.id }),
          })),
        ),
      ])
    : [null, [], []];

  if (error) {
    return (
      <section className="mx-auto min-w-0 max-w-4xl">
        <div
          role="alert"
          data-testid="customer-detail-failed"
          className="rounded-card border border-risk-text bg-risk-surface p-4 sm:p-6 [overflow-wrap:anywhere]"
        >
          <h1 className="text-heading font-medium text-risk-text">
            Kunden kunde inte läsas in.
          </h1>
          <p className="mt-3 text-body text-risk-text">{error}</p>
          <Link
            href="/customers"
            className="mt-4 inline-flex min-h-control-lg items-center rounded-control border border-risk-text bg-card px-3 py-2 text-label font-medium text-risk-text hover:bg-risk-surface focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Tillbaka till kunder
          </Link>
        </div>
      </section>
    );
  }

  if (!customer) {
    // Invisible under RLS (or genuinely absent) → GENERIC not-found, no leakage.
    return (
      <section className="mx-auto min-w-0 max-w-4xl">
        <div
          data-testid="customer-not-found"
          className="rounded-card border border-dashed border-border-default bg-card px-4 py-12 text-center sm:p-12"
        >
          <h1 className="text-heading font-medium text-text-primary">Kunden hittades inte</h1>
          <p className="mx-auto mt-3 max-w-prose-max text-body text-text-secondary">
            Kunden finns inte eller så har du inte åtkomst till den.
          </p>
          <Link
            href="/customers"
            className="mt-4 inline-flex min-h-control-lg items-center rounded-control border border-border-strong px-3 py-2 text-label font-medium text-text-primary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
          >
            Tillbaka till kunder
          </Link>
        </div>
      </section>
    );
  }

  const facilityFilePanels: Record<string, React.ReactNode> = {};
  for (const f of facilityFiles) {
    facilityFilePanels[f.id] = (
      <>
      <EntityDocumentsLink link={f.documentsLink} />
      <EntityFilePanel
        ownerType="facility"
        ownerId={f.id}
        purpose="crm_document"
        ownerLabel={f.name}
        files={f.read.files}
        readError={f.read.error}
        parentCustomerId={customer.id}
        testIdSuffix={`facility-${f.id}`}
      />
      </>
    );
  }
  const contactFilePanels: Record<string, React.ReactNode> = {};
  for (const c of contactFiles) {
    contactFilePanels[c.id] = (
      <>
      <EntityDocumentsLink link={c.documentsLink} />
      <EntityFilePanel
        ownerType="contact"
        ownerId={c.id}
        purpose="crm_document"
        ownerLabel={c.name}
        files={c.read.files}
        readError={c.read.error}
        parentCustomerId={customer.id}
        testIdSuffix={`contact-${c.id}`}
      />
      </>
    );
  }

  return (
    <CustomerDetail
      customer={customer}
      facilities={facilities}
      contacts={contacts}
      bookingPanel={<BookingEntry reportAction={await readTimeReportActionDescriptor()} {...await readBookingHost({customerId})} options={await readBookingEditorOptions()} customerId={customerId} host="customer" />}
      filesPanel={
        <>
        <EntityDocumentsLink link={await readEntityDocumentsLink({ module: "crm", ownerType: "customer", ownerId: customer.id })} />
        <EntityFilePanel
          ownerType="customer"
          ownerId={customer.id}
          purpose="crm_document"
          ownerLabel={customer.display_name}
          files={filesRead?.files ?? []}
          readError={filesRead?.error ?? null}
        />
        </>
      }
      facilityFilePanels={facilityFilePanels}
      contactFilePanels={contactFilePanels}
    />
  );
}
