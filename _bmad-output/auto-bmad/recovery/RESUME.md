# Recovery checkpoint — resume instructions

The recovery branch is `codex/delivery-recovery`, isolated at `C:/Users/Rasmus/.codex/worktrees/delivery-recovery/Kopplas`, based on merged PR104 (`e5e0308d`). Nothing here resumes another chat or marks either epic complete.

## Coordinator

On explicit owner resume, read `docs/process/development-completion-policy.md`, `docs/quality/ci.md`, and `docs/recovery/epic-15-16/README.md`. Review/integrate this recovery branch through normal Git review and exact-head CI; merge authorization remains separate. Preserve existing uncommitted shared-checkout changes. Retire expired temporary reservations as coordination metadata, never as product prerequisites. Assign the four named shared claims in the E16 handoff against actual heads. Approve a narrow prerequisite publication split only if needed; no split PR has been published. Keep all existing chats and automations paused until the owner resumes them.

## Epic 15

On explicit owner resume, reconcile pinned story gates against the dated owner policy, retaining historical failures. Apply the two-file repair using the exact pinned-base instructions in `docs/recovery/epic-15-16/README.md`; do not restart the epic. Run its focused persisted-behavior regression and required functional/integrity checks, then the reusable checkpoint lane after integrating current CI safely. Track broad calendar/browser matrices, eleven visual checks and manual UI work as deferred release validation with owners/actions. The recorded DB success at 40c2cfd5 is historical evidence; new schema/integrity changes require fresh affected evidence. Do not reuse the old bespoke hosted runner/admission packets as ordinary completion gates. Story15.1 remains incomplete until current required evidence and independent review are recorded through supported helpers.

## Epic 16

On explicit owner resume, preserve local checkpoints `2d14d7ac` and `97e62221` and existing state/report residue. Read the exact prerequisite matrix and blob inventory. The E14 foundation already exists on main; whole-E15 acceptance is not a prerequisite. Obtain exact shared-file ownership from Coordinator, then implement the My Jobs slice against available contracts. Reconcile E15 reassignment behavior only where integrating that reader. New job facts/snapshot/proof/finalize changes remain one coordinated integrity unit requiring High implementation/review, empty migration replay and focused RLS/transaction evidence. No E16 schema/browser/integration acceptance was executed in this recovery task.

## Reusable commands

From an installed clean checkout: `pnpm run verify:development`. The database/recovery/auth smoke jobs remain required in CI; this local command alone is not their evidence.

For an independently reviewed pushed checkpoint, use `node scripts/ci/checkpoint-dispatch.mjs dispatch --repo rthunborg/Kopplas --ref <branch> --sha <full-head> --state <unique-local-receipt.json>`. Reuse that receipt for status/reconciliation; never blindly redispatch an uncertain request. Omit release validation for ordinary development. Use `--release-validation true` deliberately for broad later validation. The receipt is generated durable metadata, not an executable private dependency. Resource guard requirements remain unchanged.
