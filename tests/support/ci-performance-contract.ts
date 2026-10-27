import assert from "node:assert/strict";

// Finite, exact performance-only spans. Do not erase arbitrary jobs or reset
// the historical 48adc320 workflow hash when another change needs an inverse.
const reviewedChanges = [
  {
    "job": "verify",
    "pairs": [
      [
        "      - name: Setup Node\n        id: node\n",
        "      - name: Setup Node\n"
      ],
      [
        "        run: pnpm install --frozen-lockfile\n\n      # Intermediates only: never restore a .next build, auth state or test data.\n      # Source-specific writes; restore only within the same toolchain/config/env.\n      - name: Cache Next build intermediates\n        uses: actions/cache@v4\n        with:\n          path: .next/cache\n          key: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-verify-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'playwright.config.ts') }}-${{ hashFiles('src/**') }}\n          restore-keys: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-verify-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'playwright.config.ts') }}-\n",
        "        run: pnpm install --frozen-lockfile\n"
      ],
      [
        "        run: node scripts/ci/timed-build.mjs\n",
        "        run: pnpm build\n"
      ],
      [
        "\n      - name: Upload production build timing\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: production-build-timing-verify\n          path: ${{ runner.temp }}/build-timing-verify.json\n          retention-days: 7\n          if-no-files-found: ignore\n\n",
        "\n"
      ]
    ]
  },
  {
    "job": "e2e",
    "pairs": [
      [
        "      - name: Setup Node\n        id: node\n",
        "      - name: Setup Node\n"
      ],
      [
        "      # Intermediates only: never restore a .next build, auth state or test data.\n      # Source-specific writes; restore only within the same toolchain/config/env.\n      - name: Cache Next build intermediates\n        uses: actions/cache@v4\n        with:\n          path: .next/cache\n          key: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-e2e-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'playwright.config.ts') }}-${{ hashFiles('src/**') }}\n          restore-keys: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-e2e-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'playwright.config.ts') }}-\n\n      # Browser + Linux dependencies are preinstalled in the reviewed official\n      # image. Keep the host Node/Next/Supabase topology and use a loopback protocol.\n      - name: Start pinned Playwright browser service\n        timeout-minutes: 6\n        run: node scripts/ci/browser-runtime.mjs start\n",
        "      - name: Install Playwright browser (chromium + OS deps)\n        run: pnpm exec playwright install --with-deps chromium\n"
      ],
      [
        "\n      - name: Upload browser runtime identity and timings\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: browser-runtime-${{ github.job }}\n          path: |\n            ${{ runner.temp }}/browser-runtime-${{ github.job }}.json\n            ${{ runner.temp }}/build-timing-${{ github.job }}.json\n          retention-days: 7\n          if-no-files-found: ignore\n\n      - name: Stop owned Playwright browser service\n        if: always()\n        timeout-minutes: 1\n        run: node scripts/ci/browser-runtime.mjs stop\n\n",
        "\n"
      ]
    ]
  },
  {
    "job": "dashboard-e2e",
    "pairs": [
      [
        "      - name: Setup Node\n        id: node\n",
        "      - name: Setup Node\n"
      ],
      [
        "      # Intermediates only: never restore a .next build, auth state or test data.\n      # Source-specific writes; restore only within the same toolchain/config/env.\n      - name: Cache Next build intermediates\n        uses: actions/cache@v4\n        with:\n          path: .next/cache\n          key: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-dashboard-e2e-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'tests/e2e/dashboard/playwright.ci.config.ts') }}-${{ hashFiles('src/**') }}\n          restore-keys: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-dashboard-e2e-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'tests/e2e/dashboard/playwright.ci.config.ts') }}-\n\n      # Browser + Linux dependencies are preinstalled in the reviewed official\n      # image. Keep the host Node/Next/Supabase topology and use a loopback protocol.\n      - name: Start pinned Playwright browser service\n        timeout-minutes: 6\n        run: node scripts/ci/browser-runtime.mjs start\n",
        "      - name: Install Playwright browser (chromium + OS deps)\n        run: pnpm exec playwright install --with-deps chromium\n"
      ],
      [
        "\n      - name: Upload browser runtime identity and timings\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: browser-runtime-${{ github.job }}\n          path: |\n            ${{ runner.temp }}/browser-runtime-${{ github.job }}.json\n            ${{ runner.temp }}/build-timing-${{ github.job }}.json\n          retention-days: 7\n          if-no-files-found: ignore\n\n      - name: Stop owned Playwright browser service\n        if: always()\n        timeout-minutes: 1\n        run: node scripts/ci/browser-runtime.mjs stop\n\n",
        "\n"
      ]
    ]
  },
  [
    "\n  # Additive data-free entry UI feedback; required jobs below never consume its\n  # classifier. A green result is not auth, affected-component or release acceptance.\n  feedback-scope:\n    needs: [checkpoint-admission]\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n    runs-on: ubuntu-latest\n    timeout-minutes: 3\n    outputs:\n      entry_ui: ${{ steps.classify.outputs.entry_ui }}\n    steps:\n      - name: Checkout immutable diff\n        uses: actions/checkout@v4\n        with:\n          ref: ${{ github.event.pull_request.head.sha || github.sha }}\n          fetch-depth: 0\n          persist-credentials: false\n      - name: Classify additive feedback\n        id: classify\n        run: node scripts/ci/classify-feedback.mjs\n      - name: Upload conservative classification\n        uses: actions/upload-artifact@v4\n        with:\n          name: feedback-classification\n          path: test-results/feedback-classification.json\n          retention-days: 7\n          if-no-files-found: error\n\n  entry-ui-feedback:\n    needs: [checkpoint-admission, feedback-scope]\n    if: ${{ needs.feedback-scope.outputs.entry_ui == 'true' }}\n    runs-on: ubuntu-latest\n    # Five minutes is a measured objective, not an execution acceptance cutoff.\n    timeout-minutes: 12\n    steps:\n      - name: Checkout\n        uses: actions/checkout@v4\n        with:\n          ref: ${{ github.event.pull_request.head.sha || github.sha }}\n          persist-credentials: false\n      - name: Install pnpm\n        uses: pnpm/action-setup@v4\n      - name: Setup Node\n        id: node\n        uses: actions/setup-node@v4\n        with:\n          node-version-file: .nvmrc\n          cache: pnpm\n      - name: Install dependencies\n        timeout-minutes: 3\n        run: pnpm install --frozen-lockfile\n\n      # Intermediates only: never restore a .next build, auth state or test data.\n      # Source-specific writes; restore only within the same toolchain/config/env.\n      - name: Cache Next build intermediates\n        uses: actions/cache@v4\n        with:\n          path: .next/cache\n          key: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-entry-ui-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'tests/feedback/playwright.config.ts') }}-${{ hashFiles('src/**') }}\n          restore-keys: next-intermediates-${{ runner.os }}-${{ steps.node.outputs.node-version }}-entry-ui-v1-${{ hashFiles('pnpm-lock.yaml', '.nvmrc', 'next.config.*', 'tsconfig.json', 'postcss.config.*', 'playwright.config.ts', 'tests/support/test-env.ts', '.github/workflows/ci.yml', 'scripts/ci/browser-runtime.mjs', 'scripts/ci/timed-build.mjs', 'tests/feedback/playwright.config.ts') }}-\n\n      # Browser + Linux dependencies are preinstalled in the reviewed official\n      # image. Keep the host Node/Next/Supabase topology and use a loopback protocol.\n      - name: Start pinned Playwright browser service\n        timeout-minutes: 6\n        run: node scripts/ci/browser-runtime.mjs start\n\n      - name: Production entry UI feedback (two isolated data-free viewports)\n        timeout-minutes: 6\n        run: pnpm exec playwright test --config tests/feedback/playwright.config.ts\n\n      - name: Upload entry UI native results and screenshots\n        if: ${{ !cancelled() }}\n        uses: actions/upload-artifact@v4\n        with:\n          name: entry-ui-feedback\n          path: |\n            test-results/entry-ui.json\n            test-results/entry-ui/\n          retention-days: 7\n          if-no-files-found: error\n\n      - name: Upload browser runtime identity and timings\n        if: always()\n        uses: actions/upload-artifact@v4\n        with:\n          name: browser-runtime-${{ github.job }}\n          path: |\n            ${{ runner.temp }}/browser-runtime-${{ github.job }}.json\n            ${{ runner.temp }}/build-timing-${{ github.job }}.json\n          retention-days: 7\n          if-no-files-found: ignore\n\n      - name: Stop owned Playwright browser service\n        if: always()\n        timeout-minutes: 1\n        run: node scripts/ci/browser-runtime.mjs stop\n",
    "",
    1
  ]
] as const;

export function projectCiPerformanceChanges(workflow: string): string {
  let projected = workflow.replaceAll("\r\n", "\n");
  for (const change of [...reviewedChanges].reverse()) {
    if (!("job" in change)) {
      const [addition, original, count] = change;
      assert.equal(projected.split(addition).length - 1, count, "CI performance exact additive job fragment");
      projected = projected.replace(addition, original);
    } else {
      const start = projected.indexOf(`  ${change.job}:\n`);
      assert.ok(start >= 0, "CI performance original job");
      const next = projected.slice(start + 3).search(/^  [a-z][a-z0-9-]*:\n/m);
      const end = next < 0 ? projected.length : start + 3 + next;
      let job = projected.slice(start, end);
      for (const [addition, original] of [...change.pairs].reverse()) {
        assert.equal(job.split(addition).length - 1, 1, `CI performance exact reviewed job fragment: ${change.job}: ${addition.slice(0, 90)}`);
        job = job.replace(addition, original);
      }
      projected = projected.slice(0, start) + job + projected.slice(end);
    }
  }
  return projected;
}
