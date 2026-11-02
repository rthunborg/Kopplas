---
id: SPEC-settings-pricing-producer-contracts
title: "35.7-P — Settings/manual-pricing producer contracts"
companions:
  - producer-contract.md
  - allocation-and-admission.md
  - ../../../docs/decisions/ADR-B014-settings-pricing-producer-contracts.md
  - ../../../docs/process/review-order.md
sources: []
---

> **Canonical contract.** This kernel and its companions define approved task 35.7-P. The byte-preserved producer contract contains the complete operation, transaction, authority, API, allocation and test permutations. Historical proposal-status wording is superseded only by the bounded approval recorded in allocation-and-admission.md and ADR-B014.

# 35.7-P — Settings/manual-pricing producer contracts

## Why

Current settings/manual-pricing writes cannot recover a lost create response or reject stale edits and terms approval. This approved prerequisite task supplies those missing contracts so Story 35.7 can retain its owned unknown/stale obligations without false success, duplicate writes or overwritten facts.

## Capabilities

- **CAP-1**
  - **intent:** Each existing settings/manual-pricing form identifies and retains its immutable attempt before dispatch.
  - **success:** P-AC1/P-U1/P-E1 prove nine action exports, captured operation/target/generation/baseline/candidate, accidental duplicate suppression, zero calls before offline dispatch and matching late-result identity.
- **CAP-2**
  - **intent:** The same mounted-form operation can recover its authoritative outcome without duplicate effects.
  - **success:** P-AC2/P-I1/P-I2/P-E2 prove every one of the eleven operation forms, lost replies, delayed-original/revoke/denied-retry/restore races, concurrent same-ID creates and distinct deliberate identical creates.
- **CAP-3**
  - **intent:** Only the current authorized tenant actor can execute or recover an exactly bound request.
  - **success:** P-AC3/P-I3/P-R1 prove current role/membership protection through commit, generic conflict/denial and no cross-actor or cross-tenant receipt disclosure.
- **CAP-4**
  - **intent:** Updates, lifecycle changes and singleton creation reject obsolete expected facts.
  - **success:** P-AC4/P-I4/P-E3 prove locked opaque revisions or expected absence, same-actor tabs, alternate writers, same-value/ABA changes and no stale side effects.
- **CAP-5**
  - **intent:** Terms approval applies only to the exact reviewed saved and currently unapproved revision.
  - **success:** P-AC5/P-I5/P-E4 prove wording/revision/state checks, fresh already-approved rejection without receipt/audit and historical exact replay without reapproval or changing later facts.
- **CAP-6**
  - **intent:** Business mutation, revision, fixed audit and durable receipt have one atomic outcome.
  - **success:** P-AC6/P-I6/P-R2 prove rollback on audit/receipt failure, zero duplicate audit, historical completion distinct from current facts and no replay recreation of a deleted target.
- **CAP-7**
  - **intent:** Existing permission, money, governance and migration boundaries remain enforced.
  - **success:** P-AC7/P-R3 and reused gates prove closed checked RPCs, legacy bypass revocation, receipt ACL/RLS and manifest/H4 enrollment, actual isolated required-mode DB/RLS counts and essential production-server browser evidence.

## Constraints

- Retain task identity **35.7-P** and canonical spec ID **SPEC-settings-pricing-producer-contracts**. This is an ADR-backed task, not a sprint story; no numeric dispatch ID, sprint row or stories.yaml is created.
- Follow the complete producer-contract.md without broadening its exact future paths, nine actions, eleven operation forms, one receipt table, four DB-owned UUID revisions, seven mutation RPCs or one non-mutating reconcile RPC. Current tenant/capability resolution, request-bound RLS client, locked authority, canonical money and fixed atomic audit remain authoritative.
- Retain the same unknown attempt after any later per-call denial, stale, validation or conflict rejection until whole-operation terminal proof. Missing receipt never proves noncommit. Mounted-form memory provides no hard-reload, tab-close or crash reconstruction; indefinite unconfirmed is possible.
- Fresh terms approval requires the exact reviewed **currently unapproved** revision; an already-approved fresh attempt rejects/refreshes without receipt/audit. This owner-approved policy tightening is explicit. Exact committed replay remains historical and is authorized before stale comparison.
- Future admitted implementation uses one forward-only CLI-generated migration and the reviewed fail-closed cutover. Verify current owner premise, exact callers and source/target migration state first. Preserve applied history; tests use isolated databases only.
- Separate producer PR and qualified merge precede 35.7 presentation implementation. Never concurrently write overlapping forms/pages/e2e paths. Independent Sol High implementation/review, actual focused concurrency/rollback evidence and current gates remain mandatory.

## Non-goals

- General operation framework, offline storage/queue, automatic polling, durable browser restart recovery, cross-user takeover, retention/cleanup program, new permission, money policy, supplier/import, upload, new module, broader presentation redesign or any Phase C feature.
- Product/SQL/test implementation, service launch, database application, CI, claims, story completion, release acceptance, merge or push during this process-only materialization.

## Success signal

The isolated future task proves all seven P-ACs against its exact independently reviewed head and actual authoritative paths. Its qualified merge supplies the two real producer prerequisites; it alone does not complete Story 35.7 or earn release readiness.
