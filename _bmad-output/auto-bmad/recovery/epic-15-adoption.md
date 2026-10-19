# Epic 15 recovery adoption — 2026-10-19

The owner explicitly resumed Epic 15. Continue the existing sequential epic on
`codex/epic-15-scheduling-time-calendar`; do not restart it. This checkpoint
integrates recovery `c9890f12ed570b5f18c0d2bfca63b13299737ef4` into
`40c2cfd53561171882ef9faf440a4a19b53f21e0`. Recovery includes current main
`e5e0308d8ef270fdf8b91f68c4a7675c0ee1392c` (PR104).

The actual conflict was limited to CI dispatch inputs. A Sol 6.1 High author
preserved the standard checkpoint inputs and the three default-false optional
diagnostic inputs. A distinct Sol 6.1 High reviewer verified both parents, all
six recovery job bodies and all three diagnostic bodies. Exact-head admission
remains required. No diagnostic was activated and no CI variable was created.

Compatibility tests now normalize checkout line endings and distinguish ordinary
jobs from the separately conserved diagnostic section. Five obsolete historical
whole-file/self-prefix locks now check the protected sections and substantive
authority invariants. Existing negative and fault controls remain.

The final scoped run executed 247 tests: 246 passed and one expected-hash
encoding error failed. Explicit UTF-8 derivation from the unchanged parent fixed
that literal; the affected test then passed 1/1. The independent reviewer verified
the unchanged 246 passes, the correction, and all 25 evidence bindings. This is
combined focused evidence, not a claim that a final full 247-test run passed.
Earlier 190/57 and 242/5 results remain historical failures.

Story 15.1 is still in progress. The portable two-file reload repair and its
Windows regression correction passed separate independent Low review. The current
stub regression executed seven cases, all passing without skips; typecheck and
targeted ESLint passed. This stub establishes no native browser or SQL coverage.
At pushed revision `91233e4e6fcaef85ab233f56b87c0651a95e73df`, actual local
production-browser E2E003 and E2E004 passed Resource click and drag creation,
including database interval/person readback and persisted editor values after
reload. The isolated database replayed all 102 migrations and synthetic seed;
the standard current CI lanes remain outstanding. Historical run 39237801662 stays failed; its database success is
historical evidence only. Broad browser matrices, eleven visual checks and manual
phone/polish checks are deferred release validation with ownership and next actions
to be recorded in the delivery artifact and ledger. Consequential functional,
authorization, RLS and transaction requirements remain development gates.

The new Schema focus case failed twice before editor visibility; its Resource
counterpart was skipped by serial execution. Neither receives focus coverage.
The diagnostic trace showed identical mouse-down/up screen coordinates while
the content scrolled 797 pixels. Native dragstart/drop was not observed. The
test correction activates a real source-owned mouse drag before target scrolling,
then recalculates and checks target geometry. A separate Low author and Low
reviewer qualified the two-file correction; typecheck and targeted lint passed.
Its native browser verification remains pending. No assertion, deadline or retry
was weakened and no product defect or focus success is inferred from this fix.

At `33dc85c765b7733265cb3e798c5e8342a9dbe209`, the corrected gesture reached
all six Schema day/week origin/cancel/focus checks. The case then failed while
closing the saved result; Resource focus was skipped. Saving replaces the form
with a success confirmation and leaves the dialog open. The form-filtered test
locator therefore could not find its close control. The spec now closes the
success dialog using its persistent identity and checks actual dialog absence
before the unchanged fallback-focus and SQL assertions. A distinct Low reviewer,
typecheck and targeted lint passed; full native focus cases remain pending.

At `22f08b4c73a5e91528bd54048ef6448c5a8192f3`, Schema focus passed completely,
including actual success-dialog closure, disappeared-source fallback and SQL
readback. Resource focus failed before mouse-down because the helper found no
owned activation corridor; the exact clipping/obstruction cause is unproven.
The helper now retains its original valid first path and checks at most eight
additional visible padding-band corridors with full source ownership. Independent
Low review qualified the unchanged Schema path for evidence reuse and approved
the bounded fallback; typecheck and lint passed. Resource native verification
remains required; no Resource pass is inferred from the source review.

