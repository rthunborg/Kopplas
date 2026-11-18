import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { projectCiPerformanceChanges } from "./ci-performance-contract";

const wrapperPath = new URL("../../scripts/ci/with-calendar-feed-runtime.mjs", import.meta.url);
const wrapperSha256 = "52d9b270f66f9ec5e68b8d4398e817c42aeb55311504b72a2439383a7aeea2ab";
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
  assert.equal(createHash("sha256").update(source).digest("hex"), wrapperSha256, "calendar feed CI reviewed wrapper source");
  literalArgs(source, "CAUSE_PROOF_ARGS", ["exec","vitest","run","tests/integration/commands/calendar-feed.int.test.ts","--maxWorkers=1","--no-file-parallelism","--testNamePattern=^15[.]5-DIAG001$","--reporter=default","--reporter=github-actions","--reporter=json","--outputFile=test-results/calendar-feed-cause-proof/native.json"]);
  // Compose independently reviewed finite inverses before the historical
  // calendar/fixed-browser projection. Preserve every unrelated workflow byte.
  let projected = projectStorageSourceMailExclusion(projectTemporaryPicomatchAudit(projectCiPerformanceChanges(workflow)));
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
