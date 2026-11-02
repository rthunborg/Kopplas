# ADR-B014: Settings/manual-pricing producer contracts

Status: **Accepted** — actual owner approval on 2026-11-02, relayed by Coordinator after presentation of the exact independently reviewed 35.7-P proposal. This record materializes bounded task authority; implementation is not performed by this process change.

## Decision

Authorize ADR-backed task **35.7-P: Recoverable settings/manual-pricing mutations and expected-facts checks** under the canonical [SPEC-settings-pricing-producer-contracts](../../_bmad-output/specs/spec-settings-pricing-producer-contracts/SPEC.md) and its complete byte-preserved producer-contract.md companion. Retain that task identity without a new sprint story, numeric dispatch ID or sprint row.

The approved producer-contract.md SHA-256 is `eb95ec27576fe9c8245b96d0e07fa66e6ff130397d9e4d3ad2da87f01b8c8652`; producer-contract.json is `ffea1663cd548a0cdeeb912e10333a3d0e94cae5363df20a4f335f517aa7b408`. Independent Sol High review JSON is `c0f7362346077f868f27cfdb36dab5495ef043b3386d279117fe15cef9386317`. [Approval provenance](../quality/story-35-6-35-7-approved-operative-admission-2026-11-02.md) preserves the actual owner response and Coordinator interpretation; the sample approval prose in the historical proposal is not a verbatim owner quote.

Supply caller-retained immutable operation identity for the nine existing settings/manual-pricing actions and all eleven operation forms, one closed-purpose durable operation receipt, non-mutating authorized reconciliation, four database-owned opaque UUID revisions and checked expected facts. Keep current tenant/actor/capability checks protected through the mutation transaction, bind audit correlation to the original operation, and commit business mutation/audit/receipt atomically. Exact authorized committed replay precedes stale comparison and remains historical with no new mutation or audit.

Approve the explicit terms policy tightening: a fresh approval targets the exact reviewed saved **currently unapproved** revision. Fresh already-approved attempts reject and require refresh without receipt/audit. This changes the prior ability to deliberately reapprove with another event; exact committed replay remains historical. Every actual terms save clears approval; earlier replay cannot clear later approval or approve newer wording.

Unknown remains unknown with the same immutable identity and replacement/navigation guard after a later per-call denial, validation/stale/conflict rejection until whole-operation terminal proof. A delayed original may still commit after authorization restoration. Mounted-form memory is the minimum retention; there is no hard-reload, tab-close or crash-safe reconstruction, offline queue, automatic polling or cross-user takeover. Missing receipt never proves noncommit; indefinite unconfirmed is an accepted limit.

## Scope and migration boundary

The complete reviewed Minimum allocation table is binding. One future forward-only CLI-generated migration adds the bounded receipt/revisions/checked RPCs and revokes all seven old fresh-write signatures; no missing-precondition fallback. Enroll the receipt in the existing active settings module manifest/H4 and ACL/RLS tests. No new nav/module, permission grant, money/tax rule, supplier/import/upload capability, general operation platform or Phase C surface is authorized.

Follow existing standing migration authority, independent sensitive review and exact source/target verification. Confirm the latest never-released/no-older-callers premise and exact callers before the reviewed short fail-closed maintenance cutover. A discovered concrete compatibility conflict or inability to quiesce requires a revised allocation decision. Do not alter applied migrations or test against production/demo.

## Consequences and dependencies

35.7-P is a **real prerequisite** to Story 35.7 unknown/stale and full implementation admission. Approval alone does not earn it. A separate independently reviewed producer PR, actual required isolated DB/RLS concurrency/rollback evidence, essential production-server browser evidence and qualified merge precede 35.7 presentation implementation. The four shared forms, three shared pages and two e2e files have exclusive sequential ownership, with no concurrent producer/presentation writers.

Frozen Story 35.7 AC identities and all fifteen Applies state/test rows remain owned, including unknown and stale. Preserve frozen source/history. The pair-specific 35.6→35.7 amendment changes source ordering only; it does not waive the producer prerequisite. This decision marks no story done, grants no claim/worker launch, merge/push or release readiness, and expands no unrelated backend scope.

## References

- [Canonical task SPEC and full companions](../../_bmad-output/specs/spec-settings-pricing-producer-contracts/SPEC.md)
- [Approved pair operative admission](../quality/story-35-6-35-7-approved-operative-admission-2026-11-02.md)
- [Review-order convention](../process/review-order.md)
