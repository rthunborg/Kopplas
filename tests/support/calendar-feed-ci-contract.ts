import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { projectCiPerformanceChanges } from "./ci-performance-contract";

const wrapperPath = new URL("../../scripts/ci/with-calendar-feed-runtime.mjs", import.meta.url);
const wrapperSha256 = "817cee33139cf84d709cf0c9c061f8ff58faf69363b6bf843dc404b25b86951f";
const integrationArgs = ["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"];
const browserArgs = ["run", "test:smoke"];
const releaseBrowserArgs = ["run", "test:e2e", "--reporter=list,json"];
const stackBinding = "          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}";
const dbEntry = [
  "      - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)",
  "        env:",
  "          # This opt-in alone is insufficient: the wrapper also proves this",
  "          # hosted job's fresh Docker identities, publications and current ledger.",
  stackBinding,
  "        run: |",
  "          node scripts/ci/with-calendar-feed-runtime.mjs db",
  "          pnpm run test:pilot-performance",
].join("\n") + "\n";
const browserEntry = [
  "      - name: Essential authentication smoke (production app and local Auth)",
  "        if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.release_validation) }}",
  "        env:",
  "          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json",
  stackBinding,
  "        run: node scripts/ci/with-calendar-feed-runtime.mjs browser",
].join("\n") + "\n";

// A single reviewed release entry is inverted; every unrelated byte survives.
const releaseBrowserEntry = [
  "      - name: Exhaustive browser validation (explicit opt-in)",
  "        if: ${{ github.event_name == 'workflow_dispatch' && inputs.release_validation }}",
  "        env:",
  "          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json",
  stackBinding,
  "          CALENDAR_FEED_CI_BROWSER_SUITE: release",
  "        run: node scripts/ci/with-calendar-feed-runtime.mjs browser",
].join("\n") + "\n";

// One finite release-only job ceiling is inverted; no other job or byte is normalized.
const releaseBudgetJobEntry = [
  "  e2e:",
  "    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}",
  "    runs-on: ubuntu-24.04",
  "    timeout-minutes: ${{ github.event_name == 'workflow_dispatch' && inputs.release_validation && 50 || 45 }}",
].join("\n") + "\n";
export function projectReleaseBrowserBudget(workflow: string): string {
  workflow = workflow.replaceAll("\r\n", "\n");
  const jobs = [...workflow.matchAll(/^  [A-Za-z0-9_-]+:\n/gm)];
  const owned = jobs.filter(job => job[0] === "  e2e:\n");
  assert.equal(owned.length, 1, "release budget exact e2e job");
  assert.equal(workflow.split(releaseBudgetJobEntry).length - 1, 1, "release budget exact e2e fragment");
  const start = owned[0].index!;
  const end = jobs.find(job => job.index! > start)?.index ?? workflow.length;
  const job = workflow.slice(start, end);
  assert.ok(job.startsWith(releaseBudgetJobEntry), "release budget exact e2e placement");
  assert.equal([...job.matchAll(/^    timeout-minutes:/gm)].length, 1, "release budget one job ceiling");
  return workflow.slice(0, start) + job.replace(releaseBudgetJobEntry, releaseBudgetJobEntry.replace(
    "    timeout-minutes: ${{ github.event_name == 'workflow_dispatch' && inputs.release_validation && 50 || 45 }}\n",
    "    timeout-minutes: 45\n")) + workflow.slice(end);
}

// Finite REL22 fragments only: preserve all unrelated workflow bytes and historical guards.
const rel22WorkflowInverse: readonly [string, string][] = [
  [
    "run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.rel22_capture && format('checkpoint:rel22:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}",
    "run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}"
  ],
  [
    "      release_validation:\n        description: Also run exhaustive browser and dashboard diagnostics\n        type: boolean\n        required: false\n        default: false\n      rel22_capture:\n        description: Preliminary Min dag E01-E08 originals and presentation measurements\n        type: boolean\n        required: false\n        default: false\n  pull_request:",
    "      release_validation:\n        description: Also run exhaustive browser and dashboard diagnostics\n        type: boolean\n        required: false\n        default: false\n  pull_request:"
  ],
  [
    "          RELEASE_VALIDATION: ${{ inputs.release_validation || false }}\n          REL22_CAPTURE: ${{ inputs.rel22_capture || false }}\n          OTHER_DIAGNOSTICS:",
    "          RELEASE_VALIDATION: ${{ inputs.release_validation || false }}\n          OTHER_DIAGNOSTICS:"
  ],
  [
    "          if [ \"$REL22_CAPTURE\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$CAUSE_PROOF\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n          fi\n          if [ \"$CAUSE_PROOF\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n            test \"$REL22_CAPTURE\" = false\n          fi\n",
    "          if [ \"$CAUSE_PROOF\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n          fi\n"
  ],
  [
    "        if: ${{ !(github.event_name == 'workflow_dispatch' && (inputs.release_validation || inputs.rel22_capture)) }}",
    "        if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.release_validation) }}"
  ],
  [
    "      - name: REL22 Min dag capture (explicit fixed opt-in)\n        if: ${{ github.event_name == 'workflow_dispatch' && inputs.rel22_capture }}\n        env:\n          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json\n          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}\n          CALENDAR_FEED_CI_BROWSER_SUITE: rel22\n        run: node scripts/ci/with-calendar-feed-runtime.mjs browser\n\n      - name: Upload native general browser JSON",
    "      - name: Upload native general browser JSON"
  ]
];
export function projectRel22Capture(workflow: string): string {
  let projected = workflow.replaceAll("\r\n", "\n");
  const jobs = [...projected.matchAll(/^  [A-Za-z0-9_-]+:\n/gm)], owned = jobs.filter(job => job[0] === "  e2e:\n");
  assert.equal(owned.length, 1, "REL22 exact e2e job");
  const start = owned[0].index!, end = jobs.find(job => job.index! > start)?.index ?? projected.length;
  assert.ok(projected.slice(start, end).includes("      - name: REL22 Min dag capture (explicit fixed opt-in)\n        if: ${{ github.event_name == 'workflow_dispatch' && inputs.rel22_capture }}\n        env:\n          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json\n          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}\n          CALENDAR_FEED_CI_BROWSER_SUITE: rel22\n        run: node scripts/ci/with-calendar-feed-runtime.mjs browser\n\n"), "REL22 exact e2e entry placement");
  for (const [entry, original] of rel22WorkflowInverse) {
    assert.equal(projected.split(entry).length - 1, 1, "REL22 exact workflow fragment");
    projected = projected.replace(entry, original);
  }
  assert.ok(!projected.includes("rel22_capture"), "REL22 unexpected input or reference");
  return projected;
}

