# Cloud PR feedback remediation

Status: local implementation; **not activated and no hosted pilot performed**.
Owner request: 2026-10-13. This is development automation, outside product AI
features deferred to Phase C. It does not authorize merging or deploying.

## Decision and verified repository baseline

Use ordinary GitHub Actions, OpenAI's official Codex action, and a narrowly
installed GitHub App for publication. GitHub-hosted ephemeral Ubuntu runners
require no laptop, server, webhook service, database, or local Codex login.
The action invokes non-interactive Codex with an API key; do not assume a
ChatGPT subscription pays for these requests.

Read-only inspection on 2026-10-13 verified:

- `rthunborg/Kopplas` is public, default branch `main`; local baseline
  `bbf7cef7515da7d3cd1d39a70cb73eab1856d3ad`, clean working tree.
- Actions enabled, all actions allowed, default token permissions read-only,
  PR approval permission disabled; no repository rulesets and no classic
  protection on `main`. No registered self-hosted runners and no open PRs.
- Only listed collaborator: `rthunborg`, account ID `53317458`, administrator.
  Historical comments include Codex connector and Vercel bots. Those bots
  are excluded. GitHub cannot prove that a human account's API comment was
  physically typed by a person: do not let other agents impersonate an
  allow-listed human account.
- Existing environments `Preview` and `Production` have no protection rules.
  Neither is suitable for the fixer's credentials. App installation inventory
  could not be established with the available user authentication.
- Historical CI run `38243788573` reports PR-head SHA
  `823869a6742fe414c52c5e3482cafed8bb89bb78`, matching PR #95's head. Its
  `pull_requests` array is empty after closure. The monitor deliberately
  requires a matching association for an open PR, so that live association
  still needs the pilot; an absent association stays pending.

Repository files establish Next.js/TypeScript, Node 22 (`.nvmrc`),
pnpm 10.24.0 with `pnpm-lock.yaml`, Node unit tests, Vitest integration/RLS
tests, and Playwright production-server browser tests. Existing `ci.yml`
contains verification, database, recovery-storage, and browser jobs using
disposable local Supabase. The legacy CI document has historical claims;
the actual workflow is authoritative for executed jobs.

The native Codex GitHub integration is already present in historical feedback,
but does not provide this repository's deterministic authorization, patch
validation, and publication protocol. GitHub Agentic Workflows currently support
Codex but are public preview and add a compiled workflow framework. They are
not needed for this bounded workflow.

## Trust and execution model

The controller runs from `main`, not PR-provided workflow code. Top-level
PR issue comments provide an immediate wake-up; regular polling gathers
submitted reviews and inline threads and recovers work arriving during a run.
Polling is deliberate: GitHub `pull_request_review` and
`pull_request_review_comment` execute with PR context, while `issue_comment`
and scheduled workflows use the default branch. An issue without a PR is
rejected. Pending review comments are not an independently actionable batch.

The pipeline separates collection/state, coding, validation, and publication.
Only trusted controller/publisher jobs can receive App credentials. The
coding job receives the model credential through the action's supported API
proxy and runs Codex as an unprivileged user; checkout does not persist Git
credentials. The validator starts in a fresh job with no model/App credential.
The publisher never installs dependencies or executes PR tests/scripts.

Artifacts, model JSON, comments and patches remain untrusted. Exact repository,
PR number, source SHA, run identity, proposal digest, file policy and independent
validation must agree. An unexpected head update blocks publication. A push
is fast-forward only; no default-branch push, force push, approval or merge.
Publisher code and instructions come from the trusted controller revision.
GitHub's `createCommitOnBranch` mutation receives the exact `expectedHeadOid`;
it appends the commit only if the branch still has that head. This avoids a
check-then-update race and does not force-push. The current GraphQL schema was
verified through read-only introspection; no mutation was executed locally.

The autonomous file policy is intentionally narrow. Workflow and automation
code, instructions, dependencies/lockfiles, configuration, migrations,
authentication/authorization, money/tax, tenancy, production operations and
other sensitive changes require a human. PRs already changing governing
execution files are rejected before inference. Passing tests is not proof
that a proposed change is safe or preserves business semantics.

Dry runs create run summaries/artifacts only: no PR comment, thread reply,
review request, or branch push. Model-backed dry runs still incur API charges.
Live runs use GitHub-native state with ownership/provenance checks and bounded
attempts. Removing opt-in, closing the PR, moving its head or turning off the
repository switch blocks publication after coding as well as before it.

Initial autonomous scope is eight explicitly listed presentation components,
the narrowly allowed datetime/result utilities, their unit tests, `README.md`
and help documentation. This is not an autonomous fixer for every Kopplas PR.
The entire existing PR diff must satisfy policy as well as the agent's proposed
files; a PR mixing UI with migrations, authorization or dependency changes is
blocked rather than partially trusted. Expand this scope only through a
reviewed policy change after pilot evidence.

