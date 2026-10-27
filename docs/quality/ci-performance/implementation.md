# CI performance implementation record

Owner-authorized task: 2026-10-27, Murat CI cold-start improvement.
Base: origin/main d02fd8ac2dfe9a1afe447dfb6976cc3b12f2590f.
Branch: codex/ci-cold-start. Dedicated checkout; preserve all other worktrees.

## Routing and ownership

- Primary: coordination, baseline measurement and documentation.
- Implementation: gpt-6.1-sol High, context-free delegate. Reason: CI selection,
  credential boundaries, environment provenance and fixture isolation are sensitive.
- Independent review: separate gpt-6.1-sol High delegate after implementation.
- Explicit owner request authorizes implementation and PR creation, not merge,
  deployment, branch protection changes, or paid infrastructure.
- Frontend gate PR #109 owns immediate E01/RLS corrections. Exact workflow and
  provenance-contract handoff must be confirmed before those files are edited.
- Performance implementation owns new scripts/ci performance helpers, corresponding
  unit tests, and (after handoff) CI workflow/config and provenance inverse updates.
- Primary owns this directory and docs/quality/ci-performance.md.

## Evidence policy

Five minutes is an initial fast-feedback objective, not a smaller test timeout.
Keep existing required check names and consequential coverage. Unknown/sensitive
changes require broader validation. Skips are not coverage. Preserve production
build semantics and no-deployment boundaries. Record measured vs projected timings.

Independent review route recorded before dispatch: gpt-6.1-sol High, context-free,
read-only; review CI trust/selection, loopback browser service, required-context
compatibility, fixture isolation and artifact privacy. Reviewer must distinguish
early rendering feedback from complete affected-surface acceptance.

## Decisions retained during implementation

- Official Playwright browser image plus a loopback run-server sidecar preserves
  the host's existing local Supabase topology. A whole-job container would change
  Docker/loopback access and privileged wrapper custody; it is outside this first
  bounded implementation.
- Independent High assessment found no trustworthy arbitrary-frontend fast path:
  protected routes redirect before rendering changed components, while /login is
  an authentication entry. The implemented early lane must be labelled entry UI
  feedback and cannot replace affected-surface acceptance. All non-doc changes
  retain broad required coverage, including transitive/shared/sensitive paths.
- The existing shared seeded authentication suite remains serial. Only data-free
  browser contexts are candidates for two-worker timing comparison.
- Full production build artifact and authenticated storageState reuse are not
  enabled because source/environment and fixture/session compatibility have not
  been demonstrated. Build intermediates are cached under bounded keys instead.
- TEA utility integration flags are enabled, but @seontechnologies/playwright-utils
  and @seontechnologies/pactjs-utils are not installed. Existing Playwright APIs
  are used without introducing dependencies for this process-only task. A future
  framework-scoped adoption can address the configured library intention.
- Vercel dedicated previewDeploymentsDisabled=true was verified using read-only
  API projection. No Preview/production settings were changed.

The reviewer caught a draft ownership receipt under Playwright's cleaned output
folder. The author moved runtime ownership/timing to RUNNER_TEMP before final
review. This was an early architecture assessment, not a completed broad review.

Final compatibility route: use Playwright's documented
`PW_TEST_CONNECT_WS_ENDPOINT` environment variable, verified in installed 1.61.1.
Leave root/dashboard Playwright configs, the calendar wrapper command and optional
fixed-browser source bindings unchanged. This avoids expanding the optional
privileged diagnostic contract merely to gain a separate ordinary-build timer.
Ordinary browser setup/build/fixture phases remain an explicitly labelled
aggregate; entry-lane and verify production build receive direct timing receipts.

## Local validation before independent review

Author reports 33 focused performance/classification/provenance tests passed,
typecheck and targeted ESLint passed, source and built-bundle containment passed.
The production build through timed-build.mjs completed in 31.091 seconds.
Playwright list-only discovery found exactly two entry tests (desktop/mobile)
and wrote the native JSON at the intended root artifact path. List discovery is
not browser execution evidence. No local database/browser resources were launched.
Full unit results, independent review and hosted measurements follow separately.