// Exact newly reviewed diagnostic fragments only. Every unrelated byte survives.
const causeProofInverse: readonly [string, string][] = [
  [
    "run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}",
    "run-name: ${{ github.event_name == 'workflow_dispatch' && format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('CI {0}', github.ref_name) }}"
  ],
  [
    "    inputs:\n      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n",
    "    inputs:\n"
  ],
  [
    "          CHECKPOINT_ID: ${{ inputs.checkpoint_id }}\n          CAUSE_PROOF: ${{ inputs.calendar_feed_cause_proof || false }}\n          RELEASE_VALIDATION: ${{ inputs.release_validation || false }}\n          OTHER_DIAGNOSTICS: ${{ inputs.native_stream_probe || inputs.fixed_chromium_paired_probe || inputs.fixed_chromium_application_verification || false }}\n",
    "          CHECKPOINT_ID: ${{ inputs.checkpoint_id }}\n"
  ],
  [
    "          set -euo pipefail\n          if [ \"$CAUSE_PROOF\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n          fi\n          if [ \"$GITHUB_EVENT_NAME\" = workflow_dispatch ]; then",
    "          set -euo pipefail\n          if [ \"$GITHUB_EVENT_NAME\" = workflow_dispatch ]; then"
  ],
  [
    "  recovery-storage-loader:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
    "  recovery-storage-loader:\n"
  ],
  [
    "  e2e:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n    runs-on: ubuntu-24.04\n",
    "  e2e:\n    runs-on: ubuntu-latest\n"
  ],
  [
    "      - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)\n        if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
    "      - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)\n"
  ],
  [
    "      - name: Upload native full integration JSON\n        if: ${{ !cancelled() && !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
    "      - name: Upload native full integration JSON\n        if: ${{ !cancelled() }}\n"
  ],
  [
    "      - name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)\n        if: ${{ github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}\n        env:\n          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}\n          CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT: ${{ inputs.checkpoint_id }}\n        run: node scripts/ci/with-calendar-feed-runtime.mjs cause-proof\n\n      - name: Upload native calendar feed cause proof JSON\n        if: ${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}\n        uses: actions/upload-artifact@v4\n        with:\n          name: native-calendar-feed-cause-proof\n          path: test-results/calendar-feed-cause-proof/upload/\n          retention-days: 7\n          if-no-files-found: error\n\n      # Stage 8: DB-backed integration + cross-tenant RLS-negative suites.\n",
    "      # Stage 8: DB-backed integration + cross-tenant RLS-negative suites.\n"
  ]
];

// Owner-authorized Auth cleanup observation only. Strip exactly this reviewed
// fragment; every unrelated workflow byte still reaches the historical hash.
const authCleanupEntry = "      - name: Capture bounded owned Auth cleanup failure facts\n        if: ${{ failure() && !cancelled() && !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n        timeout-minutes: 1\n        env:\n          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}\n        run: node --experimental-strip-types scripts/ci/auth-cleanup-collector.mjs\n\n      - name: Upload bounded Auth cleanup failure facts\n        if: ${{ failure() && !cancelled() && !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n        uses: actions/upload-artifact@v4\n        with:\n          name: native-auth-cleanup-facts\n          path: test-results/auth-cleanup-facts.json\n          retention-days: 7\n          if-no-files-found: error\n\n";
const authCleanupCollectorSha256 = "0cc442d2dd373cbb6b9cacfc54da50ddc926a8f8d841ffe87ce0d7e2e660cbc9";

