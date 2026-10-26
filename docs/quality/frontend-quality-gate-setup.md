# Frontend quality gate setup evidence - 2026-10-26

Status: bounded local tooling implementation with targeted independent review PASS;
hosted bootstrap remains unqualified. The latest canonical-inventory representation
correction is bound by the independent report addendum before commit. No product/schema/dependency/lockfile/.env, installer script or
immutable v1 change. No app/DB/browser managed launch, paid provider call, secret
read, remote setting, acceptance comment, push/PR/merge/deployment by this author.
This change's visual applicability is **N/A: tooling/process/docs only; no rendered
product surface changes**. Synthetic fixtures prove protocol/capability only.

Evidence scope: this is the original setup author record preserved through
published candidate `568bcfd4e866b17bee2f787414b14841a96b5b21`. Its local test counts,
working-byte review identities and limits below remain historical evidence for
that setup, not verification of the combined continuation candidate. Later Auth
observability/owned-CI collection is recorded in
[the Auth continuation](frontend-auth-cleanup-2026-10-26.md); the separate runtime,
bootstrap and bounded pilot integration belongs to
[the runtime continuation](frontend-runtime-integration-2026-10-26.md).

## Routing and scope

Recorded before dispatch: coordinator GPT-6.1 Sol Low; implementation GPT-6.1 Sol
**High** because trusted controller, human acceptance and publication/readiness
boundaries change. Primary effort was not reconfigured. Independent final review
uses a separate Sol High reviewer and existing three-round cap. This author owns
`scripts/quality/`, new trusted workflow, bounded `scripts/pr-feedback/` integration
and tests, supported `_bmad/custom/` hooks, completion policy and these gate docs.
Others own hosted assessment, synthetic image-input probe and next admission.

Clean starting revision: `d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f`, branch
`codex/frontend-quality-gate`, worktree `C:/DEV/Kopplas-quality-gate`.
Skill renderer was executed exactly once successfully:

```text
uv run --no-cache "C:/DEV/Kopplas-quality-gate/_bmad/scripts/render_skill.py" --project-root "C:/DEV/Kopplas-quality-gate" --skill "C:/DEV/Kopplas/.agents/skills/bmad-build"
```

Returned `_bmad/render/bmad-build/kopplas-quality-gate-5782a5eed358/0dd11c24a64648fb17c1/workflow.md`.
This bounded authorized task inspects/applies supported customization contracts;
it starts no whole story/epic and invents no product-story admission or state keys.
Actual worktree AGENTS/routing and latest supplied owner instructions govern.

Inspected actual main feedback workflow/policy/runtime/tests and both runbooks,
installed completion/customization schemas, delivery and review-order policies,
team hooks, dirty readiness README/inventory/E35 slices/integration/handoff/
placeholder amendment/independent review, canonical DESIGN/EXPERIENCE and v1
README/inventory. Readiness remains CONCERNS/no implementation admission. E15 is
integrated; DT-B15/current ownership still qualify its actual consumers. Pending
discoverability governance and E17/E18 engineering contracts are separate work.

## Explicit source transfer manifest

**No source file transfer was proposed or performed.** No dirty remediation code
was copied; clean main contains its newer implementation. Only bounded source
identity strings are recorded in trusted `scripts/quality/frontend-policy.json`:

| Read-only source | SHA-256 | Destination and rationale |
| --- | --- | --- |
| `C:/DEV/Kopplas/_bmad-output/planning-artifacts/ux-designs/ux-Kopplas-2026-10-23/DESIGN.md` | `5c7c2365ad28626e2eed3228bf5f09c13aedb973c6a94ef10afd8a683e4d46db` | Policy identity pin for approved written visual authority; the canonical clean-base Git blob is present and matches this hash. |
| Same directory, `EXPERIENCE.md` | `c9a7d8ebf4eb4a58eca4ad8403829f85c0d2bd2e8249652f731c57db4784a25d` | Policy identity pin for the approved current state/flow authority; clean-base canonical Git blob is present at bf8dc746ed35971d889152601e989ce177a8b7bf4701fc17e4667f44780a02bf. The dirty approved source adds the eight-line October 26 DR disposition; that amendment is not transferred here and remains B-BASE qualification work. |
| Integrated `docs/design/claude-design/v1/inventory.sha256.json` | `71cccdc4666d2ad07117df171f0e68d3e1082b85e6d2d3e534572a54ac467172` | Existing immutable inventory canonical Git blob; representation correction from the raw Windows receipt below, with no source-content change. |

