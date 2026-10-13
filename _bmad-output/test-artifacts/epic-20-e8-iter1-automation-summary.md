---
stepsCompleted: ['step-01-preflight-and-context', 'step-02-identify-targets', 'step-03-generate-tests', 'step-03c-aggregate', 'step-04-validate-and-summarize']
lastStep: 'step-04-validate-and-summarize'
lastSaved: '2026-10-13'
workflowType: testarch-automate
epic: 20
boundedIteration: 1
target: 20-P0-02-MEMBERSHIP-REMOVE-001
executionMode: subagent
status: bounded-remediation-complete
inputDocuments:
  - _bmad-output/test-artifacts/traceability/epic-20-traceability-report.md
  - _bmad-output/test-artifacts/test-design-epic-20.md
  - _bmad-output/implementation-artifacts/spec-20-1-documents-activation-and-source-authorized-aggregation.md
  - .agents/skills/bmad-testarch-automate/SKILL.md
  - _bmad/tea/config.yaml
  - vitest.config.ts
  - docs/process/local-setup.md
---

# Epic20 E8 bounded membership-removal remediation

## Outcome and coverage plan

Added exactly one P0 API/integration regression at `tests/integration/commands/documents-signed-access.int.test.ts:359`: `20-P0-02-MEMBERSHIP-REMOVE-001`. It fills the trace's sole missing P0 variant: delete an ACTIVE membership after authentication and retain the already-issued token. Disabled membership, initial orphan, role/child-role revocation and role union already have coverage and were not expanded.

The fresh disposable actor first receives eligible global/context rows, source context/entity navigation and checked signing with one success audit. `DELETE ... status='active' RETURNING` proves one active row was removed; the actor has no remaining membership. The client retains the same unexpired access token, and Auth `getUser(token)` continues to authenticate the actor. Subsequent global/context reads expose no rows/labels/selection, source/entity contexts are unavailable, and separate open/refresh checked-command requests return membership-required without a new URL or audit. The actor's total success-audit count remains one. Exact fixture Storage removal and nested `finally` fixture cleanup isolate the deletion, including child-role cascade, from existing suite actors.

No production code, schema, migration, manifest, permission policy, dependency, environment file, state, sprint, claims, orchestration or trace artifact changed. The author added subsection6 within the existing single Suggested Review Order (`spec20.1:493`), with six verified new stops and actual evidence. Existing frozen intent/history/formulas and three broad rounds remain unchanged.

## Pinned workflow and routing

Pinned automate activated in BMad-integrated mode. Existing Next.js, Vitest and Playwright scaffolding is present. Initial resolver hit sandbox uv cache denial; the documented manual workflow merge found pinned empty prepend/append/facts/on_complete and no project or personal override. Terminal resolver later succeeded native0 with empty hook using only a process-local temporary uv cache.

The installed test-level, priorities, data-factories, fixture, network-first, selective-testing, ci-burn-in and test-quality principles informed the bounded plan: real authorization interaction needs integration execution, factory isolation, explicit meaningful assertions and cleanup. No burn-in or branch-coverage percentage is claimed. Runtime subagent support is present; auto resolved subagent. Sensitive authorization author and independent narrow reviewer both ran explicit Sol6.1 High. Step3A produced one API regression; coordinator scope excludes additional Step3B E2E/backend generation or duplicate coverage. Existing factories/helpers and execution scripts required no new shared infrastructure or README/package script changes.

Playwright Utils deviations: None; its mandate applies to the Playwright runner and this test runs under Vitest. Pact/CDC artifacts are not relevant. Pact MCP tool-list probe found no Pact tools; no broker data is claimed. Provider/action/read-model source established that open and refresh share the tested checked command. Browser exploration was unnecessary for this specific authorization boundary.

API generation output is retained locally in `C:/Users/Rasmus/AppData/Local/Temp/tea-automate-api-tests-2026-10-13-membership-remove-iter1.json`; durable compact generation metadata is `epic-20-e8-iter1/generation-summary.json`.

## Actual execution

`SUPABASE_TEST_REQUIRED=1`, API `http://127.0.0.1:60431`, DB `127.0.0.1:60432`, serial Vitest selection:

- Documents signed-access:76 passed.
- Documents signed-access lock races:38 passed.
- Documents RLS:24 passed.
- Documents contextual RLS:28 passed.

Total166 passed,0 failed,0 skipped,0 todo, native0 in97.53s. New membership-removal case passed in1.564s. Scoped ESLint and nonincremental TypeScript each passed native0. Full argv and assertion-level results are recorded in `epic-20-e8-iter1/documents-authorization-races.native.json` and `.vitest.json`; static native receipts use `membership-scoped-lint.native.json` and `membership-typecheck.native.json`.

Actual provenance is unchanged HEAD `b7f01bb33d110817c5919a86ec79ab221e2cbf3a` plus dirty test SHA256 `eab6b291f0eb8bee1c6269a8563fa1619105a983a0e8058eb6bea23a0151c90c`. Relevant product/schema/test/helper hashes were identical before/after each check. Compact native receipts preserve file count, aggregate hash, changed-test hash, dirty status and hash of full raw native receipt. Full native receipts/hash maps and raw logs are retained locally under `C:/Users/Rasmus/AppData/Local/Temp/Kopplas-epic20-e8-iter1-b7f01bb3`; raw logs also remain in the ignored evidence directory. No clean final committed-SHA replay is claimed.

## Independent narrow review and validation

Independent reviewer `/root/epic20_trace_remediation/membership_delta_review` (Sol6.1 High) cleared the new delta with no concrete findings. The reviewer inspected the retained-token deletion assertions, real shared command path, isolated cleanup, actual native/JSON/count/hash evidence, and six author subsection stops. This is a narrow delta/fixture-effect clearance, not a fourth broad review or whole-story/epic approval. Receipt: `epic-20-e8-iter1/narrow-review.json`.

Checklist validation: framework ready; exact one-target coverage mapping; P0 naming; meaningful positive/negative assertions; unchanged valid authentication; committed active-row deletion; no new URL/audit/projection; disposable cleanup; no added focus/skip or arbitrary sleep;491-line existing test file; positive REQUIRED execution with zero skips; scoped static checks passed; actual dirty provenance retained. No new fixture/helpers/scripts/dependencies/browser/provider contracts were required. New review stops all validate. Full pre-existing story trail has10 stale anchors outside this subsection; those were preserved under the bounded ownership and are not findings in this test delta.

## Resource lifecycle and remaining scope

Guard ComposeUp validated retained isolated runtime-verifier2 configuration using this delegate's own trusted context. Resource `99730089-4225-4bfb-8272-ba0849a9d277` reached active, owned, outcomeVerified=true. Read-only readiness found101 recorded/101 repository migrations with0 missing; no reset/migration was needed. After execution, Stop returned native0/ok=true, state `stop_requested`, verified=false; this is accepted shutdown request, not confirmed shutdown. Receipt: `epic-20-e8-iter1/resource-stop.json`. No lease or deletion was requested; saved database/Storage state is retained.

Limits: synthetic local command/read-model coverage. No Next cookie action-wrapper/browser rerun, hosted parity, previously-issued Storage bearer revocation, performance/cap-baseline/code-coverage/NFR/test-review/burn-in evidence is claimed. Supplementary trace gaps are outside this remediation. Root owns Git/integration, final committed-revision replay, trace recalculation and epic gate/status. No open question or blocker remains for this bounded addition.