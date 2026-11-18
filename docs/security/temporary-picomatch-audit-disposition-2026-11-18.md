# Temporary picomatch audit disposition - 2026-11-18

Status: owner-approved temporary CI risk acceptance, implemented for distinct High source review; new candidate hosted qualification NOT EXECUTED. This is an accepted known vulnerability during a fixed window. It is neither a dependency fix nor a clean audit, production enablement or release approval.

## Owner decision and fixed end

The Kopplas owner explicitly approved this exact disposition at **2026-11-18T09:52:14.240Z**, including the uncertainty about indirect runtime exposure. Approval receipt SHA-256: `313e86e5e740bcf06a98290789aec04ddb2f500c30088420ce1d8eea9dbbe411`; reviewed proposal JSON SHA-256: `e426e5f62fcf3023f51724010c95f3a44ad5c697fee4873992c203736c36a31d`. The Coordinator positively allocated the four source paths for this security purpose after independent High admission. This implementation remains subject to its own distinct High source review.

The exception ends **2026-11-21T00:00:00Z (2026-11-21 01:00 Stockholm)**. The implementation uses the runner's actual UTC clock; it refuses exception use before the recorded acceptance or on/after expiry. A new commit cannot reset the date. No automatic renewal, scheduled monitor or runtime time override is introduced. A genuine ordinary audit with no High/Critical findings may still pass after expiry without using this exception.

Earlier termination is required if the owner withdraws acceptance, a complete owner-qualified fix is available for adoption, the reviewed dependency graph changes, severity escalates to Critical, another High/Critical finding appears, a remotely controlled glob route is newly established, or the stated custody/approval conditions cease to hold. Registry/schema/count/copy/native errors refuse automatically; graph and patched-range changes also prevent using the exception. Coordinator/security owner must remove or disable this region at the next deliberate checkpoint when an earlier stop condition is known. Any extension requires a new explicit owner risk decision. This record does not silently extend it.

## Accepted finding, graph and exposure

