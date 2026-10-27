# CI And Quality Gates

This document describes the Continuous Integration (CI) pipeline that enforces the
Phase A and Phase B quality gates. CI is the automated enforcement surface for
[Gate 2 — Static Quality](quality-gates.md) and the staged gate order defined in
architecture §19.

The workflow lives at [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml).

## Scope And Principles

- **Workflow is authoritative.** Active gates include static checks, unit/golden
  tests, migration reset, integration/RLS, isolated recovery Storage and browser
  auth smoke. Broad browser/dashboard diagnostics are opt-in release validation.
  The historical activation map below records their origins; use
  the checked-in workflow for current commands, ordering and budgets.
- **No hosted secrets or shared test services.** Jobs use isolated local test
  stacks and synthetic test credentials; there is no deploy step. Hosted secrets,
  remote test databases and new privileged execution modes retain their owner
  approval gates.
- **One source of truth for versions.** Node is derived from `.nvmrc`
  (`node-version-file: .nvmrc`) and pnpm from the `packageManager` field in
  `package.json` (via `pnpm/action-setup`), so CI versions never drift from the
  repository's pinned toolchain (established in Story 1.1).

## Active Gates

These run on every pull request targeting `main` (and on `push` to `main` as a
post-merge safety net). The `verify` job runs stages 1-5 as ordered steps (one
install, then the gates in sequence). Story 2.2 added a SEPARATE `db` job for the
stack-dependent gates (migration reset + RLS negatives, stages 6 + 8), which need
their own local Supabase service and so cannot share the `verify` install.

| # | Gate | Command | Purpose |
| --- | --- | --- | --- |
| 1 | Install | `pnpm install --frozen-lockfile` | Reproducible install; fails if `pnpm-lock.yaml` is stale. |
| — | Lockfile guard | `pnpm run verify:lockfiles` | Enforces pnpm as the only package manager (AR2); rejects an empty/invalid lockfile. |
| — | Dependency audit | `pnpm audit --audit-level=high` | **BLOCKING** dependency-vulnerability scan (owner decision 2026-07-03, closing the NFR CONCERN carried Epics 2-5): fails on HIGH/CRITICAL advisories; moderate/low are logged, not blocking. Findings track the npm advisory DB, not the diff — a red audit on an untouched branch means a NEW upstream advisory; fix by bumping the dependency (or a documented, dated exception), never by weakening the threshold. |
| — | Service-role containment | `pnpm run verify:service-role-containment` | Fails if the service-role key is `NEXT_PUBLIC_` or reachable from a `"use client"` path (architecture §6). |
| 2 | Typecheck | `pnpm typecheck` | `tsc --noEmit` — no type errors (now includes the re-enrolled `tests/integration/**`). |
| 3 | Lint | `pnpm lint` | `eslint` — lint clean. |
| 4 | Unit tests | `pnpm run test:unit` | Pure-logic suites on the dependency-free `node --test` runner. |
| 5 | Build | `pnpm build` | `next build` succeeds (fetches a Google font over the network — expected to pass on networked CI). |
| 10 | Built-bundle containment | `pnpm run verify:bundle-containment` | The AUTHORITATIVE R-002 grep — scans the produced `.next` payload (architecture §9/§20). Authoritative catches: any service-role key name, the `LOCAL_SUPABASE_SERVICE_ROLE_KEY` symbol, a `NEXT_PUBLIC_*SERVICE_ROLE*` name, and the literal local-demo service-role JWT value; plus a **best-effort** `service_role`-shape JWT heuristic (a differently-ordered JWT payload can evade this last one — the token-name and literal-value catches are load-bearing). Runs **after** build (needs `.next`; fails loud if absent). |

The `db` job (separate, with the local Supabase stack):

| # | Gate | Command | Purpose |
| --- | --- | --- | --- |
| 6 | Migration reset | `supabase db reset` | Empty DB → apply migrations → seed; fails on a bad migration (architecture §19 stage 6). |
| 8 | Integration + RLS negatives + H4 inventory gate | `pnpm run test:int` | DB-backed integration + cross-tenant/anonymous RLS-negative suites (Vitest) against the LOCAL stack only, **including the H4 RLS table-inventory gate** that fails CI when a tenant-owned table is not enrolled in the parameterized suite (architecture §18). `SUPABASE_TEST_REQUIRED=1` makes a missing stack a hard failure. |