Signed dry-run journals are retained for 30 days and feedback must be no more
than seven days old. Without existing App-owned durable state, a PR older than
the journal window is audit-only: the controller cannot prove its lifetime
attempt count. Do not delete journals or state comments to restart budgets;
loss of history can invalidate those guarantees. Key rotation invalidates old
signatures and requires an explicit history/recovery review.

## Approval and activation checklist

The owner approved publishing the setup branch/opening its PR and enabling
publication on 2026-10-13. `PR_FIX_PUBLISH=true` permits publication, while
`PR_FIX_ENABLED=false` keeps paid execution off until credentials and the
separately approved hosted pilot are ready. No pilot success is claimed.
Merge, account credential creation and paid pilot execution still require the
owner's involvement. Existing active branches must not be disrupted.

1. Approve pushing these setup files on a separate setup branch and opening
   its PR. Review and merge into `main` through the normal human process.
   Comment and schedule triggers only become available after default-branch
   bootstrap. Do not enable the new workflow from an untrusted feature branch.
2. Protect `main` with required human review, relevant CI checks and no bypass
   for the fixer App. Protect workflow/policy/instruction changes with owner
   review. Existing settings do not enforce this today.
3. Create `pr-feedback-secrets`, restrict deployment branches to **only `main`**
   (not all protected branches), and store credentials exclusively there.
   Environment restrictions are essential: a same-repository feature branch
   can otherwise introduce its own workflow to request repository secrets.
   Required environment reviewers would introduce a manual approval on every
   invocation; choose that for the pilot if desired, then review unattended
   access explicitly before removing it.
