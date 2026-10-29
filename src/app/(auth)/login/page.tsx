"use client";

/**
 * `/login` — Supabase Auth entry (architecture §4 route table: `/login` → "Logga in").
 *
 * Password-based sign-in (test-design B2: automated tests use password/admin-created
 * users; no magic-link-only flow). On success the browser client persists the session in
 * cookies (via `@supabase/ssr`) and we redirect via the server-derived root landing (`/`),
 * where the SERVER layout re-resolves tenant context as the authority (the client never
 * decides authorization). Phase A scope: no signup, no password-reset UI.
 *
 * This is a `"use client"` module: it uses ONLY the browser Supabase client (anon key) —
 * never the service-role key (the containment guard enforces this).
 */
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { createSupabaseBrowserClient } from "@/server/db/supabase-browser-client";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [unconfirmed, setUnconfirmed] = useState(false);
  const inFlight = useRef(false);
  const errorRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (error) errorRef.current?.focus();
  }, [error]);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    // React state disables the action on the next render. The synchronous guard also
    // covers Enter/repeated form events dispatched before that render commits.
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);
    setSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        // Generic, user-safe message — never leak whether the email exists (no account
        // enumeration; UX §11). The specific Supabase error is not surfaced.
        // Transport/unknown/provider failures can be returned rather than thrown by
        // Auth. This closed set identifies definite API rejections, so correction
        // is safe. A transport/unknown error never becomes a definite rejection.
        const rejected = signInError.name === "AuthApiError" && (
          signInError.code === "invalid_credentials" ||
          signInError.code === "validation_failed" ||
          signInError.code === "over_request_rate_limit"
        );
        if (rejected) {
          setError(signInError.code === "invalid_credentials"
            ? "Fel e-post eller lösenord. Försök igen."
            : signInError.code === "over_request_rate_limit"
              ? "För många inloggningsförsök. Vänta en stund och försök igen."
              : "Inloggningen avvisades. Kontrollera dina uppgifter och försök igen.");
          inFlight.current = false;
        } else {
          setError("Inloggningen kunde inte bekräftas. Kontrollera inloggningen innan du försöker igen.");
          setUnconfirmed(true);
        }
        setSubmitting(false);
        return;
      }

      // Canonical @supabase/ssr order: refresh() FIRST so the freshly-set auth cookie is
      // server-visible, THEN navigate. Reversing these races the protected layout, which
      // could re-resolve UNAUTHENTICATED and bounce the just-signed-in user back to /login
      // on a slow connection (review fix: redirect race).
      router.refresh();
      router.replace("/");
    } catch {
      // A rejected/lost response does not prove that Auth issued no session. Keep
      // this attempt guarded until ordinary server navigation reconciles cookies.
      setError("Inloggningen kunde inte bekräftas. Kontrollera inloggningen innan du försöker igen.");
      setUnconfirmed(true);
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-dvh flex-1 flex-col items-center justify-center bg-page px-gutter-field py-ds-8 text-text-primary">
      <div className="my-auto w-full max-w-sm">
        <p className="mb-ds-9 text-heading font-medium">Kopplas</p>
        <h1 className="text-title font-medium">Logga in</h1>
        <p className="mt-ds-5 text-body text-text-secondary">
          Logga in med ditt konto för att fortsätta till Kopplas.
        </p>

        <form method="post" onSubmit={handleSubmit} className="mt-ds-8 flex flex-col gap-ds-6" aria-busy={submitting} noValidate>
          <div className="flex flex-col gap-ds-4">
            <label htmlFor="email" className="text-label font-medium">
              E-post
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              autoCapitalize="none"
              spellCheck={false}
              aria-describedby={error ? "login-error" : undefined}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="min-h-control-lg w-full rounded-control border-0 bg-sunken px-ds-6 py-ds-5 text-body focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink"
            />
          </div>

          <div className="flex flex-col gap-ds-4">
            <label htmlFor="password" className="text-label font-medium">
              Lösenord
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              aria-describedby={error ? "login-error" : undefined}
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="min-h-control-lg w-full rounded-control border-0 bg-sunken px-ds-6 py-ds-5 text-body focus-visible:outline-1 focus-visible:-outline-offset-1 focus-visible:outline-ink"
            />
          </div>

          {error && (
            <p id="login-error" ref={errorRef} tabIndex={-1} role="alert" className="rounded-card bg-risk-surface px-ds-6 py-ds-5 text-body text-risk-text focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              {error}
            </p>
          )}

          {unconfirmed && (
            // Full document navigation intentionally rechecks the current cookie at
            // the server instead of reusing a previously prefetched client route.
            // eslint-disable-next-line @next/next/no-html-link-for-pages
            <a href="/" className="flex min-h-control-lg items-center text-body font-medium underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink">
              Kontrollera inloggningen
            </a>
          )}

          <button
            type="submit"
            disabled={submitting || unconfirmed}
            className="mt-ds-5 min-h-control-lg rounded-control bg-ink px-ds-6 py-ds-5 text-body font-medium text-inverse-text hover:bg-n-800 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink disabled:cursor-wait disabled:bg-active disabled:text-text-disabled"
          >
            {submitting ? "Loggar in…" : "Logga in"}
          </button>
        </form>
      </div>
    </main>
  );
}
