---
id: SPEC-calculation-editor-mutation-safety
title: "Calculation editor mutation safety"
companions:
  - approved-producer-contract.md
  - approved-source-matrix.json
  - test-design.md
  - source-binding.json
  - approval-and-ownership.json
  - retained-reservations.json
  - stories/35-8-p-calculation-editor-mutation-safety.md
  - ../../../docs/decisions/ADR-B008-quote-review-authority-and-derived-artifact-validity.md
  - ../../../docs/process/review-order.md
sources: []
---

# Calculation editor mutation safety

## Why

Existing Story 35.8 requires honest unknown outcomes and stale-input protection. Its current producers cannot establish those guarantees through presentation alone. The owner approved this bounded prerequisite so the existing connected editor can rely on authoritative results before its separate presentation implementation resumes.

## Capabilities

- **CAP-1**
  - **intent:** Users can recover the authoritative result of an editor operation without duplicating its effects.
  - **success:** Original retained intent yields one immutable commit or checked terminal closure; absent/prepared outcomes remain unconfirmed, including after response loss, remount and later target changes.
- **CAP-2**
  - **intent:** Users can act on their original editor facts without overwriting later changes.
  - **success:** Concurrent obsolete edits, tax updates, descendant archives and changed reorder membership conflict atomically with no domain effect or audit.
- **CAP-3**
  - **intent:** Users can recover initial reviewed quote creation while retaining its original authority.
  - **success:** Retries preserve original authorization/capture/correlation, current access and real post-lock expiry; consumed committed proof never grants new review authority.

## Constraints

- Exact 55 product/test/migration paths, twelve closed kinds and thirteen action callers in approved-source-matrix.json are exhaustive. The named migration is owner-approved; actual slot/generator binding remains an activation check.
- approved-producer-contract.md is the unchanged reviewed technical contract. approval-and-ownership.json supplies the newer exact owner approval and accepted disposition of its historical ownership blockers; it waives no current admission gate.
- Preserve original E35-8-AC1–AC7, all seventeen Applies STATE/T identities and AC6 as reproduced in test-design.md; this prerequisite provides safety and minimum caller plumbing, not completion of the presentation story.
- Preserve existing integer-öre/basis-point money, VAT/ROT/grön teknik, ADR-A004 STOP, source/attachment/file locks, current authorization, ADR-B008 snapshots and ADR-B009 connected explicit-retry behavior.
- SQL validates typed inputs and computes canonical request binding; operation identity and expected content are mandatory on every allocated caller. No old direct DML/RPC bypass survives cutover.
- One feature-scoped proof table is manifest-enrolled in active calculations. Accepted positive ownership projection applies only after actual current writer/checkpoint, slot, qualified source and capacity admission; legacy and CRM claims remain intact.

## Non-goals

- A new money engine, general operation-receipt framework, aggregate revision system, offline storage/queue, source-policy change, pending module, Phase C surface or PR151 adoption.
- Shared envelope/settings/pricing/fixture/config/workflow edits beyond the exact matrix, unrelated 35.14/CRM changes, or broad scheduler/queue investigation.

## Success signal

Required production caller, race/replay, authorization/RLS, money/source/quote/PDF and full ordinary verification prove the approved safety contract on the exact admitted candidate. After independent High review and qualification, rebind and admit the preserved 35.8 presentation source separately; source preparation alone earns no runtime or delivery credit.