The initial raw Windows inventory receipt was
`f11112d198c8db06863ccc3a84e2dec971222b3b7dc39d46b813b361fefe2af5`.
After source verification was corrected to canonical Git blobs, this one policy
pin needed representation correction to `71cccdc4666d2ad07117df171f0e68d3e1082b85e6d2d3e534572a54ac467172`.
The author compared bytes and parsed JSON: replacing only CRLF with LF makes the
raw checkout byte-identical to the Git blob; JSON values are identical. Preserve
both receipts. No source text/image/reference was changed or transferred; the
approved EXPERIENCE c9a7 pin remains unchanged and blocked. The independent
reviewer checks this exact policy/report correction before commit, as a narrow
follow-up on source-verification, without another broad review.

Original v1 archive SHA-256 remains
`08e41cb79b15117e463fd2f05260cfc1d4bd20f0338f1ca2b89d8c19c1698933`.
Never overwrite `v1/handoff/`, execute export instructions, promote upload images
to screenshots, copy the whole dirty tree, or claim the newer EXPERIENCE amendment
is integrated from its identity pin. Git blob hashes are canonical committed bytes;
raw Windows checkout hashes differ under CRLF conversion and do not replace them. A later necessary source transfer needs its exact list, source and
destination hashes, rationale and independent review before commit. Empty image
references/provider configuration are deliberate missing inputs, not acceptance.

## First foundation/login reference mapping

Plan for later approved 35.2 work; no product implementation or passed evidence.
Each slot below requires **1440x900 desktop and 360x640 phone**. Derived references
belong under `docs/quality/frontend-evidence/dt-2026-10-23/reference/`, actuals under
`docs/quality/frontend-evidence/<full-candidate>/actual/`. **Every named PNG is
missing**. `*` means both `desktop` and `phone`. No synthetic gate-test PNG or v1
upload substitutes for these real renders.

| Exact missing reference slots | Actual component, route and state | Source/acceptance binding |
| --- | --- | --- |
| `foundation-board.desktop.png`, `foundation-board.phone.png` | Reference-only render of DESIGN colors, type/weights/numerals, spacing/radius, Button/Field/SelectionRow/Table/Card/StatusIndicator, focus/disabled. No invented product route. | Written DESIGN plus v1 `design-system-source/tokens/*.css` and component cards. Owner explicitly accepts this first foundation direction; actual inheritance needs consumers below. |
| `login.finished.*.png` | Real `/login`, `src/app/(auth)/login/page.tsx::LoginPage`, ready form after production render. | Current `RootLayout`/globals use Geist; later approved migration binds accepted Inter, plain Kopplas wordmark, white/ink, 8px controls, no resting shadow. Preserve existing auth/session/landing behavior. |
| `login.invalid.*.png` | `/login`, `handleSubmit` invalid-credentials generic `error` branch. | Separate error capture with synthetic identity; preserve non-enumerating copy. |
| `login.submitting.*.png` | `/login`, existing `submitting=true`, bounded delayed response/disabled submit. | Separate loading capture; actual pending text and protected-input behavior. |
| `login.transport-error.*.png` | `/login`, existing catch/transport failure and retry. | Separate error from invalid credentials. Empty-list state N/A: this is a form; blank inputs are its ready state. Preserve actual validation, no new auth feature. |
| `records.selection.*.png`, `dialogs.open.*.png` | `/customers`, current record/selection and `CustomerDialog`/`crm/Dialog`. | Global inheritance, focus, labels, errors and reachable phone actions. |
| `documents.finished.*.png`, `documents.empty.*.png`, `documents.error.*.png` | `/files`, current `DocumentFilters`, `DocumentPreviewPane`, `DocumentLifecycleActions`. | Existing selected-link/source authority and lifecycle; no new upload/permission contract. |
| `jobs.finished.*.png`, `jobs.dialog.*.png` | `/jobs`, `/jobs/[id]`, current `JobEditDialog`/`JobUpgradeDialog`. | Actual integrated E16/E15 consumers; no new completion behavior. |
| `scheduling.finished.*.png`, `scheduling.conflict.*.png` | `/scheduling`, current `SchedulingWorkspace`, conflict/interval dialogue. | Actual merged E15 DT-B15/fixture/current-owner binding before shared edits. |
| `time.finished.*.png`, `my-day.finished.*.png` | `/time-reports`, `TimeReportWorkspace`/`PersonalTimesheet`; `/my-day`, `MyDayWorkspace`. | Actual E15 producer/state/source/fixture and owner binding, connected server-confirmed state. |