// Owner-approved dated security policy: invert only its exact verify-job region.
const temporaryPicomatchAuditEntry = [
  "      # TEMPORARY-PICOMATCH-AUDIT-BEGIN",
  "      - name: Audit dependencies (blocking, high severity)",
  "        run: |",
  "          set -euo pipefail",
  "          mkdir -p test-results/dependency-audit",
  "          if pnpm audit --audit-level=high --json > test-results/dependency-audit/full.json 2> test-results/dependency-audit/stderr.txt; then",
  "            native_exit=0",
  "          else",
  "            native_exit=$?",
  "          fi",
  "          printf '%s\\n' \"$native_exit\" > test-results/dependency-audit/native-exit-code.txt",
  "          node --input-type=module <<'AUDIT_POLICY'",
  "          import { readFileSync, writeFileSync, appendFileSync } from \"node:fs\";",
  "          import { createHash } from \"node:crypto\";",
  "          // AUDIT-POLICY-CLASSIFIER-BEGIN",
  "          function evaluateAuditPolicy(raw, nativeExit, stderr, now, identities) {",
  "            const refuse = code => { throw new Error(code); };",
  "            const require = (condition, code = \"audit-report-schema-refused\") => { if (!condition) refuse(code); };",
  "            const object = value => value !== null && typeof value === \"object\" && !Array.isArray(value);",
  "            const keys = (value, expected) => object(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());",
  "            const integer = value => Number.isSafeInteger(value) && value >= 0;",
  "            const strings = value => Array.isArray(value) && value.every(item => typeof item === \"string\" && item.length > 0);",
  "            require(nativeExit === 0 || nativeExit === 1, \"audit-native-exit-refused\");",
  "            require(typeof stderr === \"string\" && stderr.trim() === \"\", \"audit-stderr-refused\");",
  "            require(typeof raw === \"string\" && raw.length <= 2_000_000);",
  "            let report;",
  "            try { report = JSON.parse(raw); } catch { refuse(\"audit-json-refused\"); }",
  "            // pnpm10.24 emits this serialization. Roundtrip also rejects duplicate JSON keys.",
  "            require(JSON.stringify(report, null, 2) === raw.replaceAll(\"\\r\\n\", \"\\n\").trimEnd(), \"audit-json-shape-refused\");",
  "            require(keys(report, [\"actions\", \"advisories\", \"muted\", \"metadata\"]));",
  "            require(Array.isArray(report.actions) && Array.isArray(report.muted) && report.muted.length === 0 && object(report.advisories));",
  "            require(keys(report.metadata, [\"vulnerabilities\", \"dependencies\", \"devDependencies\", \"optionalDependencies\", \"totalDependencies\"]));",
  "            const levels = [\"info\", \"low\", \"moderate\", \"high\", \"critical\"];",
  "            const counts = report.metadata.vulnerabilities;",
  "            require(keys(counts, levels) && levels.every(level => integer(counts[level])));",
  "            require([\"dependencies\", \"devDependencies\", \"optionalDependencies\", \"totalDependencies\"].every(key => integer(report.metadata[key])));",
  "            require(report.metadata.totalDependencies > 0 && report.metadata.dependencies + report.metadata.devDependencies + report.metadata.optionalDependencies === report.metadata.totalDependencies);",
  "            const observed = Object.fromEntries(levels.map(level => [level, 0]));",
  "            const expectedResolves = new Set();",
  "            const severe = [];",
  "            const advisoryKeys = [\"findings\", \"found_by\", \"deleted\", \"references\", \"created\", \"id\", \"npm_advisory_id\", \"overview\", \"reported_by\", \"title\", \"metadata\", \"cves\", \"access\", \"severity\", \"module_name\", \"vulnerable_versions\", \"github_advisory_id\", \"recommendation\", \"patched_versions\", \"updated\", \"cvss\", \"cwe\", \"url\"];",
  "            for (const [id, advisory] of Object.entries(report.advisories)) {",
  "              require(keys(advisory, advisoryKeys) && integer(advisory.id) && advisory.id > 0 && String(advisory.id) === id);",
  "              require([\"found_by\", \"deleted\", \"npm_advisory_id\", \"reported_by\", \"metadata\"].every(key => advisory[key] === null));",
  "              require([\"references\", \"created\", \"overview\", \"title\", \"access\", \"module_name\", \"vulnerable_versions\", \"github_advisory_id\", \"recommendation\", \"patched_versions\", \"updated\", \"url\"].every(key => typeof advisory[key] === \"string\" && advisory[key].length > 0));",
  "              require(levels.includes(advisory.severity) && /^GHSA-[a-z0-9]{4}-[a-z0-9]{4}-[a-z0-9]{4}$/.test(advisory.github_advisory_id));",
  "              require(strings(advisory.cves) && advisory.cves.every(cve => /^CVE-\\d{4}-\\d{4,}$/.test(cve)));",
  "              require(strings(advisory.cwe) && advisory.cwe.every(cwe => /^CWE-\\d+$/.test(cwe)));",
  "              require(keys(advisory.cvss, [\"score\", \"vectorString\"]) && Number.isFinite(advisory.cvss.score) && advisory.cvss.score >= 0 && advisory.cvss.score <= 10",
  "                && (advisory.cvss.vectorString === null || typeof advisory.cvss.vectorString === \"string\"));",
  "              require(Array.isArray(advisory.findings) && advisory.findings.length > 0);",
  "              const versions = new Set();",
  "              for (const finding of advisory.findings) {",
  "                require(keys(finding, [\"version\", \"paths\"]) && typeof finding.version === \"string\" && /^\\d+\\.\\d+\\.\\d+(?:[-+][0-9A-Za-z.-]+)?$/.test(finding.version));",
  "                require(!versions.has(finding.version)); versions.add(finding.version);",
  "                require(strings(finding.paths) && finding.paths.length > 0 && new Set(finding.paths).size === finding.paths.length);",
  "                for (const path of finding.paths) {",
  "                  require(/^\\.(?:>[A-Za-z0-9@/_.+-]+)+$/.test(path));",
  "                  const resolve = JSON.stringify([advisory.id, advisory.module_name, path]);",
  "                  require(!expectedResolves.has(resolve)); expectedResolves.add(resolve);",
  "                }",
  "                observed[advisory.severity]++;",
  "              }",
  "              if (advisory.severity === \"high\" || advisory.severity === \"critical\") severe.push(advisory);",
  "            }",
  "            require(levels.every(level => counts[level] === observed[level]), \"audit-count-refused\");",
  "            const actualResolves = new Set(), modules = new Set();",
  "            for (const action of report.actions) {",
  "              require(keys(action, [\"action\", \"module\", \"resolves\"]) && action.action === \"review\" && typeof action.module === \"string\" && !modules.has(action.module));",
  "              modules.add(action.module); require(Array.isArray(action.resolves) && action.resolves.length > 0);",
  "              for (const resolve of action.resolves) {",
  "                require(keys(resolve, [\"id\", \"path\", \"dev\", \"optional\", \"bundled\"]) && integer(resolve.id) && typeof resolve.path === \"string\"",
  "                  && [\"dev\", \"optional\", \"bundled\"].every(key => typeof resolve[key] === \"boolean\"));",
  "                const identity = JSON.stringify([resolve.id, action.module, resolve.path]);",
  "                require(expectedResolves.has(identity) && !actualResolves.has(identity)); actualResolves.add(identity);",
  "              }",
  "            }",
  "            require(actualResolves.size === expectedResolves.size, \"audit-actions-incomplete\");",
  "            // Pinned pnpm10.24 JSON exits on all severities before applying audit-level.",
  "            const total = levels.reduce((sum, level) => sum + counts[level], 0);",
  "            require(nativeExit === (total === 0 ? 0 : 1), \"audit-exit-report-conflict\");",
  "            if (severe.length === 0) {",
  "              return { schemaVersion: 1, outcome: \"ordinary-high-gate\", nativeExitCode: nativeExit, counts };",
  "            }",
  "            require(nativeExit === 1, \"audit-exit-report-conflict\");",
  "            require(severe.length === 1 && counts.high === 2 && counts.critical === 0, \"audit-other-high-critical-refused\");",
  "            const known = severe[0];",
  "            require(known.id === 1247710 && known.github_advisory_id === \"GHSA-fc5q-39xc-vjpf\" && known.module_name === \"picomatch\" && known.severity === \"high\"",
  "              && JSON.stringify(known.cves) === '[\"CVE-2026-112366\"]' && known.url === \"https://github.com/advisories/GHSA-fc5q-39xc-vjpf\"",
  "              && known.vulnerable_versions === \"<=4.0.7\" && known.patched_versions === \"<0.0.0\", \"audit-advisory-refused\");",
  "            const copies = { \"4.0.4\": \".>eslint-config-next>@next/eslint-plugin-next>tinyglobby>picomatch\", \"4.0.7\": \".>vite>picomatch\" };",
  "            require(known.findings.length === 2 && known.findings.every(finding => Object.hasOwn(copies, finding.version)",
  "              && JSON.stringify(finding.paths) === JSON.stringify([copies[finding.version]])), \"audit-copyset-refused\");",
  "            const graph = {",
  "              \"pnpm-lock.yaml\": \"2c0502dba5caf17bb8851a849bb4b85b0039bf5d8da35b965412a6d78e7fee95\",",
  "              \"pnpm-workspace.yaml\": \"6464c218bc0c2e87d8ad7bac5c641491a3d056b6247ef643aef2376f3e07f66d\",",
  "              \"patches/@next__eslint-plugin-next@16.3.6.patch\": \"88513a4345d44468acd514beee604f895a6d6d2b61ebe4ee4ab8972de663385e\",",
  "            };",
  "            require(keys(identities, Object.keys(graph)) && Object.entries(graph).every(([path, hash]) => identities[path] === hash), \"audit-graph-refused\");",
  "            const expiresAt = \"2026-11-21T00:00:00Z\";",
  "            require(Number.isFinite(now) && now >= Date.parse(\"2026-11-18T09:52:14.240Z\") && now < Date.parse(expiresAt), \"audit-exception-expired-or-clock-refused\");",
  "            return { schemaVersion: 1, outcome: \"qualified-under-exception\", nativeExitCode: nativeExit, counts,",
  "              ghsa: \"GHSA-fc5q-39xc-vjpf\", cve: \"CVE-2026-112366\", versions: [\"4.0.4\", \"4.0.7\"], expiresAt,",
  "              ownerApprovalSha256: \"313e86e5e740bcf06a98290789aec04ddb2f500c30088420ce1d8eea9dbbe411\", graph };",
  "          }",
  "          // AUDIT-POLICY-CLASSIFIER-END",
  "          const folder = \"test-results/dependency-audit\";",
  "          try {",
  "            const nativeText = readFileSync(`${folder}/native-exit-code.txt`, \"utf8\");",
  "            if (!/^[01]\\n$/.test(nativeText)) throw new Error(\"audit-native-receipt-refused\");",
  "            // A genuine native-zero ordinary gate never depends on exception graph files.",
  "            const identities = nativeText === \"1\\n\" ? Object.fromEntries([\"pnpm-lock.yaml\", \"pnpm-workspace.yaml\", \"patches/@next__eslint-plugin-next@16.3.6.patch\"].map(path =>",
  "              [path, createHash(\"sha256\").update(readFileSync(path, \"utf8\").replaceAll(\"\\r\\n\", \"\\n\")).digest(\"hex\")])) : {};",
  "            const result = evaluateAuditPolicy(readFileSync(`${folder}/full.json`, \"utf8\"), Number(nativeText.trim()),",
  "              readFileSync(`${folder}/stderr.txt`, \"utf8\"), Date.now(), identities);",
  "            writeFileSync(`${folder}/decision.json`, JSON.stringify(result, null, 2) + \"\\n\");",
  "            const message = result.outcome === \"qualified-under-exception\"",
  "              ? `EXCEPTION ACTIVE: ${result.ghsa} / ${result.cve}, picomatch ${result.versions.join(\", \")}, expires ${result.expiresAt}; qualified-under-exception; raw audit native exit 1 retained. Counts: ${JSON.stringify(result.counts)}.`",
  "              : `Ordinary High/Critical audit gate passed (no exception used); raw audit native exit ${result.nativeExitCode} retained. Counts: ${JSON.stringify(result.counts)}.`;",
  "            console.log(message);",
  "            appendFileSync(process.env.GITHUB_STEP_SUMMARY, message + \"\\n\");",
  "          } catch {",
  "            writeFileSync(`${folder}/decision.json`, JSON.stringify({ schemaVersion: 1, outcome: \"refused\", rawAuditRetained: true }) + \"\\n\");",
  "            console.error(\"Dependency audit policy REFUSED; inspect retained full report, native exit, stderr and dated security disposition.\");",
  "            process.exitCode = 1;",
  "          }",
  "          AUDIT_POLICY",
  "",
  "      - name: Retain full native dependency audit and policy decision",
  "        if: ${{ always() }}",
  "        uses: actions/upload-artifact@v4",
  "        with:",
  "          name: native-dependency-audit",
  "          path: test-results/dependency-audit/",
  "          retention-days: 7",
  "          if-no-files-found: error",
  "      # TEMPORARY-PICOMATCH-AUDIT-END",
].join("\n") + "\n";