Full local unit run before final job relocation: 3,510 cases, 3,506 passed,
three failed, one Linux-xattr case skipped. The induced admission-parser failure
was fixed by placing additive job definitions after the original jobs; 41 focused
admission/performance cases then passed, and two historical inverse cases passed.
The other failures are unchanged CRLF migration-text comparisons at
`tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts` (atomic migration bodies
and reversible native-regression construction). Git-show baseline d02fd8ac and
current LF-normalized bytes match for the test file, privileged wrapper and both
implicated migrations. Their local CRLF representation is the known difference;
no assertions or migration files were changed. Hosted Linux evidence is still
required. Full lint completed with zero errors and 31 existing warnings; final
typecheck passed. Author review trail validated 12 references.

Independent High review round 1 dispatched against the frozen implementation.
A formatting-only EOF trim and its exact inverse literal update were allowed
while review proceeded; no semantic scope change was authorized during freeze.

Independent High review round 1: approved for bounded checkpoint publication and
hosted measurement; no actionable introduced defects. Reviewer independently ran
27 focused contracts and two historical inverse/drift cases, all passed without
skips; diff check clean. Reviewed workflow SHA256:
`909e1f023a8af30b524ac16f0055fa5e94f27d6ee4493e258fe9f20f08db7629`.
Reviewed browser-runtime SHA256:
`6e458a649d018c0dfff6ca7f536c94e58e6b936eba804e7df032e024b6156d28`.
Approval covers publication/measurement only; hosted execution and final CI
readiness remain pending. No merge or deployment approval is implied.

## Base integration route — 2026-10-27

Coordinator-authorized local integration of merged PR #109: source
`origin/main` at `78ff0c6101105484eecd9e6bd8c8ba397602c229` into PR #110's
`6d16a87656eefae51aa0636d17f3602deddb8994`. Implementation/conflict resolution
uses gpt-6.1-sol High because composed CI provenance and source-custody assertions
are sensitive. Preserve incoming product/fixture changes and both exact inverse
contracts; retain the historical `48adc320` workflow digest. Leave the local
merge uncommitted for independent Sol High targeted review. This author task
does not authorize publication, merge to main, deployment or resources.

Only `tests/support/calendar-feed-ci-contract.ts` conflicted. The resolution
retains every incoming constant/source guard and composes performance projection
then Storage-source projection, followed by exact Auth-cleanup fragment removal
and the existing calendar/fixed-browser transformations. No historical digest
or collector source pin was reset. An added combined test confirms both incoming
fragments survive the performance projection, independently rejects drift in
all three boundaries and retains unrelated-byte drift detection.

Validation: 57 complete focused performance/Auth-cleanup/checkpoint/native-report
cases passed; five selected wrapper/Storage/fixed-browser historical cases
passed; zero failures or skips. Typecheck passed. Incoming product, tenant
factory, work-order and RLS files remain untouched by conflict resolution.
The prior PR #110 RLS failure belongs to its older head and is not evidence of
this local merge conflict or a newly verified resolution. Database/browser
execution for the integrated head remains a separate hosted check. The merge
is deliberately left uncommitted for independent High review.

Preservation audit: all 60 incoming files outside the workflow/conflicted helper
match `origin/main` bytes (text compared after checkout newline normalization;
binary files compared directly). Applying only the performance inverse to the
combined workflow reproduces `origin/main` exactly. Targeted ESLint and staged/
unstaged diff checks passed; no unresolved index entries remain. The refreshed
author review trail validates 16 references. No managed resources were launched.

Independent Sol High targeted follow-up (round 2 of 3) approved bounded final-head
publication and CI with no actionable defects. Reviewer independently passed
78 focused cases plus five historical/Storage/three-consumer cases, zero skips.
Both-parent preservation and the exact inverse-to-main audit passed. LF-normalized
SHA256 bindings: workflow `9c9e10a502092606f039a1dd96728f442290fc12cbdd35095c7180966ce23317`;
resolved contract `d9e15af932855c7b8424a0986b3839a9ccc80e9269a6daa4a7d19de8fa29d740`;
combined regression `242caf26528edc182207581b1bbe389e17bc83c7b3be50fb72ecf659673555f1`.
No code changed after that review. Dedicated Vercel Preview disable was freshly
verified true before publication. Exact integrated-head hosted evidence remains
pending; neither this review nor publication authorizes merge or deployment.