### Development progression and release validation (owner decision 2026-10-19)

Ordinary PRs, main pushes and checkpoints require `checkpoint-admission`,
`verify`, `db`, `recovery-storage-loader` and `e2e`. The `e2e` job runs the small
`test:smoke` selection: production app login, tenant context, no-membership denial,
logout, and real local Auth invitation/recovery mail callback completion. Native
JSON remains available in `native-general-browser`; inspect the command and test
names to distinguish smoke from exhaustive coverage.

Security, RLS, authorization, money and transaction integrity are not deferred:
unit/golden tests, the complete integration suite, H4 inventory and source/built
bundle containment remain required. The synthetic recovery Storage proof also
remains required because it checks protected-row and byte integrity directly.
Relevant new consequential defects still require focused regression evidence.

Exhaustive UI journeys, dashboard proxy/fixture diagnostics and visual comparison
are deferred from ordinary progression. A deliberate checkpoint dispatch with
`release_validation=true` runs the full browser suite instead of smoke and adds
`dashboard-e2e`. Its skipped state on ordinary runs is intentional. This option
validates only; it does not authorize preview deployment, merge, production
activation, or the E15 privileged application diagnostic lane.

Jobs retain generous infrastructure timeouts (30 minutes for `verify`, 45 for
stack/browser jobs), without the previous 180/420-second test stopwatches. CI
browser invocations override the duration-budget reporter with console and native
JSON reporters. A timeout is a failed execution to investigate, not expired owner
authorization or a requirement to repeat independent review.

### Reproduce from a clean checkout

Use the pinned Node/pnpm versions, Python, and a fresh checkout of the exact
candidate commit. These commands need no untracked executable, private helper,
repository admission variable or hosted credential:

```powershell
pnpm install --frozen-lockfile
pnpm run verify:development
pnpm audit --audit-level=high
```

`verify:development` fails at the first unsuccessful check: lockfile and source
containment, typecheck, lint, unit/golden tests, focused BMAD contracts, production
build, then built-bundle containment. It resolves its checkout from its own file,
so it never verifies a different working directory by accident. Frozen install
and the network-backed audit are explicit steps. Preserve the fresh checkout and
its exact revision with the result; a working-tree run alone is not clean-checkout
evidence.

This command does not claim integration or browser coverage. Hosted CI runs those
against disposable local services. For local stack verification follow
[local-setup.md](../process/local-setup.md) and resource ownership rules, then run
`SUPABASE_TEST_REQUIRED=1` integration tests, recovery integrity proof and
`pnpm run test:smoke`; inspect executed/failed/skipped counts. Missing services
and skipped tests never satisfy the consequential gates.

### Test runners (TEA framework decision, Story 2.2)

The project runs TWO deliberately-separated runners (architecture §18):

- **`node --test`** (dependency-free, Story 2.1) runs the pure-logic unit suites
  under `tests/unit/**` via `pnpm run test:unit` — fast, zero runtime deps.
- **Vitest** (Story 2.2) runs the DB-backed integration + RLS-negative suites
  under `tests/integration/**` via `pnpm run test:int` — they need a real runner,
  async lifecycle, and a live local Supabase stack.

`pnpm test` runs both in order. The `verify` CI job runs only `test:unit` (no DB);
the `db` CI job runs `test:int` after `supabase db reset`. The two runners exist
because subsuming the established `node --test` units into Vitest would mean
rewriting every `node:test`/`node:assert` import for no behavioral gain.

## Deferred Gates

These are required **once the surface they guard is introduced**. They are not run
today because there is nothing for them to check yet. Each maps to the story that
activates it (architecture §19 stages 6–10).