At `955390c253a598a0f71ea4a46870965f4d1baeb3`, Resource source activation
succeeded, but the target-center hit check failed before target movement. The
slot button itself owns the native drop handler. Target selection now preserves
the valid center path and otherwise checks bounded visible positions inside that
same button; covering controls are never treated as valid drop areas. Independent
Low review and static checks passed. The original Schema path remains unchanged;
Resource execution is pending. If every bounded position is obstructed, inspect
the emitted geometry rather than expanding another blind candidate search.

Essential follow-up selection retains both calendar hosts' keyboard/dialog
creation, the five usable projections, and representative Resource move plus
Schema resize with review/cancel/no-write/persistence checks. The latter pair
covers the unique Resource assignee-replacement branch. The other move/resize
cross-combinations are deferred release matrix cells, not passes. P5 remains
incomplete with zero broad review rounds completed out of three.

Coordinator allocated new Epic 16 edits to `src/scope/manifest.ts`,
`src/server/authz/permission-matrix.ts`, `src/features/scheduling/capacity.ts` and
`tests/unit/server/authz/phase-a-surface.test.ts`. Epic 15 makes no overlapping
new writes there. Preserve both epics' deltas during serialized integration;
whole-Epic-15 acceptance is not an Epic 16 prerequisite.

Reviewed checkpoint pushes and reusable standard CI are authorized. Main merge,
deployment, previews and provider/secret mutations are outside this resume.
Retain branches. Require delegate-authored delivery evidence and the supported
delivery gate before completion claims or status finalization.

At `8276d9b2e3c0a2dc2f9313cd3bb1e61edfe3d9ff`, Resource focus still failed:
the intended week-view 14:30 slot was painted over by an 11:30 slot. The trace
did not establish the painted slot's date. Source review confirmed sibling day
wrappers could shrink below their nonshrinking half-hour columns. The author
changed those wrappers to intrinsic width under the existing horizontal scroll
container, preserving all days and DST-aware slot counts. The speculative source
and target point-search additions were removed; `dragBooking` is again exactly
the 44-line helper from `22f08b4c`. Typecheck and targeted lint passed. Independent
review and a fresh production build/native Resource execution remain required.
Schema's complete `22f08b4c` focus pass is retained only subject to the reviewer's
qualification of unchanged relevant code and dependencies. P5 remains incomplete.

At pushed `5e8a5e33f1472f20f218b4bf4b27637f63ea4e74`, the production rebuild
passed. Three bounded native commands then executed eight scheduling cases:
Resource focus, both hosts' keyboard/dialog creation, all five projections,
Schema resize, Resource move, and Schema click/drag creation with post-reload
editor comparisons and retained Person filter. All eight passed with zero
failures, skips, flaky cases or retries. Original reports and traces are retained
outside Playwright's cleanup directory. Schema focus at `22f08b4c` remains
independently qualified reused evidence. Historical W's 001/002 creation evidence
retains its original retry counts; current native execution closes the changed
Schema reload-helper coverage gap without relabelling that historical run.

