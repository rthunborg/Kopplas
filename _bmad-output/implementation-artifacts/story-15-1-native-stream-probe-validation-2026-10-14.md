# Story 15.1 native stream probe contract validation

## Outcome

**REVISE: one reachable CI artifact-preservation gap.** Revise the proposal before source authoring. No browser, probe, test, CI dispatch or resource launch was performed. No broad review round, P5, native acceptance or application-cause credit.

Independent route supplied and recorded by root: `native_stream_probe_validation / independent-native-probe-contract-validator / diverse_review / gpt-6.1-sol / high / codex / subagents / subagent`. Existing AGENTS/routing requirements apply. Root owns commits, state and next dispatch; coordinator-supplied HEAD `27d67de7` is documentation-only. This document is the sole write; others may be working in the checkout.

## Files changed

Only this validation document. Independently reproduced input bindings:

| Input | Bytes | SHA256 |
| --- | ---: | --- |
| [Prepared contract](story-15-1-native-stream-probe-addendum-2026-10-14.md) | 8,994 | `49a4955935bee0d566b2588b8839beb7b9cc4531a784ad51f08dc95cde3a1a24` |
| [Final diagnosis](story-15-1-dashboard-prefetch-diagnosis-2026-10-14.md) | 15,100 | `b3d186d2144bf8d27b033027978cbf16efee83ad39c3f912e1132eefe45ee2a4` |
| `.github/workflows/ci.yml` | 30,254 | `0934289c16f56355df9c58ed2c3208574c50beb606e529c21b552ed6f7d11a95` |
| `tests/e2e/scheduling-views.atdd.e2e.spec.ts` | 57,501 | `9e9fdd5a46c2f45a09f809758ed3788d13409e346177bbfa8cfd5f037ac0a065` |
| `tests/e2e/support/scheduling-views-atdd.ts` | 18,231 | `84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082` |
| Existing Story 15.1 spec | 84,649 | `d5a492a1546c19d777d8bff3d7037686e60a577565cac67281bff764f427bc22` |
| `package.json` | 1,879 | `b14c4d6182e43ee384f159a53d077556370953a891130d84f786f3632868b35f` |
| `pnpm-lock.yaml` | 166,878 | `532abe9d606d49daa060b41ebc91bc44b359291059b8832bed98233b65299ee2` |

## Status

**Required revision — admit the experiment only without consuming the existing artifacts' remaining budget.** The proposal mandates inserting the probe immediately after E2E and before original uploads. Actual `e2e.timeout-minutes: 25` is at workflow line 388; E2E is lines 460-464; both existing uploads are lines 466-482 and use `!cancelled()`. There is no remaining-time admission/reserve in either the baseline or proposal. The 800-second test-attempt budget explicitly excludes production build/bootstrap; installation, stack startup and reset consume the same 25-minute job limit without a combined pre-probe bound.

Reachable path: an opted-in dispatch's ordinary E2E failure finishes near the job limit with enough time for its original uploads. The new probe takes up to 90 seconds (outer step limit 120 seconds), or its dedicated upload stalls. The job then reaches its unchanged limit before the original artifacts upload. Those artifacts would be attempted by the baseline but are now prevented by the diagnostic. A small probe timeout alone does not establish spare job time. GitHub documents that the [job timeout cancels the job](https://docs.github.com/en/actions/reference/workflows-and-actions/workflow-syntax#jobsjob_idtimeout-minutes); [status conditions](https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#status-check-functions) do not create extra budget.

Revise placement/admission so original native JSON and Playwright artifacts receive priority, and explicitly bound or decline diagnostic execution/upload when the existing job budget cannot accommodate it. Moving diagnostic blocks after the original uploads is an eligible additive-order solution to the artifact dependency; any further remaining-budget admission must itself preserve the five jobs, original limits/commands/statuses and inverse workflow bytes. Record a fixed inconclusive/budget-unavailable outcome when declining, rather than implying an experiment ran. The revision must also bound the dedicated upload path, not just the Node command. Prove late E2E failure with insufficient remaining time still reaches original uploads. No budget increase, assertion change or continue-on-error is needed.

Other reviewed boundaries do not require a contract revision:

- Default-false boolean input plus explicit `workflow_dispatch`/`!cancelled()` conditions keeps PR/push/default dispatch inactive and permits post-failure steps. A successful probe cannot erase an earlier failed E2E step. The baseline already installs pinned Playwright/Chromium; no diagnostic install, upgrade or rerun is authorized.
- The condition also admits upstream installation failure. That path is **harness unavailable**, not a browser observation: the author must use guarded setup/import/version handling and the promised fixed failure/report schema where the command can run. Missing Playwright/browser must never trigger installation or fabricate the eight observations. Setup/report failure remains nonzero; original uploads and failed job remain independent. This is already covered by the contract's setup/privacy/exit obligations.
- A/B use actual getReader EOF and decoded hash; C is an independent native Response.text arm with no prior browser reader. C native text failure is a measured outcome, but C browser EOF remains not-exercised. A/B delivery cannot prove EOF for C's different request. A discrepancy label must preserve those per-arm limits.
- Withheld gzip trailer and binding-driven release can distinguish full delivery, explicit abort and premature close without a timed body release. The required prefix-progress proof and actual browser control action are load-bearing: if compression prevents decoded progress, the controls fail and the experiment is invalid. Missing action, full control delivery or missing EOF/hash cannot become valid discrepancy evidence.
- Unique serial owned synthetic URLs and public Response.request attribution permit bounded per-case correlation; duplicate/missing/overflow events remain unknown. Ordered relative times must describe receipt observations, not mix clocks into a causal terminal/EOF claim. All observations stop before teardown; teardown-generated aborts cannot supply control or positive evidence.
- The small allow-listed report excludes raw body, headers, IDs/URLs, ports, stacks and arbitrary errors. Exact decoded/compressed counts/hashes, version validation, eight bounded windows and owned finally cleanup are suitable contract obligations. Script/proof failures remain distinct from faithfully measured browser failure.

## Open questions

CI 38596630798's AC2 still fails natively twice before tampered navigation; frozen passive CDP candidates are pending. EOF, exact public/CDP identity and cancellation caller remain unproven. No explicit cancellation was found in pinned non-PPR buffering; the newer-Chromium issue is only a candidate for Chromium 149. This synthetic experiment can constrain exact-version behavior, not prove the application incident's cause.

## Deferred work

Author revises this single consequential preservation gap, then root selects focused validation. Only after PASS are the reserved two paths eligible: new `tests/diagnostics/no-store-stream-probe.mjs` and additive `.github/workflows/ci.yml` blocks. Whole-source/helper/spec/package/lock preservation and inverse workflow hash remain mandatory. Implementation proofs, independent diff validation and one authorized CI experiment are later work. No local launch, app fallback, shared harness, fixture, dependency, demo or resource change.

## Blockers

Pre-upload diagnostic execution/upload lacks remaining-budget accommodation and can prevent existing artifacts. No other blocking contract gap identified.

## Focused R1 decision

**PASS for revised contract-limited authoring.** R1 resolves the sole finding above: the new diagnostic job depends on verify/e2e completion, uses its own ten-minute budget and bounded setup/probe/upload steps, and adds no dependency or step to the original five jobs. Original artifacts, outcomes and budgets therefore cannot be consumed by this diagnostic. Setup failure or exhausted diagnostic budget remains unavailable/unknown, with missing report explicit; it confers no experiment or acceptance credit.

Revalidated author contract: 12,969B, SHA256 `a14c8ae03fbf7b1a48c185e89fb8070e55c5fa1c780337a2a969ef4c8ad0441d`; original 8,994B prefix retains SHA256 `49a4955935bee0d566b2588b8839beb7b9cc4531a784ad51f08dc95cde3a1a24`. All workflow/source/helper/spec/package/lock bindings in the table remain unchanged. This document's original 7,625B REVISE prefix is preserved verbatim. No execution or implementation approval is implied.

The unchanged three arms/two repetitions/two controls retain a feasible finite discriminator: A/B require actual EOF/hash, C uses independent native text with browser EOF unexercised; unavailable observations remain unknown. No further blocking gap found in R1. No probe/tests/resources executed; native, P5 and broad-review credit remain zero. Root owns next dispatch and commits.