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
targeted ESLint passed. This establishes no native browser or SQL coverage. Real
persisted scheduling smoke and the required current standard CI lanes remain
outstanding. Historical run 39237801662 stays failed; its database success is
historical evidence only. Broad browser matrices, eleven visual checks and manual
phone/polish checks are deferred release validation with ownership and next actions
to be recorded in the delivery artifact and ledger. Consequential functional,
authorization, RLS and transaction requirements remain development gates.

Coordinator allocated new Epic 16 edits to `src/scope/manifest.ts`,
`src/server/authz/permission-matrix.ts`, `src/features/scheduling/capacity.ts` and
`tests/unit/server/authz/phase-a-surface.test.ts`. Epic 15 makes no overlapping
new writes there. Preserve both epics' deltas during serialized integration;
whole-Epic-15 acceptance is not an Epic 16 prerequisite.

Reviewed checkpoint pushes and reusable standard CI are authorized. Main merge,
deployment, previews and provider/secret mutations are outside this resume.
Retain branches. Require delegate-authored delivery evidence and the supported
delivery gate before completion claims or status finalization.