function projectTemporaryPicomatchAudit(workflow: string): string {
  const jobs = [...workflow.matchAll(/^  ([A-Za-z0-9_-]+):\n/gm)];
  const verify = jobs.filter(match => match[1] === "verify");
  assert.equal(verify.length, 1, "temporary picomatch exact verify job");
  const start = verify[0].index!;
  const end = jobs.find(match => match.index! > start)?.index ?? workflow.length;
  const job = workflow.slice(start, end);
  for (const marker of ["# TEMPORARY-PICOMATCH-AUDIT-BEGIN", "# TEMPORARY-PICOMATCH-AUDIT-END"]) {
    assert.equal(workflow.split(marker).length - 1, 1, "temporary picomatch exact single region");
  }
  assert.equal(workflow.split(temporaryPicomatchAuditEntry).length - 1, 1, "temporary picomatch exact audit policy region");
  assert.equal(job.split(temporaryPicomatchAuditEntry).length - 1, 1, "temporary picomatch exact verify-job audit region");
  return workflow.slice(0, start) + job.replace(temporaryPicomatchAuditEntry,
    "      - name: Audit dependencies (blocking, high severity)\n        run: pnpm audit --audit-level=high\n") + workflow.slice(end);
}

const dbStartupFactsEntry = [
  "      # DB-STARTUP-CLOSED-FACTS-BEGIN",
  "      - name: Start local Supabase stack",
  "        env:",
  "          DB_STARTUP_FACTS_SOURCE: ${{ github.event.pull_request.head.sha || github.sha }}",
  "        run: |",
  "          node --input-type=module <<'DB_STARTUP_FACTS'",
  "          import { spawn } from \"node:child_process\";",
  "          import { constants } from \"node:os\";",
  "          // DB-STARTUP-FACTS-CODE-BEGIN",
  "          function startupBinding(env) {",
  "            const source = env.DB_STARTUP_FACTS_SOURCE, run = env.GITHUB_RUN_ID, attempt = env.GITHUB_RUN_ATTEMPT;",
  "            if (![source, run, attempt].every(value => typeof value === \"string\") || !/^[0-9a-f]{40}$/.test(source ?? \"\") || !/^[1-9][0-9]{0,19}$/.test(run ?? \"\") || !/^[1-9][0-9]{0,9}$/.test(attempt ?? \"\") || env.GITHUB_JOB !== \"db\") return null;",
  "            return { source, run, attempt, job: \"db\" };",
  "          }",
  "          function unavailableStartupFacts(binding, phase, status = \"UNAVAILABLE\") {",
  "            return { schemaVersion: 1, ...binding, phase, port: 54322, socketStatus: \"UNAVAILABLE\", bindCategory: \"UNKNOWN\",",
  "              matchingPublicationCount: 0, candidates: [], ownership: \"UNVERIFIED\", collectionStatus: status };",
  "          }",
  "          async function collectDbStartupFacts(ports, binding, phase, startedAt) {",
  "            const record = { schemaVersion: 1, ...binding, phase, port: 54322, socketStatus: \"UNAVAILABLE\", bindCategory: \"UNKNOWN\",",
  "              matchingPublicationCount: 0, candidates: [], ownership: \"UNVERIFIED\", collectionStatus: \"UNAVAILABLE\" };",
  "            // Reserve16KiB for the isolated worker's own stdout/stderr: aggregate phase I/O stays <=1MiB.",
  "            const byteLimit = 1_048_576 - 16_384, began = ports.clock(); let bytes = 0, attempts = 0;",
  "            const check = () => { if (bytes > byteLimit) throw \"TRUNCATED\"; if (ports.clock() - began >= 4500) throw \"TIMED_OUT\"; };",
  "            const keys = (x, expected) => x !== null && typeof x === \"object\" && !Array.isArray(x) && JSON.stringify(Object.keys(x).sort()) === JSON.stringify([...expected].sort());",
  "            const category = ip => ip === \"\" || ip === \"*\" || ip === \"0.0.0.0\" || ip === \"::\" ? \"WILDCARD\"",
  "              : ip === \"::1\" || (ports.isIP(ip) === 4 && ip.startsWith(\"127.\")) ? \"LOOPBACK\" : ports.isIP(ip) ? \"OTHER\" : null;",
  "            const merge = values => values.length && values.every(x => x === values[0]) ? values[0] : \"UNKNOWN\";",
  "            const run = (command, args) => new Promise(resolve => {",
  "              let child, active = true, chunks = [], stderr = false, failed = false;",
  "              const finish = () => { if (!active) return; active = false; const out = !failed && !stderr ? Buffer.concat(chunks).toString(\"utf8\") : null; chunks = []; resolve(out); };",
  "              const data = (chunk, isError) => {",
  "                if (!active || failed) return;",
  "                try {",
  "                  check(); const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); bytes += value.length;",
  "                  if (bytes > byteLimit) { record.collectionStatus = \"TRUNCATED\"; failed = true; chunks = []; try { child.kill(\"SIGKILL\"); } catch {} return; }",
  "                  if (isError) stderr = stderr || value.length > 0; else chunks.push(value);",
  "                } catch (status) { record.collectionStatus = status === \"TIMED_OUT\" ? \"TIMED_OUT\" : \"UNAVAILABLE\"; failed = true; chunks = []; try { child.kill(\"SIGKILL\"); } catch {} }",
  "              };",
  "              try {",
  "                check(); child = ports.spawn(command, args, { stdio: [\"ignore\", \"pipe\", \"pipe\"] });",
  "                child.stdout.on(\"data\", chunk => data(chunk, false)); child.stderr.on(\"data\", chunk => data(chunk, true));",
  "                child.stdout.on(\"error\", () => { failed = true; }); child.stderr.on(\"error\", () => { failed = true; });",
  "                child.on(\"error\", () => { failed = true; finish(); });",
  "                child.on(\"close\", code => { if (code !== 0) failed = true; finish(); });",
  "              } catch { failed = true; finish(); }",
  "            });",
  "            try {",
  "              const socket = await run(\"ss\", [\"-H\", \"-ltn\", \"( sport = :54322 )\"]); check();",
  "              if (socket !== null) {",
  "                const categories = [];",
  "                for (const line of socket.trim().split(\"\\n\").filter(Boolean)) {",
  "                  check(); const parts = line.trim().split(/\\s+/);",
  "                  if (parts.length !== 5 || parts[0] !== \"LISTEN\" || !/^\\d+$/.test(parts[1]) || !/^\\d+$/.test(parts[2])) throw \"UNAVAILABLE\";",
  "                  const match = /^(?:\\[([^\\]]+)\\]|([^\\[\\]]+)):54322$/.exec(parts[3]);",
  "                  const peer = /^(?:\\[([^\\]]+)\\]|([^\\[\\]]+)):(\\*|[0-9]{1,5})$/.exec(parts[4]);",
  "                  const kind = match && category(match[1] ?? match[2]);",
  "                  if (!kind || !peer || category(peer[1] ?? peer[2]) === null || peer[3] !== \"*\" && Number(peer[3]) > 65535) throw \"UNAVAILABLE\"; categories.push(kind);",
  "                }",
  "                record.socketStatus = categories.length ? \"LISTENING\" : \"NOT_OBSERVED\"; record.bindCategory = merge(categories);",
  "              }",
  "              // Fixed filter is INCOMPLETE candidate hints, never a complete host inventory or absence proof.",
  "              const list = await run(\"docker\", [\"container\", \"ls\", \"--all\", \"--filter\", \"publish=54322\", \"--format\", \"{{.ID}}\"]); check();",
  "              let ids = [];",
  "              if (list !== null) {",
  "                ids = list.trim().split(\"\\n\").filter(Boolean);",
  "                if (ids.some(id => !/^(?:[0-9a-f]{12}|[0-9a-f]{64})$/.test(id)) || new Set(ids).size !== ids.length) throw \"UNAVAILABLE\";",
  "                if (ids.length > 8) record.collectionStatus = \"TRUNCATED\"; ids = ids.slice(0, 8);",
  "              }",
  "              const inspect = async id => {",
  "                check(); if (attempts >= 8) return; attempts++;",
  "                const raw = await run(\"docker\", [\"container\", \"inspect\", \"--format\", '{\"Created\":{{json .Created}},\"Status\":{{json .State.Status}},\"PortBindings\":{{json .HostConfig.PortBindings}}}', id]); check();",
  "                if (raw === null) return;",
  "                let item; try { item = JSON.parse(raw); if (JSON.stringify(item) !== raw.trim()) throw \"UNAVAILABLE\"; } catch { throw \"UNAVAILABLE\"; }",
  "                if (!keys(item, [\"Created\", \"Status\", \"PortBindings\"]) || ![\"created\", \"restarting\", \"running\", \"removing\", \"paused\", \"exited\", \"dead\"].includes(item.Status)",
  "                  || typeof item.Created !== \"string\" || !/^\\d{4}-\\d\\d-\\d\\dT\\d\\d:\\d\\d:\\d\\d(?:\\.\\d{1,9})?Z$/.test(item.Created) || !Number.isFinite(Date.parse(item.Created))) throw \"UNAVAILABLE\";",
  "                if (item.PortBindings !== null && (typeof item.PortBindings !== \"object\" || Array.isArray(item.PortBindings))) throw \"UNAVAILABLE\";",
  "                let matched = false;",
  "                for (const [port, bindings] of Object.entries(item.PortBindings ?? {})) {",
  "                  check(); if (!/^[1-9][0-9]{0,4}\\/(?:tcp|udp)$/.test(port) || Number(port.split(\"/\")[0]) > 65535 || !Array.isArray(bindings)) throw \"UNAVAILABLE\";",
  "                  for (const value of bindings) {",
  "                    check(); if (!keys(value, [\"HostIp\", \"HostPort\"]) || typeof value.HostIp !== \"string\" || typeof value.HostPort !== \"string\" || category(value.HostIp) === null",
  "                      || !/^(?:|[1-9][0-9]{0,4})$/.test(value.HostPort) || Number(value.HostPort) > 65535) throw \"UNAVAILABLE\";",
  "                    if (port.endsWith(\"/tcp\") && value.HostPort === \"54322\") matched = true;",
  "                  }",
  "                }",
  "                if (matched) {",
  "                  const created = Date.parse(item.Created), now = ports.wall();",
  "                  const creationRelation = Number.isFinite(startedAt) && created < startedAt ? \"PREEXISTING\"",
  "                    : phase === \"POST_FAILURE\" && Number.isFinite(startedAt) && created > startedAt && created < now ? \"DURING_START\"",
  "                    : phase === \"PRE_START\" && created < now ? \"PREEXISTING\" : \"UNKNOWN\";",
  "                  record.candidates.push({ ordinal: attempts, state: item.Status.toUpperCase(), creationRelation, ownership: \"UNVERIFIED\" }); record.matchingPublicationCount++;",
  "                }",
  "              };",
  "              for (const id of ids) { await inspect(id); check(); }",
  "              if (phase === \"POST_FAILURE\" && record.matchingPublicationCount === 0 && attempts < 8) await inspect(\"supabase_db_kopplas\");",
  "              check();",
  "            } catch (status) { if (record.collectionStatus !== \"TRUNCATED\") record.collectionStatus = status === \"TIMED_OUT\" ? \"TIMED_OUT\" : \"UNAVAILABLE\"; }",
  "            return record;",
  "          }",
  "          function validatedStartupFacts(raw, binding, phase) {",
  "            const fallback = unavailableStartupFacts(binding, phase);",
  "            try {",
  "              if (Buffer.byteLength(raw) > 8192) return fallback;",
  "              const x = JSON.parse(raw); if (JSON.stringify(x) !== raw.trim()) return fallback;",
  "              const keys = (value, expected) => value !== null && typeof value === \"object\" && !Array.isArray(value) && JSON.stringify(Object.keys(value).sort()) === JSON.stringify([...expected].sort());",
  "              if (!keys(x, Object.keys(fallback)) || x.schemaVersion !== 1 || x.source !== binding.source || x.run !== binding.run || x.attempt !== binding.attempt || x.job !== \"db\" || x.phase !== phase || x.port !== 54322",
  "                || ![\"LISTENING\", \"NOT_OBSERVED\", \"UNAVAILABLE\"].includes(x.socketStatus) || ![\"LOOPBACK\", \"WILDCARD\", \"OTHER\", \"UNKNOWN\"].includes(x.bindCategory)",
  "                || ![\"UNAVAILABLE\", \"TRUNCATED\", \"TIMED_OUT\"].includes(x.collectionStatus) || x.ownership !== \"UNVERIFIED\" || !Array.isArray(x.candidates) || x.candidates.length > 8",
  "                || !Number.isInteger(x.matchingPublicationCount) || x.matchingPublicationCount !== x.candidates.length) return fallback;",
  "              let previous = 0;",
  "              for (const row of x.candidates) {",
  "                if (!keys(row, [\"ordinal\", \"state\", \"creationRelation\", \"ownership\"]) || !Number.isInteger(row.ordinal) || row.ordinal <= previous || row.ordinal > 8 || row.ownership !== \"UNVERIFIED\"",
  "                  || ![\"CREATED\", \"RESTARTING\", \"RUNNING\", \"REMOVING\", \"PAUSED\", \"EXITED\", \"DEAD\"].includes(row.state) || ![\"PREEXISTING\", \"DURING_START\", \"UNKNOWN\"].includes(row.creationRelation)) return fallback;",
  "                previous = row.ordinal;",
  "              }",
  "              return x;",
  "            } catch { return fallback; }",
  "          }",
  "          async function observeDbStartupPhase(ports, binding, phase, startedAt) {",
  "            const began = ports.clock();",
  "            const fallback = status => unavailableStartupFacts(binding, phase, status);",
  "            // This isolated child group contains ONLY the collector and its read-only ss/Docker CLI children.",
  "            const program = 'const {spawn}=require(\"node:child_process\");const {isIP}=require(\"node:net\");(' + collectDbStartupFacts.toString()",
  "              + ')({spawn,isIP,clock:()=>performance.now(),wall:()=>Date.now()},' + JSON.stringify(binding) + ',' + JSON.stringify(phase) + ',' + JSON.stringify(startedAt)",
  "              + ').then(value=>process.stdout.write(JSON.stringify(value)),()=>process.stdout.write(' + JSON.stringify(JSON.stringify(fallback(\"UNAVAILABLE\"))) + '));';",
  "            return await new Promise(resolve => {",
  "              let child, soft, hard, active = true, chunks = [], bytes = 0, status = null;",
  "              const kill = () => { try { if (Number.isSafeInteger(child?.pid) && child.pid > 1) ports.killGroup(child.pid); else child?.kill(\"SIGKILL\"); } catch { status = status ?? \"UNAVAILABLE\"; } };",
  "              const finish = value => {",
  "                if (!active) return; active = false; try { ports.clear(soft); } catch {} try { ports.clear(hard); } catch {}",
  "                chunks = []; try { child?.stdout.destroy(); } catch {} try { child?.stderr.destroy(); } catch {} try { child?.unref(); } catch {} resolve(value);",
  "              };",
  "              try {",
  "                child = ports.spawn(ports.execPath, [\"-e\", program], { detached: true, stdio: [\"ignore\", \"pipe\", \"pipe\"] });",
  "                const data = (chunk, stderr) => {",
  "                  if (!active || status) return;",
  "                  try {",
  "                    const value = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk); bytes += value.length;",
  "                    if (bytes > 16_384 || stderr && value.length) { status = bytes > 16_384 ? \"TRUNCATED\" : \"UNAVAILABLE\"; chunks = []; kill(); }",
  "                    else chunks.push(value);",
  "                  } catch { status = \"UNAVAILABLE\"; chunks = []; kill(); }",
  "                };",
  "                child.stdout.on(\"data\", chunk => data(chunk, false)); child.stderr.on(\"data\", chunk => data(chunk, true));",
  "                child.stdout.on(\"error\", () => { if (active) { status = status ?? \"UNAVAILABLE\"; kill(); } }); child.stderr.on(\"error\", () => { if (active) { status = status ?? \"UNAVAILABLE\"; kill(); } });",
  "                child.on(\"error\", () => { if (active) { kill(); finish(fallback(status ?? \"UNAVAILABLE\")); } });",
  "                child.on(\"close\", code => {",
  "                  if (!active) return;",
  "                  try {",
  "                    if (code !== 0 || status || ports.clock() - began >= 5000) finish(fallback(status ?? (ports.clock() - began >= 5000 ? \"TIMED_OUT\" : \"UNAVAILABLE\")));",
  "                    else { const value = validatedStartupFacts(Buffer.concat(chunks).toString(\"utf8\"), binding, phase); finish(ports.clock() - began < 5000 ? value : fallback(\"TIMED_OUT\")); }",
  "                  } catch { finish(fallback(\"UNAVAILABLE\")); }",
  "                });",
  "                // Reserve200ms for group termination, owned-child close/stream settlement and bounded8KiB parse.",
  "                soft = ports.timer(() => { if (active) { status = status ?? \"TIMED_OUT\"; chunks = []; kill(); } }, Math.max(0, 4800 - (ports.clock() - began)));",
  "                hard = ports.timer(() => { if (active) { status = status ?? \"TIMED_OUT\"; kill(); finish(fallback(status)); } }, Math.max(0, 5000 - (ports.clock() - began)));",
  "              } catch { kill(); finish(fallback(\"UNAVAILABLE\")); }",
  "            });",
  "          }",
  "          async function runDbStartupBoundary(ports, binding) {",
  "            const observe = async (phase, startedAt) => {",
  "              if (!binding) return;",
  "              try { const value = await ports.collect(binding, phase, startedAt); try { ports.record(value); } catch {} } catch {}",
  "            };",
  "            await observe(\"PRE_START\", null);",
  "            let startedAt = null; try { startedAt = ports.wall(); } catch {}",
  "            const nativeExit = await ports.start();",
  "            if (nativeExit !== 0) await observe(\"POST_FAILURE\", startedAt);",
  "            return nativeExit;",
  "          }",
  "          // DB-STARTUP-FACTS-CODE-END",
  "          const binding = startupBinding(process.env);",
  "          const nativeExit = await runDbStartupBoundary({",
  "            wall: () => Date.now(), record: value => console.log(JSON.stringify(value)),",
  "            collect: (bound, phase, startedAt) => observeDbStartupPhase({ spawn, execPath: process.execPath, clock: () => performance.now(), timer: setTimeout, clear: clearTimeout,",
  "              killGroup: pid => process.kill(-pid, \"SIGKILL\") }, bound, phase, startedAt),",
  "            start: () => new Promise(resolve => {",
  "              let child;",
  "              try {",
  "                child = spawn(\"supabase\", [\"start\"], { stdio: \"inherit\" });",
  "                child.on(\"error\", error => resolve(error.code === \"ENOENT\" ? 127 : error.code === \"EACCES\" ? 126 : 1));",
  "                child.on(\"close\", (code, signal) => resolve(code ?? (constants.signals[signal] ? 128 + constants.signals[signal] : 1)));",
  "              } catch { resolve(1); }",
  "            }),",
  "          }, binding);",
  "          process.exitCode = nativeExit;",
  "          DB_STARTUP_FACTS",
  "      # DB-STARTUP-CLOSED-FACTS-END",
].join("\n") + "\n";

