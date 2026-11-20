# Temporary picomatch audit disposition - 2026-11-18

Status: source-only pnpm JSON native-status compatibility correction on S `fe282c326b208788ef94a3717092057ab7e2e91e`, locally verified and pending distinct High review. Both retained F4 audits failed before downstream validation with6 Moderate/0 High/0 Critical and native exit1. This correction preserves those findings and the ordinary High threshold; it does not use, expand or renew the historical temporary risk acceptance. No new hosted qualification, dependency fix, clean audit, production enablement or release approval is claimed.

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

After complete schema/count/action validation, native status must match the total across all five severity levels: native0 iff the total is0, native1 iff it is positive. A coherent report with no High/Critical findings passes the ordinary High gate, including a lower-only report with native1; all lower findings and the actual native result remain visible, with no exception. A report containing High findings can qualify under the temporary disposition only when it has exactly the accepted High advisory and both approved copies, no Critical/other High finding, matching graph identities and an unexpired owner-approved window. Unknown IDs/CVEs/package/version/path/range/graph and Critical escalation refuse. Low/moderate findings remain in the full report and visible count summary; they are not relabeled zero findings.

When used, the job log and GitHub step summary explicitly say **EXCEPTION ACTIVE**, list the IDs, versions and expiry, and state **qualified-under-exception; raw audit native exit 1 retained**. Such downstream success means technical qualification under an accepted vulnerability, never an unchanged or clean audit gate.

