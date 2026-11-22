/**
 * `/settings` (Inställningar) — the settings hub (Story 3.3, Task 4.1).
 *
 * Links to the IN-scope settings sub-pages: Företagsinställningar (`/settings/company`)
 * and Offertvillkor (`/settings/quote-terms`) from Story 3.3, plus Prissättning
 * (`/settings/pricing`) added by Story 3.4 (the 3.3 hub deliberately omitted it). Adds
 * NO new nav item (`nav-items.ts` stays EXACTLY the seven IN-scope modules) — pricing
 * lives under the existing Inställningar tree.
 */
import Link from "next/link";

export const dynamic = "force-dynamic";

const SETTINGS_LINKS = [
  {
    href: "/settings/company",
    title: "Företagsinställningar",
    description:
      "Företagsidentitet för offerter och PDF, samt standardvärden för momsvisning och momssats.",
  },
  {
    href: "/settings/quote-terms",
    title: "Offertvillkor",
    description:
      "Återanvändbara offertvillkor med godkännandestatus (ägare/juridik).",
  },
  {
    href: "/settings/pricing",
    title: "Prissättning",
    description:
      "Spara timpriser för arbetsroller och enhetspriser för manuella artiklar.",
  },
] as const;

export default function SettingsPage() {
  return (
    <div className="flex min-w-0 flex-col gap-6 p-gutter-field sm:p-gutter">
      <div className="flex flex-col gap-2">
        <h1 className="text-title font-semibold text-text-primary">Inställningar</h1>
        <p className="text-label text-text-secondary">
          Hantera företagsuppgifter, moms, offertvillkor och manuella priser.
        </p>
      </div>

      <ul className="flex max-w-2xl flex-col gap-3">
        {SETTINGS_LINKS.map((link) => (
          <li key={link.href}>
            <Link
              href={link.href}
              className="block min-h-control-lg rounded-control border border-border-subtle bg-card px-4 py-3 hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
            >
              <span className="block text-body font-medium text-text-primary">
                {link.title}
              </span>
              <span className="mt-1 block text-label text-text-secondary">
                {link.description}
              </span>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
