# Frontend quality gate

Owner-authorized tooling setup, 2026-10-26. This is a new development-acceptance
requirement for authorized frontend work and PR-feedback remediation. It changes
no product scope, schema, dependency, environment, deployment or paused run.

## Acceptance and trust

A candidate with a substantive frontend visual change is ready only when its **current full Git head** has actual
production-server UI evidence, complete affected-surface coverage and either
independent image review or authenticated owner manual acceptance. Initial
foundation/screen references and every replacement reference also require owner
acceptance. This gate supplements existing functional/security review, applicable
build/integration/RLS/recovery checks and all five exact-head CI jobs. A visual
acceptance is never a merge, release, deployment or reference-source approval.

`scripts/quality/frontend-policy.json` is read from the trusted base/controller,
not from the candidate. It pins approved written DESIGN/EXPERIENCE identities and
the immutable v1 inventory. Written rules/amendments win over prototypes. Prototype
layout is reference material; its styling and flows grant no scope. The initial
reference map and trusted vision-provider list are deliberately empty: no actual
application capture, provider configuration, reference acceptance or hosted
activation has occurred. See [setup evidence](frontend-quality-gate-setup.md).

An author's JSON, model assertion, screenshot path or `tests passed` statement
cannot grant acceptance. The controller obtains current PR files/head/labels,
comment authors, GitHub App identity, current human permissions, complete candidate
commit authors/committers and actual Git blob bytes independently through GitHub's
API. Unmapped/incomplete authorship cannot grant independent-provider acceptance.
It separately verifies canonical approved source Git blobs at the trusted
controller HEAD, avoiding Windows checkout newline conversion. A missing or
mismatched approved source blocks both manual and independent frontend acceptance;
repeating source pin strings in JSON cannot satisfy this. It validates image object IDs,
SHA-256, PNG chunks/CRC/pixel stream and viewport dimensions before any verdict.
A changed head, package digest, source hash, coverage or reference invalidates the
acceptance. Do not copy evidence from a prior remediation candidate.

The controller's `Frontend visual acceptance` CheckRun and companion commit
status attach to the actual PR
head, run default/base-branch code with read-only content/PR/issues access and
`checks:write` plus `statuses:write`, and never checks out, installs, executes or renders candidate
code. They use no model API key or dedicated App private key. Required-check protection and trusted-main
bootstrap are separate owner checkpoints. Without them, repository administrators
can bypass the check; local files cannot establish remote enforcement.

### Reporting compatibility repair — 2026-10-27

PR113 at `57398f4c1fbb61056e3b7725ff00e6ee380ba627` had successful exact-head
CI, fresh independent review and successful custom visual CheckRuns under Actions
App15368, yet required-rule evaluations `4752694576` and `4752764162` recognized
only the five native CI jobs and reported the visual context expected. The
candidate and test-merge commit had no commit statuses. This is evidence of a
reporting/enforcement compatibility failure, not a missing provider acceptance or
pending job. The custom checks attached an older suite; GitHub's internal reason
for omitting them from enforcement was not established.

The bounded repair adds commit-status reporting alongside the existing rich
CheckRun. Both use the same actual candidate SHA, exact `Frontend visual
acceptance` context and one `assessPr` result. A pending commit status is written
first, then the CheckRun starts, assessment verifies current evidence, and current
head/body/labels are rechecked. Only a confirmed successful CheckRun completion
may be followed by a successful status, for accepted or justified N/A evidence.
Failures and unknown reporter outcomes fail the native job and make bounded
best-effort failure reports; an unavailable final report can leave the known
pending status blocking. Initial invalidation may itself be unavailable, so a
failed reporter is never presented as a newly verified remote gate outcome.
No historical failure is deleted, and a status is not synthesized from old green
UI. A fresh valid assessment can refresh the rich check after an older failure.

This preserves comment, schedule and manual reevaluation: their native job can
run on main while both reports still target the candidate. Requiring only that
native job would not preserve later candidate acceptance/revocation behavior.
GitHub requires both a check and status to pass when they share a required name.
The App identity comes from the real token; the status payload has no `app_id`.
The sole token-permission addition is `statuses:write` in this workflow, with no
App, secret, environment, deployment or paid-model change. Existing immutable
source/image/PNG checks, provider/manual roles, new-head invalidation, N/A reasons
and candidate-code isolation remain in `assessPr` and `evaluateFrontend`.

Source preparation was routed to Sol High with independent High review. Mocked
API and local hosted-entry CLI tests with mocked APIs cover positive/manual/provider/N/A outcomes,
missing/stale/revoked/unavailable evidence, ordering, metadata changes and each
reporter failure. They perform no real status writes, provider calls or hosted
enforcement proof. Actual App15368 status provenance and original-rule positive
recognition plus genuine negative blocking remain separate hosted checkpoints.

