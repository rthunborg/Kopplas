"use client";

/**
 * Phase A app shell — the ONLY sidebar in the app (no nested sidebars; UX §2).
 *
 * Responsive navigation model (UX §2):
 *   - lg+ (≥1024px): persistent sidebar with icon + text label.
 *   - md  (768–1023px): collapses to an icon rail; each icon-only link exposes an
 *     accessible name (`aria-label`) AND a CSS tooltip on hover/focus-visible (AC3).
 *   - <md (<768px): rail hidden; a drawer is toggled by the top-bar hamburger.
 *
 * Presentation only — navigation is NOT a security boundary. It renders links and a
 * page-title/primary-action chrome; authorization is enforced server-side / via RLS
 * in later stories (epics.md#Story 1.3 Security/RLS Impact).
 */

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import type { NavItem } from "./nav-items";
import { NavIcon } from "./NavIcon";
import { SignOutButton } from "./SignOutButton";
import { NotificationBell } from "@/components/notifications/NotificationBell";

/**
 * Server-resolved tenant/user context passed DOWN from the `(app)` server layout
 * (Story 2.1, Task 4). These are PRESENTATIONAL display values only — the authority
 * stays server-side (`resolveTenantContext`). The shell never re-resolves or trusts
 * client state for authorization.
 */
export type AppShellContext = {
  /** Active tenant/company display name, or null when unavailable. */
  readonly tenantName: string | null;
  /** Current user's email (display only), or null when unavailable. */
  readonly userEmail: string | null;
};

function isActive(pathname: string | null, href: string): boolean {
  if (!pathname) return false;
  // Exact match today; `startsWith` keeps active state correct once detail routes land.
  return pathname === href || pathname.startsWith(`${href}/`);
}

// Labels organize only the supplied DTO. Contiguous runs preserve its exact order;
// this is not a destination registry or a permission/capability fallback.
function navigationSection(href: string): string {
  if (href.startsWith("/admin/") || href === "/settings") return "Administration";
  if (href === "/dashboard") return "Översikt";
  if (["/customers", "/calculations", "/quotes"].includes(href)) return "Affärer";
  if (["/jobs", "/scheduling", "/my-day", "/time-reports"].includes(href)) return "Arbete";
  return "Dokument";
}

function NavLinks({
  variant,
  pathname,
  navigation,
  onNavigate,
}: {
  variant: "sidebar" | "drawer";
  pathname: string | null;
  navigation: readonly NavItem[];
  onNavigate?: () => void;
}) {
  const sections: { label: string; items: NavItem[] }[] = [];
  for (const item of navigation) {
    const label = navigationSection(item.href);
    const previous = sections.at(-1);
    if (previous?.label === label) previous.items.push(item);
    else sections.push({ label, items: [item] });
  }
  return (
    <div className="space-y-4">
      {sections.map((section, index) => <section key={`${section.label}-${index}`} aria-label={section.label}>
        <p className={`px-3 pb-2 text-micro font-medium uppercase text-text-tertiary ${variant === "sidebar" ? "hidden lg:block" : "block"}`}>{section.label}</p>
        <ul className="flex flex-col gap-1">
      {section.items.map((item) => {
        const active = isActive(pathname, item.href);
        return (
          <li key={item.href} className="relative">
            <Link
              href={item.href}
              onClick={onNavigate}
              aria-current={active ? "page" : undefined}
              // Sidebar collapses to icon-only at md, so the link needs an explicit
              // accessible name there. The drawer always shows its text label.
              aria-label={variant === "sidebar" ? item.label : undefined}
              className={[
                "group/navlink relative flex min-h-control-lg items-center gap-3 rounded-control py-2 pl-3 pr-3 text-label motion-safe:transition-colors motion-safe:duration-[var(--duration-feedback)] motion-reduce:transition-none",
                "border-l-2 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink",
                // Active state must NOT rely on color alone (UX-DR4/36): left border + bold weight.
                active
                  ? "border-ink bg-selected font-semibold text-text-primary"
                  : "border-transparent font-normal text-text-secondary hover:bg-hover",
              ].join(" ")}
            >
              <NavIcon paths={item.iconPaths} className="size-6 shrink-0" />
              <span className={variant === "sidebar" ? "hidden lg:inline" : "inline"}>
                {item.label}
              </span>
              {variant === "sidebar" && (
                // Icon-rail tooltip (AC3): visible on hover AND focus, CSS-driven (not the
                // native `title`, which is unreliable for keyboard focus). `focus-within`
                // fires for every focus path (keyboard, switch, programmatic), so AC3's
                // "receives focus" holds regardless of the browser's focus-visible heuristic.
                // Redundant once the text label shows at lg, so it is hidden there.
                <span
                  // Decorative: the link's accessible name comes from `aria-label`, so
                  // hide this purely-visual tooltip from the a11y tree (avoids an
                  // orphaned `role="tooltip"` node).
                  aria-hidden="true"
                  className="pointer-events-none absolute left-full top-1/2 z-50 ml-3 -translate-y-1/2 whitespace-nowrap rounded-control bg-ink px-3 py-1 text-micro font-medium text-white opacity-0 shadow-popover motion-safe:transition-opacity motion-safe:duration-[var(--duration-feedback)] motion-reduce:transition-none group-hover/navlink:opacity-100 group-focus/navlink:opacity-100 group-focus-within/navlink:opacity-100 lg:hidden"
                >
                  {item.label}
                </span>
              )}
            </Link>
          </li>
        );
      })}
        </ul>
      </section>)}
    </div>
  );
}

