import type { ReactNode } from "react";

// DESIGN type sizes converted at the 16px root baseline so user text enlargement scales.
// Existing role utilities still supply the approved line-height and tracking.
export function WidgetCard({ title, href, children, busy }: {
  readonly title: string; readonly href: string; readonly children?: ReactNode; readonly busy?: boolean;
}) {
  return (
    <section role="region" aria-label={title} aria-busy={busy || undefined} className="min-w-0 rounded-card border border-border-default bg-card p-ds-6 text-text-primary sm:p-ds-8 md:col-span-12">
      <h2 className="text-heading font-medium" style={{ fontSize: "1.25rem" }}>{title}</h2>
      <div className="mt-ds-8">{children}</div>
      <a href={href} className="mt-ds-8 inline-flex min-h-control-lg min-w-control-lg items-center rounded-control text-label font-medium text-text-primary underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink" style={{ fontSize: "0.8125rem" }}>
        Visa offerter
      </a>
    </section>
  );
}