function projectDbStartupFacts(workflow: string): string {
  const jobs = [...workflow.matchAll(/^  ([A-Za-z0-9_-]+):\n/gm)];
  const db = jobs.filter(match => match[1] === "db");
  assert.equal(db.length, 1, "DB startup facts exact single db job");
  const start = db[0].index!, end = jobs.find(match => match.index! > start)?.index ?? workflow.length;
  const job = workflow.slice(start, end);
  for (const marker of ["# DB-STARTUP-CLOSED-FACTS-BEGIN", "# DB-STARTUP-CLOSED-FACTS-END"]) {
    assert.equal(workflow.split(marker).length - 1, 1, "DB startup facts exact single region");
  }
  assert.equal(workflow.split(dbStartupFactsEntry).length - 1, 1, "DB startup facts exact workflow fragment");
  assert.equal(job.split(dbStartupFactsEntry).length - 1, 1, "DB startup facts exact db fragment");
  return workflow.slice(0, start) + job.replace(dbStartupFactsEntry,
    "      - name: Start local Supabase stack\n        run: supabase start\n") + workflow.slice(end);
}

const storageSourceStartEntry = "      - name: Start local schema source\n        run: supabase start --exclude mailpit\n";
const historicalStorageSourceStartEntry = "      - name: Start local schema source\n        run: supabase start\n";

