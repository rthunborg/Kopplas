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
