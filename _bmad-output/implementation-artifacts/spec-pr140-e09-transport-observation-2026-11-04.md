---
title: 'Bounded PR140 E09 transport timing observation'
type: 'chore'
created: '2026-11-05'
status: 'in-review'
baseline_commit: '4c44a539d2f220c3639775eca323c7837b6a0fd3'
review_loop_iteration: 0
context:
  - docs/process/review-order.md
  - docs/process/development-completion-policy.md
---

<frozen-after-approval reason="approved proposal b01b85b9 plus exclusive allocation and name clarification">

## Intent

PR140's original80-case browser run41886899912 failed E09 twice with an aborted
held request after release. Its missing trace and existing phase enums cannot
order fetch, navigation, release, fulfill and cleanup. Observe only those E09
control points using bounded fixed enums and one Node-relative monotonic clock.
The abort mechanism remains UNKNOWN; transport failure is never delivered proof.

## Boundaries & Constraints

Owner approval binds proposal SHA256
b01b85b9ee34c091a81d20641d78274b5e101c23ac68f24d8a12d8d1e742a2e7.
Exclusive allocation SHA256
47362aeb58cde5ca921a306340cff5c42100f83f2778654d8253901ff770db86
owns exactly E09 in tests/e2e/my-day.e2e.spec.ts, .github/workflows/ci.yml and
this new artifact. Existing assertions/network/barriers/fixtures/retry remain.
Cold four files and all unrelated sources stay frozen. Existing ownership fence
remains; no product story/status/claim or legacy ownership transfer is implied.

Observation:32 events/4KiB per attempt,8KiB combined, attempts0/1, safe enums and
integer relative time only. Missing/overflow/invalid/incomplete data stays
INCOMPLETE. No CDP, new request identity, headers, URLs, rows, tokens, raw errors,
trace/HTML/screenshot upload, app/shared helper/config/dependency/schema/env edit.

Manual default-false mode uses exact SHA/UUID/branch/run-attempt1 admission and
mutual exclusion. All11 existing CI jobs use diagnostic-only names in this mode;
its complete set is disjoint from the six required contexts. Ordinary existing
jobs/names/semantics are conserved plus exactly one nonrequired skipped diagnostic
alias, per accepted clarificationb10993. Dedicated job selects one E09 case with
existing retry1, pinned browser, production webServer and synthetic local stack.
Original native nonzero stays failure; original0 ends native77 after safe capture.
No diagnostic result can qualify full80 or required source contexts.

Root alone owns commit/publication/provider observation: one automatic CI set plus
one dedicated job, maximum two case attempts, no unchanged rerun or redispatch.
Author runs injected/static checks only, no actual E09/service/browser/DB/runtime
install or provider operation. A fourth path, conflicting writer or source drift
stops this allocation. Both product/live holds and4c44 failure remain.

## I/O & Edge-Case Matrix

| State | Expected behavior |
| --- | --- |
| Normal/default mode | Existing jobs and names conserved; extra diagnostic alias skipped |
| Manual E09 | Complete check-name set disjoint; one case/max2 attempts |
| Wrong SHA/UUID/ref/attempt or mixed flags | Admission fails under diagnostic-only names |
| Clock/cap/missing/late/sink failure | Fixed incomplete or absent capture, original failure unmasked |
| Case0 | Capture then terminal77; never workflow SUCCESS |
| Case nonzero | Original native code retained; capture never masks failure |
| Invalid reporter/attachment/skip/extra case | Fixed capture failure, no raw fallback or qualification |

</frozen-after-approval>

## Code Map

- tests/e2e/my-day.e2e.spec.ts E09: current held Request and terminal enum,
  route.fetch/fulfill and existing inner cleanup; observe without altering them.
- .github/workflows/ci.yml checkpoint-admission/e2e: existing immutable dispatch,
  pinned browser setup and direct release-lane Playwright invocation are reused.
- playwright.config.ts and browser-runtime.mjs are read-only: production server,
  worker1/retry1/global fixtures and image pin; calendar wrapper runs full smoke.
- Prior2a803 observer/control packet remains read-only: reuse AST-conservation and
  injection ideas, not its broader CDP observer, budgets or historical45 passes.

## Tasks & Acceptance

- [x] E09 only: bounded observer, known safe attachment, cleanup coverage.
- [x] CI only: isolated names/admission/job, safe extractor and native failure.
- [x] Private actual-source controls and author SRO; exact freeze binds final files.

Given original E09 statements, when observations are stripped from the AST, then
the baseline test and all other source statements match. Given supported modes,
when parsed actual YAML expressions are evaluated, then names, source guards and
nonqualification satisfy the matrix. Given adversarial synthetic reporter/events,
when captured, then only bounded safe data leaves and missing coverage fails.

## Design Notes

Each attempt has its own Node callback-observation clock; it does not establish
browser-internal ordering, abort initiator or cross-attempt timing. Outer fixture
failure is scope failure, not attributed cleanup failure. No wrapper teardown
proof is inferred. Byte caps apply before publishing safe attachment/artifact.

## Verification

Local injected/static controls only; actual YAML and extracted TypeScript/inline
programs must be exercised. Include AST conservation, privacy sentinels, exact
name sets/weakening mutations, admission cases, native exits and unchanged strict
consumer refusal with other provenance prerequisites mocked. Run focused source
type/lint, review-reference and computed frontend N/A checks. Results will be
recorded after execution; hosted/provider/runtime coverage remains unearned.

## Spec Change Log

Initial scope is the already approved repair proposal, supported exclusive
allocation and accepted diagnostic-name-set clarification. New renderer ran once
at snapshotcc5f1ec60df7a6aa3e63; no intermediate reapproval or duplicate author.