The current trusted publisher cannot install this fix by itself. A proposed
bootstrap would replace only the sixth required context with native `assess`,
keeping App15368, the other five checks, strictness and every protection clause.
That requires a **new explicit owner bridge decision** and independently reviewed
exact before/restore payloads. The main-target ruleset is not PR-specific: all
other merges, including PR113, frontend work and paid pilot activity must be
frozen by the Coordinator throughout any approved bridge. No freeze, rule change,
merge or probe has occurred through this source preparation. Only a separately
qualified frozen tooling-only fix PR could cross that bridge. New trusted-main
publisher proof must precede an owned conditional restoration; effective original
gate proof cannot be claimed while the substitute is active. Stop on failure or
unknown state. Restore and verify original protection before PR113 integration
and eventual new-main credential-free bootstrap/DRY2. No bypass, App-pin removal,
fabricated success, protected source overlay or repeated merge attempt is a fix.

#### Suggested Review Order

1. `.github/workflows/frontend-quality-gate.yml`: only `statuses:write` is added;
   trusted checkout, existing checks access, events and budgets remain.
2. `scripts/quality/frontend-controller.mjs`: `reportPrAssessment` orders both
   reporters, checks current candidate metadata and rejects unknown responses;
   `hosted` propagates failure to its native job. Its paired declaration describes
   the new testable export without changing the gate result contract.
3. `tests/unit/scripts/frontend-quality-gate.test.ts`: inspect the reporter-order,
   reporter-failure, real evidence and local all-event CLI cases alongside the
   existing image/source/manual/provider and fixer-readiness boundaries. Local
   synthetic execution does not qualify the hosted rule binding or a paid pilot.

## Capture and coverage contract

Use the configured Playwright **production** web server (`next build`, then
`next start`), synthetic non-sensitive fixtures and the exact candidate revision.
Do not use `next dev`, prototype renders, generated pictures, source-only review
or the synthetic gate-test PNGs as application screenshots. Use guard-owned
resources under `docs/process/local-setup.md` when a runtime is actually needed.
This tooling setup starts none.

For every affected route/component identify relevant states and capture each at
**1440×900 desktop** (other explicit desktop sizes 1280–2560 × 720–1600 are
accepted) and **360×640 connected phone**. `finished` is always separate from
`loading`, `error` and `empty`. Each absent non-finished state requires its own
concrete applicability reason; a reviewer checks that reason against actual
behavior. Capture invalid/submitting/retry/stale/conflict/selection/permission
states where relevant as additional surfaces or captures. Success follows actual
server-confirmed persistence. Preserve existing accessibility/keyboard/focus,
protected-input, scope, authorization, money and transaction checks.

Root tokens/font/global styles require representative **auth, records, dialogs,
documents, jobs, scheduling and time/Min dag** consumers. Record all other affected
consumers in the package; this minimum is not whole-site coverage. Shared primitive
changes require their real affected consumers. Direct rendered paths cannot use
an author-submitted N/A package. The controller can compute N/A for docs/tooling
without frontend-bearing source or config changes, or for the verified source
exemptions below. Substantive frontend changes still require the ordinary human
visual acceptance. Engineering review and ordinary tests cover all changes.

The controller compares immutable regular-file blobs at the current PR head and
its provider-reported merge base for these source exemptions:

- **Minor presentation copy.** Direct plain text in an existing native button,
  label, legend or heading can qualify for capitalization, terminal punctuation
  or a bounded spelling correction. The rest of the source must match exactly.
  Dynamic strings, accessible status or alert regions, number and amount edits,
  sensitive copy paths, meaningful wording changes, added or renamed files,
  route or attribute edits, layout or style changes and mixed production work
  stay gated. Ordinary accompanying docs or tests can remain in the PR.
- **Backend persistence work.** Existing Supabase server/public client or
  environment modules and command database adapters can qualify when their
  changed source remains in those seams and preserves literal prose and HTML.
  Backend plus frontend production changes stay gated. Read models, headless
  UI state, display formatters, customer-facing outputs and unclassified
  application source remain subject to impact assessment.

An ambiguous backend-only candidate can still submit `kind=not-applicable`,
`candidateSha`, the exact `changedPaths` and a concrete `reason` for authenticated
owner `/visual-not-applicable <head> <digest>`. Missing parser or provenance,
unavailable blobs and ambiguous cases follow the existing strict visual path.
The trusted workflow uses only the locked TypeScript parser to read inert source
text. Main integration changes the controller used by all open PRs. Integrate
only after active consumers of the prior visual contract close, then use the
new policy at a clean story admission.