// Only this job's reviewed schema-source command is inverted. Commands or
// changes elsewhere remain visible to the historical workflow hash.
function projectStorageSourceMailExclusion(workflow: string): string {
  const jobs = [...workflow.matchAll(/^  ([A-Za-z0-9_-]+):\n/gm)];
  const storageJobs = jobs.filter(match => match[1] === "recovery-storage-loader");
  assert.equal(storageJobs.length, 1, "Storage source exact workflow job");
  const start = storageJobs[0].index!;
  const end = jobs.find(match => match.index! > start)?.index ?? workflow.length;
  const job = workflow.slice(start, end);
  assert.equal(job.split(storageSourceStartEntry).length - 1, 1, "Storage source exact mail-exclusion workflow fragment");
  return workflow.slice(0, start)
    + job.replace(storageSourceStartEntry, historicalStorageSourceStartEntry)
    + workflow.slice(end);
}

function literalArgs(source: string, name: string, expected: string[]): string[] {
  const declarations = [...source.matchAll(new RegExp(`^export const ${name} = Object\\.freeze\\((\\[[^\\n]*\\])\\);$`, "gm"))];
  assert.equal(declarations.length, 1, `calendar feed CI ${name} declaration`);
  const args: unknown = JSON.parse(declarations[0][1]);
  assert.deepEqual(args, expected, `calendar feed CI ${name} argv`);
  return args as string[];
}