## Author verification and proof limits

At uncommitted baseline4c44, actual E09 factory passed12 injected controls;
stripping only observations/transparent rethrow wrappers restores the entire
original TypeScript AST and normalized pre-E09 text. Candidate E09 file has0
TypeScript diagnostics under existing project settings; focused ESLint native0.
No emitted build or application runtime is implied.

Actual parsed YAML passed1 positive conservation check,22 weakening refusals and
1 duplicate-key refusal. All11 existing ordinary job names remain exact; only
the declared extra skipped nonrequired diagnostic alias is added. Diagnostic
complete12-name set is disjoint from all6 retained required contexts. Existing
setup, pins, production server/fixtures and ordinary commands are conserved.
Git Bash ran12 actual admission cases (3 accepted/9 refused),4 injected child
statuses0/1/23/126 with exact native preservation, and the actual terminal77.
The12-row outcome model is local reasoning, not GitHub evaluation proof.

Actual extracted inline capture passed39 parser controls and6 native Node
synthetic-file cases, including malformed/oversized input, failed native code,
retry/skip/count/identity mismatches, unknown payload fields, missing/body-only
attachment handling, incomplete safe output/native1 and overwrite refusal.
Retained synthetic fixtures are private; none contain a real driver payload.
Installed Playwright1.61.1 util.js247–270 and runner/index.js3873–4050 confirm
body attachment/base64 JSON reporter shape by source inspection only.

Existing unchanged A.qualify_tooling and original engine.checks ran10 consumer
controls:10 passed/0failure/0error/0skip. Their Git/store/review prerequisites are
mocked; these synthetic predicate tests do not authenticate provider evidence.
They reject diagnostic names, native failure, zero/missing/skipped coverage and
skipped-Success CI receipts. Branch-protection isolation is separately enforced
by the actual-YAML name-set controls, not by these receipt assertions alone.

One first YAML-check attempt failed because its private expected expression
retained whitespace; source policy was unchanged. The checker was corrected and
passed; both native logs remain preserved. No unchanged CI retry took place.
The first diff check also reported whitespace on five blank YAML script lines;
only that formatting was corrected, with unchanged parsed inline program bytes.

Evidence, exact argv/cwd/native exits/timing/log hashes and final manifest live
under tmp/private/e09-observation/ in this worktree. Prior2a803's AST/injection
ideas were reused; its CDP implementation,45 historical controls, runtime plan,
private packet and prior budget were not adopted or credited. No actual E09,
browser/DB/service, production build, CI/provider, commit/push, claim/store or
resource operation ran here. Computed frontend N/A and reference-check receipts
bind the final source. Stable independent High review and Root hosted checks
remain pending; both product/live holds and original4c44 failure remain.

## Suggested Review Order

Author: `/root/diagnostic_receipts`, Sol High, exclusive three-path author.
Read the uncommitted candidate against4c44a539d2f220c3639775eca323c7837b6a0fd3;
local controls establish source behavior only, not hosted qualification.

### Keep diagnostic contexts outside ordinary required gates

Names are selected before admission outcome; skipped jobs cannot supply accepted
ordinary contexts. Ordinary existing names remain exact with one explicit extra
nonrequired diagnostic alias. The successful case must still end native77.

- `.github/workflows/ci.yml:87` — `e09-diagnostic-admission`: names admission independently of its eventual result.
- `.github/workflows/ci.yml:102` — `E09_OBSERVATION`: mutually excludes other diagnostic/release modes.
- `.github/workflows/ci.yml:1720` — `my-day-e09-observation`: one isolated job after immutable admission.
- `.github/workflows/ci.yml:1948` — `E09 observation cannot qualify`: intentional failure preserves nonqualification.

### Add bounded callback timing while preserving every original operation

Node-relative events stay local to each attempt. No request URL/header/native-ID
join or extra browser session exists. Removing observations restores the original
AST, including unchanged assertions, network arguments, barriers and cleanup.

- `tests/e2e/my-day.e2e.spec.ts:631` — `createE09Observation`: fixed enums and private attempt clock.
- `tests/e2e/my-day.e2e.spec.ts:644` — `function mark`:32-record cap and fail-closed clocks/enums.
- `tests/e2e/my-day.e2e.spec.ts:657` — `async function finish`:4KiB snapshot and missing-event incompleteness.
- `tests/e2e/my-day.e2e.spec.ts:851` — `observation.finish`: attachment runs after the fixture scope settles.

### Preserve native failure while publishing only safe evidence

Native output remains runner-private. The extractor checks one case/maximum2
attempts and rebuilds exact safe keys; no arbitrary attachment path is followed.
Incomplete data stays failure even when its safe partial artifact is retained.

- `.github/workflows/ci.yml:1801` — `e09_case`: original/configured-retry execution preserves native status.
- `.github/workflows/ci.yml:1837` — `safeObservation`: closed enum/time/size schema.
- `.github/workflows/ci.yml:1859` — `parseSafeReport`: exact source/case/count bindings and safe reconstruction.
- `.github/workflows/ci.yml:1930` — `always()`: bounded safe upload runs after failed case/capture.

### Check evidence without borrowing old or hosted success

Private source/workflow/capture/consumer controls map every matrix row above.
Native synthetic shell/parser checks are real processes; page/stat/provenance
facts remain injected. Frontend applicability and reference checks are process
checks, never browser evidence. Root alone consumes the one automatic set and
one dedicated job after independent review; no extra attempt follows uncertainty.

The final freeze manifest names all source/private hashes and retained first
failure. Hosted check names, actual checkout, test attempts and native conclusion
still require Root observation. Source remains in-review and release_ready=false.