export function AppShell({
  children,
  context,
  navigation,
}: {
  children: React.ReactNode;
  /**
   * Server-resolved tenant/user context (Task 4). REQUIRED — the shell is mounted ONLY
   * after a successful `resolveTenantContext` in the `(app)` server layout. Making this
   * required fails LOUD at the type level: a caller cannot mount authenticated-looking
   * chrome with no tenant label and no sign-out (a silent half-broken shell) by omitting
   * it (review fix: AppShell context was optional and failed open).
   */
  context: AppShellContext;
  /** Server-derived, role-filtered presentation DTO. */
  navigation: readonly NavItem[];
}) {
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [skipFocused, setSkipFocused] = useState(false);
  const hamburgerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  const activeItem = navigation.find((item) => isActive(pathname, item.href));
  const pageTitle = activeItem?.label ?? "Kopplas";

  // Explicit close (Escape / overlay / close button): return focus to the toggle (UX-DR35).
  const closeDrawer = useCallback(() => {
    setDrawerOpen(false);
    hamburgerRef.current?.focus();
  }, []);

  // Link activation closes the drawer; navigation moves focus to the new page.
  const handleDrawerNavigate = useCallback(() => setDrawerOpen(false), []);

  useEffect(() => {
    if (!drawerOpen) return;
    // Move focus into the drawer on open (predictable focus, UX-DR35) and lock
    // background scroll while the modal drawer is open.
    closeButtonRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [drawerOpen]);

  // Close the drawer if the viewport grows to md+, where the toggling hamburger is
  // hidden (`md:hidden`). Bare state reset — not `closeDrawer` — so we don't try to
  // focus the now-hidden hamburger; the scroll-lock effect cleanup releases overflow.
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)");
    const handleChange = (event: MediaQueryListEvent) => {
      if (event.matches) setDrawerOpen(false);
    };
    mq.addEventListener("change", handleChange);
    return () => mq.removeEventListener("change", handleChange);
  }, []);

  // Escape closes; Tab is trapped within the drawer panel.
  const onDrawerKeyDown = useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (event.key === "Escape") {
        event.preventDefault();
        closeDrawer();
        return;
      }
      if (event.key !== "Tab") return;
      const panel = drawerRef.current;
      if (!panel) return;
      const focusables = panel.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])',
      );
      if (focusables.length === 0) return;
      const first = focusables[0];
      const last = focusables[focusables.length - 1];
      // If focus has drifted outside the panel (e.g. a click on dead space moved it to
      // <body>), pull it back in rather than letting Tab escape the modal drawer.
      if (!panel.contains(document.activeElement)) {
        event.preventDefault();
        first.focus();
        return;
      }
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    },
    [closeDrawer],
  );

  return (
    <>
      {/* Skip-to-content: first focusable element, visible on focus (UX §10). Always in
          the a11y tree; parked off-screen (`-top-24`) and pulled into view (`top-4`) by
          toggling a Tailwind class on the React focus/blur events. (Event-driven rather
          than a `focus:` CSS variant so it is robust and verifiable.) */}
      <a
        href="#main-content"
        onFocus={() => setSkipFocused(true)}
        onBlur={() => setSkipFocused(false)}
        // `focus:top-4` is a CSS fallback so the link still reveals for keyboard users
        // during the pre-hydration window (before the onFocus/onBlur handlers attach).
        className={`fixed left-4 z-[100] min-h-11 rounded-lg bg-ink px-4 py-3 text-ds-13 font-medium text-white shadow-lg focus:top-4 ${
          skipFocused ? "top-4" : "-top-24"
        }`}
      >
        Hoppa till innehåll
      </a>

      <div className="flex min-h-screen w-full bg-page text-text-primary">
        {/* Persistent sidebar (lg) / icon rail (md). Hidden below md. */}
        <aside className="hidden shrink-0 flex-col border-r border-border-subtle bg-sunken md:flex md:w-16 lg:w-sidebar">
          <div className="flex h-topbar items-center border-b border-border-subtle px-3">
            <span className="truncate font-semibold text-text-primary">
              <span className="lg:hidden" aria-hidden="true">
                K
              </span>
              <span className="hidden lg:inline">Kopplas</span>
            </span>
          </div>
          {/* No `overflow-y-auto` below lg: the md icon-rail tooltip is positioned
              `left-full` (outside the 64px rail), and a scroll container would clip it
              (CSS coerces overflow-x to auto). Scroll is only needed at lg (labels). */}
          <nav aria-label="Huvudnavigation" className="flex-1 px-2 py-4 lg:overflow-y-auto">
            <NavLinks variant="sidebar" pathname={pathname} navigation={navigation} />
          </nav>
        </aside>

        {/* Content column: top bar + main. */}
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="flex min-h-14 shrink-0 flex-wrap items-center gap-3 border-b border-border-subtle bg-page px-4 py-2 lg:flex-nowrap lg:px-6 lg:py-0">
            <button
              ref={hamburgerRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-label="Öppna meny"
              aria-expanded={drawerOpen}
              aria-controls="mobile-drawer"
              className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink md:hidden"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
                className="size-6"
              >
                <path d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            </button>

            {/* Page-title region (chrome context, not the page heading). */}
            <div className="min-w-0 flex-1">
              <p className="break-words text-ds-15 font-medium text-text-primary">{pageTitle}</p>
            </div>

            {/* Tenant/user region (Story 2.1, Task 4 — resolves the deferred top-bar item).
                Filled from the SERVER-resolved context (presentational only; authority is
                server-side). Stable `data-testid` anchors back the gated E2E acceptance
                (login-and-tenant-context.e2e.spec.ts). The `data-slot="primary-action"`
                attribute is preserved as the owning-module action mount point. */}
            <div data-slot="primary-action" className="relative flex w-full min-w-0 flex-wrap items-center gap-2 lg:w-auto lg:flex-nowrap">
              <div className="[&_button]:min-h-11 [&_button]:min-w-11 [&_button]:rounded-lg [&_button]:text-text-secondary [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-ink [&_a]:flex [&_a]:min-h-11 [&_a]:min-w-11 [&_a]:items-center [&_a]:rounded-control [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-offset-2 [&_a]:focus-visible:outline-ink [&_[role=dialog]]:left-0 [&_[role=dialog]]:right-auto [&_[role=dialog]]:max-w-[calc(100vw-2rem)] lg:[&_[role=dialog]]:left-auto lg:[&_[role=dialog]]:right-0">
                <NotificationBell />
              </div>
              <div>
                <button type="button" aria-label="Profil" aria-expanded={profileOpen} onClick={() => setProfileOpen((current) => !current)} className="min-h-11 min-w-11 rounded-lg px-2 text-ds-13 text-text-secondary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">Profil</button>
                {profileOpen && <div className="absolute left-0 z-50 mt-2 w-56 max-w-[calc(100vw-2rem)] rounded-lg border border-border-default bg-page p-2 shadow lg:left-auto lg:right-0 [&_a]:flex [&_a]:min-h-11 [&_a]:items-center [&_a]:rounded-lg [&_a]:px-2 [&_a]:text-ds-13 [&_a]:focus-visible:outline-2 [&_a]:focus-visible:outline-ink">{navigation.some(item => item.href === "/scheduling") && <Link href="/settings/calendar" onClick={() => setProfileOpen(false)}>Min kalender</Link>}<Link href="/settings/notifications" onClick={() => setProfileOpen(false)}>Notisinställningar</Link></div>}
              </div>
              {(context.tenantName || context.userEmail) && (
                <div className="order-last flex w-full min-w-0 flex-col leading-tight lg:order-none lg:w-auto lg:items-end">
                  {/* Both server-resolved display identities reflow on phone; desktop
                      keeps the compact identity block without changing authority. */}
                  {context.tenantName && (
                    <span
                      data-testid="tenant-context"
                      className="max-w-full break-words text-ds-13 font-medium text-text-primary lg:max-w-[16rem] lg:truncate"
                    >
                      {context.tenantName}
                    </span>
                  )}
                  {context.userEmail && (
                    <span
                      data-testid="current-user"
                      className="max-w-full break-all text-ds-12 text-text-tertiary lg:max-w-[16rem] lg:truncate"
                    >
                      {context.userEmail}
                    </span>
                  )}
                </div>
              )}
              <div className="ml-auto min-w-0 max-w-full [&_button]:min-h-11 [&_button]:min-w-11 [&_button]:rounded-lg [&_button]:border-border-default [&_button]:text-text-secondary [&_button]:focus-visible:outline-2 [&_button]:focus-visible:outline-offset-2 [&_button]:focus-visible:outline-ink [&_[role=alert]]:max-w-64 [&_[role=alert]]:text-risk-text">
                <SignOutButton />
              </div>
            </div>
          </header>

          <main
            id="main-content"
            tabIndex={-1}
            className="min-w-0 flex-1 overflow-y-auto p-4 focus:outline-none lg:p-6"
          >
            {children}
          </main>
        </div>
      </div>

      {/* Drawer (small screens only). Conditionally rendered so it is absent from the
          DOM/a11y tree when closed; `md:hidden` keeps it from showing at md+. */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <button
            type="button"
            aria-label="Stäng meny"
            tabIndex={-1}
            onClick={closeDrawer}
            className="absolute inset-0 bg-scrim"
          />
          <div
            id="mobile-drawer"
            ref={drawerRef}
            role="dialog"
            aria-modal="true"
            aria-label="Huvudmeny"
            onKeyDown={onDrawerKeyDown}
            className="absolute inset-y-0 left-0 flex w-72 max-w-[calc(100%-2rem)] flex-col bg-page shadow-xl"
          >
            <div className="flex min-h-14 shrink-0 items-center justify-between border-b border-border-subtle px-4">
              <span className="font-semibold text-text-primary">Kopplas</span>
              <button
                ref={closeButtonRef}
                type="button"
                onClick={closeDrawer}
                aria-label="Stäng meny"
                className="flex min-h-11 min-w-11 items-center justify-center rounded-lg p-2 text-text-secondary hover:bg-hover focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="size-6"
                >
                  <path d="M6 18 18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav aria-label="Huvudnavigation" className="min-h-0 flex-1 overflow-y-auto px-2 py-4">
              <NavLinks variant="drawer" pathname={pathname} navigation={navigation} onNavigate={handleDrawerNavigate} />
            </nav>
          </div>
        </div>
      )}
    </>
  );
}