/**
 * Expose the real delegated commands to existing CI contract checks. Only the
 * fixed wrapper entries and finite diagnostic fragments are inverted; all other bytes survive.
 * Reading pinned source (never importing/evaluating it) also rejects unrelated
 * wrapper edits instead of granting them the historical workflow inverse.
 */
export function projectCalendarFeedCiCommands(workflow: string, wrapperSource = readFileSync(wrapperPath, "utf8")): string {
  const source = wrapperSource.replaceAll("\r\n", "\n");
  const integration = literalArgs(source, "INTEGRATION_ARGS", integrationArgs);
  const browser = literalArgs(source, "BROWSER_ARGS", browserArgs);
  const releaseBrowser = literalArgs(source, "RELEASE_BROWSER_ARGS", releaseBrowserArgs);
  literalArgs(source, "REL22_BROWSER_ARGS", ["exec", "playwright", "test", "tests/e2e/my-day.e2e.spec.ts", "--project=chromium", "--grep", "15[.]6-E0[1-8]\\b", "--workers=1", "--retries=1", "--reporter=list,json", "--trace=off"]);
  assert.equal(createHash("sha256").update(source).digest("hex"), wrapperSha256, "calendar feed CI reviewed wrapper source");
  literalArgs(source, "CAUSE_PROOF_ARGS", ["exec","vitest","run","tests/integration/commands/calendar-feed.int.test.ts","--maxWorkers=1","--no-file-parallelism","--testNamePattern=^15[.]5-DIAG001$","--reporter=default","--reporter=github-actions","--reporter=json","--outputFile=test-results/calendar-feed-cause-proof/native.json"]);
  // Compose independently reviewed finite inverses before the historical
  // calendar/fixed-browser projection. Preserve every unrelated workflow byte.
  let projected = projectStorageSourceMailExclusion(projectTemporaryPicomatchAudit(projectDbStartupFacts(projectCiPerformanceChanges(projectRel22Capture(projectReleaseBrowserBudget(workflow))))));
  assert.equal(projected.split(authCleanupEntry).length - 1, 1, "Auth cleanup exact diagnostic workflow fragment");
  const collectorSource = readFileSync(new URL("../../scripts/ci/auth-cleanup-collector.mjs", import.meta.url), "utf8").replaceAll("\r\n", "\n");
  assert.equal(createHash("sha256").update(collectorSource).digest("hex"), authCleanupCollectorSha256, "Auth cleanup reviewed collector source");
  projected = projected.replace(authCleanupEntry, "");
  for (const [entry, replacement] of causeProofInverse) {
    assert.equal(projected.split(entry).length - 1, 1, "calendar feed exact diagnostic workflow fragment");
    projected = projected.replace(entry, replacement);
  }
  assert.equal(projected.split(releaseBrowserEntry).length - 1, 1, "calendar feed CI exact release workflow entry");
  projected = projected.replace(releaseBrowserEntry, [
    "      - name: Exhaustive browser validation (explicit opt-in)",
    "        if: ${{ github.event_name == 'workflow_dispatch' && inputs.release_validation }}",
    "        env:", "          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json",
    `        run: pnpm ${releaseBrowser.join(" ")}`,
  ].join("\n") + "\n");
  for (const [entry, replacement] of [
    [dbEntry, [
      "      - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)",
      "        run: |", `          pnpm ${integration.join(" ")}`, "          pnpm run test:pilot-performance",
    ].join("\n") + "\n"],
    [browserEntry, [
      "      - name: Essential authentication smoke (production app and local Auth)",
      "        if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.release_validation) }}",
      "        env:", "          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json",
      `        run: pnpm ${browser.join(" ")}`,
    ].join("\n") + "\n"],
  ]) {
    assert.equal(projected.split(entry).length - 1, 1, "calendar feed CI exact workflow entry");
    projected = projected.replace(entry, replacement);
  }
  assert.ok(!projected.includes("scripts/ci/with-calendar-feed-runtime.mjs"), "calendar feed CI unexpected wrapper entry");
  return projected;
}
