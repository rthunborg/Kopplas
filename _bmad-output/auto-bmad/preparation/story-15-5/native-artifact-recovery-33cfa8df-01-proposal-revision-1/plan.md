# Artifact recovery plan — revision 1

**PLAN ONLY; R1 correction pending fresh review and Coordinator allocation.** No recovery implementation, local help, artifact request, CI or resource execution is authorized. `plan.json` contains the complete inherited scope and narrow typed-contract change.

## R1 and authoritative version

The frozen original plan omitted documented `expires_at`; its REVISE originals stay unchanged. This establishes a future compatibility defect, not the old response or historical stop cause.

The proposed new operation explicitly sends `Accept: application/vnd.github+json` and `X-GitHub-Api-Version: 2026-03-10` on both fixed API requests. These headers are proposed effects for allocation, not proof of the old negotiated version. GitHub documents version selection and additive changes across supported versions. Unknown additional fields still stop under this finite local contract. [GitHub version policy](https://docs.github.com/en/rest/about-the-rest-api/api-versions).

Official documentation and its version-specific OpenAPI description were read on **2026-10-21**. The latter was inspected in memory: 13,389,403 bytes, SHA256 `dc477f0866b67a12f1f9f6adadf721a23ad87e2289980c46c5e6fa4dbc7c4492`. Description-package version1.1.4 is not the REST version. Relevant pointers and a small expiry schema excerpt are in plan.json. [Endpoint documentation](https://docs.github.com/en/rest/actions/artifacts?apiVersion=2026-03-10#list-workflow-run-artifacts), [official version-specific OpenAPI](https://raw.githubusercontent.com/github/rest-api-description/main/descriptions/api.github.com/api.github.com.2026-03-10.json). No raw document was persisted.

## Shape versus acquisition eligibility

The typed grammar includes all documented required fields; created/expiry/update timestamps are required nullable date-time values. Digest and workflow identity may be optional/null at the API-shape layer. A nonnull timestamp must be a complete, calendar-valid RFC3339 value with its time-zone information; null stays null. The full type/presence table is in plan.json. [OpenAPI data types](https://spec.openapis.org/oas/v3.0.3.html#data-types), [RFC3339](https://www.rfc-editor.org/rfc/rfc3339#section-5.6).

Acquisition still requires nonnull digest and exact owned-run identity, positive bounded artifact ID, exact name, bounded size, expired=false and fixed derived API URLs. Missing provenance is a named identity refusal, not fabricated proof or an API-type error. Null timestamps confer no expiry/freshness claim. Known metadata not needed for admission is not copied as authority. Unknown names/values are never printed: only fixed presence/type-validity masks and counts.

The unchanged <=1-artifact graph, original raw listing bytes/SHA, exact Root ID before ZIP, five mutable fields, capped continuation plus EOF, 60s automatic bridge, current facts, privacy/custody controls, exact7+Root outside2 paths and request/cap budgets are preserved. No extra run/jobs GET is needed. New operation admission remains honestly posthoc and distinct from the historical producer pre-POST intent and UUID.

## Compatible reuse and controls

Do not reuse old listing_candidate, listing_artifact or qualified_evidence: the last re-enters the incompatible parser. Never remove expiry or rewrite the body to satisfy it. Reuse only the exact enumerated compatible pure JSON/archive/receipt/native/observation utilities by original hash. New metadata-aware aggregation retains the ORIGINAL listing hash and all report/cleanup consistency checks; no old network/main entry point or global is touched.

Add documented-shaped positive controls, valid nullable timestamps, RFC3339 cases and malformed expiry/type/required-field/unknown-field negatives. Optional/null digest or workflow identity must remain valid shape but stop eligibility before ZIP. Verify explicit headers, original bytes/hash and absence of old-parser re-entry. All prior acquisition-only controls and pre-network implementation review remain mandatory and unexecuted.

The consumed P33 operation stays immutable: listing execution UNKNOWN(0 or1), ZIP not reached, historical cause UNKNOWN. No actual owned-run response was observed in this revision. No normal acceptance or backend-cause claim follows. The original disclosed draft-path deviation remains historical provenance; this revision writes only its absolute assigned directory.