| Gate | Architecture §19 stage | Status |
| --- | --- | --- |
| Supabase migration reset (empty DB → reset → seed) | 6 | **ACTIVE** (Story 2.2 — `db` job, `supabase db reset`). |
| Integration command tests | 7 | Partly active: the DB-backed integration suite runs in the `db` job (Story 2.2). Command-envelope integration tests land with Story 2.3. |
| RLS negative tests (cross-tenant + anonymous) | 8 | **ACTIVE** for `tenants`/`tenant_memberships`/`audit_events`, hardened into the inventory-gated parameterized suite + the H4 table-inventory gate (Story 2.4 RLS coverage gate). |
| Storage negative tests (path spoofing, expired URLs, MIME/size) | 8 | Deferred — Epic 8, Story 8.1 (file-storage foundation). It inherits the SAME inventory-gate mechanism: a storage table enrolls in `tenant-table-inventory.ts` when it lands. |
| Golden-master comparison | 9 | Deferred — Epic 4, Story 4.4; Story 5.5; Story 9.3. |
| Built-bundle service-role containment | 10 | **ACTIVE** (Story 2.4 — `verify:bundle-containment`, after build). The authoritative R-002 payload grep. A broader generic secret scan stays deferred to external-beta hardening (post Phase A). |

**RLS coverage gate (active).** Story 2.2 established the reusable cross-tenant
negative pattern; Story 2.4 generalized it onto one shared tenant-table inventory
(`tests/integration/rls/tenant-table-inventory.ts`) and added the **H4 table-
inventory gate** (`tests/integration/rls/rls-inventory-gate.int.test.ts`) — the
STANDING gate (architecture §18) that fails CI when a tenant-owned table is not
enrolled. A product PR adding/touching a tenant-owned table MUST enroll it before
merge (see [quality-gates.md Gate 4](quality-gates.md)). This is the regression
mechanism every later tenant-owned table (Epics 3-9) plugs into.

## Test Environment Ground Rules

These rules (architecture §18, Test Infrastructure Decisions) apply once test jobs
land in CI:

- **Local Supabase only.** Automated tests run against a local Supabase stack (CLI
  stack with migration reset) — **never** against shared dev, staging, or prod
  projects. No test configuration may point at a remote Supabase project.
- **`seed.sql` is a minimal deterministic baseline only.** It does not hold broad
  business fixtures. Business test data is created by test-only factories
  introduced in Story 2.2 (tenants, auth users, `tenant_admin` memberships, CRM
  records, calculations, quotes, and later files).
- **Parallel safety.** Each test worker provisions its own tenant pair; shared
  mutable tenant fixtures are not used for parallel tests.
- **Test keys stay test-only.** Any admin/service key used for test setup is
  test-only and is never imported into app or client code.

## Docs/Config-Only PRs

Docs/config-only PRs (no product code, schema, or dependency changes) may run
lighter checks than full product PRs. When a product gate is skipped, the PR
**must explicitly state which product gates were skipped** in the
"Tests / Checks Run" section of the PR description (architecture §19;
[quality-gates.md Gate 2](quality-gates.md)). Silent skipping is not allowed.

## Reusable checkpoint CI (opt-in)

The checked-in `scripts/ci/checkpoint-dispatch.mjs` helper dispatches the normal
required CI jobs against an exact pushed branch revision. It needs Node from
`.nvmrc` and an authenticated GitHub CLI with repository write and Actions access.
No additional dependency, repository admission variable, private broker, hosted
secret or checkpoint-specific helper is required. The ordinary hosted runners
already provide the isolation used by the existing gates; `contents: read` is
the workflow's only declared token permission. Checkout credentials are not
persisted into the workload tree.

Adoption requires the reviewed `workflow_dispatch` definition on the default
branch, and this lane on the target branch. Arrange that through the existing
merge/deployment approval process: merging the lane is not implicit permission
to deploy. Check production auto-deployment separately before any merge. Then
opt in a new checkpoint explicitly; do not replace an active loop's controls.
This standard required-gate lane does not replace E15's optional privileged
application diagnostic lane or satisfy its outstanding acceptance automatically.

From the repository root, use the actual repository name, pushed branch and full
lowercase commit SHA (placeholders below are not literal arguments):