Store derived reference/actual PNGs outside immutable
`docs/design/claude-design/v1/handoff/`. Record source version/hash, component,
route, state, viewport, fixture, command/result and exact candidate. Retain the
actual build/start/browser capture logs for review. The checker verifies bytes,
structure, source identity and authenticated acceptance; `server`, `buildSha` and
command/result metadata alone are author assertions, not independent attestation
that a screenshot came from that server. The independent/manual reviewer must
inspect capture provenance and original screenshots, rejecting generated,
retouched or prototype substitutes. A later automated capture lane needs its own
qualified isolated execution/provenance setup; this gate does not claim one. Reference
setting is a reviewable operation, not screenshot auto-update. Only after explicit
owner acceptance should a separately reviewed policy change pin the reference
state/viewport SHA-256 entries for later independent reuse. Never self-rebaseline
to make a comparison pass. Unselected logos/photos remain purposeful neutral
placeholders under written authority; no invented brand asset.

## Evidence protocol

Publish the bounded evidence package as an ordinary PR issue comment:

````text
<!-- kopplas-visual-evidence-v1 -->
```json
{ "schemaVersion": 1, "candidateSha": "<full candidate>", "kind": "frontend",
  "changedPaths": ["<complete PR file list>"],
  "source": "<exact object from trusted frontend-policy.json>",
  "runtime": { "server": "next start", "buildSha": "<full candidate>",
    "synthetic": true, "fixture": "<fixture identity>",
    "command": "<actual build/start/browser commands>", "result": "<actual results>" },
  "surfaces": [{ "id": "login", "component": "LoginForm", "route": "/login",
    "files": ["<affected PR paths>"], "consumer": "auth",
    "referenceId": "login-v1", "referenceSetting": true,
    "notApplicable": { "empty": "<why no empty branch exists>" } }],
  "captures": [{ "id": "login-finished-phone", "surface": "login",
    "state": "finished", "viewport": { "width": 360, "height": 640 },
    "fullViewport": true,
    "actual": { "gitBlob": "<Git blob SHA-1>", "sha256": "<PNG SHA-256>" },
    "reference": { "gitBlob": "<Git blob SHA-1>", "sha256": "<PNG SHA-256>" } }],
  "deviations": [{ "id": "VIS-1", "category": "visual", "description": "<named deviation>" }]
}
```
````

This is a shape example, not valid evidence: include all captures/states/viewports,
actual source object and actual commands/results. PNG blobs must already exist in
the same repository's Git object store (for example a separately retained evidence
commit/branch); upload under an authorized checkpoint. No upload is performed by
the gate, and it cannot fetch arbitrary URLs. Keep screenshots synthetic: the repo
is public. Caps: 60KB package comment, 40 surfaces, 90 captures, 8MiB per PNG,
2560px maximum PNG dimension; oversized work splits into reviewable candidates.

Compute the evidence digest with `evidenceDigest` from
`scripts/quality/frontend-gate.mjs`: SHA-256 over recursively key-sorted canonical
JSON. Immutable bytes and the exact package are what acceptance binds.

Owner manual acceptance is an exact command (a separate owner-authored comment or
current-head review) `/visual-accept <full-head> <evidence-digest>`. The existing
human allow-list, account ID `53317458`, User type and **current** write/maintain/
admin permission are enforced. Normal prose, author-supplied identity, bot
impersonation, stale review commits and revoked current permission do not count.
The owner must inspect reference and actual images, applicable source and coverage;
the command acknowledges initial/replaced references when `referenceSetting=true`.
`/visual-revoke <head> <digest>` revokes acceptance. Edit/delete or later revoke
requires reassessment. Do not have another agent impersonate the owner.

A named aesthetic exception additionally needs
`/visual-waive <head> <digest> <deviation-id>` followed by a newline and its reason.
Every declared deviation is bound to this candidate/digest; ordinary comments do
not waive. Security, money, scope, integrity and accessibility defects cannot be
waived. Fix them and produce new evidence. Frontend PRs require `agent-fix`;
`/visual-opt-out <head> <digest>` from the authenticated owner records the existing
explicit label opt-out without granting visual acceptance. These protocol comments
are excluded from paid fixer feedback selection.

## Independent image review

For established references, routine independent acceptance may use a separately
configured trusted GitHub App bot, whose `userId`, `appId`, `provider` and `model`
are pinned in the trusted policy. It must differ from the PR opener and every candidate commit author/committer and remain
outside the author's coding account/credentials. The owner configures this only
after reviewing provider image-input capability, isolation, cost and credentials.
No provider has been configured or called by this setup. A ChatGPT subscription
is not evidence of an API budget or external provider availability.

