# Frontend quality gate

Owner-authorized tooling setup, 2026-10-26. This is a new development-acceptance
requirement for authorized frontend work and PR-feedback remediation. It changes
no product scope, schema, dependency, environment, deployment or paused run.

## Acceptance and trust

A frontend candidate is ready only when its **current full Git head** has actual
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

The controller's `Frontend visual acceptance` check attaches to the actual PR
head, runs default/base-branch code with read-only content/PR/issues access and
`checks:write`, and never checks out, installs, executes or renders candidate
code. It uses no model/App credential. Required-check protection and trusted-main
bootstrap are separate owner checkpoints. Without them, repository administrators
can bypass the check; local files cannot establish remote enforcement.

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
changes require their real affected consumers. Direct frontend-bearing paths
cannot use an N/A package. Backend/docs/tooling with no rendered path receives an
explicit N/A reason and its complete file inventory. Every `src` source change and Next/Tailwind/PostCSS configuration change is
conservatively subject to impact assessment, including headless `.ts` state,
formatters and date/display helpers. A backend-only ambiguous source candidate
may submit `kind=not-applicable`, `candidateSha`, the exact `changedPaths` and a
concrete `reason`, then needs authenticated owner
`/visual-not-applicable <head> <digest>`. Direct rendered paths cannot use this
route. Docs/tooling without source/config changes receive computed explicit N/A.
Automatic extensions alone never decide headless UI state is backend-only.

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
is public. Caps: 60KB package comment, 40 surfaces, 80 captures, 8MiB per PNG,
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
