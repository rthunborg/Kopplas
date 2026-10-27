# Targeted independent R1 recovery-plan validation

Verdict: **PASS, PLAN ONLY. R1 CLOSED.** The revision sufficiently corrects the documented artifact-metadata mismatch while preserving the recorded acquisition limits. No remaining consequential plan defect was established in the targeted R1/current-plan comparison. This does not authorize implementation, local capability observation, an artifact request or publication.

## R1 closure and authoritative contract

The reviewer independently retrieved the official version-specific OpenAPI document in memory on 2026-10-21: [GitHub REST API description for 2026-03-10](https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.2026-03-10.json). Its actual size 13,389,403 bytes and SHA256 `dc477f0866b67a12f1f9f6adadf721a23ad87e2289980c46c5e6fa4dbc7c4492` exactly match the revision. No raw document was saved.

The endpoint response schema and referenced artifact schema were independently inspected. They agree with the revision's required field list, required nullable created/expiry/update timestamps, optional nullable digest/workflow object, and optional typed workflow identity children. The description package's info.version is 1.1.4; the requested REST version is separately 2026-03-10. The revision now proposes explicit Accept and API-version headers on both fixed requests, with no default-version fallback or historical negotiation claim.

The plan separates API shape from acquisition eligibility: null timestamps provide no freshness authority; absent/null digest or workflow identity may be shape-valid but cannot authorize a candidate/ZIP. Exact run/head/branch/name, nonnull SHA256 digest, expired=false, positive bounded integer ID excluding bool, size and fixed derived URLs remain mandatory for acquisition. Timestamp parsing is finite and RFC3339-bound rather than permissive coercion; malformed and required-field negatives are required implementation controls.

The revision explicitly excludes old `listing_candidate`, `listing_artifact`, and `qualified_evidence`; the last would re-enter the incompatible old metadata parser. It forbids stripping expiry or rewriting raw listing bytes to appease that parser. New reviewed metadata aggregation retains the original listing bytes/SHA and previous mandatory report/count/observation/cleanup consistency. Exact-hash compatible pure report/archive/observation utilities may be imported without invoking old entry points or mutating old globals. These changes close R1 without modifying consumed P33 files or the original producer wire grammar.

## Adjacent-limit comparison

Structured comparisons show target, established limits, exact seven-plus-two operational scope, admission/provenance and offline-publication sections unchanged from the original plan. Request cardinality, caps, forbidden effects and bounded transport remain unchanged; only the reviewed header/version effect and metadata compatibility details are added. The one pre-network help observation must qualify the new method/header argv as well, without another process or fallback.

The fresh posthoc operation UUID remains distinct from the historical producer checkpoint UUID. Old P33 stays consumed and immutable, with listing execution UNKNOWN(0 or1), ZIP not reached and historical cause UNKNOWN. The new authority is at most one additional fixed listing and one conditional exact Root-admitted ZIP; it is not a retry under old authority or a new pre-POST producer claim.

Root's exact-five-field same-invocation confirmation, capped JSON continuation plus EOF within60s, unchanged expected/code identities and one final-terminal reread still gate ZIP. Closed stage/refusal diagnostics, queue draining through EOF after child exit, once-only Root result reservation and custody uncertainty remain required. Implementation review must prove owned transport/reader/child settlement rather than infer it from helper exit alone. Root closed handoff and separate offline High final-three publication remain distinct from acquisition and normal acceptance.

The earlier frozen workflow-cardinality check is unchanged: only the diagnostic upload is reachable in the selected three jobs, normal db upload is disabled and six jobs are skipped. No broader artifact-selection permission follows from this revision. Unknown metadata still stops; any future shape change requires another scoped compatibility decision.

## Integrity, controls and ownership

Root recorded Sol6.1 High route `P5_artifact_recovery_plan_revision1_review` before this independent review. Reviewer `/root/review15_5_private_diagnostic_high` is distinct from author and Root and issued the original R1 finding. Worktree: `C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas`.

The revision has exactly three files: plan.md 4,427 bytes/SHA256 `43478ec0afb70bfd0cb829e0721869531f04b71ac58daba9fed6aeba6e8743f0`; plan.json 25,199 bytes/`6fdde434e7e4853e70e9bebd6a64d1f960f33e35cf7d7025d07ea6cc5019be2e`; manifest.json 6,907 bytes/`5c04c4457240909ec0c239f9af0c58d12332e3d7adbb2b76b113e9faf520cba0`. Both non-self members and all 20 immutable local input bindings match. Root's 506-byte receipt matches `45843c3f1522974b004a2327d71424b56fc4aa7b0c48f0e00bf55fc25cacf8c0`. Original REVISE/proposal records are included in these verified unchanged inputs.

Checks here were documentation-schema extraction, exact local hashes and structured old/new plan comparisons. Recovery code does not yet exist under this plan; all positive/negative startup, documented-shape, nullable/RFC3339, eligibility, exact-ID, header, no-parser-reentry, refusal/EOF/drain/timeout/termination and durable-handoff controls remain PLANNED. They must execute against the implementation and receive distinct composite High review before networking. No invented implementation test count or native evidence is credited.

Only these three assigned new validation files were written. Root's assigned `...-01-r1-plan-validation` path/three-file limit governs this review, rather than the proposal's still-proposed alternate review-output path/four-file list. No recovery implementation, local help, owned-run API/ZIP/POST/CI, collector, DB/RPC, resources, source/helper/Spec/Root/old-record changes occurred. The only network read was the explicitly permitted official documentation download in memory. Python used -B and created no caches.

## Remaining gates

Coordinator must allocate the exact ownership/effects, including headers, before code or operational effects. Actual helper/test/driver implementation, meaningful acquisition-only controls and distinct independent High code review remain required. Root must then freeze actual posthoc facts and separately activate acquisition; offline final-three publication also requires separate activation from the frozen closed handoff. This plan PASS supplies none of those authorizations.

Normal/native acceptance credit remains zero. The 43 DB and 14 browser causes, backend first cause and historical session/input/clock equivalence remain unresolved. No normal 95/full 2039/browser/recovery/pilot gate is satisfied; development_complete=false and release_ready=false. No fourth broad story review was performed.
