import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const wrapperPath = new URL("../../scripts/ci/with-calendar-feed-runtime.mjs", import.meta.url);
const wrapperSha256 = "8e6235531201a1fed01e4bb30eeaad98218b24747c6cac2ff38a2158f87a7f07";
const integrationArgs = ["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"];
const browserArgs = ["run", "test:smoke"];
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

// Exact newly reviewed diagnostic fragments only. Every unrelated byte survives.
const originalE2E001Inverse: readonly [string, string][] = [
  [
    "run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_original_e2e001 && format('checkpoint:original-e2e001:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}",
    "run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}"
  ],
  [
    "      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n      calendar_feed_original_e2e001:\n        description: Fixed E2E001 original request diagnostic; zero acceptance\n        type: boolean\n        required: false\n        default: false\n",
    "      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n"
  ],
  [
    "          CAUSE_PROOF: ${{ inputs.calendar_feed_cause_proof || false }}\n          ORIGINAL_E2E001: ${{ inputs.calendar_feed_original_e2e001 || false }}\n",
    "          CAUSE_PROOF: ${{ inputs.calendar_feed_cause_proof || false }}\n"
  ],
  [
    "          if [ \"$CAUSE_PROOF\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n          fi\n          if [ \"${ORIGINAL_E2E001:-false}\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$CAUSE_PROOF\" = false\n            test false = \"$RELEASE_VALIDATION\"\n            test false = \"$OTHER_DIAGNOSTICS\"\n          fi\n",
    "          if [ \"$CAUSE_PROOF\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n          fi\n"
  ],
  [
    "  db:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_original_e2e001) }}\n",
    "  db:\n"
  ],
  [
    "  recovery-storage-loader:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof || inputs.calendar_feed_original_e2e001)) }}",
    "  recovery-storage-loader:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}"
  ],
  [
    "      - name: Essential authentication smoke (production app and local Auth)\n        if: ${{ !(github.event_name == 'workflow_dispatch' && (inputs.release_validation || inputs.calendar_feed_original_e2e001)) }}\n",
    "      - name: Essential authentication smoke (production app and local Auth)\n        if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.release_validation) }}\n"
  ],
  [
    "      - name: Fixed E2E001 original request diagnostic (zero acceptance)\n        if: ${{ github.event_name == 'workflow_dispatch' && inputs.calendar_feed_original_e2e001 }}\n        env:\n          PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json\n          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}\n          CALENDAR_FEED_ORIGINAL_E2E001: \"1\"\n          CALENDAR_FEED_ORIGINAL_CHECKPOINT: ${{ inputs.checkpoint_id }}\n        run: node scripts/ci/with-calendar-feed-runtime.mjs browser\n\n      - name: Exhaustive browser validation (explicit opt-in)\n",
    "      - name: Exhaustive browser validation (explicit opt-in)\n"
  ]
];

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
    "  e2e:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
    "  e2e:\n"
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

function literalArgs(source: string, name: string, expected: string[]): string[] {
  const declarations = [...source.matchAll(new RegExp(`^export const ${name} = Object\\.freeze\\((\\[[^\\n]*\\])\\);$`, "gm"))];
  assert.equal(declarations.length, 1, `calendar feed CI ${name} declaration`);
  const args: unknown = JSON.parse(declarations[0][1]);
  assert.deepEqual(args, expected, `calendar feed CI ${name} argv`);
  return args as string[];
}

/**
 * Expose the real delegated commands to existing CI contract checks. Only the
 * two wrapper entries and finite diagnostic fragments are inverted; all other bytes survive.
 * Reading pinned source (never importing/evaluating it) also rejects unrelated
 * wrapper edits instead of granting them the historical workflow inverse.
 */
export function projectCalendarFeedCiCommands(workflow: string, wrapperSource = readFileSync(wrapperPath, "utf8")): string {
  const source = wrapperSource.replaceAll("\r\n", "\n");
  const integration = literalArgs(source, "INTEGRATION_ARGS", integrationArgs);
  const browser = literalArgs(source, "BROWSER_ARGS", browserArgs);
  assert.equal(createHash("sha256").update(source).digest("hex"), wrapperSha256, "calendar feed CI reviewed wrapper source");
  literalArgs(source, "CAUSE_PROOF_ARGS", ["exec","vitest","run","tests/integration/commands/calendar-feed.int.test.ts","--maxWorkers=1","--no-file-parallelism","--testNamePattern=^15[.]5-DIAG001$","--reporter=default","--reporter=github-actions","--reporter=json","--outputFile=test-results/calendar-feed-cause-proof/native.json"]);
  literalArgs(source, "ORIGINAL_E2E001_ARGS", ["exec", "playwright", "test", "tests/e2e/calendar-feed.e2e.spec.ts", "--grep", "(?:^| )15[.]5-E2E-001(?: |$)", "--retries=0", "--workers=1", "--reporter=list,json"]);
  let projected = workflow.replaceAll("\r\n", "\n");
  for (const [entry, replacement] of originalE2E001Inverse) {
    assert.equal(projected.split(entry).length - 1, 1, "calendar feed exact workflow entry diagnostic fragment");
    projected = projected.replace(entry, replacement);
  }
  for (const [entry, replacement] of causeProofInverse) {
    assert.equal(projected.split(entry).length - 1, 1, "calendar feed exact diagnostic workflow fragment");
    projected = projected.replace(entry, replacement);
  }
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
