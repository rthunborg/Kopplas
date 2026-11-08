# Automatic production and merged-main Preview delivery

Owner decision: 2026-11-03. Restore automatic Vercel deployments, keep the latest
merged `main` available through a stable Preview URL, and deploy the currently
merged `main` to production now. This supersedes the October 16 Preview disable
decision and the corresponding restrictions in the
[October 25 deployment policy](production-merge-deployment-policy-2026-10-25.md).
Existing required review, CI, scope and merge requirements still apply.

## Delivery contract

- Production remains the normal Git integration for `main`, project
  `prj_QYRxEeUBlCStlPL0YZd72y8245rg`, team `enhancior`
  (`team_jvgtCLGEU7h6atn0TyGLNncd`), repository `rthunborg/Kopplas`.
- `.github/workflows/merged-main-preview.yml` maintains the dedicated branch
  `codex/merged-main-preview` at an immutable commit resolved from live `main`.
  It executes only from this repository's `main`, serializes its runs, and uses
  GitHub's short-lived `GITHUB_TOKEN` with `contents: write` in the synchronization
  job only. That job has no checkout or dependency execution. A separate read-only
  verification job checks out without persisted credentials and runs the focused
  tests on relevant PRs and every main push; synchronization depends on its pass.
  There is no stored Vercel credential or deployment hook.
- The workflow creates that ref if absent, otherwise advances it with
  `force: false`, then reads back the exact SHA. Divergence or permission failures
  stop visibly without deleting, resetting or force-updating a branch. An older
  queued event resolves current `main` rather than moving Preview backwards.
- The existing Vercel Git integration builds this non-production branch using
  Preview configuration. Production remains `main`; unmerged PR previews retain
  their own branches and URLs. Keep default Vercel same-branch build cancellation.
- Vercel's generated branch alias is the stable merged-main Preview address.
  Expected form:
  `https://kopplas-git-codex-merged-main-preview-enhancior.vercel.app`.
  Treat this spelling as a candidate until actual alias metadata confirms it.
  A unique deployment URL or an arbitrary most-recent PR Preview is insufficient.

## First-run qualification and recovery

After this workflow is merged, the delivery owner verifies its actual run and
the provider metadata: correct project/team, Preview environment, mirror branch,
exact selected main SHA, `READY`, and branch alias bound to that deployment.
Repeat the observation on a later normal fast-forward, including a merge that
changes workflow files. GitHub documents suppression of further Actions runs
from `GITHUB_TOKEN`; the combined Git refs API to external Vercel App delivery
must be proven by these actual observations. Local mocks prove neither delivery
nor installation-token acceptance of every future workflow-file update.

The workflow reports Git synchronization only. If no matching deployment appears,
or its build fails, retain the run/ref/provider evidence and route one bounded
repair; do not add automatic redeployment loops, guessed tokens or deploy hooks.
Manual recovery can dispatch `Merged main Preview` from `main` to reconcile a
lagging mirror. An already-equal ref is a no-op and does not recreate a missing
provider deployment. Reconcile uncertain writes before retrying. A running or
failed build means the alias may still serve the preceding successful commit.

Automatic deployment does not attest feature release readiness, backend secret
pairing, mail/integration readiness, or final Phase B release validation. Tests
and CI continue to use isolated resources, never the hosted demo/production DB.

## Read-only backend compatibility evidence

On 2026-11-03, source
`c258b523a9d32278b9e9e75ef5f7f1c59058b682` contains 120 migration versions.
Supabase `Kopplas`, ref `wmqmzznmwpheswjjozhq`, returned 120 applied versions via
`list_migrations`; a separate read-only query confirmed the ordered ledger:

```sql
select version from supabase_migrations.schema_migrations order by version;
```

Exact version-set comparison: missing `[]`, extra `[]`; latest version
`20261029132339`. This includes the E15/E16 versions. No database mutation was
performed. Ledger parity establishes recorded migration-version coverage, not
SQL checksum equality, absence of schema drift or complete runtime readiness.

## Current deployment evidence

The delivery coordinator verified these provider results on 2026-11-03 for
`c258b523a9d32278b9e9e75ef5f7f1c59058b682`:

- Production `dpl_766Czjx3k3Y6yaEG1DGf74JzTv2Q` is `READY`, with aliases
  `elpro-saas.vercel.app` and `kopplas-enhancior.vercel.app`. `/login` returned
  HTTP 200 and its `data-dpl-id` matched that deployment; Inter and `bg-page`
  were present. This is public-page smoke, not authenticated feature validation.
- Preview `dpl_BdA6F4RMK7xDw5bN7i2TdgPw6SEX` is `READY` at
  `https://kopplas-jvurs9bx8-enhancior.vercel.app` for the same commit.
- Provider configuration readback confirmed `commandForIgnoringBuildStep: null`
  and `previewDeploymentsDisabled: false`. The previous production was the
  October 16 commit `7cf68eb9`; the ignored-build command had been `exit 0`.
- The coordinator created `refs/heads/codex/merged-main-preview` at the same
  qualified commit. The first workflow run after merge must therefore perform
  an actual fast-forward from that commit, rather than merely report a no-op.

These current-main deployments and configuration changes were performed by the
coordinator, not the process implementation worker. They do not prove the new
automatic mirror workflow or its stable branch alias; that first-run
qualification remains outstanding until this change is integrated.

## Process task and validation

Scope: deployment automation and its process record only. No app, migration,
dependency, environment-secret or product-story changes. The owner admitted the
fixed-ref design before implementation. Route: `gpt-6.1-sol`, High for repository
write permissions and deployment integrity; independent review also High.

Acceptance:

- Given an authorized main run, synchronization selects live main and writes only
  the dedicated mirror ref, with no force update and exact commit readback.
- Given another repository/ref/event, invalid SHA, permission failure, divergence
  or mismatched readback, the workflow refuses or fails without a fallback write
  or false success summary.
- Given a real completed Vercel build, the delivery owner records its exact
  commit, Preview environment and stable alias separately from local test proof.

Local verification: `node --test tests/maintenance/merged-main-preview.test.mjs`.
The tests execute the actual inline program against mocked GitHub API and summary
boundaries. They cover initial creation, fast-forward, no-op, stale event SHA,
trusted-context refusal, malformed SHA, permission refusal, divergence and
readback mismatch. They do not contact GitHub, Vercel or Supabase. Provider
qualification remains a separate operational observation after merge.

Author execution: all eight local tests passed, zero failed/skipped; `git diff
--check` and parsing the workflow with the existing `js-yaml` package passed.
The initial Python parser attempt was unavailable (`PyYAML` absent). Local parsing
does not replace GitHub's actual workflow validation. No application build or
browser matrix applies to this process-only change. Initial independent design
review found no blocking design defect; final diff review is recorded separately.

## Suggested Review Order

### Trusted merge to one Preview branch

The operator entry point is the owner decision and main-only synchronization. The fixed
destination and fast-forward API preserve merged commit identity without adding
a Vercel credential or executing repository source with the write token.

- `AGENTS.md:87` — `Owner decision`: current automatic delivery authorization.
- `.github/workflows/merged-main-preview.yml:33` — `if:`: repository and main admission.
- `.github/workflows/merged-main-preview.yml:51` — `const destination`: sole mutable ref.
- `.github/workflows/merged-main-preview.yml:69` — `force: false`: divergence fails visibly.

### Evidence stops at the verified boundary

API readback proves the Git mirror; the initial actual provider delivery remains
an operational qualification. The native tests execute the exact workflow script
with mocked GitHub calls and cannot establish an external webhook or ready URL.

- `.github/workflows/merged-main-preview.yml:72` — `verified.object.sha`: exact readback before success.
- `tests/maintenance/merged-main-preview.test.mjs:87` — `divergence fails`: no fallback or false summary.
- `docs/process/automatic-deployment-delivery-2026-11-03.md:36` — `First-run qualification`: provider commit and alias evidence.
- `docs/process/automatic-deployment-delivery-2026-11-03.md:70` — `Exact version-set comparison`: read-only migration coverage and limits.

## Sources

[GitHub Git references API](https://docs.github.com/en/rest/git/refs),
[GitHub token behavior](https://docs.github.com/en/actions/concepts/security/github_token),
[Vercel GitHub integration and branch build queue](https://vercel.com/docs/git/vercel-for-github),
[Vercel generated branch URLs](https://vercel.com/docs/deployments/generated-urls).