Accepted advisory: [GHSA-fc5q-39xc-vjpf / CVE-2026-112366](https://github.com/advisories/GHSA-fc5q-39xc-vjpf), **picomatch**, **High**, locked copies **4.0.4 and 4.0.7**. The qualified raw pnpm report uses numeric advisory ID **1247710**, affected range `<=4.0.7`, patched range `<0.0.0` (none). The completed independent qualification found no complete qualified published fix; the disposition does not label an unreleased PR, fork or package rename a security repair. The GHSA lists CVSS4 8.7; retained npm JSON reports CVSS3 7.5. These are different scoring versions, not two separate accepted advisories.

The observed paths are development/lint/integration tools: Next ESLint's existing fast-glob alias to tinyglobby, the TypeScript lint/resolver consumers, and Vite/Vitest. Malicious repository/config/dependency glob patterns can cause synchronous CPU exhaustion and denial of build/test/toolchain availability. A job timeout does not remediate ReDoS. Reviewed literal configuration is an observed input boundary, not a proof of absent attack surface.

No direct application request-to-glob route was established by the bounded source qualification. That is not a complete deployed-bundle/SBOM/runtime call-graph proof, nor a claim that indirect Next/build/plugin/runtime paths are safe or unreachable. The owner explicitly accepted this remaining uncertainty for this graph and window. No exploit/DoS experiment or production test is performed by this policy.

Only these exact High finding copies are accepted:

| Version | Exact report path |
| --- | --- |
| 4.0.4 | `.>eslint-config-next>@next/eslint-plugin-next>tinyglobby>picomatch` |
| 4.0.7 | `.>vite>picomatch` |

The inline policy checks LF-normalized SHA-256 of all three reviewed graph controls before exception use:

| File | SHA-256 |
| --- | --- |
| `pnpm-lock.yaml` | `2c0502dba5caf17bb8851a849bb4b85b0039bf5d8da35b965412a6d78e7fee95` |
| `pnpm-workspace.yaml` | `6464c218bc0c2e87d8ad7bac5c641491a3d056b6247ef643aef2376f3e07f66d` |
| `patches/@next__eslint-plugin-next@16.3.6.patch` | `88513a4345d44468acd514beee604f895a6d6d2b61ebe4ee4ab8972de663385e` |

Coordinator read-only Git proof established identical lock blob `3c0ae6b01c1853d5478b9d0727bc64dba3eb8a12` at main D `1c53833c70ad61a26cbfbc117a040b1f99d33f2e`, PR157 W `dce599916c298098c843813354e8f07474777ffa`, and pre-policy PR158 C `3c102263212ab7bc504260adec5fecb26a8fc981`. This is locked-graph identity, not whole-package or mutable-checkout equality. No package/workspace/lock/Next patch change is included here.

## CI behavior and retained native evidence

Only the existing verify-job dependency audit region and its adjacent evidence upload change. The command remains the full network-backed High-threshold audit, adding documented JSON output:

```text
pnpm audit --audit-level=high --json
```

The shell captures its actual exit code without global ignore flags, threshold reduction, `continue-on-error`, production-only filtering or blanket success. Before classification it writes the untouched full JSON, stderr and exact native exit receipt under `test-results/dependency-audit/`. An always-running upload retains this folder as **native-dependency-audit**, seven days. `decision.json` records either refusal, ordinary High gate qualification, or qualification under the exception. A capture/parser/read/write/upload failure does not authorize success.

The finite inline parser uses the actual pnpm10.24 report shape: `actions`, `advisories`, empty `muted`, and complete `metadata`. It validates the observed nested field sets/types, nonempty finding versions/paths, unique copies and action/path identities, complete action coverage and per-severity counts. Exact pnpm JSON serialization is required; roundtrip mismatch rejects duplicate keys and unsupported serialization. Unknown/provider/error schemas, nonempty stderr, malformed/partial JSON, missing fields, unexpected exits, muted findings, duplicate or inconsistent actions and count mismatches refuse. A native zero cannot override High/Critical rows.

A valid native zero with zero High/Critical findings passes the ordinary High gate, retaining lower findings and using no exception. A native one can qualify under this disposition only when its complete coherent report has exactly the accepted High advisory and both approved copies, no Critical/other High finding, matching graph identities and an unexpired owner-approved window. Unknown IDs/CVEs/package/version/path/range/graph and Critical escalation refuse. Low/moderate findings remain in the full report and visible count summary; they are not relabeled zero findings.

When used, the job log and GitHub step summary explicitly say **EXCEPTION ACTIVE**, list the IDs, versions and expiry, and state **qualified-under-exception; raw audit native exit 1 retained**. Such downstream success means technical qualification under an accepted vulnerability, never an unchanged or clean audit gate.

The [original C run 44244432142](https://github.com/rthunborg/Kopplas/actions/runs/44244432142), attempt 1, verify job 134599876816, stopped at native audit exit 1: **8 findings, 6 moderate and 2 High copies of one displayed advisory**. Type/lint/unit/build and dependent DB/browser qualification did not execute. Its original 29293-byte job log SHA-256 is `6aeef76ec99e64b511d5e602a58af4e646fd853971a46ae66b29a06f83f1eb22`. The separately retained unfiltered W pnpm10.24 JSON is 34674 bytes, native exit 1, SHA-256 `fd8bd5af1746864bccb8e2f16dc415333e339390158a697541d2cb78725a531d`. The current policy was replayed offline against those untouched JSON bytes and correctly returned qualified-under-exception with native exit 1 and all eight findings retained. This was not a fresh audit or a historical CI rerun.

## Actual local verification and remaining qualification

Authoring uses Node `C:/Users/Rasmus/AppData/Local/nvm/v22.23.2/node.exe` and the existing frozen-lockfile pnpm10.24 installation in the isolated checkout. No new install, audit, service, browser, production access, dependency edit or protected-source mutation was performed for this policy.

- Five new policy tests initially passed 5/5. They evaluate the actual inline function extracted from the workflow; the committed fixture preserves actual report schema/IDs/copies/actions/counts while shortening advisory prose.
- The first nine-file run executed 529 tests: 518 passed, 11 failed, zero skipped/cancelled. Nine failures exposed the new inverse running before the existing LF normalizer for raw Windows callers. The correction composes the exact inverse after that normalizer. The other two are the previously reproduced unchanged Windows CRLF migration-source failures, not accepted passes.
- After the correction, all seven contract-consumer files passed **307/307, zero failed/skipped/cancelled**. An intermediate focused run passed 7/8 because the new duplicate-job negative expected only this inverse's error, while the enforced upstream performance guard rejected first. The new assertion now names that actual rejection as well; the rejection requirement remains. Final focused policy/projection checks passed **8/8, zero failed/skipped/cancelled**.
- The existing physical Next glob/lint regression file executed all three tests successfully in the first run. It uses the installed patched helper and real rule consumer; no source change was made there.
- Type checking (`tsc --noEmit --incremental false`) passed. Scoped ESLint passed with zero errors and three existing warnings. Extracted production inline Node syntax and Bash `-n` checks passed. Locked js-yaml parsed the actual workflow and proved the extracted run script and always-upload/seven-day retention fields; the existing lockfile guard passed.
- Seven bounded offline probes exercised the exact production inline entrypoint using exclusive private report/graph copies: known acceptance; native-zero contradiction; empty native receipt; unexpected native two; registry stderr; malformed JSON; ordinary native zero with no exception graph files. Every expected process outcome and decision matched; raw report and native receipt bytes remained intact. The successful probe emitted the required log/step-summary exception wording.

The two unchanged Windows assertions are `new atomic migration cross-validates exact original bodies and eight substitutions without widening historical SQL` and `actual native regression construction uses reversible bootstrap exact predecessor commands and actual owner fragment only`. Their earlier clean-baseline reproduction and first results remain preserved. No assertion or protected migration was normalized or weakened. The actual unchanged assertions must execute on canonical isolated Linux CI; local attribution is not a waiver.

Distinct High source review, the new candidate's ordinary hosted CI/Preview, real production build and full isolated DB/RLS/recovery/browser qualification are still required. No new canonical run has executed for this patch. The existing one exhaustive release checkpoint remains unspent until corrected reviewed-head ordinary verification qualifies. Existing E15 release checks remain unearned where not actually executed, and `release_ready=false` remains correct. Main integration, immutable PR157 base/pin readmission, production/cutover, StageA/package custody, CRM, PR151, scheduler and paused product-writer conditions remain separate.

The frontend visual gate is inapplicable to this CI-policy and documentation change because no rendered application UI is changed. Existing release visual/manual requirements remain separate and unearned; this applicability statement grants no acceptance waiver.

## Removal and ownership

Coordinator/security owner owns the expiry/removal disposition and next deliberate upstream checkpoint; existing StageA/package owner retains complete-fix dependency custody. A complete remedy must cover both affected copies and preserve real Next glob/lint and Vite/Vitest compatibility. This four-path policy does not authorize those package changes or claim that technical qualification grants release approval.

On expiry, withdrawal or a known earlier stop, the High finding blocks again unless a real ordinary audit has no High/Critical findings. Remove this finite region and its exact projection as a reviewed change when the qualified replacement/fix is adopted; retain the dated historical record and original failed findings. Do not silently renew the date, add another advisory or expand the graph.

## Suggested Review Order

Author: `/root/e15_release_wiring_author_high`, Sol High. Refreshed against the final uncommitted four-path policy patch atop `3c102263212ab7bc504260adec5fecb26a8fc981`.

### Preserve the failed native result and enforce the exact acceptance boundary

Follow raw capture into the actual parser, graph and immutable clock window, then the visible exception result and always-retained evidence. No raw failure becomes a clean audit claim.

- `.github/workflows/ci.yml:162` — `Audit dependencies`: captures full audit, stderr and native exit before classification.
- `.github/workflows/ci.yml:176` — `evaluateAuditPolicy`: validates actual schema, counts, IDs, copies and outcome coherence.
- `.github/workflows/ci.yml:258` — `expiresAt`: fixes the owner-approved UTC end without a runtime override.

### Keep unrelated CI contracts observable and prove refusal paths

The single literal inverse is scoped to verify and composed after the existing newline normalizer. Existing hashes, wrapper pin, smoke/exhaustive commands and custody assertions remain untouched.

- `tests/support/calendar-feed-ci-contract.ts:226` — `projectTemporaryPicomatchAudit`: rejects moved, duplicate and edited policy regions.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:4133` — `temporary audit actual classifier`: exercises accepted finding meaning and exact expiry.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:4179` — `temporary audit rejects provider`: rejects incomplete, erroneous and incoherent reports.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:4207` — `temporary audit exact inverse`: preserves strict historical workflow guards and raw-LF/CRLF equivalence.