Standard CI run [39258261167](https://github.com/rthunborg/Kopplas/actions/runs/39258261167)
passed for exact `5e8a5e33`: checkpoint admission, verify, complete database/RLS,
isolated recovery Storage and essential auth smoke. Optional release diagnostics
were intentionally unselected. The prior browser/body acquisition blocker is
resolved; formal P5, independent broad review, applicable TEA and delivery-record
validation remain outstanding. No story completion or release readiness is claimed.

The final bounded current-layout qualification directly executed Resource click
and drag creation at `5e8a5e33`, because their retained `91233e4e` passes predated
the Resource wrapper change. Both passed with SQL/read-after-reload assertions
unchanged. Final native evidence is ten current-layout passes in four commands,
zero failures/skips/flaky cases/retries, plus the independently qualified reused
Schema focus pass. `e15-focused-native-handoff-v3.json` retains the earlier
handoffs and historical failures. All three owned local lifecycle resources
received successful Stop acknowledgments after verification; saved state is
retained, and shutdown polling is not a completion gate.

### October 19 — formal P5 review and current verification

The lifecycle recovery checkpoint `80e00074` retained the approved baseline and
kernel, then resumed the formal build workflow. Broad review Round 1 of 3 ran
all six configured independent layers. Its original external reviewer completed;
the trailing Windows report-display command failed, and the same completed report
was recovered without launching another reviewer. Original failure evidence is
retained. Triage recorded eleven patches, two owned process follow-ups and five
rejections. Focused independent High reviews of the resulting security and
behavior fixes passed. No broad review budget was reset.

Reviewed application checkpoint `f69e6cda` repairs calendar boundaries, booking
presentation and failed-read authority handling. Focused tests passed 54 cases;
typecheck, targeted lint, production build and source/built containment passed.
The real JWT own-agenda test extends initial-read assertions; the separate new
authority transport test is mocked and receives no RLS credit. Standard CI at
`c9502aa3` passed: 2,857 unit cases, seven auth cases and 1,737 database cases,
with one explicit Storage skip covered by the separate isolated Storage pass.
The 752-case RLS inventory is a subset of the database result, not additive.
Intermediate CI at `96eee458` also passed. Exact logs and artifact bindings are
retained in the owned ignored evidence packets.

Essential native verification now has eleven qualified distinct case passes:
four creation cases at `f69e6cda`, five projection/focus/move/resize cases at
`c9502aa3`, preferences at `96eee458`, and the read-abort recovery case against
the exact bytes subsequently committed as `95d5e6bc`. This is a composition of
independently qualified unchanged evidence, not one fresh eleven-case command.
Original failed commands and serial skips remain unchanged. The bounded repairs
exclude nested status text from booking-root collection, restore the fixture week
after the preferences reset assertion, and scope planning alerts to their actual
workspace rather than Next's route announcer.

A separate context-free High investigation resolved the final read-test binding:
an outgoing action abort is an unqualified failure and must clear old authority.
The approved contract expressly distinguishes it from a server-confirmed data
I/O failure. The corrected abort case requires no stale bookings, misleading empty
state, conflict count, planner filters or creation controls; retry must restore
the selected job, clear the error and recover exact booking IDs. All assertions
passed with zero skips or retries. This browser case is not final-page server-I/O
or RLS evidence; qualified I/O retention remains separately mapped to actual
workspace and reader tests. Independent High review approved the test correction.

The tested E2E file is committed and pushed at `95d5e6bc`, with verified CRLF
working-file to LF Git normalization; this is not binary equality between those
two byte representations. Application, helper and production-build bindings
remain unchanged. Fresh standard CI
[39273703334](https://github.com/rthunborg/Kopplas/actions/runs/39273703334) passed
for that exact head. Formal P5 completed with an actual clean-tree HALT after
the delivery validator and independent High provenance review passed. Selected
post-build TEA and the required follow-up review remain outstanding; sprint
status is `review`, and the epic has not landed this story yet. The two process follow-ups
(optional diagnostic broker drain and upstream PR-feedback attestation) retain
their owners and next actions; neither is represented as a passed product gate.

Root requested Stop for its owned browser, Next server and isolated Compose
usage (`da2ada62-cda2-42be-a31b-34ab1a4e4bc0`,
`eb0b1fe4-63aa-4329-9ae7-b7212d5f654d`,
`f8f51526-ef0a-40ea-82d3-0d05a7555de3`). All three requests returned native zero
and `ok=true`, `stop_requested`, `verified=false`. This records accepted stop
requests, not verified shutdown. Saved resources are retained; no shutdown poll,
removal or reset is required. No deployment, preview or main merge occurred.