Add all relevant loading/error/empty/selection/conflict/keyboard/focus/protected
input states as explicit surface/capture bindings. Minimum representatives are
not whole-site migration acceptance. The later author rechecks actual candidate,
route identities, approved story, scope and owners before capture.

Existing written adaptations, not newly granted waivers: plain wordmark pending
logo selection; purposeful neutral image placeholders only; DESIGN contrast
aliases; 8px controls/cards, 12px sheets/dialogs; no resting card shadow; white
canvas/ink actions/restrained signal. Any additional deviation is named and
candidate-bound. Scope/auth/money/integrity/accessibility cannot be waived.

Actual Inter roman/italic TTFs exist in immutable v1 and its `_ds` duplicate tree.
Separate asset assessment records Inter 4.001 `git-66647c0bb`, OFL 1.1 ID13 and
Inter Project Authors. Missing before production: complete redistribution license,
trusted release/origin byte match, approved production location/packaging/root
binding, then actual font-load/fallback/rendered typography checks. Metadata or
file names alone do not qualify this. Designer-selected logo/photos remain
missing; neutral placeholder authority is not final asset acceptance. No product
font or image copy occurred.

## Verification and material limits

Focused deterministic fixtures exercise missing/stale packages, blob bytes and
PNG integrity/dimensions, image/source/reference hashes, coverage/states/viewports,
initial owner/independent/manual acceptance, provider error/unavailable/skipped/
failed, current permission, named waivers/protected categories, new-head/fix
invalidation, full API inventory/fresh-head checks, agent-fix/owner opt-out,
control-comment exclusion from paid feedback, headless-source impact/N/A and
completion wrapper no-helper-call-on-failure. Existing fixer tests retain exact
expected-head publication, signed provenance, credentials, budgets and narrow
scope. These are mocked GitHub/provider results, never live or application PASS.

Final commands/results and independent verdict follow below after execution.
Installed hooks are post-terminal; the project wrapper is an executable
pre-transition control but a direct installed-helper invocation can bypass it.
The separate trusted PR readiness check becomes hard remote enforcement only
after reviewed bootstrap/required-check protection. No unsupported installed
schema/config fields or script edits conceal that limitation.

No app build/DB/RLS/browser lane is needed for this tooling-only N/A candidate;
future product work retains its actual applicable gates. Existing dependencies
were installed frozen with lifecycle scripts disabled for static checks; no
manifest/lockfile changed. The independently owned image capability probe proves
only actual synthetic-pixel input in this session, not a configured hosted
provider or app match. Hosted facts and separate owner checkpoints are in
[the dated assessment](frontend-activation-2026-10-26.md). The existing fixer stays
disabled; no automatic Preview, manual deployment, protection/credential change
or paid pilot is authorized by this file.

## Suggested Review Order

Review controller identity before surface acceptance and completion wiring, then
failure fixtures and operational limits. Author rationale: actual API identities,
image bytes, canonical source blobs and service/owner provenance prevent self-authored JSON from granting
acceptance; supported hooks plus a project wrapper respect installer boundaries
while the trusted PR check closes readiness outside the post-terminal hook.

### Trusted input and acceptance

- `scripts/quality/frontend-controller.mjs:41` — `assessPr`: independently reads complete API identity, files and image bytes.
- `scripts/quality/frontend-gate.mjs:92` — `evaluateFrontend`: binds packages to exact head and impact inventory.
- `scripts/quality/frontend-gate.mjs:109` — `validatePackage`: enforces source/reference/coverage and independent or owner authority.