```powershell
node scripts/ci/checkpoint-dispatch.mjs dispatch --repo OWNER/REPOSITORY --ref codex/BRANCH --sha FULL_SHA --state tmp/private/checkpoints/CHECKPOINT.json
node scripts/ci/checkpoint-dispatch.mjs status --state tmp/private/checkpoints/CHECKPOINT.json
node scripts/ci/checkpoint-dispatch.mjs cancel --state tmp/private/checkpoints/CHECKPOINT.json
```

For optional exhaustive validation add `--release-validation true` to the
`dispatch` command; omission selects ordinary development progression. The
choice is persisted in the receipt and sent as the standard boolean workflow
input. Do not change a receipt to upgrade an in-flight run.

The ignored state record is a generated ownership receipt, not a private
executable or prerequisite configuration. It belongs to one operation and must survive interruptions.
It contains repository/ref/SHA, authenticated actor, workflow ID, a random
checkpoint UUID, timestamps and the discovered native run ID; never add tokens
or secret values. The helper exclusively creates and flushes this intent record
before its only dispatch POST. GitHub does **not** provide idempotency from the
UUID. Never start a new state record to blindly repeat an uncertain dispatch.
Status reconciles the exact title and SHA with native run metadata; duplicate
matches, actor changes, rerun attempts, changed run IDs and truncated history
fail closed. The helper refuses to overwrite an existing record. A crash may
leave a local `.lock` file: establish that the original helper has ended before
manually removing only that operation's lock; preserve its state record.

Each operation is bounded: each API call has a 15-second timeout, discovery scans
at most five pages of 100 runs, and each status command takes one snapshot rather
than starting an unattended polling loop. Queued/running requests exceeding the
record's one-hour observation threshold report `deadline_exceeded` as
informational status, without failing the CLI or expiring authorization. Continue
observing the same owned run, or investigate/cancel that run if needed. A missing run stays uncertain and must be
reconciled manually, even after that deadline. Cancellation verifies repository,
workflow ID/path, dispatch event, branch, SHA, checkpoint, actor, triggering actor
and attempt before the POST. A cancellation request (including an uncertain
response) is never resent automatically. Observe final native completion with
`status`; cancellation acceptance alone does not prove completion. Keep the
record and native run link for evidence; no repository variables require cleanup.

Workflow admission checks dispatch inputs against `github.sha` before any
required gate. A branch movement between preflight and dispatch fails admission;
all checkouts use the event's immutable SHA. Different checkpoint UUIDs have
separate concurrency groups; PR cancellation cannot cancel a checkpoint.
Dispatch reruns fail admission: create a deliberately reviewed new checkpoint
only after establishing the previous outcome. Run completion with `success` is
required evidence; the helper exits 1 for completed failures, and skipped,
cancelled or failing gates are not an acceptance waiver. Inspect native job and
artifact evidence for the exact recorded head and selected validation mode.
Required admission/static/integrity/auth-smoke jobs must execute successfully;
optional `dashboard-e2e` is expected to skip in development mode. Release mode
also requires exhaustive browser and dashboard success. Migration and cleanup
checks remain in force.

The helper transports GitHub API calls through argument arrays and JSON stdin,
never a shell. Errors omit API response bodies and authentication environment.
These controls scope routine orchestration; they do not make arbitrary branch
code trusted or permit privileged secrets to be passed to it.

## References

- [`.github/workflows/ci.yml`](../../.github/workflows/ci.yml) — the workflow.
- [quality-gates.md](quality-gates.md) — Gate 2 (Static Quality) and the phase gate matrix.
- [definition-of-done.md](definition-of-done.md) — Phase A done criteria CI enforces.
- [branching-and-pr-policy.md](../process/branching-and-pr-policy.md) — PR requirements and merge gates.
- architecture.md §18 (Test Strategy + Test Infrastructure Decisions), §19 (CI And Quality Gates).

## CI performance and focused feedback

Use [Fast CI feedback and cold-start diagnosis](ci-performance.md) for focused
check selection, safe cache/fixture reuse, the early production entry-screen
lane, timing evidence and the PR #109 integration boundary. Early feedback does
not replace native required checks or affected-surface visual acceptance.