The [original C run 44244432142](https://github.com/rthunborg/Kopplas/actions/runs/44244432142), attempt 1, verify job 134599876816, stopped at native audit exit 1: **8 findings, 6 moderate and 2 High copies of one displayed advisory**. Type/lint/unit/build and dependent DB/browser qualification did not execute. Its original 29293-byte job log SHA-256 is `6aeef76ec99e64b511d5e602a58af4e646fd853971a46ae66b29a06f83f1eb22`. The separately retained unfiltered W pnpm10.24 JSON is 34674 bytes, native exit 1, SHA-256 `fd8bd5af1746864bccb8e2f16dc415333e339390158a697541d2cb78725a531d`. The current policy was replayed offline against those untouched JSON bytes and correctly returned qualified-under-exception with native exit 1 and all eight findings retained. This was not a fresh audit or a historical CI rerun.

## Dated JSON-status compatibility update - 2026-11-18

The pinned [pnpm10.24.0 audit implementation](https://github.com/pnpm/pnpm/blob/v10.24.0/lockfile/plugin-commands-audit/src/audit.ts) computes the all-severity vulnerability total and returns the JSON-mode exit status before its human-output audit-level filtering. Therefore `pnpm audit --audit-level=high --json` can legitimately return native1 with only lower-severity findings. The previous ordinary branch required native0 whenever no High/Critical advisory existed; it incorrectly refused that complete coherent lower-only result. Mutable documentation for a different version does not override the pinned implementation. The correction validates native status against the complete total first, then applies the unchanged High/Critical threshold. Empty/native1, lower-only/native0, severe/native0 and every unexpected native status still refuse.

At F4 `f4a40e5984499d3959f3a420c17d07e3d17e0c83`, both [full checkpoint44360769173](https://github.com/rthunborg/Kopplas/actions/runs/44360769173) and [ordinary run44360700647](https://github.com/rthunborg/Kopplas/actions/runs/44360700647), attempt1, failed at `audit-exit-report-conflict`. Their untouched full JSON reports are byte-identical:32235 bytes, SHA-256 `99a8a431ad73cee81bbcc5684b55a8490f47d7ecd62916c079afa356802383c3`,6 Moderate/0 High/0 Critical, empty stderr, native1. Type/lint/unit/build and dependent DB/browser/runtime qualification did not execute for those candidates. In particular, the F4 no-op-filter change and37-frame package earned no runtime credit. Those failures and consumed cases remain immutable; no unchanged retry or new runtime case is authorized here.

Independent High qualification observed that the primary [GHSA-fc5q-39xc-vjpf page](https://github.com/advisories/GHSA-fc5q-39xc-vjpf) marked the advisory withdrawn on November18,2026 and still listed no patched version. The exact registry propagation mechanism/time and withdrawal rationale are not established. Advisory-data withdrawal is not an installed package fix, a clean dependency inventory or proof that indirect runtime exposure is absent. The six Moderate findings remain. The source graph, package versions, historical owner acceptance and fixed November21 expiry are unchanged.

The corrected ordinary log/step summary explicitly retains the actual raw native exit and counts, saying no exception was used. Current lower-only reports qualify the existing High gate, never a clean audit or qualification under the exception. The historical C94 report remains34675 untouched bytes, SHA-256 `b361073b289505792215ae49501cde729f2e3d845f1203c71cdcc1dd7ccc5e66`, native1,6 Moderate/2 High; it still qualifies only under the original exact copy/advisory/graph/window restrictions. At/after expiry, before acceptance, with graph drift or another High/Critical, that High report refuses. A coherent lower-only ordinary result remains independent of that exception window; no risk acceptance was extended.

The compatibility patch owns only the verify audit's native-coherence/ordinary-summary lines, its exact literal projection, focused existing-file regressions and this dated note. Raw capture/stderr/native receipt, full-report retention, always-upload, strict schema/count/action/duplicate checks, wrapper/source pins, other jobs, timeouts and the entire original severe-exception suffix remain unchanged. Canonical S is a separate source checkout; F4 app/test/repair-note content is not imported or edited here. Windows CRLF working graph files remain untouched. Their Git/LF identities and the read-only frozen installation reference match the approved graph; no normalization, install, update, audit, registry or provider call occurred.

| Current compatibility verification | Actual result | Limit |
| --- | --- | --- |
| Focused actual-classifier/projection cases in `with-calendar-feed-runtime.test.ts` | 11 passed,0 failed/skipped/cancelled, including7 policy cases and4 retained projection cases | Tests extract the actual workflow function; committed fixtures are independent of private evidence |
| Seven existing contract-consumer files | 307 passed,0 failed/skipped/cancelled | Existing projection/pin/custody/report consumers; broad unchanged wrapper suite not rerun |
| Private actual-function replay | 23 passed, including untouched F4 full/ordinary and C94 reports, empty0, status contradictions, expiry/graph, malformed/provider/count/action/duplicate and severe refusals | Offline interpretation with fixed historical test clock, no runtime override or fresh audit |
| Extracted actual inline Node entrypoint | 10 process probes passed; raw JSON/native/stderr bytes unchanged; actual ordinary/exception/refusal decisions and log/step summary verified | Private exclusive report/graph copies, no network or hosted qualification |
| Full `tsc --noEmit --incremental false`; two-file scoped ESLint | Both exit0; lint has3 existing warnings,0 errors | No build or browser execution |
| Actual inline Node `--check`, extracted Bash `-n`, locked js-yaml parse and `scripts/verify/check-lockfiles.mjs` | All pass; actual run block and always-upload/seven-day retention verified | Syntax/schema/lock checks, no shell audit execution |
| Exact raw inverses and six protected bindings | All three code preimages reconstruct; native1 severe guard and whole original exception suffix byte-identical | No package/helper/source custody transfer or new resource |

The three code postimages were frozen before this note was refreshed. The initial private replay attempt failed only because js-yaml is a transitive locked dependency rather than a direct root import; its log is retained and earns no verification credit. The corrected private probe uses the existing locked module read-only. Private evidence is supplementary under S-audit-json-compat-author; repository tests require none of it. Current code-review/runtime qualification remains pending. Root alone may publish/integrate a separately qualified candidate and admit a new purpose-bound case. Existing25 release rows remain deferred; the frontend applicability statement here covers this CI-only diff and does not waive the separate post-S application/frontend gates in the F4 repair lineage.

## Historical initial-policy local verification and remaining qualification

Authoring uses Node `C:/Users/Rasmus/AppData/Local/nvm/v22.23.2/node.exe` and the existing frozen-lockfile pnpm10.24 installation in the isolated checkout. No new install, audit, service, browser, production access, dependency edit or protected-source mutation was performed for this policy.

- Five new policy tests initially passed 5/5. They evaluate the actual inline function extracted from the workflow; the committed fixture preserves actual report schema/IDs/copies/actions/counts while shortening advisory prose.
- The first nine-file run executed 529 tests: 518 passed, 11 failed, zero skipped/cancelled. Nine failures exposed the new inverse running before the existing LF normalizer for raw Windows callers. The correction composes the exact inverse after that normalizer. The other two are the previously reproduced unchanged Windows CRLF migration-source failures, not accepted passes.
- After the correction, all seven contract-consumer files passed **307/307, zero failed/skipped/cancelled**. An intermediate focused run passed 7/8 because the new duplicate-job negative expected only this inverse's error, while the enforced upstream performance guard rejected first. The new assertion now names that actual rejection as well; the rejection requirement remains. Final focused policy/projection checks passed **8/8, zero failed/skipped/cancelled**.
- The existing physical Next glob/lint regression file executed all three tests successfully in the first run. It uses the installed patched helper and real rule consumer; no source change was made there.
- Type checking (`tsc --noEmit --incremental false`) passed. Scoped ESLint passed with zero errors and three existing warnings. Extracted production inline Node syntax and Bash `-n` checks passed. Locked js-yaml parsed the actual workflow and proved the extracted run script and always-upload/seven-day retention fields; the existing lockfile guard passed.
- Seven bounded offline probes exercised the exact production inline entrypoint using exclusive private report/graph copies: known acceptance; native-zero contradiction; empty native receipt; unexpected native two; registry stderr; malformed JSON; ordinary native zero with no exception graph files. Every expected process outcome and decision matched; raw report and native receipt bytes remained intact. The successful probe emitted the required log/step-summary exception wording.

The two unchanged Windows assertions are `new atomic migration cross-validates exact original bodies and eight substitutions without widening historical SQL` and `actual native regression construction uses reversible bootstrap exact predecessor commands and actual owner fragment only`. Their earlier clean-baseline reproduction and first results remain preserved. No assertion or protected migration was normalized or weakened. The actual unchanged assertions must execute on canonical isolated Linux CI; local attribution is not a waiver.

At the original policy source freeze, distinct High review and hosted qualification remained pending and the then-recorded exhaustive checkpoint was unspent. These are historical source-freeze statements, not current budget or readiness claims. Subsequent C94/F4 attempts remain bound to their actual candidates and outcomes; this compatibility source grant authorizes no new run or retry. The current changed candidate still requires independent review and any separately admitted appropriate hosted qualification. Existing E15 release checks remain unearned where not executed, and `release_ready=false` remains correct. Main integration, immutable PR157 base/pin readmission, production/cutover, StageA/package custody, CRM, PR151, scheduler and paused product-writer conditions remain separate.

The frontend visual gate is inapplicable to this CI-policy and documentation change because no rendered application UI is changed. Existing release visual/manual requirements remain separate and unearned; this applicability statement grants no acceptance waiver.

## Removal and ownership

Coordinator/security owner owns the expiry/removal disposition and next deliberate upstream checkpoint; existing StageA/package owner retains complete-fix dependency custody. A complete remedy must cover both affected copies and preserve real Next glob/lint and Vite/Vitest compatibility. This four-path policy does not authorize those package changes or claim that technical qualification grants release approval.

On expiry, withdrawal or a known earlier stop, the High finding blocks again unless a real ordinary audit has no High/Critical findings. Remove this finite region and its exact projection as a reviewed change when the qualified replacement/fix is adopted; retain the dated historical record and original failed findings. Do not silently renew the date, add another advisory or expand the graph.

## Suggested Review Order

Author: `/root/e15_release_wiring_author_high`, explicit Sol High. Refreshed after the three-code-file freeze for the four-path JSON-status compatibility correction on S `fe282c326b208788ef94a3717092057ab7e2e91e`. Review targets the current compatibility delta and its guards; original acceptance and historical failures remain intact.

### Validate native status before the unchanged severity decision

Complete schema/count/action validation precedes the all-level total. A lower-only native1 result uses the ordinary High gate and retains native failure/counts; only the existing exact High report can enter the unchanged exception.

- `.github/workflows/ci.yml:240` — `const total`: includes all five severity levels after complete validation.
- `.github/workflows/ci.yml:241` — `nativeExit === (total === 0 ? 0 : 1)`: rejects contradictory status/report pairs.
- `.github/workflows/ci.yml:260` — `expiresAt`: preserves the fixed original owner-approved end.
- `.github/workflows/ci.yml:279` — `raw audit native exit`: makes ordinary retained-native meaning visible.

### Keep the projection strict and prove the compatibility boundaries

The exact literal changes in lockstep with the one verify region; source/helper pins and every other job remain protected. Actual classifier regressions cover both legitimate native1 lower-only results and refused contradictory/malformed/severe reports.

- `tests/support/calendar-feed-ci-contract.ts:228` — `projectTemporaryPicomatchAudit`: retains exact single-region and verify-job scope guards.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:4145` — `coherent lower-only native1`: checks ordinary lower1/empty0, fixed-window independence and contradictions.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:4173` — `lower-only ordinary branch`: keeps schema/action/count/provider refusal before success.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:4240` — `temporary audit exact inverse`: refuses new guard/summary drift alongside existing moved/duplicate/expiry mutations.

### Preserve historical risk and limit the evidence claim

The current raw6-Moderate reports and historical2-High report have distinct meanings.23 pure and10 actual-entrypoint offline probes pass;11 focused tests and307 consumers pass, with type/lint/syntax/YAML/lock checks. No fresh audit, installed remedy, hosted runtime, acceptance or release credit follows.

- `docs/security/temporary-picomatch-audit-disposition-2026-11-18.md:56` — `## Dated JSON-status compatibility update`: preserves failed native evidence and unchanged risk authority.

The fixed2026-11-21 expiry, original graph/copy tuple and owner approval remain unrenewed. Both F4 failures, unexecuted downstream work, original raw audit evidence and all25 deferred release rows remain. Distinct Root Audit High review of this frozen four-path change and separate Root publication/runtime admission are still required. All code stayed frozen while this author note was written; no other checkout, graph, package, helper, app or resource was changed.