4. Create a dedicated GitHub App and install it on **Kopplas only**. No webhook
   server is necessary. Grant repository Contents write, Issues write,
   Pull requests write, Actions read, Variables read and Metadata read. Do not grant workflows
   write, administration, deployment, environment or secret access. No PAT.
   Enter its private key using GitHub's environment secret form or `gh secret
   set --env pr-feedback-secrets` from a file; never paste it into chat.
5. Create a dedicated OpenAI API project/service credential with model access
   verified for the configured model and billing enabled. Enter it through
   GitHub's environment secret form. Keep production Supabase, deployment,
   backup and Google Drive credentials out of this environment and all fixer
   jobs. Set API project budgets/rate limits and account alerts.
6. Configure the variables and label described below, retaining the master
   switch disabled until ready. Verify the App's numeric identity used for state ownership.
7. Approve a designated same-repository test PR with a small non-sensitive bug,
   synthetic data and opt-in. Approve posting human test feedback and one paid
   manual dry run. Inspect authorization, grouped feedback, model outcome,
   patch and independent validation artifacts.
8. Approve one live pilot. Verify its App push starts fresh CI, that every
   required job passes against the new PR revision, then verify thread replies
   and re-review. Exercise opt-out, concurrent push, malicious path and failure
   scenarios without production access. Enable automatic publication only
   after those results are recorded.

Required names (credentials belong in the `pr-feedback-secrets` environment;
switches are repository Actions variables):

| Name | Kind | Initial value/purpose |
| --- | --- | --- |
| `PR_FIX_OPENAI_API_KEY` | Environment secret | Dedicated OpenAI API project key; model requests only |
| `PR_FIX_APP_PRIVATE_KEY` | Environment secret | Dedicated App RSA private key; controller/publisher and journal signatures only |
| `PR_FIX_APP_ID` | Repository variable | Numeric App ID |
| `PR_FIX_APP_USER_ID` | Repository variable | Numeric GitHub account ID of the installed App's `[bot]` user |
| `PR_FIX_ENABLED` | Repository variable | `false`; repository kill switch, `true` permits paid eligible work |
| `PR_FIX_PUBLISH` | Repository variable | `true`, owner-approved; permits bounded writes only while the master switch is also enabled |

Keep the OpenAI key out of repository-wide secrets and job-wide environment
variables. Obtain the App user ID from the GitHub user API using its bot login;
verify it against an App-owned pilot comment. Do not use the installation ID in
either App identity field. Policy defaults admit numeric human account
`53317458` only; adding another human requires a reviewed trusted policy change
and that account must also have current write/maintain/admin access.

## Manual and automatic operation

The default opt-in label is `agent-fix`. Its trusted configuration is
`OPT_IN_LABEL` in `scripts/pr-feedback/policy.mjs`; changing it requires a
reviewed setup change. Add/remove that label for per-PR opt-in/opt-out. Forks,
drafts, closed PRs and PRs targeting anything except `main` are excluded.

After owner-approved setup, an allow-listed human can request a dry run for
one exact PR through the Actions **Run workflow** form (`pr_number`,
`dry_run=true`) or the equivalent command:

```sh
gh workflow run pr-feedback.yml --ref main -f pr_number=123 -f dry_run=true
```

Replace `123` with the approved pilot PR. `PR_FIX_ENABLED=true` and the
protected credentials are required for inference. With publishing disabled,
automatic eligible runs also remain dry runs. Publication permission
`PR_FIX_PUBLISH=true` is already owner-approved; a manual live run
additionally supplies `dry_run=false`.

For an immediate comment request, an authorized human can start a top-level
PR comment with `/agent-fix` and describe the finding. A command is optional:
all eligible human feedback on opted-in PRs is collected automatically.
Submitted reviews and inline threads are polled at minutes 17 and 47 of each
hour. Resolved/outdated threads and feedback on an older head are excluded;
restate a still-relevant finding against current head after unrelated pushes.
There is one repository-wide active run, stronger than per-PR serialization.
It chooses one eligible PR batch per run, so a busy repository can wait multiple
polls. This deliberately trades throughput for simple state ownership.

Hard defaults: two attempts per feedback fingerprint, six total attempts per
PR (dry runs also consume the budget), 40 feedback items/32,000 feedback bytes,
20 changed files/256 KiB total file contents/64 KiB per file. Jobs are bounded
to 10 minutes for collection/publication and 15 for coding/validation. Model
is `gpt-6.1-sol`, effort Low, pinned Codex CLI 0.162.1. Sensitive work is
blocked for human handling; security implementation and independent review
for this setup were routed to Sol High according to the repository policy.

Independent pre-publication checks run with Node 22 and pnpm 10.24.0:
frozen install, lockfile guard, high-severity dependency audit, source service-role
containment, typecheck, lint, the 180-second unit-test gate, build, and built-bundle
containment. The full existing database/recovery/browser CI is still required
after publication. Readiness requires successful `verify`, `db`,
`recovery-storage-loader`, `e2e` and `dashboard-e2e` jobs in a `ci.yml` PR run
associated with the new head; missing, skipped, neutral or cancelled jobs block
readiness. Those PR runs use GitHub's test-merge checkout; the monitor binds the
run to the new PR head rather than reusing a previous merge SHA's green checks.

## Controlled pilot specification

Proposed test PR: branch `codex/pr-feedback-pilot`, base `main`, opt-in label
`agent-fix`. Do not create it until approved. Use only synthetic data and one
listed presentation component, such as `src/components/crm/FormField.tsx`.
A suitable intentional defect is omitting `aria-invalid` when `TextField` has
an error. Human feedback should identify that exact defect and ask for a focused
fix plus a regression test in the permitted unit-test scope. Do not include
migrations, dependency changes, instructions or workflow changes in that PR.

Acceptance evidence to retain: authorized plain comment, one submitted review
with multiple inline comments grouped into one run, bot/unauthorized comment
ignored, dry-run with no PR writes, one validated live commit on the same branch,
fresh complete CI, correct pending/ready notifications and re-review only after
CI. Also exercise opt-out and concurrent head update before publication, failed
validation, and no-change/ambiguous feedback without falsely claiming success.
The pilot's exact PR number, run IDs, commit and results must be recorded after
approval. This specification is not hosted evidence.

The Vercel integration is evidenced by historical bot comments. Fixer pushes
may cause existing Vercel preview builds and incur their costs, even though the
fixer has no Vercel credential. Verify that integration's branch/deployment
settings before the pilot. Production cannot be reached through a permitted
default-branch push because this fixer does not perform one. Repository
Actions found during inspection do not deploy on ordinary feature-branch
pushes; scheduled backup/availability workflows remain separately configured.

## Operations and recovery

Use Actions run logs, step summaries and artifacts to inspect collected
feedback, source revision, proposed patch, model JSON and independently
measured checks. Outcomes distinguish proposed/unpublished, pushed/CI pending,
ready for re-review, no change, failed and needing human input. An agent's
textual claim of success never supplies a validation gate.

To stop immediately, disable the repository switch and disable the workflow
in GitHub Actions. Remove the PR's opt-in label to stop one PR. Cancel a running
job if needed; in-flight publication can race with cancellation, so inspect the
branch afterward. Revoke the App installation or API key for suspected
credential compromise. Do not delete state to get around attempt ceilings.

Recover a bad fix with a normal human-reviewed revert commit on its PR branch,
preserving history. Keep opt-in removed until reviewed. Do not reset or
force-push collaborators' work. A blocked stale result should be discarded and
regenerated against current head; never apply it by bypassing the SHA check.

Other active worktrees/branches found locally are outside this change's write
scope. After the setup PR is approved and merged to `main`, owners of ongoing
branches should merge `main` when safe. Do not merge into their checkouts while
other agents are writing, halt those sessions, or resolve their conflicts
without reviewing the exact changes and coordinating with their owners.

## Costs and limits

Costs include Codex input/output/reasoning tokens and GitHub runner minutes,
artifact storage, and any independently configured preview builds. Dry-run
does not mean free. Job timeouts, attempt counts and artifact/file-size checks
are hard workflow limits. They are not a dollar or token cap: inference may
consume substantial tokens before a timeout, and API budget notifications are
not necessarily hard spending stops. Use provider rate controls and verify the
actual project's enforced limits. Account pricing and entitlements have not
been inspected or assumed.

GitHub schedules can be delayed or dropped; polling recovers retained feedback
on a later run but is not a real-time SLA or durable event queue. Human opt-in
is necessary. A GitHub App with Contents write has broader technical capability
than this publisher uses; trusted code, main protection and environment rules
are part of the boundary. Prompt injection can still cause a bad allowed-path
change. Passing lint/tests does not establish correctness. App/API errors,
quota exhaustion, cancellation and invalid output must remain failures or
blocked outcomes. Reviewers retain authority to resolve their threads.

## Official references consulted (2026-10-13)

- [OpenAI Codex GitHub Action](https://developers.openai.com/codex/github-action):
  action API proxy, Linux runtime, supported safety strategies and structured
  output configuration.
- [OpenAI non-interactive Codex](https://developers.openai.com/codex/noninteractive).
- [OpenAI GPT-6.1 Sol API model](https://developers.openai.com/api/docs/models/gpt-6.1-sol).
- [Native Codex GitHub integration](https://developers.openai.com/codex/cloud/code-review).
- [Official action source and security guide](https://github.com/openai/codex-action).
  The `v1` annotated tag was dereferenced via GitHub's API to commit
  `bdf19a4a223ec2549a3e2274a0cf61556bc07675`; pins are verified, not invented.
- [GitHub event semantics](https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows).
- [GitHub workflow triggering and token recursion](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow):
  App tokens enable unattended downstream runs; current docs describe approval
  requirements for some `GITHUB_TOKEN`-generated PR events.
- [GitHub App tokens in Actions](https://docs.github.com/en/apps/creating-github-apps/authenticating-with-a-github-app/making-authenticated-api-requests-with-a-github-app-in-a-github-actions-workflow).
- [GitHub environments](https://docs.github.com/en/actions/reference/workflows-and-actions/deployments-and-environments).
- [GitHub commit mutation and expected-head input](https://docs.github.com/en/graphql/reference/commits#createcommitonbranch).
- [GitHub concurrency](https://docs.github.com/en/actions/concepts/workflows-and-actions/concurrency).
- [GitHub Agentic Workflows](https://docs.github.com/en/copilot/concepts/agents/about-github-agentic-workflows):
  supported Codex engine and public-preview status; not selected.

## Verification record

Hosted verification remains blocked on the owner-approved setup and paid pilot.
Local deterministic fixtures use mocked GitHub data and cannot establish real
App permissions, environment isolation, action sandboxing, billing, downstream
CI behavior or notification delivery. Record those separately after the pilot.

Local evidence during implementation: 25 focused deterministic cases passed;
full Node unit run executed 2,263 tests, 2,262 passed, zero failed, one explicit
Windows skip for the existing Linux-xattr recovery-loader test. The unit run
completed in 11.48 seconds under the repository's 180-second limit after the
final publisher change.
Typecheck and targeted ESLint passed. `actionlint` 1.7.12 validated the new
workflow; its official release archive SHA-256 was checked before execution.
ShellCheck is not installed locally, so actionlint's ShellCheck integration
was disabled. Database/browser suites were not run locally for this automation
change; none of these results substitute for the approved hosted pilot.

The independent Sol High reviewer completed an initial security pass and one
targeted follow-up on the atomic publisher. No unresolved concrete findings
remain in that reviewed implementation. The focused publisher fixtures also
exercise revoked current permission, disabled switches, a concurrent push
during publication, wrong repository/ref identity and an expected-head mutation
failure without a success notification. These are mocked API outcomes.

## Suggested review order

1. `.github/workflows/pr-feedback.yml`: trusted triggers, job permissions,
   protected environment references, UID isolation and publication dependencies.
2. `scripts/pr-feedback/policy.mjs`: human allow-list, file scope, feedback
   selection, ownership checks, limits and exact-revision CI classification.
3. `scripts/pr-feedback/runtime.mjs`: signed journal origin, fresh head and
   permission checks, independent file validation and expected-head mutation.
4. `.github/codex/pr-feedback/`: immutable Codex configuration and result schema.
5. `tests/unit/scripts/pr-feedback*.test.ts`: deterministic contract fixtures,
   temporary Git repositories and mocked publication/notification ordering.
6. This runbook: external activation requirements, bounded pilot, costs and
   evidence limitations. No remote configuration is implied by the local files.
