---
title: 'Bounded PR140 E09 transport timing observation'
type: 'chore'
created: '2026-11-05'
status: 'in-review'
baseline_commit: '4c44a539d2f220c3639775eca323c7837b6a0fd3'
review_loop_iteration: 0
ci_isolation_repair_baseline_commit: '04188d6cf63667235e797728d0f1c1c39ff026b4'
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

## CI compatibility and isolation repair — approved 2026-11-05

The preceding R1 intent/evidence describe historical04188 and remain preserved.
Its ordinary unit failure3677/3656P/21F0skip, skipped-name mismatch and diagnostic
first-fail/retry-pass/native0/terminal77 remain failed/nonqualifying evidence.
No abort initiator or Git refusal cause is inferred. The terminal audit pointer
is coordinator-resume-2026-11-05/e09-terminal-native-evidence-review.json,
SHA256d7be87a6b5ab73dc0b3c17591a4f09f9b6c1e2c5ba78e51e05304ea20a1624cf.

Owner approved bounded repair proposal SHA256
3f1cb0efa25fe60ff5c9f62cf1f414da2bca7bf341c0141925151e6a66148c60;
independent High proposal review543af634 and exclusive allocation SHA256
ab9ad272908785b2dac3d7c3aece6a73e097947238281111c3a990600106c15b
govern the new batch. Same Sol High author and build snapshotcc5f1ec60df7a6aa3e63;
no rerender or duplicate author. Root archived old04188 source, and every old
private freeze remains unchanged. This explicit amendment replaces prior writable
E09-test scope: the test/observer is now protected04188 blobeb977046 and no
assertion/network/barrier/fixture/retry behavior changes. Cold four remain frozen.

Current exact changes:
- [x] Restore ci.yml byte-for-byte canonical4c44 blobcecfc6a1; do not alter its
  finite inverse readers, first-occurrence mutation contracts or native callers.
- [x] Add E09 mode to registered auto-bmad workflow377341096 from current-main
 4411 baseline blob8ecb6f06 only; normal two matrices, guard, pins, native commands,
  dependencies, default names/manual mode and15/30-minute budgets stay identical.
  Optional empty SHA/UUID fields preserve ordinary callers. Only manual E09 true
  uses isolated UUID concurrency and excludes ordinary test bodies. Two new
  diagnostic names are literal; original job IDs/names are never renamed.
- [x] Move reviewed04188 case/capture job unchanged except new admission need;
  immutable SHA/UUID/ref/attempt admission precedes it. Safe artifact/native
  precedence/2-minute capture budgets and terminal77 remain unchanged.
- [x] Execute actual-source route/admission/native-consumer/parser controls and
  corrected eight-file validation; refresh this one SRO and bind source evidence.
- [ ] Complete full pure-unit prepublication gate: UNEARNED. Both local timeout
  attempts are spent and incomplete; source review readiness is not publication,
  development completion, qualification or release approval.

PR1388773 owns separate frozen auto-bmad changes and remains draft/unmerged with
spent budgets. Root's new exclusive overlap fence preserves that work and keeps
its author quiescent. This candidate imports none of its guard/index/comparator
changes or qualification. Root serializes current-main/integration/review before
the sole publication; actual drift/conflict beyond scope stops for disposition.

### Current local controls and validation limits

First author-worktree eight-file run:521 tests,515 passed,6 failed,0 skipped,
native1. Four failures were literal missing node_modules paths; two were raw
CRLF migration assertions. No test/reader/migration or dependency was changed.
Root supplied canonical-LF fixed mirror with all7171 tracked raw files/modes and
exact three-file overlay, bound by ready receipt SHA256
0b8106a243642b40e0108b4a2b888ac0aff767c344e236fb5b5b5d10da1f80c6 and
canonical manifest6aa2fb1d. Only frozen reviewed CWT dependencies were exposed;
PRIMARY dependencies were ineligible and not used for this batch's controls.
Before/after source overlays and8 dependency/metadata hashes matched.

The original exact eight-file command in that corrected mirror passed521/521,
0failed/0skipped/0cancelled, native0 in14.5804297s. No baseline rerun is credited.
This proves that source-bound targeted set, not the full unit inventory. Its
mirror includes the pre-final-SRO spec snapshot6117b99b; workflow runtime bytes
remain identical to those tested, while this later documentation update is
checked by the final reference/applicability checks rather than a repeated suite.

Actual auto-bmad YAML passed normal-body/guard conservation,9 mode rows,
21 weakening refusals and duplicate-key refusal. New names are static and disjoint
from six main required contexts; permitted skipped names derive only from original
runtime-admission/contracts IDs and matrices. Hosted skipped-label expansion is
not inferred from a local evaluator; Root must still verify actual output.
Native Git Bash ran10 E09 admission cases (1 accepted/9 refused), injected child
codes0/1 unchanged and actual terminal77. The moved job is exactly04188 except
its new admission need. Main guard SHA256
73313f16de80dc1528bd4a730f8acf55ffb290b09aa452d474edb298c9f6f28f is preserved;
it is not PR138's877guard. No normal guard/test body or actual Git probe ran.