The independent reviewer must actually open **both reference and actual image
inputs**, inspect all relevant states/viewports against written rules, and record
model/provider, image-input capability observation, every input SHA-256, findings
and verdict. Source text, screenshot filenames and automated pixel diffs alone do
not establish image review. A trusted receipt is a bot/App-authenticated comment:

````text
/visual-review <full-head> <evidence-digest>
<!-- kopplas-vision-review-v1 -->
```json
{ "status": "passed", "verdict": "PASS", "provider": "<configured provider>",
  "model": "<configured model>",
  "capability": { "status": "passed", "tool": "actual-image-input",
    "observation": "<actual reference/actual image inspection observation>" },
  "inputHashes": ["<every distinct reference and actual SHA-256>"],
  "findings": [] }
```
````

Only the latest authenticated receipt for the exact package can authorize,
using normalized issue/review timestamps (`updated_at`, `submitted_at`,
`created_at`) and a deterministic ID tie-break. Invalid ordering timestamps block;
an edit to an older receipt can supersede a newer numeric ID. Select that latest
outcome before reading findings, so a later clean review can supersede older
resolved findings. A
finding has `id`, `category` and `status`; unresolved critical findings block even
owner manual fallback, and aesthetic exceptions must be named in deviations and
receive the authenticated waiver. Failed, skipped, unavailable or malformed
provider results never become an automated PASS. The result retains that provider
outcome; a valid owner fallback is explicitly `mode=owner-manual`, not an
independent/automated PASS. Initial reference setting still needs owner acceptance
even after independent PASS. The human fallback is usable while the independent
provider integration remains unconfigured. Synthetic policy tests demonstrate
protocol enforcement, never actual app comparison or hosted-provider execution.

## Completion, review and remediation

### Admit the verification the story needs

Apply this procedure when admitting a new story from a qualified revision that
includes it. An already admitted story uses its original policy, source pins,
configuration and receipts through handoff or resume.

Use the existing story admission or checkpoint record. Tie each mandatory
infrastructure-dependent check to its acceptance criteria, supported command and
target. Distinguish an owned local production-server route from a qualified
hosted job. Record the actual inputs or revision, startup and readiness check,
required proxy or callback behavior, and where to retain native results.

For stateful verification, identify the isolated database, browser profile and
resource owner, and the synthetic fixture operations required to reach the
specified states. Record the authorized create, read, update and cleanup scope
and any capture, publication or hosted operation the check needs. Reference
existing grants by source, target and conditions. Confirm runtime custody
separately from the worktree. An absent guard context, foreign resource or
unsupported route blocks the dependent check.

Resolve foreseeable gaps before dependent implementation. When a route has an
unusual startup or fixture dependency, use a supported alternative or an early
authorized rehearsal. If required verification remains unsupported, name the
blocked criterion, evidence, owner and next allowed action in the admission.
Keep dependent completion blocked. Other allocated work may proceed unless a
recorded hold applies.

### Carry standing authority through handoff

Proceed under the original allocation for reversible implementation,
corrections, targeted revalidation, authorized isolated fixture operations,
captures and administrative package work. Advance through ordinary authorized
phases as their gates pass. A handoff or resume keeps the existing grants for
the same source, scope, target and conditions. Recheck ownership and applicable
conditions. A new actor uses its own resource-guard identity. A recorded hold,
expired grant or custody change follows its existing decision route.

Use the existing independent reviewer to assess conformance to explicit
acceptance criteria. Record the actual evidence and its binding. Route material
scope or design decisions, genuine acceptance uncertainty and consequential
actions outside the grant to the owner. Keep required human visual acceptance,
independent review, merge, deployment and platform controls.

On the next eligible ordinary story, use its existing records to compare time
to verified readiness, waiting for acceptance and merge, corrections after first
readiness, and owner interruptions or repeated grants. Record the comparison in
the existing closeout after the story runs.

### Prepare the package before requesting acceptance

Use this procedure for fresh admissions under the
[bounded workflow policy](../process/bounded-workflow-operating-policy.md).
In the existing delivery or checkpoint record, list the remaining candidate
metadata writes and identify which fields can be recorded later in the
coordinator's existing receipt or report without changing the candidate or
visual package. Reconcile the candidate-changing writes together before
requesting acceptance. Use the existing read-only Phase 9
`state_plan.py --finalize` invocation where applicable and the delivery
validator for the record once its required checks have actually passed. A
pending visual result stays pending. Keep any required terminal write that
cannot truthfully occur yet on its existing, explicitly recorded route.

