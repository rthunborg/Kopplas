# Minimal dependency audit remediation proposal

Status: planning only; no package/lock/source/Spec allocation or install/update.
Root route: plan-native-dependency-audit-repair / security-dependency-bounded-remediation-planner / gpt-6.1-sol High.
Frozen checkpoint: be2c1a535dff0e58b1579fe3db5890c7819916ab; author source: 380c3e720d5caaa1dc2181d70737b9320337f451.

## Recommended candidate and evidence

Pin the existing direct development dependency Vite8.1.0 to exact8.1.6, then regenerate only its required lock graph using the existing pnpm10.24.0. This is the minimum patched release on the current8.1 branch in the [current reviewed advisory](https://github.com/advisories/GHSA-587h-7wmj-h5pm). The [official8.1.6 changelog](https://raw.githubusercontent.com/vitejs/vite/v8.1.6/packages/vite/CHANGELOG.md) explicitly carries launch-editor2.14.2; the current installed Vite bundle contains2.14.1. No separately resolved launch-editor appears in pnpm why. The supported fix must replace the bundle, so a standalone launch-editor override is insufficient.

The advisory applies to a Windows editor-launch path, and this workspace runs on Windows. This establishes an affected tool version, not that the application's production Next server exposes that path or that any exploitation occurred. The Linux CI audit still correctly blocks its high-severity dependency inventory. Do not waive it based on deployment platform.

The candidate keeps Vite's Nodeengine and satisfies installed Vitest4.1.9's Vite range. Published registry metadata and official tagged source agree on8.1.6. This is a compatibility inference, not a successful install/runtime claim. Its runtime requirements raise picomatch4.0.4→at least4.0.5 and rolldown1.1.3→a1.1.5-compatible patch, including coupled platform bindings. Current overridden postcss8.5.23 already satisfies the candidate's lower bound. Actual transitive versions/integrities must come from the admitted pnpm resolution, not this proposal.

## Exact proposed write scope

1. package.json: only devDependencies.vite exact8.1.0→8.1.6. Keep every script, dependency category, other version, packageManager and engines byte/semantic value unchanged.
2. pnpm-lock.yaml: importer vite specifier/resolution and Vitest/mocker Vite peer snapshot keys; Vite package resolution/integrity; Vite snapshot and only necessary transitive picomatch/rolldown/platform-binding packages/snapshots. Preserve lockfileVersion9/settings, all existing overrides and patchedDependencies, unrelated package versions and platform entries. Do not hand-invent integrity hashes. Generated unrelated version churn or another required file is a stop for narrow review/ownership reconciliation.
3. Author Spec: post-kernel evidence/Suggested Review Order only, before source commit; retain in-review and unchanged5760-byte approved kernel. Record dependency/runtime evidence invalidation, exact graph changes, current failure and pending gates. No assertion or feature code changes.

pnpm-workspace.yaml, workflows, configs, test source, production source, .nvmrc, patches, audit threshold and scripts are read-only preserve-unchanged context. package.json is already in current68; pnpm-lock.yaml is a new source-union path, so the exact proposed union would be69. Neither package nor lock is in protected37; no protected109/37 exception is proposed. Existing historical capsules and their old dependency bindings remain immutable. Current shared package/lock and Documents/E16 claims must be reconciled by Root/Coordinator before any writes; clean files or landed stories are not an ownership grant.

## Alternatives and effects

Do not choose a major/minor Vite jump, a Vitest/Next/React upgrade, a launch-editor override, audit ignore/threshold change, or broad dependency refresh. Other patched lines6.4.4/7.3.7/8.2.4/8.3.3 add unnecessary version movement here. The proposal requires no application/schema/data migration, privileges, providers, secrets, resource or workflow effect. Tooling resolution and Vitest transformed execution can change, including intermediate8.1 patch SSR/module-runner fixes, so old native evidence cannot establish current runtime compatibility. The four moderate findings are observed but not identified by the bounded native packet; do not invent their identities or promise they disappear. Preserve the high threshold; newly reported high/critical findings require explicit triage rather than suppression.

## Implementation and validation plan, only after admission

Author changes the one package key, then uses existing pnpm10.24.0 to generate lock metadata with pnpm install --lockfile-only --ignore-scripts. This is a proposed future dependency mutation, not executed here. Review semantic lock graph against the current bound baseline; require one patched Vite resolution for root/Vitest/mocker and no residual affected Vite8.1.0. Preserve all unrelated manifest/script/override/patch values. Validate registry integrity of the patched Vite artifact and installed bundled editor fix after installation. Never edit node_modules to fake the repair.

After Root admits dependency materialization, perform reproducible frozen-lockfile installation using the normal approved script policy, verify:lockfiles, and unchanged pnpm audit --audit-level=high (no ignore/retry-until-green). Run typecheck, lint, existing bounded Node controls including installed reporter/partition contracts, and production build/bundle checks. Do not launch local Vitest collection/globalSetup/DB/browser resources. The actual installed dependency graph must be rebound for review; hardcoded historical node_modules contexts in old prep are not rewritten or reused as new-byte proof.

Append-only exact three-file source commit with mandatory body and native/staged diff checks, then fresh distinct context-free High review of the exact dependency/lock/trail delta under cap3 latest-serious-only policy. Root independently admits the successor source/capsule, pushes one source-equal checkpoint and qualifies fresh normal CI, including frozen install/audit and full native DB/RLS/HTTP/browser/recovery gates. Audit success only permits later gates to run; it does not fix or waive the prior43DB/14browser failures, qualify attachment privacy or establish functional acceptance. No fourth broad review, automatic retry, merge/deploy/DONE/delivery claim.

## Planning evidence and limits

Read-only pnpm why and installed package/bundle inspection establish the current graph; pnpm view establishes candidate public registry metadata. Current primary links/version dates are recorded in primary-sources.json. All proposed-source raw/native-Git-clean/checkpoint bindings are in source-bindings.json. The admitted tenth failure packet is separately hash-bound; no raw native logs/errors/secrets were copied. No install/update/package/lock/source/Spec/test/workflow/provider/CI/resource operation occurred. Only this new proposal directory was written.