Current-main A.qualify_tooling and unchanged engine.checks ran13 controls:
13 passed/0failure/0error/0skip, including failed workflow, diagnostic positive
counts, missing/zero/skipped/cancelled accepted core names, main-context-only
receipts and a synthetic ordinary positive. Other Git/store/review/pin prerequisites
were mocked. Main-context disjointness alone cannot qualify tooling; actual
passed exact-source native core evidence with positive counts/zero skips remains
required. No live claim or provider authenticity is earned by those mocks.

The actual moved safe parser passed39 pure checks and6 native synthetic-file
captures using verified CWT dependencies. Its exact source remains SHA256
1cb88be7477c0bc2ff4e01bf5f1e4e8d2f964b3539dc6bfb29b136541ccf02bc.
The unchanged observer/factory and old evidence are bound by exact hashes, not
relabelled as newly executed browser observations. No actual E09 or new browser,
DB/service, install/build, provider/CI, commit/push or managed launch was performed
by this author repair. Private controls/argv/cwd/native results live in
tmp/private/e09-ci-isolation-repair/ with original failures retained.

### Full-unit blocker and custody

The author's first corrected full-unit command hit its private300s recorder
limit; the buffered recorder lost partial TAP, so counts/native test terminal
remain UNKNOWN. Blocker97b9e884 and the old recorder/trace remain preserved.
The private streaming correction passed3 repository-independent seconds-long
controls; it distinguishes native termination from wrapper timeout and retains
partial output. Its direct-child handle cleanup does not claim tree containment.

Root then owned the sole separately reviewed600s observability attempt under
resourceccaabe5c-3d76-4f17-b1c1-512f039c37b2. Result SHA256
82e0d086d0666b94198946e8f4471f10b0b7f4af66c656ae69596407e49ca326 records
TIMEOUT/wrapper124 and child1 observed AFTER termination, not a natural test
failure. Immutable prefix541400 bytes/SHA256
7a87261399dab557ba8e503afd1f1546f4d5e4961868bb0c98e69a97f9b9af68 has no
captured not-ok line but no completed whole-suite summary. Continuing cold
recovery case completion does not prove PASS, a hang cause or a future duration.
Root Stop was accepted native0/oktrue/verifiedfalse; no shutdown poll or blanket
descendant shutdown proof follows. The author neither polls nor adopts it.

Full-unit gate remains UNEARNED and blocks publication under current order.
No further local suite/limit/concurrency change, protected cold-test change or
manual diagnostic run follows. Root's one automatic publication set (ordinary CI
plus3 admission cells+2 core jobs) and conditional one diagnostic/max2 attempts
remain unused. A separately reviewed explicit gate-order disposition is needed
before publication can earn exact-source full-unit proof in that existing set;
no extra CI budget, gate waiver, release/merge/live/product authority is implied.

## Suggested Review Order

Author: `/root/diagnostic_receipts`, same Sol High repair author.
Review only the new three-path diff from04188d6cf63667235e797728d0f1c1c39ff026b4.
Source is prepared for targeted independent High review; full-unit publication
gate is blocked/UNEARNED. Old04188 intent and failures remain historical.

### Restore exact ordinary readers while retaining the normal native DAG

ci.yml returns to its canonical baseline. The auto-bmad mode preserves existing
normal matrices/commands/guard; no dynamic name or mandatory field breaks callers.

- `.github/workflows/ci.yml:81` — `checkpoint-admission`: original immutable-dispatch caller is restored.
- `.github/workflows/auto-bmad-parallel.yml:21` — `my_day_e09_observation`: disabled default with optional source/checkpoint fields.
- `.github/workflows/auto-bmad-parallel.yml:45` — `runtime-admission`: unchanged matrix is excluded only in explicit E09 mode.
- `.github/workflows/auto-bmad-parallel.yml:233` — `contracts`: original whole-matrix predecessor and native bodies remain.

### Isolate admission and preserve native nonqualification

New fixed names avoid skipped-expression alias assumptions. Exact admission
precedes the unchanged single-case job; successful case output still ends77.

- `.github/workflows/auto-bmad-parallel.yml:291` — `e09-admission`: new literal diagnostic identity.
- `.github/workflows/auto-bmad-parallel.yml:297` — `Bind E09 dispatch`: source/UUID/branch/attempt checks are E09-only.
- `.github/workflows/auto-bmad-parallel.yml:312` — `my-day-e09-observation`: moved job depends only on its new admission.
- `.github/workflows/auto-bmad-parallel.yml:540` — `E09 observation cannot qualify`: unchanged intentional terminal failure.

### Capture safe evidence and read local limits honestly

Moved parser/child bodies are exact04188 bytes; current native consumer tests
retain positive-core/zero-skip rules. Targeted521 passed, full-unit did not finish.

- `.github/workflows/auto-bmad-parallel.yml:393` — `e09_case`: exact selector/native status and existing retry1.
- `.github/workflows/auto-bmad-parallel.yml:429` — `safeObservation`: bounded schema rejects raw payload fields.
- `.github/workflows/auto-bmad-parallel.yml:451` — `parseSafeReport`: source/case/attempt/count reconstruction.
- `.github/workflows/auto-bmad-parallel.yml:521` — `Preserve only safe`: only the fixed bounded artifact is uploaded.

Final manifest binds source/control/mirror provenance and excludes mutable Root
live logs in favor of immutable timeout prefix/result digests. Root retains
publication/provider custody and policy disposition. Independent High review,
complete native qualification and both product/live holds remain pending.
