# CI cold-start implementation review guide

## Suggested Review Order

Author: CI implementation delegate (Sol High).
Refreshed against the final CI performance working tree based on `d02fd8ac`.

### Keep existing coverage independent of early feedback

The additive entry-page job starts alongside ordinary verification. All product,
shared, sensitive, transitive, configuration and unknown changes remain broad;
there is currently no approved narrow acceptance mapping. Documentation-only
selection suppresses only the additional entry-page job.

- `.github/workflows/ci.yml:1582` — `feedback-scope`: classifies only additive feedback.
- `.github/workflows/ci.yml:1607` — `entry-ui-feedback`: real production browser feedback with two isolated viewports.
- `scripts/ci/classify-feedback.mjs:7` — `classifyFeedback`: defaults missing or unknown changes to broad coverage.
- `tests/unit/scripts/ci/ci-performance.test.ts:15` — required jobs preserve their original dependencies and gates.

### Replace browser installation while retaining the host topology

An immutable official image supplies browser binaries and Linux dependencies.
Only the browser service runs in a container; the existing Node production app,
Supabase Docker stack, privileged wrapper and fixed-browser diagnostics retain
their original commands and source custody. The documented remote endpoint binds
to loopback and is exported only after actual Chromium readiness.

- `scripts/ci/browser-runtime.mjs:14` — `assertHostedRunner`: restricts this launcher to disposable hosted Linux runners.
- `scripts/ci/browser-runtime.mjs:37` — `validateBrowserReceipt`: checks exact cleanup identity, owner and image.
- `scripts/ci/browser-runtime.mjs:106` — `PW_TEST_CONNECT_WS_ENDPOINT`: preserves existing Playwright configuration authority.
- `tests/unit/scripts/ci/browser-runtime.test.ts:25` — cleanup rejects changed identity and ownership.

### Preserve honest timing and evidence boundaries

Only `.next/cache` intermediates are cached, partitioned by purpose, toolchain,
configuration and build environment, with source-specific writes. Image pull and
readiness receipts live outside Playwright's cleaned output directory. Production
build timing is separate for ordinary verify and the additive entry job; ordinary
authenticated browser build/server/fixture setup remains aggregated.

- `.github/workflows/ci.yml:143` — `Cache Next build intermediates`: restores no complete build or authentication state.
- `tests/feedback/entry-ui.feedback.spec.ts:11` — `__reactFiber$`: proves client attachment before keyboard checks.
- `tests/feedback/entry-ui.feedback.spec.ts:34` — `attach`: captures screenshots without claiming baseline comparison.
- `tests/unit/scripts/ci/ci-performance.test.ts:53` — exact performance inverse preserves unrelated workflow drift.

Evidence: 33 focused tests passed without skips; full typecheck and focused lint
passed. The production build passed in 31.091 seconds and source/bundle
containment checks passed. Playwright discovery listed exactly two entry tests
and wrote `test-results/entry-ui.json` at the uploaded path. The existing
415-test runtime/diagnostic batch passed 413 tests; two unchanged migration
comparisons fail on this Windows CRLF checkout. The full unit run executed 3,510
tests: 3,506 passed, three failed and one Linux-xattr case skipped. One induced
admission-parser failure was corrected by moving additive job definitions after
the existing jobs; all 41 focused admission/performance cases then passed. The
remaining two failures are the unchanged CRLF migration comparisons. Full lint
passed with zero errors and 31 existing warnings. Hosted browser measurements
are recorded separately when available.

Limits: no local browser service or database was launched. Hosted acquisition,
remote browser execution, screenshots and elapsed-time targets still require
exact-head CI evidence. Entry feedback submits no authentication request and
does not validate authenticated changed components, login/logout/session/RBAC,
RLS or release readiness. Existing required suites retain those responsibilities.