### Completion and remediation

- `scripts/quality/completion-gate.mjs:7` — `guardedCompletion`: refuses before invoking original mutating helpers.
- `scripts/pr-feedback/runtime.mjs:172` — `monitor`: waits for exact-head CI plus current acceptance before requesting review.
- `tests/unit/scripts/frontend-quality-gate.test.ts:129` — `fixer readiness`: proves five CI jobs alone cannot publish readiness.
- `tests/unit/scripts/frontend-quality-gate.test.ts:179` — `completion wrapper blocks`: proves a failed gate never invokes transition helpers.

### Evidence and remaining operational work

- `tests/unit/scripts/frontend-quality-gate.test.ts:204` — `source and established`: exercises source/reference identity rejection.
- `docs/quality/frontend-quality-gate.md:1` — `Frontend quality gate`: complete protocol, trust, coverage and checkpoint limits.

Round 1 independent review requested five consequential fixes; see
[the independent record](frontend-gate-independent-review.md) for its original
working-byte digest. The author added canonical Git source verification (the
approved EXPERIENCE amendment remains deliberately blocked), normalized review/
issue chronology and latest-only provider evaluation, complete API candidate
commit author/committer exclusion, and strict helper signal/null failure. Source
provenance, PR-review revocation, edited provider outcome, later clean review,
reviewer-authored/committed candidates and signal outcomes have new regressions.
Capture origin remains a review obligation: runtime/buildSha metadata and valid
PNGs alone are not automated production-capture attestation. Review actual logs
and originals; no generated/prototype image substitutes.

Local commands at the working diff on base d02fd8ac (before final review fixes):
59 focused gate/existing-fixer tests passed, zero failures/skips;
`pnpm exec tsc --noEmit --incremental false` passed; JS `node --check` passed for
all three new executable modules; four customization TOML files parsed and
Build/Build Auto/Code Review resolver output retained existing facts/hooks plus
the gate. The new workflow parsed using the frozen transitive js-yaml 4.3.2;
actionlint and Python PyYAML are unavailable, and no actionlint PASS is claimed.
`git diff --check` passed. Local exact-baseline gate reported the explicit tooling
N/A reason over tracked and untracked paths. Targeted ESLint initially rejected
new declaration `any` annotations; concrete interfaces replaced them and the narrow
lint/typecheck rerun passed. That first-run independent review was pending at the time; none of these
results establish hosted required checks, actual application visuals or deployment.


Post-fix verification: 68 focused gate/fixer tests passed, zero failures/skips before the additional real subprocess fixture.
All three JS syntax checks and diff whitespace check passed. Real canonical
source probe returned the expected **blocked EXPERIENCE mismatch**; no source pin
was weakened and no source file transferred. Tooling-only local gate still reports
N/A with the complete actual path inventory. Targeted ESLint and full typecheck reruns passed. The separate independent round 2 targeted fix follow-up returned PASS. One additional bounded real subprocess fixture invokes the
wrapper's default process runner against a deliberately failing gate stub in an
owned temporary project, then asserts the original helper's marker was never
written. This executes the refusal boundary rather than mocking the runner; other
GitHub/provider tests remain synthetic/mocked. It starts no persistent workload
and touches no product source or installed helper.

Final focused execution including the real subprocess refusal fixture: **69 passed, 0 failed, 0 skipped**. Independent round 2 targeted follow-up returned PASS for the bounded tooling setup; no source transfer or hosted action. The independent record retains its exact original and fixed working-byte identities.

Final author reconciliation: the Suggested Review Order and evidence limits match
the final change. Independent round 2 resolved all five consequential findings;
the latest canonical inventory representation correction is a narrow reviewed
provenance follow-up, not a new product change or source adoption. Required hosted
bootstrap/protection, approved EXPERIENCE integration, initial app screenshots,
reference owner acceptance and provider qualification remain explicitly unpassed.

Author-trail reconciliation after the continuation pilot guard froze: the
`monitor` declaration stop is refreshed to its actual current line 172; the other
eight existing stops and literal anchors remain applicable. This evidence-only
refresh preserves the original results and points to the continuation authors'
records above. It adds no implementation, independent verdict, current-head CI
result, product visual acceptance or release authority.