Publish the evidence, render the description and replies from the same package
digest, and verify the PR label or existing authenticated opt-out. From the
clean candidate checkout, run:

```text
node scripts/quality/frontend-controller.mjs preflight --base <recorded-full-baseline> --digest <intended-package-digest>
```

Preflight reads the actual current PR and the selected uploaded package. It
checks the full head and digest, labels, source, immutable captures, required
coverage and presentation, and rereads current publication and PR metadata.
It reads policy and source blobs at the current main base revision reported by
the PR. If those Git objects are unavailable locally, preflight blocks until
the checkout has the qualified base objects. This current snapshot can differ
from the event revision used by an in-flight hosted check.
`package-ready` means the package passed those checks. `outstanding` names
the authenticated controls still required by the current protocol. An empty
list means the existing controls verified during preflight. Use the separate
acceptance and completion commands below for the authoritative result. The
preflight checks published inputs and checkout cleanliness. The author verifies
planned writes and the provenance of executed CI and independent review in the
existing checkpoint before requesting a decision.

If administrative corrections restore the exact PR presentation or label for
the same head, digest and valid evidence, rerun preflight and the existing
acceptance check. A receipt that still verifies needs no replacement. A wrong
digest never identified a valid receipt. If candidate, material input, coverage,
reference or digest changes, revalidate the affected evidence in scope. Reuse
original capture bytes only through an existing qualified exact-input route with
retained provenance. Keep the actual capture source and current candidate
binding explicit. A reusable capture does not transfer an authenticated
acceptance receipt to a different head or digest.

### Validate acceptance before completion

Before an implementation returns completed work or a review calls a frontend
candidate ready, run:

```text
node scripts/quality/frontend-controller.mjs local --base <recorded-full-baseline>
```

This checks all changed/untracked frontend paths locally. Non-visual work reports
N/A with its reason. Frontend work requires a clean committed candidate, exactly
one published PR at that head and live API-authenticated acceptance (GitHub CLI
read access). A failure is a development-acceptance blocker, never deferred polish.
Publishing a reviewable candidate does not claim completion. Keep existing checks,
review independence, effort selection, review-round cap and approval boundaries.

For Auto-BMAD delivery/status/finalization, preserve the original helper and every
argument, but run it through the project pre-transition wrapper:

```text
node scripts/quality/completion-gate.mjs <recorded-full-baseline> state_update.py <original arguments>
```

Also supports `delivery_gate.py`, `state_plan.py` and `story_plan.py`. The wrapper
runs the visual gate first and never invokes the mutating helper when it fails.
Supported `_bmad/custom/` persistent facts, author handoffs and completion/review
hooks carry this rule. No installer-managed script, template, Auto-BMAD result
schema/config key or managed review-layer region changes. Build's `on_complete`
is post-terminal: it cannot undo an installed done/result. Missing integration is
reported through existing summary/residual-risk output; CI readiness remains
blocked. Direct invocation of an installed helper bypasses the wrapper, so the
trusted PR check and required-check configuration remain essential hard controls.
Do not claim a universal atomic before-done hook exists in this installed version.

After fixer publication, prior acceptance is explicitly invalidated. The trusted
fixer waits for all five current exact-head CI jobs and reevaluates the actual
new-head visual package using the same API verifier. Missing/stale/failing visual
acceptance leaves `visual-pending`, `notified=false`; it neither requests reviewer
attention nor consumes a fresh coding attempt. Moved heads become superseded.
Expected-head publication, signed journals, credential separation, narrow allowed
paths, opt-in, budgets and opt-out behavior remain intact. No hosted fixer is
activated by this local implementation.

## Owner checkpoints and verification limits

Before enforcement is claimed hosted: independently review this bounded change,
bootstrap the trusted workflow on main under existing merge/deployment policy,
configure `Frontend visual acceptance` as a required check under the correct App,
and prove new-head/failed/manual/independent/revoked cases in an authorized pilot.
Existing exact-head CI remains required. A failed protection/API/provider setup
stays blocked; do not loosen the gate. Preserve the separately disabled feedback
workflow and automatic Preview policy. Provider configuration, paid inference,
credential/environment changes, required-check protection and a live pilot need
their actual owner checkpoint; none happened in this setup.

Run the focused policy/controller/fixer fixtures and customization resolution
checks listed in the setup evidence. The synthetic pilot is deliberately not
product UI; actual login/foundation screenshots/fonts and source-overlay admission
remain named inputs before that implementation. No application/browser/DB launch
is necessary to qualify this process-only change's own visual N/A reason.
