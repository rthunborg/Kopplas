# Fresh committed latest14 cause-proof review

Read the entire exact diff and relevant source context. Report consequential introduced reachable defects and unresolved serious gaps only. Verify downstream enforcement before alleging a missing guard. This is an independent latest-delta review after3completed broad rounds, not a fourth broad review. No source writes, native execution, queries/probes/resources/CI actions or acceptance claims.

## Review route/context

{
  "route": {
    "schema_version": 1,
    "phase": "review-native-denial-cause-proof-committed-delta",
    "role": "independent-sensitive-committed-native-cause-proof-delta-reviewer",
    "model": "gpt-6.1-sol",
    "effort": "high",
    "recorded_by_root_before_dispatch": true,
    "dispatch_owner": "Parent; author does not dispatch reviewer",
    "source": "cb8d696d19c53e63be05ecb1ae273449af60efaf",
    "base": "56324120f8e08de995e8cc7432ab27f2d0c98635",
    "scope": "Latest committed14 changed paths and consequential regressions; not a fourth broad story review",
    "completed_broad_rounds": 3,
    "requested_independence": "Fresh context-free reviewer; no author/reviewer role reuse",
    "source_and_spec_frozen": true,
    "verdict": "PENDING",
    "no_source_or_spec_verdict_write_after_review": true,
    "native_credit": 0
  },
  "root_identity_metadata_only": {
    "current_source_count": 70,
    "current_raw_normalized_difference_count": 41,
    "unchanged_paths_since_checkpoint": 56,
    "changed": 14,
    "delta_raw_normalized_differences": 5,
    "author_commits": 17,
    "root_commits": 11,
    "ancestry": 28,
    "receipt": {
      "path": ".env.epic15.mail-runtime/story-15-5-preparation/root-cb8d696d-source-path-admission.json",
      "bytes": 39635,
      "sha256": "2de3f6130cf5bd78e0110f0618d74f2557cd51c9cdb0d09467cd36b67ae7fa88",
      "metadata_only_not_runtime_credit": true
    },
    "not_runtime_or_semantic_proof": true
  },
  "provenance": {
    "source": "cb8d696d19c53e63be05ecb1ae273449af60efaf",
    "base": "56324120f8e08de995e8cc7432ab27f2d0c98635",
    "exact14": [
      "src/server/commands/calendar-feed/calendar-feed-db.ts",
      "src/server/commands/calendar-feed/manage-calendar-feed.ts",
      "src/server/read-models/calendar-feed.ts",
      "tests/support/calendar-feed-atdd.ts",
      "tests/integration/commands/calendar-feed.int.test.ts",
      "scripts/ci/with-calendar-feed-runtime.mjs",
      "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
      "tests/support/calendar-feed-ci-contract.ts",
      ".github/workflows/ci.yml",
      "scripts/ci/checkpoint-dispatch.mjs",
      "tests/unit/scripts/ci/checkpoint-dispatch.test.ts",
      "tests/unit/scripts/verify/ci-native-test-reports.test.ts",
      "tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts",
      "_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md"
    ],
    "ordinary_command_body_and_INT015_unchanged": true,
    "raw_and_actual_git_blob_bindings_separate": true,
    "root_report_state_dirty_excluded": true,
    "global_worktree_clean_claim": false,
    "mutable_root_raw_snapshot_not_resampled": true
  },
  "acceptance": {
    "diagnostic": "ZERO_ACCEPTANCE",
    "current_managed_native": "UNEXECUTED",
    "actual_DIAG001": "UNEXECUTED",
    "former_43_db_causes": "UNPROVEN",
    "former_14_browser_failures": "UNRESOLVED",
    "all_11_failed_histories_preserved": true,
    "no_engine_phase_claim": true,
    "direct_SQL_is_new_controlled_call_not_original_JWT_session_proof": true,
    "runtime_prerequisites": [
      "Fresh committed-delta High PASS",
      "Root freeze/push",
      "Separately born/reviewed private qualifier after pushed head",
      "Hosted default AND candidate input availability before sole POST",
      "Root-admitted exact run identity"
    ],
    "original_normal95_INT015_and_required_normal_gates_preserved": true
  },
  "focus": [
    "Actual ALS erasure dataflow; same output/error/once-call behavior; absent-store privacy and closed context lifetime",
    "Actual command/SQL/HTTP/timer/child settlement versus driver timeout/outer test deadline; conditional fixture/key custody",
    "Qualified original setup and same-client restricted identity/owned claims/privacy before one selected UNMODIFIED baseline",
    "Unconditional rollback/reset, independent fresh qualification and source/owned-state comparison; all reaching primary/cleanup failures",
    "Exact single diagnostic case versus unchanged normal15/INT015; no skipped-normal-case artifact masquerade",
    "Mode/title/nonce/SHA/actor/attempt/status/legacy compatibility and default/candidate availability before POST",
    "Actual artifact report/receipt/missing/sensitive-content failure fences; full normal/pilot/recovery/browser/inverse preservation",
    "No native acceptance or SQL inner-cause inference from a label, setup authority, controlled replay or zero-acceptance run"
  ],
  "references": [
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/accepted-native-denial-cause-proof-allocation.json",
      "bytes": 5006,
      "sha256": "99bcc94753e87bb3efcf7fec730c88da4059ca450a4548286f47dbf20fdc63d3",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/accepted-native-denial-cause-proof-private-consumer-allocation.json",
      "bytes": 3289,
      "sha256": "3b6cb5ddbdc847ca9dfbd2e7ceb2b2e2418227b661b9d14447016a1aea530c00",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-proposal-revision-1/manifest.json",
      "bytes": 1763,
      "sha256": "f3b31ce6d0a4b1f8d4322de89c0491709d939dc840ecfd9333d9106f7346b334",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-proposal-revision-1/proposal.md",
      "bytes": 16665,
      "sha256": "6d41cda99f51403ab49fed4e6bc31976427efca7358beb80f164d4cf7064e90d",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-proposal-revision-1/contract-and-bindings.json",
      "bytes": 32880,
      "sha256": "7cdbae09f37bdb04c9c9965aca3c0b8bdab6ed6cdaa148b35a64e2c41b2ad0cf",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-proposal-revision-1/result.json",
      "bytes": 1767,
      "sha256": "68c676bfb444fe96440d53f293710b6bb213dd9cebd937d9e9592cd3e6608ca0",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-challenge/original-report.md",
      "bytes": 17497,
      "sha256": "114a3a37698b0885da6072127bba96b05bbe2b1d48bbb0d046ac8c0702ed1115",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-challenge/original-attestation.json",
      "bytes": 6251,
      "sha256": "f8ee4a5f839d86c7cb4306b33fefc495814e6998ea13b5a5a4e6547e62feed3a",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-challenge/result.json",
      "bytes": 2164,
      "sha256": "57f9551466be649d20fdc0af776505c518a9dbbb4834349d3a448ad5ef42ba33",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-revision-1-challenge/original-report.md",
      "bytes": 17105,
      "sha256": "c4866354960d7aa789556e755c2ff1970c2053de62c02a9ab16004e1701f0b2b",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-revision-1-challenge/original-attestation.json",
      "bytes": 76083,
      "sha256": "58e75b3cdaa1628549cf43a9568d7e2b0ef02e54d010a0474af954491cc1dc96",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-revision-1-challenge/result.json",
      "bytes": 1831,
      "sha256": "e9515cbf0da465180096ce1fa6cb5a8a33b8aa2d2b10d74402835ffa03ad59dd",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-qualification-plan/manifest.json",
      "bytes": 3941,
      "sha256": "5c64a63ff2af9ac173cd1a4cfec4e62f29f3e3968cd4f476314a17b5b638da69",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-qualification-plan/plan.md",
      "bytes": 14424,
      "sha256": "6fc4d2865a193aa05d67defdb3a3300cefad82d613e0b2e2da5bf2fcda4b67c0",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/native-denial-cause-proof-qualification-plan/result.json",
      "bytes": 3566,
      "sha256": "6eb5ecc2e4aa055067a01725d7a2882f856bdfd3c2c14d65bc2eb49ce63ffea6",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": ".env.epic15.mail-runtime/story-15-5-preparation/root-cb8d696d-source-path-admission.json",
      "bytes": 39635,
      "sha256": "2de3f6130cf5bd78e0110f0618d74f2557cd51c9cdb0d09467cd36b67ae7fa88",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": ".env.epic15.mail-runtime/story-15-5-preparation/root-failed-56324120-packet-admission.json",
      "bytes": 1304,
      "sha256": "34785381fc18743aeeb67f23517683c48e790509b0c0b15e3fc683bd927f2a0a",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": ".env.epic15.mail-runtime/story-15-5-preparation/checkpoint-56324120-ci-independent/native-qualification.json",
      "bytes": 39649,
      "sha256": "9fab0c5db825a7f2d2d49384a9f420c0ae246fb43a3d1476f4d760708c8883da",
      "metadata_only_not_runtime_credit": true
    },
    {
      "path": "_bmad-output/auto-bmad/preparation/story-15-5/source-freeze-native-dependency-audit-repair.json",
      "bytes": 720807,
      "sha256": "fdf228c001e59f666cf362c5ee847513a90b101fb2c0188f5d8932a0d27912cd",
      "metadata_only_not_runtime_credit": true
    }
  ],
  "checks": "local-checks.json",
  "no_author_source_changes_in_preparation": true
}

## Recorded actual check limits

{
  "kind": "AUTHOR_ACTUAL_LOCAL_CHECKS_NOT_NATIVE",
  "source": "cb8d696d19c53e63be05ecb1ae273449af60efaf",
  "base": "56324120f8e08de995e8cc7432ab27f2d0c98635",
  "checks_were_working_tree_before_commit": true,
  "sequence": [
    {
      "check": "initial wholeTypeScript",
      "command": "pnpm exec tsc --noEmit --incremental false",
      "exit": 1,
      "errors": 4,
      "reason": "Dispatcher result union inference after mode fields; explicit return-record annotation corrected it."
    },
    {
      "check": "initial seven-file Node",
      "command": "node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts tests/unit/scripts/ci/checkpoint-dispatch.test.ts tests/unit/scripts/verify/ci-native-test-reports.test.ts tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts tests/unit/docs/acceptance-gate-report-validators.test.ts tests/unit/server/authz/command-enrollment.test.ts",
      "exit": 1,
      "total": 359,
      "passed": 358,
      "failed": 1,
      "skipped": 0,
      "cancelled": 0,
      "reason": "Existing admitted actual-Bash harness lacked the3new false env defaults under set-u; corrected only checkpoint-dispatch.test.ts."
    },
    {
      "check": "seven-file Node after correction",
      "command": "node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts tests/unit/scripts/ci/checkpoint-dispatch.test.ts tests/unit/scripts/verify/ci-native-test-reports.test.ts tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts tests/unit/docs/acceptance-gate-report-validators.test.ts tests/unit/server/authz/command-enrollment.test.ts",
      "exit": 0,
      "total": 361,
      "passed": 361,
      "failed": 0,
      "skipped": 0,
      "cancelled": 0,
      "temporal_limit": "Precedes final status/envelope and source-registration controls. Other6consumer files unchanged afterward."
    },
    {
      "check": "changed-file final Node",
      "command": "node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
      "exit": 0,
      "total": 79,
      "passed": 79,
      "failed": 0,
      "skipped": 0,
      "cancelled": 0,
      "retained_prior_controls": 67,
      "native_credit": 0
    },
    {
      "check": "final wholeTypeScript",
      "command": "pnpm exec tsc --noEmit --incremental false",
      "exit": 0
    },
    {
      "check": "focused12 source ESLint",
      "command": "pnpm exec eslint <12 allocated JS/TS files> --max-warnings 0",
      "exit": 0,
      "errors": 0,
      "warnings": 0,
      "later_affected3_lint": "helper/command-case/unit controls repeated after final changes, exit0/0warnings"
    },
    {
      "check": "production build",
      "command": "pnpm run build",
      "exit": 0,
      "scope": "Working-tree Next16.3.8 production build, no server. The3production modules did not change afterward; later diagnostic test/helper/Spec changes do not claim a new build run. No independently captured pre-build whole-source raw snapshot is invented."
    },
    {
      "check": "incorrect bundle command",
      "command": "pnpm run verify:no-service-role-client-bundle",
      "exit": 1,
      "reason": "No such script; no verification executed under that name."
    },
    {
      "check": "actual built bundle gate",
      "command": "pnpm run verify:bundle-containment",
      "exit": 0
    },
    {
      "check": "native working and staged Git diffcheck",
      "commands": [
        "git diff --check",
        "git diff --cached --check"
      ],
      "exit": 0,
      "exact14_index_checked": true
    }
  ],
  "no_inferred_combined_run": true,
  "full_current_seven_file_364_run_executed": false,
  "evidence_limits": [
    "Node controls use actual source regions/injected dependencies/installed reporter/driver construction and owned temporaryFS, not PG/JWT/HTTP/browser native acceptance.",
    "No native test collection/globalSetup/baseline/services/CI executed.",
    "No new audit or canonical whole lint scan; unchanged Vite/dependency graph and native11 audit/lint positives keep historical scope.",
    "Current diagnostic availability/private qualifier adoption and baseline native semantics remain unverified.",
    "No newly born private consumer is referenced or credited."
  ],
  "author_order": {
    "section_count": 1,
    "stop_count": 79,
    "verified_stops": [
      {
        "path": "src/components/app-shell/AppShell.tsx",
        "line": 279,
        "literal_anchor": "navigation.some"
      },
      {
        "path": "src/components/calendar-feed/CalendarSubscription.tsx",
        "line": 34,
        "literal_anchor": "const current = await refresh();"
      },
      {
        "path": "src/components/calendar-feed/CalendarSubscription.tsx",
        "line": 69,
        "literal_anchor": "state?.status === \"error\""
      },
      {
        "path": "tests/integration/components/calendar-feed.test.ts",
        "line": 36,
        "literal_anchor": "15.5-COMP-003"
      },
      {
        "path": "tests/e2e/calendar-feed.e2e.spec.ts",
        "line": 380,
        "literal_anchor": "15.5-E2E-010-"
      },
      {
        "path": "tests/e2e/calendar-feed.e2e.spec.ts",
        "line": 447,
        "literal_anchor": "15.5-E2E-011"
      },
      {
        "path": "src/server/commands/calendar-feed/manage-calendar-feed.ts",
        "line": 10,
        "literal_anchor": "function calendarFeedConfig"
      },
      {
        "path": "src/server/commands/calendar-feed/manage-calendar-feed.ts",
        "line": 38,
        "literal_anchor": "command: \"calendar_feed.create\""
      },
      {
        "path": "supabase/migrations/20261020220000_personal_calendar_feed.sql",
        "line": 162,
        "literal_anchor": "create function public.manage_calendar_feed"
      },
      {
        "path": "supabase/migrations/20261020220000_personal_calendar_feed.sql",
        "line": 122,
        "literal_anchor": "is distinct from (case"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 354,
        "literal_anchor": "const allowed = [\"membershipId\""
      },
      {
        "path": "tests/integration/rls/calendar-feed.rls.test.ts",
        "line": 129,
        "literal_anchor": "15.5-RLS008"
      },
      {
        "path": "middleware.ts",
        "line": 40,
        "literal_anchor": "request.nextUrl.pathname"
      },
      {
        "path": "supabase/migrations/20261020220000_personal_calendar_feed.sql",
        "line": 236,
        "literal_anchor": "'updatedAt',greatest"
      },
      {
        "path": "src/features/calendar-feed/icalendar.ts",
        "line": 40,
        "literal_anchor": "export function encodeCalendarFeed"
      },
      {
        "path": "tests/unit/features/calendar-feed/icalendar.test.ts",
        "line": 76,
        "literal_anchor": "R1-05 positive"
      },
      {
        "path": "supabase/migrations/20261020220000_personal_calendar_feed.sql",
        "line": 247,
        "literal_anchor": "exception when sqlstate '57014'"
      },
      {
        "path": "tests/integration/calendar-feed/public-feed.int.test.ts",
        "line": 364,
        "literal_anchor": "15.5-API018"
      },
      {
        "path": "supabase/migrations/20261020220000_personal_calendar_feed.sql",
        "line": 27,
        "literal_anchor": "pg_has_role(current_user,feed_owner.oid,'SET')"
      },
      {
        "path": "tests/integration/commands/calendar-feed.int.test.ts",
        "line": 445,
        "literal_anchor": "memberships.every(row => row.inherit_option === false)"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 556,
        "literal_anchor": "has_schema_privilege(oid,'public','CREATE')"
      },
      {
        "path": "tests/integration/rls/calendar-feed.rls.test.ts",
        "line": 171,
        "literal_anchor": "publicSchemaCreate: false"
      },
      {
        "path": "tests/integration/ops/recovery-storage-immutability.int.test.ts",
        "line": 131,
        "literal_anchor": "has_schema_privilege('calendar_feed_owner','public','CREATE')"
      },
      {
        "path": "tests/integration/commands/calendar-feed.int.test.ts",
        "line": 486,
        "literal_anchor": "// FULL rollback comes first"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 327,
        "literal_anchor": "export function createOwnedGroupStopper"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 248,
        "literal_anchor": "export function createTelemetryObserver"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 1282,
        "literal_anchor": "nonzero/null-signal nested browser loss"
      },
      {
        "path": "tests/support/calendar-feed-ci-contract.ts",
        "line": 83,
        "literal_anchor": "projectCalendarFeedCiCommands"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 39,
        "literal_anchor": "CI command projection rejects"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 99,
        "literal_anchor": "function safeDiagnostic"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 320,
        "literal_anchor": "COMMIT uncertainty is not cleared"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 529,
        "literal_anchor": "receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 216,
        "literal_anchor": "privacy preflight rejects incomplete"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 166,
        "literal_anchor": "export function createCalendarFeedDatabaseClient"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 153,
        "literal_anchor": "export async function readCalendarFeedSetupAuthority"
      },
      {
        "path": "tests/integration/commands/calendar-feed.int.test.ts",
        "line": 508,
        "literal_anchor": "await fresh.connect(); await setupQualified(fresh); await absent(fresh);"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 154,
        "literal_anchor": "setup construction refuses missing"
      },
      {
        "path": "tests/e2e/support/calendar-feed-atdd.ts",
        "line": 83,
        "literal_anchor": "export function createCalendarLifecycleObservations"
      },
      {
        "path": "tests/e2e/support/calendar-feed-atdd.ts",
        "line": 25,
        "literal_anchor": "export function calendarBrowserDiagnostic"
      },
      {
        "path": "tests/e2e/support/calendar-feed-atdd.ts",
        "line": 705,
        "literal_anchor": "if (base && cleanupAllowed)"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 496,
        "literal_anchor": "missing leaders with persistent groups"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 1048,
        "literal_anchor": "actual browser bounded cancellation"
      },
      {
        "path": "tests/e2e/support/calendar-feed-atdd.ts",
        "line": 93,
        "literal_anchor": "trackReadback<T>"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 1128,
        "literal_anchor": "installed polling deadline cannot credit"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 202,
        "literal_anchor": "export function calendarFixtureDiagnostic"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 272,
        "literal_anchor": "phase = \"additional-users\""
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 601,
        "literal_anchor": "actual fixture diagnostics preserve only"
      },
      {
        "path": "tests/integration/rls/acceptance-tables-migration-reset.int.test.ts",
        "line": 212,
        "literal_anchor": "approved role-specific policies"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 930,
        "literal_anchor": "the actual allocated policy case rejects"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 234,
        "literal_anchor": "calendarFixtureSafeFailures.get(child)?.children"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 877,
        "literal_anchor": "installed failure transport reproduces lost"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 889,
        "literal_anchor": "actual repaired fixture diagnostics reach"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 190,
        "literal_anchor": "export function calendarFixtureOrigin"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 195,
        "literal_anchor": "export function calendarFixtureAssertionAt"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 734,
        "literal_anchor": "const outcome = result.outcome"
      },
      {
        "path": "tests/integration/rls/calendar-feed.rls.test.ts",
        "line": 23,
        "literal_anchor": "calendarFixtureAssertionAt(allowedSites[subject]"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 798,
        "literal_anchor": "actual first INT001 and API001 callbacks stop"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 830,
        "literal_anchor": "actual first callbacks retain precise safe assertion frames"
      },
      {
        "path": "package.json",
        "line": 50,
        "literal_anchor": "\"vite\": \"8.1.6\""
      },
      {
        "path": "pnpm-lock.yaml",
        "line": 2297,
        "literal_anchor": "vite@8.1.6:"
      },
      {
        "path": "pnpm-lock.yaml",
        "line": 2059,
        "literal_anchor": "rolldown@1.1.5:"
      },
      {
        "path": "src/server/commands/calendar-feed/calendar-feed-db.ts",
        "line": 25,
        "literal_anchor": "export async function captureCalendarFeedTrace"
      },
      {
        "path": "src/server/commands/calendar-feed/manage-calendar-feed.ts",
        "line": 48,
        "literal_anchor": "const code = result.code"
      },
      {
        "path": "src/server/read-models/calendar-feed.ts",
        "line": 10,
        "literal_anchor": "if (error?.code === \"42501\")"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 744,
        "literal_anchor": "export function calendarCauseProofSelection"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 750,
        "literal_anchor": "export async function calendarCauseProofIdle"
      },
      {
        "path": "tests/support/calendar-feed-atdd.ts",
        "line": 762,
        "literal_anchor": "export async function runCalendarFeedCauseProof"
      },
      {
        "path": "tests/integration/commands/calendar-feed.int.test.ts",
        "line": 21,
        "literal_anchor": "test(\"15.5-DIAG001\""
      },
      {
        "path": "scripts/ci/checkpoint-dispatch.mjs",
        "line": 31,
        "literal_anchor": "function diagnosticAvailability"
      },
      {
        "path": "scripts/ci/checkpoint-dispatch.mjs",
        "line": 15,
        "literal_anchor": "function verificationMode"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 14,
        "literal_anchor": "export const CAUSE_PROOF_ARGS"
      },
      {
        "path": "scripts/ci/with-calendar-feed-runtime.mjs",
        "line": 50,
        "literal_anchor": "export async function finishCauseProof"
      },
      {
        "path": ".github/workflows/ci.yml",
        "line": 262,
        "literal_anchor": "- name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 1358,
        "literal_anchor": "actual per-invocation trace preserves once-call value"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 1379,
        "literal_anchor": "actual baseline decision chooses one observed boundary"
      },
      {
        "path": "tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts",
        "line": 1404,
        "literal_anchor": "actual installed failed native report and closed observation"
      },
      {
        "path": "tests/unit/scripts/ci/checkpoint-dispatch.test.ts",
        "line": 245,
        "literal_anchor": "diagnostic selection is durable before the only POST"
      },
      {
        "path": "tests/unit/scripts/verify/ci-native-test-reports.test.ts",
        "line": 41,
        "literal_anchor": "cause-proof capture is distinct mode-bound"
      },
      {
        "path": "tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts",
        "line": 53,
        "literal_anchor": "diagnostic dispatch excludes pilot"
      }
    ],
    "kernel_bytes": 5760,
    "kernel_sha256": "0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977",
    "status": "in-review"
  }
}

## Exact native Git committed diff (untrimmed)

diff --git a/.github/workflows/ci.yml b/.github/workflows/ci.yml
index bf3e2014..3c2fca9d 100644
--- a/.github/workflows/ci.yml
+++ b/.github/workflows/ci.yml
@@ -1,5 +1,5 @@
 name: CI
-run-name: ${{ github.event_name == 'workflow_dispatch' && format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('CI {0}', github.ref_name) }}
+run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}
 
 # Phase A verification gates (architecture §19).
 # `verify` job — stages 1-5 + 10: install, lockfile guard, service-role containment
@@ -19,6 +19,11 @@ run-name: ${{ github.event_name == 'workflow_dispatch' && format('checkpoint:{0}
 on:
   workflow_dispatch:
     inputs:
+      calendar_feed_cause_proof:
+        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance
+        type: boolean
+        required: false
+        default: false
       native_stream_probe:
         description: Data-free native stream diagnostic after general E2E completes
         type: boolean
@@ -81,9 +86,17 @@ jobs:
         env:
           EXPECTED_SHA: ${{ inputs.expected_sha }}
           CHECKPOINT_ID: ${{ inputs.checkpoint_id }}
+          CAUSE_PROOF: ${{ inputs.calendar_feed_cause_proof || false }}
+          RELEASE_VALIDATION: ${{ inputs.release_validation || false }}
+          OTHER_DIAGNOSTICS: ${{ inputs.native_stream_probe || inputs.fixed_chromium_paired_probe || inputs.fixed_chromium_application_verification || false }}
         shell: bash
         run: |
           set -euo pipefail
+          if [ "$CAUSE_PROOF" = true ]; then
+            test "$GITHUB_EVENT_NAME" = workflow_dispatch
+            test "$RELEASE_VALIDATION" = false
+            test "$OTHER_DIAGNOSTICS" = false
+          fi
           if [ "$GITHUB_EVENT_NAME" = workflow_dispatch ]; then
             [[ "$EXPECTED_SHA" =~ ^[a-f0-9]{40}$ ]]
             [[ "$CHECKPOINT_ID" =~ ^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$ ]]
@@ -246,8 +259,25 @@ jobs:
           echo "supabase db reset failed after 3 attempts — treating as a REAL failure"
           exit 1
 
+      - name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)
+        if: ${{ github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}
+        env:
+          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}
+          CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT: ${{ inputs.checkpoint_id }}
+        run: node scripts/ci/with-calendar-feed-runtime.mjs cause-proof
+
+      - name: Upload native calendar feed cause proof JSON
+        if: ${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}
+        uses: actions/upload-artifact@v4
+        with:
+          name: native-calendar-feed-cause-proof
+          path: test-results/calendar-feed-cause-proof/upload/
+          retention-days: 7
+          if-no-files-found: error
+
       # Stage 8: DB-backed integration + cross-tenant RLS-negative suites.
       - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)
+        if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
         env:
           # This opt-in alone is insufficient: the wrapper also proves this
           # hosted job's fresh Docker identities, publications and current ledger.
@@ -257,7 +287,7 @@ jobs:
           pnpm run test:pilot-performance
 
       - name: Upload native full integration JSON
-        if: ${{ !cancelled() }}
+        if: ${{ !cancelled() && !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
         uses: actions/upload-artifact@v4
         with:
           name: native-full-integration
@@ -274,6 +304,7 @@ jobs:
   # the local CI stack, restores it into a separate recovery volume, then proves
   # absent bytes can be materialized without changing protected logical rows.
   recovery-storage-loader:
+    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
     runs-on: ubuntu-latest
     timeout-minutes: 45
     needs: [verify]
@@ -438,6 +469,7 @@ jobs:
           rm -rf recovery/source recovery/synthetic-storage
           rm -f ops/recovery/.env ops/recovery/.private.db-bootstrap.compose.yaml ops/recovery/.private.runtime.compose.yaml
   e2e:
+    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
     runs-on: ubuntu-latest
     timeout-minutes: 45
     # Same gate as `db`: only spin up the stack + browser after the fast `verify` job
diff --git a/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md b/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md
index 6a50199f..da9f3c0d 100644
--- a/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md
+++ b/_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md
@@ -1042,6 +1042,83 @@ it does not establish compatibility of the full native feature, resolve43DB and
 local qualification, blind CI retry, fourth broad review, push, merge/deployment,
 DONE/delivery or release claim is made.
 
+## Staged denial cause-proof implementation — unexecuted diagnostic lane
+
+Root admitted exact revision1 hunks in14 paths through
+`accepted-native-denial-cause-proof-allocation.json` (5006B,
+SHA256 `99bcc94753e87bb3efcf7fec730c88da4059ca450a4548286f47dbf20fdc63d3`).
+The dispatcher is the sole addition to the previous69-source inventory (now70).
+Historical109 SQL/protected37 consumers and every previous failure/capsule remain
+unchanged. The approved intent contract is unchanged; status stays in-review.
+The author recorded Sol6.1 High implementation under Root's admitted route;
+independent committed latest-delta High review is pending, within the completed
+three-round cap. This source grant launches no service, probe or CI run.
+
+The minimal route follows the independently challenged staged design: ONE real
+own-subject JWT management call with closed scoped branch observations, then at
+most ONE corresponding ORIGINAL status or management function in a restricted,
+rollback-only controlled SQL baseline. Normal calls have no trace store or log;
+no generic client/RPC/thenable observation or public DTO change is introduced.
+The scoped context closes and clears expected private identifiers after the real
+command promise settles. The existing public-fetch pending set is not used as
+proof that this command or a PostgreSQL query has ended. The dedicated baseline
+checks the installed pg protocol ReadyForQuery boundary; timeout rejection alone
+is insufficient. Unverified references retain fixture/key custody. This path
+composes the canonical role fixture directly so an unconditional booking-fixture
+finally cannot delete rows/Auth against outstanding diagnostic work.
+
+The baseline keeps original function OIDs/source/owners/ACL and claims only a NEW
+controlled direct-SQL result. Its original setup session is independently
+qualified SupAdmin LOGIN+SUPER with all four effective privacy controls. The
+same client changes only transaction-local session authorization/owned claims,
+then proves restricted session=current authenticated/nonSUPER/nonBYPASS/owned
+identity and privacy immediately before its single original-function call.
+There is no function replacement/clone/role DDL/grant/fault DDL/Vault probe/new
+endpoint. Full rollback precedes identity recovery, and independently qualified
+fresh source/owned-state verification precedes normal fixture cleanup. Every
+reaching primary/cleanup failure has a closed retained stage; inherited upstream
+factory best-effort cleanup/message replacement remains outside that guarantee.
+
+42501 remains AMBIGUOUS_SQL42501; engine errors, context/state/clock mismatch,
+nonreproduction and cleanup uncertainty stop with named UNKNOWN/custody. No SQL
+engine phase or historical JWT session/snapshot/proof equivalence is invented.
+The current43 DB causes and14 browser failures are not fixed by this code. RLS010
+later ACL predicates, API019 later telemetry checks and browser contentNULL privacy
+remain uncredited. No automatic next probe or opaque full-suite retry is added.
+
+The actual dispatcher persists diagnostic mode/SHA/nonce before its only POST,
+uses a distinct title/status and preserves old normal/release records. It refuses
+new diagnostic dispatch unless both hosted candidate/default workflow definitions
+prove the supported exact input/admission contract. Root private-qualifier
+adoption, availability, producer review/freeze and pushed-head prerequisites are
+external gates, not proved by an environment flag. No default-branch update,
+merge, provider mutation or alternate dispatch is authorized. A diagnostic run
+has zero acceptance even if its selected jobs succeed. Normal full DB+pilot,
+browser/recovery/release commands and the original inverse hash are preserved.
+Only mode-bound, privacy-validated report copies enter the diagnostic upload tree;
+unsafe originals are not deleted or uploaded. Failed native cases may upload
+safe actual JSON; missing reports/refused content retain capture failure. Private
+key custody identifiers are excluded from that artifact receipt.
+
+Actual local checks: the initial seven-file Node execution was359 total,
+358PASS/1FAIL/0skip/0cancel because the admitted existing Bash harness omitted the
+three new environment defaults under set-u. After that harness fix, all361 passed
+with0fail/skip/cancel. Two additional actual-source status/envelope controls were
+then added, followed by the actual-source registration guard control; the final
+changed Node file executed79PASS/0FAIL/0skip/0cancel.
+The other six files retain their actual earlier passing bindings; no inferred
+363-case combined run is claimed. The original67 controls are retained. These
+injected lifecycle/source/driver-construction/real temporary-FS/installed reporter
+controls have nativecredit0. Whole TypeScript, focused12-file ESLint
+(0errors/0warnings), production Next build and built-bundle containment passed.
+An attempted nonexistent verify:no-service-role-client-bundle script refused;
+the actual verify:bundle-containment command then passed, with no build rerun.
+Dependencies are unchanged from55db; native11 canonical audit/lint positives keep
+that historical scope. No canonical local lint scan through retained assets,
+native collection, DB/RLS/component/HTTP/browser execution or diagnostic baseline
+was run. The source's normal95 acceptance cases and INT015 are unchanged;
+DIAG001 is declared ONLY in explicit diagnostic mode and is not normal coverage.
+
 ## Suggested Review Order
 
 Author: Story 15.5 implementation/fix author (gpt-6.1-sol High), incorporating
@@ -1050,7 +1127,7 @@ Round 3 latest-fix assertions, the subsequent checkpoint repairs and bounded
 native setup diagnostics, same-connection privacy qualification and explicit
 isolated setup authority transport, bounded child settlement, browser diagnostic repair,
 actual SQL callback ownership, executed-feature fixture/status/policy repairs and
-bounded safe-leaf transport through the installed reporter, closed owned scenario origins and the minimal Vite security patch.
+bounded safe-leaf transport through the installed reporter, closed owned scenario origins and the minimal Vite security patch and the admitted staged diagnostic-only lane.
 Stops below resolve to final source literals before the repair commit.
 
 ### Own settings and honest lifecycle results
@@ -1074,11 +1151,11 @@ Ordinary JWT commands derive self authority; SQL rechecks current exact membersh
 and role union under the scheduling tenant lock. Dedicated proofs bind privileged
 inputs, and CAS/history/audit commit together without plaintext recovery.
 
-- `src/server/commands/calendar-feed/manage-calendar-feed.ts:10` — `calendarFeedConfig`: exposes plaintext only after confirmed fresh SQL success.
-- `src/server/commands/calendar-feed/manage-calendar-feed.ts:32` — `command: "calendar_feed.create"`: literal create/rotate/revoke declarations retain independent enrollment discovery.
+- `src/server/commands/calendar-feed/manage-calendar-feed.ts:10` — `function calendarFeedConfig`: exposes plaintext only after confirmed fresh SQL success.
+- `src/server/commands/calendar-feed/manage-calendar-feed.ts:38` — `command: "calendar_feed.create"`: literal create/rotate/revoke declarations retain independent enrollment discovery.
 - `supabase/migrations/20261020220000_personal_calendar_feed.sql:162` — `create function public.manage_calendar_feed`: checks signed authority, revision, replay and audit.
 - `supabase/migrations/20261020220000_personal_calendar_feed.sql:122` — `is distinct from (case`: preserves domain branches while delimiting CASE within the PL/pgSQL IF; subsequent native stack resets compiled it.
-- `tests/support/calendar-feed-atdd.ts:353` — `const allowed = ["membershipId"`: checks raw JWT status keys before mapper reconstruction.
+- `tests/support/calendar-feed-atdd.ts:354` — `const allowed = ["membershipId"`: checks raw JWT status keys before mapper reconstruction.
 - `tests/integration/rls/calendar-feed.rls.test.ts:129` — `15.5-RLS008`: AC1/4/9 case failed at3e7; no downstream field/ACL credit inferred.
 
 ### Complete live snapshots and essential RFC correctness
@@ -1102,8 +1179,8 @@ keeps SupAdmin-only NOADMIN. Retained unsafe roles fail closed.
 - `supabase/migrations/20261020220000_personal_calendar_feed.sql:247` — `exception when sqlstate '57014'`: keeps projection failure inside the counter transaction.
 - `tests/integration/calendar-feed/public-feed.int.test.ts:364` — `15.5-API018`: AC5/8 case failed at3e7; changed-head durability evidence pending.
 - `supabase/migrations/20261020220000_personal_calendar_feed.sql:27` — `pg_has_role(current_user,feed_owner.oid,'SET')`: qualifies source ownership authority independently of creator ADMIN.
-- `tests/integration/commands/calendar-feed.int.test.ts:434` — `memberships.every(row => row.inherit_option === false)`: AC4/9 INT015 native fresh/replay inherited-owner oracle passed at3e7.
-- `tests/support/calendar-feed-atdd.ts:555` — `has_schema_privilege(oid,'public','CREATE')`: reads actual effective schema privileges including PUBLIC/inherited access.
+- `tests/integration/commands/calendar-feed.int.test.ts:445` — `memberships.every(row => row.inherit_option === false)`: AC4/9 INT015 native fresh/replay inherited-owner oracle passed at3e7.
+- `tests/support/calendar-feed-atdd.ts:556` — `has_schema_privilege(oid,'public','CREATE')`: reads actual effective schema privileges including PUBLIC/inherited access.
 - `tests/integration/rls/calendar-feed.rls.test.ts:171` — `publicSchemaCreate: false`: AC4/9 RLS010 failed at3e7; individual predicate reach remains unknown.
 - `tests/integration/ops/recovery-storage-immutability.int.test.ts:131` — `has_schema_privilege('calendar_feed_owner','public','CREATE')`: the existing recovery case checks the restored target before Storage requests; separately qualified native case.
 
@@ -1120,39 +1197,39 @@ remain observations. The later admitted setup transport separately requires actu
 authenticated SupAdmin LOGIN+SUPER for key setup and INT015, preserving its
 restricted-session oracle. No new privileged child configuration or grant is added.
 
-- `tests/integration/commands/calendar-feed.int.test.ts:475` — `// FULL rollback comes first`: preserves rollback/reset and same/fresh catalog absence proof.
-- `scripts/ci/with-calendar-feed-runtime.mjs:257` — `export function createOwnedGroupStopper`: memoizes settlement, validates capture, passively observes missing-leader group absence and bounds completion/output.
-- `scripts/ci/with-calendar-feed-runtime.mjs:179` — `export function createTelemetryObserver`: detects leaks before dropping non-allowlisted output.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1276` — `nonzero/null-signal nested browser loss`: requires retained key custody for abnormal completion.
-- `tests/support/calendar-feed-ci-contract.ts:43` — `projectCalendarFeedCiCommands`: validates pinned real wrapper argv and only the two exact workflow inverses.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:33` — `CI command projection rejects`: missing/wrong entry/argv and unrelated-source/workflow negatives preserve the original inverse fence.
-- `scripts/ci/with-calendar-feed-runtime.mjs:32` — `function safeDiagnostic`: emits only fixed stages/categories and allowlisted SQLSTATE without native payloads.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:314` — `COMMIT uncertainty is not cleared`: rollback alone cannot establish key absence after attempted COMMIT.
-- `scripts/ci/with-calendar-feed-runtime.mjs:443` — `receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);`: rejects unsafe effective settings before entropy on the existing client.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:210` — `privacy preflight rejects incomplete`: malformed and unsafe settings cannot reach a secret or child; actual driver/same-client/query-close cases exercise the surrounding boundary.
-- `scripts/ci/with-calendar-feed-runtime.mjs:99` — `export function createCalendarFeedDatabaseClient`: fixes the same qualified source publication, canonical admin and sole captured credential; no default or alternate route.
-- `scripts/ci/with-calendar-feed-runtime.mjs:86` — `export async function readCalendarFeedSetupAuthority`: actual authenticated session/current LOGIN+SUPER proof is mandatory before mutation.
-- `tests/integration/commands/calendar-feed.int.test.ts:497` — `await fresh.connect(); await setupQualified(fresh); await absent(fresh);`: INT015 fresh authority/privacy and exact absence oracle passed at3e7.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:148` — `setup construction refuses missing`: credential/target refusals cannot reach secrets or children; actual identity negatives and child-config tests complete the bounded boundary evidence.
+- `tests/integration/commands/calendar-feed.int.test.ts:486` — `// FULL rollback comes first`: preserves rollback/reset and same/fresh catalog absence proof.
+- `scripts/ci/with-calendar-feed-runtime.mjs:327` — `export function createOwnedGroupStopper`: memoizes settlement, validates capture, passively observes missing-leader group absence and bounds completion/output.
+- `scripts/ci/with-calendar-feed-runtime.mjs:248` — `export function createTelemetryObserver`: detects leaks before dropping non-allowlisted output.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1282` — `nonzero/null-signal nested browser loss`: requires retained key custody for abnormal completion.
+- `tests/support/calendar-feed-ci-contract.ts:83` — `projectCalendarFeedCiCommands`: validates pinned real wrapper argv and the two wrapper inverses and finite exact diagnostic fragments.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:39` — `CI command projection rejects`: missing/wrong entry/argv and unrelated-source/workflow negatives preserve the original inverse fence.
+- `scripts/ci/with-calendar-feed-runtime.mjs:99` — `function safeDiagnostic`: emits only fixed stages/categories and allowlisted SQLSTATE without native payloads.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:320` — `COMMIT uncertainty is not cleared`: rollback alone cannot establish key absence after attempted COMMIT.
+- `scripts/ci/with-calendar-feed-runtime.mjs:529` — `receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);`: rejects unsafe effective settings before entropy on the existing client.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:216` — `privacy preflight rejects incomplete`: malformed and unsafe settings cannot reach a secret or child; actual driver/same-client/query-close cases exercise the surrounding boundary.
+- `scripts/ci/with-calendar-feed-runtime.mjs:166` — `export function createCalendarFeedDatabaseClient`: fixes the same qualified source publication, canonical admin and sole captured credential; no default or alternate route.
+- `scripts/ci/with-calendar-feed-runtime.mjs:153` — `export async function readCalendarFeedSetupAuthority`: actual authenticated session/current LOGIN+SUPER proof is mandatory before mutation.
+- `tests/integration/commands/calendar-feed.int.test.ts:508` — `await fresh.connect(); await setupQualified(fresh); await absent(fresh);`: INT015 fresh authority/privacy and exact absence oracle passed at3e7.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:154` — `setup construction refuses missing`: credential/target refusals cannot reach secrets or children; actual identity negatives and child-config tests complete the bounded boundary evidence.
 
 - `tests/e2e/support/calendar-feed-atdd.ts:83` — `export function createCalendarLifecycleObservations`: AC2/6 observes both transport promises and joins actual readback before teardown; pure regressions are not native acceptance.
 - `tests/e2e/support/calendar-feed-atdd.ts:25` — `export function calendarBrowserDiagnostic`: preserves closed stage/category/SQLSTATE without native error payloads.
 - `tests/e2e/support/calendar-feed-atdd.ts:705` — `if (base && cleanupAllowed)`: canonical SQL/Auth cleanup waits for verified settlement; unresolved references retain fixture custody.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:490` — `missing leaders with persistent groups`: absence is measured within existing budgets; anonymous groups grant no signaling authority.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1042` — `actual browser bounded cancellation`: timeout cannot credit in-flight SQL/readback settlement; release and real completion are distinct.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:496` — `missing leaders with persistent groups`: absence is measured within existing budgets; anonymous groups grant no signaling authority.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1048` — `actual browser bounded cancellation`: timeout cannot credit in-flight SQL/readback settlement; release and real completion are distinct.
 
 - `tests/e2e/support/calendar-feed-atdd.ts:93` — `trackReadback<T>`: registers actual callback/query work independently of Playwright deadlines and closes before drain.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1122` — `installed polling deadline cannot credit`: HTTP completion plus outer timeout cannot credit unresolved physical query siblings or callback completion.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1128` — `installed polling deadline cannot credit`: HTTP completion plus outer timeout cannot credit unresolved physical query siblings or callback completion.
 
-- `tests/support/calendar-feed-atdd.ts:201` — `export function calendarFixtureDiagnostic`: fixed stages/own-data SQLSTATE preserve only reaching errors within bounded aggregates.
-- `tests/support/calendar-feed-atdd.ts:271` — `phase = "additional-users"`: marks actual callback entry; upstream lost code remains unknown.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:595` — `actual fixture diagnostics preserve only`: injected classification and upstream-loss negatives are not native failure-cause proof.
+- `tests/support/calendar-feed-atdd.ts:202` — `export function calendarFixtureDiagnostic`: fixed stages/own-data SQLSTATE preserve only reaching errors within bounded aggregates.
+- `tests/support/calendar-feed-atdd.ts:272` — `phase = "additional-users"`: marks actual callback entry; upstream lost code remains unknown.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:601` — `actual fixture diagnostics preserve only`: injected classification and upstream-loss negatives are not native failure-cause proof.
 - `tests/integration/rls/acceptance-tables-migration-reset.int.test.ts:212` — `approved role-specific policies`: exact ten-policy/role case passed at3e7, retaining DELETE/ALL/extra-policy rejection.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:924` — `the actual allocated policy case rejects`: injected rows exercise catalog negatives; actual3e7 policy case passed separately.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:930` — `the actual allocated policy case rejects`: injected rows exercise catalog negatives; actual3e7 policy case passed separately.
 
-- `tests/support/calendar-feed-atdd.ts:233` — `calendarFixtureSafeFailures.get(child)?.children`: flattens only guarded, already-sanitized children for the one-level reporter boundary.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:871` — `installed failure transport reproduces lost`: old-shape control distinguishes JSON projection loss from in-process unknown.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:883` — `actual repaired fixture diagnostics reach`: ordered safe primary/cleanup leaves remain one failed synthetic case.
+- `tests/support/calendar-feed-atdd.ts:234` — `calendarFixtureSafeFailures.get(child)?.children`: flattens only guarded, already-sanitized children for the one-level reporter boundary.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:877` — `installed failure transport reproduces lost`: old-shape control distinguishes JSON projection loss from in-process unknown.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:889` — `actual repaired fixture diagnostics reach`: ordered safe primary/cleanup leaves remain one failed synthetic case.
 
 Evidence: historical check receipts keep their exact revisions and dependency
 limits. Eighth checkpoint3e7 ran all51 story Vitest cases:8 passed/43 failed;
@@ -1179,12 +1256,12 @@ The existing guards report only compile-time origins or outcome enums already
 consumed. RLS001 preserves each allowed-subject assertion and adds a fixed site;
 safe source frames identify other assertion lines without inspecting native errors.
 
-- `tests/support/calendar-feed-atdd.ts:189` — `export function calendarFixtureOrigin`: registers only newly created fixed safe errors.
-- `tests/support/calendar-feed-atdd.ts:194` — `export function calendarFixtureAssertionAt`: calls the existing assertion once and returns its result.
-- `tests/support/calendar-feed-atdd.ts:733` — `const outcome = result.outcome`: classifies the same consumed outcome without observing an RPC.
+- `tests/support/calendar-feed-atdd.ts:190` — `export function calendarFixtureOrigin`: registers only newly created fixed safe errors.
+- `tests/support/calendar-feed-atdd.ts:195` — `export function calendarFixtureAssertionAt`: calls the existing assertion once and returns its result.
+- `tests/support/calendar-feed-atdd.ts:734` — `const outcome = result.outcome`: classifies the same consumed outcome without observing an RPC.
 - `tests/integration/rls/calendar-feed.rls.test.ts:23` — `calendarFixtureAssertionAt(allowedSites[subject]`: distinguishes four allowed contracts without changing the loop.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:792` — `actual first INT001 and API001 callbacks stop`: proves preceding/no-later operations with injected fixtures, not native acceptance.
-- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:824` — `actual first callbacks retain precise safe assertion frames`: proves controlled frames and unrecoverable upstream UNKNOWN limits.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:798` — `actual first INT001 and API001 callbacks stop`: proves preceding/no-later operations with injected fixtures, not native acceptance.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:830` — `actual first callbacks retain precise safe assertion frames`: proves controlled frames and unrecoverable upstream UNKNOWN limits.
 
 Current evidence:67 bounded controls passed with0 failures/skips/cancellations,
 whole TypeScript and focused lint passed, and the approved5760-byte kernel is
@@ -1211,3 +1288,29 @@ canonical local lint was terminated/incomplete after scanning ignored historical
 assets and receives no PASS credit. Clean-CI canonical lint/native gates and fresh
 independent exact dependency-delta review remain pending. All prior failed heads
 and the43DB/14browser gaps remain failed/unresolved; no whole-native reuse.
+
+### A diagnostic result never substitutes for acceptance
+
+- `src/server/commands/calendar-feed/calendar-feed-db.ts:25` — `export async function captureCalendarFeedTrace`: closed per-invocation events, result/error identity and late-context closure.
+- `src/server/commands/calendar-feed/manage-calendar-feed.ts:48` — `const code = result.code`: observes the already-consumed stable envelope result without changing its outcome.
+- `src/server/read-models/calendar-feed.ts:10` — `if (error?.code === "42501")`: locates status erasure before its existing typed denial.
+- `tests/support/calendar-feed-atdd.ts:744` — `export function calendarCauseProofSelection`: selects at most one warranted original-function baseline.
+- `tests/support/calendar-feed-atdd.ts:750` — `export async function calendarCauseProofIdle`: a pg timeout is not actual protocol settlement.
+- `tests/support/calendar-feed-atdd.ts:762` — `export async function runCalendarFeedCauseProof`: one ordinary command, qualified restricted original baseline, rollback/fresh verification and conditional custody cleanup.
+- `tests/integration/commands/calendar-feed.int.test.ts:21` — `test("15.5-DIAG001"`: explicit-mode-only diagnostic inventory; normal95/INT015 are not replaced.
+- `scripts/ci/checkpoint-dispatch.mjs:31` — `function diagnosticAvailability`: candidate/default availability refusal before the sole POST.
+- `scripts/ci/checkpoint-dispatch.mjs:15` — `function verificationMode`: persisted diagnostic/legacy mode cannot downgrade to normal acceptance.
+- `scripts/ci/with-calendar-feed-runtime.mjs:14` — `export const CAUSE_PROOF_ARGS`: fixed single-case serial argv/reporters/output without a Next/browser child.
+- `scripts/ci/with-calendar-feed-runtime.mjs:50` — `export async function finishCauseProof`: validated distinct report upload on test failure as well as success, with private custody redaction.
+- `.github/workflows/ci.yml:262` — `- name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)`: separate mode-bound step; ordinary full+pilot remains intact.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1358` — `actual per-invocation trace preserves once-call value`: actual scoped trace concurrency/nesting and identity controls.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1379` — `actual baseline decision chooses one observed boundary`: conditional selection and protocol-settlement negatives.
+- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1404` — `actual installed failed native report and closed observation`: actual reporter/temporary-FS capture on failure without publishing custody handles.
+- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:245` — `diagnostic selection is durable before the only POST`: actual dispatcher durable mode/nonce/zero-acceptance transport controls.
+- `tests/unit/scripts/verify/ci-native-test-reports.test.ts:41` — `cause-proof capture is distinct mode-bound`: raw upload/artifact mode and negative controls preserve ordinary native reports.
+- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:53` — `diagnostic dispatch excludes pilot`: normal pilot/inverse guards and diagnostic NOT_RUN stay distinct.
+
+Evidence: final79 changed-file Node controls and prior361 seven-file run have the
+separate temporal limits recorded above. No diagnostic native run or SQL cause
+proof has occurred. Hosted availability and private qualifier adoption are hard
+pre-POST requirements; distinct committed-delta High review remains pending.
diff --git a/scripts/ci/checkpoint-dispatch.mjs b/scripts/ci/checkpoint-dispatch.mjs
index 79a42c94..57fd4d45 100644
--- a/scripts/ci/checkpoint-dispatch.mjs
+++ b/scripts/ci/checkpoint-dispatch.mjs
@@ -1,5 +1,6 @@
 import { spawnSync } from "node:child_process";
 import { randomUUID } from "node:crypto";
+import { createHash } from "node:crypto";
 import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
 import { dirname, resolve } from "node:path";
 import { fileURLToPath } from "node:url";
@@ -10,7 +11,39 @@ const SHA = /^[a-f0-9]{40}$/;
 const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
 const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
 const ACTOR = /^[A-Za-z0-9-]+(?:\[bot\])?$/;
-export const checkpointTitle = (id, sha) => `checkpoint:${id}:${sha}`;
+export const checkpointTitle = (id, sha, mode = "normal") => mode === "calendar-feed-cause-proof" ? `checkpoint:cause-proof:${id}:${sha}` : `checkpoint:${id}:${sha}`;
+function verificationMode(state) {
+  if (state.verification_mode === undefined && state.cause_proof === undefined) return state.release_validation === true ? "release" : "normal";
+  const expected = state.cause_proof === true ? "calendar-feed-cause-proof" : state.release_validation === true ? "release" : "normal";
+  if (typeof state.cause_proof !== "boolean" || state.verification_mode !== expected || (state.cause_proof && state.release_validation)) throw new Error("Invalid checkpoint verification mode.");
+  return expected;
+}
+const modeReceipt = state => ({ verification_mode: verificationMode(state), evidence_class: verificationMode(state) === "calendar-feed-cause-proof" ? "diagnostic-only" : "normal-gates-pending", acceptance_credit: 0 });
+
+/** A workflow ID being active does not prove it understands a new input. */
+export function assertCauseProofWorkflow(source) {
+  if (typeof source !== "string" || source.length > 512_000) throw new Error("Diagnostic workflow availability unverified.");
+  const text = source.replaceAll("\r\n", "\n");
+  if (!text.includes("      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n")
+    || !text.includes("checkpoint:cause-proof:{0}:{1}") || !text.includes('test "$RELEASE_VALIDATION" = false')
+    || !text.includes("node scripts/ci/with-calendar-feed-runtime.mjs cause-proof")) throw new Error("Diagnostic workflow input/admission is unavailable; no dispatch sent.");
+}
+function diagnosticAvailability(api, options) {
+  const read = ref => {
+    const value = api("GET", `repos/${options.repo}/contents/${WORKFLOW_PATH}?ref=${encodeURIComponent(ref)}`);
+    if (value?.encoding !== "base64" || typeof value.content !== "string" || value.content.length > 700_000 || !/^[a-f0-9]{40}$/.test(value.sha ?? "")) throw new Error("Diagnostic workflow source unavailable; no dispatch sent.");
+    const bytes = Buffer.from(value.content, "base64");
+    if (createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") !== value.sha) throw new Error("Diagnostic workflow object mismatch; no dispatch sent.");
+    const text = bytes.toString("utf8"); assertCauseProofWorkflow(text);
+    return { text, oid: value.sha };
+  };
+  const candidate = read(options.sha);
+  if (candidate.text.replaceAll("\r\n", "\n") !== readFileSync(resolve(WORKFLOW_PATH), "utf8").replaceAll("\r\n", "\n")) throw new Error("Diagnostic candidate workflow differs from reviewed checkout; no dispatch sent.");
+  const repository = api("GET", `repos/${options.repo}`);
+  validateRequest({ ...options, ref: repository?.default_branch });
+  const primary = read(repository.default_branch);
+  return { candidate_workflow_oid: candidate.oid, default_workflow_oid: primary.oid };
+}
 
 export function validateRequest({ repo, ref, sha }) {
   if (!REPO.test(repo ?? "") || repo.includes("..")) throw new Error("Use an explicit owner/repository.");
@@ -41,6 +74,8 @@ function validateState(state) {
     throw new Error("Invalid checkpoint ownership record.");
   }
   if (state.run_id != null && (!Number.isSafeInteger(state.run_id) || state.run_id < 1)) throw new Error("Invalid recorded run ID.");
+  if (state.release_validation !== undefined && typeof state.release_validation !== "boolean") throw new Error("Invalid checkpoint release selection.");
+  verificationMode(state);
 }
 
 function save(path, state) {
@@ -57,7 +92,7 @@ function workflowMatches(run, state) {
     && run.event === "workflow_dispatch"
     && run.head_branch === state.ref
     && run.head_sha === state.sha
-    && run.display_title === checkpointTitle(state.checkpoint_id, state.sha)
+    && run.display_title === checkpointTitle(state.checkpoint_id, state.sha, verificationMode(state))
     && run.actor?.login?.toLowerCase() === state.actor.toLowerCase()
     && run.triggering_actor?.login?.toLowerCase() === state.actor.toLowerCase()
     && run.run_attempt === 1;
@@ -76,13 +111,14 @@ function discover(api, state) {
   for (let page = 1; page <= 5; page += 1) {
     const result = api("GET", `repos/${state.repo}/actions/workflows/${state.workflow_id}/runs?event=workflow_dispatch&head_sha=${state.sha}&per_page=100&page=${page}`);
     if (!Array.isArray(result?.workflow_runs)) throw new Error("Invalid workflow run listing.");
-    matches.push(...result.workflow_runs.filter((run) => run.display_title === checkpointTitle(state.checkpoint_id, state.sha)));
+    matches.push(...result.workflow_runs.filter((run) => run.display_title === checkpointTitle(state.checkpoint_id, state.sha, verificationMode(state))));
     if (matches.length > 1) throw new Error("Duplicate checkpoint runs; no mutation sent. Reconcile manually.");
     if (result.workflow_runs.length < 100) return matches[0] ?? null;
   }
   throw new Error("Run discovery exceeded its five-page bound; no mutation sent.");
 }
 
+/** @returns {Record<string, unknown>} */
 export function checkpoint(command, options, { api = githubApi, now = () => new Date() } = {}) {
   if (!["dispatch", "status", "cancel"].includes(command)) throw new Error("Use dispatch, status or cancel.");
   if (!options.state) throw new Error("--state is required; use an ignored private local path.");
@@ -96,6 +132,8 @@ export function checkpoint(command, options, { api = githubApi, now = () => new
       if (existsSync(path)) throw new Error("Checkpoint record already exists. Use status; never retry dispatch from this record.");
       validateRequest(options);
       if (options.release_validation !== undefined && !["true", "false"].includes(options.release_validation)) throw new Error("--release-validation must be true or false.");
+      if (options.cause_proof !== undefined && !["true", "false"].includes(options.cause_proof)) throw new Error("--cause-proof must be true or false.");
+      if (options.cause_proof === "true" && options.release_validation === "true") throw new Error("Diagnostic and release modes are mutually exclusive.");
       const actor = api("GET", "user").login;
       if (!ACTOR.test(actor ?? "")) throw new Error("Cannot establish authenticated actor.");
       const permission = api("GET", `repos/${options.repo}/collaborators/${encodeURIComponent(actor)}/permission`).permission;
@@ -104,11 +142,15 @@ export function checkpoint(command, options, { api = githubApi, now = () => new
       if (branch.commit?.sha !== options.sha) throw new Error("Remote branch differs from the requested SHA; no dispatch sent.");
       const workflow = api("GET", `repos/${options.repo}/actions/workflows/${WORKFLOW}`);
       if (workflow.path !== WORKFLOW_PATH || workflow.state !== "active" || !Number.isSafeInteger(workflow.id) || workflow.id < 1) throw new Error("Expected active CI workflow is unavailable on the default branch.");
+      const availability = options.cause_proof === "true" ? diagnosticAvailability(api, options) : undefined;
       const created = now();
       const state = {
         version: 1, repo: options.repo, ref: options.ref, sha: options.sha,
         actor, workflow_id: workflow.id, checkpoint_id: randomUUID(),
         release_validation: options.release_validation === "true",
+        cause_proof: options.cause_proof === "true",
+        verification_mode: options.cause_proof === "true" ? "calendar-feed-cause-proof" : options.release_validation === "true" ? "release" : "normal",
+        ...(availability ? { workflow_availability: availability } : {}),
         created_at: created.toISOString(), deadline_at: new Date(created.getTime() + 60 * 60 * 1000).toISOString(),
         phase: "dispatch-uncertain", run_id: null,
       };
@@ -118,14 +160,14 @@ export function checkpoint(command, options, { api = githubApi, now = () => new
       try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
       try {
         api("POST", `repos/${state.repo}/actions/workflows/${state.workflow_id}/dispatches`, {
-          ref: state.ref, inputs: { expected_sha: state.sha, checkpoint_id: state.checkpoint_id, release_validation: String(state.release_validation) },
+          ref: state.ref, inputs: { expected_sha: state.sha, checkpoint_id: state.checkpoint_id, release_validation: String(state.release_validation), ...(state.cause_proof ? { calendar_feed_cause_proof: "true" } : {}) },
         });
       } catch {
         throw new Error("Dispatch outcome uncertain. Ownership record retained; use status, never repeat dispatch.");
       }
       state.phase = "dispatched";
       save(path, state);
-      return { phase: state.phase, checkpoint_id: state.checkpoint_id, sha: state.sha, release_validation: state.release_validation, next: "Use status with this same --state record." };
+      return { phase: state.phase, checkpoint_id: state.checkpoint_id, sha: state.sha, release_validation: state.release_validation, ...modeReceipt(state), next: "Use status with this same --state record." };
     }
     const state = JSON.parse(readFileSync(path, "utf8"));
     validateState(state);
@@ -134,7 +176,7 @@ export function checkpoint(command, options, { api = githubApi, now = () => new
     const listed = discover(api, state);
     if (!listed) {
       if (state.run_id != null) throw new Error("Recorded run is absent from discovery; reconcile manually.");
-      return { phase: "dispatch-uncertain", checkpoint_id: state.checkpoint_id, attention: "No unique matching run visible. Do not redispatch. Reconcile manually.", deadline_exceeded: now().getTime() > Date.parse(state.deadline_at) };
+      return { phase: "dispatch-uncertain", checkpoint_id: state.checkpoint_id, ...modeReceipt(state), attention: "No unique matching run visible. Do not redispatch. Reconcile manually.", deadline_exceeded: now().getTime() > Date.parse(state.deadline_at) };
     }
     const run = api("GET", `repos/${state.repo}/actions/runs/${listed.id}`);
     assertOwnedRun(run, state);
@@ -149,10 +191,11 @@ export function checkpoint(command, options, { api = githubApi, now = () => new
       state.cancel_requested_at = now().toISOString();
       save(path, state);
       try { api("POST", `repos/${state.repo}/actions/runs/${run.id}/cancel`); } catch { throw new Error("Cancellation outcome uncertain; use status. No retry sent."); }
-      return { phase: "cancel-requested", run_id: run.id, sha: state.sha };
+      return { phase: "cancel-requested", run_id: run.id, sha: state.sha, ...modeReceipt(state) };
     }
     return { phase: state.phase, conclusion: state.conclusion, run_id: run.id, sha: state.sha,
       release_validation: state.release_validation ?? false,
+      ...modeReceipt(state),
       deadline_exceeded: run.status !== "completed" && now().getTime() > Date.parse(state.deadline_at),
       url: `https://github.com/${state.repo}/actions/runs/${run.id}` };
   } finally {
@@ -164,10 +207,10 @@ export function checkpoint(command, options, { api = githubApi, now = () => new
 export function parseArgs(args) {
   const [command, ...rest] = args;
   const options = {};
-  const allowed = command === "dispatch" ? ["repo", "ref", "sha", "state", "release-validation"] : ["state"];
+  const allowed = command === "dispatch" ? ["repo", "ref", "sha", "state", "release-validation", "cause-proof"] : ["state"];
   for (let index = 0; index < rest.length; index += 2) {
     const key = rest[index]?.slice(2);
-    if (!rest[index]?.startsWith("--") || !allowed.includes(key) || options[key.replaceAll("-", "_")] !== undefined || !rest[index + 1] || rest[index + 1].startsWith("--")) throw new Error("Invalid, duplicate or missing option. Dispatch: --repo --ref --sha --state [--release-validation true|false]; status/cancel: --state.");
+    if (!rest[index]?.startsWith("--") || !allowed.includes(key) || options[key.replaceAll("-", "_")] !== undefined || !rest[index + 1] || rest[index + 1].startsWith("--")) throw new Error("Invalid, duplicate or missing option. Dispatch: --repo --ref --sha --state [--release-validation true|false] [--cause-proof true|false]; status/cancel: --state.");
     options[key.replaceAll("-", "_")] = rest[index + 1];
   }
   return { command, options };
diff --git a/scripts/ci/with-calendar-feed-runtime.mjs b/scripts/ci/with-calendar-feed-runtime.mjs
index 72d931cb..111f7fcc 100644
--- a/scripts/ci/with-calendar-feed-runtime.mjs
+++ b/scripts/ci/with-calendar-feed-runtime.mjs
@@ -1,8 +1,8 @@
 /** Disposable GitHub-hosted CI only. This is not local resource-launch authority. */
 import { spawn, execFile } from "node:child_process";
 import { promisify, stripVTControlCharacters } from "node:util";
-import { randomBytes, randomUUID } from "node:crypto";
-import { readdir, stat, realpath, mkdtemp, appendFile, writeFile, readFile, readlink } from "node:fs/promises";
+import { randomBytes, randomUUID, createHash } from "node:crypto";
+import { readdir, stat, realpath, mkdtemp, appendFile, writeFile, readFile, readlink, mkdir } from "node:fs/promises";
 import { tmpdir } from "node:os";
 import { resolve, join } from "node:path";
 import { fileURLToPath } from "node:url";
@@ -11,6 +11,73 @@ import pg from "pg";
 
 export const INTEGRATION_ARGS = Object.freeze(["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"]);
 export const BROWSER_ARGS = Object.freeze(["run", "test:smoke"]);
+export const CAUSE_PROOF_ARGS = Object.freeze(["exec", "vitest", "run", "tests/integration/commands/calendar-feed.int.test.ts", "--maxWorkers=1", "--no-file-parallelism", "--testNamePattern=^15[.]5-DIAG001$", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/calendar-feed-cause-proof/native.json"]);
+export const CAUSE_PROOF_OUTCOMES = Object.freeze(["PRE_SQL_STOP", "AMBIGUOUS_SQL42501", "NONREPRODUCED", "UNKNOWN_ENGINE_ERROR", "INCOMPARABLE", "CLEANUP_UNVERIFIED", "ORDINARY_SUCCESS", "CAPTURE_UNAVAILABLE"]);
+const CAUSE_DIRECTORY = "test-results/calendar-feed-cause-proof";
+const TRACE_EVENTS = new Set(["input-invalid", "execute-enter", "key-ready", "status-enter", "status-rpc42501", "status-rpc-error", "status-schema-invalid", "status-valid", "proof-enter", "manage-enter", "manage-rpc42501", "manage-rpcCF409", "manage-rpc-error", "manage-schema-invalid", "manage-valid", "envelope-success", "envelope-UNAUTHENTICATED", "envelope-TENANT_MEMBERSHIP_REQUIRED", "envelope-PERMISSION_DENIED", "envelope-VALIDATION_FAILED", "envelope-TENANT_ACCESS_DENIED", "envelope-COMMAND_CONFLICT", "envelope-SERVER_ERROR", "envelope-other", "context-match", "context-mismatch", "membership-match", "membership-mismatch", "truncated"]);
+
+/** Validate parsed wire data without inspecting native error text or payloads. */
+export function validateCauseProofObservation(value) {
+  try {
+    const descriptors = Object.getOwnPropertyDescriptors(value);
+    const clean = Object.create(null);
+    for (const [key, descriptor] of Object.entries(descriptors)) {
+      if (!("value" in descriptor)) fail("diagnostic-observation-refused");
+      clean[key] = descriptor.value;
+    }
+    for (const name of ["events", "failures"]) {
+      if (!Array.isArray(clean[name]) || clean[name].length > 32) fail("diagnostic-observation-refused");
+      const array = clean[name], copy = [];
+      for (let i = 0; i < array.length; i++) {
+        const descriptor = Object.getOwnPropertyDescriptor(array, String(i));
+        if (!descriptor || !("value" in descriptor)) fail("diagnostic-observation-refused");
+        copy.push(descriptor.value);
+      }
+      clean[name] = copy;
+    }
+    value = clean;
+  } catch { fail("diagnostic-observation-refused"); }
+  const keys = ["kind", "mode", "outcome", "events", "baseline", "sqlState", "cleanupVerified", "ordinarySettled", "queriesSettled", "failures"];
+  if (!value || typeof value !== "object" || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))
+    || value.kind !== "calendar_feed.cause_proof" || value.mode !== "cause-proof" || !CAUSE_PROOF_OUTCOMES.includes(value.outcome)
+    || !Array.isArray(value.events) || value.events.length > 16 || !value.events.every(event => typeof event === "string" && TRACE_EVENTS.has(event))
+    || !["not-selected", "status", "manage"].includes(value.baseline) || !(value.sqlState === null || SQLSTATE_CATEGORIES.has(value.sqlState) || value.sqlState === "CF409")
+    || !Array.isArray(value.failures) || value.failures.length > 32 || !value.failures.every(code => ["protocol-unsettled", "baseline-qualification-or-call", "baseline-rollback", "baseline-reset", "baseline-state", "baseline-close", "fresh-state", "fresh-qualification-or-state", "fresh-protocol", "fresh-close", "fixture-or-ordinary", "fixture-rows", "fixture-canonical", "fixture-absence", "fixture-custody-retained"].includes(code))
+    || !["cleanupVerified", "ordinarySettled", "queriesSettled"].every(key => typeof value[key] === "boolean")) fail("diagnostic-observation-refused");
+  if (!value.cleanupVerified || !value.ordinarySettled || !value.queriesSettled || value.outcome === "CLEANUP_UNVERIFIED") fail("diagnostic-settlement-unverified");
+  return value;
+}
+export async function finishCauseProof(cwd, env, receipt, observe, privacy) {
+  const folder = join(cwd, CAUSE_DIRECTORY), entries = [];
+  const upload = join(folder, "upload"); await mkdir(upload, { recursive: true });
+  let captureFailed = observe.privacyFailed?.() === true;
+  for (const name of ["native.json", "observation.json"]) {
+    try {
+      const bytes = await readFile(join(folder, name));
+      if (bytes.length > 1_000_000) fail("diagnostic-report-refused");
+      const data = JSON.parse(bytes.toString("utf8"));
+      if (hasSensitiveOutput(bytes.toString("utf8"), privacy)) fail("diagnostic-report-privacy-refused");
+      if (name === "native.json") {
+        if (data.numTotalTests !== 1 || data.numPendingTests !== 0 || !Number.isSafeInteger(data.numFailedTests) || !Number.isSafeInteger(data.numPassedTests)
+          || data.numFailedTests < 0 || data.numPassedTests < 0 || data.numPassedTests + data.numFailedTests !== 1) fail("diagnostic-report-refused");
+        await observe(bytes.toString("utf8"));
+      } else validateCauseProofObservation(data);
+      entries.push({ name, available: true, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
+      // Only validated copies are uploaded. A refused original is never deleted,
+      // printed, or accidentally swept into the diagnostic artifact directory.
+      await writeFile(join(upload, name), bytes, { mode: 0o600 });
+    } catch { entries.push({ name, available: false }); if (receipt.childExitCodes.length) captureFailed = true; }
+  }
+  const safe = { kind: "calendar_feed.diagnostic_receipt", mode: "cause-proof", evidenceClass: "diagnostic-only", acceptanceCredit: 0,
+    sourceSha: env.GITHUB_SHA, checkpointId: env.CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT, runId: env.GITHUB_RUN_ID,
+    attempt: 1, job: env.GITHUB_JOB, childStarted: receipt.childExitCodes.length > 0,
+    reports: entries.map(({ name, available }) => ({ name, available })),
+    cleanupVerified: receipt.keyDeleted && receipt.dbClosed && receipt.custody === null,
+    custodyRetained: receipt.custody !== null, failures: [...receipt.failures], captureFailed };
+  await writeFile(join(upload, "receipt.json"), JSON.stringify(safe) + "\n", { mode: 0o600 });
+  await writeFile(join(upload, "manifest.json"), JSON.stringify({ ...safe, reports: entries }) + "\n", { mode: 0o600 });
+  return !captureFailed;
+}
 export const FEED_FUNCTIONS = Object.freeze([
   "public.fetch_calendar_feed(text,text,jsonb,text)",
   "public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)",
@@ -115,7 +182,7 @@ export function createCalendarFeedDatabaseClient(stack, purpose = "runtime") {
 
 /** Pure prerequisite validation: CI flags alone do not qualify a machine. */
 export function validateAdmission(mode, env, platform) {
-  if (!["db", "browser"].includes(mode)) fail("mode-refused");
+  if (!["db", "browser", "cause-proof"].includes(mode)) fail("mode-refused");
   if (platform !== "linux" || env.CI !== "true" || env.GITHUB_ACTIONS !== "true" || env.RUNNER_ENVIRONMENT !== "github-hosted"
     || !/^\d+$/.test(env.GITHUB_RUN_ID ?? "") || !/^\d+$/.test(env.GITHUB_RUN_ATTEMPT ?? "")
     || !/^[a-zA-Z0-9_-]+$/.test(env.GITHUB_JOB ?? "")
@@ -126,6 +193,8 @@ export function validateAdmission(mode, env, platform) {
     if (env[key] && env[key] !== expected) fail("endpoint-refused");
   }
   if (env.E2E_PORT && env.E2E_PORT !== "3100") fail("port-refused");
+  if (mode === "cause-proof" && (env.GITHUB_RUN_ATTEMPT !== "1" || !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? "")
+    || !UUID.test(env.CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT ?? "") || env.GITHUB_EVENT_NAME !== "workflow_dispatch")) fail("diagnostic-admission-refused");
 }
 
 /** Match the actual Docker publication and job-created project identity, not just loopback. */
@@ -179,7 +248,7 @@ export function hasSensitiveOutput(line, { keyId, secret, knownValues = /** @typ
 export function createTelemetryObserver({ keyId, secret, persist, knownValues = /** @type {string[]} */ ([]) }) {
   let responseCount = 0, sensitiveOutputCount = 0;
   const observation = () => persist(JSON.stringify({ event: "calendar_feed.runtime_observation", responseCount, sensitiveOutputCount, sensitiveOutputDetected: sensitiveOutputCount !== 0 }) + "\n");
-  return async (line) => {
+  const observe = async (line) => {
     let record;
     try { record = JSON.parse(line); } catch { /* Unstructured output is still inspected below. */ }
     const validResponse = record !== null && typeof record === "object" && !Array.isArray(record)
@@ -194,6 +263,7 @@ export function createTelemetryObserver({ keyId, secret, persist, knownValues =
     await persist(JSON.stringify({ event: record.event, status: record.status }) + "\n");
     await observation();
   };
+  return Object.assign(observe, { privacyFailed: () => sensitiveOutputCount !== 0 });
 }
 
 /** Occupied listeners are refused; an existing app is never adopted or stopped. */
@@ -379,6 +449,13 @@ function defaultDependencies(env, cwd) {
       return { status, migrations, stack };
     },
     portFree: assertPortFree,
+    async prepareDiagnostic() {
+      const folder = join(cwd, CAUSE_DIRECTORY);
+      await mkdir(folder, { recursive: true });
+      if ((await readdir(folder)).length) fail("diagnostic-output-not-fresh");
+    },
+    finishDiagnostic: (receipt, observe, privacy) => finishCauseProof(cwd, env, receipt, observe, privacy),
+    async readDiagnostic() { return validateCauseProofObservation(JSON.parse(await readFile(join(cwd, CAUSE_DIRECTORY, "observation.json"), "utf8"))); },
     connect: createCalendarFeedDatabaseClient,
     async createTelemetry() { const folder = await mkdtemp(join(tmpdir(), "kopplas-feed-ci-")); const path = join(folder, "responses.jsonl"); await writeFile(path, "", { mode: 0o600 }); return { path, persist: line => appendFile(path, line, { mode: 0o600 }) }; },
     launch: (command, args, childEnv, observe) => launchOwned(command, args, childEnv, cwd, observe),
@@ -386,13 +463,19 @@ function defaultDependencies(env, cwd) {
   };
 }
 
+/** Test-only dedicated qualification. No credential export to child environments. */
+export async function qualifyCalendarFeedCauseProof(env = process.env) {
+  validateAdmission("cause-proof", env, process.platform);
+  return defaultDependencies(env, ROOT).qualify();
+}
+
 /**
  * Injected seams permit lifecycle tests without any process/DB/resource launch.
  * @param {{mode?: string, env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform, cwd?: string}} options
  * @param {object} injected
  */
 export async function runCalendarFeedRuntime({ mode, env = process.env, platform = process.platform, cwd = ROOT } = {}, injected = {}) {
-  const receipt = { event: "calendar_feed.ci_lifecycle", mode: ["db", "browser"].includes(mode) ? mode : "refused", ready: false,
+  const receipt = { event: "calendar_feed.ci_lifecycle", mode: ["db", "browser", "cause-proof"].includes(mode) ? mode : "refused", ready: false,
     childExitCodes: /** @type {(number|null)[]} */ ([]), keyDeleted: false, dbClosed: false,
     failures: /** @type {string[]} */ ([]),
     diagnostics: /** @type {{stage:string, category:string, sqlState:string|null}[]} */ ([]),
@@ -401,7 +484,8 @@ export async function runCalendarFeedRuntime({ mode, env = process.env, platform
     keyOutcome: /** @type {"not-attempted" | "rollback-confirmed" | "deleted-confirmed" | "unverified"} */ ("not-attempted"),
     custody: /** @type {null | {owner:string, job:string|undefined, vaultUuid:string|null, ownedName:string|null, expiry:string, nextAction:string, resumeCondition:string}} */ (null) };
   const children = new Set();
-  let db, keyUuid, ownedName, transactionOpen = false, createUncertain = false, browserTeardownUnverified = false;
+  let db, keyUuid, ownedName, transactionOpen = false, createUncertain = false, browserTeardownUnverified = false, diagnosticUnverified = false;
+  let diagnosticPrepared = false, diagnosticObserve = async () => {}, diagnosticPrivacy = { keyId: "", secret: "" };
   let stage = "admission", createAttempted = false, commitAttempted = false, rollbackConfirmed = false;
   const abort = new AbortController();
   const deps = { ...defaultDependencies(env, cwd), ...injected };
@@ -412,12 +496,13 @@ export async function runCalendarFeedRuntime({ mode, env = process.env, platform
     const handle = launch(command, args, childEnv, observer);
     let result;
     try { result = await bounded(handle.done, timeout, "child-timeout", abort.signal); }
-    catch (error) { if (mode === "browser") browserTeardownUnverified = true; throw error; }
+    catch (error) { if (mode === "browser") browserTeardownUnverified = true; if (mode === "cause-proof") diagnosticUnverified = true; throw error; }
     receipt.childExitCodes.push(result.code);
     if (result.code !== 0 || result.signal) {
       // pnpm can map a killed nested Playwright runner to nonzero/null signal.
       // That is never independent proof of its detached server's teardown.
       if (mode === "browser") browserTeardownUnverified = true;
+      if (mode === "cause-proof") diagnosticUnverified = true;
       fail("child-failed");
     }
     const stopped = await handle.stop();
@@ -430,7 +515,8 @@ export async function runCalendarFeedRuntime({ mode, env = process.env, platform
     stage = "qualification";
     const { status, migrations, stack } = await deps.qualify(); checkSignal();
     stage = "port-check";
-    await deps.portFree(mode === "db" ? 3195 : 3100); checkSignal();
+    if (mode !== "cause-proof") await deps.portFree(mode === "db" ? 3195 : 3100); checkSignal();
+    if (mode === "cause-proof") { await deps.prepareDiagnostic(); diagnosticPrepared = true; }
     stage = "database-client";
     db = deps.connect(stack);
     // Consume asynchronous connection errors without logging driver internals.
@@ -461,6 +547,8 @@ export async function runCalendarFeedRuntime({ mode, env = process.env, platform
     stage = "telemetry";
     const telemetry = await deps.createTelemetry();
     const observe = createTelemetryObserver({ keyId, secret, persist: telemetry.persist });
+    diagnosticObserve = observe;
+    diagnosticPrivacy = { keyId, secret };
     stage = "transaction-begin";
     await db.query("begin"); transactionOpen = true;
     stage = "key-collision";
@@ -483,7 +571,11 @@ export async function runCalendarFeedRuntime({ mode, env = process.env, platform
       NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}`, E2E_PORT: "3100",
       CALENDAR_FEED_ATTESTATION_KEY_ID: keyId, CALENDAR_FEED_ATTESTATION_SECRET: secret,
       CALENDAR_FEED_TEST_LOG_FILE: telemetry.path, CALENDAR_FEED_TEST_BASE_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}` };
-    if (mode === "db") {
+    if (mode === "cause-proof") {
+      childEnv.CALENDAR_FEED_CAUSE_PROOF_MODE = "1";
+      await run("pnpm", CAUSE_PROOF_ARGS, childEnv, observe, 240_000);
+      try { await deps.readDiagnostic(); } catch { diagnosticUnverified = true; fail("diagnostic-settlement-unverified"); }
+    } else if (mode === "db") {
       await run(process.execPath, ["node_modules/next/dist/bin/next", "build"], childEnv, observe, 240_000);
       const server = launch(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3195"], childEnv, observe);
       await deps.ready(childEnv.CALENDAR_FEED_TEST_BASE_URL, server, abort.signal); receipt.ready = true;
@@ -506,12 +598,13 @@ export async function runCalendarFeedRuntime({ mode, env = process.env, platform
       } catch (error) { receipt.failures.push("owned-child-cleanup-failed"); receipt.diagnostics.push(safeDiagnostic("child-cleanup", error)); }
     }
     if (browserTeardownUnverified && !receipt.failures.includes("browser-server-teardown-unverified")) receipt.failures.push("browser-server-teardown-unverified");
+    if (diagnosticUnverified) receipt.failures.push("diagnostic-work-settlement-unverified");
     if (transactionOpen) {
       try { await db.query("rollback"); transactionOpen = false; createUncertain = false; rollbackConfirmed = true; }
       catch (error) { receipt.failures.push("transaction-rollback-unverified"); receipt.diagnostics.push(safeDiagnostic("transaction-rollback", error)); }
     }
     // Never delete a key while a captured child or transaction remains unverified.
-    if (keyUuid && !transactionOpen && !browserTeardownUnverified && !receipt.failures.includes("owned-child-cleanup-failed")) {
+    if (keyUuid && !transactionOpen && !browserTeardownUnverified && !diagnosticUnverified && !receipt.failures.includes("owned-child-cleanup-failed")) {
       try {
         const result = await db.query("delete from vault.secrets where id=$1::uuid and name=$2 returning id", [keyUuid, ownedName]);
         const remaining = await db.query("select id,name from vault.secrets where id=$1::uuid", [keyUuid]);
@@ -530,6 +623,10 @@ export async function runCalendarFeedRuntime({ mode, env = process.env, platform
     receipt.keyOutcome = receipt.keyDeleted ? "deleted-confirmed" : !createAttempted ? "not-attempted"
       : rollbackConfirmed && !commitAttempted ? "rollback-confirmed" : "unverified";
   }
+  if (mode === "cause-proof" && diagnosticPrepared) {
+    try { if (!await deps.finishDiagnostic(receipt, diagnosticObserve, diagnosticPrivacy)) receipt.failures.push("diagnostic-capture-failed"); }
+    catch { receipt.failures.push("diagnostic-capture-failed"); }
+  }
   return { exitCode: receipt.failures.length ? 1 : 0, receipt };
 }
 
diff --git a/src/server/commands/calendar-feed/calendar-feed-db.ts b/src/server/commands/calendar-feed/calendar-feed-db.ts
index b9ad7ddc..c21b8c5e 100644
--- a/src/server/commands/calendar-feed/calendar-feed-db.ts
+++ b/src/server/commands/calendar-feed/calendar-feed-db.ts
@@ -1,13 +1,53 @@
 import type { CommandDbClient } from "../envelope";
 import { CommandError } from "../command-errors";
+import { AsyncLocalStorage } from "node:async_hooks";
+
+// Explicit test-owned invocation scope only. No logger, environment switch,
+// client/thenable observer, argument retention or change to command results.
+export const calendarFeedTraceEvents = ["input-invalid", "execute-enter", "key-ready", "status-enter", "status-rpc42501", "status-rpc-error", "status-schema-invalid", "status-valid", "proof-enter", "manage-enter", "manage-rpc42501", "manage-rpcCF409", "manage-rpc-error", "manage-schema-invalid", "manage-valid", "envelope-success", "envelope-UNAUTHENTICATED", "envelope-TENANT_MEMBERSHIP_REQUIRED", "envelope-PERMISSION_DENIED", "envelope-VALIDATION_FAILED", "envelope-TENANT_ACCESS_DENIED", "envelope-COMMAND_CONFLICT", "envelope-SERVER_ERROR", "envelope-other", "context-match", "context-mismatch", "membership-match", "membership-mismatch", "truncated"] as const;
+export type CalendarFeedTraceEvent = typeof calendarFeedTraceEvents[number];
+type Expected = { tenantId: string; userId: string; membershipId: string; attemptId: string; revision: number; action: string };
+const invocation = new AsyncLocalStorage<{ expected?: Expected; events: CalendarFeedTraceEvent[]; closed: boolean }>();
+export function recordCalendarFeedTrace(event: CalendarFeedTraceEvent): void {
+  const store = invocation.getStore();
+  if (!store || store.closed || !calendarFeedTraceEvents.includes(event)) return;
+  if (store.events.length < 15) store.events.push(event);
+  else if (store.events.length === 15) store.events.push("truncated");
+}
+export function recordCalendarFeedContext(tenantId: string, userId: string, input: { action: string; revision: number; attemptId: string }): void {
+  const expected = invocation.getStore()?.expected;
+  if (expected) recordCalendarFeedTrace(tenantId === expected.tenantId && userId === expected.userId && input.action === expected.action && input.revision === expected.revision && input.attemptId === expected.attemptId ? "context-match" : "context-mismatch");
+}
+export function recordCalendarFeedMembership(id: string): void {
+  const expected = invocation.getStore()?.expected;
+  if (expected) recordCalendarFeedTrace(id === expected.membershipId ? "membership-match" : "membership-mismatch");
+}
+export async function captureCalendarFeedTrace<T>(expected: Expected, run: () => Promise<T>) {
+  const events: CalendarFeedTraceEvent[] = [];
+  const snapshot = {} as Expected;
+  // A malformed opt-in fixture cannot introduce getter reads into production.
+  try { for (const key of ["tenantId", "userId", "membershipId", "attemptId", "revision", "action"] as const) {
+    const descriptor = Object.getOwnPropertyDescriptor(expected, key);
+    if (!descriptor || !("value" in descriptor) || (key === "revision" ? !Number.isSafeInteger(descriptor.value) : typeof descriptor.value !== "string")) throw new Error("Calendar trace expected-context refused");
+    Object.defineProperty(snapshot, key, { value: descriptor.value, enumerable: true });
+  } } catch { throw new Error("Calendar trace expected-context refused"); }
+  const store = { expected: snapshot as Expected | undefined, events, closed: false };
+  return invocation.run(store, async () => {
+    try { const value = await run(); return { ok: true as const, value, events: [...events] }; }
+    catch (error) { return { ok: false as const, error, events: [...events] }; }
+    finally { store.closed = true; store.expected = undefined; }
+  });
+}
 export async function executeCalendarFeed(db: CommandDbClient, args: Record<string, unknown>): Promise<{ outcome: "committed" | "replayed"; revision: number }> {
   const { data, error } = await (db as unknown as { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { code?: string } | null }> }).rpc("manage_calendar_feed", args);
   if (error) {
-    if (error.code === "CF409") throw new CommandError("COMMAND_CONFLICT");
-    if (error.code === "42501") throw new CommandError("TENANT_ACCESS_DENIED");
+    if (error.code === "CF409") { recordCalendarFeedTrace("manage-rpcCF409"); throw new CommandError("COMMAND_CONFLICT"); }
+    if (error.code === "42501") { recordCalendarFeedTrace("manage-rpc42501"); throw new CommandError("TENANT_ACCESS_DENIED"); }
+    recordCalendarFeedTrace("manage-rpc-error");
     throw new Error("Calendar write unavailable");
   }
   const result = data as Record<string, unknown> | null;
-  if (!result || !["committed", "replayed"].includes(String(result.outcome)) || !Number.isSafeInteger(result.revision) || Number(result.revision) < 0) throw new Error("Calendar write unavailable");
+  if (!result || !["committed", "replayed"].includes(String(result.outcome)) || !Number.isSafeInteger(result.revision) || Number(result.revision) < 0) { recordCalendarFeedTrace("manage-schema-invalid"); throw new Error("Calendar write unavailable"); }
+  recordCalendarFeedTrace("manage-valid");
   return { outcome: result.outcome as "committed" | "replayed", revision: result.revision as number };
 }
diff --git a/src/server/commands/calendar-feed/manage-calendar-feed.ts b/src/server/commands/calendar-feed/manage-calendar-feed.ts
index e83ca8ab..b2115980 100644
--- a/src/server/commands/calendar-feed/manage-calendar-feed.ts
+++ b/src/server/commands/calendar-feed/manage-calendar-feed.ts
@@ -4,7 +4,7 @@ import { feedKeyFromEnv, FEED_SCHEMA, MANAGE_DOMAIN, issueCalendarFeedToken, sig
 import { readCalendarFeedStatus } from "@/server/read-models/calendar-feed";
 import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
 import { defineCommand, runCommand, type CommandDbClient, type CommandConfig } from "../envelope";
-import { executeCalendarFeed } from "./calendar-feed-db";
+import { executeCalendarFeed, recordCalendarFeedTrace, recordCalendarFeedContext, recordCalendarFeedMembership } from "./calendar-feed-db";
 
 /** Plaintext exists only in execute and its confirmed fresh response. */
 function calendarFeedConfig(action: CalendarFeedAction): Omit<CommandConfig<CalendarFeedIntent, CalendarFeedResult>, "command"> {
@@ -12,14 +12,20 @@ function calendarFeedConfig(action: CalendarFeedAction): Omit<CommandConfig<Cale
     auditable: false, eventType: `calendar_feed_${action}`, targetType: "calendar_feed",
     validateInput: raw => { const result = validateCalendarFeedIntent(raw); return result.ok && result.data.action !== action ? { ok: false, code: "VALIDATION_FAILED" } : result; },
     execute: async ctx => {
+      recordCalendarFeedTrace("execute-enter");
+      recordCalendarFeedContext(ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.input);
       const key = feedKeyFromEnv();
+      recordCalendarFeedTrace("key-ready"); recordCalendarFeedTrace("status-enter");
       const status = await readCalendarFeedStatus(ctx.db as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>, ctx.tenantContext.tenantId, ctx.input.attemptId);
+      recordCalendarFeedMembership(status.membershipId);
       // Reconciliation is read-only. A retry never generates a replacement hash.
       if (status.attemptOutcome === "committed") return { outcome: status.attemptAction === action && status.attemptRevision === ctx.input.revision ? "replayed" : "conflict", revision: status.revision, issuedPath: null };
+      recordCalendarFeedTrace("proof-enter");
       const issued = action === "revoke" ? null : issueCalendarFeedToken(), now = new Date();
       const claims = { schema: FEED_SCHEMA, domain: MANAGE_DOMAIN, operation: action, tenantId: ctx.tenantContext.tenantId, actorId: ctx.tenantContext.userId,
         membershipId: status.membershipId, revision: String(ctx.input.revision), attemptId: ctx.input.attemptId, newHash: issued?.hash ?? "", correlationId: ctx.correlationId,
         keyId: key.keyId, issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 60000).toISOString() };
+      recordCalendarFeedTrace("manage-enter");
       const result = await executeCalendarFeed(ctx.db, { p_tenant_id: claims.tenantId, p_actor_id: claims.actorId, p_membership_id: claims.membershipId,
         p_action: action, p_expected_revision: ctx.input.revision, p_attempt_id: ctx.input.attemptId, p_new_hash: issued?.hash ?? null,
         p_correlation_id: ctx.correlationId, p_claims: claims, p_signature: signFeedProof(claims, key.secret) });
@@ -36,8 +42,12 @@ const commands = {
 export function calendarFeedCommand(action: CalendarFeedAction) { return commands[action]; }
 export async function manageCalendarFeed(client: CommandDbClient, input: unknown, correlationId?: string): Promise<CalendarFeedResult> {
   const validated = validateCalendarFeedIntent(input);
-  if (!validated.ok) return { outcome: "denied", revision: null, issuedPath: null };
+  if (!validated.ok) { recordCalendarFeedTrace("input-invalid"); return { outcome: "denied", revision: null, issuedPath: null }; }
   const result = await runCommand(calendarFeedCommand(validated.data.action), { client, input, correlationId });
-  if (result.ok) return result.data;
+  if (result.ok) { recordCalendarFeedTrace("envelope-success"); return result.data; }
+  const code = result.code;
+  const known = ["UNAUTHENTICATED", "TENANT_MEMBERSHIP_REQUIRED", "PERMISSION_DENIED", "VALIDATION_FAILED", "TENANT_ACCESS_DENIED", "COMMAND_CONFLICT", "SERVER_ERROR"] as const;
+  const entry = known.find(value => value === code);
+  recordCalendarFeedTrace(entry ? `envelope-${entry}` : "envelope-other");
   return { outcome: result.code === "COMMAND_CONFLICT" ? "conflict" : result.code === "SERVER_ERROR" ? "unavailable" : "denied", revision: null, issuedPath: null };
 }
diff --git a/src/server/read-models/calendar-feed.ts b/src/server/read-models/calendar-feed.ts
index 131fe1ae..4cccd98e 100644
--- a/src/server/read-models/calendar-feed.ts
+++ b/src/server/read-models/calendar-feed.ts
@@ -2,13 +2,16 @@ import type { CalendarFeedAbuse, CalendarFeedStatus } from "@/features/calendar-
 import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
 import { resolveCapability } from "@/server/authz/permission-matrix";
 import { CommandError } from "@/server/commands/command-errors";
+import { recordCalendarFeedTrace } from "@/server/commands/calendar-feed/calendar-feed-db";
 import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
 type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
 export async function readCalendarFeedStatus(client: Client, tenantId: string, attemptId?: string): Promise<CalendarFeedStatus> {
   const { data, error } = await client.rpc("read_calendar_feed_status", { p_tenant_id: tenantId, p_attempt_id: attemptId ?? null });
-  if (error?.code === "42501") throw new CommandError("TENANT_ACCESS_DENIED");
-  if (error || !data || typeof data.active !== "boolean" || !Number.isSafeInteger(data.revision) || data.revision < 0 || typeof data.membershipId !== "string" || !Number.isSafeInteger(data.usageCount) || data.usageCount < 0 || (data.lastUsedAt !== null && (typeof data.lastUsedAt !== "string" || !Number.isFinite(Date.parse(data.lastUsedAt)))) || ![null, "committed", "not-found"].includes(data.attemptOutcome)) throw new Error("Calendar status unavailable");
-  if ((data.attemptAction !== null && !["create", "rotate", "revoke"].includes(data.attemptAction)) || (data.attemptRevision !== null && (!Number.isSafeInteger(data.attemptRevision) || data.attemptRevision < 0))) throw new Error("Calendar status unavailable");
+  if (error?.code === "42501") { recordCalendarFeedTrace("status-rpc42501"); throw new CommandError("TENANT_ACCESS_DENIED"); }
+  if (error) recordCalendarFeedTrace("status-rpc-error");
+  if (error || !data || typeof data.active !== "boolean" || !Number.isSafeInteger(data.revision) || data.revision < 0 || typeof data.membershipId !== "string" || !Number.isSafeInteger(data.usageCount) || data.usageCount < 0 || (data.lastUsedAt !== null && (typeof data.lastUsedAt !== "string" || !Number.isFinite(Date.parse(data.lastUsedAt)))) || ![null, "committed", "not-found"].includes(data.attemptOutcome)) { if (!error) recordCalendarFeedTrace("status-schema-invalid"); throw new Error("Calendar status unavailable"); }
+  if ((data.attemptAction !== null && !["create", "rotate", "revoke"].includes(data.attemptAction)) || (data.attemptRevision !== null && (!Number.isSafeInteger(data.attemptRevision) || data.attemptRevision < 0))) { recordCalendarFeedTrace("status-schema-invalid"); throw new Error("Calendar status unavailable"); }
+  recordCalendarFeedTrace("status-valid");
   return { membershipId: data.membershipId, active: data.active, revision: data.revision, usageCount: data.usageCount, lastUsedAt: data.lastUsedAt, attemptOutcome: data.attemptOutcome, attemptAction: data.attemptAction, attemptRevision: data.attemptRevision };
 }
 export async function readCalendarFeedSettings(options: { client?: Client; attemptId?: string } = {}): Promise<{ ok: true; status: CalendarFeedStatus; abuse: CalendarFeedAbuse | null } | { ok: false }> {
diff --git a/tests/integration/commands/calendar-feed.int.test.ts b/tests/integration/commands/calendar-feed.int.test.ts
index 178491d5..35863f8e 100644
--- a/tests/integration/commands/calendar-feed.int.test.ts
+++ b/tests/integration/commands/calendar-feed.int.test.ts
@@ -1,5 +1,7 @@
 import { createHash } from "node:crypto";
 import { describe, test } from "vitest";
+import { writeFile } from "node:fs/promises";
+import { runCalendarFeedCauseProof } from "../../support/calendar-feed-atdd";
 import { expectCalendar as expect } from "../../support/calendar-feed-atdd";
 import { withCalendarFeedFixture, lifecycle, issuedUrl, tokenFromUrl, bookingSeed,
   type ManagementObservation, type FeedResponse } from "../../support/calendar-feed-atdd";
@@ -14,7 +16,16 @@ import { withCalendarFeedFixture, lifecycle, issuedUrl, tokenFromUrl, bookingSee
 // calendar-feed/public-feed.int.test.ts in addition to the existing serial files.
 // P4: every declaration skipped; no fixture, key, SQL, HTTP or resource executes.
 
-describe("15.5 authenticated lifecycle, atomic audit and commit-order", () => {
+// Explicit diagnostic inventory only: no declaration/skip/mutation in normal95.
+if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE === "1") {
+  test("15.5-DIAG001", async () => {
+    const observation = await runCalendarFeedCauseProof();
+    await writeFile("test-results/calendar-feed-cause-proof/observation.json", JSON.stringify(observation) + "\n", { mode: 0o600 });
+    if (!observation.cleanupVerified || !observation.ordinarySettled || !observation.queriesSettled) throw new Error("Cause proof stopped with unverified custody; values redacted");
+  }, 180_000);
+}
+
+if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE !== "1") describe("15.5 authenticated lifecycle, atomic audit and commit-order", () => {
   test("[P0] 15.5-INT001 AC1 AC6 own issuance stores only SHA256 and publishes a fresh URL once", async () => {
     await withCalendarFeedFixture("serial-commands", async fx => {
       const intent = lifecycle("create", 0);
diff --git a/tests/support/calendar-feed-atdd.ts b/tests/support/calendar-feed-atdd.ts
index fce69a9d..976d1f94 100644
--- a/tests/support/calendar-feed-atdd.ts
+++ b/tests/support/calendar-feed-atdd.ts
@@ -7,13 +7,14 @@ import { randomUUID } from "node:crypto";
 import { readFile } from "node:fs/promises";
 import { expect as vitestExpect } from "vitest";
 import { adminQuery, adminSession } from "../factories/admin-sql";
-import { seedRoleAwarePhaseAUsers, makeAuthedServerClient, makeAnonServerClient, deleteAuthUser, type FixtureUser, type TestServerClient } from "../factories/tenants";
+import { seedRoleAwarePhaseAUsers, makeAuthedServerClient, makeAnonServerClient, deleteAuthUser, createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, type FixtureUser, type TestServerClient } from "../factories/tenants";
 import { withBookingFixture, bookingCommand, bookingInput, type BookingFixture } from "./bookings-atdd";
 import { realSeriesInput, reviewRealSeries } from "./booking-series-atdd";
 import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
 import { updateBookingSeries } from "@/server/commands/bookings/update-booking-series";
 import { runCommand } from "@/server/commands/envelope";
 import { manageCalendarFeed } from "@/server/commands/calendar-feed/manage-calendar-feed";
+import { captureCalendarFeedTrace, type CalendarFeedTraceEvent } from "@/server/commands/calendar-feed/calendar-feed-db";
 import { readCalendarFeedStatus } from "@/server/read-models/calendar-feed";
 import { publicCalendarFeed } from "@/server/calendar-feed/public-feed";
 import { feedKeyFromEnv, issueCalendarFeedToken, hashFeedToken, FEED_SCHEMA, FETCH_DOMAIN, MANAGE_DOMAIN, signFeedProof } from "@/server/calendar-feed/attestation";
@@ -737,3 +738,147 @@ export function issuedUrl(result: ManagementObservation): string {
   if (!result.issuedUrl) throw calendarFixtureOrigin("scenario-issued-committed-missing-url");
   return result.issuedUrl;
 }
+
+
+// Cause-proof decision seam: no native error text or inferred SQL engine phase.
+export function calendarCauseProofSelection(events: readonly CalendarFeedTraceEvent[]): "status" | "manage" | "not-selected" {
+  if (!events.includes("context-match") || events.includes("context-mismatch") || events.includes("membership-mismatch") || events.includes("truncated")) return "not-selected";
+  if (events.includes("status-rpc42501")) return "status";
+  if (events.includes("manage-rpc42501") && events.includes("membership-match")) return "manage";
+  return "not-selected";
+}
+export async function calendarCauseProofIdle(client: { readyForQuery?: boolean }, now = Date.now, sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))) {
+  const deadline = now() + 10_000;
+  // Installed pg8.22 only sets readyForQuery after the server protocol boundary.
+  // A query_timeout rejection alone is NOT proof that its server query ended.
+  while (client.readyForQuery !== true && now() < deadline) await sleep(20);
+  return client.readyForQuery === true;
+}
+// End cause-proof decision seam.
+
+/** Explicit-mode-only fixture composition. Canonical cleanup is conditional on
+ * actual command/protocol settlement; withBookingFixture's unconditional finally
+ * is deliberately not used for this diagnostic path. Normal95 cases are intact. */
+export async function runCalendarFeedCauseProof() {
+  const report = { kind: "calendar_feed.cause_proof", mode: "cause-proof", outcome: "CAPTURE_UNAVAILABLE",
+    events: [] as CalendarFeedTraceEvent[], baseline: "not-selected", sqlState: null as string | null,
+    cleanupVerified: true, ordinarySettled: true, queriesSettled: true, failures: [] as string[] };
+  let fixture: Awaited<ReturnType<typeof createRoleAwarePhaseAFixture>> | undefined;
+  const fail = (stage: string) => { report.failures.push(stage); report.cleanupVerified = false; };
+  try {
+    if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE !== "1") throw Error("Diagnostic mode refused");
+    fixture = await createRoleAwarePhaseAFixture();
+    const tenantId = fixture.base.tenantA.id, userId = fixture.users.montor.id;
+    const [member] = await adminQuery<{id:string}>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId,userId]);
+    if (!member) throw Error("Controlled subject unavailable");
+    const client = await makeAuthedServerClient(fixture.users.montor), intent = lifecycle("create",0);
+    // Await the ACTUAL command, not a raced timeout or public-fetch pending set.
+    report.ordinarySettled = false;
+    const observed = await captureCalendarFeedTrace({ tenantId,userId,membershipId:member.id,attemptId:intent.attemptId,action:"create",revision:0 },
+      () => manageCalendarFeed(client as never,{action:"create",revision:0,attemptId:intent.attemptId},intent.correlationId));
+    report.ordinarySettled = true; report.events = observed.events;
+    report.baseline = calendarCauseProofSelection(observed.events);
+    report.outcome = !observed.ok ? "PRE_SQL_STOP" : observed.value.outcome === "committed" ? "ORDINARY_SUCCESS"
+      : observed.events.includes("context-mismatch") || observed.events.includes("membership-mismatch") || observed.events.includes("truncated") ? "INCOMPARABLE" : "PRE_SQL_STOP";
+    if (report.baseline !== "not-selected") {
+      const runtime = await import("../../scripts/ci/with-calendar-feed-runtime.mjs");
+      const { readFile } = await import("node:fs/promises");
+      type Connection = ReturnType<typeof runtime.createCalendarFeedDatabaseClient>;
+      let db: Connection | undefined, fresh: Connection | undefined, stack: Awaited<ReturnType<typeof runtime.qualifyCalendarFeedCauseProof>> | undefined;
+      let beforeState: string | undefined, beforeCatalog: string | undefined, transaction = false;
+      const ready = async (connection: Connection) => {
+        const idle = await calendarCauseProofIdle(connection as unknown as {readyForQuery?:boolean});
+        if (!idle) { report.queriesSettled = false; fail("protocol-unsettled"); }
+        return idle;
+      };
+      const qualify = async (connection: Connection, qualification: Awaited<ReturnType<typeof runtime.qualifyCalendarFeedCauseProof>>) => {
+        await connection.connect(); await runtime.readCalendarFeedSetupAuthority(connection);
+        const privacy = await runtime.readCalendarFeedPrivacyPreflight(connection);
+        if (!privacy.controls.every(control => control.matchesRequired)) throw Error("Privacy refused");
+        const ledger = await connection.query("select version,name from supabase_migrations.schema_migrations order by version");
+        if (JSON.stringify(ledger.rows.map(row=>({version:String(row.version),name:row.name}))) !== JSON.stringify(qualification.migrations)) throw Error("Ledger refused");
+      };
+      const identity = report.baseline === "status" ? "public.read_calendar_feed_status(uuid,uuid)"
+        : "public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)";
+      const catalog = async (connection: Connection) => {
+        const result = await connection.query("select p.oid::text, p.proname, p.prosrc, pg_get_userbyid(p.proowner) owner, p.prosecdef, p.proconfig, p.proacl::text from pg_proc p where p.oid=to_regprocedure($1)",[identity]);
+        if (result.rows.length !== 1) throw Error("Function identity refused");
+        const row = result.rows[0], migration = (await readFile(new URL("../../supabase/migrations/20261020220000_personal_calendar_feed.sql",import.meta.url),"utf8")).replaceAll("\r\n","\n");
+        const start = migration.indexOf("create function public."+row.proname+"("), body = migration.indexOf("as $$",start), end = migration.indexOf("$$;",body+5);
+        if (start < 0 || body < start || end < body || row.owner !== "calendar_feed_owner" || row.prosecdef !== true
+          || !row.proconfig?.includes('search_path=""') || row.prosrc.trim() !== migration.slice(body+5,end).trim()) throw Error("Original function source refused");
+        return JSON.stringify(result.rows);
+      };
+      const state = async (connection: Connection) => JSON.stringify((await connection.query(
+        "select coalesce((select jsonb_agg(to_jsonb(t) order by t.id) from public.calendar_feed_tokens t where tenant_id=$1),'[]'::jsonb) tokens, coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from public.audit_events a where tenant_id=$1),'[]'::jsonb) audit",[tenantId])).rows);
+      try {
+        stack = await runtime.qualifyCalendarFeedCauseProof(); db = runtime.createCalendarFeedDatabaseClient(stack.stack,"proof");
+        db.on("error",()=>{ report.queriesSettled=false; fail("protocol-unsettled"); });
+        await qualify(db,stack);
+        beforeCatalog = await catalog(db); beforeState = await state(db);
+        await db.query("begin isolation level repeatable read"); transaction=true;
+        await db.query("set local statement_timeout='5s'; set local lock_timeout='2s'");
+        if(await state(db)!==beforeState) throw Error("Controlled snapshot changed");
+        await db.query("savepoint controlled_baseline");
+        const claims = JSON.stringify({sub:userId,role:"authenticated"});
+        await db.query("select set_config('request.jwt.claims',$1,true)",[claims]);
+        await db.query("set local session authorization authenticated");
+        const at=new Date(); let managementValues: unknown[] | undefined;
+        if(report.baseline==="manage") {
+          const key=feedKeyFromEnv(), issued=issueCalendarFeedToken(), attemptId=randomUUID(), correlationId=randomUUID();
+          const proof={schema:FEED_SCHEMA,domain:MANAGE_DOMAIN,operation:"create",tenantId,actorId:userId,membershipId:member.id,revision:"0",attemptId,newHash:issued.hash,correlationId,keyId:key.keyId,issuedAt:at.toISOString(),expiresAt:new Date(at.getTime()+60000).toISOString()};
+          managementValues=[tenantId,userId,member.id,"create",0,attemptId,issued.hash,correlationId,proof,signFeedProof(proof,key.secret)];
+        }
+        const restricted = await db.query("select session_user=current_user and current_user='authenticated' and not a.rolsuper and not a.rolbypassrls and not b.rolsuper and not b.rolbypassrls and auth.uid()=$1::uuid and current_setting('request.jwt.claims')::jsonb->>'role'='authenticated' and current_setting('log_statement')='none' and current_setting('log_min_error_statement')='panic' and current_setting('log_parameter_max_length')='0' and current_setting('log_parameter_max_length_on_error')='0' as qualified from pg_roles a join pg_roles b on b.rolname=current_user where a.rolname=session_user",[userId]);
+        if (restricted.rows.length!==1 || restricted.rows[0].qualified!==true || Date.now()-at.getTime()>5000) throw Error("Restricted identity or clock refused");
+        // This is a NEW controlled direct-SQL call, never the old JWT session,
+        // snapshot, proof bytes or first engine cause. At most ONE invocation.
+        try {
+          if(report.baseline==="status") await db.query("select public.read_calendar_feed_status($1::uuid,$2::uuid)",[tenantId,intent.attemptId]);
+          else await db.query("select public.manage_calendar_feed($1::uuid,$2::uuid,$3::uuid,$4::text,$5::integer,$6::uuid,$7::text,$8::uuid,$9::jsonb,$10::text)",managementValues);
+          report.outcome="NONREPRODUCED";
+        } catch(error) {
+          let code:unknown; try { code=Object.getOwnPropertyDescriptor(error,"code")?.value; } catch { /* UNKNOWN */ }
+          const allowed=["42501","CF409","57014","08006","25P02","42P01","42883","42703","3F000","23505"];
+          report.sqlState=typeof code==="string"&&allowed.includes(code)?code:null;
+          report.outcome=code==="42501"?"AMBIGUOUS_SQL42501":code==="CF409"?"NONREPRODUCED":"UNKNOWN_ENGINE_ERROR";
+        }
+        if (!await ready(db)) throw Error("Query protocol unverified");
+        await db.query("rollback to savepoint controlled_baseline");
+        if(Date.now()-at.getTime()>10000) report.outcome="INCOMPARABLE";
+      } catch { report.outcome="INCOMPARABLE"; report.failures.push("baseline-qualification-or-call"); }
+      finally {
+        if(db && await ready(db)) {
+          try { if(transaction) { await db.query("rollback"); transaction=false; } } catch { fail("baseline-rollback"); }
+          if(!transaction) {
+            try { await db.query("reset session authorization; reset role"); await runtime.readCalendarFeedSetupAuthority(db); } catch { fail("baseline-reset"); }
+            try { if(beforeCatalog!==undefined && await catalog(db)!==beforeCatalog || beforeState!==undefined && await state(db)!==beforeState) fail("baseline-state"); } catch { fail("baseline-state"); }
+          }
+        }
+        if(db) { try { await db.end(); } catch { fail("baseline-close"); } }
+        if(stack && report.queriesSettled && !transaction) {
+          try {
+            const again=await runtime.qualifyCalendarFeedCauseProof();
+            if(again.stack.db.Id!==stack.stack.db.Id || again.stack.gateway.Id!==stack.stack.gateway.Id) throw Error("Fresh stack identity refused");
+            fresh=runtime.createCalendarFeedDatabaseClient(again.stack,"absence");
+            fresh.on("error",()=>{ report.queriesSettled=false; fail("fresh-protocol"); });
+            await qualify(fresh,again);
+            if(beforeCatalog!==undefined && await catalog(fresh)!==beforeCatalog || beforeState!==undefined && await state(fresh)!==beforeState) fail("fresh-state");
+          } catch { fail("fresh-qualification-or-state"); }
+          finally { if(fresh) { if(!await ready(fresh)) fail("fresh-protocol"); try { await fresh.end(); } catch { fail("fresh-close"); } } }
+        }
+      }
+    }
+  } catch { fail("fixture-or-ordinary"); report.outcome="CAPTURE_UNAVAILABLE"; }
+  // No raced timeout counts as command or query completion. If unverified, keep
+  // canonical fixture custody rather than deleting rows/Auth against live refs.
+  if(fixture && report.ordinarySettled && report.queriesSettled && report.cleanupVerified) {
+    try { await cleanupCalendarOwnedRows([fixture.base.tenantA.id,fixture.base.tenantB.id]); } catch { fail("fixture-rows"); }
+    try { await cleanupRoleAwarePhaseAFixture(fixture); } catch { fail("fixture-canonical"); }
+    try {
+      if((await adminQuery("select 1 from public.tenants where id=any($1::uuid[]) limit 1",[[fixture.base.tenantA.id,fixture.base.tenantB.id]])).length) fail("fixture-absence");
+    } catch { fail("fixture-absence"); }
+  } else if(fixture) fail("fixture-custody-retained");
+  if(!report.cleanupVerified || !report.ordinarySettled || !report.queriesSettled) report.outcome="CLEANUP_UNVERIFIED";
+  return report;
+}
diff --git a/tests/support/calendar-feed-ci-contract.ts b/tests/support/calendar-feed-ci-contract.ts
index 3c6bafb4..ebadcee5 100644
--- a/tests/support/calendar-feed-ci-contract.ts
+++ b/tests/support/calendar-feed-ci-contract.ts
@@ -3,7 +3,7 @@ import { createHash } from "node:crypto";
 import { readFileSync } from "node:fs";
 
 const wrapperPath = new URL("../../scripts/ci/with-calendar-feed-runtime.mjs", import.meta.url);
-const wrapperSha256 = "8f142ebe8a015aacc38ae55b37f36f98c61daa0621b62fb266c3991cedecbe8d";
+const wrapperSha256 = "44798a4e836ad7e99e0c38f6aaf9ddce4bde4605e39722e432d0884f1fa85560";
 const integrationArgs = ["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"];
 const browserArgs = ["run", "test:smoke"];
 const stackBinding = "          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}";
@@ -26,6 +26,46 @@ const browserEntry = [
   "        run: node scripts/ci/with-calendar-feed-runtime.mjs browser",
 ].join("\n") + "\n";
 
+// Exact newly reviewed diagnostic fragments only. Every unrelated byte survives.
+const causeProofInverse: readonly [string, string][] = [
+  [
+    "run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}",
+    "run-name: ${{ github.event_name == 'workflow_dispatch' && format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('CI {0}', github.ref_name) }}"
+  ],
+  [
+    "    inputs:\n      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n",
+    "    inputs:\n"
+  ],
+  [
+    "          CHECKPOINT_ID: ${{ inputs.checkpoint_id }}\n          CAUSE_PROOF: ${{ inputs.calendar_feed_cause_proof || false }}\n          RELEASE_VALIDATION: ${{ inputs.release_validation || false }}\n          OTHER_DIAGNOSTICS: ${{ inputs.native_stream_probe || inputs.fixed_chromium_paired_probe || inputs.fixed_chromium_application_verification || false }}\n",
+    "          CHECKPOINT_ID: ${{ inputs.checkpoint_id }}\n"
+  ],
+  [
+    "          set -euo pipefail\n          if [ \"$CAUSE_PROOF\" = true ]; then\n            test \"$GITHUB_EVENT_NAME\" = workflow_dispatch\n            test \"$RELEASE_VALIDATION\" = false\n            test \"$OTHER_DIAGNOSTICS\" = false\n          fi\n          if [ \"$GITHUB_EVENT_NAME\" = workflow_dispatch ]; then",
+    "          set -euo pipefail\n          if [ \"$GITHUB_EVENT_NAME\" = workflow_dispatch ]; then"
+  ],
+  [
+    "  recovery-storage-loader:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
+    "  recovery-storage-loader:\n"
+  ],
+  [
+    "  e2e:\n    if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
+    "  e2e:\n"
+  ],
+  [
+    "      - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)\n        if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
+    "      - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)\n"
+  ],
+  [
+    "      - name: Upload native full integration JSON\n        if: ${{ !cancelled() && !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}\n",
+    "      - name: Upload native full integration JSON\n        if: ${{ !cancelled() }}\n"
+  ],
+  [
+    "      - name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)\n        if: ${{ github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}\n        env:\n          CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}\n          CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT: ${{ inputs.checkpoint_id }}\n        run: node scripts/ci/with-calendar-feed-runtime.mjs cause-proof\n\n      - name: Upload native calendar feed cause proof JSON\n        if: ${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}\n        uses: actions/upload-artifact@v4\n        with:\n          name: native-calendar-feed-cause-proof\n          path: test-results/calendar-feed-cause-proof/upload/\n          retention-days: 7\n          if-no-files-found: error\n\n      # Stage 8: DB-backed integration + cross-tenant RLS-negative suites.\n",
+    "      # Stage 8: DB-backed integration + cross-tenant RLS-negative suites.\n"
+  ]
+];
+
 function literalArgs(source: string, name: string, expected: string[]): string[] {
   const declarations = [...source.matchAll(new RegExp(`^export const ${name} = Object\\.freeze\\((\\[[^\\n]*\\])\\);$`, "gm"))];
   assert.equal(declarations.length, 1, `calendar feed CI ${name} declaration`);
@@ -36,7 +76,7 @@ function literalArgs(source: string, name: string, expected: string[]): string[]
 
 /**
  * Expose the real delegated commands to existing CI contract checks. Only the
- * two reviewed wrapper entries are inverted; every other workflow byte survives.
+ * two wrapper entries and finite diagnostic fragments are inverted; all other bytes survive.
  * Reading pinned source (never importing/evaluating it) also rejects unrelated
  * wrapper edits instead of granting them the historical workflow inverse.
  */
@@ -45,7 +85,12 @@ export function projectCalendarFeedCiCommands(workflow: string, wrapperSource =
   const integration = literalArgs(source, "INTEGRATION_ARGS", integrationArgs);
   const browser = literalArgs(source, "BROWSER_ARGS", browserArgs);
   assert.equal(createHash("sha256").update(source).digest("hex"), wrapperSha256, "calendar feed CI reviewed wrapper source");
+  literalArgs(source, "CAUSE_PROOF_ARGS", ["exec","vitest","run","tests/integration/commands/calendar-feed.int.test.ts","--maxWorkers=1","--no-file-parallelism","--testNamePattern=^15[.]5-DIAG001$","--reporter=default","--reporter=github-actions","--reporter=json","--outputFile=test-results/calendar-feed-cause-proof/native.json"]);
   let projected = workflow.replaceAll("\r\n", "\n");
+  for (const [entry, replacement] of causeProofInverse) {
+    assert.equal(projected.split(entry).length - 1, 1, "calendar feed exact diagnostic workflow fragment");
+    projected = projected.replace(entry, replacement);
+  }
   for (const [entry, replacement] of [
     [dbEntry, [
       "      - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)",
diff --git a/tests/unit/scripts/ci/checkpoint-dispatch.test.ts b/tests/unit/scripts/ci/checkpoint-dispatch.test.ts
index 21c88025..8d0f2694 100644
--- a/tests/unit/scripts/ci/checkpoint-dispatch.test.ts
+++ b/tests/unit/scripts/ci/checkpoint-dispatch.test.ts
@@ -5,7 +5,8 @@ import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "no
 import { tmpdir } from "node:os";
 import { join } from "node:path";
 import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
-import { checkpoint, checkpointTitle, parseArgs, validateRequest } from "../../../../scripts/ci/checkpoint-dispatch.mjs";
+import { checkpoint, checkpointTitle, parseArgs, validateRequest, assertCauseProofWorkflow } from "../../../../scripts/ci/checkpoint-dispatch.mjs";
+import { createHash } from "node:crypto";
 
 const sha = "a".repeat(40);
 const request = { repo: "owner/repo", ref: "codex/checkpoint", sha };
@@ -20,9 +21,16 @@ function fixture() {
   let remoteSha = sha;
   let actor = "owner";
   let fullPage = false;
+  let defaultWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
   const api = (method: string, endpoint: string, body?: unknown) => {
     calls.push({ method, endpoint, body });
     if (endpoint === "user") return { login: actor };
+    if (endpoint === "repos/owner/repo") return { default_branch: "main" };
+    if (endpoint.includes("/contents/.github/workflows/ci.yml?ref=")) {
+      const text = endpoint.endsWith("ref=main") ? defaultWorkflow : readFileSync(".github/workflows/ci.yml", "utf8");
+      const bytes = Buffer.from(text);
+      return { encoding: "base64", content: bytes.toString("base64"), sha: createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") };
+    }
     if (endpoint.endsWith("/permission")) return { permission };
     if (endpoint.includes("/branches/")) return { commit: { sha: remoteSha } };
     if (endpoint.endsWith("/workflows/ci.yml")) return { id: 42, path: ".github/workflows/ci.yml", state: "active" };
@@ -41,7 +49,7 @@ function fixture() {
     const current = record();
     return { id: 123, repository: { full_name: request.repo }, workflow_id: 42,
       path: ".github/workflows/ci.yml", event: "workflow_dispatch", head_branch: request.ref,
-      head_sha: sha, display_title: checkpointTitle(current.checkpoint_id, sha),
+      head_sha: sha, display_title: checkpointTitle(current.checkpoint_id, sha, current.verification_mode),
       actor: { login: "owner" }, triggering_actor: { login: "owner" }, run_attempt: 1,
       status: "queued", conclusion: null, ...changes };
   };
@@ -49,7 +57,7 @@ function fixture() {
     setRuns(value: Record<string, unknown>[]) { runs = value; },
     failDispatch() { failDispatch = true; }, failCancel() { failCancel = true; },
     permission(value: string) { permission = value; }, remoteSha(value: string) { remoteSha = value; },
-    actor(value: string) { actor = value; }, fullPage() { fullPage = true; },
+    actor(value: string) { actor = value; }, fullPage() { fullPage = true; }, defaultWorkflow(value: string) { defaultWorkflow = value; },
     cleanup() { rmSync(directory, { recursive: true, force: true }); } };
 }
 function withFixture(body: (value: ReturnType<typeof fixture>) => void) {
@@ -193,9 +201,14 @@ test("native workflow admission executes exact source binding and preserves PR/p
   assert.ok(block, "extract the checked-in admission block, not a duplicate implementation");
   const script = block[1].split(/\r?\n/).map((line) => line.slice(10)).join("\n");
   const base = { GITHUB_EVENT_NAME: "workflow_dispatch", EXPECTED_SHA: sha, GITHUB_SHA: sha,
+    CAUSE_PROOF: "false", RELEASE_VALIDATION: "false", OTHER_DIAGNOSTICS: "false",
     CHECKPOINT_ID: "12345678-1234-4123-8123-123456789abc", GITHUB_RUN_ATTEMPT: "1", GITHUB_REF_TYPE: "branch" };
   const cases: [string, Record<string, string>, boolean][] = [
     ["valid dispatch", {}, true],
+    ["valid diagnostic", { CAUSE_PROOF: "true" }, true],
+    ["diagnostic release conflict", { CAUSE_PROOF: "true", RELEASE_VALIDATION: "true" }, false],
+    ["diagnostic other probe conflict", { CAUSE_PROOF: "true", OTHER_DIAGNOSTICS: "true" }, false],
+    ["diagnostic PR refused", { CAUSE_PROOF: "true", GITHUB_EVENT_NAME: "pull_request" }, false],
     ["head drift", { GITHUB_SHA: "b".repeat(40) }, false],
     ["malformed SHA", { EXPECTED_SHA: "aaaa" }, false],
     ["malformed UUID", { CHECKPOINT_ID: "not-a-checkpoint" }, false],
@@ -227,3 +240,37 @@ test("validation selection cannot introduce arbitrary workflow inputs", () => wi
   assert.deepEqual(parseArgs(["dispatch", "--release-validation", "true"]).options, { release_validation: "true" });
   assert.throws(() => parseArgs(["dispatch", "--release-validation", "true", "--release-validation", "false"]));
 }));
+
+
+test("diagnostic selection is durable before the only POST and status remains zero acceptance", () => withFixture(f => {
+  const api = f.dependencies.api;
+  f.dependencies.api=(method,endpoint,body)=>{
+    if(method==="POST") { assert.equal(f.record().verification_mode,"calendar-feed-cause-proof"); assert.equal(f.record().phase,"dispatch-uncertain"); }
+    return api(method,endpoint,body);
+  };
+  const result=checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies);
+  assert.equal(result.evidence_class,"diagnostic-only"); assert.equal(result.acceptance_credit,0);
+  assert.deepEqual((mutations(f)[0].body as {inputs:unknown}).inputs,{expected_sha:sha,checkpoint_id:f.record().checkpoint_id,release_validation:"false",calendar_feed_cause_proof:"true"});
+  f.setRuns([f.run({status:"completed",conclusion:"success"})]);
+  assert.equal(f.status().evidence_class,"diagnostic-only"); assert.equal(f.status().acceptance_credit,0);
+  assert.throws(f.dispatch,/already exists/); assert.equal(mutations(f).length,1);
+}));
+test("diagnostic availability or mode conflicts refuse before POST and cannot fall back",()=>{
+  withFixture(f=>{f.defaultWorkflow("name: old workflow");assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/unavailable/);assert.equal(mutations(f).length,0);});
+  for(const options of [{cause_proof:"other"},{cause_proof:"true",release_validation:"true"}])withFixture(f=>{assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,...options},f.dependencies));assert.equal(mutations(f).length,0);});
+  assert.deepEqual(parseArgs(["dispatch","--cause-proof","true"]).options,{cause_proof:"true"});
+  assert.throws(()=>parseArgs(["dispatch","--cause-proof","true","--cause-proof","false"]));
+  assert.throws(()=>parseArgs(["status","--cause-proof","true"]));
+  assert.throws(()=>assertCauseProofWorkflow(readFileSync(".github/workflows/ci.yml","utf8").replace("default: false","default: true")));
+});
+test("diagnostic uncertain dispatch and wrong-mode title never select or resend normal work",()=>withFixture(f=>{
+  f.failDispatch(); assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/uncertain/);
+  f.setRuns([f.run({display_title:checkpointTitle(f.record().checkpoint_id,sha)})]);
+  assert.equal(f.status().phase,"dispatch-uncertain"); assert.equal(f.status().evidence_class,"diagnostic-only");assert.equal(mutations(f).length,1);
+}));
+test("legacy mode-less records remain normal and corrupt diagnostic selections fail closed",()=>withFixture(f=>{
+  f.dispatch();const old=f.record();delete old.verification_mode;delete old.cause_proof;writeFileSync(f.state,JSON.stringify(old));f.setRuns([f.run()]);
+  assert.equal(f.status().verification_mode,"normal");
+  const corrupt=f.record();corrupt.cause_proof=true;corrupt.verification_mode="normal";writeFileSync(f.state,JSON.stringify(corrupt));
+  assert.throws(f.status,/verification mode/);assert.equal(mutations(f).length,1);
+}));
diff --git a/tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts b/tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts
index 7d08c0a3..d8d61447 100644
--- a/tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts
+++ b/tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts
@@ -4,9 +4,15 @@ import { createHash } from "node:crypto";
 import { readFileSync } from "node:fs";
 import * as nodeModule from "node:module";
 import { EventEmitter } from "node:events";
+import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
+import { join, resolve } from "node:path";
+import { tmpdir } from "node:os";
 import { pathToFileURL } from "node:url";
 import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
-import { INTEGRATION_ARGS, BROWSER_ARGS, FEED_FUNCTIONS, validateAdmission, validateStackIdentity, createCalendarFeedDatabaseClient, createTelemetryObserver, hasSensitiveOutput, createOwnedGroupStopper, ownsListenerRecord, waitForOwnedHttp, runCalendarFeedRuntime } from "../../../../scripts/ci/with-calendar-feed-runtime.mjs";
+import { INTEGRATION_ARGS, BROWSER_ARGS, CAUSE_PROOF_ARGS, FEED_FUNCTIONS, validateAdmission, validateStackIdentity, validateCauseProofObservation, finishCauseProof, createCalendarFeedDatabaseClient, createTelemetryObserver, hasSensitiveOutput, createOwnedGroupStopper, ownsListenerRecord, waitForOwnedHttp, runCalendarFeedRuntime } from "../../../../scripts/ci/with-calendar-feed-runtime.mjs";
+import { captureCalendarFeedTrace, recordCalendarFeedTrace, recordCalendarFeedContext, recordCalendarFeedMembership, executeCalendarFeed } from "../../../../src/server/commands/calendar-feed/calendar-feed-db";
+import { CommandError } from "../../../../src/server/commands/command-errors";
+import { validateCalendarFeedIntent } from "../../../../src/features/calendar-feed/validation";
 
 const env = {
   NODE_ENV: "test" as const,
@@ -1344,3 +1350,116 @@ test("known proof values and actual keys flag leaks while exact infrastructure a
   assert.equal(records.length, 0);
   for (const line of ["GET - Local: http://127.0.0.1:3195", "- Local: http://127.0.0.1:3195 request", "- Network: http://203.0.113.7:3195", "- Local: http://127.0.0.1:3195 " + Buffer.alloc(32, 29).toString("base64url")]) assert.equal(hasSensitiveOutput(line, params), true);
 });
+
+
+const diagnosticEnv={...env,GITHUB_SHA:"a".repeat(40),GITHUB_EVENT_NAME:"workflow_dispatch",CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT:keyId};
+const observation=()=>({kind:"calendar_feed.cause_proof",mode:"cause-proof",outcome:"AMBIGUOUS_SQL42501",events:["execute-enter","context-match","status-rpc42501"],baseline:"status",sqlState:"42501",cleanupVerified:true,ordinarySettled:true,queriesSettled:true,failures:[]});
+const traceExpected={tenantId:"owned-tenant",userId:"owned-user",membershipId:"owned-member",attemptId:"owned-attempt",action:"create",revision:0};
+test("actual per-invocation trace preserves once-call value and error identity and isolates concurrent and nested scopes",async()=>{
+  const value={},failure={private:"PRIVATE"};let calls=0;
+  const result=await captureCalendarFeedTrace(traceExpected,async()=>{calls++;recordCalendarFeedContext("owned-tenant","owned-user",{action:"create",revision:0,attemptId:"owned-attempt"});recordCalendarFeedMembership("owned-member");return value;});
+  assert.equal(calls,1);assert.equal(result.ok&&result.value,value);assert.deepEqual(result.events,["context-match","membership-match"]);
+  const bad=await captureCalendarFeedTrace(traceExpected,async()=>{throw failure;});assert.equal(!bad.ok&&bad.error,failure);
+  const [a,b]=await Promise.all([captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("status-enter");await Promise.resolve();recordCalendarFeedTrace("status-valid");}),captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("manage-enter");})]);
+  assert.deepEqual(a.events,["status-enter","status-valid"]);assert.deepEqual(b.events,["manage-enter"]);
+  const outer=await captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("execute-enter");const inner=await captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("status-enter");});assert.deepEqual(inner.events,["status-enter"]);recordCalendarFeedTrace("key-ready");});assert.deepEqual(outer.events,["execute-enter","key-ready"]);
+  recordCalendarFeedTrace("status-enter");assert.deepEqual((await captureCalendarFeedTrace(traceExpected,async()=>{})).events,[]);
+});
+test("actual trace bounds hostile expected getters and event overflow without serializing values",async()=>{
+  let getters=0,run=0;const bad=Object.defineProperty({...traceExpected},"tenantId",{get(){getters++;throw Error("PRIVATE");}});
+  await assert.rejects(captureCalendarFeedTrace(bad,async()=>{run++;}),/expected-context refused/);assert.equal(getters,0);assert.equal(run,0);
+  const result=await captureCalendarFeedTrace(traceExpected,async()=>{for(let i=0;i<40;i++)recordCalendarFeedTrace("status-enter");});assert.equal(result.events.length,16);assert.equal(result.events[15],"truncated");assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));
+});
+test("actual management adapter records each existing error branch after one original RPC await",async()=>{
+  for(const [code,event]of [["42501","manage-rpc42501"],["CF409","manage-rpcCF409"],["unknown","manage-rpc-error"]] as const){let calls=0;const args={private:"PRIVATE"};const client={rpc:async(name:string,received:unknown)=>{calls++;assert.equal(name,"manage_calendar_feed");assert.equal(received,args);return{data:null,error:{code}};}};
+    const result=await captureCalendarFeedTrace(traceExpected,()=>executeCalendarFeed(client as never,args));assert.equal(result.ok,false);assert.equal(calls,1);assert.deepEqual(result.events,[event]);assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));
+  }
+  const result=await captureCalendarFeedTrace(traceExpected,()=>executeCalendarFeed({rpc:async()=>({data:{outcome:"committed",revision:1},error:null})} as never,{}));assert.equal(result.ok&&result.value.revision,1);assert.deepEqual(result.events,["manage-valid"]);
+});
+test("actual baseline decision chooses one observed boundary only and pg timeout is not protocol settlement",async()=>{
+  const seams=await actualFixtureOrigins();
+  assert.equal(seams.calendarCauseProofSelection(["context-match","status-rpc42501"]),"status");
+  assert.equal(seams.calendarCauseProofSelection(["context-match","membership-match","manage-rpc42501"]),"manage");
+  for(const events of [["status-rpc42501"],["context-match","membership-mismatch","manage-rpc42501"],["context-match","status-rpc42501","truncated"],["context-match","status-rpc-error"]])assert.equal(seams.calendarCauseProofSelection(events),"not-selected");
+  let now=0;const client={readyForQuery:false};assert.equal(await seams.calendarCauseProofIdle(client,()=>now,async()=>{now+=1000;}),false);
+  now=0;assert.equal(await seams.calendarCauseProofIdle(client,()=>now,async()=>{now+=1000;if(now===3000)client.readyForQuery=true;}),true);
+});
+test("cause-proof launches only fixed one-case argv and joins diagnostic work before exact key deletion",async()=>{
+  const h=harness();let verified=false,finished=false;
+  const result=await runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},readDiagnostic:async()=>{verified=true;return observation();},finishDiagnostic:async(receipt:{keyDeleted:boolean})=>{assert.equal(verified,true);assert.equal(receipt.keyDeleted,true);finished=true;return true;}});
+  assert.equal(result.exitCode,0);assert.equal(h.launches.length,1);assert.equal(h.launches[0].command,"pnpm");assert.deepEqual(h.launches[0].args,CAUSE_PROOF_ARGS);assert.equal(h.launches[0].childEnv.CALENDAR_FEED_CAUSE_PROOF_MODE,"1");assert.ok(!h.events.includes("ready"));assert.ok(!h.events.includes("port-checked"));assert.equal(finished,true);assert.ok(h.events.indexOf("settled:0")<h.events.indexOf("delete"));
+});
+test("abnormal or unverified diagnostic work retains key custody and never infers cleanup from child exit",async()=>{
+  for(const failChild of [true,false]){const h=harness(failChild?{failChild:0}:{});const result=await runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},readDiagnostic:async()=>{throw Error("PRIVATE pending work");},finishDiagnostic:async()=>true});assert.equal(result.exitCode,1);assert.equal(result.receipt.keyDeleted,false);assert.ok(result.receipt.custody);assert.ok(!h.events.includes("delete"));assert.ok(!JSON.stringify(result.receipt).includes("PRIVATE"));}
+  const h=harness();const result=await runCalendarFeedRuntime({mode:"cause-proof",env:{...diagnosticEnv,GITHUB_RUN_ATTEMPT:"2",CALENDAR_FEED_CI_DISPOSABLE_STACK:"123:2:db"},platform:"linux"},h.deps);assert.equal(result.exitCode,1);assert.equal(h.launches.length,0);assert.ok(!h.events.includes("entropy"));
+});
+test("diagnostic wire schema refuses pending cleanup unknown fields values and getters without raw output",()=>{
+  assert.equal(validateCauseProofObservation(observation()).outcome,"AMBIGUOUS_SQL42501");
+  for(const change of [{cleanupVerified:false},{ordinarySettled:false},{queriesSettled:false},{events:["PRIVATE secret"]},{sqlState:"PRIVATE"},{extra:"PRIVATE"},{failures:["PRIVATE"]}])assert.throws(()=>validateCauseProofObservation({...observation(),...change}),/diagnostic-/);
+  let gets=0;const hostile=Object.defineProperty(observation(),"outcome",{get(){gets++;throw Error("PRIVATE");}});assert.throws(()=>validateCauseProofObservation(hostile),/diagnostic-observation-refused/);assert.equal(gets,0);
+  const cycle=observation() as unknown as {events:unknown[]};cycle.events=[cycle];assert.throws(()=>validateCauseProofObservation(cycle),/diagnostic-observation-refused/);
+});
+
+
+test("actual installed failed native report and closed observation upload distinctly without publishing custody handles",async()=>{
+  const folder=await mkdtemp(join(tmpdir(),"calendar-report-control-")), reports=join(folder,"test-results/calendar-feed-cause-proof");
+  try{
+    await mkdir(reports,{recursive:true}); const report=await actualInstalledFailureTransport();
+    const native=await report(new Error("Fixed diagnostic failure; values redacted"));
+    await writeFile(join(reports,"native.json"),JSON.stringify(native));await writeFile(join(reports,"observation.json"),JSON.stringify(observation()));
+    const receipt={childExitCodes:[1],keyDeleted:false,dbClosed:true,custody:{ownedName:"PRIVATE custody",vaultUuid:"PRIVATE UUID"},failures:["child-failed"]};
+    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"private-key",secret:"private-secret"}),true);
+    assert.equal((JSON.parse(await readFile(join(reports,"upload/native.json"),"utf8")) as {numFailedTests:number}).numFailedTests,1);
+    const metadata=await readFile(join(reports,"upload/receipt.json"),"utf8");assert.ok(!metadata.includes("PRIVATE"));assert.equal(JSON.parse(metadata).evidenceClass,"diagnostic-only");assert.equal(JSON.parse(metadata).custodyRetained,true);
+  }finally{assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\" ) || resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
+});
+test("diagnostic missing or sensitive native reports fail capture and never enter the upload tree",async()=>{
+  const folder=await mkdtemp(join(tmpdir(),"calendar-report-negative-")), reports=join(folder,"test-results/calendar-feed-cause-proof");
+  try{
+    await mkdir(reports,{recursive:true});await writeFile(join(reports,"observation.json"),JSON.stringify(observation()));
+    const receipt={childExitCodes:[0],keyDeleted:true,dbClosed:true,custody:null,failures:[]};
+    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
+    await writeFile(join(reports,"native.json"),JSON.stringify({numTotalTests:1,numPendingTests:0,numFailedTests:0,numPassedTests:1,private:"PRIVATE sensitive"}));
+    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
+    await assert.rejects(stat(join(reports,"upload/native.json")));
+    assert.ok(!(await readFile(join(reports,"upload/manifest.json"),"utf8")).includes("PRIVATE"));
+    await writeFile(join(reports,"native.json"),JSON.stringify({numTotalTests:16,numPendingTests:15,numFailedTests:0,numPassedTests:1}));
+    assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
+    await assert.rejects(stat(join(reports,"upload/native.json")));
+  }finally{assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\") || resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
+});
+
+
+function actualFeedRegion(path: string, start: string, end: string | undefined, exported: string, dependencies: Record<string, unknown>) {
+  const source=readFileSync(new URL(path,import.meta.url),"utf8").replaceAll("\r\n","\n");
+  assert.equal(source.split(start).length,2);if(end)assert.equal(source.split(end).length,2);
+  const region=source.slice(source.indexOf(start),end?source.indexOf(end):undefined).replace(/^export /gm,"");
+  const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
+  return new Function(...Object.keys(dependencies),strip(region)+"\nreturn "+exported+";")(...Object.values(dependencies));
+}
+test("actual status mapper distinguishes existing RPC and schema erasure after one await without exposing native error fields",async()=>{
+  const status=actualFeedRegion("../../../../src/server/read-models/calendar-feed.ts","export async function readCalendarFeedStatus","export async function readCalendarFeedSettings","readCalendarFeedStatus",{recordCalendarFeedTrace,CommandError});
+  for(const [reply,event]of [[{data:null,error:{code:"42501",detail:"PRIVATE"}},"status-rpc42501"],[{data:null,error:{code:"other",message:"PRIVATE"}},"status-rpc-error"],[{data:{active:"PRIVATE"},error:null},"status-schema-invalid"]] as const){let calls=0;const result=await captureCalendarFeedTrace(traceExpected,()=>status({rpc:async()=>{calls++;return reply;}},"owned-tenant","owned-attempt"));assert.equal(calls,1);assert.equal(result.ok,false);assert.deepEqual(result.events,[event]);assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));}
+});
+test("actual management dispatcher keeps literal commands and unchanged stable outcomes while observing the closed envelope result once",async()=>{
+  for(const code of ["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","PERMISSION_DENIED","VALIDATION_FAILED","TENANT_ACCESS_DENIED","COMMAND_CONFLICT","SERVER_ERROR"]){let calls=0;
+    const manage=actualFeedRegion("../../../../src/server/commands/calendar-feed/manage-calendar-feed.ts","function calendarFeedConfig",undefined,"manageCalendarFeed",{
+      validateCalendarFeedIntent,defineCommand:(config:unknown)=>config,runCommand:async()=>{calls++;return{ok:false,code};},recordCalendarFeedTrace,recordCalendarFeedContext,recordCalendarFeedMembership,
+      feedKeyFromEnv:()=>{throw Error("Unexpected execute");},readCalendarFeedStatus:()=>{throw Error("Unexpected status");},executeCalendarFeed,FEED_SCHEMA:"fixed",MANAGE_DOMAIN:"fixed",issueCalendarFeedToken:()=>{},signFeedProof:()=>{}
+    });
+    const result=await captureCalendarFeedTrace(traceExpected,()=>manage({}, {action:"create",revision:0,attemptId:keyId}));assert.equal(calls,1);assert.deepEqual(result.events,["envelope-"+code]);
+    assert.equal(result.ok&&(result.value as {outcome:string}).outcome,code==="COMMAND_CONFLICT"?"conflict":code==="SERVER_ERROR"?"unavailable":"denied");
+  }
+});
+
+
+test("actual source registration guards isolate the one diagnostic declaration and preserve the fifteen normal command cases",async()=>{
+  const ts=await import("typescript");const source=readFileSync(new URL("../../../integration/commands/calendar-feed.int.test.ts",import.meta.url),"utf8");
+  const ast=ts.createSourceFile("calendar-feed.int.test.ts",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
+  const guards=ast.statements.filter(ts.isIfStatement);assert.equal(guards.length,2);
+  const evaluate=(index:number,mode:string|undefined)=>new Function("process","return ("+guards[index].expression.getText(ast)+");")({env:{CALENDAR_FEED_CAUSE_PROOF_MODE:mode}});
+  assert.equal(evaluate(0,"1"),true);assert.equal(evaluate(1,"1"),false);
+  for(const mode of [undefined,"0","other"]){assert.equal(evaluate(0,mode),false);assert.equal(evaluate(1,mode),true);}
+  const names=(node:import("typescript").Node)=>{const ids:string[]=[];function walk(child:import("typescript").Node){if(ts.isCallExpression(child)&&child.expression.getText(ast)==="test"&&ts.isStringLiteral(child.arguments[0]))ids.push(child.arguments[0].text);ts.forEachChild(child,walk);}walk(node);return ids;};
+  assert.deepEqual(names(guards[0].thenStatement),["15.5-DIAG001"]);assert.equal(names(guards[1].thenStatement).length,15);assert.ok(names(guards[1].thenStatement).every(name=>name.includes("15.5-INT")));
+});
diff --git a/tests/unit/scripts/verify/ci-native-test-reports.test.ts b/tests/unit/scripts/verify/ci-native-test-reports.test.ts
index f580168c..09ff9ca5 100644
--- a/tests/unit/scripts/verify/ci-native-test-reports.test.ts
+++ b/tests/unit/scripts/verify/ci-native-test-reports.test.ts
@@ -36,3 +36,18 @@ test("all four original native files upload on test failure and missing reports
   const uploads = [...ci.matchAll(/      - name: Upload native [^\n]+ JSON\n        if: \$\{\{ !cancelled\(\) \}\}\n        uses: actions\/upload-artifact@v4\n        with:\n          name: ([^\n]+)\n          path: test-results\/([^\n]+)\n          retention-days: 7\n          if-no-files-found: error/g)].map(match => [match[1], match[2]]);
   assert.deepEqual(uploads, reports);
 });
+
+
+test("cause-proof capture is distinct mode-bound and uploads closed results on failure without replacing normal artifacts",()=>{
+  const raw=read(".github/workflows/ci.yml");
+  const diagnostic=raw.slice(raw.indexOf("      - name: Upload native calendar feed cause proof JSON"),raw.indexOf("      # Stage 8:"));
+  assert.match(diagnostic,/if: \$\{\{ !cancelled\(\) && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof \}\}/);
+  assert.match(diagnostic,/name: native-calendar-feed-cause-proof\n/);
+  assert.match(diagnostic,/path: test-results\/calendar-feed-cause-proof\/upload\//);
+  assert.match(diagnostic,/if-no-files-found: error/);
+  const normal=raw.slice(raw.indexOf("      - name: Upload native full integration JSON"),raw.indexOf("      - name: Stop local Supabase stack"));
+  assert.match(normal,/!cancelled\(\) && !\(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof\)/);
+  assert.match(normal,/name: native-full-integration\n/);assert.match(normal,/path: test-results\/full-integration.json/);
+  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("native-calendar-feed-cause-proof\n","native-full-integration\n")));
+  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("cause-proof/upload/","cause-proof/")));
+});
diff --git a/tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts b/tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts
index 02ddcdc5..d7b56bf8 100644
--- a/tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts
+++ b/tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts
@@ -48,3 +48,13 @@ test("push CI selects its triggering SHA when pull-request context is absent", (
     assert.equal(checkoutRef(expression, { github: { event: {}, sha: pushSha } }), pushSha);
   }
 });
+
+
+test("diagnostic dispatch excludes pilot and browser/recovery while the normal full-plus-pilot pair survives",()=>{
+  const raw=readFileSync(join(process.cwd(),".github/workflows/ci.yml"),"utf8").replaceAll("\r\n","\n");
+  const diagnostic=raw.slice(raw.indexOf("      - name: Calendar feed cause proof"),raw.indexOf("      # Stage 8:"));
+  assert.ok(!diagnostic.includes("test:pilot-performance")); assert.ok(diagnostic.includes("with-calendar-feed-runtime.mjs cause-proof"));
+  for(const name of ["e2e","recovery-storage-loader"])assert.ok(raw.includes("  "+name+":\n    if: \$\{\{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) \}\}".replaceAll("\\", "")));
+  assert.match(ci,/pnpm run test:int[\s\S]*?pnpm run test:pilot-performance/);
+  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace('test "$RELEASE_VALIDATION" = false','test "$RELEASE_VALIDATION" = true')));
+});


## Full committed source: src/server/commands/calendar-feed/calendar-feed-db.ts

import type { CommandDbClient } from "../envelope";
import { CommandError } from "../command-errors";
import { AsyncLocalStorage } from "node:async_hooks";

// Explicit test-owned invocation scope only. No logger, environment switch,
// client/thenable observer, argument retention or change to command results.
export const calendarFeedTraceEvents = ["input-invalid", "execute-enter", "key-ready", "status-enter", "status-rpc42501", "status-rpc-error", "status-schema-invalid", "status-valid", "proof-enter", "manage-enter", "manage-rpc42501", "manage-rpcCF409", "manage-rpc-error", "manage-schema-invalid", "manage-valid", "envelope-success", "envelope-UNAUTHENTICATED", "envelope-TENANT_MEMBERSHIP_REQUIRED", "envelope-PERMISSION_DENIED", "envelope-VALIDATION_FAILED", "envelope-TENANT_ACCESS_DENIED", "envelope-COMMAND_CONFLICT", "envelope-SERVER_ERROR", "envelope-other", "context-match", "context-mismatch", "membership-match", "membership-mismatch", "truncated"] as const;
export type CalendarFeedTraceEvent = typeof calendarFeedTraceEvents[number];
type Expected = { tenantId: string; userId: string; membershipId: string; attemptId: string; revision: number; action: string };
const invocation = new AsyncLocalStorage<{ expected?: Expected; events: CalendarFeedTraceEvent[]; closed: boolean }>();
export function recordCalendarFeedTrace(event: CalendarFeedTraceEvent): void {
  const store = invocation.getStore();
  if (!store || store.closed || !calendarFeedTraceEvents.includes(event)) return;
  if (store.events.length < 15) store.events.push(event);
  else if (store.events.length === 15) store.events.push("truncated");
}
export function recordCalendarFeedContext(tenantId: string, userId: string, input: { action: string; revision: number; attemptId: string }): void {
  const expected = invocation.getStore()?.expected;
  if (expected) recordCalendarFeedTrace(tenantId === expected.tenantId && userId === expected.userId && input.action === expected.action && input.revision === expected.revision && input.attemptId === expected.attemptId ? "context-match" : "context-mismatch");
}
export function recordCalendarFeedMembership(id: string): void {
  const expected = invocation.getStore()?.expected;
  if (expected) recordCalendarFeedTrace(id === expected.membershipId ? "membership-match" : "membership-mismatch");
}
export async function captureCalendarFeedTrace<T>(expected: Expected, run: () => Promise<T>) {
  const events: CalendarFeedTraceEvent[] = [];
  const snapshot = {} as Expected;
  // A malformed opt-in fixture cannot introduce getter reads into production.
  try { for (const key of ["tenantId", "userId", "membershipId", "attemptId", "revision", "action"] as const) {
    const descriptor = Object.getOwnPropertyDescriptor(expected, key);
    if (!descriptor || !("value" in descriptor) || (key === "revision" ? !Number.isSafeInteger(descriptor.value) : typeof descriptor.value !== "string")) throw new Error("Calendar trace expected-context refused");
    Object.defineProperty(snapshot, key, { value: descriptor.value, enumerable: true });
  } } catch { throw new Error("Calendar trace expected-context refused"); }
  const store = { expected: snapshot as Expected | undefined, events, closed: false };
  return invocation.run(store, async () => {
    try { const value = await run(); return { ok: true as const, value, events: [...events] }; }
    catch (error) { return { ok: false as const, error, events: [...events] }; }
    finally { store.closed = true; store.expected = undefined; }
  });
}
export async function executeCalendarFeed(db: CommandDbClient, args: Record<string, unknown>): Promise<{ outcome: "committed" | "replayed"; revision: number }> {
  const { data, error } = await (db as unknown as { rpc(name: string, args: Record<string, unknown>): PromiseLike<{ data: unknown; error: { code?: string } | null }> }).rpc("manage_calendar_feed", args);
  if (error) {
    if (error.code === "CF409") { recordCalendarFeedTrace("manage-rpcCF409"); throw new CommandError("COMMAND_CONFLICT"); }
    if (error.code === "42501") { recordCalendarFeedTrace("manage-rpc42501"); throw new CommandError("TENANT_ACCESS_DENIED"); }
    recordCalendarFeedTrace("manage-rpc-error");
    throw new Error("Calendar write unavailable");
  }
  const result = data as Record<string, unknown> | null;
  if (!result || !["committed", "replayed"].includes(String(result.outcome)) || !Number.isSafeInteger(result.revision) || Number(result.revision) < 0) { recordCalendarFeedTrace("manage-schema-invalid"); throw new Error("Calendar write unavailable"); }
  recordCalendarFeedTrace("manage-valid");
  return { outcome: result.outcome as "committed" | "replayed", revision: result.revision as number };
}


## Full committed source: src/server/commands/calendar-feed/manage-calendar-feed.ts

import type { CalendarFeedAction, CalendarFeedIntent, CalendarFeedResult } from "@/features/calendar-feed/types";
import { validateCalendarFeedIntent } from "@/features/calendar-feed/validation";
import { feedKeyFromEnv, FEED_SCHEMA, MANAGE_DOMAIN, issueCalendarFeedToken, signFeedProof } from "@/server/calendar-feed/attestation";
import { readCalendarFeedStatus } from "@/server/read-models/calendar-feed";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
import { defineCommand, runCommand, type CommandDbClient, type CommandConfig } from "../envelope";
import { executeCalendarFeed, recordCalendarFeedTrace, recordCalendarFeedContext, recordCalendarFeedMembership } from "./calendar-feed-db";

/** Plaintext exists only in execute and its confirmed fresh response. */
function calendarFeedConfig(action: CalendarFeedAction): Omit<CommandConfig<CalendarFeedIntent, CalendarFeedResult>, "command"> {
  return {
    auditable: false, eventType: `calendar_feed_${action}`, targetType: "calendar_feed",
    validateInput: raw => { const result = validateCalendarFeedIntent(raw); return result.ok && result.data.action !== action ? { ok: false, code: "VALIDATION_FAILED" } : result; },
    execute: async ctx => {
      recordCalendarFeedTrace("execute-enter");
      recordCalendarFeedContext(ctx.tenantContext.tenantId, ctx.tenantContext.userId, ctx.input);
      const key = feedKeyFromEnv();
      recordCalendarFeedTrace("key-ready"); recordCalendarFeedTrace("status-enter");
      const status = await readCalendarFeedStatus(ctx.db as unknown as Awaited<ReturnType<typeof createSupabaseServerClient>>, ctx.tenantContext.tenantId, ctx.input.attemptId);
      recordCalendarFeedMembership(status.membershipId);
      // Reconciliation is read-only. A retry never generates a replacement hash.
      if (status.attemptOutcome === "committed") return { outcome: status.attemptAction === action && status.attemptRevision === ctx.input.revision ? "replayed" : "conflict", revision: status.revision, issuedPath: null };
      recordCalendarFeedTrace("proof-enter");
      const issued = action === "revoke" ? null : issueCalendarFeedToken(), now = new Date();
      const claims = { schema: FEED_SCHEMA, domain: MANAGE_DOMAIN, operation: action, tenantId: ctx.tenantContext.tenantId, actorId: ctx.tenantContext.userId,
        membershipId: status.membershipId, revision: String(ctx.input.revision), attemptId: ctx.input.attemptId, newHash: issued?.hash ?? "", correlationId: ctx.correlationId,
        keyId: key.keyId, issuedAt: now.toISOString(), expiresAt: new Date(now.getTime() + 60000).toISOString() };
      recordCalendarFeedTrace("manage-enter");
      const result = await executeCalendarFeed(ctx.db, { p_tenant_id: claims.tenantId, p_actor_id: claims.actorId, p_membership_id: claims.membershipId,
        p_action: action, p_expected_revision: ctx.input.revision, p_attempt_id: ctx.input.attemptId, p_new_hash: issued?.hash ?? null,
        p_correlation_id: ctx.correlationId, p_claims: claims, p_signature: signFeedProof(claims, key.secret) });
      return { ...result, issuedPath: result.outcome === "committed" && issued ? `/calendar/feed/${issued.raw}` : null };
    },
  };
}
// Each mutation has one literal declaration for independent enrollment discovery.
const commands = {
  create: defineCommand<CalendarFeedIntent, CalendarFeedResult>({ command: "calendar_feed.create", ...calendarFeedConfig("create") }),
  rotate: defineCommand<CalendarFeedIntent, CalendarFeedResult>({ command: "calendar_feed.rotate", ...calendarFeedConfig("rotate") }),
  revoke: defineCommand<CalendarFeedIntent, CalendarFeedResult>({ command: "calendar_feed.revoke", ...calendarFeedConfig("revoke") }),
};
export function calendarFeedCommand(action: CalendarFeedAction) { return commands[action]; }
export async function manageCalendarFeed(client: CommandDbClient, input: unknown, correlationId?: string): Promise<CalendarFeedResult> {
  const validated = validateCalendarFeedIntent(input);
  if (!validated.ok) { recordCalendarFeedTrace("input-invalid"); return { outcome: "denied", revision: null, issuedPath: null }; }
  const result = await runCommand(calendarFeedCommand(validated.data.action), { client, input, correlationId });
  if (result.ok) { recordCalendarFeedTrace("envelope-success"); return result.data; }
  const code = result.code;
  const known = ["UNAUTHENTICATED", "TENANT_MEMBERSHIP_REQUIRED", "PERMISSION_DENIED", "VALIDATION_FAILED", "TENANT_ACCESS_DENIED", "COMMAND_CONFLICT", "SERVER_ERROR"] as const;
  const entry = known.find(value => value === code);
  recordCalendarFeedTrace(entry ? `envelope-${entry}` : "envelope-other");
  return { outcome: result.code === "COMMAND_CONFLICT" ? "conflict" : result.code === "SERVER_ERROR" ? "unavailable" : "denied", revision: null, issuedPath: null };
}


## Full committed source: src/server/read-models/calendar-feed.ts

import type { CalendarFeedAbuse, CalendarFeedStatus } from "@/features/calendar-feed/types";
import { resolveTenantContext } from "@/server/auth/resolve-tenant-context";
import { resolveCapability } from "@/server/authz/permission-matrix";
import { CommandError } from "@/server/commands/command-errors";
import { recordCalendarFeedTrace } from "@/server/commands/calendar-feed/calendar-feed-db";
import type { createSupabaseServerClient } from "@/server/db/supabase-server-client";
type Client = Awaited<ReturnType<typeof createSupabaseServerClient>>;
export async function readCalendarFeedStatus(client: Client, tenantId: string, attemptId?: string): Promise<CalendarFeedStatus> {
  const { data, error } = await client.rpc("read_calendar_feed_status", { p_tenant_id: tenantId, p_attempt_id: attemptId ?? null });
  if (error?.code === "42501") { recordCalendarFeedTrace("status-rpc42501"); throw new CommandError("TENANT_ACCESS_DENIED"); }
  if (error) recordCalendarFeedTrace("status-rpc-error");
  if (error || !data || typeof data.active !== "boolean" || !Number.isSafeInteger(data.revision) || data.revision < 0 || typeof data.membershipId !== "string" || !Number.isSafeInteger(data.usageCount) || data.usageCount < 0 || (data.lastUsedAt !== null && (typeof data.lastUsedAt !== "string" || !Number.isFinite(Date.parse(data.lastUsedAt)))) || ![null, "committed", "not-found"].includes(data.attemptOutcome)) { if (!error) recordCalendarFeedTrace("status-schema-invalid"); throw new Error("Calendar status unavailable"); }
  if ((data.attemptAction !== null && !["create", "rotate", "revoke"].includes(data.attemptAction)) || (data.attemptRevision !== null && (!Number.isSafeInteger(data.attemptRevision) || data.attemptRevision < 0))) { recordCalendarFeedTrace("status-schema-invalid"); throw new Error("Calendar status unavailable"); }
  recordCalendarFeedTrace("status-valid");
  return { membershipId: data.membershipId, active: data.active, revision: data.revision, usageCount: data.usageCount, lastUsedAt: data.lastUsedAt, attemptOutcome: data.attemptOutcome, attemptAction: data.attemptAction, attemptRevision: data.attemptRevision };
}
export async function readCalendarFeedSettings(options: { client?: Client; attemptId?: string } = {}): Promise<{ ok: true; status: CalendarFeedStatus; abuse: CalendarFeedAbuse | null } | { ok: false }> {
  try {
    const client = options.client ?? await (await import("@/server/db/supabase-server-client")).createSupabaseServerClient();
    const context = await resolveTenantContext({ client });
    if (!context.ok || !resolveCapability({ roles: context.data.roles ?? [context.data.role], module: "scheduling", capability: "Bookings.View" }).granted) return { ok: false };
    const status = await readCalendarFeedStatus(client, context.data.tenantId, options.attemptId);
    let abuse: CalendarFeedAbuse | null = null;
    if ((context.data.roles ?? [context.data.role]).includes("tenant_admin")) {
      const { data, error } = await client.rpc("read_calendar_feed_abuse", { p_tenant_id: context.data.tenantId });
      if (error || !data || !Number.isSafeInteger(data.requests) || !Number.isSafeInteger(data.limited) || (data.lastSpikeAt !== null && typeof data.lastSpikeAt !== "string")) throw new Error("Calendar status unavailable");
      abuse = { requests: data.requests, limited: data.limited, lastSpikeAt: data.lastSpikeAt };
    }
    return { ok: true, status, abuse };
  } catch { return { ok: false }; }
}


## Full committed source: tests/support/calendar-feed-atdd.ts

/** Story 15.5 actual command/JWT/SQL/HTTP adapters. No resource launches.
 * Test observation shapes below normalize real results, never produce expected
 * outcomes. Dedicated ephemeral key and actual Next host are supplied by the
 * separately owned isolated CI runtime. Required missing infrastructure fails.
 */
import { randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { expect as vitestExpect } from "vitest";
import { adminQuery, adminSession } from "../factories/admin-sql";
import { seedRoleAwarePhaseAUsers, makeAuthedServerClient, makeAnonServerClient, deleteAuthUser, createRoleAwarePhaseAFixture, cleanupRoleAwarePhaseAFixture, type FixtureUser, type TestServerClient } from "../factories/tenants";
import { withBookingFixture, bookingCommand, bookingInput, type BookingFixture } from "./bookings-atdd";
import { realSeriesInput, reviewRealSeries } from "./booking-series-atdd";
import { createBookingSeries } from "@/server/commands/bookings/create-booking-series";
import { updateBookingSeries } from "@/server/commands/bookings/update-booking-series";
import { runCommand } from "@/server/commands/envelope";
import { manageCalendarFeed } from "@/server/commands/calendar-feed/manage-calendar-feed";
import { captureCalendarFeedTrace, type CalendarFeedTraceEvent } from "@/server/commands/calendar-feed/calendar-feed-db";
import { readCalendarFeedStatus } from "@/server/read-models/calendar-feed";
import { publicCalendarFeed } from "@/server/calendar-feed/public-feed";
import { feedKeyFromEnv, issueCalendarFeedToken, hashFeedToken, FEED_SCHEMA, FETCH_DOMAIN, MANAGE_DOMAIN, signFeedProof } from "@/server/calendar-feed/attestation";
import { hashFeedIp } from "@/server/calendar-feed/trusted-ip";

/**
 * A failing ordinary matcher prints actual/expected values. These tests inspect
 * capabilities and hashes, so matcher errors are replaced by fixed text without
 * a cause. Never use expect.soft, snapshots, console output or raw adapter errors.
 * P5 adapters must similarly sanitize HTTP/RPC/SQL transport errors at source.
 */
function redactMatchers<T extends object>(assertion: T): T {
  return new Proxy(assertion, { get(target, key, receiver) {
    const value: unknown = Reflect.get(target, key, receiver);
    if (key === "not" && value && typeof value === "object") return redactMatchers(value);
    if (typeof value !== "function") return value;
    return (...args: unknown[]) => {
      try { return Reflect.apply(value, target, args); }
      catch { throw calendarFixtureOrigin("scenario-assertion"); }
    };
  } });
}
export const expectCalendar: typeof vitestExpect = new Proxy(vitestExpect, {
  apply(target, thisArg, args) {
    return redactMatchers(Reflect.apply(target, thisArg, args));
  },
});

export type SubjectName = "own" | "peer" | "admin" | "planner" | "mixed" | "seller" |
  "economy" | "foreign" | "invited" | "disabled" | "platformOnly" | "noProfile";
export type Subject = { tenantId: string; userId: string; membershipId: string; profileId: string | null };
export type LifecycleIntent = {
  action: "create" | "rotate" | "revoke"; expectedRevision: number; attemptId: string; correlationId: string;
};
export function lifecycle(action: LifecycleIntent["action"], expectedRevision: number): LifecycleIntent {
  return { action, expectedRevision, attemptId: randomUUID(), correlationId: randomUUID() };
}
export type ManagementObservation = {
  outcome: "committed" | "replayed" | "conflict" | "denied" | "unavailable";
  issuedUrl: string | null; revision: number | null;
};
export type StatusObservation = {
  active: boolean; revision: number; lastUsedAt: string | null; usageCount: number;
  attemptOutcome: "committed" | "not-found" | null; publicDto: Record<string, unknown>;
};
export type BookingSeed = {
  id: string; subject: SubjectName; additionalAssignees: SubjectName[];
  startsAt: string; endsAt: string; updatedAt: string; allDay: boolean;
  status: "planned" | "cancelled"; description: string;
  workRoleLabel: string | null; jobLabel: string | null; customerLabel: string | null;
  facilityAddress: string | null;
};
export function bookingSeed(patch: Partial<BookingSeed> = {}): BookingSeed {
  return { id: randomUUID(), subject: "own", additionalAssignees: [],
    startsAt: "2026-10-21T06:00:00Z", endsAt: "2026-10-21T14:00:00Z",
    updatedAt: "2026-10-20T12:00:00Z", allDay: false, status: "planned",
    description: "PRIVATE-NOTE: ring Anna på 0700001122", workRoleLabel: "Installation",
    jobLabel: "Belysning verkstad", customerLabel: "Testkund Väster AB",
    facilityAddress: "Testgatan 15, Uppsala", ...patch };
}
export type TokenRow = {
  id: string; tenantId: string; membershipId: string; hash: string;
  revokedAt: string | null; createdAt: string; lastUsedAt: string | null;
  usageCount: number; revision: number; attemptId: string;
};
export type AuditRow = { action: string; actorId: string; tenantId: string; attemptId: string; metadata: unknown };
export type PhysicalState = {
  tokens: TokenRow[]; audits: AuditRow[]; persistedRows: unknown[];
  /** Actual row-scoped bookings/series/exceptions/conflicts/resolutions/reports/jobs readbacks. */
  schedulingIntegrity: Record<string, unknown[]>;
};
export type FeedResponse = { status: number; headers: Record<string, string>; body: string };
export type ParsedEvent = {
  uid: string; start: string; end: string; summary: string; location: string | null;
  properties: Record<string, string[]>;
};
export type ProofAttack = "missing" | "wrong-key" | "wrong-domain" | "expired" | "future" |
  "over-60-seconds" | "tampered-token-hash" | "tampered-ip-hash" | "tampered-request-id" |
  "tampered-actor" | "tampered-tenant" | "tampered-membership" | "tampered-action" |
  "tampered-revision" | "tampered-attempt" | "weak-chosen-new-hash" | "changed-new-hash";
export type RpcObservation = { denied: boolean; rows: unknown[]; sanitizedResult: unknown };
export type AuthorityPatch = {
  primary?: "tenant_admin" | "projektledare" | "montor" | "saljare" | "ekonomi";
  additional?: string[]; status?: "active" | "invited" | "disabled";
  membershipPresent?: boolean; tenantPresent?: boolean; profileArchived?: boolean;
};
export type AclFacts = {
  tables: Array<{ name: string; rlsEnabled: boolean; anonSelect: boolean; authenticatedDml: boolean;
    anonDml: boolean; publicInheritedDml: boolean; authenticatedSensitiveColumns: boolean }>;
  functions: Array<{ purpose: "fetch" | "manage" | "status" | "abuse"; owner: string; securityDefiner: boolean; emptySearchPath: boolean;
    anonExecute: boolean; authenticatedExecute: boolean; publicExecute: boolean }>;
  owner: { name: string; login: boolean; inherit: boolean; superuser: boolean; bypassRls: boolean; publicSchemaCreate: boolean;
    assumableByJwtRoles: boolean; unrelatedTableRead: boolean; generalVaultRead: boolean;
    effectiveReadOutsideAllowedColumns: boolean; filteredHelperOnly: boolean };
  helpers: Array<{ purpose: "canonical" | "verifier" | "filtered-secret"; jwtExecute: boolean; publicExecute: boolean; feedOwnerExecute: boolean;
    otherRoleInheritedExecute: boolean; exactConfiguredKeyFilter: boolean }>;
  ipColumns: string[];
};
export type CalendarFixture = {
  subjects: Record<SubjectName, Subject>;
  /** Unique fixture-owned canonical IPv6 address; never the global unknown bucket. */
  isolatedTrustedIp: string;
  /** Invokes real request-bound server action/command, not a hand-built signed oracle. */
  manage(subject: SubjectName, intent: LifecycleIntent): Promise<ManagementObservation>;
  status(subject: SubjectName, attemptId?: string): Promise<StatusObservation>;
  /** Bypasses envelope via actual ordinary JWT RPC; overrides are attack input. */
  rawManage(subject: SubjectName | "anon", intent: LifecycleIntent,
    overrides?: Partial<Subject>, attack?: ProofAttack): Promise<RpcObservation>;
  rawFetch(url: string, attack: ProofAttack | "valid" | "replay",
    options?: { callerWindow?: number; callerLimit?: number; changedIpHash?: string }): Promise<RpcObservation>;
  seedBookings(rows: BookingSeed[]): Promise<void>;
  /** Real existing 15.2 commands/materialization; returns seeded surviving IDs, never expected output. */
  seedSeries(subject: SubjectName): Promise<{ unchangedId: string; movedExceptionId: string; cancelledId: string;
    splitSurvivingId: string; newOccurrenceIds: string[] }>;
  changeSeries(kind: "edit" | "exception" | "cancel" | "split", id: string): Promise<void>;
  setBooking(id: string, patch: Partial<BookingSeed>): Promise<void>;
  editProjectedSource(id: string, source: "work_roles" | "jobs" | "customers" | "facilities", label: string, updatedAt: string): Promise<void>;
  setAssignments(id: string, subjects: SubjectName[]): Promise<void>;
  setAuthority(subject: SubjectName, patch: AuthorityPatch): Promise<void>;
  setProvisioningState(subject: SubjectName, state: string | null): Promise<void>;
  replaceMembership(subject: SubjectName): Promise<void>;
  /** Real HTTP, redirect following and automatic retries disabled; never accepts trusted-IP input. */
  http(url: string, options?: { headers?: Record<string, string>; query?: Record<string, string> }): Promise<FeedResponse>;
  /** Real server orchestrator+SQL with private trusted-IP dependency seam; NOT an HTTP header. */
  trustedFetch(url: string, canonicalIp: string): Promise<FeedResponse>;
  physical(): Promise<PhysicalState>;
  readAbuse(subject: SubjectName, query?: Record<string, string>): Promise<{ denied: boolean; rows: Record<string, unknown>[] }>;
  directTable(subject: SubjectName | "anon", table: "calendar_feed_tokens" | "calendar_feed_ip_windows",
    operation: "select" | "insert" | "update" | "delete", options?: Record<string, unknown>): Promise<RpcObservation>;
  /** Read-only pg_catalog/has_*_privilege inspection, INCLUDING inherited PUBLIC/role ACLs. */
  acl(): Promise<AclFacts>;
  /** Actual captured server log/error/audit telemetry only; never print sensitive test values. */
  telemetry(): Promise<string>;
  /** In-memory TEST-only values for negative leak assertions; never logs/returns them to product. */
  sensitiveTestValues(): Promise<string[]>;
  /** Seed real existing booking/series/resolver/report/job records and return physical baseline. */
  seedSchedulingRegressionState(): Promise<Record<string, unknown[]>>;
};
export type SerialControls = {
  /** Unique allocated TEST key only; restore exact owned state, never borrowed key material. */
  withKeyState<T>(state: "missing" | "wrong-runtime-key" | "wrong-vault-key" | "unrelated-vault-key-only",
    run: () => Promise<T>): Promise<T>;
  /** DB-clock fixture, not caller-signed windows/limits. Binding must prove real SQL time source. */
  withDatabaseTime<T>(iso: string, run: () => Promise<T>): Promise<T>;
  counters(url: string, canonicalIp: string | null): Promise<{ token: number; ip: number; windowStart: string;
    databaseNow: string; spikeCount: number; storedIpIsKeyedHash: boolean }>;
  withFault<T>(scope: { tenantId: string; attemptId: string; correlationId: string;
    stage: "create-audit" | "rotate-audit" | "revoke-audit" | "projection-after-first-page" | "projection-query-canceled" | "counter-write" },
    run: () => Promise<T>): Promise<{ result: T; stageObserved: boolean; sqlstate: string; ownedObjectsRemaining: number }>;
  loseCommittedResponse(subject: SubjectName, intent: LifecycleIntent): Promise<void>;
  barrier(scope: { tenantId: string; membershipId: string; attemptId: string;
    stage: "fetch-authority-admitted" | "revoke-before-commit" | "rotate-before-commit" |
      "management-before-authority" | "fetch-before-authority" }): Promise<{
    waitUntilEntered(timeoutMs: number): Promise<void>; release(): Promise<void>; assertOwnedObjectsAbsent(): Promise<void>;
  }>;
  /** One shared conservative unknown-IP bucket, confined to these two serial files. */
  resetOwnedUnknownIpWindow(): Promise<void>;
  boundedInfrastructureCounts(): Promise<{ liveWindows: number; expiredWindows: number; documentedBound: number }>;
};
export type Lane = "row-isolated" | "serial-commands" | "serial-public";
export type FixtureByLane<L extends Lane> = CalendarFixture &
  (L extends "row-isolated" ? Record<never, never> : { serial: SerialControls });

// Pure fixture diagnostics: no DB/client imports or native error text are read.
export const calendarFixtureOwnedOrigins = ["scenario-assertion", "scenario-issued-denied", "scenario-issued-unavailable", "scenario-issued-conflict", "scenario-issued-replayed", "scenario-issued-unknown-noncommitted", "scenario-issued-committed-missing-url", "scenario-canonical-token-route", "scenario-http-transport", "scenario-rls001-own", "scenario-rls001-admin", "scenario-rls001-planner", "scenario-rls001-mixed"] as const;
export type CalendarFixtureOwnedOrigin = typeof calendarFixtureOwnedOrigins[number];
export const calendarFixtureDiagnosticStages = ["booking-fixture-before-callback", "canonical-fixture-cleanup", "additional-users", "bind-membership", "bind-profile", "bind-client", "owned-row-cleanup", "additional-auth-cleanup", "cleanup-absence-check", "serial-window-setup", "serial-window-restore", "scenario", "unknown", ...calendarFixtureOwnedOrigins] as const;
export type CalendarFixtureDiagnosticStage = typeof calendarFixtureDiagnosticStages[number];
const calendarFixtureSqlstates = { "42501": "insufficient-privilege", "42P01": "undefined-table", "42703": "undefined-column", "42883": "undefined-function", "23502": "not-null", "23503": "foreign-key", "23505": "unique-conflict", "23514": "check-constraint", "22P02": "invalid-text", "25P02": "transaction-aborted", "57014": "query-cancelled", "40001": "serialization", "40P01": "deadlock", "08006": "connection-failure" } as const;
type CalendarFixtureSafeFailure = { stage: CalendarFixtureDiagnosticStage; children?: readonly Error[] };
const calendarFixtureSafeFailures = new WeakMap<object, CalendarFixtureSafeFailure>();
/** Closed owned origin only: never inspect a native error or matcher arguments. */
export function calendarFixtureOrigin(origin: CalendarFixtureOwnedOrigin): Error {
  const stage = calendarFixtureOwnedOrigins.includes(origin) ? origin : "scenario-assertion";
  const safe = new Error(`Calendar fixture failure [stage=${stage};category=unknown;sqlstate=unavailable]`);
  calendarFixtureSafeFailures.set(safe, { stage }); return safe;
}
export function calendarFixtureAssertionAt<T>(site: "scenario-rls001-own" | "scenario-rls001-admin" | "scenario-rls001-planner" | "scenario-rls001-mixed", run: () => T): T {
  try { return run(); } catch { throw calendarFixtureOrigin(site); }
}
function fixtureOwnData(value: object, key: string): { found: boolean; value?: unknown } {
  const descriptor = Object.getOwnPropertyDescriptor(value, key);
  return descriptor && "value" in descriptor ? { found: true, value: descriptor.value } : { found: false };
}
export function calendarFixtureDiagnostic(stage: string, error: unknown): Error {
  const fixedStage = calendarFixtureDiagnosticStages.includes(stage as CalendarFixtureDiagnosticStage) ? stage as CalendarFixtureDiagnosticStage : "unknown";
  const objectLike = (value: unknown): value is object => (typeof value === "object" && value !== null) || typeof value === "function";
  // Only this module's own safe objects may bypass native descriptor inspection.
  if (objectLike(error) && calendarFixtureSafeFailures.has(error)) return error as Error;
  let nodes = 0, exhausted = false;
  const seen = new Set<object>();
  const leaf = (at: CalendarFixtureDiagnosticStage, category: string, code = "unavailable") => {
    const safe = new Error(`Calendar fixture failure [stage=${at};category=${category};sqlstate=${code}]`);
    calendarFixtureSafeFailures.set(safe, { stage: at }); return safe;
  };
  function walk(value: unknown, at: CalendarFixtureDiagnosticStage, depth: number): Error {
    // The final node is reserved for an explicit truncation marker.
    if (++nodes >= 16) { exhausted = true; return leaf(at, "truncated"); }
    if (depth > 4) return leaf(at, "truncated");
    if (!objectLike(value)) return leaf(at, "unknown");
    if (seen.has(value)) return leaf(at, "cycle");
    seen.add(value);
    const known = calendarFixtureSafeFailures.get(value);
    if (known) at = known.stage;
    try {
      const members = known?.children ? { found: true, value: known.children } : fixtureOwnData(value, "errors");
      if (members.found && Array.isArray(members.value)) {
        const size = fixtureOwnData(members.value, "length");
        if (!size.found || typeof size.value !== "number" || !Number.isSafeInteger(size.value) || size.value < 1) return leaf(at, "unknown");
        const children: Error[] = [];
        for (let index = 0; index < size.value && !exhausted; index++) {
          const member = fixtureOwnData(members.value, String(index));
          const child = walk(member.found ? member.value : undefined, at, depth + 1);
          // Vitest unwraps one AggregateError level before JSON selects only
          // stack/message. Flatten only our already-sanitized, bounded groups;
          // raw native children still pass through the guarded walk above.
          children.push(...(calendarFixtureSafeFailures.get(child)?.children ?? [child]));
        }
        const safe = new AggregateError(children, `Calendar fixture failure group [stage=${at}]`);
        calendarFixtureSafeFailures.set(safe, { stage: at, children }); return safe;
      }
      // An accessor/malformed aggregate is unknown; never invoke it or native text.
      if (Object.getOwnPropertyDescriptor(value, "errors")) return leaf(at, "unknown");
      if (known) return value as Error;
      const code = fixtureOwnData(value, "code");
      if (code.found && typeof code.value === "string" && Object.hasOwn(calendarFixtureSqlstates, code.value)) {
        return leaf(at, calendarFixtureSqlstates[code.value as keyof typeof calendarFixtureSqlstates], code.value);
      }
    } catch { /* Proxy/descriptor failure has no safe native information. */ }
    return leaf(at, "unknown");
  }
  return walk(error, fixedStage, 0);
}
export async function calendarFixtureStep<T>(stage: CalendarFixtureDiagnosticStage, run: () => T | Promise<T>): Promise<T> {
  try { return await run(); }
  catch (error) { throw calendarFixtureDiagnostic(stage, error); }
}
// End pure fixture diagnostics.

/** Row-isolated fixtures never mutate keys, global counters or fault DDL.
 * The two allocated serial files alone receive these controls. All assertions
 * and transport failures discard sensitive values and retain cleanup outcomes.
 */
export async function withCalendarFeedFixture<L extends Lane>(
  lane: L, run: (fixture: FixtureByLane<L>) => Promise<void>,
): Promise<void> {
  let additionalUsers: readonly FixtureUser[] = [];
  let primary: unknown; const ownedTenants: string[] = [], ownedUsers: string[] = [];
  // Shared setup can already have replaced code with message-only Error. Do not
  // guess its internal auth/SQL substage or reconstruct swallowed cleanup errors.
  let phase: CalendarFixtureDiagnosticStage = "booking-fixture-before-callback";
  try {
    feedKeyFromEnv(); // no fallback, fixture fails if the owned CI key is absent
    await withBookingFixture(async base => {
      phase = "additional-users";
      ownedTenants.push(...base.tenantIds);ownedUsers.push(base.base.adminA.id,base.base.adminB.id,base.base.orphanUser.id,...base.extraUsers.map(user=>user.id));
      let failure: unknown;
      try {
        const extra = await calendarFixtureStep(phase, () => seedRoleAwarePhaseAUsers(base.base)); additionalUsers = extra.extraUsers;
        phase = "bind-membership";
        const fixture = await bindCalendarFixture(base, extra);
        const serial = lane === "row-isolated" ? {} : { serial: await calendarSerialControls(fixture) };
        phase = "scenario";
        const scenario = () => calendarFixtureStep("scenario", () => run(Object.assign(fixture, serial) as FixtureByLane<L>));
        if (lane === "row-isolated") await scenario();
        else await withOwnedUnknownWindow(fixture, scenario);
      } catch (error) { failure = calendarFixtureDiagnostic(phase, error); }
      let cleanupFailure: unknown;
      try { await cleanupCalendarOwnedRows(base.tenantIds); } catch (error) { cleanupFailure = calendarFixtureDiagnostic("owned-row-cleanup", error); }
      phase = "canonical-fixture-cleanup";
      if (failure || cleanupFailure) throw new AggregateError([...(failure ? [failure] : []), ...(cleanupFailure ? [cleanupFailure] : [])], "Calendar scenario/owned row cleanup failed");
    });
  } catch (error) { primary = calendarFixtureDiagnostic(phase, error); }
  const cleanup = await Promise.allSettled(additionalUsers.map(user => calendarFixtureStep("additional-auth-cleanup", () => deleteAuthUser(user.id))));
  const remainingErrors: Error[]=[];
  try {
    if(ownedTenants.length && (await adminQuery("select 1 from public.tenants where id=any($1::uuid[]) limit 1",[ownedTenants])).length)remainingErrors.push(calendarFixtureDiagnostic("cleanup-absence-check", new Error()));
    if(ownedUsers.length && (await adminQuery("select 1 from auth.users where id=any($1::uuid[]) limit 1",[[...ownedUsers,...additionalUsers.map(user=>user.id)]])).length)remainingErrors.push(calendarFixtureDiagnostic("cleanup-absence-check", new Error()));
  }catch(error){remainingErrors.push(calendarFixtureDiagnostic("cleanup-absence-check", error));}
  if (primary || remainingErrors.length || cleanup.some(result => result.status === "rejected")) throw calendarFixtureDiagnostic("scenario", new AggregateError([
    ...(primary ? [redactFailure(primary)] : []), ...remainingErrors,
    ...cleanup.filter(result => result.status === "rejected").map(result => calendarFixtureDiagnostic("additional-auth-cleanup", result.reason)),
  ], "Calendar fixture failed; primary and cleanup outcomes retained without sensitive values"));
}
function redactFailure(error: unknown): Error {
  return calendarFixtureDiagnostic("scenario", error);
}

type BoundFixture = CalendarFixture & { base: BookingFixture; clients: Record<SubjectName, TestServerClient>;
  tenantIds: string[]; keyId: string; secret: string; pendingRequests: Set<Promise<unknown>>; currentRawFetch: Record<string, unknown> | null };
const iso = (value: unknown) => value === null ? null : new Date(String(value)).toISOString();
function normalizedRpc(result: { data: unknown; error: unknown }): RpcObservation {
  return { denied: !!result.error, rows: result.error ? [] : [result.data], sanitizedResult: result.error ? { denied: true } : { admitted: true } };
}
async function bindCalendarFixture(base: BookingFixture, extra: Awaited<ReturnType<typeof seedRoleAwarePhaseAUsers>>): Promise<BoundFixture> {
  const key = feedKeyFromEnv(), subjects = {} as Record<SubjectName, Subject>, clients = {} as Record<SubjectName, TestServerClient>;
  const users: Record<SubjectName, FixtureUser> = { own: base.users.montor, peer: extra.users.montor, admin: base.base.adminA,
    planner: base.users.projektledare, mixed: base.roleUnionUser, seller: base.users.saljare, economy: base.users.ekonomi,
    foreign: base.base.adminB, invited: base.invitedUser, disabled: base.disabledUser, platformOnly: base.base.orphanUser, noProfile: extra.users.projektledare };
  for (const name of Object.keys(users) as SubjectName[]) {
    const tenantId = name === "foreign" ? base.base.tenantB.id : base.base.tenantA.id;
    const [member] = await calendarFixtureStep("bind-membership", () => adminQuery<{ id: string }>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId, users[name].id]));
    let profile: string | null = null;
    if (member && name !== "noProfile") {
      const rows = await calendarFixtureStep("bind-profile", () => adminQuery<{ id: string }>("select id from public.person_profiles where tenant_id=$1 and membership_id=$2", [tenantId, member.id]));
      profile = rows[0]?.id ?? (await calendarFixtureStep("bind-profile", () => adminQuery<{id:string}>("insert into public.person_profiles(tenant_id,membership_id) values($1,$2) returning id", [tenantId,member.id])))[0].id;
    }
    subjects[name] = { tenantId, userId: users[name].id, membershipId: member?.id ?? randomUUID(), profileId: profile };
    clients[name] = await calendarFixtureStep("bind-client", () => makeAuthedServerClient(users[name]));
  }
  // A mixed allowed role is deliberately not an Admin.
  await calendarFixtureStep("bind-membership", () => adminQuery("update public.tenant_memberships set role='saljare' where id=$1", [subjects.mixed.membershipId]));
  await calendarFixtureStep("bind-membership", () => adminQuery("delete from public.membership_roles where membership_id=$1", [subjects.mixed.membershipId]));
  await calendarFixtureStep("bind-membership", () => adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,'montor')", [subjects.mixed.tenantId,subjects.mixed.membershipId]));
  const anon = await calendarFixtureStep("bind-client", () => makeAnonServerClient()), trackedRaw: string[] = [], trackedProof: string[] = [], seedFacts = new Map<string, BookingSeed>();
  const randomPart = randomUUID().replaceAll("-", "").slice(0, 16).match(/.{4}/g)!.join(":");
  const isolatedTrustedIp = `2001:db8:${randomPart}`;
  const readRows = async (table: string) => (await adminQuery<{ row: Record<string, unknown> }>(`select to_jsonb(t) row from public.${table} t where tenant_id=any($1::uuid[]) order by tenant_id,id`, [base.tenantIds])).map(row => row.row);
  const response = async (result: Response): Promise<FeedResponse> => ({ status: result.status, headers: Object.fromEntries(result.headers.entries()), body: await result.text() });
  const pendingRequests = new Set<Promise<unknown>>();
  function track<T>(request: Promise<T>): Promise<T> {
    pendingRequests.add(request);
    void request.then(() => pendingRequests.delete(request), () => pendingRequests.delete(request));
    return request;
  }
  const fixture: BoundFixture = {
    base, clients, subjects, pendingRequests, tenantIds: base.tenantIds, keyId:key.keyId,secret:key.secret,currentRawFetch:null,isolatedTrustedIp,
    manage: async (subject,intent) => {
      const result = await manageCalendarFeed(clients[subject] as never,{action:intent.action,revision:intent.expectedRevision,attemptId:intent.attemptId},intent.correlationId);
      if (result.issuedPath) trackedRaw.push(result.issuedPath.split("/").at(-1)!);
      return {outcome:result.outcome,revision:result.revision,issuedUrl:result.issuedPath?`${testOrigin()}${result.issuedPath}`:null};
    },
    status: async (subject,attemptId) => {
      // Inspect the directly callable ordinary JWT RPC before the mapper can
      // drop an accidentally added field. Errors never serialize raw payloads.
      const { data, error } = await clients[subject].rpc("read_calendar_feed_status", { p_tenant_id: subjects[subject].tenantId, p_attempt_id: attemptId ?? null });
      const allowed = ["membershipId", "active", "revision", "lastUsedAt", "usageCount", "attemptOutcome", "attemptAction", "attemptRevision"].sort();
      if (error || !data || JSON.stringify(Object.keys(data).sort()) !== JSON.stringify(allowed)) throw new Error("Raw calendar status RPC field allowlist failed");
      const serialized = JSON.stringify(data);
      const physical = await adminQuery<{ token_hash: string }>("select token_hash from public.calendar_feed_tokens where tenant_id=any($1::uuid[]) and token_hash is not null", [base.tenantIds]);
      if ([...trackedRaw, ...trackedProof, key.secret, isolatedTrustedIp, ...physical.map(row => row.token_hash)].some(value => value && serialized.includes(value)) || /calendar\/feed\//.test(serialized)) throw new Error("Raw calendar status RPC privacy failed");
      const status = await readCalendarFeedStatus(clients[subject] as never,subjects[subject].tenantId,attemptId);
      return {...status,publicDto:data};
    },
    rawManage: async (name,intent,overrides={},attack) => {
      const subject = subjects[name === "anon" ? "own" : name], now = new Date();
      const token = intent.action === "revoke" ? null : issueCalendarFeedToken();
      const claims = {schema:FEED_SCHEMA,domain:MANAGE_DOMAIN,operation:intent.action,tenantId:subject.tenantId,actorId:subject.userId,membershipId:subject.membershipId,
        revision:String(intent.expectedRevision),attemptId:intent.attemptId,newHash:token?.hash??"",correlationId:intent.correlationId,keyId:key.keyId,issuedAt:now.toISOString(),expiresAt:new Date(now.getTime()+60000).toISOString()};
      attackClaims(claims,attack);
      const proof = signFeedProof(claims,attack === "wrong-key" ? Buffer.alloc(32,9).toString("base64url") : key.secret); trackedProof.push(proof);
      const args: Record<string,unknown> = {p_tenant_id:overrides.tenantId??subject.tenantId,p_actor_id:overrides.userId??subject.userId,p_membership_id:overrides.membershipId??subject.membershipId,
        p_action:intent.action,p_expected_revision:intent.expectedRevision,p_attempt_id:intent.attemptId,p_new_hash:token?.hash??null,p_correlation_id:intent.correlationId,p_claims:attack === "missing" ? null : claims,p_signature:proof};
      const fields: Partial<Record<ProofAttack,string>> = {"tampered-actor":"p_actor_id","tampered-tenant":"p_tenant_id","tampered-membership":"p_membership_id","tampered-attempt":"p_attempt_id"};
      if(attack&&fields[attack])args[fields[attack]!]=randomUUID();
      if(attack==="tampered-action")args.p_action="revoke";
      if(attack==="tampered-revision")args.p_expected_revision=intent.expectedRevision+1;
      if(attack==="weak-chosen-new-hash")args.p_new_hash="0".repeat(64);
      return normalizedRpc(await (name==="anon"?anon:clients[name]).rpc("manage_calendar_feed",args));
    },
    rawFetch: async (url,attack,options={}) => {
      let args = fixture.currentRawFetch;
      if(attack!=="replay" || !args) {
        const now=new Date(),tokenHash=hashFeedToken(tokenFromUrl(url)),ipHash=hashFeedIp(isolatedTrustedIp,key.secret);
        const claims: Record<string,string>={schema:FEED_SCHEMA,domain:FETCH_DOMAIN,operation:"fetch",tokenHash,ipHash,requestId:randomUUID(),keyId:key.keyId,issuedAt:now.toISOString(),expiresAt:new Date(now.getTime()+60000).toISOString()};
        attackClaims(claims,attack === "valid" ? undefined : attack as ProofAttack);
        const proof=signFeedProof(claims,attack==="wrong-key"?Buffer.alloc(32,9).toString("base64url"):key.secret);trackedProof.push(proof);
        args={p_token_hash:tokenHash,p_ip_hash:ipHash,p_claims:attack==="missing"?null:claims,p_signature:proof};
        if(attack==="tampered-token-hash")args.p_token_hash="0".repeat(64);
        if(attack==="tampered-ip-hash")args.p_ip_hash=options.changedIpHash??"f".repeat(64);
        if(attack==="tampered-request-id")(args.p_claims as Record<string,string>).requestId=randomUUID();
        if(options.callerWindow!==undefined)args.p_window=options.callerWindow;
        if(options.callerLimit!==undefined)args.p_limit=options.callerLimit;
        if(attack==="valid")fixture.currentRawFetch=args;
      }
      return normalizedRpc(await anon.rpc("fetch_calendar_feed",args));
    },
    seedBookings: async rows => {
      for(const row of rows) {
        const subject=subjects[row.subject], tenant=subject.tenantId;
        const customer=row.customerLabel===null?null:(await adminQuery<{id:string}>("insert into public.customers(tenant_id,customer_type,display_name) values($1,'company',$2) returning id",[tenant,row.customerLabel]))[0].id;
        const facility=row.facilityAddress===null||!customer?null:(await adminQuery<{id:string}>("insert into public.facilities(tenant_id,customer_id,name,address_line1) values($1,$2,'Fixture',$3) returning id",[tenant,customer,row.facilityAddress]))[0].id;
        const role=row.workRoleLabel===null?null:(await adminQuery<{id:string}>("insert into public.work_roles(tenant_id,display_name,cost_rate_ore,sell_rate_ore) values($1,$2,100,200) returning id",[tenant,row.workRoleLabel]))[0].id;
        const job=row.jobLabel===null||!customer?null:(await adminQuery<{id:string}>("insert into public.jobs(tenant_id,customer_id,facility_id,title) values($1,$2,$3,$4) returning id",[tenant,customer,facility,row.jobLabel]))[0].id;
        await adminQuery("insert into public.bookings(id,tenant_id,starts_at,ends_at,updated_at,all_day,status,description,work_role_id,job_id,customer_id,facility_id,create_command_id,create_payload_digest,create_result) values($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,repeat('a',64),'{}')",[row.id,tenant,row.startsAt,row.endsAt,row.updatedAt,row.allDay,row.status,row.description,role,job,customer,facility,randomUUID()]);
        await fixture.setAssignments(row.id,[row.subject,...row.additionalAssignees]);seedFacts.set(row.id,row);
      }
    },
    seedSeries: async subject => {
      const selected={...base,ownProfile:{id:subjects[subject].profileId!,membershipId:subjects[subject].membershipId}};
      const input=realSeriesInput(selected,{rule:{...realSeriesInput(selected).rule,count:5}}),reviewed=await reviewRealSeries(selected,input);
      const result=await runCommand(createBookingSeries,{client:base.adminClient as never,input:reviewed.input});
      if(!result.ok||result.data.occurrenceIds.length!==5)throw new Error("Real series fixture failed");
      return {unchangedId:result.data.occurrenceIds[0],movedExceptionId:result.data.occurrenceIds[1],cancelledId:result.data.occurrenceIds[2],splitSurvivingId:result.data.occurrenceIds[3],newOccurrenceIds:[]};
    },
    changeSeries: async (kind,id) => {
      const [row]=await adminQuery<Record<string,unknown>>("select * from public.bookings where id=$1 and tenant_id=$2",[id,base.base.tenantA.id]);
      if(!row)throw new Error("Real occurrence missing");
      if(kind==="split") {
        const [series]=await adminQuery<Record<string,unknown>>("select * from public.booking_series where id=$1",[row.series_id]);
        const input={...realSeriesInput(base),sourceSeriesId:String(row.series_id),seriesId:randomUUID(),expectedVersion:Number(series.version),pivotOccurrenceId:id};
        const reviewed=await reviewRealSeries(base,input),result=await runCommand(updateBookingSeries,{client:base.adminClient as never,input:reviewed.input});
        if(!result.ok)throw new Error("Real split failed");
      } else {
        const input=bookingInput([subjects.own.profileId!],{bookingId:id,status:kind==="cancel"?"cancelled":"planned",startsAt:kind==="exception"?"2026-11-01T07:00:00Z":String(row.starts_at),endsAt:kind==="exception"?"2026-11-01T08:00:00Z":String(row.ends_at),description:"Edited series occurrence"});
        input.startsAt=new Date(input.startsAt).toISOString();input.endsAt=new Date(input.endsAt).toISOString();
        const result=await bookingCommand("update",base.adminClient,input);if(!result.ok)throw new Error("Real occurrence update failed");
      }
    },
    setBooking: async (id,patch) => {
      const current=seedFacts.get(id);if(!current)throw new Error("Owned booking absent");
      const row={...current,...patch};
      await adminQuery("update public.bookings set starts_at=$2,ends_at=$3,status=$4,all_day=$5,updated_at=$6 where id=$1 and tenant_id=$7",[id,row.startsAt,row.endsAt,row.status,row.allDay,row.updatedAt,subjects[row.subject].tenantId]);seedFacts.set(id,row);
    },
    editProjectedSource: async (id,source,label,updatedAt) => {
      const current=seedFacts.get(id); if(!current)throw new Error("Owned booking absent");
      const refs={work_roles:"work_role_id",jobs:"job_id",customers:"customer_id",facilities:"facility_id"} as const;
      const labels={work_roles:"display_name",jobs:"title",customers:"display_name",facilities:"address_line1"} as const;
      if(!refs[source] || !/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(updatedAt))throw new Error("Invalid owned projection edit");
      await adminSession(async({query})=>{
        await query("begin");try {
          // Explicit source revisions are independent oracles, isolated to this
          // fixture's rows; connection-local trigger suppression is rolled back.
          await query("set local session_replication_role=replica");
          const changed=await query(`update public.${source} s set ${labels[source]}=$3,updated_at=$4 from public.bookings b where b.id=$1 and b.tenant_id=$2 and s.tenant_id=b.tenant_id and s.id=b.${refs[source]} returning s.id`,[id,subjects[current.subject].tenantId,label,updatedAt]);
          if(changed.length!==1)throw new Error("Owned projected source absent");
          await query("commit");
        }catch(error){await query("rollback");throw error;}
      });
    },
    setAssignments: async (id,names) => {
      const [row]=await adminQuery<{tenant_id:string}>("select tenant_id from public.bookings where id=$1 and tenant_id=any($2::uuid[])",[id,base.tenantIds]);if(!row)throw new Error("Owned booking absent");
      await adminQuery("delete from public.booking_assignees where booking_id=$1 and tenant_id=$2",[id,row.tenant_id]);
      for(const name of new Set(names))await adminQuery("insert into public.booking_assignees(tenant_id,booking_id,person_profile_id) values($1,$2,$3)",[row.tenant_id,id,subjects[name].profileId]);
    },
    setAuthority: async (name,patch) => {
      const subject=subjects[name];
      if(patch.tenantPresent===false) { await removeOwnedTenant(subject.tenantId);return; }
      if(patch.membershipPresent===false) {await adminQuery("delete from public.booking_assignees where person_profile_id=$1 and tenant_id=$2",[subject.profileId,subject.tenantId]);await adminQuery("delete from public.person_profiles where membership_id=$1 and tenant_id=$2",[subject.membershipId,subject.tenantId]);await adminQuery("delete from public.tenant_memberships where id=$1 and tenant_id=$2",[subject.membershipId,subject.tenantId]);return;}
      if(patch.primary)await adminQuery("update public.tenant_memberships set role=$2 where id=$1",[subject.membershipId,patch.primary]);
      if(patch.status)await adminQuery("update public.tenant_memberships set status=$2 where id=$1",[subject.membershipId,patch.status]);
      if(patch.additional) {await adminQuery("delete from public.membership_roles where membership_id=$1",[subject.membershipId]);for(const role of patch.additional)await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,$3)",[subject.tenantId,subject.membershipId,role]);}
      if(patch.profileArchived!==undefined)await adminQuery("update public.person_profiles set archived_at=case when $2 then clock_timestamp() else null end where id=$1",[subject.profileId,patch.profileArchived]);
    },
    setProvisioningState: async (name,state) => {await adminQuery("update public.tenants set provisioning_state=$2 where id=$1",[subjects[name].tenantId,state]);},
    replaceMembership: async name => {
      const subject=subjects[name];await fixture.setAuthority(name,{membershipPresent:false});
      const [member]=await adminQuery<{id:string}>("insert into public.tenant_memberships(tenant_id,user_id,status,role) values($1,$2,'active','montor') returning id",[subject.tenantId,subject.userId]);subject.membershipId=member.id;subject.profileId=null;
    },
    http: (url,options={}) => track((async () => {
      const target=new URL(url);if(target.origin!==testOrigin())throw new Error("Non-owned calendar HTTP target rejected");
      for(const [name,value] of Object.entries(options.query??{}))target.searchParams.set(name,value);
      try{return await response(await fetch(target,{headers:options.headers,redirect:"manual",cache:"no-store"}));}catch{throw calendarFixtureOrigin("scenario-http-transport");}
    })()),
    trustedFetch: (url,ip) => track((async () => response(await publicCalendarFeed(new URL(url).pathname.split("/").at(-1)!,new Headers(),{client:anon,trustedIp:ip})))()),
    physical: async () => {
      const raw=await readRows("calendar_feed_tokens"),audits=(await readRows("audit_events")).filter(row=>String(row.command).startsWith("calendar_feed."));
      audits.sort((a,b)=>Date.parse(String(a.created_at))-Date.parse(String(b.created_at)));
      const schedulingIntegrity:Record<string,unknown[]>={};for(const table of ["bookings","booking_assignees","booking_series","booking_conflicts","booking_conflict_resolutions","time_reports","jobs"])schedulingIntegrity[table]=await readRows(table);
      return {tokens:raw.filter(row=>row.token_hash!==null).map(row=>({id:String(row.id),tenantId:String(row.tenant_id),membershipId:String(row.membership_id),hash:String(row.token_hash),revokedAt:iso(row.revoked_at),createdAt:iso(row.created_at)!,lastUsedAt:iso(row.last_used_at),usageCount:Number(row.usage_count),revision:Number(row.revision),attemptId:String(row.attempt_id)})),
        audits:audits.map(row=>({action:String(row.command),actorId:String(row.actor_user_id),tenantId:String(row.tenant_id),attemptId:String((row.metadata as Record<string,unknown>).attemptId),metadata:row.metadata})),persistedRows:raw,schedulingIntegrity};
    },
    readAbuse: async (name,query={}) => {
      const result=await clients[name].rpc("read_calendar_feed_abuse",{p_tenant_id:query.tenantId??subjects[name].tenantId});
      return {denied:!!result.error,rows:result.error?[]:[{requestCount:result.data.requests,limitedCount:result.data.limited,lastSpikeAt:result.data.lastSpikeAt}]};
    },
    directTable: async (name,table,operation) => {
      const client=name==="anon"?anon:clients[name];let result;
      if(operation==="select")result=await client.from(table).select("*");
      else if(operation==="insert")result=await client.from(table).insert(table==="calendar_feed_tokens"?{tenant_id:subjects.own.tenantId,membership_id:subjects.own.membershipId,token_hash:"a".repeat(64),revision:99,attempt_id:randomUUID(),action:"create",expected_revision:0}:{ip_hash:hashFeedIp(isolatedTrustedIp,key.secret),window_start:new Date().toISOString(),request_count:1});
      else if(operation==="update")result=await client.from(table).update(table==="calendar_feed_tokens"?{revoked_at:new Date().toISOString()}:{request_count:99}).eq(table==="calendar_feed_tokens"?"tenant_id":"ip_hash",table==="calendar_feed_tokens"?subjects.own.tenantId:hashFeedIp(isolatedTrustedIp,key.secret));
      else result=await client.from(table).delete().eq(table==="calendar_feed_tokens"?"tenant_id":"ip_hash",table==="calendar_feed_tokens"?subjects.own.tenantId:hashFeedIp(isolatedTrustedIp,key.secret));
      return normalizedRpc(result);
    },
    acl: calendarAcl,
    telemetry: async () => {
      const path=process.env.CALENDAR_FEED_TEST_LOG_FILE;if(!path)throw new Error("Actual sanitized server telemetry fixture absent");
      const deadline=Date.now()+3000;
      while(Date.now()<deadline) {
        const value=await readFile(path,"utf8"),records=value.trim().split("\n").filter(Boolean).map(line=>JSON.parse(line) as Record<string,unknown>);
        const observed=records.filter(row=>row.event==="calendar_feed.runtime_observation").at(-1);
        if(records.some(row=>row.event==="calendar_feed.response") && observed && Number(observed.responseCount)>0) {
          if(observed.sensitiveOutputDetected!==false||observed.sensitiveOutputCount!==0)throw new Error("Runtime sensitive-output detector failed");
          return value;
        }
        await new Promise(resolve=>setTimeout(resolve,20));
      }
      throw new Error("Actual feed telemetry observation absent");
    },
    sensitiveTestValues: async () => [key.secret,...trackedProof],
    seedSchedulingRegressionState: async () => {
      await fixture.seedBookings([bookingSeed(),bookingSeed({subject:"peer"})]);await fixture.seedSeries("own");
      const [booking]=await adminQuery<{id:string}>("select id from public.bookings where tenant_id=$1 order by id limit 1",[subjects.own.tenantId]);
      await adminQuery("insert into public.time_reports(tenant_id,user_id,report_date,duration_minutes,filing_attempt_id,filing_digest) values($1,$2,'2026-10-12',60,$3,repeat('a',64))",[subjects.own.tenantId,subjects.own.userId,randomUUID()]);
      await adminQuery("insert into public.booking_conflict_resolutions(tenant_id,actor_id,command_id,booking_id,request_digest,action,outcome,target_keys,affected_booking_ids,result) values($1,$2,$3,$4,repeat('a',64),'accept','accepted','[]',array[$4::uuid],'{}')",[subjects.own.tenantId,subjects.admin.userId,randomUUID(),booking.id]);
      return (await fixture.physical()).schedulingIntegrity;
    },
  };
  return fixture;
}
function testOrigin(): string {
  const url=new URL(process.env.CALENDAR_FEED_TEST_BASE_URL??`http://127.0.0.1:${process.env.E2E_PORT??3100}`);
  if(!["127.0.0.1","localhost","[::1]"].includes(url.hostname))throw new Error("Calendar test host must be owned loopback");return url.origin;
}
function attackClaims(claims: Record<string,string>,attack?: ProofAttack) {
  if(attack==="wrong-domain")claims.domain="booking-conflicts";
  if(attack==="expired") {claims.issuedAt=new Date(Date.now()-120000).toISOString();claims.expiresAt=new Date(Date.now()-60000).toISOString();}
  if(attack==="future") {claims.issuedAt=new Date(Date.now()+60000).toISOString();claims.expiresAt=new Date(Date.now()+90000).toISOString();}
  if(attack==="over-60-seconds")claims.expiresAt=new Date(Date.parse(claims.issuedAt)+61000).toISOString();
}
async function removeOwnedTenant(tenantId:string) {
  // Ordinary cascades are retained; remove only owned restrictive booking edges first.
  await cleanupCalendarOwnedRows([tenantId]);
  await adminQuery("delete from public.tenants where id=$1",[tenantId]);
}
async function cleanupCalendarOwnedRows(tenantIds: readonly string[]) {
  if(!tenantIds.length||tenantIds.some(id=>!/^[a-f0-9-]{36}$/i.test(id)))throw new Error("Owned tenant UUIDs required");
  // Connection-local trigger mode follows the established immutable-report
  // fixture cleanup. It never alters a trigger or another session. Every delete
  // remains explicitly confined to the independently allocated tenant UUIDs.
  const tables=["calendar_feed_tokens","audit_events","time_reports","booking_conflict_resolutions","booking_conflicts","booking_assignees","bookings","booking_series","job_members","job_required_work_roles","job_access_windows","job_dependencies","jobs","facilities","contacts","customers","person_work_hours","person_profiles","work_roles"];
  await adminSession(async({query})=>{
    await query("begin");
    try {await query("set local session_replication_role=replica");for(const table of tables)await query(`delete from public.${table} where tenant_id=any($1::uuid[])`,[tenantIds]);await query("commit");}
    catch(error){await query("rollback");throw error;}
  });
  for(const table of tables)if((await adminQuery(`select 1 from public.${table} where tenant_id=any($1::uuid[]) limit 1`,[tenantIds])).length)throw new Error("Owned calendar row cleanup incomplete");
}

async function calendarAcl(): Promise<AclFacts> {
  const tables=await adminQuery<AclFacts["tables"][number]>(`select c.relname name,c.relrowsecurity "rlsEnabled",
   has_table_privilege('anon',c.oid,'SELECT') "anonSelect",
   has_table_privilege('authenticated',c.oid,'INSERT,UPDATE,DELETE') "authenticatedDml",
   has_table_privilege('anon',c.oid,'INSERT,UPDATE,DELETE') "anonDml",
   exists(select 1 from aclexplode(coalesce(c.relacl,acldefault('r',c.relowner))) a where a.grantee=0 and a.privilege_type in ('SELECT','INSERT','UPDATE','DELETE')) "publicInheritedDml",
   exists(select 1 from pg_attribute a where a.attrelid=c.oid and a.attnum>0 and not a.attisdropped and has_column_privilege('authenticated',c.oid,a.attname,'SELECT')) "authenticatedSensitiveColumns"
   from pg_class c where c.oid in ('public.calendar_feed_tokens'::regclass,'public.calendar_feed_ip_windows'::regclass) order by c.relname`);
  const [owner]=await adminQuery<AclFacts["owner"]>(`select rolname name,rolcanlogin login,rolinherit inherit,rolsuper superuser,rolbypassrls "bypassRls",
   has_schema_privilege(oid,'public','CREATE') "publicSchemaCreate",
   (pg_has_role('anon',oid,'MEMBER') or pg_has_role('authenticated',oid,'MEMBER') or pg_has_role('service_role',oid,'MEMBER')) "assumableByJwtRoles",
   has_table_privilege(oid,'public.contacts','SELECT') "unrelatedTableRead",has_table_privilege(oid,'vault.decrypted_secrets','SELECT') "generalVaultRead"
   from pg_roles where rolname='calendar_feed_owner'`);
  const allowed:Record<string,string[]>={tenants:["id"],tenant_memberships:["id","tenant_id","user_id","status","role"],membership_roles:["tenant_id","membership_id","role"],person_profiles:["id","tenant_id","membership_id","archived_at"],booking_assignees:["tenant_id","booking_id","person_profile_id"],bookings:["id","tenant_id","starts_at","ends_at","all_day","updated_at","status","work_role_id","job_id","customer_id","facility_id"],jobs:["id","tenant_id","title","customer_id","facility_id","updated_at"],customers:["id","tenant_id","display_name","updated_at"],work_roles:["id","tenant_id","display_name","updated_at"],facilities:["id","tenant_id","address_line1","address_line2","postal_code","city","updated_at"],calendar_feed_tokens:["*"],calendar_feed_ip_windows:["*"]};
  const effective=await adminQuery<{table:string;column:string}>(`select c.relname "table",a.attname "column" from pg_class c join pg_namespace n on n.oid=c.relnamespace join pg_attribute a on a.attrelid=c.oid where n.nspname='public' and c.relkind in ('r','p') and a.attnum>0 and not a.attisdropped and has_column_privilege('calendar_feed_owner',c.oid,a.attname,'SELECT')`);
  owner.effectiveReadOutsideAllowedColumns=effective.some(row=>!allowed[row.table]?.some(column=>column==='*'||column===row.column));
  owner.filteredHelperOnly=!owner.generalVaultRead;
  const definitions:Record<string,AclFacts["functions"][number]["purpose"]>={fetch_calendar_feed:"fetch",manage_calendar_feed:"manage",read_calendar_feed_status:"status",read_calendar_feed_abuse:"abuse"};
  const functions=await adminQuery<{name:string;owner:string;securityDefiner:boolean;emptySearchPath:boolean;anonExecute:boolean;authenticatedExecute:boolean;publicExecute:boolean}>(`select p.proname name,r.rolname owner,p.prosecdef "securityDefiner",coalesce('search_path=""'=any(p.proconfig),false) "emptySearchPath",has_function_privilege('anon',p.oid,'EXECUTE') "anonExecute",has_function_privilege('authenticated',p.oid,'EXECUTE') "authenticatedExecute",exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where grantee=0 and privilege_type='EXECUTE') "publicExecute" from pg_proc p join pg_roles r on r.oid=p.proowner where p.pronamespace='public'::regnamespace and p.proname=any($1::text[])`,[Object.keys(definitions)]);
  const helperNames:Record<string,AclFacts["helpers"][number]["purpose"]>={calendar_feed_attestation_payload:"canonical",calendar_feed_verify_attestation_internal:"verifier",calendar_feed_secret_internal:"filtered-secret"};
  const helpers=await adminQuery<{name:string;jwtExecute:boolean;publicExecute:boolean;feedOwnerExecute:boolean;otherRoleInheritedExecute:boolean;source:string}>(`select p.proname name,(has_function_privilege('anon',p.oid,'EXECUTE') or has_function_privilege('authenticated',p.oid,'EXECUTE')) "jwtExecute",exists(select 1 from aclexplode(coalesce(p.proacl,acldefault('f',p.proowner))) a where grantee=0 and privilege_type='EXECUTE') "publicExecute",has_function_privilege('calendar_feed_owner',p.oid,'EXECUTE') "feedOwnerExecute",has_function_privilege('service_role',p.oid,'EXECUTE') "otherRoleInheritedExecute",p.prosrc source from pg_proc p where p.pronamespace='public'::regnamespace and p.proname=any($1::text[])`,[Object.keys(helperNames)]);
  return {tables,owner,functions:functions.map(fn=>({...fn,purpose:definitions[fn.name]})),helpers:helpers.map(helper=>({...helper,purpose:helperNames[helper.name],exactConfiguredKeyFilter:helper.name!=="calendar_feed_secret_internal"||helper.source.includes("name='calendar_feed_attestation_' || p_key_id")})),ipColumns:(await adminQuery<{column_name:string}>("select column_name from information_schema.columns where table_schema='public' and table_name='calendar_feed_ip_windows'")).map(row=>row.column_name)};
}

/** Both allocated files are serial. Never expose the shared unknown bucket to
 * a row-isolated fixture; restore its exact prior state after requests settle. */
async function withOwnedUnknownWindow<T>(fx: BoundFixture, run: () => Promise<T>): Promise<T> {
  const ipHash=hashFeedIp(null,fx.secret);
  const [before]=await calendarFixtureStep("serial-window-setup", () => adminQuery<{window_start:string;request_count:string}>("select window_start::text,request_count::text from public.calendar_feed_ip_windows where ip_hash=$1",[ipHash]));
  let result:T|undefined;const errors:Error[]=[];
  try {
    await calendarFixtureStep("serial-window-setup", () => adminQuery("delete from public.calendar_feed_ip_windows where ip_hash=$1",[ipHash]));
    result=await run();
  }catch(error){errors.push(redactFailure(error));}
  while(fx.pendingRequests.size) {
    const requests=await Promise.allSettled([...fx.pendingRequests]);
    for(const request of requests)if(request.status==="rejected")errors.push(calendarFixtureDiagnostic("scenario", request.reason));
  }
  try {
    await adminSession(async({query})=>{
      await query("begin");try {
        await query("delete from public.calendar_feed_ip_windows where ip_hash=$1",[ipHash]);
        if(before)await query("insert into public.calendar_feed_ip_windows(ip_hash,window_start,request_count) values($1,$2,$3)",[ipHash,before.window_start,before.request_count]);
        await query("commit");
      }catch(error){await query("rollback");throw error;}
    });
  }catch(error){errors.push(calendarFixtureDiagnostic("serial-window-restore", error));}
  if(errors.length)throw new AggregateError(errors,"Unknown-IP scenario and cleanup outcomes retained; values redacted");
  return result as T;
}

async function calendarSerialControls(fx: BoundFixture): Promise<SerialControls> {
  const keyHash=(url:string)=>hashFeedToken(tokenFromUrl(url));
  return {
    withKeyState: async (state,run) => {
      const name=`calendar_feed_attestation_${fx.keyId}`;
      const [row]=await adminQuery<{id:string}>("select id from vault.secrets where name=$1",[name]);if(!row)throw new Error("Owned test key absent");
      let primary:unknown;let result:unknown;
      try {
        if(state==="missing"||state==="unrelated-vault-key-only")await adminQuery("select vault.update_secret($1::uuid,null,$2::text)",[row.id,`calendar_feed_unrelated_${randomUUID()}`]);
        else await adminQuery("select vault.update_secret($1::uuid,$2::text)",[row.id,Buffer.alloc(32,19).toString("base64url")]);
        result=await run();
      } catch(error) {primary=error;}
      let cleanup:unknown;try{await adminQuery("select vault.update_secret($1::uuid,$2::text,$3::text)",[row.id,fx.secret,name]);}catch(error){cleanup=error;}
      if(primary||cleanup)throw new AggregateError([...(primary?[new Error("Owned key fault/assertion failed")]:[]),...(cleanup?[new Error("Owned key restore failed")]:[])],"Calendar key fault failed; values redacted");
      return result as never;
    },
    withDatabaseTime: async (value,run) => {
      if(!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\dZ$/.test(value))throw new Error("Invalid test clock");
      const [before]=await adminQuery<{definition:string}>("select pg_get_functiondef('public.calendar_feed_now_internal()'::regprocedure) definition");
      let primary:unknown,result:unknown;const errors:Error[]=[];
      try {await adminQuery(`create or replace function public.calendar_feed_now_internal() returns timestamptz language sql volatile security invoker set search_path='' as $$ select '${value}'::timestamptz $$`);result=await run();}
      catch(error){primary=error;errors.push(new Error("Clock fixture/assertion failed"));}
      try {await adminQuery(before.definition);}catch{errors.push(new Error("Owned database clock restore failed"));}
      if(primary||errors.length)throw new AggregateError(errors,"Clock fixture failure; primary and cleanup retained");return result as never;
    },
    counters: async (url,ip) => {
      const [token]=await adminQuery<{request_count:string;window_start:string;spike_count:string}>("select request_count,window_start,spike_count from public.calendar_feed_tokens where token_hash=$1",[keyHash(url)]);
      const [axis]=await adminQuery<{request_count:string;ip_hash:string}>("select request_count,ip_hash from public.calendar_feed_ip_windows where ip_hash=$1",[hashFeedIp(ip,fx.secret)]);
      const [clock]=await adminQuery<{now:string}>("select public.calendar_feed_now_internal() now");
      return {token:Number(token?.request_count??0),ip:Number(axis?.request_count??0),windowStart:iso(token?.window_start)!,databaseNow:iso(clock.now)!,spikeCount:Number(token?.spike_count??0),storedIpIsKeyedHash:!!axis&&/^[0-9a-f]{64}$/.test(axis.ip_hash)&&axis.ip_hash!==ip};
    },
    withFault: async (scope,run) => calendarFault(scope,run),
    loseCommittedResponse: async (subject,intent) => {const result=await fx.manage(subject,intent);if(result.outcome!=="committed")throw new Error("No committed response to lose");},
    barrier: scope => calendarBarrier(scope),
    resetOwnedUnknownIpWindow: async () => {await adminQuery("delete from public.calendar_feed_ip_windows where ip_hash=$1",[hashFeedIp(null,fx.secret)]);},
    boundedInfrastructureCounts: async () => {
      const [row]=await adminQuery<{live:string;expired:string}>("select count(*) filter(where window_start>=to_timestamp(floor(extract(epoch from public.calendar_feed_now_internal())/900)*900)) live,count(*) filter(where window_start<to_timestamp(floor(extract(epoch from public.calendar_feed_now_internal())/900)*900)) expired from public.calendar_feed_ip_windows");
      return {liveWindows:Number(row.live),expiredWindows:Number(row.expired),documentedBound:4096};
    },
  };
}

async function calendarFault<T>(scope: Parameters<SerialControls["withFault"]>[0],run:()=>Promise<T>): Promise<{result:T;stageObserved:boolean;sqlstate:string;ownedObjectsRemaining:number}> {
  const suffix=randomUUID().replaceAll("-",""),fn=`cf_fault_${suffix}`,seq=`cf_seen_${suffix}`,trigger=`cf_trigger_${suffix}`;
  const projection=scope.stage==="projection-after-first-page"||scope.stage==="projection-query-canceled";
  const sqlstate=scope.stage==="projection-query-canceled"?"57014":"PT555";
  const table=scope.stage.endsWith("audit")?"audit_events":"calendar_feed_tokens";
  let definition:string|undefined,result:T|undefined,observed=false;const failures:Error[]=[];
  try {
    await adminSession(async({query})=>{
      await query("begin");try{
        await query(`create sequence public.${seq}`);
        await query(`create function public.${fn}() returns ${projection?"text":"trigger"} language plpgsql security definer set search_path='' as $$ begin ${projection?"":`if new.tenant_id<>'${scope.tenantId}'::uuid ${table==="audit_events"?`or new.correlation_id<>'${scope.correlationId}'::uuid or new.metadata->>'attemptId'<>'${scope.attemptId}'`:""} then return new; end if;`} perform nextval('public.${seq}'); raise exception 'owned calendar fault' using errcode='${sqlstate}'; end $$`);
        await query(`revoke all on function public.${fn}() from public,anon,authenticated,service_role`);
        await query(`grant execute on function public.${fn}() to calendar_feed_owner`);await query("commit");
      }catch(error){await query("rollback");throw error;}
    });
    if(projection) {
      const [row]=await adminQuery<{definition:string}>("select pg_get_functiondef('public.fetch_calendar_feed(text,text,jsonb,text)'::regprocedure) definition");definition=row.definition;
      const needle="coalesce(nullif(w.display_name,''),'Bokning')";if(!definition.includes(needle))throw new Error("Projection fault anchor missing");
      await adminQuery(definition.replace(needle,`case when b.tenant_id='${scope.tenantId}'::uuid then public.${fn}() else ${needle} end`));
    } else await adminQuery(`create trigger ${trigger} before ${table==="audit_events"?"insert":"update"} on public.${table} for each row execute function public.${fn}()`);
    result=await run();const [seen]=await adminQuery<{is_called:boolean}>(`select is_called from public.${seq}`);observed=seen.is_called;
  } catch {failures.push(new Error("Owned fault or assertion failed; values redacted"));}
  for(const action of [async()=>{if(definition)await adminQuery(definition);else await adminQuery(`drop trigger if exists ${trigger} on public.${table}`);},async()=>{await adminQuery(`drop function if exists public.${fn}()`);},async()=>{await adminQuery(`drop sequence if exists public.${seq}`);},async()=>{const rows=await adminQuery("select 1 from pg_proc where proname=$1 union all select 1 from pg_class where relname=$2 union all select 1 from pg_trigger where tgname=$3",[fn,seq,trigger]);if(rows.length)throw new Error("Owned catalog objects remain");}])try{await action();}catch{failures.push(new Error("Owned fault cleanup failed; object values redacted"));}
  if(failures.length)throw new AggregateError(failures,"Fault primary and cleanup outcomes retained");
  return {result:result as T,stageObserved:observed,sqlstate:observed?sqlstate:"",ownedObjectsRemaining:0};
}

async function calendarBarrier(scope: Parameters<SerialControls["barrier"]>[0]): ReturnType<SerialControls["barrier"]> {
  const suffix=randomUUID().replaceAll("-",""),fn=`cf_barrier_${suffix}`,trigger=`cf_barrier_t_${suffix}`,lock=Number.parseInt(suffix.slice(0,7),16);
  let releaseGate!:()=>void,entered!:()=>void;const gate=new Promise<void>(resolve=>{releaseGate=resolve;}),ready=new Promise<void>(resolve=>{entered=resolve;});
  const holder=adminSession(async({query})=>{await query("set statement_timeout='10s'");await query("select pg_advisory_lock(27155,$1)",[lock]);entered();try{await gate;}finally{await query("select pg_advisory_unlock(27155,$1)",[lock]);}});
  await Promise.race([ready,holder.then(()=>{throw new Error("Barrier holder exited before readiness");})]);
  let definition:string|undefined;const authority=scope.stage.endsWith("before-authority");
  const table=scope.stage==="fetch-authority-admitted"?"calendar_feed_tokens":"audit_events";
  try {if(authority) {
    const [row]=await adminQuery<{definition:string;source:string}>("select pg_get_functiondef(oid) definition,prosrc source from pg_proc where oid='public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean)'::regprocedure");definition=row.definition;
    const expression=row.source.trim().replace(/^select\s+/i,"");
    await adminQuery(`create or replace function public.calendar_feed_subject_internal(p_tenant uuid,p_membership uuid,p_actor uuid default null,p_admin boolean default false) returns boolean language plpgsql volatile security invoker set search_path='' as $$ begin if p_tenant='${scope.tenantId}'::uuid and p_membership='${scope.membershipId}'::uuid then perform pg_advisory_xact_lock(27155,${lock}); end if; return (${expression}); end $$`);
  } else {
    const condition=table==="audit_events"?`new.tenant_id='${scope.tenantId}'::uuid and new.metadata->>'attemptId'='${scope.attemptId}'`:`new.tenant_id='${scope.tenantId}'::uuid and new.membership_id='${scope.membershipId}'::uuid`;
    await adminQuery(`create function public.${fn}() returns trigger language plpgsql security definer set search_path='' as $$ begin if ${condition} then perform pg_advisory_xact_lock(27155,${lock}); end if; return new; end $$; revoke all on function public.${fn}() from public,anon,authenticated,service_role;`);
    await adminQuery(`create trigger ${trigger} before ${table==="audit_events"?"insert":"update"} on public.${table} for each row execute function public.${fn}()`);
  }} catch {
    releaseGate();const failures=[new Error("Owned barrier setup failed")];try{await holder;}catch{failures.push(new Error("Owned holder release failed"));}
    try {if(definition)await adminQuery(definition);else {await adminQuery(`drop trigger if exists ${trigger} on public.${table}`);await adminQuery(`drop function if exists public.${fn}()`);}}catch{failures.push(new Error("Owned barrier setup cleanup failed"));}
    throw new AggregateError(failures,"Barrier setup and cleanup outcomes retained");
  }
  let released=false;
  return {
    waitUntilEntered:async(timeoutMs)=>{const deadline=Date.now()+timeoutMs;while(Date.now()<deadline){const rows=await adminQuery("select 1 from pg_locks where locktype='advisory' and classid=27155 and objid=$1 and not granted",[lock]);if(rows.length)return;await new Promise(resolve=>setTimeout(resolve,20));}throw new Error("Owned calendar barrier was not reached");},
    release:async()=>{if(!released){released=true;releaseGate();await holder;}},
    assertOwnedObjectsAbsent:async()=>{
      if(!released){released=true;releaseGate();await holder;}
      if(definition)await adminQuery(definition);else {await adminQuery(`drop trigger if exists ${trigger} on public.${table}`);await adminQuery(`drop function if exists public.${fn}()`);}
      const rows=await adminQuery("select 1 from pg_proc where proname=$1 union all select 1 from pg_trigger where tgname=$2",[fn,trigger]);if(rows.length)throw new Error("Owned calendar barrier cleanup failed");
    },
  };
}

/** Independent small RFC5545 inspection; never calls production serializer/parser. */
export function calendarEvents(body: string): ParsedEvent[] {
  const unfolded = body.replace(/\r\n[ \t]/g, "");
  return [...unfolded.matchAll(/BEGIN:VEVENT\r\n([\s\S]*?)END:VEVENT\r\n/g)].map(match => {
    const properties: Record<string, string[]> = {};
    for (const line of match[1].split("\r\n").filter(Boolean)) {
      const colon = line.indexOf(":");
      if (colon < 1) throw new Error("Invalid RFC5545 property");
      const name = line.slice(0, colon);
      (properties[name] ??= []).push(line.slice(colon + 1));
    }
    const one = (name: string) => {
      const values = properties[name];
      if (values?.length !== 1) throw new Error(`Expected one ${name}`);
      return values[0];
    };
    return { uid: one("UID"), start: properties["DTSTART;VALUE=DATE"]?.[0] ?? one("DTSTART"),
      end: properties["DTEND;VALUE=DATE"]?.[0] ?? one("DTEND"), summary: one("SUMMARY"),
      location: properties.LOCATION?.[0] ?? null, properties };
  });
}
export function inactiveContract(response: FeedResponse) {
  // All security/cache/content headers, not volatile Date/request tracing IDs.
  const names = ["content-type", "cache-control", "pragma", "expires", "retry-after", "x-content-type-options",
    "content-security-policy", "referrer-policy", "set-cookie", "location", "etag", "last-modified"];
  return { status: response.status, body: response.body,
    headers: Object.fromEntries(names.map(name => [name, response.headers[name] ?? null])) };
}
export function tokenFromUrl(url: string): string {
  const path = new URL(url).pathname;
  const match = /^\/calendar\/feed\/([A-Za-z0-9_-]{43})$/.exec(path);
  if (!match) throw calendarFixtureOrigin("scenario-canonical-token-route");
  return match[1];
}
export function issuedUrl(result: ManagementObservation): string {
  const outcome = result.outcome;
  if (outcome !== "committed") {
    throw calendarFixtureOrigin(outcome === "denied" ? "scenario-issued-denied" : outcome === "unavailable" ? "scenario-issued-unavailable" : outcome === "conflict" ? "scenario-issued-conflict" : outcome === "replayed" ? "scenario-issued-replayed" : "scenario-issued-unknown-noncommitted");
  }
  if (!result.issuedUrl) throw calendarFixtureOrigin("scenario-issued-committed-missing-url");
  return result.issuedUrl;
}


// Cause-proof decision seam: no native error text or inferred SQL engine phase.
export function calendarCauseProofSelection(events: readonly CalendarFeedTraceEvent[]): "status" | "manage" | "not-selected" {
  if (!events.includes("context-match") || events.includes("context-mismatch") || events.includes("membership-mismatch") || events.includes("truncated")) return "not-selected";
  if (events.includes("status-rpc42501")) return "status";
  if (events.includes("manage-rpc42501") && events.includes("membership-match")) return "manage";
  return "not-selected";
}
export async function calendarCauseProofIdle(client: { readyForQuery?: boolean }, now = Date.now, sleep = (ms: number) => new Promise<void>(resolve => setTimeout(resolve, ms))) {
  const deadline = now() + 10_000;
  // Installed pg8.22 only sets readyForQuery after the server protocol boundary.
  // A query_timeout rejection alone is NOT proof that its server query ended.
  while (client.readyForQuery !== true && now() < deadline) await sleep(20);
  return client.readyForQuery === true;
}
// End cause-proof decision seam.

/** Explicit-mode-only fixture composition. Canonical cleanup is conditional on
 * actual command/protocol settlement; withBookingFixture's unconditional finally
 * is deliberately not used for this diagnostic path. Normal95 cases are intact. */
export async function runCalendarFeedCauseProof() {
  const report = { kind: "calendar_feed.cause_proof", mode: "cause-proof", outcome: "CAPTURE_UNAVAILABLE",
    events: [] as CalendarFeedTraceEvent[], baseline: "not-selected", sqlState: null as string | null,
    cleanupVerified: true, ordinarySettled: true, queriesSettled: true, failures: [] as string[] };
  let fixture: Awaited<ReturnType<typeof createRoleAwarePhaseAFixture>> | undefined;
  const fail = (stage: string) => { report.failures.push(stage); report.cleanupVerified = false; };
  try {
    if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE !== "1") throw Error("Diagnostic mode refused");
    fixture = await createRoleAwarePhaseAFixture();
    const tenantId = fixture.base.tenantA.id, userId = fixture.users.montor.id;
    const [member] = await adminQuery<{id:string}>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId,userId]);
    if (!member) throw Error("Controlled subject unavailable");
    const client = await makeAuthedServerClient(fixture.users.montor), intent = lifecycle("create",0);
    // Await the ACTUAL command, not a raced timeout or public-fetch pending set.
    report.ordinarySettled = false;
    const observed = await captureCalendarFeedTrace({ tenantId,userId,membershipId:member.id,attemptId:intent.attemptId,action:"create",revision:0 },
      () => manageCalendarFeed(client as never,{action:"create",revision:0,attemptId:intent.attemptId},intent.correlationId));
    report.ordinarySettled = true; report.events = observed.events;
    report.baseline = calendarCauseProofSelection(observed.events);
    report.outcome = !observed.ok ? "PRE_SQL_STOP" : observed.value.outcome === "committed" ? "ORDINARY_SUCCESS"
      : observed.events.includes("context-mismatch") || observed.events.includes("membership-mismatch") || observed.events.includes("truncated") ? "INCOMPARABLE" : "PRE_SQL_STOP";
    if (report.baseline !== "not-selected") {
      const runtime = await import("../../scripts/ci/with-calendar-feed-runtime.mjs");
      const { readFile } = await import("node:fs/promises");
      type Connection = ReturnType<typeof runtime.createCalendarFeedDatabaseClient>;
      let db: Connection | undefined, fresh: Connection | undefined, stack: Awaited<ReturnType<typeof runtime.qualifyCalendarFeedCauseProof>> | undefined;
      let beforeState: string | undefined, beforeCatalog: string | undefined, transaction = false;
      const ready = async (connection: Connection) => {
        const idle = await calendarCauseProofIdle(connection as unknown as {readyForQuery?:boolean});
        if (!idle) { report.queriesSettled = false; fail("protocol-unsettled"); }
        return idle;
      };
      const qualify = async (connection: Connection, qualification: Awaited<ReturnType<typeof runtime.qualifyCalendarFeedCauseProof>>) => {
        await connection.connect(); await runtime.readCalendarFeedSetupAuthority(connection);
        const privacy = await runtime.readCalendarFeedPrivacyPreflight(connection);
        if (!privacy.controls.every(control => control.matchesRequired)) throw Error("Privacy refused");
        const ledger = await connection.query("select version,name from supabase_migrations.schema_migrations order by version");
        if (JSON.stringify(ledger.rows.map(row=>({version:String(row.version),name:row.name}))) !== JSON.stringify(qualification.migrations)) throw Error("Ledger refused");
      };
      const identity = report.baseline === "status" ? "public.read_calendar_feed_status(uuid,uuid)"
        : "public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)";
      const catalog = async (connection: Connection) => {
        const result = await connection.query("select p.oid::text, p.proname, p.prosrc, pg_get_userbyid(p.proowner) owner, p.prosecdef, p.proconfig, p.proacl::text from pg_proc p where p.oid=to_regprocedure($1)",[identity]);
        if (result.rows.length !== 1) throw Error("Function identity refused");
        const row = result.rows[0], migration = (await readFile(new URL("../../supabase/migrations/20261020220000_personal_calendar_feed.sql",import.meta.url),"utf8")).replaceAll("\r\n","\n");
        const start = migration.indexOf("create function public."+row.proname+"("), body = migration.indexOf("as $$",start), end = migration.indexOf("$$;",body+5);
        if (start < 0 || body < start || end < body || row.owner !== "calendar_feed_owner" || row.prosecdef !== true
          || !row.proconfig?.includes('search_path=""') || row.prosrc.trim() !== migration.slice(body+5,end).trim()) throw Error("Original function source refused");
        return JSON.stringify(result.rows);
      };
      const state = async (connection: Connection) => JSON.stringify((await connection.query(
        "select coalesce((select jsonb_agg(to_jsonb(t) order by t.id) from public.calendar_feed_tokens t where tenant_id=$1),'[]'::jsonb) tokens, coalesce((select jsonb_agg(to_jsonb(a) order by a.id) from public.audit_events a where tenant_id=$1),'[]'::jsonb) audit",[tenantId])).rows);
      try {
        stack = await runtime.qualifyCalendarFeedCauseProof(); db = runtime.createCalendarFeedDatabaseClient(stack.stack,"proof");
        db.on("error",()=>{ report.queriesSettled=false; fail("protocol-unsettled"); });
        await qualify(db,stack);
        beforeCatalog = await catalog(db); beforeState = await state(db);
        await db.query("begin isolation level repeatable read"); transaction=true;
        await db.query("set local statement_timeout='5s'; set local lock_timeout='2s'");
        if(await state(db)!==beforeState) throw Error("Controlled snapshot changed");
        await db.query("savepoint controlled_baseline");
        const claims = JSON.stringify({sub:userId,role:"authenticated"});
        await db.query("select set_config('request.jwt.claims',$1,true)",[claims]);
        await db.query("set local session authorization authenticated");
        const at=new Date(); let managementValues: unknown[] | undefined;
        if(report.baseline==="manage") {
          const key=feedKeyFromEnv(), issued=issueCalendarFeedToken(), attemptId=randomUUID(), correlationId=randomUUID();
          const proof={schema:FEED_SCHEMA,domain:MANAGE_DOMAIN,operation:"create",tenantId,actorId:userId,membershipId:member.id,revision:"0",attemptId,newHash:issued.hash,correlationId,keyId:key.keyId,issuedAt:at.toISOString(),expiresAt:new Date(at.getTime()+60000).toISOString()};
          managementValues=[tenantId,userId,member.id,"create",0,attemptId,issued.hash,correlationId,proof,signFeedProof(proof,key.secret)];
        }
        const restricted = await db.query("select session_user=current_user and current_user='authenticated' and not a.rolsuper and not a.rolbypassrls and not b.rolsuper and not b.rolbypassrls and auth.uid()=$1::uuid and current_setting('request.jwt.claims')::jsonb->>'role'='authenticated' and current_setting('log_statement')='none' and current_setting('log_min_error_statement')='panic' and current_setting('log_parameter_max_length')='0' and current_setting('log_parameter_max_length_on_error')='0' as qualified from pg_roles a join pg_roles b on b.rolname=current_user where a.rolname=session_user",[userId]);
        if (restricted.rows.length!==1 || restricted.rows[0].qualified!==true || Date.now()-at.getTime()>5000) throw Error("Restricted identity or clock refused");
        // This is a NEW controlled direct-SQL call, never the old JWT session,
        // snapshot, proof bytes or first engine cause. At most ONE invocation.
        try {
          if(report.baseline==="status") await db.query("select public.read_calendar_feed_status($1::uuid,$2::uuid)",[tenantId,intent.attemptId]);
          else await db.query("select public.manage_calendar_feed($1::uuid,$2::uuid,$3::uuid,$4::text,$5::integer,$6::uuid,$7::text,$8::uuid,$9::jsonb,$10::text)",managementValues);
          report.outcome="NONREPRODUCED";
        } catch(error) {
          let code:unknown; try { code=Object.getOwnPropertyDescriptor(error,"code")?.value; } catch { /* UNKNOWN */ }
          const allowed=["42501","CF409","57014","08006","25P02","42P01","42883","42703","3F000","23505"];
          report.sqlState=typeof code==="string"&&allowed.includes(code)?code:null;
          report.outcome=code==="42501"?"AMBIGUOUS_SQL42501":code==="CF409"?"NONREPRODUCED":"UNKNOWN_ENGINE_ERROR";
        }
        if (!await ready(db)) throw Error("Query protocol unverified");
        await db.query("rollback to savepoint controlled_baseline");
        if(Date.now()-at.getTime()>10000) report.outcome="INCOMPARABLE";
      } catch { report.outcome="INCOMPARABLE"; report.failures.push("baseline-qualification-or-call"); }
      finally {
        if(db && await ready(db)) {
          try { if(transaction) { await db.query("rollback"); transaction=false; } } catch { fail("baseline-rollback"); }
          if(!transaction) {
            try { await db.query("reset session authorization; reset role"); await runtime.readCalendarFeedSetupAuthority(db); } catch { fail("baseline-reset"); }
            try { if(beforeCatalog!==undefined && await catalog(db)!==beforeCatalog || beforeState!==undefined && await state(db)!==beforeState) fail("baseline-state"); } catch { fail("baseline-state"); }
          }
        }
        if(db) { try { await db.end(); } catch { fail("baseline-close"); } }
        if(stack && report.queriesSettled && !transaction) {
          try {
            const again=await runtime.qualifyCalendarFeedCauseProof();
            if(again.stack.db.Id!==stack.stack.db.Id || again.stack.gateway.Id!==stack.stack.gateway.Id) throw Error("Fresh stack identity refused");
            fresh=runtime.createCalendarFeedDatabaseClient(again.stack,"absence");
            fresh.on("error",()=>{ report.queriesSettled=false; fail("fresh-protocol"); });
            await qualify(fresh,again);
            if(beforeCatalog!==undefined && await catalog(fresh)!==beforeCatalog || beforeState!==undefined && await state(fresh)!==beforeState) fail("fresh-state");
          } catch { fail("fresh-qualification-or-state"); }
          finally { if(fresh) { if(!await ready(fresh)) fail("fresh-protocol"); try { await fresh.end(); } catch { fail("fresh-close"); } } }
        }
      }
    }
  } catch { fail("fixture-or-ordinary"); report.outcome="CAPTURE_UNAVAILABLE"; }
  // No raced timeout counts as command or query completion. If unverified, keep
  // canonical fixture custody rather than deleting rows/Auth against live refs.
  if(fixture && report.ordinarySettled && report.queriesSettled && report.cleanupVerified) {
    try { await cleanupCalendarOwnedRows([fixture.base.tenantA.id,fixture.base.tenantB.id]); } catch { fail("fixture-rows"); }
    try { await cleanupRoleAwarePhaseAFixture(fixture); } catch { fail("fixture-canonical"); }
    try {
      if((await adminQuery("select 1 from public.tenants where id=any($1::uuid[]) limit 1",[[fixture.base.tenantA.id,fixture.base.tenantB.id]])).length) fail("fixture-absence");
    } catch { fail("fixture-absence"); }
  } else if(fixture) fail("fixture-custody-retained");
  if(!report.cleanupVerified || !report.ordinarySettled || !report.queriesSettled) report.outcome="CLEANUP_UNVERIFIED";
  return report;
}


## Full committed source: tests/integration/commands/calendar-feed.int.test.ts

import { createHash } from "node:crypto";
import { describe, test } from "vitest";
import { writeFile } from "node:fs/promises";
import { runCalendarFeedCauseProof } from "../../support/calendar-feed-atdd";
import { expectCalendar as expect } from "../../support/calendar-feed-atdd";
import { withCalendarFeedFixture, lifecycle, issuedUrl, tokenFromUrl, bookingSeed,
  type ManagementObservation, type FeedResponse } from "../../support/calendar-feed-atdd";

// Provider endpoint: TODO — authenticated calendar-feed commands/RPCs are new.
// Frozen provider contract: spec-15-5 AC1/2/4/6/9 and current-contracts-and-design.
// Seven-point scrutiny: sanitized lifecycle metadata + fresh URL once; outcomes
// and wire statuses/field names bind to real P5 source (not invented here).
// Required domain fields: action/revision/UUID attempt/current self; no escrow.
// Enums/types/nesting here are TEST observation types, not provider response JSON.
// SERIAL OWNER: later Vitest audit-DDL partition must include ONLY this file and
// calendar-feed/public-feed.int.test.ts in addition to the existing serial files.
// P4: every declaration skipped; no fixture, key, SQL, HTTP or resource executes.

// Explicit diagnostic inventory only: no declaration/skip/mutation in normal95.
if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE === "1") {
  test("15.5-DIAG001", async () => {
    const observation = await runCalendarFeedCauseProof();
    await writeFile("test-results/calendar-feed-cause-proof/observation.json", JSON.stringify(observation) + "\n", { mode: 0o600 });
    if (!observation.cleanupVerified || !observation.ordinarySettled || !observation.queriesSettled) throw new Error("Cause proof stopped with unverified custody; values redacted");
  }, 180_000);
}

if (process.env.CALENDAR_FEED_CAUSE_PROOF_MODE !== "1") describe("15.5 authenticated lifecycle, atomic audit and commit-order", () => {
  test("[P0] 15.5-INT001 AC1 AC6 own issuance stores only SHA256 and publishes a fresh URL once", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0);
      const result = await fx.manage("own", intent), url = issuedUrl(result), raw = tokenFromUrl(url);
      expect(/^[A-Za-z0-9_-]{43}$/.test(raw)).toBe(true);
      expect(Buffer.from(raw, "base64url").length).toBe(32);
      const physical = await fx.physical(), active = physical.tokens.filter(row => row.revokedAt === null);
      expect(active).toHaveLength(1);
      expect(active[0]).toMatchObject({ tenantId: fx.subjects.own.tenantId,
        membershipId: fx.subjects.own.membershipId, hash: createHash("sha256").update(raw, "utf8").digest("hex"),
        attemptId: intent.attemptId, usageCount: 0, lastUsedAt: null });
      expect(physical.audits).toHaveLength(1);
      expect(physical.audits[0]).toMatchObject({ action: "calendar_feed.create",
        actorId: fx.subjects.own.userId, tenantId: fx.subjects.own.tenantId, attemptId: intent.attemptId });
      expect(JSON.stringify(physical.persistedRows).includes(raw)).toBe(false);
      expect(JSON.stringify(physical.persistedRows).includes(url)).toBe(false);
      const status = await fx.status("own");
      expect(status).toMatchObject({ active: true, usageCount: 0, lastUsedAt: null });
      expect(JSON.stringify(status.publicDto).includes(raw)).toBe(false);
      expect(JSON.stringify(status.publicDto).includes(active[0].hash)).toBe(false);
    });
  });

  test("[P0] 15.5-INT002 AC1 AC2 rotate revokes old generation and revoke is audited once", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), oldUrl = issuedUrl(first);
      const rotated = await fx.manage("own", lifecycle("rotate", first.revision!)), newUrl = issuedUrl(rotated);
      expect(newUrl !== oldUrl).toBe(true);
      expect((await fx.trustedFetch(oldUrl, "192.0.2.10")).status).toBe(404);
      expect((await fx.trustedFetch(newUrl, "192.0.2.10")).status).toBe(200);
      const revoke = lifecycle("revoke", rotated.revision!);
      expect((await fx.manage("own", revoke)).outcome).toBe("committed");
      expect((await fx.manage("own", revoke)).issuedUrl).toBeNull();
      expect((await fx.trustedFetch(newUrl, "192.0.2.10")).status).toBe(404);
      const state = await fx.physical();
      expect(state.tokens.filter(row => row.revokedAt === null)).toHaveLength(0);
      expect(state.audits.map(row => row.action)).toEqual([
        "calendar_feed.create", "calendar_feed.rotate", "calendar_feed.revoke",
      ]);
    });
  });

  test("[P0] 15.5-INT003 AC2 concurrent CAS rotations cannot overwrite or create two active generations", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0));
      const results = await Promise.all([fx.manage("own", lifecycle("rotate", first.revision!)),
        fx.manage("own", lifecycle("rotate", first.revision!))]);
      expect(results.map(result => result.outcome).sort()).toEqual(["committed", "conflict"]);
      const state = await fx.physical();
      expect(state.tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      expect(state.audits.filter(row => row.action === "calendar_feed.rotate")).toHaveLength(1);
      expect((await fx.manage("own", lifecycle("revoke", first.revision!))).outcome).toBe("conflict");
      expect((await fx.physical()).tokens).toEqual(state.tokens);
    });
  });

  test("[P0] 15.5-INT004 AC2 exact attempt replay is sanitized and old attempt cannot accept a different new hash", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const create = lifecycle("create", 0), first = await fx.manage("own", create);
      const before = await fx.physical(), replay = await fx.manage("own", create);
      expect(replay).toMatchObject({ outcome: "replayed", issuedUrl: null, revision: first.revision });
      const changed = await fx.rawManage("own", create, {}, "changed-new-hash");
      expect(changed.denied).toBe(true);
      expect(changed.rows).toEqual([]);
      expect((await fx.manage("own", { ...create, action: "rotate" })).outcome).toBe("conflict");
      expect((await fx.manage("own", { ...create, expectedRevision: 99 })).outcome).toBe("conflict");
      const after = await fx.physical();
      expect(after.tokens).toEqual(before.tokens);
      expect(after.audits).toEqual(before.audits);
      expect(JSON.stringify(replay)).not.toContain(tokenFromUrl(issuedUrl(first)));
    });
  });

  test("[P0] 15.5-INT005 AC2 lost committed response reconciles metadata and needs a separate explicit rotation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0);
      await fx.serial.loseCommittedResponse("own", intent);
      const committed = await fx.physical();
      expect(committed.tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      expect(committed.audits).toHaveLength(1);
      const status = await fx.status("own", intent.attemptId);
      expect(status).toMatchObject({ active: true, attemptOutcome: "committed", usageCount: 0 });
      expect(status.publicDto).not.toHaveProperty("url");
      expect(status.publicDto).not.toHaveProperty("token");
      const retry = await fx.manage("own", intent);
      expect(retry).toMatchObject({ outcome: "replayed", issuedUrl: null });
      expect((await fx.physical()).tokens).toEqual(committed.tokens);
      const replacement = await fx.manage("own", lifecycle("rotate", status.revision));
      expect(issuedUrl(replacement)).toMatch(/\/calendar\/feed\/[A-Za-z0-9_-]{43}$/);
      const final = await fx.physical();
      expect(final.tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      expect(final.audits.map(row => row.action)).toEqual(["calendar_feed.create", "calendar_feed.rotate"]);
      expect(JSON.stringify(final.persistedRows)).not.toContain(tokenFromUrl(issuedUrl(replacement)));
    });
  });

  test("[P0] 15.5-INT006 AC1 AC2 create audit fault proves intended stage then rolls back generation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0), before = await fx.physical();
      const receipt = await fx.serial.withFault({ tenantId: fx.subjects.own.tenantId,
        attemptId: intent.attemptId, correlationId: intent.correlationId, stage: "create-audit" },
      () => fx.manage("own", intent));
      expect(receipt.stageObserved).toBe(true);
      expect(receipt.sqlstate).toMatch(/^P[0-9A-Z]{4}$/);
      expect(receipt.result.outcome).toBe("unavailable");
      expect(receipt.result.issuedUrl).toBeNull();
      expect(receipt.ownedObjectsRemaining).toBe(0);
      expect(await fx.physical()).toEqual(before);
    });
  });

  test("[P0] 15.5-INT007 AC2 failed rotation audit leaves old usable and installs no new generation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), oldUrl = issuedUrl(first);
      const intent = lifecycle("rotate", first.revision!), before = await fx.physical();
      const receipt = await fx.serial.withFault({ tenantId: fx.subjects.own.tenantId,
        attemptId: intent.attemptId, correlationId: intent.correlationId, stage: "rotate-audit" },
      () => fx.manage("own", intent));
      expect(receipt.stageObserved).toBe(true);
      expect(receipt.result).toMatchObject({ outcome: "unavailable", issuedUrl: null });
      expect(receipt.ownedObjectsRemaining).toBe(0);
      expect(await fx.physical()).toEqual(before);
      expect((await fx.trustedFetch(oldUrl, "192.0.2.11")).status).toBe(200);
    });
  });

  test("[P0] 15.5-INT008 AC2 failed revoke audit leaves token usable with no false revocation", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      const intent = lifecycle("revoke", first.revision!), before = await fx.physical();
      const receipt = await fx.serial.withFault({ tenantId: fx.subjects.own.tenantId,
        attemptId: intent.attemptId, correlationId: intent.correlationId, stage: "revoke-audit" },
      () => fx.manage("own", intent));
      expect(receipt.stageObserved).toBe(true);
      expect(receipt.result.outcome).toBe("unavailable");
      expect(receipt.ownedObjectsRemaining).toBe(0);
      expect(await fx.physical()).toEqual(before);
      expect((await fx.trustedFetch(url, "192.0.2.12")).status).toBe(200);
    });
  });

  test("[P0] 15.5-INT009 AC2 AC4 AC9 current role loss committed before authority blocks queued management", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const intent = lifecycle("create", 0), subject = fx.subjects.own;
      const barrier = await fx.serial.barrier({ ...subject, attemptId: intent.attemptId, stage: "management-before-authority" });
      const pending: Promise<ManagementObservation>[] = [];
      try {
        pending.push(fx.manage("own", intent));
        await barrier.waitUntilEntered(5_000);
        await fx.setAuthority("own", { primary: "saljare", additional: [] });
        await barrier.release();
        expect((await pending[0]).outcome).toBe("denied");
        expect((await fx.physical()).tokens).toHaveLength(0);
        expect((await fx.physical()).audits).toHaveLength(0);
      } finally {
        await barrier.release(); // release BEFORE settling all promises, even after an assertion failure
        await Promise.allSettled(pending);
        await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test("[P0] 15.5-INT010 AC2 AC9 admitted fetch may finish before revoke while later fetch is denied", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      await fx.seedBookings([bookingSeed()]);
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      const intent = lifecycle("revoke", first.revision!);
      const barrier = await fx.serial.barrier({ ...fx.subjects.own, attemptId: intent.attemptId,
        stage: "fetch-authority-admitted" });
      const pending: Promise<FeedResponse | ManagementObservation>[] = [];
      try {
        const fetch = fx.trustedFetch(url, "192.0.2.13"); pending.push(fetch);
        await barrier.waitUntilEntered(5_000);
        const revoke = fx.manage("own", intent); pending.push(revoke);
        await barrier.release();
        expect((await fetch).status).toBe(200);
        expect((await revoke).outcome).toBe("committed");
        expect((await fx.trustedFetch(url, "192.0.2.13")).status).toBe(404);
      } finally {
        await barrier.release(); await Promise.allSettled(pending); await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test("[P0] 15.5-INT011 AC2 AC9 revoke commits before a waiting fetch and prevents its disclosure", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      const intent = lifecycle("revoke", first.revision!);
      const barrier = await fx.serial.barrier({ ...fx.subjects.own, attemptId: intent.attemptId, stage: "revoke-before-commit" });
      const pending: Promise<FeedResponse | ManagementObservation>[] = [];
      try {
        const revoke = fx.manage("own", intent); pending.push(revoke);
        await barrier.waitUntilEntered(5_000);
        const fetch = fx.trustedFetch(url, "192.0.2.14"); pending.push(fetch);
        await barrier.release();
        expect((await revoke).outcome).toBe("committed");
        const response = await fetch;
        expect(response.status).toBe(404);
        expect(response.body).not.toContain("BEGIN:VCALENDAR");
      } finally {
        await barrier.release(); await Promise.allSettled(pending); await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test("[P0] 15.5-INT012 AC1 AC2 AC9 committed rotation rejects waiting old fetch and preserves new token", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), oldUrl = issuedUrl(first);
      const intent = lifecycle("rotate", first.revision!);
      const barrier = await fx.serial.barrier({ ...fx.subjects.own, attemptId: intent.attemptId, stage: "rotate-before-commit" });
      const pending: Promise<FeedResponse | ManagementObservation>[] = [];
      try {
        const rotate = fx.manage("own", intent); pending.push(rotate);
        await barrier.waitUntilEntered(5_000);
        const oldFetch = fx.trustedFetch(oldUrl, "192.0.2.15"); pending.push(oldFetch);
        await barrier.release();
        const rotated = await rotate;
        expect((await oldFetch).status).toBe(404);
        expect((await fx.trustedFetch(issuedUrl(rotated), "192.0.2.15")).status).toBe(200);
        expect((await fx.physical()).tokens.filter(row => row.revokedAt === null)).toHaveLength(1);
      } finally {
        await barrier.release(); await Promise.allSettled(pending); await barrier.assertOwnedObjectsAbsent();
      }
    });
  });

  test("[P0] 15.5-INT013 AC2 simultaneous initial create and later revoke/rotate never resurrect stale intent", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const initial = await Promise.all([fx.manage("own", lifecycle("create", 0)), fx.manage("own", lifecycle("create", 0))]);
      expect(initial.map(row => row.outcome).sort()).toEqual(["committed", "conflict"]);
      const revision = (await fx.status("own")).revision;
      const revoke = lifecycle("revoke", revision), rotate = lifecycle("rotate", revision);
      const concurrent = await Promise.all([fx.manage("own", revoke), fx.manage("own", rotate)]);
      expect(concurrent.map(row => row.outcome).sort()).toEqual(["committed", "conflict"]);
      const after = await fx.physical();
      expect(after.tokens.filter(row => row.revokedAt === null).length).toBeLessThanOrEqual(1);
      expect(after.audits).toHaveLength(2);
      const rejected = concurrent[0].outcome === "conflict" ? revoke : rotate;
      expect((await fx.manage("own", rejected)).outcome).toBe("conflict");
      expect(await fx.physical()).toEqual(after);
    });
  });

  test("[P1] 15.5-INT014 AC6 last-used is database admitted fetch time and lifecycle alone never increments usage", async () => {
    await withCalendarFeedFixture("serial-commands", async fx => {
      const first = await fx.manage("own", lifecycle("create", 0)), url = issuedUrl(first);
      expect(await fx.status("own")).toMatchObject({ lastUsedAt: null, usageCount: 0 });
      await fx.serial.withDatabaseTime("2026-10-20T12:07:00Z", async () => {
        expect((await fx.trustedFetch(url, "192.0.2.16")).status).toBe(200);
        expect(await fx.status("own")).toMatchObject({ lastUsedAt: "2026-10-20T12:07:00.000Z", usageCount: 1 });
      });
      const status = await fx.status("own"), physical = await fx.physical();
      expect(physical.tokens.find(row => row.revokedAt === null)?.lastUsedAt).toBe(status.lastUsedAt);
      expect(JSON.stringify(status.publicDto)).not.toContain(tokenFromUrl(url));
      expect(JSON.stringify(status.publicDto)).not.toContain(physical.tokens[0].hash);
    });
  });


  test("[P0] 15.5-INT015 AC4 AC9 native PG17 restricted creator executes the exact owner bootstrap and SET ownership", async context => {
    // This case has its own disposable direct connections: an unverified session
    // is closed, never returned to an application/test pool. No resource startup.
    const { randomUUID } = await import("node:crypto");
    const { readFile, readdir, realpath, stat } = await import("node:fs/promises");
    const { join } = await import("node:path");
    const { fileURLToPath } = await import("node:url");
    const { execFile } = await import("node:child_process");
    const { promisify } = await import("node:util");
    const { assertLocalStack, LOCAL_SUPABASE_DB_URL } = await import("../../support/test-env");
    const { validateAdmission, validateStackIdentity, FEED_FUNCTIONS, createCalendarFeedDatabaseClient,
      readCalendarFeedSetupAuthority, readCalendarFeedPrivacyPreflight } = await import("../../../scripts/ci/with-calendar-feed-runtime.mjs");
    const suffix = randomUUID().replaceAll("-", "");
    const migrator = `cf_m_${suffix}`, owner = `cf_o_${suffix}`, schema = `cf_s_${suffix}`, fn = `cf_f_${suffix}`;
    const root = fileURLToPath(new URL("../../../", import.meta.url));
    const failures: Error[] = [];
    let stage = "qualification", connected = false, original: string | undefined, transportFailed = false, cleaning = false;
    const primaryDeadline = Date.now() + 80_000;
    let nativeVersion: { serverVersion: string; serverVersionNum: number } | undefined;
    let stack: Parameters<typeof createCalendarFeedDatabaseClient>[0] | undefined;
    let client: ReturnType<typeof createCalendarFeedDatabaseClient> | undefined;
    function directClient(readOnly = false) {
      try {
        if (!stack) throw new Error("Qualified setup unavailable");
        return createCalendarFeedDatabaseClient(stack, readOnly ? "absence" : "proof");
      }
      catch { throw new Error("PG17 proof connection configuration refused; details redacted"); }
    }
    async function setupQualified(connection: ReturnType<typeof createCalendarFeedDatabaseClient>) {
      await readCalendarFeedSetupAuthority(connection);
      const privacy = await readCalendarFeedPrivacyPreflight(connection);
      if (!privacy.controls.every(control => control.matchesRequired)) throw new Error("PG17 setup privacy refused");
    }
    const pending = new Set<Promise<unknown>>();
    async function sql<Row extends import("pg").QueryResultRow = import("pg").QueryResultRow>(text: string, values: unknown[] = []) {
      if (!cleaning && Date.now() > primaryDeadline) throw new Error("PG17 proof primary deadline exceeded");
      if (!client) throw new Error("PG17 proof client unavailable");
      const request = client.query<Row>(text, values); pending.add(request);
      try { return await request; } finally { pending.delete(request); }
    }
    // Every credited source/SET/ownership operation follows this immediate check.
    async function restricted() {
      const { rows: [identity] } = await sql<{ session: string; current: string; rolcanlogin: boolean; rolinherit: boolean; rolsuper: boolean;
        rolcreatedb: boolean; rolcreaterole: boolean; rolreplication: boolean; rolbypassrls: boolean; self_grant: string }>(
        "select session_user::text session,current_user::text current,r.rolcanlogin,r.rolinherit,r.rolsuper,r.rolcreatedb,r.rolcreaterole,r.rolreplication,r.rolbypassrls,current_setting('createrole_self_grant') self_grant from pg_roles r where r.rolname=current_user");
      expect(identity).toMatchObject({ session: migrator, current: migrator, rolcanlogin: false, rolinherit: false,
        rolsuper: false, rolcreatedb: false, rolcreaterole: true, rolreplication: false, rolbypassrls: false, self_grant: "" });
    }
    async function originalIdentity() {
      const { rows: [identity] } = await sql<{ session: string; current: string; super: boolean }>(
        "select session_user::text session,current_user::text current,r.rolsuper super from pg_roles r where r.rolname=current_user");
      if (!original || identity.session !== original || identity.current !== original || !identity.super) throw new Error("Original isolated identity not restored");
      if (!client) throw new Error("PG17 proof original client unavailable");
      await setupQualified(client);
    }
    function redacted(error: unknown, label: string): Error {
      return error instanceof AggregateError ? new AggregateError(error.errors.map(item => redacted(item, label)), label) : new Error(label);
    }
    async function expectedFailure(name: string, operation: () => Promise<unknown>, code: string, message?: string) {
      await sql(`savepoint ${name}`);
      let observed: { code?: string; message?: string } | undefined;
      try { await operation(); } catch (error) { observed = error as typeof observed; }
      const cleanup: Error[] = []; let restored = false;
      try { await sql(`rollback to savepoint ${name}`); restored = true; }
      catch { cleanup.push(new Error("Expected-error savepoint rollback failed")); }
      if (restored) try { await sql(`release savepoint ${name}`); }
      catch { cleanup.push(new Error("Expected-error savepoint release failed")); }
      if (cleanup.length) throw new AggregateError([...(observed ? [new Error("Guard operation outcome retained; details redacted")] : []), ...cleanup], "Expected-error primary and cleanup failures");
      // Always restore the savepoint before making assertions after an error.
      expect(observed?.code).toBe(code);
      if (message !== undefined) expect(observed?.message).toBe(message);
    }
    async function absent(connection: ReturnType<typeof createCalendarFeedDatabaseClient>) {
      // Both same and fresh connections observe committed catalogs read-only.
      const errors: Error[] = []; let opened = false;
      try {
        await connection.query("begin read only"); opened = true;
        const { rows: [counts] } = await connection.query<{ roles: number; schemas: number; functions: number }>(
          "select (select count(*)::integer from pg_roles where rolname=any($1::text[])) roles,(select count(*)::integer from pg_namespace where nspname=$2) schemas,(select count(*)::integer from pg_proc where proname=$3) functions", [[migrator, owner], schema, fn]);
        expect(counts).toEqual({ roles: 0, schemas: 0, functions: 0 });
      } catch { errors.push(new Error("Owned catalog absence not proven")); }
      if (opened) try { await connection.query("rollback"); }
      catch { errors.push(new Error("Read-only catalog transaction rollback failed")); }
      if (errors.length) throw new AggregateError(errors, "Catalog proof and cleanup outcomes retained");
    }
    try {
      assertLocalStack();
      validateAdmission("db", process.env, process.platform);
      expect(process.env.SUPABASE_TEST_REQUIRED).toBe("1");
      const endpoint = new URL(LOCAL_SUPABASE_DB_URL);
      expect(["127.0.0.1", "localhost", "[::1]"].includes(endpoint.hostname)).toBe(true);
      expect(await realpath(root)).toBe(await realpath(process.env.GITHUB_WORKSPACE ?? ""));
      const git = await stat(join(root, ".git")); expect(git.isDirectory()).toBe(true);
      // Fixed read-only commands reuse the existing wrapper's actual admission.
      // Captured Docker/status JSON and errors remain in memory, never in evidence.
      const capture = promisify(execFile);
      const containers = JSON.parse((await capture("docker", ["inspect", "supabase_db_kopplas", "supabase_kong_kopplas"],
        { cwd: root, shell: false, timeout: 15_000, maxBuffer: 2_000_000 })).stdout);
      const status = JSON.parse((await capture("supabase", ["status", "--output", "json"],
        { cwd: root, shell: false, timeout: 15_000, maxBuffer: 2_000_000 })).stdout);
      stack = { db: containers[0], gateway: containers[1], checkoutTime: git.birthtimeMs, now: Date.now(), status };
      validateStackIdentity(stack);
      expect(status.DB_URL === LOCAL_SUPABASE_DB_URL).toBe(true);
      const migrations = (await readdir(join(root, "supabase/migrations"))).filter(name => /^\d{14}_.+\.sql$/.test(name)).sort()
        .map(name => ({ version: name.slice(0, 14), name: name.slice(15, -4) }));
      const source = await readFile(join(root, "supabase/migrations/20261020220000_personal_calendar_feed.sql"), "utf8");
      const leading = /^-- Story[^\n]*\r?\n(do \$\$[\s\S]*?\r?\n\$\$;)/.exec(source)?.[1];
      if (!leading || source.split(leading).length !== 2 || !source.slice(source.indexOf(leading) + leading.length).trimStart().startsWith("grant usage,create on schema public")) throw new Error("Unique leading source bootstrap unavailable");
      const bootstrap = leading.replace(/\bcalendar_feed_owner\b/g, owner).replace(/\bpostgres\b/g, migrator);
      if (bootstrap.replaceAll(owner, "calendar_feed_owner").replaceAll(migrator, "postgres") !== leading) throw new Error("Non-reversible source bootstrap substitution");
      client = directClient(); client.on("error", () => { transportFailed = true; });
      stage = "setup-connect";
      await client.connect(); connected = true;
      stage = "setup-authority-privacy";
      await setupQualified(client);
      const { rows: [identity] } = await sql<{ session: string; current: string; super: boolean; session_super: boolean; server_version: string; server_version_num: string }>(
        "select session_user::text session,current_user::text current,r.rolsuper super,s.rolsuper session_super,current_setting('server_version') server_version,current_setting('server_version_num') server_version_num from pg_roles r join pg_roles s on s.rolname=session_user where r.rolname=current_user");
      original = identity.session;
      if (identity.current !== original || !identity.super || !identity.session_super || Math.floor(Number(identity.server_version_num) / 10000) !== 17) throw new Error("Isolated native PG17 superuser qualification failed");
      nativeVersion = { serverVersion: identity.server_version, serverVersionNum: Number(identity.server_version_num) };
      const { rows: ledger } = await sql("select version,name from supabase_migrations.schema_migrations order by version");
      expect(JSON.stringify(ledger.map(row => ({ version: String(row.version), name: row.name }))) === JSON.stringify(migrations)).toBe(true);
      const { rows: functions } = await sql("select p.oid::regprocedure::text identity,pg_get_userbyid(p.proowner) owner,p.prosecdef definer from pg_proc p where p.oid=any(array[" + FEED_FUNCTIONS.map((_: string, i: number) => `to_regprocedure($${i + 1})`).join(",") + "])", [...FEED_FUNCTIONS]);
      expect(functions.length).toBe(FEED_FUNCTIONS.length);
      expect(functions.every(row => row.owner === "calendar_feed_owner" && row.definer === true)).toBe(true);
      await absent(client);
      await context.annotate(JSON.stringify({ ...nativeVersion, isolatedStackQualified: true }), "calendar-feed-pg17-observed");
      stage = "transaction-setup";
      await sql("begin");
      await sql(`create role ${migrator} nologin noinherit nosuperuser nocreatedb createrole noreplication nobypassrls`);
      await sql(`create schema ${schema} authorization ${migrator}`);
      await sql(`set local session authorization ${migrator}`);
      await restricted();
      stage = "native-engine-baseline";
      await sql("savepoint native_baseline");
      await restricted();
      await sql(`create role ${owner} nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls`);
      const { rows: baseline } = await sql<{ admin_option: boolean; set_option: boolean; inherit_option: boolean }>(
        "select m.admin_option,m.set_option,m.inherit_option from pg_auth_members m join pg_roles r on r.oid=m.roleid join pg_roles u on u.oid=m.member where r.rolname=$1 and u.rolname=$2", [owner, migrator]);
      expect(baseline).toEqual([{ admin_option: true, set_option: false, inherit_option: false }]);
      await expectedFailure("native_set_denied", async () => {
        await restricted(); await sql(`set local role ${owner}`);
      }, "42501");
      await sql("rollback to savepoint native_baseline");
      await sql("release savepoint native_baseline");
      expect((await sql("select 1 from pg_roles where rolname=$1", [owner])).rows).toHaveLength(0);
      stage = "restricted-fresh-source";
      await restricted(); await sql(bootstrap); // exact source statements, genuinely absent target
      const assertOwner = async () => {
        const { rows: [role] } = await sql("select rolcanlogin,rolinherit,rolsuper,rolcreatedb,rolcreaterole,rolreplication,rolbypassrls from pg_roles where rolname=$1", [owner]);
        expect(role).toEqual({ rolcanlogin: false, rolinherit: false, rolsuper: false, rolcreatedb: false,
          rolcreaterole: false, rolreplication: false, rolbypassrls: false });
        const { rows: [authority] } = await sql("select pg_has_role(current_user,$1,'SET') can_set,pg_has_role(current_user,$1,'USAGE') can_use,exists(select 1 from pg_auth_members m join pg_roles r on r.oid=m.roleid where r.rolname=$1 and m.admin_option) creator_admin", [owner]);
        expect(authority).toEqual({ can_set: true, can_use: false, creator_admin: true });
        const { rows: memberships } = await sql<{ inherit_option: boolean }>(
          "select m.inherit_option from pg_auth_members m join pg_roles r on r.oid=m.roleid join pg_roles u on u.oid=m.member where r.rolname=$1 and u.rolname=$2", [owner, migrator]);
        expect(memberships.length).toBeGreaterThan(0);
        expect(memberships.every(row => row.inherit_option === false)).toBe(true);
      };
      await assertOwner();
      stage = "restricted-source-replay";
      await restricted(); await sql(bootstrap); await assertOwner();
      expect((await sql("select 1 from pg_roles where rolname=any($1::text[])", [[migrator, owner]])).rows).toHaveLength(2);
      stage = "restricted-object-ownership";
      // UUID-schema CREATE is a transaction-only fixture prerequisite. It does
      // not qualify real public-schema source/recovery ownership privileges.
      await restricted(); await sql(`grant usage,create on schema ${schema} to ${owner}`);
      await restricted(); await sql(`create function ${schema}.${fn}() returns integer language sql security invoker set search_path='' as $$ select 1 $$`);
      await restricted(); await sql(`revoke all on function ${schema}.${fn}() from public`);
      await restricted(); await sql(`grant execute on function ${schema}.${fn}() to ${owner}`);
      await restricted(); await sql(`set local role ${owner}`);
      const { rows: [switched] } = await sql("select session_user::text session,current_user::text current,r.rolsuper,r.rolcanlogin,r.rolinherit,r.rolcreatedb,r.rolcreaterole,r.rolreplication,r.rolbypassrls from pg_roles r where r.rolname=current_user");
      expect(switched).toEqual({ session: migrator, current: owner, rolsuper: false, rolcanlogin: false, rolinherit: false,
        rolcreatedb: false, rolcreaterole: false, rolreplication: false, rolbypassrls: false });
      expect((await sql(`select ${schema}.${fn}() value`)).rows[0].value).toBe(1);
      await sql("reset role");
      await restricted(); await sql(`alter function ${schema}.${fn}() owner to ${owner}`);
      expect((await sql("select pg_get_userbyid(p.proowner) owner,p.prosecdef definer from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname=$1 and p.proname=$2", [schema, fn])).rows).toEqual([{ owner, definer: false }]);
      stage = "unsafe-retained-attributes";
      await expectedFailure("unsafe_attributes", async () => {
        await restricted(); await sql(`alter role ${owner} inherit`); // only owned role, still NOLOGIN
        await restricted(); await sql(bootstrap);
      }, "P0001", `${owner} is not hardened`);
      await assertOwner();
      stage = "unsafe-retained-membership";
      await expectedFailure("unsafe_membership", async () => {
        await sql("reset session authorization"); await sql("reset role"); await originalIdentity();
        // Setup affects only the two owned roles. Remove forward grants and
        // their dependent self-grants before adding the inverse: no engine-cycle
        // refusal can stand in for the exact source guard's exception.
        await sql(`revoke ${owner} from ${migrator} cascade`);
        await sql(`grant ${migrator} to ${owner} with admin false`);
        await sql(`set local session authorization ${migrator}`);
        await restricted(); await sql(bootstrap);
      }, "P0001", `${owner} has unexpected membership`);
      await restricted(); await assertOwner();
    } catch (error) { failures.push(redacted(error, `PG17 owner proof failed at ${stage}; details redacted`)); }
    cleaning = true;
    // FULL rollback comes first even after an unexpected aborted transaction.
    // Reset inside an aborted transaction would fail and cannot qualify cleanup.
    for (const result of await Promise.allSettled([...pending])) if (result.status === "rejected") failures.push(new Error("Pending PG17 proof query failed"));
    if (connected && client) {
      let rolledBack = false;
      try { await sql("rollback"); rolledBack = true; } catch { failures.push(new Error("PG17 proof full rollback failed")); }
      if (rolledBack) {
        try { await sql("reset session authorization"); } catch { failures.push(new Error("PG17 proof session identity reset failed")); }
        try { await sql("reset role"); } catch { failures.push(new Error("PG17 proof role reset failed")); }
        try { await originalIdentity(); } catch { failures.push(new Error("PG17 proof original identity unverified")); }
        try { await absent(client); } catch (error) { failures.push(redacted(error, "PG17 proof same-connection absence unverified")); }
      }
    }
    if (client) try { await client.end(); } catch { failures.push(new Error("PG17 proof direct connection close failed")); }
    if (transportFailed) failures.push(new Error("PG17 proof direct connection transport failed"));
    // Fresh connection independently observes committed catalogs; no unverified
    // connection is ever pooled or left with a modified session authorization.
    if (connected) {
      let fresh: ReturnType<typeof createCalendarFeedDatabaseClient> | undefined;
      let freshTransportFailed = false;
      try {
        fresh = directClient(true); fresh.on("error", () => { freshTransportFailed = true; });
        await fresh.connect(); await setupQualified(fresh); await absent(fresh);
      } catch (error) { failures.push(redacted(error, "PG17 proof fresh read-only absence unverified")); }
      if (fresh) try { await fresh.end(); } catch { failures.push(new Error("PG17 proof fresh connection close failed")); }
      if (freshTransportFailed) failures.push(new Error("PG17 proof fresh connection transport failed"));
    }
    if (failures.length) throw new AggregateError(failures, "PG17 owner proof/cleanup failed; sensitive details redacted");
    await context.annotate(JSON.stringify({ ...nativeVersion, restrictedFreshReplay: true, engineAdmin: true, engineSet: false,
      restrictedSetAndOwnership: true, unsafeAttributeAndMembershipGuards: true, sameAndFreshAbsent: true }), "calendar-feed-pg17-qualified");
  }, 180_000);
});


## Full committed source: scripts/ci/with-calendar-feed-runtime.mjs

/** Disposable GitHub-hosted CI only. This is not local resource-launch authority. */
import { spawn, execFile } from "node:child_process";
import { promisify, stripVTControlCharacters } from "node:util";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import { readdir, stat, realpath, mkdtemp, appendFile, writeFile, readFile, readlink, mkdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, join } from "node:path";
import { fileURLToPath } from "node:url";
import { createServer, isIP } from "node:net";
import pg from "pg";

export const INTEGRATION_ARGS = Object.freeze(["run", "test:int", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/full-integration.json"]);
export const BROWSER_ARGS = Object.freeze(["run", "test:smoke"]);
export const CAUSE_PROOF_ARGS = Object.freeze(["exec", "vitest", "run", "tests/integration/commands/calendar-feed.int.test.ts", "--maxWorkers=1", "--no-file-parallelism", "--testNamePattern=^15[.]5-DIAG001$", "--reporter=default", "--reporter=github-actions", "--reporter=json", "--outputFile=test-results/calendar-feed-cause-proof/native.json"]);
export const CAUSE_PROOF_OUTCOMES = Object.freeze(["PRE_SQL_STOP", "AMBIGUOUS_SQL42501", "NONREPRODUCED", "UNKNOWN_ENGINE_ERROR", "INCOMPARABLE", "CLEANUP_UNVERIFIED", "ORDINARY_SUCCESS", "CAPTURE_UNAVAILABLE"]);
const CAUSE_DIRECTORY = "test-results/calendar-feed-cause-proof";
const TRACE_EVENTS = new Set(["input-invalid", "execute-enter", "key-ready", "status-enter", "status-rpc42501", "status-rpc-error", "status-schema-invalid", "status-valid", "proof-enter", "manage-enter", "manage-rpc42501", "manage-rpcCF409", "manage-rpc-error", "manage-schema-invalid", "manage-valid", "envelope-success", "envelope-UNAUTHENTICATED", "envelope-TENANT_MEMBERSHIP_REQUIRED", "envelope-PERMISSION_DENIED", "envelope-VALIDATION_FAILED", "envelope-TENANT_ACCESS_DENIED", "envelope-COMMAND_CONFLICT", "envelope-SERVER_ERROR", "envelope-other", "context-match", "context-mismatch", "membership-match", "membership-mismatch", "truncated"]);

/** Validate parsed wire data without inspecting native error text or payloads. */
export function validateCauseProofObservation(value) {
  try {
    const descriptors = Object.getOwnPropertyDescriptors(value);
    const clean = Object.create(null);
    for (const [key, descriptor] of Object.entries(descriptors)) {
      if (!("value" in descriptor)) fail("diagnostic-observation-refused");
      clean[key] = descriptor.value;
    }
    for (const name of ["events", "failures"]) {
      if (!Array.isArray(clean[name]) || clean[name].length > 32) fail("diagnostic-observation-refused");
      const array = clean[name], copy = [];
      for (let i = 0; i < array.length; i++) {
        const descriptor = Object.getOwnPropertyDescriptor(array, String(i));
        if (!descriptor || !("value" in descriptor)) fail("diagnostic-observation-refused");
        copy.push(descriptor.value);
      }
      clean[name] = copy;
    }
    value = clean;
  } catch { fail("diagnostic-observation-refused"); }
  const keys = ["kind", "mode", "outcome", "events", "baseline", "sqlState", "cleanupVerified", "ordinarySettled", "queriesSettled", "failures"];
  if (!value || typeof value !== "object" || Object.keys(value).length !== keys.length || !keys.every(key => Object.hasOwn(value, key))
    || value.kind !== "calendar_feed.cause_proof" || value.mode !== "cause-proof" || !CAUSE_PROOF_OUTCOMES.includes(value.outcome)
    || !Array.isArray(value.events) || value.events.length > 16 || !value.events.every(event => typeof event === "string" && TRACE_EVENTS.has(event))
    || !["not-selected", "status", "manage"].includes(value.baseline) || !(value.sqlState === null || SQLSTATE_CATEGORIES.has(value.sqlState) || value.sqlState === "CF409")
    || !Array.isArray(value.failures) || value.failures.length > 32 || !value.failures.every(code => ["protocol-unsettled", "baseline-qualification-or-call", "baseline-rollback", "baseline-reset", "baseline-state", "baseline-close", "fresh-state", "fresh-qualification-or-state", "fresh-protocol", "fresh-close", "fixture-or-ordinary", "fixture-rows", "fixture-canonical", "fixture-absence", "fixture-custody-retained"].includes(code))
    || !["cleanupVerified", "ordinarySettled", "queriesSettled"].every(key => typeof value[key] === "boolean")) fail("diagnostic-observation-refused");
  if (!value.cleanupVerified || !value.ordinarySettled || !value.queriesSettled || value.outcome === "CLEANUP_UNVERIFIED") fail("diagnostic-settlement-unverified");
  return value;
}
export async function finishCauseProof(cwd, env, receipt, observe, privacy) {
  const folder = join(cwd, CAUSE_DIRECTORY), entries = [];
  const upload = join(folder, "upload"); await mkdir(upload, { recursive: true });
  let captureFailed = observe.privacyFailed?.() === true;
  for (const name of ["native.json", "observation.json"]) {
    try {
      const bytes = await readFile(join(folder, name));
      if (bytes.length > 1_000_000) fail("diagnostic-report-refused");
      const data = JSON.parse(bytes.toString("utf8"));
      if (hasSensitiveOutput(bytes.toString("utf8"), privacy)) fail("diagnostic-report-privacy-refused");
      if (name === "native.json") {
        if (data.numTotalTests !== 1 || data.numPendingTests !== 0 || !Number.isSafeInteger(data.numFailedTests) || !Number.isSafeInteger(data.numPassedTests)
          || data.numFailedTests < 0 || data.numPassedTests < 0 || data.numPassedTests + data.numFailedTests !== 1) fail("diagnostic-report-refused");
        await observe(bytes.toString("utf8"));
      } else validateCauseProofObservation(data);
      entries.push({ name, available: true, bytes: bytes.length, sha256: createHash("sha256").update(bytes).digest("hex") });
      // Only validated copies are uploaded. A refused original is never deleted,
      // printed, or accidentally swept into the diagnostic artifact directory.
      await writeFile(join(upload, name), bytes, { mode: 0o600 });
    } catch { entries.push({ name, available: false }); if (receipt.childExitCodes.length) captureFailed = true; }
  }
  const safe = { kind: "calendar_feed.diagnostic_receipt", mode: "cause-proof", evidenceClass: "diagnostic-only", acceptanceCredit: 0,
    sourceSha: env.GITHUB_SHA, checkpointId: env.CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT, runId: env.GITHUB_RUN_ID,
    attempt: 1, job: env.GITHUB_JOB, childStarted: receipt.childExitCodes.length > 0,
    reports: entries.map(({ name, available }) => ({ name, available })),
    cleanupVerified: receipt.keyDeleted && receipt.dbClosed && receipt.custody === null,
    custodyRetained: receipt.custody !== null, failures: [...receipt.failures], captureFailed };
  await writeFile(join(upload, "receipt.json"), JSON.stringify(safe) + "\n", { mode: 0o600 });
  await writeFile(join(upload, "manifest.json"), JSON.stringify({ ...safe, reports: entries }) + "\n", { mode: 0o600 });
  return !captureFailed;
}
export const FEED_FUNCTIONS = Object.freeze([
  "public.fetch_calendar_feed(text,text,jsonb,text)",
  "public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)",
  "public.read_calendar_feed_status(uuid,uuid)", "public.read_calendar_feed_abuse(uuid)",
]);
const ROOT = resolve(fileURLToPath(new URL("../..", import.meta.url)));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
class RuntimeFailure extends Error {}
const fail = (code) => { throw new RuntimeFailure(code); };
const DIAGNOSTIC_STAGES = new Set(["admission", "qualification", "port-check", "database-client", "database-connect", "setup-authority", "privacy-preflight", "migration-ledger", "feed-functions",
  "key-id", "entropy", "telemetry", "transaction-begin", "key-collision", "key-create", "transaction-commit", "runtime",
  "child-cleanup", "transaction-rollback", "key-cleanup", "database-close"]);
const SQLSTATE_CATEGORIES = new Map([
  ["42501", "insufficient-privilege"], ["42P01", "undefined-table"], ["42883", "undefined-function"],
  ["42703", "undefined-column"], ["3F000", "invalid-schema"], ["23505", "unique-conflict"],
  ["57014", "query-canceled"], ["25P02", "transaction-aborted"], ["08006", "connection-failure"],
]);
const PROCESS_PHASES = new Set(["capture-invalid", "identity-read-failed", "leader-mismatch", "leader-missing-group-live"]);
function safeDiagnostic(stage, error) {
  // Inspect only an own data descriptor, never native text, getters or causes.
  let code;
  try { code = Object.getOwnPropertyDescriptor(error, "code")?.value; } catch { /* Unclassified, with no native details. */ }
  const known = typeof code === "string" && SQLSTATE_CATEGORIES.has(code);
  const processPhase = error instanceof RuntimeFailure ? Object.getOwnPropertyDescriptor(error, "processPhase")?.value : undefined;
  return { stage: DIAGNOSTIC_STAGES.has(stage) ? stage : "runtime",
    category: known ? SQLSTATE_CATEGORIES.get(code) ?? "unclassified" : error instanceof RuntimeFailure ? "guard-refusal" : "unclassified",
    sqlState: known ? code : null, ...(PROCESS_PHASES.has(processPhase) ? { processPhase } : {}) };
}
const delay = (ms) => new Promise(resolveDelay => setTimeout(resolveDelay, ms));

const PRIVACY_CONTROLS = new Map([
  ["log_statement", "superuser"], ["log_min_error_statement", "superuser"],
  ["log_parameter_max_length", "superuser"], ["log_parameter_max_length_on_error", "user"],
]);
const PRINCIPAL_FACTS = ["session_is_postgres", "current_is_postgres", "same_identity", "session_superuser", "current_superuser", "session_bypass_rls", "current_bypass_rls"];
const PRIVACY_PREFLIGHT_SQL = `with required(name,value) as (values
  ('log_statement','none'),('log_min_error_statement','panic'),
  ('log_parameter_max_length','0'),('log_parameter_max_length_on_error','0'))
select s.name,s.context,current_setting(s.name)=r.value as matches_required,
  has_parameter_privilege(current_user,s.name,'SET') as can_set,
  session_user='postgres' as session_is_postgres,current_user='postgres' as current_is_postgres,
  session_user=current_user as same_identity,
  a.rolsuper as session_superuser,b.rolsuper as current_superuser,
  a.rolbypassrls as session_bypass_rls,b.rolbypassrls as current_bypass_rls
from required r join pg_settings s on s.name=r.name
join pg_roles a on a.rolname=session_user join pg_roles b on b.rolname=current_user
order by s.name`;

/**
 * No native setting values or role names leave this fixed read-only query.
 * @returns {Promise<{controls:{name:string,context:string,matchesRequired:boolean,canSet:boolean}[],principal:Record<string,boolean>}>}
 */
export async function readCalendarFeedPrivacyPreflight(db) {
  const { rows } = await db.query(PRIVACY_PREFLIGHT_SQL);
  const keys = ["name", "context", "matches_required", "can_set", ...PRINCIPAL_FACTS];
  const seen = new Set();
  if (!Array.isArray(rows) || rows.length !== PRIVACY_CONTROLS.size) fail("privacy-preflight-refused");
  for (const row of rows) {
    if (!row || Object.keys(row).length !== keys.length || !keys.every(key => Object.hasOwn(row, key))
      || typeof row.name !== "string" || !PRIVACY_CONTROLS.has(row.name) || seen.has(row.name)
      || row.context !== PRIVACY_CONTROLS.get(row.name)
      || !["matches_required", "can_set", ...PRINCIPAL_FACTS].every(key => typeof row[key] === "boolean")) fail("privacy-preflight-refused");
    seen.add(row.name);
  }
  // Identity/SET authority is observed only: effective privacy, not an inferred
  // superuser or permission grant, is the continuation condition.
  const principal = Object.fromEntries(PRINCIPAL_FACTS.map(key => [key, rows[0][key]]));
  if (rows.some(row => PRINCIPAL_FACTS.some(key => row[key] !== principal[key]))) fail("privacy-preflight-refused");
  return { controls: rows.map(row => ({ name: row.name, context: row.context, matchesRequired: row.matches_required, canSet: row.can_set })), principal };
}

/** Actual authenticated setup authority; never substitute SET ROLE or BYPASSRLS. */
export async function readCalendarFeedSetupAuthority(db) {
  const { rows } = await db.query(`select session_user='supabase_admin' as session_is_setup_admin,
    current_user='supabase_admin' as current_is_setup_admin,session_user=current_user as same_identity,
    a.rolcanlogin as session_login,b.rolcanlogin as current_login,
    a.rolsuper as session_superuser,b.rolsuper as current_superuser
    from pg_roles a join pg_roles b on b.rolname=current_user where a.rolname=session_user`);
  const keys = ["session_is_setup_admin", "current_is_setup_admin", "same_identity", "session_login", "current_login", "session_superuser", "current_superuser"];
  if (!Array.isArray(rows) || rows.length !== 1 || !rows[0] || Object.keys(rows[0]).length !== keys.length
    || !keys.every(key => Object.hasOwn(rows[0], key) && rows[0][key] === true)) fail("setup-authority-refused");
  return Object.fromEntries(keys.map(key => [key, true]));
}

/** Fixed setup call sites only; this is not a process sandbox or a pool. */
export function createCalendarFeedDatabaseClient(stack, purpose = "runtime") {
  validateStackIdentity(stack);
  if (!["runtime", "proof", "absence"].includes(purpose)) fail("setup-purpose-refused");
  const entries = stack.db.Config.Env;
  if (!Array.isArray(entries) || !entries.every(value => typeof value === "string")) fail("setup-credential-refused");
  const candidates = entries.filter(value => value.startsWith("POSTGRES_PASSWORD="));
  if (candidates.length !== 1) fail("setup-credential-refused");
  const password = candidates[0].slice("POSTGRES_PASSWORD=".length);
  if (!password || password.includes("\0")) fail("setup-credential-refused");
  const proof = purpose !== "runtime";
  return new pg.Client({ host: "127.0.0.1", port: 54322, database: "postgres", user: "supabase_admin", password, ssl: false,
    connectionTimeoutMillis: 5_000, query_timeout: proof ? 7_000 : 10_000, statement_timeout: proof ? 5_000 : 8_000,
    ...(proof ? { lock_timeout: 2_000 } : {}),
    options: "-c log_statement=none -c log_min_error_statement=panic -c log_parameter_max_length=0 -c log_parameter_max_length_on_error=0"
      + (purpose === "absence" ? " -c default_transaction_read_only=on" : "") });
}

/** Pure prerequisite validation: CI flags alone do not qualify a machine. */
export function validateAdmission(mode, env, platform) {
  if (!["db", "browser", "cause-proof"].includes(mode)) fail("mode-refused");
  if (platform !== "linux" || env.CI !== "true" || env.GITHUB_ACTIONS !== "true" || env.RUNNER_ENVIRONMENT !== "github-hosted"
    || !/^\d+$/.test(env.GITHUB_RUN_ID ?? "") || !/^\d+$/.test(env.GITHUB_RUN_ATTEMPT ?? "")
    || !/^[a-zA-Z0-9_-]+$/.test(env.GITHUB_JOB ?? "")
    || env.CALENDAR_FEED_CI_DISPOSABLE_STACK !== `${env.GITHUB_RUN_ID}:${env.GITHUB_RUN_ATTEMPT}:${env.GITHUB_JOB}`
    || env.VERCEL || env.VERCEL_ENV || env.CALENDAR_FEED_VERIFIED_VERCEL_IP) fail("ci-admission-refused");
  for (const [key, expected] of [["SUPABASE_TEST_URL", "http://127.0.0.1:54321"], ["SUPABASE_TEST_DB_URL", "postgresql://postgres:postgres@127.0.0.1:54322/postgres"],
    ["NEXT_PUBLIC_SUPABASE_URL", "http://127.0.0.1:54321"]]) {
    if (env[key] && env[key] !== expected) fail("endpoint-refused");
  }
  if (env.E2E_PORT && env.E2E_PORT !== "3100") fail("port-refused");
  if (mode === "cause-proof" && (env.GITHUB_RUN_ATTEMPT !== "1" || !/^[a-f0-9]{40}$/.test(env.GITHUB_SHA ?? "")
    || !UUID.test(env.CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT ?? "") || env.GITHUB_EVENT_NAME !== "workflow_dispatch")) fail("diagnostic-admission-refused");
}

/** Match the actual Docker publication and job-created project identity, not just loopback. */
export function validateStackIdentity({ db, gateway, checkoutTime, now, status }) {
  if (!Number.isFinite(checkoutTime) || checkoutTime <= 0 || checkoutTime > now) fail("checkout-identity-refused");
  for (const [container, name] of [[db, "/supabase_db_kopplas"], [gateway, "/supabase_kong_kopplas"]]) {
    const created = Date.parse(container?.Created);
    if (!/^[0-9a-f]{64}$/.test(container?.Id ?? "") || container.Name !== name || container.State?.Running !== true
      || container.Config?.Labels?.["com.supabase.cli.project"] !== "kopplas"
      || !Number.isFinite(created) || created < checkoutTime || created > now) fail("stack-identity-refused");
  }
  const networkIds = container => Object.values(container.NetworkSettings?.Networks ?? {}).map(network => network.NetworkID);
  if (!networkIds(db).some(id => /^[0-9a-f]{64}$/.test(id ?? "") && networkIds(gateway).includes(id))) fail("stack-network-refused");
  for (const [container, internal, external] of [[db, "5432/tcp", "54322"], [gateway, "8000/tcp", "54321"]]) {
    const bindings = container.NetworkSettings?.Ports?.[internal];
    if (!Array.isArray(bindings) || !bindings.some(binding => binding.HostPort === external && ["127.0.0.1", "0.0.0.0"].includes(binding.HostIp))
      || bindings.some(binding => binding.HostPort !== external)) fail("stack-port-refused");
  }
  if (status?.API_URL !== "http://127.0.0.1:54321" || status?.DB_URL !== "postgresql://postgres:postgres@127.0.0.1:54322/postgres"
    || !status.ANON_KEY || !status.SERVICE_ROLE_KEY) fail("stack-status-refused");
  for (const [key, role] of [[status.ANON_KEY, "anon"], [status.SERVICE_ROLE_KEY, "service_role"]]) {
    let claims;
    try { claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")); } catch { fail("stack-key-refused"); }
    if (claims.iss !== "supabase-demo" || claims.role !== role) fail("stack-key-refused");
  }
}

/** Recognize only the exact non-request Next startup address formats. */
function isSafeInfrastructureAddress(line) {
  return /^\s*(?:\[WebServer\]\s*)?- (?:Local|Network):\s+http:\/\/127\.0\.0\.1:(?:3100|3195)\s*$/.test(stripVTControlCharacters(line));
}

/** Inspect raw output in memory before dropping it; never return its contents. */
export function hasSensitiveOutput(line, { keyId, secret, knownValues = /** @type {string[]} */ ([]) }) {
  if ([keyId, secret, ...knownValues].some(value => value && line.includes(value))) return true;
  if (/\/calendar\/feed\/[A-Za-z0-9_%=-]+|x-vercel-forwarded-for|["']?(?:proof|signature|tokenHash|ipHash)["']?\s*[:=]/i.test(line)) return true;
  if (/(?<![a-f0-9])[a-f0-9]{64}(?![a-f0-9])/i.test(line)) return true;
  // A capability or base64-encoded SHA256 proof has exactly 32 canonical bytes.
  for (const match of line.matchAll(/(?<![A-Za-z0-9+/_-])[A-Za-z0-9+/_-]{43}=?(?![A-Za-z0-9+/_=-])/g)) {
    const raw = match[0];
    const bytes = Buffer.from(raw, "base64url");
    if (bytes.length === 32 && [bytes.toString("base64url"), bytes.toString("base64")].includes(raw)) return true;
  }
  if (isSafeInfrastructureAddress(line)) return false;
  for (const match of line.matchAll(/(?<![\d.])(?:\d{1,3}\.){3}\d{1,3}(?![\d.])/g)) if (isIP(match[0]) === 4) return true;
  for (const match of line.matchAll(/(?<![a-f0-9:])(?:[a-f0-9]{0,4}:){2,}[a-f0-9:.]*(?:%[a-z0-9_.-]+)?/gi)) if (isIP(match[0]) === 6) return true;
  return false;
}

/** Never return/persist raw lines. Detection runs before filtering. */
export function createTelemetryObserver({ keyId, secret, persist, knownValues = /** @type {string[]} */ ([]) }) {
  let responseCount = 0, sensitiveOutputCount = 0;
  const observation = () => persist(JSON.stringify({ event: "calendar_feed.runtime_observation", responseCount, sensitiveOutputCount, sensitiveOutputDetected: sensitiveOutputCount !== 0 }) + "\n");
  const observe = async (line) => {
    let record;
    try { record = JSON.parse(line); } catch { /* Unstructured output is still inspected below. */ }
    const validResponse = record !== null && typeof record === "object" && !Array.isArray(record)
      && Object.keys(record).sort().join(",") === "event,status" && record.event === "calendar_feed.response" && [200, 404, 429, 503].includes(record.status);
    const unexpectedResponse = record?.event === "calendar_feed.response" && !validResponse;
    if (hasSensitiveOutput(line, { keyId, secret, knownValues }) || unexpectedResponse) {
      sensitiveOutputCount++;
      await observation();
    }
    if (!validResponse) return;
    responseCount++;
    await persist(JSON.stringify({ event: record.event, status: record.status }) + "\n");
    await observation();
  };
  return Object.assign(observe, { privacyFailed: () => sensitiveOutputCount !== 0 });
}

/** Occupied listeners are refused; an existing app is never adopted or stopped. */
async function assertPortFree(port) {
  await new Promise((accept, reject) => {
    const server = createServer();
    server.once("error", () => reject(new RuntimeFailure("port-occupied")));
    server.listen({ host: "127.0.0.1", port, exclusive: true }, () => server.close(error => error ? reject(new RuntimeFailure("port-probe-failed")) : accept()));
  });
}

/** Linux socket inode proof binds readiness to this captured Next PID. */
export function ownsListenerRecord(port, socketLinks, tcpTable) {
  const localAddress = `0100007F:${port.toString(16).toUpperCase().padStart(4, "0")}`;
  const inodes = new Set(socketLinks.map(link => /^socket:\[(\d+)\]$/.exec(link)?.[1]).filter(Boolean));
  return tcpTable.split("\n").slice(1).some(line => {
    const fields = line.trim().split(/\s+/);
    return fields[1] === localAddress && fields[3] === "0A" && inodes.has(fields[9]);
  });
}

/** Inject the clock and HTTP transport to test readiness without real listeners. */
export async function waitForOwnedHttp({ url, child, signal, now = Date.now, sleep = delay, request = fetch }) {
  const deadline = now() + 60_000;
  let exited = false; child.done.then(() => { exited = true; });
  while (now() < deadline && !signal.aborted && !exited) {
    try {
      if (!await child.ownsListener(3195)) { await sleep(250); continue; }
      const response = await request(`${url}/login`, { redirect: "manual", signal: AbortSignal.timeout(2_000) });
      await response.body?.cancel();
      if (response.status === 200 && !exited && await child.ownsListener(3195)) return;
    } catch { /* No raw request/error output. */ }
    await sleep(250);
  }
  fail("readiness-failed");
}

/** Bound a pending operation; the underlying pg/socket has its own matching timeout. */
async function bounded(promise, ms, code, signal) {
  let timer, onAbort;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new RuntimeFailure(code)), ms);
      onAbort = () => reject(new RuntimeFailure("interrupted"));
      if (signal?.aborted) onAbort(); else signal?.addEventListener("abort", onAbort, { once: true });
    })]);
  } finally { clearTimeout(timer); signal?.removeEventListener("abort", onAbort); }
}

async function processIdentity(pid) {
  if (!pid) return null;
  try {
    const raw = await readFile(`/proc/${pid}/stat`, "utf8");
    const tail = raw.slice(raw.lastIndexOf(")") + 2).trim().split(/\s+/);
    if (!/^\d+$/.test(tail[19] ?? "")) fail("child-identity-unverified");
    return { pid, group: Number(tail[2]), startTime: tail[19] };
  } catch (error) { if (error.code === "ENOENT") return null; fail("child-identity-unverified"); }
}

/** One settlement promise owns all signals. A numeric group alone grants nothing. */
export function createOwnedGroupStopper({ pid, done, capturedIdentity, readIdentity, groupExists, signalGroup, settleOutput, now = Date.now, sleep = delay }) {
  let settlement, absent = false, leaderMissing = false;
  const identityFailure = phase => { throw Object.assign(new RuntimeFailure("child-identity-unverified"), { processPhase: phase }); };
  // Once actual absence is observed, later numeric reuse is outside our custody.
  const exists = () => {
    if (absent) return false;
    if (!groupExists()) absent = true;
    return !absent;
  };
  const readWithin = async (read, deadline) => {
    try {
      const identity = await bounded(Promise.resolve().then(read), Math.max(0, deadline - now()), "child-identity-unverified");
      if (now() >= deadline) identityFailure("identity-read-failed");
      return identity;
    }
    catch { identityFailure("identity-read-failed"); }
  };
  const stage = async (signal, deadline, original) => {
    if (!exists()) return false;
    if (!leaderMissing) {
      const current = await readWithin(() => readIdentity(pid), deadline);
      if (current === null) leaderMissing = true;
      else if (!current || current.pid !== pid || current.group !== pid || original.startTime !== current.startTime) identityFailure("leader-mismatch");
      else signalGroup(signal); // Never signal an anonymous descendant group.
    }
    while (exists() && now() < deadline) await sleep(Math.min(50, deadline - now()));
    return !leaderMissing;
  };
  return () => {
    settlement ??= (async () => {
      let forced = false;
      const firstDeadline = now() + 15_000;
      const original = await readWithin(() => capturedIdentity, firstDeadline);
      if (!Number.isSafeInteger(pid) || pid <= 0 || !original || original.pid !== pid || original.group !== pid
        || typeof original.startTime !== "string" || !/^\d+$/.test(original.startTime)) identityFailure("capture-invalid");
      if (exists()) {
        // Installed Playwright handles SIGINT by awaiting task teardown. Any
        // signal requires the same captured Linux process start time. A leader
        // that exited during inspection gets only passive absence observation,
        // sharing these existing stage budgets with the signaling path.
        await stage("SIGINT", firstDeadline, original);
        if (exists()) forced = await stage("SIGTERM", now() + 5_000, original);
        if (exists()) await stage("SIGKILL", now() + 5_000, original);
        if (exists()) {
          if (leaderMissing) identityFailure("leader-missing-group-live");
          fail("child-custody-unverified");
        }
      }
      const result = await bounded(done, 5_000, "child-settle-unverified");
      await bounded(Promise.resolve().then(settleOutput), 5_000, "child-output-unverified");
      return { forced, signal: result.signal };
    })();
    return settlement;
  };
}

function launchOwned(command, args, env, cwd, observe) {
  const child = spawn(command, args, { cwd, env, detached: true, shell: false, stdio: ["ignore", "pipe", "pipe"] });
  const capturedIdentity = processIdentity(child.pid);
  capturedIdentity.catch(() => undefined); // The settlement path preserves failure.
  // Register listeners immediately; neither spawn errors nor output escape to raw logs.
  let output = Promise.resolve();
  for (const stream of [child.stdout, child.stderr]) {
    let pending = "";
    stream?.setEncoding("utf8");
    stream?.on("data", chunk => {
      pending += chunk;
      const lines = pending.split(/\r?\n/); pending = lines.pop() ?? "";
      if (pending.length > 16_384) { lines.push(pending); pending = ""; }
      for (const line of lines) output = output.then(() => observe(line));
      // Attach a rejection observer now; the error still propagates through settleOutput.
      output.catch(() => undefined);
    });
    stream?.on("end", () => { if (pending) { output = output.then(() => observe(pending)); output.catch(() => undefined); } });
  }
  const done = new Promise(resolveDone => {
    child.once("error", () => resolveDone({ code: null, signal: null }));
    child.once("close", (code, signal) => resolveDone({ code, signal }));
  });
  const groupExists = () => {
    if (!child.pid) return false;
    try { process.kill(-child.pid, 0); return true; } catch (error) { if (error.code === "ESRCH") return false; throw new RuntimeFailure("child-custody-unverified"); }
  };
  const stop = createOwnedGroupStopper({ pid: child.pid, done, capturedIdentity, readIdentity: processIdentity, groupExists,
    signalGroup: signal => {
      try { process.kill(-child.pid, signal); } catch (error) { if (error.code !== "ESRCH") fail("child-signal-unverified"); }
    }, settleOutput: () => output });
  return {
    done,
    async ownsListener(port) {
      if (!child.pid) return false;
      try {
        const fdDirectory = `/proc/${child.pid}/fd`;
        const links = await Promise.all((await readdir(fdDirectory)).map(async fd => { try { return await readlink(`${fdDirectory}/${fd}`); } catch { return ""; } }));
        return ownsListenerRecord(port, links, await readFile("/proc/net/tcp", "utf8"));
      } catch { return false; }
    },
    stop,
  };
}

function defaultDependencies(env, cwd) {
  const exec = promisify(execFile);
  const capture = async (command, args) => {
    try { return (await exec(command, args, { cwd, env, timeout: 15_000, maxBuffer: 2_000_000 })).stdout; }
    catch { fail("qualification-command-failed"); }
  };
  return {
    now: Date.now, sleep: delay, uuid: randomUUID, entropy: randomBytes,
    registerSignal(handler) { process.on("SIGINT", handler); process.on("SIGTERM", handler); return () => { process.off("SIGINT", handler); process.off("SIGTERM", handler); }; },
    async qualify() {
      if (await realpath(cwd) !== await realpath(env.GITHUB_WORKSPACE ?? "")) fail("checkout-path-refused");
      const gitPath = join(cwd, ".git");
      if (!(await stat(gitPath)).isDirectory()) fail("checkout-identity-refused");
      const checkoutTime = (await stat(gitPath)).birthtimeMs;
      const containers = JSON.parse(await capture("docker", ["inspect", "supabase_db_kopplas", "supabase_kong_kopplas"]));
      const status = JSON.parse(await capture("supabase", ["status", "--output", "json"]));
      const stack = { db: containers[0], gateway: containers[1], checkoutTime, now: Date.now(), status };
      validateStackIdentity(stack);
      const entries = await readdir(join(cwd, "supabase", "migrations"));
      const migrations = entries.filter(name => /^\d{14}_.+\.sql$/.test(name)).sort().map(name => ({ version: name.slice(0, 14), name: name.slice(15, -4) }));
      if (!migrations.some(row => row.name === "personal_calendar_feed") || new Set(migrations.map(row => row.version)).size !== migrations.length) fail("migration-source-refused");
      return { status, migrations, stack };
    },
    portFree: assertPortFree,
    async prepareDiagnostic() {
      const folder = join(cwd, CAUSE_DIRECTORY);
      await mkdir(folder, { recursive: true });
      if ((await readdir(folder)).length) fail("diagnostic-output-not-fresh");
    },
    finishDiagnostic: (receipt, observe, privacy) => finishCauseProof(cwd, env, receipt, observe, privacy),
    async readDiagnostic() { return validateCauseProofObservation(JSON.parse(await readFile(join(cwd, CAUSE_DIRECTORY, "observation.json"), "utf8"))); },
    connect: createCalendarFeedDatabaseClient,
    async createTelemetry() { const folder = await mkdtemp(join(tmpdir(), "kopplas-feed-ci-")); const path = join(folder, "responses.jsonl"); await writeFile(path, "", { mode: 0o600 }); return { path, persist: line => appendFile(path, line, { mode: 0o600 }) }; },
    launch: (command, args, childEnv, observe) => launchOwned(command, args, childEnv, cwd, observe),
    ready: (url, child, signal) => waitForOwnedHttp({ url, child, signal }),
  };
}

/** Test-only dedicated qualification. No credential export to child environments. */
export async function qualifyCalendarFeedCauseProof(env = process.env) {
  validateAdmission("cause-proof", env, process.platform);
  return defaultDependencies(env, ROOT).qualify();
}

/**
 * Injected seams permit lifecycle tests without any process/DB/resource launch.
 * @param {{mode?: string, env?: NodeJS.ProcessEnv, platform?: NodeJS.Platform, cwd?: string}} options
 * @param {object} injected
 */
export async function runCalendarFeedRuntime({ mode, env = process.env, platform = process.platform, cwd = ROOT } = {}, injected = {}) {
  const receipt = { event: "calendar_feed.ci_lifecycle", mode: ["db", "browser", "cause-proof"].includes(mode) ? mode : "refused", ready: false,
    childExitCodes: /** @type {(number|null)[]} */ ([]), keyDeleted: false, dbClosed: false,
    failures: /** @type {string[]} */ ([]),
    diagnostics: /** @type {{stage:string, category:string, sqlState:string|null}[]} */ ([]),
    setupAuthority: /** @type {null | Record<string,boolean>} */ (null),
    privacyPreflight: /** @type {null | {controls:{name:string,context:string,matchesRequired:boolean,canSet:boolean}[],principal:Record<string,boolean>}} */ (null),
    keyOutcome: /** @type {"not-attempted" | "rollback-confirmed" | "deleted-confirmed" | "unverified"} */ ("not-attempted"),
    custody: /** @type {null | {owner:string, job:string|undefined, vaultUuid:string|null, ownedName:string|null, expiry:string, nextAction:string, resumeCondition:string}} */ (null) };
  const children = new Set();
  let db, keyUuid, ownedName, transactionOpen = false, createUncertain = false, browserTeardownUnverified = false, diagnosticUnverified = false;
  let diagnosticPrepared = false, diagnosticObserve = async () => {}, diagnosticPrivacy = { keyId: "", secret: "" };
  let stage = "admission", createAttempted = false, commitAttempted = false, rollbackConfirmed = false;
  const abort = new AbortController();
  const deps = { ...defaultDependencies(env, cwd), ...injected };
  let unregister = () => undefined;
  const checkSignal = () => { if (abort.signal.aborted) fail("interrupted"); };
  const launch = (command, args, childEnv, observer) => { checkSignal(); const handle = deps.launch(command, [...args], childEnv, observer); children.add(handle); return handle; };
  const run = async (command, args, childEnv, observer, timeout) => {
    const handle = launch(command, args, childEnv, observer);
    let result;
    try { result = await bounded(handle.done, timeout, "child-timeout", abort.signal); }
    catch (error) { if (mode === "browser") browserTeardownUnverified = true; if (mode === "cause-proof") diagnosticUnverified = true; throw error; }
    receipt.childExitCodes.push(result.code);
    if (result.code !== 0 || result.signal) {
      // pnpm can map a killed nested Playwright runner to nonzero/null signal.
      // That is never independent proof of its detached server's teardown.
      if (mode === "browser") browserTeardownUnverified = true;
      if (mode === "cause-proof") diagnosticUnverified = true;
      fail("child-failed");
    }
    const stopped = await handle.stop();
    if (mode === "browser" && (stopped?.forced || stopped?.signal)) { browserTeardownUnverified = true; fail("browser-server-teardown-unverified"); }
    children.delete(handle); // Proven settlement cannot be signalled again later.
  };
  try {
    validateAdmission(mode, env, platform);
    unregister = deps.registerSignal(() => abort.abort()); // Before any resource mutation.
    stage = "qualification";
    const { status, migrations, stack } = await deps.qualify(); checkSignal();
    stage = "port-check";
    if (mode !== "cause-proof") await deps.portFree(mode === "db" ? 3195 : 3100); checkSignal();
    if (mode === "cause-proof") { await deps.prepareDiagnostic(); diagnosticPrepared = true; }
    stage = "database-client";
    db = deps.connect(stack);
    // Consume asynchronous connection errors without logging driver internals.
    db.on?.("error", () => abort.abort());
    stage = "database-connect";
    await db.connect(); checkSignal();
    stage = "setup-authority";
    receipt.setupAuthority = await readCalendarFeedSetupAuthority(db); checkSignal();
    stage = "privacy-preflight";
    receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);
    if (!receipt.privacyPreflight.controls.every(control => control.matchesRequired)) fail("privacy-preflight-refused");
    checkSignal();
    stage = "migration-ledger";
    const ledger = await db.query("select version,name from supabase_migrations.schema_migrations order by version");
    if (JSON.stringify(ledger.rows.map(row => ({ version: String(row.version), name: row.name }))) !== JSON.stringify(migrations)) fail("migration-ledger-refused");
    stage = "feed-functions";
    const functions = await db.query("select p.oid::regprocedure::text as identity, pg_get_userbyid(p.proowner) as owner, p.prosecdef as definer from pg_proc p where p.oid=any(array[" + FEED_FUNCTIONS.map((_, i) => `to_regprocedure($${i + 1})`).join(",") + "])", FEED_FUNCTIONS);
    if (functions.rows.length !== FEED_FUNCTIONS.length || functions.rows.some(row => row.owner !== "calendar_feed_owner" || row.definer !== true)) fail("feed-functions-refused");
    checkSignal();
    stage = "key-id";
    const keySuffix = deps.uuid();
    if (!UUID.test(keySuffix)) fail("key-id-refused");
    const keyId = `ci_${keySuffix}`;
    ownedName = `calendar_feed_attestation_${keyId}`;
    stage = "entropy";
    const secret = Buffer.from(deps.entropy(32)).toString("base64url");
    if (!/^[A-Za-z0-9_-]{43}$/.test(secret)) fail("entropy-refused");
    stage = "telemetry";
    const telemetry = await deps.createTelemetry();
    const observe = createTelemetryObserver({ keyId, secret, persist: telemetry.persist });
    diagnosticObserve = observe;
    diagnosticPrivacy = { keyId, secret };
    stage = "transaction-begin";
    await db.query("begin"); transactionOpen = true;
    stage = "key-collision";
    const collision = await db.query("select id from vault.secrets where name=$1", [ownedName]);
    if (collision.rows.length) fail("key-collision-refused");
    checkSignal();
    stage = "key-create";
    createUncertain = true; createAttempted = true;
    const created = await db.query("select vault.create_secret($1,$2,$3) as id", [secret, ownedName, "Disposable calendar feed CI verification"]);
    keyUuid = created.rows[0]?.id;
    if (!UUID.test(keyUuid ?? "")) { keyUuid = undefined; fail("key-create-unverified"); }
    checkSignal();
    stage = "transaction-commit";
    commitAttempted = true; // Irrevocable: a lost COMMIT response cannot be disproved by ROLLBACK.
    await db.query("commit"); transactionOpen = false; createUncertain = false;
    stage = "runtime";
    const childEnv = { ...env, SUPABASE_TEST_REQUIRED: "1", SUPABASE_TEST_URL: status.API_URL, SUPABASE_TEST_ANON_KEY: status.ANON_KEY,
      SUPABASE_TEST_SERVICE_ROLE_KEY: status.SERVICE_ROLE_KEY, SUPABASE_TEST_DB_URL: status.DB_URL,
      NEXT_PUBLIC_SUPABASE_URL: status.API_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY: status.ANON_KEY,
      NEXT_PUBLIC_APP_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}`, E2E_PORT: "3100",
      CALENDAR_FEED_ATTESTATION_KEY_ID: keyId, CALENDAR_FEED_ATTESTATION_SECRET: secret,
      CALENDAR_FEED_TEST_LOG_FILE: telemetry.path, CALENDAR_FEED_TEST_BASE_URL: `http://127.0.0.1:${mode === "db" ? 3195 : 3100}` };
    if (mode === "cause-proof") {
      childEnv.CALENDAR_FEED_CAUSE_PROOF_MODE = "1";
      await run("pnpm", CAUSE_PROOF_ARGS, childEnv, observe, 240_000);
      try { await deps.readDiagnostic(); } catch { diagnosticUnverified = true; fail("diagnostic-settlement-unverified"); }
    } else if (mode === "db") {
      await run(process.execPath, ["node_modules/next/dist/bin/next", "build"], childEnv, observe, 240_000);
      const server = launch(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", "3195"], childEnv, observe);
      await deps.ready(childEnv.CALENDAR_FEED_TEST_BASE_URL, server, abort.signal); receipt.ready = true;
      await run("pnpm", INTEGRATION_ARGS, childEnv, observe, 1_800_000);
    } else {
      await run("pnpm", BROWSER_ARGS, childEnv, observe, 1_800_000);
    }
    checkSignal();
  } catch (error) {
    // Only our fixed codes are emitted; never preserve native driver/request/assertion details.
    const code = error instanceof RuntimeFailure ? error.message : "runtime-failed";
    receipt.failures.push(code);
    receipt.diagnostics.push(safeDiagnostic(stage, error));
  } finally {
    for (const handle of [...children].reverse()) {
      try {
        const stopped = await handle.stop();
        if (mode === "browser" && (stopped?.forced || stopped?.signal)) browserTeardownUnverified = true;
        children.delete(handle);
      } catch (error) { receipt.failures.push("owned-child-cleanup-failed"); receipt.diagnostics.push(safeDiagnostic("child-cleanup", error)); }
    }
    if (browserTeardownUnverified && !receipt.failures.includes("browser-server-teardown-unverified")) receipt.failures.push("browser-server-teardown-unverified");
    if (diagnosticUnverified) receipt.failures.push("diagnostic-work-settlement-unverified");
    if (transactionOpen) {
      try { await db.query("rollback"); transactionOpen = false; createUncertain = false; rollbackConfirmed = true; }
      catch (error) { receipt.failures.push("transaction-rollback-unverified"); receipt.diagnostics.push(safeDiagnostic("transaction-rollback", error)); }
    }
    // Never delete a key while a captured child or transaction remains unverified.
    if (keyUuid && !transactionOpen && !browserTeardownUnverified && !diagnosticUnverified && !receipt.failures.includes("owned-child-cleanup-failed")) {
      try {
        const result = await db.query("delete from vault.secrets where id=$1::uuid and name=$2 returning id", [keyUuid, ownedName]);
        const remaining = await db.query("select id,name from vault.secrets where id=$1::uuid", [keyUuid]);
        if (remaining.rows.length || result.rows.some(row => row.id !== keyUuid)) fail("key-delete-unverified");
        receipt.keyDeleted = true;
      } catch (error) { receipt.failures.push("owned-key-cleanup-failed"); receipt.diagnostics.push(safeDiagnostic("key-cleanup", error)); }
    } else if (createUncertain) receipt.failures.push("key-create-outcome-unverified");
    if (db) { try { await bounded(db.end(), 5_000, "db-close-unverified"); receipt.dbClosed = true; } catch (error) { receipt.failures.push("db-close-unverified"); receipt.diagnostics.push(safeDiagnostic("database-close", error)); } }
    unregister();
    if (receipt.failures.length && (createUncertain || (keyUuid && !receipt.keyDeleted) || receipt.failures.some(code => code.includes("cleanup") || code.includes("unverified")))) {
      receipt.custody = { owner: "Isolated CI job operator", job: env.CALENDAR_FEED_CI_DISPOSABLE_STACK,
        vaultUuid: keyUuid ?? null, ownedName: ownedName ?? null, expiry: "Destruction of this disposable GitHub-hosted job",
        nextAction: "Inspect captured CI child/key ownership in the disposable job; do not retry creation or delete by name.",
        resumeCondition: "Owned children settled and the captured UUID/name key is confirmed absent, or the entire disposable job has ended." };
    }
    receipt.keyOutcome = receipt.keyDeleted ? "deleted-confirmed" : !createAttempted ? "not-attempted"
      : rollbackConfirmed && !commitAttempted ? "rollback-confirmed" : "unverified";
  }
  if (mode === "cause-proof" && diagnosticPrepared) {
    try { if (!await deps.finishDiagnostic(receipt, diagnosticObserve, diagnosticPrivacy)) receipt.failures.push("diagnostic-capture-failed"); }
    catch { receipt.failures.push("diagnostic-capture-failed"); }
  }
  return { exitCode: receipt.failures.length ? 1 : 0, receipt };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const result = await runCalendarFeedRuntime({ mode: process.argv.length === 3 ? process.argv[2] : undefined });
  console.log(JSON.stringify(result.receipt));
  process.exitCode = result.exitCode;
}


## Full committed source: scripts/ci/checkpoint-dispatch.mjs

import { spawnSync } from "node:child_process";
import { randomUUID } from "node:crypto";
import { createHash } from "node:crypto";
import { closeSync, existsSync, fsyncSync, mkdirSync, openSync, readFileSync, renameSync, unlinkSync, writeFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const WORKFLOW = "ci.yml";
export const WORKFLOW_PATH = ".github/workflows/ci.yml";
const SHA = /^[a-f0-9]{40}$/;
const ID = /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/;
const REPO = /^[A-Za-z0-9_.-]+\/[A-Za-z0-9_.-]+$/;
const ACTOR = /^[A-Za-z0-9-]+(?:\[bot\])?$/;
export const checkpointTitle = (id, sha, mode = "normal") => mode === "calendar-feed-cause-proof" ? `checkpoint:cause-proof:${id}:${sha}` : `checkpoint:${id}:${sha}`;
function verificationMode(state) {
  if (state.verification_mode === undefined && state.cause_proof === undefined) return state.release_validation === true ? "release" : "normal";
  const expected = state.cause_proof === true ? "calendar-feed-cause-proof" : state.release_validation === true ? "release" : "normal";
  if (typeof state.cause_proof !== "boolean" || state.verification_mode !== expected || (state.cause_proof && state.release_validation)) throw new Error("Invalid checkpoint verification mode.");
  return expected;
}
const modeReceipt = state => ({ verification_mode: verificationMode(state), evidence_class: verificationMode(state) === "calendar-feed-cause-proof" ? "diagnostic-only" : "normal-gates-pending", acceptance_credit: 0 });

/** A workflow ID being active does not prove it understands a new input. */
export function assertCauseProofWorkflow(source) {
  if (typeof source !== "string" || source.length > 512_000) throw new Error("Diagnostic workflow availability unverified.");
  const text = source.replaceAll("\r\n", "\n");
  if (!text.includes("      calendar_feed_cause_proof:\n        description: One diagnostic call and unmodified rollback-only baseline; zero acceptance\n        type: boolean\n        required: false\n        default: false\n")
    || !text.includes("checkpoint:cause-proof:{0}:{1}") || !text.includes('test "$RELEASE_VALIDATION" = false')
    || !text.includes("node scripts/ci/with-calendar-feed-runtime.mjs cause-proof")) throw new Error("Diagnostic workflow input/admission is unavailable; no dispatch sent.");
}
function diagnosticAvailability(api, options) {
  const read = ref => {
    const value = api("GET", `repos/${options.repo}/contents/${WORKFLOW_PATH}?ref=${encodeURIComponent(ref)}`);
    if (value?.encoding !== "base64" || typeof value.content !== "string" || value.content.length > 700_000 || !/^[a-f0-9]{40}$/.test(value.sha ?? "")) throw new Error("Diagnostic workflow source unavailable; no dispatch sent.");
    const bytes = Buffer.from(value.content, "base64");
    if (createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") !== value.sha) throw new Error("Diagnostic workflow object mismatch; no dispatch sent.");
    const text = bytes.toString("utf8"); assertCauseProofWorkflow(text);
    return { text, oid: value.sha };
  };
  const candidate = read(options.sha);
  if (candidate.text.replaceAll("\r\n", "\n") !== readFileSync(resolve(WORKFLOW_PATH), "utf8").replaceAll("\r\n", "\n")) throw new Error("Diagnostic candidate workflow differs from reviewed checkout; no dispatch sent.");
  const repository = api("GET", `repos/${options.repo}`);
  validateRequest({ ...options, ref: repository?.default_branch });
  const primary = read(repository.default_branch);
  return { candidate_workflow_oid: candidate.oid, default_workflow_oid: primary.oid };
}

export function validateRequest({ repo, ref, sha }) {
  if (!REPO.test(repo ?? "") || repo.includes("..")) throw new Error("Use an explicit owner/repository.");
  if (!SHA.test(sha ?? "")) throw new Error("Use a full lowercase 40-character commit SHA.");
  if (typeof ref !== "string" || ref.length > 240 || ref.startsWith("-") || ref.startsWith("/") || ref.endsWith("/") || /[\s~^:?*[\\\x00-\x1f\x7f]/.test(ref) || ref.includes("..") || ref.includes("@{") || ref.split("/").some((part) => !part || part.startsWith(".") || part.endsWith(".") || part.endsWith(".lock"))) {
    throw new Error("Use a valid branch name, without refs/heads/.");
  }
  if (ref.startsWith("refs/")) throw new Error("Use the branch name without refs/heads/.");
}

// Arguments and JSON stdin never pass through a shell. CLI errors deliberately
// exclude response bodies and the inherited authentication environment.
export function githubApi(method, endpoint, body) {
  const result = spawnSync("gh", ["api", "--method", method, endpoint, ...(body === undefined ? [] : ["--input", "-"])], {
    input: body === undefined ? undefined : JSON.stringify(body),
    encoding: "utf8", timeout: 15_000, maxBuffer: 4 * 1024 * 1024,
    windowsHide: true,
  });
  if (result.error || result.status !== 0) throw new Error(`GitHub ${method} request failed; response omitted.`);
  if (!result.stdout.trim()) return null;
  try { return JSON.parse(result.stdout); } catch { throw new Error("GitHub returned invalid JSON; response omitted."); }
}

function validateState(state) {
  if (state?.version !== 1) throw new Error("Unsupported checkpoint record.");
  validateRequest(state);
  if (!ID.test(state.checkpoint_id) || !ACTOR.test(state.actor) || !Number.isSafeInteger(state.workflow_id) || state.workflow_id < 1 || !Number.isFinite(Date.parse(state.created_at)) || !Number.isFinite(Date.parse(state.deadline_at))) {
    throw new Error("Invalid checkpoint ownership record.");
  }
  if (state.run_id != null && (!Number.isSafeInteger(state.run_id) || state.run_id < 1)) throw new Error("Invalid recorded run ID.");
  if (state.release_validation !== undefined && typeof state.release_validation !== "boolean") throw new Error("Invalid checkpoint release selection.");
  verificationMode(state);
}

function save(path, state) {
  const temporary = `${path}.${randomUUID()}.tmp`;
  const fd = openSync(temporary, "wx", 0o600);
  try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
  renameSync(temporary, path);
}

function workflowMatches(run, state) {
  return run.repository?.full_name?.toLowerCase() === state.repo.toLowerCase()
    && run.workflow_id === state.workflow_id
    && (run.path === WORKFLOW_PATH || run.path?.startsWith(`${WORKFLOW_PATH}@`))
    && run.event === "workflow_dispatch"
    && run.head_branch === state.ref
    && run.head_sha === state.sha
    && run.display_title === checkpointTitle(state.checkpoint_id, state.sha, verificationMode(state))
    && run.actor?.login?.toLowerCase() === state.actor.toLowerCase()
    && run.triggering_actor?.login?.toLowerCase() === state.actor.toLowerCase()
    && run.run_attempt === 1;
}

export function assertOwnedRun(run, state) {
  if (!workflowMatches(run, state) || !Number.isSafeInteger(run.id) || run.id < 1 || (state.run_id != null && run.id !== state.run_id)) {
    throw new Error("Run ownership mismatch (repository/workflow/event/ref/SHA/checkpoint/actor/attempt); no mutation sent.");
  }
}

// Never select the latest run. Inspect a bounded listing for this exact immutable
// title; duplicates, truncation and reruns require human reconciliation.
function discover(api, state) {
  const matches = [];
  for (let page = 1; page <= 5; page += 1) {
    const result = api("GET", `repos/${state.repo}/actions/workflows/${state.workflow_id}/runs?event=workflow_dispatch&head_sha=${state.sha}&per_page=100&page=${page}`);
    if (!Array.isArray(result?.workflow_runs)) throw new Error("Invalid workflow run listing.");
    matches.push(...result.workflow_runs.filter((run) => run.display_title === checkpointTitle(state.checkpoint_id, state.sha, verificationMode(state))));
    if (matches.length > 1) throw new Error("Duplicate checkpoint runs; no mutation sent. Reconcile manually.");
    if (result.workflow_runs.length < 100) return matches[0] ?? null;
  }
  throw new Error("Run discovery exceeded its five-page bound; no mutation sent.");
}

/** @returns {Record<string, unknown>} */
export function checkpoint(command, options, { api = githubApi, now = () => new Date() } = {}) {
  if (!["dispatch", "status", "cancel"].includes(command)) throw new Error("Use dispatch, status or cancel.");
  if (!options.state) throw new Error("--state is required; use an ignored private local path.");
  const path = resolve(options.state);
  mkdirSync(dirname(path), { recursive: true });
  const lockPath = `${path}.lock`;
  let lock;
  try { lock = openSync(lockPath, "wx", 0o600); } catch { throw new Error("Checkpoint record is locked; inspect its owner before recovery."); }
  try {
    if (command === "dispatch") {
      if (existsSync(path)) throw new Error("Checkpoint record already exists. Use status; never retry dispatch from this record.");
      validateRequest(options);
      if (options.release_validation !== undefined && !["true", "false"].includes(options.release_validation)) throw new Error("--release-validation must be true or false.");
      if (options.cause_proof !== undefined && !["true", "false"].includes(options.cause_proof)) throw new Error("--cause-proof must be true or false.");
      if (options.cause_proof === "true" && options.release_validation === "true") throw new Error("Diagnostic and release modes are mutually exclusive.");
      const actor = api("GET", "user").login;
      if (!ACTOR.test(actor ?? "")) throw new Error("Cannot establish authenticated actor.");
      const permission = api("GET", `repos/${options.repo}/collaborators/${encodeURIComponent(actor)}/permission`).permission;
      if (!["admin", "maintain", "write"].includes(permission)) throw new Error("Checkpoint dispatch requires repository write permission.");
      const branch = api("GET", `repos/${options.repo}/branches/${encodeURIComponent(options.ref)}`);
      if (branch.commit?.sha !== options.sha) throw new Error("Remote branch differs from the requested SHA; no dispatch sent.");
      const workflow = api("GET", `repos/${options.repo}/actions/workflows/${WORKFLOW}`);
      if (workflow.path !== WORKFLOW_PATH || workflow.state !== "active" || !Number.isSafeInteger(workflow.id) || workflow.id < 1) throw new Error("Expected active CI workflow is unavailable on the default branch.");
      const availability = options.cause_proof === "true" ? diagnosticAvailability(api, options) : undefined;
      const created = now();
      const state = {
        version: 1, repo: options.repo, ref: options.ref, sha: options.sha,
        actor, workflow_id: workflow.id, checkpoint_id: randomUUID(),
        release_validation: options.release_validation === "true",
        cause_proof: options.cause_proof === "true",
        verification_mode: options.cause_proof === "true" ? "calendar-feed-cause-proof" : options.release_validation === "true" ? "release" : "normal",
        ...(availability ? { workflow_availability: availability } : {}),
        created_at: created.toISOString(), deadline_at: new Date(created.getTime() + 60 * 60 * 1000).toISOString(),
        phase: "dispatch-uncertain", run_id: null,
      };
      // Exclusive durable intent precedes the only dispatch POST. The GitHub
      // checkpoint ID correlates requests; GitHub does not make it idempotent.
      const fd = openSync(path, "wx", 0o600);
      try { writeFileSync(fd, `${JSON.stringify(state, null, 2)}\n`); fsyncSync(fd); } finally { closeSync(fd); }
      try {
        api("POST", `repos/${state.repo}/actions/workflows/${state.workflow_id}/dispatches`, {
          ref: state.ref, inputs: { expected_sha: state.sha, checkpoint_id: state.checkpoint_id, release_validation: String(state.release_validation), ...(state.cause_proof ? { calendar_feed_cause_proof: "true" } : {}) },
        });
      } catch {
        throw new Error("Dispatch outcome uncertain. Ownership record retained; use status, never repeat dispatch.");
      }
      state.phase = "dispatched";
      save(path, state);
      return { phase: state.phase, checkpoint_id: state.checkpoint_id, sha: state.sha, release_validation: state.release_validation, ...modeReceipt(state), next: "Use status with this same --state record." };
    }
    const state = JSON.parse(readFileSync(path, "utf8"));
    validateState(state);
    const actor = api("GET", "user").login;
    if (actor?.toLowerCase() !== state.actor.toLowerCase()) throw new Error("Authenticated actor differs from checkpoint owner; no mutation sent.");
    const listed = discover(api, state);
    if (!listed) {
      if (state.run_id != null) throw new Error("Recorded run is absent from discovery; reconcile manually.");
      return { phase: "dispatch-uncertain", checkpoint_id: state.checkpoint_id, ...modeReceipt(state), attention: "No unique matching run visible. Do not redispatch. Reconcile manually.", deadline_exceeded: now().getTime() > Date.parse(state.deadline_at) };
    }
    const run = api("GET", `repos/${state.repo}/actions/runs/${listed.id}`);
    assertOwnedRun(run, state);
    state.run_id = run.id;
    state.phase = run.status === "completed" ? "completed" : run.status;
    state.conclusion = run.conclusion ?? null;
    save(path, state);
    if (command === "cancel" && run.status !== "completed") {
      // A timeout/failure may mean the cancellation was accepted. Persist that
      // uncertainty first, and require subsequent status instead of retrying.
      if (state.cancel_requested_at) throw new Error("Cancellation already requested; use status, do not repeat cancellation.");
      state.cancel_requested_at = now().toISOString();
      save(path, state);
      try { api("POST", `repos/${state.repo}/actions/runs/${run.id}/cancel`); } catch { throw new Error("Cancellation outcome uncertain; use status. No retry sent."); }
      return { phase: "cancel-requested", run_id: run.id, sha: state.sha, ...modeReceipt(state) };
    }
    return { phase: state.phase, conclusion: state.conclusion, run_id: run.id, sha: state.sha,
      release_validation: state.release_validation ?? false,
      ...modeReceipt(state),
      deadline_exceeded: run.status !== "completed" && now().getTime() > Date.parse(state.deadline_at),
      url: `https://github.com/${state.repo}/actions/runs/${run.id}` };
  } finally {
    closeSync(lock);
    unlinkSync(lockPath);
  }
}

export function parseArgs(args) {
  const [command, ...rest] = args;
  const options = {};
  const allowed = command === "dispatch" ? ["repo", "ref", "sha", "state", "release-validation", "cause-proof"] : ["state"];
  for (let index = 0; index < rest.length; index += 2) {
    const key = rest[index]?.slice(2);
    if (!rest[index]?.startsWith("--") || !allowed.includes(key) || options[key.replaceAll("-", "_")] !== undefined || !rest[index + 1] || rest[index + 1].startsWith("--")) throw new Error("Invalid, duplicate or missing option. Dispatch: --repo --ref --sha --state [--release-validation true|false] [--cause-proof true|false]; status/cancel: --state.");
    options[key.replaceAll("-", "_")] = rest[index + 1];
  }
  return { command, options };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  try {
    const { command, options } = parseArgs(process.argv.slice(2));
    const result = checkpoint(command, options);
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
    if (result.phase === "completed" && result.conclusion !== "success") process.exitCode = 1;
    // A queue observation threshold is informational. It does not expire
    // authorization, request a replacement dispatch, or invalidate later success.
  } catch (error) {
    process.stderr.write(`${error instanceof Error ? error.message : "Checkpoint operation failed."}\n`);
    process.exitCode = 1;
  }
}


## Full committed source: tests/support/calendar-feed-ci-contract.ts

import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";

const wrapperPath = new URL("../../scripts/ci/with-calendar-feed-runtime.mjs", import.meta.url);
const wrapperSha256 = "44798a4e836ad7e99e0c38f6aaf9ddce4bde4605e39722e432d0884f1fa85560";
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
  let projected = workflow.replaceAll("\r\n", "\n");
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


## Full committed source: tests/unit/scripts/ci/checkpoint-dispatch.test.ts

import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { test } from "node:test";
import { existsSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
import { checkpoint, checkpointTitle, parseArgs, validateRequest, assertCauseProofWorkflow } from "../../../../scripts/ci/checkpoint-dispatch.mjs";
import { createHash } from "node:crypto";

const sha = "a".repeat(40);
const request = { repo: "owner/repo", ref: "codex/checkpoint", sha };
function fixture() {
  const directory = mkdtempSync(join(tmpdir(), "checkpoint-unit-"));
  const state = join(directory, "state.json");
  const calls: { method: string; endpoint: string; body: unknown }[] = [];
  let runs: Record<string, unknown>[] = [];
  let failDispatch = false;
  let failCancel = false;
  let permission = "write";
  let remoteSha = sha;
  let actor = "owner";
  let fullPage = false;
  let defaultWorkflow = readFileSync(".github/workflows/ci.yml", "utf8");
  const api = (method: string, endpoint: string, body?: unknown) => {
    calls.push({ method, endpoint, body });
    if (endpoint === "user") return { login: actor };
    if (endpoint === "repos/owner/repo") return { default_branch: "main" };
    if (endpoint.includes("/contents/.github/workflows/ci.yml?ref=")) {
      const text = endpoint.endsWith("ref=main") ? defaultWorkflow : readFileSync(".github/workflows/ci.yml", "utf8");
      const bytes = Buffer.from(text);
      return { encoding: "base64", content: bytes.toString("base64"), sha: createHash("sha1").update(`blob ${bytes.length}\0`).update(bytes).digest("hex") };
    }
    if (endpoint.endsWith("/permission")) return { permission };
    if (endpoint.includes("/branches/")) return { commit: { sha: remoteSha } };
    if (endpoint.endsWith("/workflows/ci.yml")) return { id: 42, path: ".github/workflows/ci.yml", state: "active" };
    if (endpoint.endsWith("/dispatches")) { if (failDispatch) throw new Error("secret response"); return null; }
    if (endpoint.includes("/runs?")) return { workflow_runs: fullPage ? Array.from({ length: 100 }, () => ({ display_title: "unrelated" })) : runs };
    if (endpoint.endsWith("/cancel")) { if (failCancel) throw new Error("secret response"); return null; }
    if (endpoint.includes("/actions/runs/")) return runs.find((run) => endpoint.endsWith(`/${run.id}`));
    throw new Error(`Unexpected test endpoint ${endpoint}`);
  };
  const dependencies = { api, now: () => new Date("2026-10-19T12:00:00Z") };
  const dispatch = () => checkpoint("dispatch", { ...request, state }, dependencies);
  const status = () => checkpoint("status", { state }, dependencies);
  const cancel = () => checkpoint("cancel", { state }, dependencies);
  const record = () => JSON.parse(readFileSync(state, "utf8"));
  const run = (changes = {}) => {
    const current = record();
    return { id: 123, repository: { full_name: request.repo }, workflow_id: 42,
      path: ".github/workflows/ci.yml", event: "workflow_dispatch", head_branch: request.ref,
      head_sha: sha, display_title: checkpointTitle(current.checkpoint_id, sha, current.verification_mode),
      actor: { login: "owner" }, triggering_actor: { login: "owner" }, run_attempt: 1,
      status: "queued", conclusion: null, ...changes };
  };
  return { state, calls, dependencies, dispatch, status, cancel, record, run,
    setRuns(value: Record<string, unknown>[]) { runs = value; },
    failDispatch() { failDispatch = true; }, failCancel() { failCancel = true; },
    permission(value: string) { permission = value; }, remoteSha(value: string) { remoteSha = value; },
    actor(value: string) { actor = value; }, fullPage() { fullPage = true; }, defaultWorkflow(value: string) { defaultWorkflow = value; },
    cleanup() { rmSync(directory, { recursive: true, force: true }); } };
}
function withFixture(body: (value: ReturnType<typeof fixture>) => void) {
  const value = fixture();
  try { body(value); } finally { value.cleanup(); }
}
const mutations = (f: ReturnType<typeof fixture>) => f.calls.filter((call) => call.method === "POST");

test("dispatch persists unique intent before its only POST and sends immutable inputs", () => withFixture((f) => {
  const baseApi = f.dependencies.api;
  f.dependencies.api = (method, endpoint, body) => {
    if (method === "POST") assert.equal(f.record().phase, "dispatch-uncertain");
    return baseApi(method, endpoint, body);
  };
  f.dispatch();
  const state = f.record();
  assert.equal(state.phase, "dispatched");
  assert.equal(state.actor, "owner");
  assert.deepEqual(mutations(f)[0].body, { ref: request.ref, inputs: { expected_sha: sha, checkpoint_id: state.checkpoint_id, release_validation: "false" } });
  assert.throws(f.dispatch, /already exists/);
  assert.equal(mutations(f).length, 1);
}));

test("uncertain dispatch retains durable identity and status never retries", () => withFixture((f) => {
  f.failDispatch();
  assert.throws(f.dispatch, /outcome uncertain/);
  assert.equal(f.record().phase, "dispatch-uncertain");
  assert.equal(f.status().phase, "dispatch-uncertain");
  assert.throws(f.dispatch, /already exists/);
  assert.equal(mutations(f).length, 1);
  f.setRuns([f.run()]);
  assert.equal(f.status().run_id, 123);
  assert.equal(mutations(f).length, 1);
}));

test("remote head drift and insufficient authorization reject before dispatch", () => {
  withFixture((f) => { f.remoteSha("b".repeat(40)); assert.throws(f.dispatch, /differs/); assert.equal(mutations(f).length, 0); });
  withFixture((f) => { f.permission("read"); assert.throws(f.dispatch, /write permission/); assert.equal(mutations(f).length, 0); });
});

test("distinct checkpoint records get independent immutable identities", () => {
  const first = fixture(); const second = fixture();
  try { first.dispatch(); second.dispatch(); assert.notEqual(first.record().checkpoint_id, second.record().checkpoint_id); }
  finally { first.cleanup(); second.cleanup(); }
});

test("status reports native completed failures and queued deadline without mutations", () => withFixture((f) => {
  f.dispatch(); f.setRuns([f.run()]);
  const late = checkpoint("status", { state: f.state }, { ...f.dependencies, now: () => new Date("2026-10-19T14:00:00Z") });
  assert.equal(late.phase, "queued"); assert.equal(late.deadline_exceeded, true);
  f.setRuns([f.run({ status: "completed", conclusion: "failure" })]);
  assert.equal(f.status().conclusion, "failure");
  assert.equal(f.cancel().phase, "completed");
  assert.equal(mutations(f).length, 1);
}));

test("cancellation is bounded to the proven run and never repeats uncertain POST", () => withFixture((f) => {
  f.dispatch(); f.setRuns([f.run()]); f.failCancel();
  assert.throws(f.cancel, /Cancellation outcome uncertain/);
  assert.ok(f.record().cancel_requested_at);
  assert.throws(f.cancel, /already requested/);
  assert.equal(mutations(f).filter((call) => call.endpoint.endsWith("/cancel")).length, 1);
  assert.equal(f.status().phase, "queued");
}));

for (const [field, value] of Object.entries({ repository: { full_name: "other/repo" }, workflow_id: 99, path: ".github/workflows/other.yml", event: "push", head_branch: "main", head_sha: "b".repeat(40), actor: { login: "other" }, triggering_actor: { login: "other" }, run_attempt: 2 })) {
  test(`cancellation refuses mismatched ${field}`, () => withFixture((f) => {
    f.dispatch(); f.setRuns([f.run({ [field]: value })]);
    assert.throws(f.cancel, /ownership mismatch/);
    assert.equal(mutations(f).length, 1);
  }));
}

test("cancellation refuses arbitrary checkpoint title, duplicate runs and changed recorded run", () => {
  withFixture((f) => { f.dispatch(); f.setRuns([f.run({ display_title: "different" })]); assert.equal(f.cancel().phase, "dispatch-uncertain"); assert.equal(mutations(f).length, 1); });
  withFixture((f) => { f.dispatch(); f.setRuns([f.run(), f.run({ id: 124 })]); assert.throws(f.cancel, /Duplicate/); assert.equal(mutations(f).length, 1); });
  withFixture((f) => { f.dispatch(); f.setRuns([f.run()]); f.status(); f.setRuns([f.run({ id: 124 })]); assert.throws(f.cancel, /ownership mismatch/); assert.equal(mutations(f).length, 1); });
});

test("discovery has a fixed page bound and never guesses on truncated history", () => withFixture((f) => {
  f.dispatch(); f.fullPage(); assert.throws(f.cancel, /five-page bound/);
  assert.equal(f.calls.filter((call) => call.endpoint.includes("/runs?")).length, 5);
  assert.equal(mutations(f).length, 1);
}));

test("local ownership lock and current authenticated actor prevent competing operations", () => withFixture((f) => {
  f.dispatch(); f.setRuns([f.run()]); f.actor("other");
  assert.throws(f.cancel, /actor differs/);
  writeFileSync(`${f.state}.lock`, "owned");
  assert.throws(f.status, /locked/);
  assert.equal(mutations(f).length, 1);
}));

test("argument validation excludes arbitrary cancellation IDs, malformed refs and abbreviated hashes", () => {
  assert.deepEqual(parseArgs(["status", "--state", "local.json"]), { command: "status", options: { state: "local.json" } });
  for (const args of [["cancel", "--run-id", "123"], ["dispatch", "--state"], ["status", "--state", "a", "--state", "b"]]) assert.throws(() => parseArgs(args));
  for (const ref of ["-main", "refs/heads/main", "a..b", "a b", "a.lock", "a@{b", "a?b"]) assert.throws(() => validateRequest({ ...request, ref }));
  assert.throws(() => validateRequest({ ...request, sha: "aaaa" }));
});

test("workflow binds admission and preserves consequential gates with broad UI diagnostics optional", () => {
  const workflow = projectCalendarFeedCiCommands(readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8"));
  const ordinaryJobs = ["checkpoint-admission", "verify", "db", "recovery-storage-loader", "e2e", "dashboard-e2e"];
  const separateDiagnostics = ["native-stream-probe", "fixed-chromium-paired-probe", "fixed-chromium-application-verification"];
  const jobsStart = workflow.indexOf("\njobs:\n");
  assert.ok(jobsStart > 0);
  const jobMatches = [...workflow.slice(jobsStart).matchAll(/^  ([a-z][a-z0-9-]*):\n/gm)];
  assert.deepEqual(jobMatches.map(match => match[1]), [...ordinaryJobs, ...separateDiagnostics]);
  const jobs = new Map(jobMatches.map((match, index) => [match[1], workflow.slice(jobsStart + match.index!, index + 1 < jobMatches.length ? jobsStart + jobMatches[index + 1].index! : undefined)]));
  assert.equal(jobs.size, ordinaryJobs.length + separateDiagnostics.length);
  const ordinaryWorkflow = workflow.slice(0, jobsStart) + ordinaryJobs.map(name => jobs.get(name)!).join("");
  assert.match(workflow, /workflow_dispatch:/);
  assert.match(workflow, /run-name:.*checkpoint:\{0\}:\{1\}/);
  assert.match(workflow, /test "\$EXPECTED_SHA" = "\$GITHUB_SHA"/);
  assert.match(workflow, /test "\$GITHUB_RUN_ATTEMPT" = 1/);
  assert.match(workflow, /verify:\s+needs: \[checkpoint-admission\]/);
  assert.match(workflow, /group: ci-.*inputs.checkpoint_id \|\| github.ref/);
  assert.doesNotMatch(ordinaryWorkflow, /vars\.|secrets\./);
  for (const job of ["db", "recovery-storage-loader", "e2e", "dashboard-e2e"]) assert.match(workflow, new RegExp(`  ${job}:[\\s\\S]*?needs: \\[verify\\]`));
  for (const command of ["pnpm audit --audit-level=high", "pnpm run verify:service-role-containment", "pnpm typecheck", "pnpm lint", "pnpm build", "pnpm run verify:bundle-containment", "pnpm run test:smoke", "pnpm run test:e2e --reporter=list,json", "--config tests/e2e/dashboard/playwright.ci.config.ts"]) assert.ok(workflow.includes(command), command);
  assert.match(workflow, /release_validation:\s+description:[^\n]+\s+type: boolean\s+required: false\s+default: false/);
  assert.match(workflow, /dashboard-e2e:\s+if: \$\{\{ github.event_name == 'workflow_dispatch' && inputs.release_validation \}\}/);
  const recovery = workflow.split("  recovery-storage-loader:")[1].split("  e2e:")[0];
  assert.doesNotMatch(recovery, /inputs\.release_validation/);
  assert.doesNotMatch(workflow, /--max-seconds/);
  assert.equal((ordinaryWorkflow.match(/persist-credentials: false/g) ?? []).length, 5);
  // Preserve the pre-existing PR source-head policy; dispatch uses github.sha.
  assert.equal((ordinaryWorkflow.match(/ref: \$\{\{ github.event.pull_request.head.sha \|\| github.sha \}\}/g) ?? []).length, 5);
});

test("native workflow admission executes exact source binding and preserves PR/push behavior", (t) => {
  const bash = process.platform === "win32"
    ? join(process.env.ProgramFiles ?? "C:/Program Files", "Git", "bin", "bash.exe")
    : "bash";
  if (process.platform === "win32" && !existsSync(bash)) {
    t.skip("Git Bash unavailable locally; Linux hosted CI executes this admission contract.");
    return;
  }
  const workflow = readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8");
  const block = workflow.match(/      - name: Bind dispatch to its immutable source revision[\s\S]*?        run: \|\r?\n([\s\S]*?)(?=^  verify:)/m);
  assert.ok(block, "extract the checked-in admission block, not a duplicate implementation");
  const script = block[1].split(/\r?\n/).map((line) => line.slice(10)).join("\n");
  const base = { GITHUB_EVENT_NAME: "workflow_dispatch", EXPECTED_SHA: sha, GITHUB_SHA: sha,
    CAUSE_PROOF: "false", RELEASE_VALIDATION: "false", OTHER_DIAGNOSTICS: "false",
    CHECKPOINT_ID: "12345678-1234-4123-8123-123456789abc", GITHUB_RUN_ATTEMPT: "1", GITHUB_REF_TYPE: "branch" };
  const cases: [string, Record<string, string>, boolean][] = [
    ["valid dispatch", {}, true],
    ["valid diagnostic", { CAUSE_PROOF: "true" }, true],
    ["diagnostic release conflict", { CAUSE_PROOF: "true", RELEASE_VALIDATION: "true" }, false],
    ["diagnostic other probe conflict", { CAUSE_PROOF: "true", OTHER_DIAGNOSTICS: "true" }, false],
    ["diagnostic PR refused", { CAUSE_PROOF: "true", GITHUB_EVENT_NAME: "pull_request" }, false],
    ["head drift", { GITHUB_SHA: "b".repeat(40) }, false],
    ["malformed SHA", { EXPECTED_SHA: "aaaa" }, false],
    ["malformed UUID", { CHECKPOINT_ID: "not-a-checkpoint" }, false],
    ["rerun", { GITHUB_RUN_ATTEMPT: "2" }, false],
    ["tag", { GITHUB_REF_TYPE: "tag" }, false],
    ["PR unchanged", { GITHUB_EVENT_NAME: "pull_request", EXPECTED_SHA: "", CHECKPOINT_ID: "" }, true],
    ["push unchanged", { GITHUB_EVENT_NAME: "push", EXPECTED_SHA: "", CHECKPOINT_ID: "" }, true],
  ];
  for (const [label, change, passes] of cases) {
    const result = spawnSync(bash, ["--noprofile", "--norc", "-s"], {
      input: script, env: { ...process.env, ...base, ...change },
      encoding: "utf8", timeout: 5_000, windowsHide: true,
    });
    assert.ifError(result.error);
    assert.equal(result.status === 0, passes, label);
  }
});

test("release validation is explicit and persisted in the only dispatch", () => withFixture((f) => {
  const result = checkpoint("dispatch", { ...request, state: f.state, release_validation: "true" }, f.dependencies);
  assert.equal(result.release_validation, true);
  assert.equal(f.record().release_validation, true);
  assert.equal((mutations(f)[0].body as {inputs: {release_validation: string}}).inputs.release_validation, "true");
}));

test("validation selection cannot introduce arbitrary workflow inputs", () => withFixture((f) => {
  assert.throws(() => checkpoint("dispatch", { ...request, state: f.state, release_validation: "anything" }, f.dependencies), /true or false/);
  assert.equal(mutations(f).length, 0);
  assert.deepEqual(parseArgs(["dispatch", "--release-validation", "true"]).options, { release_validation: "true" });
  assert.throws(() => parseArgs(["dispatch", "--release-validation", "true", "--release-validation", "false"]));
}));


test("diagnostic selection is durable before the only POST and status remains zero acceptance", () => withFixture(f => {
  const api = f.dependencies.api;
  f.dependencies.api=(method,endpoint,body)=>{
    if(method==="POST") { assert.equal(f.record().verification_mode,"calendar-feed-cause-proof"); assert.equal(f.record().phase,"dispatch-uncertain"); }
    return api(method,endpoint,body);
  };
  const result=checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies);
  assert.equal(result.evidence_class,"diagnostic-only"); assert.equal(result.acceptance_credit,0);
  assert.deepEqual((mutations(f)[0].body as {inputs:unknown}).inputs,{expected_sha:sha,checkpoint_id:f.record().checkpoint_id,release_validation:"false",calendar_feed_cause_proof:"true"});
  f.setRuns([f.run({status:"completed",conclusion:"success"})]);
  assert.equal(f.status().evidence_class,"diagnostic-only"); assert.equal(f.status().acceptance_credit,0);
  assert.throws(f.dispatch,/already exists/); assert.equal(mutations(f).length,1);
}));
test("diagnostic availability or mode conflicts refuse before POST and cannot fall back",()=>{
  withFixture(f=>{f.defaultWorkflow("name: old workflow");assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/unavailable/);assert.equal(mutations(f).length,0);});
  for(const options of [{cause_proof:"other"},{cause_proof:"true",release_validation:"true"}])withFixture(f=>{assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,...options},f.dependencies));assert.equal(mutations(f).length,0);});
  assert.deepEqual(parseArgs(["dispatch","--cause-proof","true"]).options,{cause_proof:"true"});
  assert.throws(()=>parseArgs(["dispatch","--cause-proof","true","--cause-proof","false"]));
  assert.throws(()=>parseArgs(["status","--cause-proof","true"]));
  assert.throws(()=>assertCauseProofWorkflow(readFileSync(".github/workflows/ci.yml","utf8").replace("default: false","default: true")));
});
test("diagnostic uncertain dispatch and wrong-mode title never select or resend normal work",()=>withFixture(f=>{
  f.failDispatch(); assert.throws(()=>checkpoint("dispatch",{...request,state:f.state,cause_proof:"true"},f.dependencies),/uncertain/);
  f.setRuns([f.run({display_title:checkpointTitle(f.record().checkpoint_id,sha)})]);
  assert.equal(f.status().phase,"dispatch-uncertain"); assert.equal(f.status().evidence_class,"diagnostic-only");assert.equal(mutations(f).length,1);
}));
test("legacy mode-less records remain normal and corrupt diagnostic selections fail closed",()=>withFixture(f=>{
  f.dispatch();const old=f.record();delete old.verification_mode;delete old.cause_proof;writeFileSync(f.state,JSON.stringify(old));f.setRuns([f.run()]);
  assert.equal(f.status().verification_mode,"normal");
  const corrupt=f.record();corrupt.cause_proof=true;corrupt.verification_mode="normal";writeFileSync(f.state,JSON.stringify(corrupt));
  assert.throws(f.status,/verification mode/);assert.equal(mutations(f).length,1);
}));


## Full committed source: tests/unit/scripts/verify/ci-native-test-reports.test.ts

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";

const read = (path: string): string => readFileSync(join(process.cwd(), path), "utf8").replaceAll("\r\n", "\n");
const ci = projectCalendarFeedCiCommands(read(".github/workflows/ci.yml"));

test("both Vitest CI invocations retain console and annotation reporters while emitting distinct native JSON", () => {
  const reporters = "--reporter=default --reporter=github-actions --reporter=json";
  assert.ok(ci.includes(`pnpm run test:int ${reporters} --outputFile=test-results/full-integration.json`));
  assert.ok(ci.includes(`pnpm exec vitest run tests/integration/ops/recovery-storage-immutability.int.test.ts ${reporters} --outputFile=test-results/isolated-storage-recovery.json`));
  assert.match(ci, /SUPABASE_TEST_REQUIRED: "1"/);
  assert.match(ci, /ISOLATED_RECOVERY_STORAGE_PROOF=1 .*pnpm exec vitest run tests\/integration\/ops\/recovery-storage-immutability\.int\.test\.ts/);
});

test("ordinary auth smoke and optional browser diagnostics retain native JSON without execution stopwatches", () => {
  const scripts = JSON.parse(read("package.json")).scripts;
  assert.match(scripts["test:smoke"], /login-and-tenant-context\.e2e\.spec\.ts/);
  assert.match(scripts["test:smoke"], /auth-mail-callback\.e2e\.spec\.ts/);
  assert.match(scripts["test:smoke"], /--reporter=list,json$/);
  assert.match(ci, /PLAYWRIGHT_JSON_OUTPUT_NAME: test-results\/general-browser\.json/);
  assert.match(ci, /pnpm run test:e2e --reporter=list,json/);
  assert.match(ci, /--config tests\/e2e\/dashboard\/playwright\.ci\.config\.ts --reporter=list,json/);
  assert.match(ci, /PLAYWRIGHT_JSON_OUTPUT_NAME: test-results\/dashboard-browser\.json/);
});

test("all four original native files upload on test failure and missing reports fail capture", () => {
  const reports = [
    ["native-full-integration", "full-integration.json"],
    ["native-isolated-storage-recovery", "isolated-storage-recovery.json"],
    ["native-general-browser", "general-browser.json"],
    ["native-dashboard-browser", "dashboard-browser.json"],
  ];
  const uploads = [...ci.matchAll(/      - name: Upload native [^\n]+ JSON\n        if: \$\{\{ !cancelled\(\) \}\}\n        uses: actions\/upload-artifact@v4\n        with:\n          name: ([^\n]+)\n          path: test-results\/([^\n]+)\n          retention-days: 7\n          if-no-files-found: error/g)].map(match => [match[1], match[2]]);
  assert.deepEqual(uploads, reports);
});


test("cause-proof capture is distinct mode-bound and uploads closed results on failure without replacing normal artifacts",()=>{
  const raw=read(".github/workflows/ci.yml");
  const diagnostic=raw.slice(raw.indexOf("      - name: Upload native calendar feed cause proof JSON"),raw.indexOf("      # Stage 8:"));
  assert.match(diagnostic,/if: \$\{\{ !cancelled\(\) && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof \}\}/);
  assert.match(diagnostic,/name: native-calendar-feed-cause-proof\n/);
  assert.match(diagnostic,/path: test-results\/calendar-feed-cause-proof\/upload\//);
  assert.match(diagnostic,/if-no-files-found: error/);
  const normal=raw.slice(raw.indexOf("      - name: Upload native full integration JSON"),raw.indexOf("      - name: Stop local Supabase stack"));
  assert.match(normal,/!cancelled\(\) && !\(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof\)/);
  assert.match(normal,/name: native-full-integration\n/);assert.match(normal,/path: test-results\/full-integration.json/);
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("native-calendar-feed-cause-proof\n","native-full-integration\n")));
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace("cause-proof/upload/","cause-proof/")));
});


## Full committed source: tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts

import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { test } from "node:test";
import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";

const ci = projectCalendarFeedCiCommands(readFileSync(join(process.cwd(), ".github", "workflows", "ci.yml"), "utf8"));

test("DB integrity and pilot probe remain required without an extra test execution stopwatch", () => {
  assert.match(ci, /run: \|\s+pnpm run test:int --reporter=default --reporter=github-actions --reporter=json --outputFile=test-results\/full-integration\.json\s+pnpm run test:pilot-performance/);
  assert.doesNotMatch(ci, /--max-seconds/);
  assert.doesNotMatch(ci, /test:int:pilot/);
});

/** Evaluate the supported OR-of-context-paths expression read from the workflow. */
function checkoutRef(expression: string, context: Record<string, unknown>): unknown {
  return expression.split("||").map(term => {
    let value: unknown = context;
    for (const property of term.trim().split(".")) {
      value = value !== null && typeof value === "object"
        ? (value as Record<string, unknown>)[property] : undefined;
    }
    return value;
  }).find(Boolean);
}

const checkoutExpressions = [...ci.matchAll(/uses: actions\/checkout@v4\n\s+with:\n\s+ref:\s+\$\{\{\s*([^}\n]+?)\s*\}\}/g)].map(match => match[1].trim());

test("five required CI jobs plus the three optional diagnostics select the candidate or triggering push SHA", () => {
  const checkoutSteps = [...ci.matchAll(/^\s+uses: actions\/checkout@[^\n]+/gm)];
  assert.equal(checkoutSteps.length, 8);
  assert.equal(checkoutExpressions.length, checkoutSteps.length);
  for (const expression of checkoutExpressions) {
    assert.equal(expression, "github.event.pull_request.head.sha || github.sha");
  }
});

test("pull-request CI selects its actual head rather than the synthetic merge SHA", () => {
  const headSha = "a".repeat(40), mergeSha = "b".repeat(40);
  for (const expression of checkoutExpressions) {
    assert.equal(checkoutRef(expression, { github: { event: { pull_request: { head: { sha: headSha } } }, sha: mergeSha } }), headSha);
  }
});

test("push CI selects its triggering SHA when pull-request context is absent", () => {
  const pushSha = "c".repeat(40);
  for (const expression of checkoutExpressions) {
    assert.equal(checkoutRef(expression, { github: { event: {}, sha: pushSha } }), pushSha);
  }
});


test("diagnostic dispatch excludes pilot and browser/recovery while the normal full-plus-pilot pair survives",()=>{
  const raw=readFileSync(join(process.cwd(),".github/workflows/ci.yml"),"utf8").replaceAll("\r\n","\n");
  const diagnostic=raw.slice(raw.indexOf("      - name: Calendar feed cause proof"),raw.indexOf("      # Stage 8:"));
  assert.ok(!diagnostic.includes("test:pilot-performance")); assert.ok(diagnostic.includes("with-calendar-feed-runtime.mjs cause-proof"));
  for(const name of ["e2e","recovery-storage-loader"])assert.ok(raw.includes("  "+name+":\n    if: \$\{\{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) \}\}".replaceAll("\\", "")));
  assert.match(ci,/pnpm run test:int[\s\S]*?pnpm run test:pilot-performance/);
  assert.throws(()=>projectCalendarFeedCiCommands(raw.replace('test "$RELEASE_VALIDATION" = false','test "$RELEASE_VALIDATION" = true')));
});


## Committed source context .github/workflows/ci.yml:1-310

1: name: CI
2: run-name: ${{ github.event_name == 'workflow_dispatch' && (inputs.calendar_feed_cause_proof && format('checkpoint:cause-proof:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha) || format('checkpoint:{0}:{1}', inputs.checkpoint_id, inputs.expected_sha)) || format('CI {0}', github.ref_name) }}
3: 
4: # Phase A verification gates (architecture §19).
5: # `verify` job — stages 1-5 + 10: install, lockfile guard, service-role containment
6: #   (source-level), typecheck, lint, unit tests, build, then the Story 2.4
7: #   AUTHORITATIVE built-bundle service-role containment grep over `.next` (runs
8: #   AFTER build — order is load-bearing).
9: # `db` job — stages 6 + 8 (ACTIVATED by Story 2.2): Supabase migration reset from
10: #   an EMPTY db, then the DB-backed integration + RLS-negative suites against the
11: #   LOCAL stack only — now including the Story 2.4 H4 RLS table-inventory gate that
12: #   fails CI when a tenant-owned table is not enrolled. See docs/quality/ci.md for
13: #   the gate-to-story mapping.
14: #
15: # Stop conditions honored: no secrets, no shared dev/staging/prod project, no
16: # deploy step. The `db` job uses the LOCAL Supabase CLI stack only (its keys are
17: # the universal local-demo defaults, not real secrets).
18: 
19: on:
20:   workflow_dispatch:
21:     inputs:
22:       calendar_feed_cause_proof:
23:         description: One diagnostic call and unmodified rollback-only baseline; zero acceptance
24:         type: boolean
25:         required: false
26:         default: false
27:       native_stream_probe:
28:         description: Data-free native stream diagnostic after general E2E completes
29:         type: boolean
30:         required: false
31:         default: false
32:       # FIXED-APPLICATION-INPUT-BEGIN
33:       fixed_chromium_application_verification:
34:         description: Isolated exact full158 application verification after original General
35:         type: boolean
36:         required: false
37:         default: false
38:       # FIXED-APPLICATION-INPUT-END
39:       # FIXED-CHROMIUM-INPUT-BEGIN
40:       fixed_chromium_paired_probe:
41:         description: Data-free exact full-Chrome 149/158 paired stream diagnostic
42:         type: boolean
43:         required: false
44:         default: false
45:       # FIXED-CHROMIUM-INPUT-END
46:       expected_sha:
47:         description: Exact full lowercase source commit; must equal the dispatched branch head
48:         type: string
49:         required: true
50:       checkpoint_id:
51:         description: Unique UUID generated and persisted by checkpoint-dispatch.mjs
52:         type: string
53:         required: true
54:       release_validation:
55:         description: Also run exhaustive browser and dashboard diagnostics
56:         type: boolean
57:         required: false
58:         default: false
59:   pull_request:
60:     # Verify the dependent Epic 11 repair PRs before their approved retarget to main.
61:     branches:
62:       - main
63:       - codex/story-11-3-invitation-identity-binding
64:       - codex/story-11-3-invitation-lifecycle
65:       - codex/story-11-3-auth-callback
66:   push:
67:     branches: [main]
68: 
69: # Least privilege: this verify-only pipeline only needs to read the repo.
70: permissions:
71:   contents: read
72: 
73: # Cancel superseded PR runs on the same ref so CI stays small and cheap.
74: # Only cancel for pull_request events — a push→main run is never cancelled, so
75: # the post-merge safety-net run always completes for every merged commit.
76: concurrency:
77:   group: ci-${{ github.event_name == 'workflow_dispatch' && inputs.checkpoint_id || github.ref }}
78:   cancel-in-progress: ${{ github.event_name == 'pull_request' }}
79: 
80: jobs:
81:   checkpoint-admission:
82:     runs-on: ubuntu-latest
83:     timeout-minutes: 2
84:     steps:
85:       - name: Bind dispatch to its immutable source revision
86:         env:
87:           EXPECTED_SHA: ${{ inputs.expected_sha }}
88:           CHECKPOINT_ID: ${{ inputs.checkpoint_id }}
89:           CAUSE_PROOF: ${{ inputs.calendar_feed_cause_proof || false }}
90:           RELEASE_VALIDATION: ${{ inputs.release_validation || false }}
91:           OTHER_DIAGNOSTICS: ${{ inputs.native_stream_probe || inputs.fixed_chromium_paired_probe || inputs.fixed_chromium_application_verification || false }}
92:         shell: bash
93:         run: |
94:           set -euo pipefail
95:           if [ "$CAUSE_PROOF" = true ]; then
96:             test "$GITHUB_EVENT_NAME" = workflow_dispatch
97:             test "$RELEASE_VALIDATION" = false
98:             test "$OTHER_DIAGNOSTICS" = false
99:           fi
100:           if [ "$GITHUB_EVENT_NAME" = workflow_dispatch ]; then
101:             [[ "$EXPECTED_SHA" =~ ^[a-f0-9]{40}$ ]]
102:             [[ "$CHECKPOINT_ID" =~ ^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$ ]]
103:             test "$EXPECTED_SHA" = "$GITHUB_SHA"
104:             test "$GITHUB_RUN_ATTEMPT" = 1
105:             test "$GITHUB_REF_TYPE" = branch
106:           fi
107:   verify:
108:     needs: [checkpoint-admission]
109:     runs-on: ubuntu-latest
110:     # Bound the job so a hung step (networked install, or the `next build`
111:     # Google-font fetch) fails fast instead of running to the 360-minute default.
112:     timeout-minutes: 30
113:     steps:
114:       - name: Checkout
115:         uses: actions/checkout@v4
116:         with:
117:           ref: ${{ github.event.pull_request.head.sha || github.sha }}
118:           persist-credentials: false
119: 
120:       # pnpm BEFORE setup-node: setup-node's `cache: pnpm` needs pnpm on PATH.
121:       # action-setup reads the version from package.json "packageManager"
122:       # (pnpm@10.24.0); do NOT also pass `version:` or it errors on conflict.
123:       - name: Install pnpm
124:         uses: pnpm/action-setup@v4
125: 
126:       - name: Setup Node
127:         uses: actions/setup-node@v4
128:         with:
129:           node-version-file: .nvmrc
130:           cache: pnpm
131: 
132:       - name: Setup Python for focused Auto-BMAD contracts
133:         uses: actions/setup-python@v5
134:         with:
135:           python-version: "3.12"
136: 
137:       - name: Install dependencies
138:         run: pnpm install --frozen-lockfile
139: 
140:       - name: Verify lockfiles (single package manager)
141:         run: pnpm run verify:lockfiles
142: 
143:       # Dependency vulnerability scan (BLOCKING) — closes the standing NFR
144:       # CONCERN carried Epics 2-5 (owner decision 2026-07-03: blocking gate).
145:       # Fails the build on HIGH/CRITICAL advisories against the installed tree;
146:       # moderate/low are reported in the log but do not block. NOTE: findings
147:       # arrive when the npm advisory DB updates, not when code changes — a red
148:       # run here on an untouched branch means a new upstream advisory, and the
149:       # fix is a dependency bump (or a documented, dated exception), never
150:       # weakening the threshold.
151:       - name: Audit dependencies (blocking, high severity)
152:         run: pnpm audit --audit-level=high
153: 
154:       - name: Verify service-role containment (no client-path leakage)
155:         run: pnpm run verify:service-role-containment
156: 
157:       - name: Typecheck
158:         run: pnpm typecheck
159: 
160:       - name: Lint
161:         run: pnpm lint
162: 
163:       - name: Unit tests (pure logic, node --test)
164:         # Ordinary progression has no separate execution stopwatch. The job
165:         # timeout bounds stalled runs without expiring approval or a checkpoint.
166:         run: pnpm run test:unit
167: 
168:       - name: BMAD focused concurrent memlog contracts
169:         run: pnpm run test:bmad-focused
170: 
171:       - name: Auto-BMAD focused routing and process-API contracts
172:         run: pnpm run test:auto-bmad-focused
173: 
174:       - name: Build
175:         run: pnpm build
176: 
177:       # Stage 10 (lightweight containment): the AUTHORITATIVE R-002 built-bundle
178:       # service-role grep (Story 2.4). MUST run AFTER `pnpm build` — it scans the
179:       # produced `.next/` payload and FAILS LOUD if `.next` is absent, so the order
180:       # is load-bearing (architecture §19; never reorder before build). This app
181:       # uses NO service-role key (anon + RLS), so a clean build yields zero hits.
182:       - name: Verify built-bundle service-role containment (no leakage in .next)
183:         run: pnpm run verify:bundle-containment
184: 
185:   # ──────────────────────────────────────────────────────────────────────────
186:   # Story 2.2 activates architecture §19 stage 6 (migration reset) + stage 8
187:   # (RLS-negative tests). Runs against the LOCAL Supabase CLI stack ONLY — never
188:   # a shared dev/staging/prod project. The local stack's keys are the universal
189:   # local-demo defaults (not real secrets), provided by `tests/support/test-env.ts`.
190:   # `SUPABASE_TEST_REQUIRED=1` makes a missing stack a HARD failure so this gate
191:   # can never silently false-green.
192:   # ──────────────────────────────────────────────────────────────────────────
193:   db:
194:     runs-on: ubuntu-latest
195:     timeout-minutes: 45
196:     # Gate the expensive ~20-min Supabase boot behind the fast `verify` job: if a
197:     # type/lint/unit error would fail `verify`, do NOT waste CI minutes spinning up
198:     # the local stack (review fix 2026-06-26).
199:     needs: [verify]
200:     env:
201:       SUPABASE_TEST_REQUIRED: "1"
202:     steps:
203:       - name: Checkout
204:         uses: actions/checkout@v4
205:         with:
206:           ref: ${{ github.event.pull_request.head.sha || github.sha }}
207:           persist-credentials: false
208: 
209:       - name: Install pnpm
210:         uses: pnpm/action-setup@v4
211: 
212:       - name: Setup Node
213:         uses: actions/setup-node@v4
214:         with:
215:           node-version-file: .nvmrc
216:           cache: pnpm
217: 
218:       - name: Install dependencies
219:         run: pnpm install --frozen-lockfile
220: 
221:       - name: Install Supabase CLI
222:         uses: supabase/setup-cli@v1
223:         with:
224:           # Pin an EXPLICIT CLI version — `latest` lets a Supabase release silently
225:           # change `db reset` behavior and break the gate non-deterministically
226:           # (review fix 2026-06-26). Matches the version used to author the stack.
227:           version: 2.115.0
228: 
229:       # Stage 6: empty DB → migrate → seed. `supabase start` boots the local stack
230:       # (Docker is available on ubuntu-latest); `db reset` then applies the
231:       # tenant_foundation migration from empty and runs seed.sql.
232:       - name: Start local Supabase stack
233:         run: supabase start
234: 
235:       - name: Migration reset (empty DB → migrate → seed)
236:         # Bounded retry (added 2026-07-26): `supabase db reset` intermittently fails with
237:         # "Error status 502: An invalid response was received from the upstream server" during its
238:         # FINAL "Restarting containers..." step — i.e. AFTER every migration applied and seed.sql ran.
239:         # After a non-zero exit, the bounded verifier accepts recovery ONLY when the exact repository
240:         # migration ledger, local seed fixtures, and auth health all prove completion. Otherwise the
241:         # idempotent reset is retried; a genuinely broken migration still reds the gate.
242:         run: |
243:           for attempt in 1 2 3; do
244:             echo "::group::supabase db reset (attempt $attempt/3)"
245:             if supabase db reset; then
246:               echo "::endgroup::"
247:               exit 0
248:             fi
249:             echo "::endgroup::"
250:             echo "db reset attempt $attempt failed"
251:             if node scripts/verify/check-local-supabase-reset.mjs; then
252:               echo "db reset completed; recovered from the CLI's final restart error"
253:               exit 0
254:             fi
255:             if [ "$attempt" -lt 3 ]; then
256:               sleep 15
257:             fi
258:           done
259:           echo "supabase db reset failed after 3 attempts — treating as a REAL failure"
260:           exit 1
261: 
262:       - name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)
263:         if: ${{ github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}
264:         env:
265:           CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}
266:           CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT: ${{ inputs.checkpoint_id }}
267:         run: node scripts/ci/with-calendar-feed-runtime.mjs cause-proof
268: 
269:       - name: Upload native calendar feed cause proof JSON
270:         if: ${{ !cancelled() && github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof }}
271:         uses: actions/upload-artifact@v4
272:         with:
273:           name: native-calendar-feed-cause-proof
274:           path: test-results/calendar-feed-cause-proof/upload/
275:           retention-days: 7
276:           if-no-files-found: error
277: 
278:       # Stage 8: DB-backed integration + cross-tenant RLS-negative suites.
279:       - name: Integration, RLS, and Epic 11 pilot performance gates (local stack)
280:         if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
281:         env:
282:           # This opt-in alone is insufficient: the wrapper also proves this
283:           # hosted job's fresh Docker identities, publications and current ledger.
284:           CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}
285:         run: |
286:           node scripts/ci/with-calendar-feed-runtime.mjs db
287:           pnpm run test:pilot-performance
288: 
289:       - name: Upload native full integration JSON
290:         if: ${{ !cancelled() && !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
291:         uses: actions/upload-artifact@v4
292:         with:
293:           name: native-full-integration
294:           path: test-results/full-integration.json
295:           retention-days: 7
296:           if-no-files-found: error
297: 
298:       - name: Stop local Supabase stack
299:         if: always()
300:         run: supabase stop
301: 
302:   # Synthetic, no-secret proof of the recovery Storage loader against the exact
303:   # pinned Compose Storage service. It derives a fresh schema-only source from
304:   # the local CI stack, restores it into a separate recovery volume, then proves
305:   # absent bytes can be materialized without changing protected logical rows.
306:   recovery-storage-loader:
307:     if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
308:     runs-on: ubuntu-latest
309:     timeout-minutes: 45
310:     needs: [verify]


## Committed source context .github/workflows/ci.yml:470-595

470:           rm -f ops/recovery/.env ops/recovery/.private.db-bootstrap.compose.yaml ops/recovery/.private.runtime.compose.yaml
471:   e2e:
472:     if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.calendar_feed_cause_proof) }}
473:     runs-on: ubuntu-latest
474:     timeout-minutes: 45
475:     # Same gate as `db`: only spin up the stack + browser after the fast `verify` job
476:     # is green. Runs in parallel with `db` (each boots its own local stack).
477:     needs: [verify]
478:     env:
479:       # Auth-mail E2E must fail loudly if its required local Auth/Mailpit stack is
480:       # unavailable; this matches the database integration gate.
481:       SUPABASE_TEST_REQUIRED: "1"
482:       # Booking fixture helpers also preview/sign inside the Playwright worker.
483:       # Match the existing local seed and webServer pair; these are synthetic
484:       # CI-only values, not a production fallback or browser-public credential.
485:       BOOKING_CONFLICT_ATTESTATION_KEY_ID: "test_v1"
486:       BOOKING_CONFLICT_ATTESTATION_HMAC_SECRET: "local-test-only-booking-conflict-attestation-secret-v1"
487:     steps:
488:       - name: Checkout
489:         uses: actions/checkout@v4
490:         with:
491:           ref: ${{ github.event.pull_request.head.sha || github.sha }}
492:           persist-credentials: false
493: 
494:       - name: Install pnpm
495:         uses: pnpm/action-setup@v4
496: 
497:       - name: Setup Node
498:         uses: actions/setup-node@v4
499:         with:
500:           node-version-file: .nvmrc
501:           cache: pnpm
502: 
503:       - name: Install dependencies
504:         run: pnpm install --frozen-lockfile
505: 
506:       - name: Install Playwright browser (chromium + OS deps)
507:         run: pnpm exec playwright install --with-deps chromium
508: 
509:       - name: Install Supabase CLI
510:         uses: supabase/setup-cli@v1
511:         with:
512:           # Pin the same explicit version as the `db` job (see its note).
513:           version: 2.115.0
514: 
515:       - name: Start local Supabase stack
516:         run: supabase start
517: 
518:       - name: Migration reset (empty DB → migrate → seed)
519:         # Bounded retry (added 2026-07-26): `supabase db reset` intermittently fails with
520:         # "Error status 502: An invalid response was received from the upstream server" during its
521:         # FINAL "Restarting containers..." step — i.e. AFTER every migration applied and seed.sql ran.
522:         # The same exact-ledger + seed + auth verifier used by `db` distinguishes completed recovery
523:         # from a real migration/seed failure before any retry or Playwright execution.
524:         run: |
525:           for attempt in 1 2 3; do
526:             echo "::group::supabase db reset (attempt $attempt/3)"
527:             if supabase db reset; then
528:               echo "::endgroup::"
529:               exit 0
530:             fi
531:             echo "::endgroup::"
532:             echo "db reset attempt $attempt failed"
533:             if node scripts/verify/check-local-supabase-reset.mjs; then
534:               echo "db reset completed; recovered from the CLI's final restart error"
535:               exit 0
536:             fi
537:             if [ "$attempt" -lt 3 ]; then
538:               sleep 15
539:             fi
540:           done
541:           echo "supabase db reset failed after 3 attempts — treating as a REAL failure"
542:           exit 1
543: 
544:       # The Playwright webServer builds + starts the app against the local stack
545:       # (NEXT_PUBLIC_* are inlined from playwright.config.ts), globalSetup seeds the
546:       # two-tenant fixture, and the specs drive the real browser journeys (G-2/G-3).
547:       - name: Essential authentication smoke (production app and local Auth)
548:         if: ${{ !(github.event_name == 'workflow_dispatch' && inputs.release_validation) }}
549:         env:
550:           PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json
551:           CALENDAR_FEED_CI_DISPOSABLE_STACK: ${{ github.run_id }}:${{ github.run_attempt }}:${{ github.job }}
552:         run: node scripts/ci/with-calendar-feed-runtime.mjs browser
553: 
554:       - name: Exhaustive browser validation (explicit opt-in)
555:         if: ${{ github.event_name == 'workflow_dispatch' && inputs.release_validation }}
556:         env:
557:           PLAYWRIGHT_JSON_OUTPUT_NAME: test-results/general-browser.json
558:         run: pnpm run test:e2e --reporter=list,json
559: 
560:       - name: Upload native general browser JSON
561:         if: ${{ !cancelled() }}
562:         uses: actions/upload-artifact@v4
563:         with:
564:           name: native-general-browser
565:           path: test-results/general-browser.json
566:           retention-days: 7
567:           if-no-files-found: error
568: 
569:       - name: Upload Playwright report
570:         if: ${{ !cancelled() }}
571:         uses: actions/upload-artifact@v4
572:         with:
573:           name: playwright-report
574:           path: playwright-report/
575:           retention-days: 7
576:           if-no-files-found: ignore
577: 
578:       - name: Stop local Supabase stack
579:         if: always()
580:         run: supabase stop
581: 
582:   # Broad UI diagnostics are deferred from ordinary progression by owner decision.
583:   # Explicit release validation retains the dedicated fixtures and real read proxy.
584:   dashboard-e2e:
585:     if: ${{ github.event_name == 'workflow_dispatch' && inputs.release_validation }}
586:     runs-on: ubuntu-latest
587:     timeout-minutes: 45
588:     # Same gate as `db`: only spin up the stack + browser after the fast `verify` job
589:     # is green. Runs in parallel with `db` (each boots its own local stack).
590:     needs: [verify]
591:     env:
592:       # Auth-mail E2E must fail loudly if its required local Auth/Mailpit stack is
593:       # unavailable; this matches the database integration gate.
594:       SUPABASE_TEST_REQUIRED: "1"
595:       E2E_PORT: "3201"


## Committed source context .github/workflows/ci.yml:675-810

675:           name: dashboard-playwright-report
676:           path: playwright-report/dashboard/
677:           retention-days: 7
678:           if-no-files-found: ignore
679: 
680:       - name: Stop local Supabase stack
681:         if: always()
682:         run: supabase stop
683: 
684:   # Optional synthetic transport experiment; original E2E artifacts finish first.
685:   native-stream-probe:
686:     runs-on: ubuntu-latest
687:     needs: [verify, e2e]
688:     timeout-minutes: 10
689:     if: ${{ always() && !cancelled() && github.event_name == 'workflow_dispatch' && inputs.native_stream_probe && needs.verify.result == 'success' && (needs.e2e.result == 'success' || needs.e2e.result == 'failure') }}
690:     steps:
691:       - name: Checkout
692:         timeout-minutes: 1
693:         uses: actions/checkout@v4
694:         with:
695:           ref: ${{ github.event.pull_request.head.sha || github.sha }}
696: 
697:       - name: Install pnpm
698:         timeout-minutes: 1
699:         uses: pnpm/action-setup@v4
700: 
701:       - name: Setup Node
702:         timeout-minutes: 1
703:         uses: actions/setup-node@v4
704:         with:
705:           node-version-file: .nvmrc
706:           cache: pnpm
707: 
708:       - name: Install dependencies
709:         timeout-minutes: 3
710:         run: pnpm install --frozen-lockfile
711: 
712:       - name: Install Playwright browser (chromium + OS deps)
713:         timeout-minutes: 2
714:         run: pnpm exec playwright install --with-deps chromium
715: 
716:       - name: Native stream diagnostic
717:         timeout-minutes: 2
718:         run: node tests/diagnostics/no-store-stream-probe.mjs
719: 
720:       - name: Upload native stream diagnostic
721:         timeout-minutes: 1
722:         if: ${{ always() && !cancelled() }}
723:         uses: actions/upload-artifact@v4
724:         with:
725:           name: native-stream-probe
726:           path: test-results/native-stream-probe.json
727:           retention-days: 7
728:           if-no-files-found: error
729: 
730:   # FIXED-CHROMIUM-JOB-BEGIN
731:   fixed-chromium-paired-probe:
732:     runs-on: ubuntu-latest
733:     needs: [verify, e2e]
734:     timeout-minutes: 18
735:     if: ${{ always() && !cancelled() && github.event_name == 'workflow_dispatch' && inputs.fixed_chromium_paired_probe && needs.verify.result == 'success' && (needs.e2e.result == 'success' || needs.e2e.result == 'failure') }}
736:     steps:
737:       - name: Checkout
738:         timeout-minutes: 1
739:         uses: actions/checkout@v4
740:         with:
741:           ref: ${{ github.event.pull_request.head.sha || github.sha }}
742: 
743:       - name: Install pnpm
744:         timeout-minutes: 1
745:         uses: pnpm/action-setup@v4
746: 
747:       - name: Setup Node
748:         timeout-minutes: 1
749:         uses: actions/setup-node@v4
750:         with:
751:           node-version-file: .nvmrc
752:           cache: pnpm
753: 
754:       - name: Install dependencies
755:         timeout-minutes: 3
756:         run: pnpm install --frozen-lockfile
757: 
758:       - name: Install pinned Playwright Chromium and OS dependencies
759:         timeout-minutes: 2
760:         run: pnpm exec playwright install --with-deps chromium
761: 
762:       - name: Acquire exact CfT and validate provenance
763:         id: fixed
764:         timeout-minutes: 3
765:         run: node tests/diagnostics/no-store-stream-probe.mjs --acquire-fixed-chromium
766: 
767:       - name: Publish fresh acquisition boundary authority
768:         id: receipt_publish
769:         timeout-minutes: 1
770:         if: ${{ always() && !cancelled() }}
771:         env:
772:           ACQUISITION_RECEIPT_DIRECTORY: ${{ steps.fixed.outputs.acquisition_receipt_directory }}
773:         run: node tests/diagnostics/no-store-stream-probe.mjs --publish-acquisition-receipt "$ACQUISITION_RECEIPT_DIRECTORY"
774: 
775:       - name: Paired native stream diagnostic
776:         timeout-minutes: 4
777:         env:
778:           FIXED_CHROMIUM_EXECUTABLE: ${{ steps.fixed.outputs.executable }}
779:         run: node tests/diagnostics/no-store-stream-probe.mjs --paired-fixed-chromium "$FIXED_CHROMIUM_EXECUTABLE"
780: 
781:       - name: Upload paired native stream diagnostic
782:         timeout-minutes: 1
783:         if: ${{ always() && !cancelled() }}
784:         uses: actions/upload-artifact@v4
785:         with:
786:           name: fixed-chromium-paired-probe
787:           path: test-results/fixed-chromium-paired-probe.json
788:           retention-days: 7
789:           if-no-files-found: error
790: 
791:       # ACQUISITION-UPLOADER-BEGIN
792:       - name: Upload fresh acquisition boundary receipt
793:         timeout-minutes: 1
794:         if: ${{ always() && !cancelled() && steps.receipt_publish.conclusion == 'success' && steps.receipt_publish.outputs.acquisition_receipt_written == 'true' }}
795:         uses: actions/upload-artifact@v4
796:         with:
797:           name: fixed-chromium-acquisition
798:           path: test-results/fixed-chromium-acquisition.json
799:           retention-days: 7
800:           if-no-files-found: error
801:       # ACQUISITION-UPLOADER-END
802:   # FIXED-CHROMIUM-JOB-END
803: 
804:   # FIXED-APPLICATION-JOB-BEGIN
805:   fixed-chromium-application-verification:
806:     runs-on: ubuntu-latest
807:     timeout-minutes: 25
808:     # Same gate as `db`: only spin up the stack + browser after the fast `verify` job
809:     # is green. Runs in parallel with `db` (each boots its own local stack).
810:     needs: [verify, e2e]


## Committed source context tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1-124

1: import assert from "node:assert/strict";
2: import { test } from "node:test";
3: import { createHash } from "node:crypto";
4: import { readFileSync } from "node:fs";
5: import * as nodeModule from "node:module";
6: import { EventEmitter } from "node:events";
7: import { mkdtemp, mkdir, writeFile, readFile, rm, stat } from "node:fs/promises";
8: import { join, resolve } from "node:path";
9: import { tmpdir } from "node:os";
10: import { pathToFileURL } from "node:url";
11: import { projectCalendarFeedCiCommands } from "../../../support/calendar-feed-ci-contract";
12: import { INTEGRATION_ARGS, BROWSER_ARGS, CAUSE_PROOF_ARGS, FEED_FUNCTIONS, validateAdmission, validateStackIdentity, validateCauseProofObservation, finishCauseProof, createCalendarFeedDatabaseClient, createTelemetryObserver, hasSensitiveOutput, createOwnedGroupStopper, ownsListenerRecord, waitForOwnedHttp, runCalendarFeedRuntime } from "../../../../scripts/ci/with-calendar-feed-runtime.mjs";
13: import { captureCalendarFeedTrace, recordCalendarFeedTrace, recordCalendarFeedContext, recordCalendarFeedMembership, executeCalendarFeed } from "../../../../src/server/commands/calendar-feed/calendar-feed-db";
14: import { CommandError } from "../../../../src/server/commands/command-errors";
15: import { validateCalendarFeedIntent } from "../../../../src/features/calendar-feed/validation";
16: 
17: const env = {
18:   NODE_ENV: "test" as const,
19:   CI: "true", GITHUB_ACTIONS: "true", RUNNER_ENVIRONMENT: "github-hosted", GITHUB_RUN_ID: "123", GITHUB_RUN_ATTEMPT: "1", GITHUB_JOB: "db",
20:   CALENDAR_FEED_CI_DISPOSABLE_STACK: "123:1:db",
21: };
22: const keyId = "f8c9b152-1e88-471a-82fa-d45a80394e40";
23: const keyUuid = "905a0de8-b110-4f89-9096-010db4c6ef12";
24: const status = { API_URL: "http://127.0.0.1:54321", DB_URL: "postgresql://postgres:postgres@127.0.0.1:54322/postgres", ANON_KEY: "test-anon", SERVICE_ROLE_KEY: "test-service" };
25: const migrations = [{ version: "20261020220000", name: "personal_calendar_feed" }];
26: function privacyRows(): Record<string, unknown>[] {
27:   return ["log_statement", "log_min_error_statement", "log_parameter_max_length", "log_parameter_max_length_on_error"].map(name => ({
28:     name, context: name === "log_parameter_max_length_on_error" ? "user" : "superuser", matches_required: true, can_set: false,
29:     session_is_postgres: false, current_is_postgres: false, same_identity: true,
30:     session_superuser: true, current_superuser: true, session_bypass_rls: true, current_bypass_rls: true,
31:   }));
32: }
33: function authorityRow(): Record<string, unknown> {
34:   return { session_is_setup_admin: true, current_is_setup_admin: true, same_identity: true,
35:     session_login: true, current_login: true, session_superuser: true, current_superuser: true };
36: }
37: const setupPassword = "PRIVATE fixture existing container credential";
38: 
39: test("CI command projection rejects entry and argv drift and cannot erase unrelated workflow or wrapper changes", () => {
40:   const workflow = readFileSync(new URL("../../../../.github/workflows/ci.yml", import.meta.url), "utf8").replaceAll("\r\n", "\n");
41:   const wrapper = readFileSync(new URL("../../../../scripts/ci/with-calendar-feed-runtime.mjs", import.meta.url), "utf8").replaceAll("\r\n", "\n");
42:   const projected = projectCalendarFeedCiCommands(workflow, wrapper);
43:   assert.ok(projected.includes("pnpm run test:int --reporter=default --reporter=github-actions --reporter=json --outputFile=test-results/full-integration.json"));
44:   assert.ok(projected.includes("run: pnpm run test:smoke"));
45:   for (const [before, after] of [
46:     ["node scripts/ci/with-calendar-feed-runtime.mjs db", "pnpm run test:int"],
47:     ["node scripts/ci/with-calendar-feed-runtime.mjs db", "node scripts/ci/with-calendar-feed-runtime.mjs browser"],
48:     ["node scripts/ci/with-calendar-feed-runtime.mjs browser", "pnpm run test:smoke"],
49:     ["node scripts/ci/with-calendar-feed-runtime.mjs browser", "node scripts/ci/with-calendar-feed-runtime.mjs browser --grep feed"],
50:     ["      - name: Essential authentication smoke (production app and local Auth)", "      - name: Changed smoke gate"],
51:   ]) {
52:     assert.ok(workflow.includes(before));
53:     assert.throws(() => projectCalendarFeedCiCommands(workflow.replace(before, after), wrapper), /exact workflow entry/);
54:   }
55:   assert.throws(() => projectCalendarFeedCiCommands(`${workflow}\nnode scripts/ci/with-calendar-feed-runtime.mjs db\n`, wrapper), /unexpected wrapper entry/);
56:   for (const [before, after] of [
57:     ['"run", "test:int"', '"run", "test:int:pilot"'],
58:     ['"--reporter=default", ', ""], ['"--reporter=github-actions", ', ""], ['"--reporter=json", ', ""],
59:     ['"--outputFile=test-results/full-integration.json"', '"--outputFile=test-results/foreign.json"'],
60:     ['"run", "test:smoke"', '"run", "test:e2e"'],
61:     ["export const BROWSER_ARGS", "const BROWSER_ARGS"],
62:   ]) {
63:     assert.ok(wrapper.includes(before));
64:     assert.throws(() => projectCalendarFeedCiCommands(workflow, wrapper.replace(before, after)), /declaration|argv/);
65:   }
66:   assert.throws(() => projectCalendarFeedCiCommands(workflow, `${wrapper}\n// unrelated source drift\n`), /reviewed wrapper source/);
67:   const inverseHash = (text: string) => createHash("sha256").update(text
68:     .replace(/      # FIXED-APPLICATION-INPUT-BEGIN\n[\s\S]*?      # FIXED-APPLICATION-INPUT-END\n/, "")
69:     .replace(/\n  # FIXED-APPLICATION-JOB-BEGIN\n[\s\S]*?  # FIXED-APPLICATION-JOB-END\n$/, "")).digest("hex");
70:   const originalHash = "48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0";
71:   assert.equal(inverseHash(projected), originalHash);
72:   const unrelated = projectCalendarFeedCiCommands(`# unrelated workflow drift\n${workflow}`, wrapper);
73:   assert.ok(unrelated.startsWith("# unrelated workflow drift\n"));
74:   assert.notEqual(inverseHash(unrelated), originalHash);
75: });
76: type Query = { sql: string; params?: unknown[] };
77: function harness(options: {
78:   query?: (call: Query) => { rows: Record<string, unknown>[] } | undefined;
79:   failChild?: number; failStops?: boolean; occupied?: boolean; readinessFailure?: boolean; signalAtCreate?: boolean; closeFailure?: boolean;
80:   forcedStop?: boolean;
81:   connectFailure?: unknown;
82: } = {}) {
83:   const events: string[] = [];
84:   const queries: Query[] = [];
85:   const launches: { command: string; args: string[]; childEnv: Record<string, string> }[] = [];
86:   let signal: () => void = () => undefined;
87:   const deps = {
88:     registerSignal(handler: () => void) { events.push("signals-registered"); signal = handler; return () => events.push("signals-unregistered"); },
89:     async qualify() { events.push("qualified"); return { status, migrations, stack: identity() }; },
90:     async portFree() { events.push("port-checked"); if (options.occupied) throw new Error("fixture occupied"); },
91:     connect() {
92:       events.push("client-created");
93:       return {
94:         async connect() { events.push("connected"); if (options.connectFailure !== undefined) throw options.connectFailure; },
95:         async query(sql: string, params?: unknown[]) {
96:           events.push(sql.startsWith("select vault.create_secret") ? "create" : sql.startsWith("delete") ? "delete" : sql);
97:           const call = { sql, params }; queries.push(call);
98:           const override = options.query?.(call); if (override) return override;
99:           if (sql.startsWith("select session_user='supabase_admin'")) return { rows: [authorityRow()] };
100:           if (sql.startsWith("with required(name,value)")) return { rows: privacyRows() };
101:           if (sql.includes("schema_migrations")) return { rows: migrations };
102:           if (sql.includes("from pg_proc")) return { rows: FEED_FUNCTIONS.map(() => ({ owner: "calendar_feed_owner", definer: true })) };
103:           if (sql.startsWith("select vault.create_secret")) { if (options.signalAtCreate) signal(); return { rows: [{ id: keyUuid }] }; }
104:           if (sql.startsWith("delete")) return { rows: [{ id: keyUuid }] };
105:           return { rows: [] };
106:         },
107:         async end() { events.push("db-closed"); if (options.closeFailure) throw new Error("fixture close"); },
108:       };
109:     },
110:     uuid: () => { events.push("key-id"); return keyId; }, entropy: () => { events.push("entropy"); return Buffer.alloc(32, 7); },
111:     async createTelemetry() { return { path: "/private/allowlisted.jsonl", persist: async () => undefined }; },
112:     launch(command: string, args: string[], childEnv: Record<string, string>) {
113:       const index = launches.length;
114:       launches.push({ command, args, childEnv }); events.push(`launch:${index}`);
115:       const isServer = args.includes("start");
116:       let finish: (result: { code: number; signal: null }) => void = () => undefined;
117:       const done = isServer ? new Promise<{ code: number; signal: null }>(resolve => { finish = resolve; }) : Promise.resolve({ code: options.failChild === index ? 17 : 0, signal: null });
118:       return { done, async stop() { events.push(`settled:${index}`); finish({ code: 0, signal: null }); if (options.failStops) throw new Error("fixture custody"); return { forced: options.forcedStop ?? false, signal: null }; } };
119:     },
120:     async ready() { events.push("ready"); if (options.readinessFailure) throw new Error("fixture readiness"); },
121:   };
122:   return { deps, events, queries, launches, signal: () => signal() };
123: }
124: async function runFixture(mode: string, h = harness()) {


## Committed source context tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:660-746

660:   await assert.rejects(calendarFixtureStep("bind-profile", () => { calls++; throw failure; }), /stage=bind-profile;category=undefined-table;sqlstate=42P01/);
661:   await assert.rejects(calendarFixtureStep("cleanup-absence-check", () => { calls++; return Promise.reject(failure); }), /stage=cleanup-absence-check;category=undefined-table/);
662:   assert.equal(calls, 3); assert.equal(payloadReads, 0);
663: });
664: 
665: test("actual fixture diagnostics keep upstream message-only replacement and swallowed outcomes explicitly unknown", async () => {
666:   const { calendarFixtureDiagnostic, calendarFixtureStep } = await actualFixtureDiagnostics();
667:   // Canonical createTenant/createAuthUser/sign-in/deleteAuthUser copy message,
668:   // not code. The owned catch cannot reconstruct it from message or cause.
669:   const messageOnly = Object.assign(new Error("PRIVATE canonical 42501"), { cause: { code: "42501" } });
670:   const first = calendarFixtureDiagnostic("booking-fixture-before-callback", messageOnly);
671:   assert.equal(first.message, "Calendar fixture failure [stage=booking-fixture-before-callback;category=unknown;sqlstate=unavailable]");
672:   const finalReplacement = await calendarFixtureStep("owned-row-cleanup", async () => {
673:     try { throw { code: "23503" }; } finally { throw new Error("PRIVATE DISCARD replacement"); }
674:   }).catch(error => error as Error);
675:   assert.match(finalReplacement.message, /stage=owned-row-cleanup;category=unknown/);
676:   assert.ok(!fixtureFailureMessages(finalReplacement).some(message => message.includes("23503")));
677:   // A canonical best-effort warning is not a rejected outcome at the owned catch.
678:   const noFailure = await calendarFixtureStep("canonical-fixture-cleanup", () => "completed-without-owned-rejection");
679:   assert.equal(noFailure, "completed-without-owned-rejection");
680: });
681: 
682: test("actual fixture pre-callback coarse stage and fine owned stages survive outer aggregation without invented substage", async () => {
683:   const { calendarFixtureDiagnostic } = await actualFixtureDiagnostics();
684:   const coarse = calendarFixtureDiagnostic("booking-fixture-before-callback", { code: "23514" });
685:   const own = calendarFixtureDiagnostic("additional-users", { code: "23505" });
686:   const cleanup = calendarFixtureDiagnostic("additional-auth-cleanup", new Error("PRIVATE already erased"));
687:   const aggregate = calendarFixtureDiagnostic("scenario", new AggregateError([coarse, own, cleanup], "PRIVATE"));
688:   const messages = fixtureFailureMessages(aggregate);
689:   assert.match(messages[1], /stage=booking-fixture-before-callback;category=check-constraint/);
690:   assert.match(messages[2], /stage=additional-users;category=unique-conflict/);
691:   assert.match(messages[3], /stage=additional-auth-cleanup;category=unknown/);
692: });
693: 
694: let installedFailureTransport: Promise<(error: unknown) => Promise<{ numFailedTests: number; testResults: { assertionResults: { failureMessages: string[] }[] }[] }>> | undefined;
695: function actualInstalledFailureTransport() {
696:   installedFailureTransport ??= (async () => {
697:     const require = nodeModule.createRequire(import.meta.url);
698:     const fromVitest = nodeModule.createRequire(require.resolve("vitest/package.json"));
699:     const runnerEntry = pathToFileURL(fromVitest.resolve("@vitest/runner"));
700:     const runnerSource = readFileSync(new URL("./chunk-artifact.js", runnerEntry), "utf8");
701:     const start = "function failTask(result, err, diffOptions) {", end = "function markTasksAsSkipped(";
702:     assert.equal(runnerSource.split(start).length, 2); assert.equal(runnerSource.split(end).length, 2);
703:     const actualFailTask = runnerSource.slice(runnerSource.indexOf(start), runnerSource.indexOf(end));
704:     const { processError } = await import(pathToFileURL(fromVitest.resolve("@vitest/utils/error")).href);
705:     // Execute the exact installed body. These two control-error classes are not
706:     // used by our AggregateError inputs; processError is the actual installation.
707:     const failTask = new Function("PendingError", "TestRunAbortError", "processError", `${actualFailTask}\nreturn failTask;`)(class {}, class {}, processError) as
708:       (result: { state: string; errors?: unknown[] }, error: unknown) => void;
709:     const { JsonReporter } = await import("vitest/node");
710:     return async error => {
711:       const result: { state: string; errors?: unknown[] } = { state: "run" }; failTask(result, error);
712:       const file = { type: "suite", name: "fixture transport", filepath: "fixture-transport.test.ts", tasks: [] as unknown[], result: { state: "fail" } };
713:       file.tasks.push({ type: "test", name: "one failing fixture", suite: file, result, meta: {}, mode: "run" });
714:       const output: string[] = [];
715:       const reporter = new JsonReporter({});
716:       // No runner/start/collection, output file or service: the public reporter
717:       // writes its real JSON into this in-memory logger using a synthetic task.
718:       reporter.onInit({ config: {}, snapshot: { summary: {} }, logger: { log(value: string) { output.push(value); }, warn() { throw Error("Unexpected reporter warning"); } } } as never);
719:       await reporter.onTestRunEnd([{ task: file }] as never);
720:       assert.equal(output.length, 1); return JSON.parse(output[0]);
721:     };
722:   })();
723:   return installedFailureTransport;
724: }
725: 
726: async function actualFixtureOrigins() {
727:     const source = readFileSync(new URL("../../../support/calendar-feed-atdd.ts", import.meta.url), "utf8");
728:     const between = (start: string, end: string) => {
729:       assert.equal(source.split(start).length, 2); assert.equal(source.split(end).length, 2);
730:       return source.slice(source.indexOf(start), source.indexOf(end));
731:     };
732:     const pure = between("// Pure fixture diagnostics:", "// End pure fixture diagnostics.");
733:     const matcher = between("function redactMatchers", "export const expectCalendar");
734:     const guards = source.slice(source.indexOf("export function tokenFromUrl"));
735:     assert.equal(source.split("export function tokenFromUrl").length, 2);
736:     const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
737:     return import(`data:text/javascript;base64,${Buffer.from(strip(`${pure}\n${matcher}\n${guards}\nexport { redactMatchers };`)).toString("base64")}`);
738: }
739: 
740: async function actualFirstCalendarCase(path: string, dependencies: Record<string, unknown>) {
741:   const source = readFileSync(new URL(path, import.meta.url), "utf8").replaceAll("\r\n", "\n");
742:   const start = source.indexOf('  test("[P0] 15.5-'); assert.ok(start >= 0);
743:   const end = source.indexOf("\n  });", start); assert.ok(end > start);
744:   const strip = (nodeModule as unknown as { stripTypeScriptTypes(source: string): string }).stripTypeScriptTypes;
745:   let callback: (() => Promise<void>) | undefined;
746:   new Function("test", ...Object.keys(dependencies), strip(source.slice(start, end + "\n  });".length)))(


## Committed source context tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1355-1466

1355: const diagnosticEnv={...env,GITHUB_SHA:"a".repeat(40),GITHUB_EVENT_NAME:"workflow_dispatch",CALENDAR_FEED_CAUSE_PROOF_CHECKPOINT:keyId};
1356: const observation=()=>({kind:"calendar_feed.cause_proof",mode:"cause-proof",outcome:"AMBIGUOUS_SQL42501",events:["execute-enter","context-match","status-rpc42501"],baseline:"status",sqlState:"42501",cleanupVerified:true,ordinarySettled:true,queriesSettled:true,failures:[]});
1357: const traceExpected={tenantId:"owned-tenant",userId:"owned-user",membershipId:"owned-member",attemptId:"owned-attempt",action:"create",revision:0};
1358: test("actual per-invocation trace preserves once-call value and error identity and isolates concurrent and nested scopes",async()=>{
1359:   const value={},failure={private:"PRIVATE"};let calls=0;
1360:   const result=await captureCalendarFeedTrace(traceExpected,async()=>{calls++;recordCalendarFeedContext("owned-tenant","owned-user",{action:"create",revision:0,attemptId:"owned-attempt"});recordCalendarFeedMembership("owned-member");return value;});
1361:   assert.equal(calls,1);assert.equal(result.ok&&result.value,value);assert.deepEqual(result.events,["context-match","membership-match"]);
1362:   const bad=await captureCalendarFeedTrace(traceExpected,async()=>{throw failure;});assert.equal(!bad.ok&&bad.error,failure);
1363:   const [a,b]=await Promise.all([captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("status-enter");await Promise.resolve();recordCalendarFeedTrace("status-valid");}),captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("manage-enter");})]);
1364:   assert.deepEqual(a.events,["status-enter","status-valid"]);assert.deepEqual(b.events,["manage-enter"]);
1365:   const outer=await captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("execute-enter");const inner=await captureCalendarFeedTrace(traceExpected,async()=>{recordCalendarFeedTrace("status-enter");});assert.deepEqual(inner.events,["status-enter"]);recordCalendarFeedTrace("key-ready");});assert.deepEqual(outer.events,["execute-enter","key-ready"]);
1366:   recordCalendarFeedTrace("status-enter");assert.deepEqual((await captureCalendarFeedTrace(traceExpected,async()=>{})).events,[]);
1367: });
1368: test("actual trace bounds hostile expected getters and event overflow without serializing values",async()=>{
1369:   let getters=0,run=0;const bad=Object.defineProperty({...traceExpected},"tenantId",{get(){getters++;throw Error("PRIVATE");}});
1370:   await assert.rejects(captureCalendarFeedTrace(bad,async()=>{run++;}),/expected-context refused/);assert.equal(getters,0);assert.equal(run,0);
1371:   const result=await captureCalendarFeedTrace(traceExpected,async()=>{for(let i=0;i<40;i++)recordCalendarFeedTrace("status-enter");});assert.equal(result.events.length,16);assert.equal(result.events[15],"truncated");assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));
1372: });
1373: test("actual management adapter records each existing error branch after one original RPC await",async()=>{
1374:   for(const [code,event]of [["42501","manage-rpc42501"],["CF409","manage-rpcCF409"],["unknown","manage-rpc-error"]] as const){let calls=0;const args={private:"PRIVATE"};const client={rpc:async(name:string,received:unknown)=>{calls++;assert.equal(name,"manage_calendar_feed");assert.equal(received,args);return{data:null,error:{code}};}};
1375:     const result=await captureCalendarFeedTrace(traceExpected,()=>executeCalendarFeed(client as never,args));assert.equal(result.ok,false);assert.equal(calls,1);assert.deepEqual(result.events,[event]);assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));
1376:   }
1377:   const result=await captureCalendarFeedTrace(traceExpected,()=>executeCalendarFeed({rpc:async()=>({data:{outcome:"committed",revision:1},error:null})} as never,{}));assert.equal(result.ok&&result.value.revision,1);assert.deepEqual(result.events,["manage-valid"]);
1378: });
1379: test("actual baseline decision chooses one observed boundary only and pg timeout is not protocol settlement",async()=>{
1380:   const seams=await actualFixtureOrigins();
1381:   assert.equal(seams.calendarCauseProofSelection(["context-match","status-rpc42501"]),"status");
1382:   assert.equal(seams.calendarCauseProofSelection(["context-match","membership-match","manage-rpc42501"]),"manage");
1383:   for(const events of [["status-rpc42501"],["context-match","membership-mismatch","manage-rpc42501"],["context-match","status-rpc42501","truncated"],["context-match","status-rpc-error"]])assert.equal(seams.calendarCauseProofSelection(events),"not-selected");
1384:   let now=0;const client={readyForQuery:false};assert.equal(await seams.calendarCauseProofIdle(client,()=>now,async()=>{now+=1000;}),false);
1385:   now=0;assert.equal(await seams.calendarCauseProofIdle(client,()=>now,async()=>{now+=1000;if(now===3000)client.readyForQuery=true;}),true);
1386: });
1387: test("cause-proof launches only fixed one-case argv and joins diagnostic work before exact key deletion",async()=>{
1388:   const h=harness();let verified=false,finished=false;
1389:   const result=await runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},readDiagnostic:async()=>{verified=true;return observation();},finishDiagnostic:async(receipt:{keyDeleted:boolean})=>{assert.equal(verified,true);assert.equal(receipt.keyDeleted,true);finished=true;return true;}});
1390:   assert.equal(result.exitCode,0);assert.equal(h.launches.length,1);assert.equal(h.launches[0].command,"pnpm");assert.deepEqual(h.launches[0].args,CAUSE_PROOF_ARGS);assert.equal(h.launches[0].childEnv.CALENDAR_FEED_CAUSE_PROOF_MODE,"1");assert.ok(!h.events.includes("ready"));assert.ok(!h.events.includes("port-checked"));assert.equal(finished,true);assert.ok(h.events.indexOf("settled:0")<h.events.indexOf("delete"));
1391: });
1392: test("abnormal or unverified diagnostic work retains key custody and never infers cleanup from child exit",async()=>{
1393:   for(const failChild of [true,false]){const h=harness(failChild?{failChild:0}:{});const result=await runCalendarFeedRuntime({mode:"cause-proof",env:diagnosticEnv,platform:"linux"},{...h.deps,prepareDiagnostic:async()=>{},readDiagnostic:async()=>{throw Error("PRIVATE pending work");},finishDiagnostic:async()=>true});assert.equal(result.exitCode,1);assert.equal(result.receipt.keyDeleted,false);assert.ok(result.receipt.custody);assert.ok(!h.events.includes("delete"));assert.ok(!JSON.stringify(result.receipt).includes("PRIVATE"));}
1394:   const h=harness();const result=await runCalendarFeedRuntime({mode:"cause-proof",env:{...diagnosticEnv,GITHUB_RUN_ATTEMPT:"2",CALENDAR_FEED_CI_DISPOSABLE_STACK:"123:2:db"},platform:"linux"},h.deps);assert.equal(result.exitCode,1);assert.equal(h.launches.length,0);assert.ok(!h.events.includes("entropy"));
1395: });
1396: test("diagnostic wire schema refuses pending cleanup unknown fields values and getters without raw output",()=>{
1397:   assert.equal(validateCauseProofObservation(observation()).outcome,"AMBIGUOUS_SQL42501");
1398:   for(const change of [{cleanupVerified:false},{ordinarySettled:false},{queriesSettled:false},{events:["PRIVATE secret"]},{sqlState:"PRIVATE"},{extra:"PRIVATE"},{failures:["PRIVATE"]}])assert.throws(()=>validateCauseProofObservation({...observation(),...change}),/diagnostic-/);
1399:   let gets=0;const hostile=Object.defineProperty(observation(),"outcome",{get(){gets++;throw Error("PRIVATE");}});assert.throws(()=>validateCauseProofObservation(hostile),/diagnostic-observation-refused/);assert.equal(gets,0);
1400:   const cycle=observation() as unknown as {events:unknown[]};cycle.events=[cycle];assert.throws(()=>validateCauseProofObservation(cycle),/diagnostic-observation-refused/);
1401: });
1402: 
1403: 
1404: test("actual installed failed native report and closed observation upload distinctly without publishing custody handles",async()=>{
1405:   const folder=await mkdtemp(join(tmpdir(),"calendar-report-control-")), reports=join(folder,"test-results/calendar-feed-cause-proof");
1406:   try{
1407:     await mkdir(reports,{recursive:true}); const report=await actualInstalledFailureTransport();
1408:     const native=await report(new Error("Fixed diagnostic failure; values redacted"));
1409:     await writeFile(join(reports,"native.json"),JSON.stringify(native));await writeFile(join(reports,"observation.json"),JSON.stringify(observation()));
1410:     const receipt={childExitCodes:[1],keyDeleted:false,dbClosed:true,custody:{ownedName:"PRIVATE custody",vaultUuid:"PRIVATE UUID"},failures:["child-failed"]};
1411:     assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"private-key",secret:"private-secret"}),true);
1412:     assert.equal((JSON.parse(await readFile(join(reports,"upload/native.json"),"utf8")) as {numFailedTests:number}).numFailedTests,1);
1413:     const metadata=await readFile(join(reports,"upload/receipt.json"),"utf8");assert.ok(!metadata.includes("PRIVATE"));assert.equal(JSON.parse(metadata).evidenceClass,"diagnostic-only");assert.equal(JSON.parse(metadata).custodyRetained,true);
1414:   }finally{assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\" ) || resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
1415: });
1416: test("diagnostic missing or sensitive native reports fail capture and never enter the upload tree",async()=>{
1417:   const folder=await mkdtemp(join(tmpdir(),"calendar-report-negative-")), reports=join(folder,"test-results/calendar-feed-cause-proof");
1418:   try{
1419:     await mkdir(reports,{recursive:true});await writeFile(join(reports,"observation.json"),JSON.stringify(observation()));
1420:     const receipt={childExitCodes:[0],keyDeleted:true,dbClosed:true,custody:null,failures:[]};
1421:     assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
1422:     await writeFile(join(reports,"native.json"),JSON.stringify({numTotalTests:1,numPendingTests:0,numFailedTests:0,numPassedTests:1,private:"PRIVATE sensitive"}));
1423:     assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
1424:     await assert.rejects(stat(join(reports,"upload/native.json")));
1425:     assert.ok(!(await readFile(join(reports,"upload/manifest.json"),"utf8")).includes("PRIVATE"));
1426:     await writeFile(join(reports,"native.json"),JSON.stringify({numTotalTests:16,numPendingTests:15,numFailedTests:0,numPassedTests:1}));
1427:     assert.equal(await finishCauseProof(folder,diagnosticEnv,receipt,async()=>{}, {keyId:"key",secret:"PRIVATE sensitive"}),false);
1428:     await assert.rejects(stat(join(reports,"upload/native.json")));
1429:   }finally{assert.ok(resolve(folder).startsWith(resolve(tmpdir())+"\\") || resolve(folder).startsWith(resolve(tmpdir())+"/"));await rm(folder,{recursive:true,force:true});}
1430: });
1431: 
1432: 
1433: function actualFeedRegion(path: string, start: string, end: string | undefined, exported: string, dependencies: Record<string, unknown>) {
1434:   const source=readFileSync(new URL(path,import.meta.url),"utf8").replaceAll("\r\n","\n");
1435:   assert.equal(source.split(start).length,2);if(end)assert.equal(source.split(end).length,2);
1436:   const region=source.slice(source.indexOf(start),end?source.indexOf(end):undefined).replace(/^export /gm,"");
1437:   const strip=(nodeModule as unknown as {stripTypeScriptTypes(source:string):string}).stripTypeScriptTypes;
1438:   return new Function(...Object.keys(dependencies),strip(region)+"\nreturn "+exported+";")(...Object.values(dependencies));
1439: }
1440: test("actual status mapper distinguishes existing RPC and schema erasure after one await without exposing native error fields",async()=>{
1441:   const status=actualFeedRegion("../../../../src/server/read-models/calendar-feed.ts","export async function readCalendarFeedStatus","export async function readCalendarFeedSettings","readCalendarFeedStatus",{recordCalendarFeedTrace,CommandError});
1442:   for(const [reply,event]of [[{data:null,error:{code:"42501",detail:"PRIVATE"}},"status-rpc42501"],[{data:null,error:{code:"other",message:"PRIVATE"}},"status-rpc-error"],[{data:{active:"PRIVATE"},error:null},"status-schema-invalid"]] as const){let calls=0;const result=await captureCalendarFeedTrace(traceExpected,()=>status({rpc:async()=>{calls++;return reply;}},"owned-tenant","owned-attempt"));assert.equal(calls,1);assert.equal(result.ok,false);assert.deepEqual(result.events,[event]);assert.ok(!JSON.stringify(result.events).includes("PRIVATE"));}
1443: });
1444: test("actual management dispatcher keeps literal commands and unchanged stable outcomes while observing the closed envelope result once",async()=>{
1445:   for(const code of ["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","PERMISSION_DENIED","VALIDATION_FAILED","TENANT_ACCESS_DENIED","COMMAND_CONFLICT","SERVER_ERROR"]){let calls=0;
1446:     const manage=actualFeedRegion("../../../../src/server/commands/calendar-feed/manage-calendar-feed.ts","function calendarFeedConfig",undefined,"manageCalendarFeed",{
1447:       validateCalendarFeedIntent,defineCommand:(config:unknown)=>config,runCommand:async()=>{calls++;return{ok:false,code};},recordCalendarFeedTrace,recordCalendarFeedContext,recordCalendarFeedMembership,
1448:       feedKeyFromEnv:()=>{throw Error("Unexpected execute");},readCalendarFeedStatus:()=>{throw Error("Unexpected status");},executeCalendarFeed,FEED_SCHEMA:"fixed",MANAGE_DOMAIN:"fixed",issueCalendarFeedToken:()=>{},signFeedProof:()=>{}
1449:     });
1450:     const result=await captureCalendarFeedTrace(traceExpected,()=>manage({}, {action:"create",revision:0,attemptId:keyId}));assert.equal(calls,1);assert.deepEqual(result.events,["envelope-"+code]);
1451:     assert.equal(result.ok&&(result.value as {outcome:string}).outcome,code==="COMMAND_CONFLICT"?"conflict":code==="SERVER_ERROR"?"unavailable":"denied");
1452:   }
1453: });
1454: 
1455: 
1456: test("actual source registration guards isolate the one diagnostic declaration and preserve the fifteen normal command cases",async()=>{
1457:   const ts=await import("typescript");const source=readFileSync(new URL("../../../integration/commands/calendar-feed.int.test.ts",import.meta.url),"utf8");
1458:   const ast=ts.createSourceFile("calendar-feed.int.test.ts",source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TS);
1459:   const guards=ast.statements.filter(ts.isIfStatement);assert.equal(guards.length,2);
1460:   const evaluate=(index:number,mode:string|undefined)=>new Function("process","return ("+guards[index].expression.getText(ast)+");")({env:{CALENDAR_FEED_CAUSE_PROOF_MODE:mode}});
1461:   assert.equal(evaluate(0,"1"),true);assert.equal(evaluate(1,"1"),false);
1462:   for(const mode of [undefined,"0","other"]){assert.equal(evaluate(0,mode),false);assert.equal(evaluate(1,mode),true);}
1463:   const names=(node:import("typescript").Node)=>{const ids:string[]=[];function walk(child:import("typescript").Node){if(ts.isCallExpression(child)&&child.expression.getText(ast)==="test"&&ts.isStringLiteral(child.arguments[0]))ids.push(child.arguments[0].text);ts.forEachChild(child,walk);}walk(node);return ids;};
1464:   assert.deepEqual(names(guards[0].thenStatement),["15.5-DIAG001"]);assert.equal(names(guards[1].thenStatement).length,15);assert.ok(names(guards[1].thenStatement).every(name=>name.includes("15.5-INT")));
1465: });
1466: 


## Approved unchanged intent

<intent-contract>

## Intent

**Problem:** Users cannot subscribe to their own current bookings from an external calendar or safely manage that read capability. Public disclosure must remain limited to the exact subject and survive immediate rotation/revocation and abuse controls.

**Approach:** Add authenticated self-service Kalenderprenumeration and one isolated live iCalendar GET capability, backed by hashed random tokens, atomic audited lifecycle, a dedicated minimal own-booking projection and independent database token/IP limits with sanitized Admin monitoring. Keep validation, lifecycle state/actions and serialization separate from replaceable UI.

## Boundaries & Constraints

**Always:** FR91/NFR46/AC-B1b-7 and accepted inline ADR-B004 govern. Generate 32 CSPRNG bytes server-side as base64url; persist only SHA-256, bind to exact tenant/current membership and keep at most one active generation. Management uses current authenticated Bookings.View self authority, checked SQL, expected revision/attempt and atomic audit; no manager/peer elevation. Fetch derives tenant/subject solely from the token, requires the tenant row to exist, the exact token-bound/current self membership status to be active and its current Bookings.View role union to allow access, plus unarchived own profile/assignment, returns each current materialized planned own booking once and only minimal times/title/job/customer label/location. No profile means an empty valid calendar, no team fallback. Rotate/revoke serialize with fetch authority; no post-revocation new request succeeds. Lost issued responses reconcile metadata then require explicit new rotation because plaintext is unrecoverable. Enforce independently atomic per-token and cross-token per-IP-hash 900-second budgets 60/120, uniform invalid-token responses,429/Retry-After, no shared cache or auth shell/session dependency. Dedicated server-only feed proof binds canonical trusted IP/hash and lifecycle inputs to prevent direct-RPC spoof/weak chosen-hash bypass; no service role. All new tenant objects/public surface enroll coherently in manifest/H4/ACL tests. Connected settings works by keyboard and 360×640; success follows confirmed persistence only. Full ADR-B004 abuse suite is required before ship.

**Block If:** Root has not independently validated/frozen this candidate and admitted ATDD/build; Coordinator has not allocated the exact shared deltas, fresh combined migration chronology/reservation and isolated mutable fixtures/resources; or actual implementation exposes a material authorization/data-integrity/product ambiguity outside these approved/default decisions. Hosted feed enablement additionally requires release operator's separately authorized dedicated key/Vault/runtime and trusted-IP evidence. These are later execution/release prerequisites, not missing planning intent. After two failed attempts choose a simpler safe authorized route or retain named owner/evidence/next action/resume condition.

**Never:** Store/recover/log/audit/cache raw URL/token/proof/key/IP; use UUID/identity-derived tokens; trust tenant/subject overrides, arbitrary forwarded IPs, unsigned direct RPC arguments or manager-wide scheduling reads. No cookie/session/tenant-context/nav dependency in public feed path, no broad anon table grants, service role, arbitrary projection, privileged mutation or fourth public surface. No money, co-assignee/peer details, contacts/notes, tenant enumeration, portal/customer login/signing, AI/optimization, offline/PWA/queue/sync, new job/economy/payroll/email/provider surface or general legal/retention program. Preserve15.1–15.4 booking/series/resolver/time-report invariants and E16 actual claims; no absent unreviewed imports or permanent v3 assumption. This planning run edits only this spec/new15.5 preparation: no app/schema/tests/scaffolds/dependencies/env/runtime/CI/foreign checkout/state/sprint/Git commit/push/PR/merge/deploy/secrets changes or legacy URL/browsing/evidence.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
| --- | --- | --- | --- |
| Own issuance | Active authorized subject creates or rotates with current revision/attempt | Fresh 43-character 32-byte capability URL once; hash-only generation and audit commit together; rotate revokes old | Invalid/stale/foreign/inactive action generic denial; audit failure rolls back all |
| Unknown issued result | Commit response lost, retry or concurrent create/rotate/revoke | Sanitized attempt/revision reconciliation; no duplicate mutation/audit or plaintext recovery; explicit separate rotation recovers a lost link | UI pending/uncertain state and explicit retry; never claim success without confirmation |
| Live valid feed | Own/shared/recurring/edited/moved/all-day/DST booking data | Complete minimal own planned events; stable booking UID; current exceptions; cancelled/reassigned/archived-profile rows omitted | Current role/membership/token invalidation gives generic inactive; database failure503, never partial/empty success |
| Abuse and forgery | Invalid token classes, multiple tokens/IPs, concurrent requests, forged proof/IP/hash | Independent database windows/counters; common invalid404; shared-IP429 or active-token429 with Retry-After; sanitized Admin spike summary | Missing/expired/wrong-domain proof denied, no broad lookup; missing IP uses shared unknown bucket |
| Public isolation | No cookies, hostile cookies/headers/query tenant overrides, cache validators | Only capability controls own projection; no auth refresh, shell, session, cache reuse, redirects or cookies | No secret/tenant/subject oracle; invalid classes have identical response contract under equal IP history |

</intent-contract>

## Full current staged author trail and single Suggested Review Order

## Staged denial cause-proof implementation — unexecuted diagnostic lane

Root admitted exact revision1 hunks in14 paths through
`accepted-native-denial-cause-proof-allocation.json` (5006B,
SHA256 `99bcc94753e87bb3efcf7fec730c88da4059ca450a4548286f47dbf20fdc63d3`).
The dispatcher is the sole addition to the previous69-source inventory (now70).
Historical109 SQL/protected37 consumers and every previous failure/capsule remain
unchanged. The approved intent contract is unchanged; status stays in-review.
The author recorded Sol6.1 High implementation under Root's admitted route;
independent committed latest-delta High review is pending, within the completed
three-round cap. This source grant launches no service, probe or CI run.

The minimal route follows the independently challenged staged design: ONE real
own-subject JWT management call with closed scoped branch observations, then at
most ONE corresponding ORIGINAL status or management function in a restricted,
rollback-only controlled SQL baseline. Normal calls have no trace store or log;
no generic client/RPC/thenable observation or public DTO change is introduced.
The scoped context closes and clears expected private identifiers after the real
command promise settles. The existing public-fetch pending set is not used as
proof that this command or a PostgreSQL query has ended. The dedicated baseline
checks the installed pg protocol ReadyForQuery boundary; timeout rejection alone
is insufficient. Unverified references retain fixture/key custody. This path
composes the canonical role fixture directly so an unconditional booking-fixture
finally cannot delete rows/Auth against outstanding diagnostic work.

The baseline keeps original function OIDs/source/owners/ACL and claims only a NEW
controlled direct-SQL result. Its original setup session is independently
qualified SupAdmin LOGIN+SUPER with all four effective privacy controls. The
same client changes only transaction-local session authorization/owned claims,
then proves restricted session=current authenticated/nonSUPER/nonBYPASS/owned
identity and privacy immediately before its single original-function call.
There is no function replacement/clone/role DDL/grant/fault DDL/Vault probe/new
endpoint. Full rollback precedes identity recovery, and independently qualified
fresh source/owned-state verification precedes normal fixture cleanup. Every
reaching primary/cleanup failure has a closed retained stage; inherited upstream
factory best-effort cleanup/message replacement remains outside that guarantee.

42501 remains AMBIGUOUS_SQL42501; engine errors, context/state/clock mismatch,
nonreproduction and cleanup uncertainty stop with named UNKNOWN/custody. No SQL
engine phase or historical JWT session/snapshot/proof equivalence is invented.
The current43 DB causes and14 browser failures are not fixed by this code. RLS010
later ACL predicates, API019 later telemetry checks and browser contentNULL privacy
remain uncredited. No automatic next probe or opaque full-suite retry is added.

The actual dispatcher persists diagnostic mode/SHA/nonce before its only POST,
uses a distinct title/status and preserves old normal/release records. It refuses
new diagnostic dispatch unless both hosted candidate/default workflow definitions
prove the supported exact input/admission contract. Root private-qualifier
adoption, availability, producer review/freeze and pushed-head prerequisites are
external gates, not proved by an environment flag. No default-branch update,
merge, provider mutation or alternate dispatch is authorized. A diagnostic run
has zero acceptance even if its selected jobs succeed. Normal full DB+pilot,
browser/recovery/release commands and the original inverse hash are preserved.
Only mode-bound, privacy-validated report copies enter the diagnostic upload tree;
unsafe originals are not deleted or uploaded. Failed native cases may upload
safe actual JSON; missing reports/refused content retain capture failure. Private
key custody identifiers are excluded from that artifact receipt.

Actual local checks: the initial seven-file Node execution was359 total,
358PASS/1FAIL/0skip/0cancel because the admitted existing Bash harness omitted the
three new environment defaults under set-u. After that harness fix, all361 passed
with0fail/skip/cancel. Two additional actual-source status/envelope controls were
then added, followed by the actual-source registration guard control; the final
changed Node file executed79PASS/0FAIL/0skip/0cancel.
The other six files retain their actual earlier passing bindings; no inferred
363-case combined run is claimed. The original67 controls are retained. These
injected lifecycle/source/driver-construction/real temporary-FS/installed reporter
controls have nativecredit0. Whole TypeScript, focused12-file ESLint
(0errors/0warnings), production Next build and built-bundle containment passed.
An attempted nonexistent verify:no-service-role-client-bundle script refused;
the actual verify:bundle-containment command then passed, with no build rerun.
Dependencies are unchanged from55db; native11 canonical audit/lint positives keep
that historical scope. No canonical local lint scan through retained assets,
native collection, DB/RLS/component/HTTP/browser execution or diagnostic baseline
was run. The source's normal95 acceptance cases and INT015 are unchanged;
DIAG001 is declared ONLY in explicit diagnostic mode and is not normal coverage.

## Suggested Review Order

Author: Story 15.5 implementation/fix author (gpt-6.1-sol High), incorporating
explicitly delegated browser and bootstrap contributors. Refreshed after all
Round 3 latest-fix assertions, the subsequent checkpoint repairs and bounded
native setup diagnostics, same-connection privacy qualification and explicit
isolated setup authority transport, bounded child settlement, browser diagnostic repair,
actual SQL callback ownership, executed-feature fixture/status/policy repairs and
bounded safe-leaf transport through the installed reporter, closed owned scenario origins and the minimal Vite security patch and the admitted staged diagnostic-only lane.
Stops below resolve to final source literals before the repair commit.

### Own settings and honest lifecycle results

The two personal entry points reach one settings surface; the profile entry uses
server-filtered navigation. Confirmations and component-memory issuance retain
explicit uncertainty handling, while later authoritative status removes stale URLs.
The error render fallback reuses the existing approved sentence without enabling
retry before uncertain results have been reconciled; all four isolated SSR cases passed.

- `src/components/app-shell/AppShell.tsx:279` — `navigation.some`: gates the profile link on scheduling access.
- `src/components/calendar-feed/CalendarSubscription.tsx:34` — `const current = await refresh();`: clears superseded post-commit output and success.
- `src/components/calendar-feed/CalendarSubscription.tsx:69` — `state?.status === "error"`: AC2/6 renders fallback guidance without changing lifecycle controls.
- `tests/integration/components/calendar-feed.test.ts:36` — `15.5-COMP-003`: AC2/6 existing error/retry SSR assertions passed in isolation.
- `tests/e2e/calendar-feed.e2e.spec.ts:380` — `15.5-E2E-010-`: AC2/6 supersession cases failed at3e7; changed-head browser evidence pending.
- `tests/e2e/calendar-feed.e2e.spec.ts:447` — `15.5-E2E-011`: AC2/6 browser control failed at3e7; changed-head evidence pending.

### Signed current-self authority and atomic writes

Ordinary JWT commands derive self authority; SQL rechecks current exact membership
and role union under the scheduling tenant lock. Dedicated proofs bind privileged
inputs, and CAS/history/audit commit together without plaintext recovery.

- `src/server/commands/calendar-feed/manage-calendar-feed.ts:10` — `function calendarFeedConfig`: exposes plaintext only after confirmed fresh SQL success.
- `src/server/commands/calendar-feed/manage-calendar-feed.ts:38` — `command: "calendar_feed.create"`: literal create/rotate/revoke declarations retain independent enrollment discovery.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:162` — `create function public.manage_calendar_feed`: checks signed authority, revision, replay and audit.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:122` — `is distinct from (case`: preserves domain branches while delimiting CASE within the PL/pgSQL IF; subsequent native stack resets compiled it.
- `tests/support/calendar-feed-atdd.ts:354` — `const allowed = ["membershipId"`: checks raw JWT status keys before mapper reconstruction.
- `tests/integration/rls/calendar-feed.rls.test.ts:129` — `15.5-RLS008`: AC1/4/9 case failed at3e7; no downstream field/ACL credit inferred.

### Complete live snapshots and essential RFC correctness

The exact public middleware boundary precedes authentication/cookies. Projection
is complete and minimal; stable IDs, every projected-source revision and explicit
fractional rounding produce a subscription snapshot without scheduling METHOD.

- `middleware.ts:40` — `request.nextUrl.pathname`: bypasses only the exact feed token segment.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:236` — `'updatedAt',greatest`: covers mutable booking, role, job, customer and facility revisions.
- `src/features/calendar-feed/icalendar.ts:40` — `export function encodeCalendarFeed`: serializes complete snapshots before streaming.
- `tests/unit/features/calendar-feed/icalendar.test.ts:76` — `R1-05 positive`: AC3/8 independent positive fractional and boundary vectors passed.

### Durable abuse admission and hardened restore ownership

Independent budgets keep admitted counters through projection cancellation without
advancing last-use. Serial fixtures restore only their captured unknown-IP row;
source creator ADMIN is distinct from SET authority, while unchanged recovery
keeps SupAdmin-only NOADMIN. Retained unsafe roles fail closed.

- `supabase/migrations/20261020220000_personal_calendar_feed.sql:247` — `exception when sqlstate '57014'`: keeps projection failure inside the counter transaction.
- `tests/integration/calendar-feed/public-feed.int.test.ts:364` — `15.5-API018`: AC5/8 case failed at3e7; changed-head durability evidence pending.
- `supabase/migrations/20261020220000_personal_calendar_feed.sql:27` — `pg_has_role(current_user,feed_owner.oid,'SET')`: qualifies source ownership authority independently of creator ADMIN.
- `tests/integration/commands/calendar-feed.int.test.ts:445` — `memberships.every(row => row.inherit_option === false)`: AC4/9 INT015 native fresh/replay inherited-owner oracle passed at3e7.
- `tests/support/calendar-feed-atdd.ts:556` — `has_schema_privilege(oid,'public','CREATE')`: reads actual effective schema privileges including PUBLIC/inherited access.
- `tests/integration/rls/calendar-feed.rls.test.ts:171` — `publicSchemaCreate: false`: AC4/9 RLS010 failed at3e7; individual predicate reach remains unknown.
- `tests/integration/ops/recovery-storage-immutability.int.test.ts:131` — `has_schema_privilege('calendar_feed_owner','public','CREATE')`: the existing recovery case checks the restored target before Storage requests; separately qualified native case.

### Isolated CI custody and honest evidence limits

Only captured child identities and one ephemeral Vault UUID belong to the wrapper.
The added PG17 case qualifies that disposable stack and owns transaction-local
UUID roles/schema/function through dedicated connections, with no pool reuse.
Settlement is memoized; abnormal browser teardown retains exact job custody, while
privacy detection measures raw output in memory before sanitized records persist.
Before any secret, one fixed read-only query requires exact effective privacy on
the same connection later used for key creation and deletion. SET ACL facts
remain observations. The later admitted setup transport separately requires actual
authenticated SupAdmin LOGIN+SUPER for key setup and INT015, preserving its
restricted-session oracle. No new privileged child configuration or grant is added.

- `tests/integration/commands/calendar-feed.int.test.ts:486` — `// FULL rollback comes first`: preserves rollback/reset and same/fresh catalog absence proof.
- `scripts/ci/with-calendar-feed-runtime.mjs:327` — `export function createOwnedGroupStopper`: memoizes settlement, validates capture, passively observes missing-leader group absence and bounds completion/output.
- `scripts/ci/with-calendar-feed-runtime.mjs:248` — `export function createTelemetryObserver`: detects leaks before dropping non-allowlisted output.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1282` — `nonzero/null-signal nested browser loss`: requires retained key custody for abnormal completion.
- `tests/support/calendar-feed-ci-contract.ts:83` — `projectCalendarFeedCiCommands`: validates pinned real wrapper argv and the two wrapper inverses and finite exact diagnostic fragments.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:39` — `CI command projection rejects`: missing/wrong entry/argv and unrelated-source/workflow negatives preserve the original inverse fence.
- `scripts/ci/with-calendar-feed-runtime.mjs:99` — `function safeDiagnostic`: emits only fixed stages/categories and allowlisted SQLSTATE without native payloads.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:320` — `COMMIT uncertainty is not cleared`: rollback alone cannot establish key absence after attempted COMMIT.
- `scripts/ci/with-calendar-feed-runtime.mjs:529` — `receipt.privacyPreflight = await readCalendarFeedPrivacyPreflight(db);`: rejects unsafe effective settings before entropy on the existing client.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:216` — `privacy preflight rejects incomplete`: malformed and unsafe settings cannot reach a secret or child; actual driver/same-client/query-close cases exercise the surrounding boundary.
- `scripts/ci/with-calendar-feed-runtime.mjs:166` — `export function createCalendarFeedDatabaseClient`: fixes the same qualified source publication, canonical admin and sole captured credential; no default or alternate route.
- `scripts/ci/with-calendar-feed-runtime.mjs:153` — `export async function readCalendarFeedSetupAuthority`: actual authenticated session/current LOGIN+SUPER proof is mandatory before mutation.
- `tests/integration/commands/calendar-feed.int.test.ts:508` — `await fresh.connect(); await setupQualified(fresh); await absent(fresh);`: INT015 fresh authority/privacy and exact absence oracle passed at3e7.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:154` — `setup construction refuses missing`: credential/target refusals cannot reach secrets or children; actual identity negatives and child-config tests complete the bounded boundary evidence.

- `tests/e2e/support/calendar-feed-atdd.ts:83` — `export function createCalendarLifecycleObservations`: AC2/6 observes both transport promises and joins actual readback before teardown; pure regressions are not native acceptance.
- `tests/e2e/support/calendar-feed-atdd.ts:25` — `export function calendarBrowserDiagnostic`: preserves closed stage/category/SQLSTATE without native error payloads.
- `tests/e2e/support/calendar-feed-atdd.ts:705` — `if (base && cleanupAllowed)`: canonical SQL/Auth cleanup waits for verified settlement; unresolved references retain fixture custody.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:496` — `missing leaders with persistent groups`: absence is measured within existing budgets; anonymous groups grant no signaling authority.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1048` — `actual browser bounded cancellation`: timeout cannot credit in-flight SQL/readback settlement; release and real completion are distinct.

- `tests/e2e/support/calendar-feed-atdd.ts:93` — `trackReadback<T>`: registers actual callback/query work independently of Playwright deadlines and closes before drain.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1128` — `installed polling deadline cannot credit`: HTTP completion plus outer timeout cannot credit unresolved physical query siblings or callback completion.

- `tests/support/calendar-feed-atdd.ts:202` — `export function calendarFixtureDiagnostic`: fixed stages/own-data SQLSTATE preserve only reaching errors within bounded aggregates.
- `tests/support/calendar-feed-atdd.ts:272` — `phase = "additional-users"`: marks actual callback entry; upstream lost code remains unknown.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:601` — `actual fixture diagnostics preserve only`: injected classification and upstream-loss negatives are not native failure-cause proof.
- `tests/integration/rls/acceptance-tables-migration-reset.int.test.ts:212` — `approved role-specific policies`: exact ten-policy/role case passed at3e7, retaining DELETE/ALL/extra-policy rejection.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:930` — `the actual allocated policy case rejects`: injected rows exercise catalog negatives; actual3e7 policy case passed separately.

- `tests/support/calendar-feed-atdd.ts:234` — `calendarFixtureSafeFailures.get(child)?.children`: flattens only guarded, already-sanitized children for the one-level reporter boundary.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:877` — `installed failure transport reproduces lost`: old-shape control distinguishes JSON projection loss from in-process unknown.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:889` — `actual repaired fixture diagnostics reach`: ordered safe primary/cleanup leaves remain one failed synthetic case.

Evidence: historical check receipts keep their exact revisions and dependency
limits. Eighth checkpoint3e7 ran all51 story Vitest cases:8 passed/43 failed;
all four component cases and the exact shared policy case passed. Fourteen story
browser cases failed across28 attempts. Separate verify3130/bootstrap58/Python43/
recovery1 and actual DB child/key cleanup/INT015 passed; the full DB result still
failed1944P43F52skip. Browser custody, RLS010/API019 failure and unavailable
attachment content receive no borrowed proof. All43 native fixture messages had
only group markers: no leaf serialization, no diagnosed SQL or cleanup cause.
Current61 separate bounded Node tests passed, including three installed
runner/processError/JsonReporter transport controls using synthetic failures.
Actual pure source seams, injected rows and synthetic reporter tasks are not native
SQL/auth/browser acceptance. Prior isolated localSSR4 and native component4
passes keep their own scope; no SSR rerun here. Changed-head managed runtime,
complete native success and attachment-content privacy require Root exact-head CI.
Prior production builds remain historical, and no new build is claimed here.
All three broad rounds completed; only distinct High latest-delta review remains.
No provider/device/visual/performance or release-ready claim; the unallocated
exhaustive branch remains explicitly release-blocking deferred.

### Closed origins without inferred backend causes

The existing guards report only compile-time origins or outcome enums already
consumed. RLS001 preserves each allowed-subject assertion and adds a fixed site;
safe source frames identify other assertion lines without inspecting native errors.

- `tests/support/calendar-feed-atdd.ts:190` — `export function calendarFixtureOrigin`: registers only newly created fixed safe errors.
- `tests/support/calendar-feed-atdd.ts:195` — `export function calendarFixtureAssertionAt`: calls the existing assertion once and returns its result.
- `tests/support/calendar-feed-atdd.ts:734` — `const outcome = result.outcome`: classifies the same consumed outcome without observing an RPC.
- `tests/integration/rls/calendar-feed.rls.test.ts:23` — `calendarFixtureAssertionAt(allowedSites[subject]`: distinguishes four allowed contracts without changing the loop.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:798` — `actual first INT001 and API001 callbacks stop`: proves preceding/no-later operations with injected fixtures, not native acceptance.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:830` — `actual first callbacks retain precise safe assertion frames`: proves controlled frames and unrecoverable upstream UNKNOWN limits.

Current evidence:67 bounded controls passed with0 failures/skips/cancellations,
whole TypeScript and focused lint passed, and the approved5760-byte kernel is
unchanged. Ninth native8P43F exposes44 scenario/unknown leaves; first actual
branches and all43 causes remain unknown. Fixed outcome tags cannot distinguish
collapsed backend causes. Native acceptance, RLS010/API019 later predicates and
browser attachment privacy remain pending. Distinct High latest-four review is
pending; prior review/SSR/runtime receipts retain their historical dependency scope.

### Patch the bundled tool without weakening the gate

The same-branch minimum patched Vite replaces its bundled editor. Only its required
lock closure changes; scripts, Vitest versions, overrides and audit threshold stay
fixed. Local synthetic controls/build do not replace fresh native qualification.

- `package.json:50` — `"vite": "8.1.6"`: pins the patched tool without changing scripts.
- `pnpm-lock.yaml:2297` — `vite@8.1.6:`: binds the actual registry integrity and unchanged engine.
- `pnpm-lock.yaml:2059` — `rolldown@1.1.5:`: carries the required types and matching platform bindings.

Evidence: frozen installation, high-threshold audit (exit0/2moderate/no high),
lock guard, full typecheck,67bounded controls, production build and bundle
containment passed after materialization. Focused lint passed0errors/0warnings;
canonical local lint was terminated/incomplete after scanning ignored historical
assets and receives no PASS credit. Clean-CI canonical lint/native gates and fresh
independent exact dependency-delta review remain pending. All prior failed heads
and the43DB/14browser gaps remain failed/unresolved; no whole-native reuse.

### A diagnostic result never substitutes for acceptance

- `src/server/commands/calendar-feed/calendar-feed-db.ts:25` — `export async function captureCalendarFeedTrace`: closed per-invocation events, result/error identity and late-context closure.
- `src/server/commands/calendar-feed/manage-calendar-feed.ts:48` — `const code = result.code`: observes the already-consumed stable envelope result without changing its outcome.
- `src/server/read-models/calendar-feed.ts:10` — `if (error?.code === "42501")`: locates status erasure before its existing typed denial.
- `tests/support/calendar-feed-atdd.ts:744` — `export function calendarCauseProofSelection`: selects at most one warranted original-function baseline.
- `tests/support/calendar-feed-atdd.ts:750` — `export async function calendarCauseProofIdle`: a pg timeout is not actual protocol settlement.
- `tests/support/calendar-feed-atdd.ts:762` — `export async function runCalendarFeedCauseProof`: one ordinary command, qualified restricted original baseline, rollback/fresh verification and conditional custody cleanup.
- `tests/integration/commands/calendar-feed.int.test.ts:21` — `test("15.5-DIAG001"`: explicit-mode-only diagnostic inventory; normal95/INT015 are not replaced.
- `scripts/ci/checkpoint-dispatch.mjs:31` — `function diagnosticAvailability`: candidate/default availability refusal before the sole POST.
- `scripts/ci/checkpoint-dispatch.mjs:15` — `function verificationMode`: persisted diagnostic/legacy mode cannot downgrade to normal acceptance.
- `scripts/ci/with-calendar-feed-runtime.mjs:14` — `export const CAUSE_PROOF_ARGS`: fixed single-case serial argv/reporters/output without a Next/browser child.
- `scripts/ci/with-calendar-feed-runtime.mjs:50` — `export async function finishCauseProof`: validated distinct report upload on test failure as well as success, with private custody redaction.
- `.github/workflows/ci.yml:262` — `- name: Calendar feed cause proof (diagnostic only; no pilot or acceptance)`: separate mode-bound step; ordinary full+pilot remains intact.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1358` — `actual per-invocation trace preserves once-call value`: actual scoped trace concurrency/nesting and identity controls.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1379` — `actual baseline decision chooses one observed boundary`: conditional selection and protocol-settlement negatives.
- `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts:1404` — `actual installed failed native report and closed observation`: actual reporter/temporary-FS capture on failure without publishing custody handles.
- `tests/unit/scripts/ci/checkpoint-dispatch.test.ts:245` — `diagnostic selection is durable before the only POST`: actual dispatcher durable mode/nonce/zero-acceptance transport controls.
- `tests/unit/scripts/verify/ci-native-test-reports.test.ts:41` — `cause-proof capture is distinct mode-bound`: raw upload/artifact mode and negative controls preserve ordinary native reports.
- `tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts:53` — `diagnostic dispatch excludes pilot`: normal pilot/inverse guards and diagnostic NOT_RUN stay distinct.

Evidence: final79 changed-file Node controls and prior361 seven-file run have the
separate temporal limits recorded above. No diagnostic native run or SQL cause
proof has occurred. Hosted availability and private qualifier adoption are hard
pre-POST requirements; distinct committed-delta High review remains pending.


## Full committed source: supabase/migrations/20261020220000_personal_calendar_feed.sql

-- Story 15.5 / ADR-B004. Capability hashes and sanitized lifecycle history only.
do $$
declare feed_owner record;
begin
 if not exists(select 1 from pg_roles where rolname='calendar_feed_owner') then
  create role calendar_feed_owner nologin noinherit nosuperuser nocreatedb nocreaterole noreplication nobypassrls;
 end if;
 select * into feed_owner from pg_roles where rolname='calendar_feed_owner';
 if feed_owner.rolcanlogin or feed_owner.rolinherit or feed_owner.rolsuper or feed_owner.rolcreatedb
    or feed_owner.rolcreaterole or feed_owner.rolreplication or feed_owner.rolbypassrls then
  raise exception 'calendar_feed_owner is not hardened';
 end if;
 -- Only the trusted source executor may be a member. PostgreSQL17 gives a
 -- non-superuser creator ADMIN TRUE, SET FALSE, INHERIT FALSE; ADMIN is not
 -- SET authority. The isolated recovery SupAdmin NOADMIN guard is separate.
 if exists(select 1 from pg_auth_members m where m.member=feed_owner.oid
   or (m.roleid=feed_owner.oid and m.member<>(select oid from pg_roles where rolname='postgres'))) then
  raise exception 'calendar_feed_owner has unexpected membership';
 end if;
 if not exists(select 1 from pg_roles where rolname='postgres') then
  raise exception 'calendar feed ownership principal absent';
 end if;
 -- Preserve native creator ADMIN authority; qualify ownership transfer via SET
 -- without inherited privileges or any new runtime/JWT membership.
 grant calendar_feed_owner to postgres with set true;
 grant calendar_feed_owner to postgres with inherit false;
 if not pg_has_role(current_user,feed_owner.oid,'SET') then
  raise exception 'calendar feed source executor cannot transfer ownership';
 end if;
end
$$;
grant usage,create on schema public to calendar_feed_owner;
grant usage on schema auth,extensions to calendar_feed_owner;
grant execute on function auth.uid() to calendar_feed_owner;

create table public.calendar_feed_tokens (
 id uuid primary key default gen_random_uuid(),
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 membership_id uuid not null,
 token_hash text unique check(token_hash ~ '^[0-9a-f]{64}$'),
 revision integer not null check(revision>0),
 attempt_id uuid not null, action text not null check(action in ('create','rotate','revoke')),
 expected_revision integer not null check(expected_revision>=0),
 created_at timestamptz not null default clock_timestamp(), revoked_at timestamptz,
 last_used_at timestamptz, usage_count bigint not null default 0 check(usage_count between 0 and 9007199254740991),
 window_start timestamptz, request_count bigint not null default 0 check(request_count between 0 and 9007199254740991),
 spike_count bigint not null default 0 check(spike_count between 0 and 9007199254740991), last_spike_at timestamptz,
 unique(id,tenant_id),unique(tenant_id,membership_id,revision),unique(tenant_id,membership_id,attempt_id),
 foreign key(membership_id,tenant_id) references public.tenant_memberships(id,tenant_id) on delete cascade,
 check((action='revoke' and token_hash is null and revoked_at is not null) or (action in ('create','rotate') and token_hash is not null))
);
create unique index calendar_feed_one_active on public.calendar_feed_tokens(tenant_id,membership_id) where revoked_at is null;
create index calendar_feed_subject_history on public.calendar_feed_tokens(tenant_id,membership_id,revision desc);

-- Global infrastructure: no token/tenant/subject association and never a raw IP.
create table public.calendar_feed_ip_windows (
 ip_hash text primary key check(ip_hash ~ '^[0-9a-f]{64}$'),
 window_start timestamptz not null,
 request_count bigint not null check(request_count between 1 and 9007199254740991)
);
alter table public.calendar_feed_tokens enable row level security;
alter table public.calendar_feed_tokens force row level security;
alter table public.calendar_feed_ip_windows enable row level security;
alter table public.calendar_feed_ip_windows force row level security;
revoke all on public.calendar_feed_tokens,public.calendar_feed_ip_windows from public,anon,authenticated,service_role;
grant select,insert,update on public.calendar_feed_tokens to calendar_feed_owner;
grant select,insert,update,delete on public.calendar_feed_ip_windows to calendar_feed_owner;
create policy calendar_feed_owner_tokens on public.calendar_feed_tokens for all to calendar_feed_owner using(true) with check(true);
create policy calendar_feed_owner_ip on public.calendar_feed_ip_windows for all to calendar_feed_owner using(true) with check(true);

-- Column grants deliberately omit descriptions, contacts, money and all other data.
grant select(id) on public.tenants to calendar_feed_owner;
grant select(id,tenant_id,user_id,status,role) on public.tenant_memberships to calendar_feed_owner;
grant select(tenant_id,membership_id,role) on public.membership_roles to calendar_feed_owner;
grant select(id,tenant_id,membership_id,archived_at) on public.person_profiles to calendar_feed_owner;
grant select(tenant_id,booking_id,person_profile_id) on public.booking_assignees to calendar_feed_owner;
grant select(id,tenant_id,starts_at,ends_at,all_day,updated_at,status,work_role_id,job_id,customer_id,facility_id) on public.bookings to calendar_feed_owner;
grant select(id,tenant_id,title,customer_id,facility_id,updated_at) on public.jobs to calendar_feed_owner;
grant select(id,tenant_id,display_name,updated_at) on public.customers,public.work_roles to calendar_feed_owner;
grant select(id,tenant_id,address_line1,address_line2,postal_code,city,updated_at) on public.facilities to calendar_feed_owner;
grant insert(tenant_id,actor_user_id,command,event_type,target_type,target_id,correlation_id,metadata) on public.audit_events to calendar_feed_owner;
create policy calendar_feed_owner_tenants on public.tenants for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_memberships on public.tenant_memberships for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_roles on public.membership_roles for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_profiles on public.person_profiles for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_assignments on public.booking_assignees for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_bookings on public.bookings for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_jobs on public.jobs for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_customers on public.customers for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_work_roles on public.work_roles for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_facilities on public.facilities for select to calendar_feed_owner using(true);
create policy calendar_feed_owner_audit on public.audit_events for insert to calendar_feed_owner with check(true);

create function public.calendar_feed_attestation_payload(p_claims jsonb) returns bytea
language plpgsql immutable security invoker set search_path='' as $$
declare k text; result bytea:=''::bytea; keys text[];
begin
 keys:=case when p_claims->>'operation'='fetch' then array['schema','domain','operation','tokenHash','ipHash','requestId','keyId','issuedAt','expiresAt']
 else array['schema','domain','operation','tenantId','actorId','membershipId','revision','attemptId','newHash','correlationId','keyId','issuedAt','expiresAt'] end;
 foreach k in array keys loop
  result:=result || convert_to(octet_length(convert_to(coalesce(p_claims->>k,''),'UTF8'))::text || ':' || coalesce(p_claims->>k,''),'UTF8');
 end loop;
 return result;
end $$;

-- Only this fixed prefix can be read. The feed owner has no Vault SELECT/USAGE.
create function public.calendar_feed_secret_internal(p_key_id text) returns text
language sql stable security definer set search_path='' as $$
 select decrypted_secret from vault.decrypted_secrets
 where p_key_id ~ '^[A-Za-z0-9_-]{1,64}$' and name='calendar_feed_attestation_' || p_key_id limit 1
$$;
alter function public.calendar_feed_secret_internal(text) owner to postgres;
revoke all on function public.calendar_feed_secret_internal(text) from public,anon,authenticated,service_role;
grant execute on function public.calendar_feed_secret_internal(text) to calendar_feed_owner;

create function public.calendar_feed_verify_attestation_internal(p_claims jsonb,p_signature text,p_operation text) returns boolean
language plpgsql volatile security invoker set search_path='' as $$
declare secret text; decoded bytea; issued timestamptz; expires timestamptz; now_at timestamptz:=clock_timestamp(); keys text[];
begin
 if p_claims is null or jsonb_typeof(p_claims)<>'object' or p_signature is null or p_signature !~ '^[0-9a-f]{64}$'
  or p_claims->>'schema' is distinct from 'kopplas.calendar-feed.v1' or p_claims->>'operation' is distinct from p_operation
  or p_claims->>'domain' is distinct from (case when p_operation='fetch' then 'kopplas.calendar-feed.fetch.v1' else 'kopplas.calendar-feed.manage.v1' end) then return false; end if;
 keys:=case when p_operation='fetch' then array['schema','domain','operation','tokenHash','ipHash','requestId','keyId','issuedAt','expiresAt']
 else array['schema','domain','operation','tenantId','actorId','membershipId','revision','attemptId','newHash','correlationId','keyId','issuedAt','expiresAt'] end;
 if (select count(*) from jsonb_object_keys(p_claims))<>cardinality(keys)
  or exists(select 1 from unnest(keys) k where jsonb_typeof(p_claims->k) is distinct from 'string') then return false; end if;
 issued:=(p_claims->>'issuedAt')::timestamptz; expires:=(p_claims->>'expiresAt')::timestamptz;
 if not isfinite(issued) or not isfinite(expires) or issued>now_at or expires<=now_at or expires<=issued or expires-issued>interval '60 seconds' then return false; end if;
 secret:=public.calendar_feed_secret_internal(p_claims->>'keyId');
 if secret is null or secret !~ '^[A-Za-z0-9_-]+$' then return false; end if;
 decoded:=decode(translate(secret,'-_','+/') || repeat('=',(4-length(secret)%4)%4),'base64');
 if octet_length(decoded)<32 or rtrim(translate(replace(encode(decoded,'base64'),E'\n',''),'+/','-_'),'=')<>secret then return false; end if;
 return encode(extensions.hmac(public.calendar_feed_attestation_payload(p_claims),decoded,'sha256'),'hex')=p_signature;
exception when others then return false;
end $$;

create function public.calendar_feed_subject_internal(p_tenant uuid,p_membership uuid,p_actor uuid default null,p_admin boolean default false) returns boolean
language sql stable security invoker set search_path='' as $$
 select exists(select 1 from public.tenants t join public.tenant_memberships m on m.tenant_id=t.id
  where t.id=p_tenant and m.id=p_membership and m.status='active' and m.user_id is not null and (p_actor is null or m.user_id=p_actor)
   and (m.role=any(case when p_admin then array['tenant_admin'] else array['tenant_admin','projektledare','montor'] end)
    or exists(select 1 from public.membership_roles r where r.tenant_id=t.id and r.membership_id=m.id
     and r.role=any(case when p_admin then array['tenant_admin'] else array['tenant_admin','projektledare','montor'] end))))
$$;

create function public.read_calendar_feed_status(p_tenant_id uuid,p_attempt_id uuid default null) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare member uuid; latest public.calendar_feed_tokens; active public.calendar_feed_tokens; attempted public.calendar_feed_tokens;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 select m.id into member from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active';
 if auth.uid() is null or member is null or not public.calendar_feed_subject_internal(p_tenant_id,member,auth.uid()) then raise exception 'calendar denied' using errcode='42501'; end if;
 select * into latest from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member order by revision desc limit 1;
 select * into active from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member and revoked_at is null;
 select * into attempted from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member and attempt_id=p_attempt_id;
 return jsonb_build_object('membershipId',member,'active',active.id is not null,'revision',coalesce(latest.revision,0),
  'lastUsedAt',active.last_used_at,'usageCount',coalesce(active.usage_count,0),
  'attemptOutcome',case when p_attempt_id is null then null when attempted.id is not null then 'committed' else 'not-found' end,
  'attemptAction',attempted.action,'attemptRevision',attempted.expected_revision);
end $$;

create function public.manage_calendar_feed(p_tenant_id uuid,p_actor_id uuid,p_membership_id uuid,p_action text,p_expected_revision integer,p_attempt_id uuid,p_new_hash text,p_correlation_id uuid,p_claims jsonb,p_signature text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare latest public.calendar_feed_tokens; prior public.calendar_feed_tokens; active public.calendar_feed_tokens; new_id uuid; next_revision integer;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor_id or p_action not in ('create','rotate','revoke') or p_action is null
  or p_expected_revision is null or p_expected_revision<0 or p_attempt_id is null or p_correlation_id is null
  or not public.calendar_feed_verify_attestation_internal(p_claims,p_signature,p_action)
  or p_claims->>'tenantId' is distinct from p_tenant_id::text or p_claims->>'actorId' is distinct from p_actor_id::text
  or p_claims->>'membershipId' is distinct from p_membership_id::text or p_claims->>'revision' is distinct from p_expected_revision::text
  or p_claims->>'attemptId' is distinct from p_attempt_id::text or p_claims->>'newHash' is distinct from coalesce(p_new_hash,'')
  or p_claims->>'correlationId' is distinct from p_correlation_id::text
  or (p_action='revoke' and p_new_hash is not null) or (p_action<>'revoke' and (p_new_hash is null or p_new_hash !~ '^[0-9a-f]{64}$')) then raise exception 'calendar denied' using errcode='42501'; end if;
 -- Same tenant lock as scheduling; status/revision and public fetch serialize here.
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 if not public.calendar_feed_subject_internal(p_tenant_id,p_membership_id,p_actor_id) then raise exception 'calendar denied' using errcode='42501'; end if;
 select * into prior from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id and attempt_id=p_attempt_id;
 if found then
  if prior.action<>p_action or prior.expected_revision<>p_expected_revision or prior.token_hash is distinct from p_new_hash then raise exception 'calendar conflict' using errcode='CF409'; end if;
  return jsonb_build_object('outcome','replayed','revision',prior.revision);
 end if;
 select * into latest from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id order by revision desc limit 1;
 select * into active from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id and revoked_at is null for update;
 if p_expected_revision<>coalesce(latest.revision,0) or (p_action='create' and active.id is not null) or (p_action='rotate' and active.id is null) then raise exception 'calendar conflict' using errcode='CF409'; end if;
 if p_action='revoke' and active.id is null then return jsonb_build_object('outcome','replayed','revision',coalesce(latest.revision,0)); end if;
 next_revision:=coalesce(latest.revision,0)+1;
 update public.calendar_feed_tokens set revoked_at=clock_timestamp() where tenant_id=p_tenant_id and membership_id=p_membership_id and revoked_at is null;
 insert into public.calendar_feed_tokens(tenant_id,membership_id,token_hash,revision,attempt_id,action,expected_revision,revoked_at)
 values(p_tenant_id,p_membership_id,p_new_hash,next_revision,p_attempt_id,p_action,p_expected_revision,case when p_action='revoke' then clock_timestamp() else null end) returning id into new_id;
 insert into public.audit_events(tenant_id,actor_user_id,command,event_type,target_type,target_id,correlation_id,metadata)
 values(p_tenant_id,p_actor_id,'calendar_feed.'||p_action,'calendar_feed_'||p_action,'calendar_feed',new_id,p_correlation_id,jsonb_build_object('attemptId',p_attempt_id,'revision',next_revision));
 return jsonb_build_object('outcome','committed','revision',next_revision);
end $$;

create function public.calendar_feed_now_internal() returns timestamptz language sql volatile security invoker set search_path='' as $$ select clock_timestamp() $$;
alter function public.calendar_feed_now_internal() owner to calendar_feed_owner;
revoke all on function public.calendar_feed_now_internal() from public,anon,authenticated,service_role;

create function public.fetch_calendar_feed(p_token_hash text,p_ip_hash text,p_claims jsonb,p_signature text) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare now_at timestamptz; window_at timestamptz; retry integer; ip_count bigint; bucket text:=p_ip_hash;
 token public.calendar_feed_tokens; events jsonb; requests bigint;
begin
 if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' or p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$'
  or not public.calendar_feed_verify_attestation_internal(p_claims,p_signature,'fetch')
  or p_claims->>'tokenHash' is distinct from p_token_hash or p_claims->>'ipHash' is distinct from p_ip_hash
  or coalesce(p_claims->>'requestId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'calendar denied' using errcode='42501'; end if;
 -- Global cardinality admission is bounded, including malicious distinct addresses.
 -- Acquire before the tenant lock everywhere to avoid cross-axis lock inversion.
 perform pg_advisory_xact_lock(hashtextextended('kopplas.calendar-feed.ip-windows.v1',0));
 now_at:=public.calendar_feed_now_internal(); window_at:=to_timestamp(floor(extract(epoch from now_at)/900)*900);
 retry:=greatest(1,ceil(extract(epoch from window_at+interval '900 seconds'-now_at))::integer);
 delete from public.calendar_feed_ip_windows where ip_hash in (select w.ip_hash from public.calendar_feed_ip_windows w where w.window_start<window_at order by w.ip_hash limit 128);
 if not exists(select 1 from public.calendar_feed_ip_windows where ip_hash=bucket)
  and (select count(*) from public.calendar_feed_ip_windows)>=4095 then bucket:=repeat('f',64); end if;
 insert into public.calendar_feed_ip_windows(ip_hash,window_start,request_count) values(bucket,window_at,1)
 on conflict(ip_hash) do update set window_start=excluded.window_start,request_count=case when calendar_feed_ip_windows.window_start=excluded.window_start then least(calendar_feed_ip_windows.request_count+1,9007199254740991) else 1 end returning request_count into ip_count;
 -- Lookup supplies only the lock key; re-read token after the tenant wait.
 select * into token from public.calendar_feed_tokens where token_hash=p_token_hash;
 if token.id is not null then
  perform pg_advisory_xact_lock(hashtextextended(token.tenant_id::text,0));
  select * into token from public.calendar_feed_tokens where token_hash=p_token_hash for update;
 end if;
 if token.id is null or token.revoked_at is not null or not public.calendar_feed_subject_internal(token.tenant_id,token.membership_id) then
  return jsonb_build_object('status',case when ip_count>120 then 429 else 404 end,'retryAfter',retry);
 end if;
 requests:=case when token.window_start=window_at then least(token.request_count+1,9007199254740991) else 1 end;
 update public.calendar_feed_tokens set window_start=window_at,request_count=requests,
  spike_count=least(spike_count+case when requests>60 or ip_count>120 then 1 else 0 end,9007199254740991),
  last_spike_at=case when requests>60 or ip_count>120 then now_at else last_spike_at end where id=token.id;
 if requests>60 or ip_count>120 then return jsonb_build_object('status',429,'retryAfter',retry); end if;
 -- A single JSON scalar avoids the PostgREST row cap and any partial-page success.
 -- Projection faults roll back only their subtransaction; admitted abuse counters
 -- stay durable and no successful-use timestamp is written for a failed feed.
 begin
 select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',b.id,'startsAt',b.starts_at,'endsAt',b.ends_at,'allDay',b.all_day,'updatedAt',greatest(b.updated_at,w.updated_at,j.updated_at,c.updated_at,f.updated_at),
  'title',coalesce(nullif(w.display_name,''),'Bokning'),'jobLabel',j.title,'customerLabel',c.display_name,
  'location',nullif(concat_ws(', ',nullif(f.address_line1,''),nullif(f.address_line2,''),nullif(concat_ws(' ',nullif(f.postal_code,''),nullif(f.city,'')),'')),''))) order by b.starts_at,b.id),'[]'::jsonb) into events
 from public.bookings b
 left join public.work_roles w on w.id=b.work_role_id and w.tenant_id=b.tenant_id
 left join public.jobs j on j.id=b.job_id and j.tenant_id=b.tenant_id
 left join public.customers c on c.id=coalesce(b.customer_id,j.customer_id) and c.tenant_id=b.tenant_id
 left join public.facilities f on f.id=coalesce(b.facility_id,j.facility_id) and f.tenant_id=b.tenant_id
 where b.tenant_id=token.tenant_id and b.status='planned' and exists(
  select 1 from public.booking_assignees a join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
  where a.tenant_id=b.tenant_id and a.booking_id=b.id and p.membership_id=token.membership_id and p.archived_at is null);
 exception when sqlstate '57014' or others then return jsonb_build_object('status',503); end;
 update public.calendar_feed_tokens set last_used_at=now_at,usage_count=least(usage_count+1,9007199254740991) where id=token.id;
 return jsonb_build_object('status',200,'events',events);
end $$;

create function public.read_calendar_feed_abuse(p_tenant_id uuid) returns jsonb
language plpgsql volatile security definer set search_path='' as $$
declare member uuid;
begin
 select m.id into member from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active';
 if auth.uid() is null or member is null or not public.calendar_feed_subject_internal(p_tenant_id,member,auth.uid(),true) then raise exception 'calendar denied' using errcode='42501'; end if;
 return (select jsonb_build_object('requests',least(coalesce(sum(request_count),0),9007199254740991),'limited',least(coalesce(sum(spike_count),0),9007199254740991),'lastSpikeAt',max(last_spike_at)) from public.calendar_feed_tokens where tenant_id=p_tenant_id);
end $$;

-- All internal helpers lose implicit PUBLIC execution; only checked entrypoints
-- are exposed. No JWT role can SET ROLE to the dedicated owner.
alter function public.calendar_feed_attestation_payload(jsonb) owner to calendar_feed_owner;
alter function public.calendar_feed_verify_attestation_internal(jsonb,text,text) owner to calendar_feed_owner;
alter function public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean) owner to calendar_feed_owner;
alter function public.read_calendar_feed_status(uuid,uuid) owner to calendar_feed_owner;
alter function public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text) owner to calendar_feed_owner;
alter function public.fetch_calendar_feed(text,text,jsonb,text) owner to calendar_feed_owner;
alter function public.read_calendar_feed_abuse(uuid) owner to calendar_feed_owner;
revoke all on function public.calendar_feed_attestation_payload(jsonb),public.calendar_feed_verify_attestation_internal(jsonb,text,text),public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean),public.read_calendar_feed_status(uuid,uuid),public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text),public.fetch_calendar_feed(text,text,jsonb,text),public.read_calendar_feed_abuse(uuid) from public,anon,authenticated,service_role;
grant execute on function public.fetch_calendar_feed(text,text,jsonb,text) to anon;
grant execute on function public.read_calendar_feed_status(uuid,uuid),public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text),public.read_calendar_feed_abuse(uuid) to authenticated;
revoke create on schema public from calendar_feed_owner;


## Committed source context src/server/commands/envelope-core.ts:150-290

150: export async function runCommandCore<I, R, DB = unknown>(
151:   input: RunCommandCoreInput<I, R, DB>,
152: ): Promise<RunCommandResult<R>> {
153:   const {
154:     tenantContextResult,
155:     capability,
156:     validate,
157:     rawInput,
158:     verifyOwnership,
159:     execute,
160:     buildAuditFields,
161:     recordAudit,
162:     auditable,
163:     command,
164:     eventType,
165:     targetType,
166:     clock = systemClock,
167:     correlationId = crypto.randomUUID(),
168:     db,
169:   } = input;
170: 
171:   // ── Gate 1-3: auth + membership (reused tenant-context Result). ──────────────
172:   if (!tenantContextResult.ok) {
173:     const code = tenantContextResult.code;
174:     return err(code, COMMAND_MESSAGES[code]);
175:   }
176:   const tenantContext = tenantContextResult.data;
177: 
178:   if (capability) {
179:     const permitted = requireCapability({
180:       roles: tenantContext.roles,
181:       module: capability.module,
182:       capability: capability.capability,
183:     });
184:     if (!permitted.ok) return permitted as RunCommandResult<R>;
185:   }
186: 
187:   // ── Gate 4: typed input validation. Generic message — NEVER echo the raw value. ─
188:   // A THROWING validator is still a validation failure at the core boundary (the
189:   // "no raw throw, correct stable code" contract must hold here, not only at the
190:   // orchestrator). [Review][Patch][Med]
191:   let validated: ValidationResult<I>;
192:   try {
193:     validated = validate(rawInput);
194:   } catch {
195:     return err("VALIDATION_FAILED", COMMAND_MESSAGES.VALIDATION_FAILED);
196:   }
197:   if (!validated.ok) {
198:     return err("VALIDATION_FAILED", COMMAND_MESSAGES.VALIDATION_FAILED);
199:   }
200: 
201:   // Capture the SINGLE command timestamp ONCE (H1). Threaded into execute + audit.
202:   // Guard against an Invalid-Date clock so a later `toISOString()` cannot throw a
203:   // RangeError that escapes the core unmapped. [Review][Patch][Med]
204:   const commandInstant = clock.now();
205:   if (
206:     !(commandInstant instanceof Date) ||
207:     Number.isNaN(commandInstant.getTime())
208:   ) {
209:     return err("SERVER_ERROR", COMMAND_MESSAGES.SERVER_ERROR);
210:   }
211:   const fixedClock: CommandClock = { now: () => commandInstant };
212:   const execCtx: CommandExecuteContext<I, DB> = {
213:     tenantContext,
214:     input: validated.data,
215:     clock: fixedClock,
216:     correlationId,
217:     db: db as DB,
218:   };
219: 
220:   // ── Gate 5: tenant-ownership of any target ids. Fail closed: a genuine zero-rows
221:   //    result is TENANT_ACCESS_DENIED; a transient DB ERROR (surfaced by the checker)
222:   //    or an unexpected THROW is SERVER_ERROR (retryable) — never masked as a denial.
223:   //    [Review][Decision][Med] / [Review][Patch][Med] ───────────────────────────
224:   let ownership: OwnershipResult;
225:   try {
226:     ownership = await verifyOwnership(execCtx);
227:   } catch {
228:     // Fail closed on an unexpected throw — do NOT execute or audit.
229:     return err("SERVER_ERROR", COMMAND_MESSAGES.SERVER_ERROR);
230:   }
231:   if (!ownership.ok) {
232:     return err(ownership.code, COMMAND_MESSAGES[ownership.code]);
233:   }
234: 
235:   // ── Step 6-7: execute. A plain throw is a TRANSIENT infra fault → SERVER_ERROR
236:   //    (no raw throw/stack/SQL crosses the boundary; no audit row on this failure).
237:   //    A deliberately-thrown `CommandError` surfaces its STABLE code instead — e.g.
238:   //    a composite same-tenant FK rejecting a cross-tenant parent link is a genuine
239:   //    TENANT_ACCESS_DENIED authorization outcome, NOT a transient fault. Either way
240:   //    NO audit row is written (the command did not succeed). ──
241:   let result: R;
242:   try {
243:     result = await execute(execCtx);
244:   } catch (e) {
245:     if (isCommandError(e)) {
246:       // A CommandError may carry an OPTIONAL user-safe message overriding the generic per-code one
247:       // (still generic — no PII/SQL/echoed input); absent ⇒ the generic COMMAND_MESSAGES[code].
248:       return err(e.code, e.userMessage ?? COMMAND_MESSAGES[e.code]);
249:     }
250:     return err("SERVER_ERROR", COMMAND_MESSAGES.SERVER_ERROR);
251:   }
252: 
253:   // ── Step 8: append-only audit (only on success AND auditable; exactly once). ──
254:   if (auditable) {
255:     // Deriving the audit fields + building the row must not escape the core unmapped:
256:     // a throwing `buildAuditFields` (or the `created_at` derivation) is a SERVER_ERROR,
257:     // not a leaked stack. `commandInstant` is already validated above, so toISOString()
258:     // cannot RangeError here. [Review][Patch][Med]
259:     let row: AuditRow;
260:     try {
261:       const fields = buildAuditFields?.(execCtx, result) ?? {
262:         targetType: targetType ?? "",
263:         targetId: null,
264:         metadata: {},
265:       };
266:       row = {
267:         tenant_id: tenantContext.tenantId,
268:         actor_user_id: tenantContext.userId,
269:         command,
270:         event_type: eventType,
271:         target_type: fields.targetType,
272:         target_id: fields.targetId,
273:         correlation_id: correlationId,
274:         metadata: fields.metadata,
275:         created_at: commandInstant.toISOString(),
276:       };
277:     } catch {
278:       return err("SERVER_ERROR", COMMAND_MESSAGES.SERVER_ERROR);
279:     }
280:     // The audit write itself failing is a transient infra fault → SERVER_ERROR
281:     // (fail closed; do NOT return ok while the audit row was not persisted).
282:     try {
283:       await recordAudit(row, execCtx);
284:     } catch {
285:       return err("SERVER_ERROR", COMMAND_MESSAGES.SERVER_ERROR);
286:     }
287:   }
288: 
289:   // ── Step 9: typed ok. ────────────────────────────────────────────────────────
290:   return ok(result);


## Committed source context src/server/commands/envelope.ts:215-285

215:  * Run a declared command through the full §5 envelope against `client`.
216:  *
217:  * Steps 1-3 reuse `resolveTenantContext` with the injected client (getClaims()-backed
218:  * auth + active-tenant_admin membership — NEVER getSession, NEVER a client-supplied
219:  * tenant id as authority). The pure `runCommandCore` then enforces validate →
220:  * ownership → execute → audit → typed Result.
221:  */
222: export async function runCommand<I, R>(
223:   command: Command<I, R>,
224:   options: RunCommandOptions,
225: ): Promise<Result<R, CommandErrorCode>> {
226:   const { config } = command;
227:   const { client, input, clock = systemClock } = options;
228:   const correlationId = resolveCorrelationId(options.correlationId ?? undefined);
229: 
230:   // Steps 1-3: resolve auth + membership via the established authority. Lazy import
231:   // keeps `next/headers` out of test bundles that inject their own client. The
232:   // resolver wraps its own I/O and returns a typed Result (never throws across).
233:   const { resolveTenantContext: resolve } = (await import(
234:     "@/server/auth/resolve-tenant-context"
235:   )) as { resolveTenantContext: typeof resolveTenantContext };
236: 
237:   // Wrap the whole orchestration so an unexpected throw (client misuse, SDK reject)
238:   // maps to SERVER_ERROR — no raw stack crosses the boundary.
239:   try {
240:     const tenantContextResult = await resolve({
241:       client: client as unknown as ResolveTenantContextOptions["client"],
242:     });
243: 
244:     return await runCommandCore<I, R, CommandDbClient>({
245:       tenantContextResult: tenantContextResult as never,
246:       capability: config.capability,
247:       validate: config.validateInput,
248:       rawInput: input,
249:       verifyOwnership: (ctx) => verifyOwnership(config, ctx),
250:       execute: config.execute,
251:       auditable: config.auditable,
252:       command: config.command,
253:       eventType: config.eventType,
254:       targetType: config.targetType,
255:       clock,
256:       correlationId,
257:       db: client,
258:       buildAuditFields: (ctx, result) => {
259:         const derived = config.auditFields?.(ctx, result);
260:         const targetId =
261:           derived?.targetId ?? defaultTargetId(result);
262:         const metadata = derived?.metadata;
263:         return {
264:           targetType: config.targetType,
265:           targetId,
266:           // Sanitization happens in writeAuditEvent; pass through raw here so the
267:           // core just carries it. The actual persisted row is written by recordAudit.
268:           metadata: (metadata ?? {}) as Record<string, unknown>,
269:         };
270:       },
271:       // Thread the ALREADY-RESOLVED execute context (real tenantContext + validated
272:       // input + single-instant clock + correlation id) straight into the write —
273:       // never reconstruct synthetic authority fields from the serialized AuditRow.
274:       // The `row` still carries the derived audit fields (event/target/metadata).
275:       // [Review][Patch][Med]
276:       recordAudit: async (row, execCtx) => {
277:         await writeAuditEvent(execCtx, row.command, {
278:           eventType: row.event_type,
279:           targetType: row.target_type,
280:           targetId: row.target_id,
281:           metadata: row.metadata,
282:         });
283:       },
284:     });
285:   } catch {


## Committed source context src/server/auth/resolve-tenant-context.ts:76-245

76: async function resolveTenantContextInner(
77:   options: ResolveTenantContextOptions,
78: ): Promise<ResolveTenantContextResult> {
79:   // The default client factory imports `next/headers` (Next-bundler-only). Load it LAZILY
80:   // and only when no client is injected, so importing this resolver in a plain Node test
81:   // (with an injected fake client) never pulls in `next/headers`. The `import type` above
82:   // keeps the type reference without an eager runtime dependency.
83:   const supabase =
84:     options.client ??
85:     (await (
86:       await import("@/server/db/supabase-server-client")
87:     ).createSupabaseServerClient());
88: 
89:   // (a) Re-validate the user. `getClaims` reads the access token and verifies it locally
90:   //     against the project's published JWKS (no trust in unrevalidated session cookies).
91:   const { data: claimsData, error: claimsError } =
92:     await supabase.auth.getClaims();
93: 
94:   const claims = claimsData?.claims;
95:   const user: ResolvedUser | null =
96:     !claimsError && claims && typeof claims.sub === "string"
97:       ? {
98:           id: claims.sub,
99:           email: typeof claims.email === "string" ? claims.email : null,
100:         }
101:       : null;
102: 
103:   // Short-circuit before touching the DB if there is no authenticated user.
104:   if (!user) {
105:     return resolveTenantContextCore({
106:       user: null,
107:       membership: null,
108:       clientTenantId: options.clientTenantId ?? null,
109:     });
110:   }
111: 
112:   // (b) Load this user's `tenant_admin` membership row(s). RLS (Story 2.2) restricts the
113:   //     rows to the caller; we still re-derive authority from the row, not from any client
114:   //     id. We do NOT filter on `status` so the pure core can treat a disabled/invited row
115:   //     as a DISTINCT no-access case from "no row at all" (test requirement).
116:   //
117:   //     Task 7.2: do NOT rely on a lexicographic `.order("status")` to surface an `active`
118:   //     row first (that fragile ordering — 'active' < 'disabled' < 'invited' — would be
119:   //     silently wrong if a future status sorted before 'active'). Instead fetch the small
120:   //     candidate set and select the preferred row EXPLICITLY below (active-first, then
121:   //     oldest). The `(tenant_id, user_id)` UNIQUE constraint means a single user has at
122:   //     most one row per tenant, so this set is only non-trivial ACROSS tenants.
123:   //
124:   //     Cap correctness (review fix 2026-06-26): the candidate set is bounded by an explicit
125:   //     `.limit(10)` blast-radius guard, but the preferred row is the `active` one — which
126:   //     `created_at` ordering alone does NOT guarantee survives the cap (a >10-tenant admin
127:   //     whose only active row is the 11th-oldest would have it truncated, silently locking
128:   //     out a rightful admin). So we fetch ACTIVE rows FIRST in a bounded query: filtering
129:   //     `status='active'` at the SQL layer means the active row can never be truncated by the
130:   //     cap, regardless of tenant count. Only when NO active row exists do we fall back to a
131:   //     capped fetch of the remaining rows — needed solely so the pure core can distinguish a
132:   //     disabled/invited membership (TENANT_MEMBERSHIP_REQUIRED, a deliberate case) from "no
133:   //     row at all". The pure-core active-first selection stays the authority over both sets.
134:   const baseQuery = () =>
135:     supabase
136:       .from("tenant_memberships")
137:       .select("id, tenant_id, role, status, created_at, tenants(name)")
138:       .eq("user_id", user.id);
139: 
140:   // (b1) Active rows first — filtered, so the user's active membership is NEVER capped out.
141:   const { data: activeRows, error: activeError } = await baseQuery()
142:     .eq("status", "active")
143:     .order("created_at", { ascending: true })
144:     .limit(10);
145: 
146:   // A real query error is a TRANSIENT infrastructure failure (DB down, RLS misconfig, pool
147:   // exhaustion) — NOT "you have no membership". Map it to the distinct SERVER_ERROR code so
148:   // an outage is never mislabeled as a permanent no-access denial (Task 7.1). Fail closed.
149:   if (activeError) {
150:     return err("SERVER_ERROR", TENANT_CONTEXT_MESSAGES.SERVER_ERROR);
151:   }
152: 
153:   // (b2) Fall back to the full capped set ONLY when there is no active row, so the pure core
154:   //      can still treat a disabled/invited row as a DISTINCT no-access case from "no row".
155:   let membershipRows = activeRows ?? [];
156:   if (membershipRows.length === 0) {
157:     const { data: anyRows, error: anyError } = await baseQuery()
158:       .order("created_at", { ascending: true })
159:       .limit(10);
160:     if (anyError) {
161:       return err("SERVER_ERROR", TENANT_CONTEXT_MESSAGES.SERVER_ERROR);
162:     }
163:     membershipRows = anyRows ?? [];
164:   }
165: 
166:   const membership = selectPreferredMembership(membershipRows);
167:   if (membership?.id) {
168:     const { data: roleRows, error: rolesError } = await supabase
169:       .from("membership_roles")
170:       .select("role")
171:       .eq("tenant_id", membership.tenant_id)
172:       .eq("membership_id", membership.id);
173:     if (rolesError) return err("SERVER_ERROR", TENANT_CONTEXT_MESSAGES.SERVER_ERROR);
174:     membership.roles = (roleRows ?? []).map((row: { role?: unknown }) => row.role);
175:   }
176: 
177:   // (c) Pure decision (active + role; client-tenant-id is ignored, never the authority).
178:   return resolveTenantContextCore({
179:     user,
180:     membership,
181:     clientTenantId: options.clientTenantId ?? null,
182:   });
183: }
184: 
185: /** The raw shape PostgREST returns for the membership query (pre-normalization). */
186: type RawMembershipRow = {
187:   readonly id?: unknown;
188:   readonly tenant_id?: unknown;
189:   readonly role?: unknown;
190:   readonly status?: unknown;
191:   readonly created_at?: unknown;
192:   readonly tenants?: unknown;
193: };
194: 
195: /**
196:  * Select the PREFERRED membership from the candidate set and normalize it to a
197:  * `MembershipRow` (Task 7.2 — replaces the fragile lexicographic `.order("status")`).
198:  *
199:  * Preference, applied EXPLICITLY (not via string-sort luck):
200:  *   1. An `active` row wins over any non-active row (a disabled-then-reactivated admin is
201:  *      never denied by a stale `disabled` row).
202:  *   2. Among rows of equal active-ness, the OLDEST (`created_at` ascending — already the
203:  *      query order) wins for stability.
204:  * Rows with a null/empty `tenant_id` (orphaned FK / partial insert) are DROPPED — an empty
205:  * tenant would silently mis-scope every later tenant query. If, after filtering, no row
206:  * remains, returns null (the core then yields TENANT_MEMBERSHIP_REQUIRED).
207:  *
208:  * In Phase A the `(tenant_id, user_id)` UNIQUE constraint means at most one row per tenant,
209:  * so this only ever chooses BETWEEN tenants — and it deterministically prefers the active
210:  * one regardless of how the statuses would have sorted lexically.
211:  */
212: function selectPreferredMembership(
213:   rows: readonly RawMembershipRow[],
214: ): MembershipRow | null {
215:   const normalized: MembershipRow[] = [];
216:   for (const raw of rows) {
217:     if (typeof raw.tenant_id !== "string" || raw.tenant_id === "") continue;
218:     // Fail CLOSED on a missing/empty role, mirroring the `tenant_id` guard above:
219:     // DROP the row rather than coercing to "" (which would push an empty-role row
220:     // into the candidate set). Defensive only — the query filters `.eq("role",
221:     // TENANT_ADMIN_ROLE)` and the DB CHECK bounds it — but it removes a fail-open
222:     // smell so an unexpected role can never be silently carried forward.
223:     if (typeof raw.role !== "string" || raw.role === "") continue;
224:     normalized.push({
225:       id: typeof raw.id === "string" && raw.id !== "" ? raw.id : undefined,
226:       tenant_id: raw.tenant_id,
227:       role: raw.role,
228:       // Coerce the raw DB string to the union at the edge — unknown values fail closed to
229:       // the DENYING `disabled` so they can never be treated as `active`.
230:       status: normalizeMembershipStatus(raw.status),
231:       tenant_name: extractTenantName(raw.tenants),
232:     });
233:   }
234:   if (normalized.length === 0) return null;
235: 
236:   // Rows are already in `created_at` ascending order; a stable partition that puts the
237:   // first `active` row first preserves the oldest-wins tiebreak.
238:   const active = normalized.find((m) => m.status === "active");
239:   return active ?? normalized[0];
240: }
241: 
242: /**
243:  * Coerce a raw DB `status` string to the `MembershipStatus` union. Only the three known
244:  * lifecycle values are accepted; any other value (NULL, empty, a future/unknown status)
245:  * maps to `disabled` — a DENYING status — so an unrecognized status can never be treated


## Committed source context src/server/auth/resolve-tenant-context-core.ts:50-136

50: export type MembershipRow = {
51:   readonly id?: string;
52:   readonly tenant_id: string;
53:   readonly role: string;
54:   roles?: readonly unknown[];
55:   readonly status: MembershipStatus;
56:   /** Optional joined tenant display name (presentational only). */
57:   readonly tenant_name?: string | null;
58: };
59: 
60: export type ResolveTenantContextCoreInput = {
61:   /** Null when the session is missing/invalid (no re-validated user). */
62:   readonly user: ResolvedUser | null;
63:   /** Null when no active `tenant_admin` membership row was found for the user. */
64:   readonly membership: MembershipRow | null;
65:   /**
66:    * Optional client-supplied tenant id (query/body/header/cookie). NEVER the authority and
67:    * NEVER an input to the decision: it is IGNORED (the tenant is always
68:    * `membership.tenant_id`). Retained only so callers may detect/log a spoof attempt
69:    * out-of-band — it can never widen access nor deny a rightful admin (AC4 / R-004).
70:    */
71:   readonly clientTenantId?: string | null;
72: };
73: 
74: export type ResolveTenantContextResult = Result<
75:   TenantContext,
76:   TenantContextErrorCode
77: >;
78: 
79: export function resolveTenantContextCore(
80:   input: ResolveTenantContextCoreInput,
81: ): ResolveTenantContextResult {
82:   const { user, membership, clientTenantId } = input;
83: 
84:   // 1. Unauthenticated: no re-validated user.
85:   if (!user || !user.id) {
86:     return err("UNAUTHENTICATED", TENANT_CONTEXT_MESSAGES.UNAUTHENTICATED);
87:   }
88: 
89:   // 2. No membership row at all.
90:   if (!membership) {
91:     return err(
92:       "TENANT_MEMBERSHIP_REQUIRED",
93:       TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED,
94:     );
95:   }
96: 
97:   // 3. Status must be strictly 'active' (invited/disabled/anything else = no access).
98:   //    This is a DISTINCT denial case from "no membership row" (test req).
99:   if (membership.status !== "active") {
100:     return err(
101:       "TENANT_MEMBERSHIP_REQUIRED",
102:       TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED,
103:     );
104:   }
105: 
106:   // 4. An unknown stored role never grants a tenant context.
107:   if (!isTenantRole(membership.role)) {
108:     return err(
109:       "TENANT_MEMBERSHIP_REQUIRED",
110:       TENANT_CONTEXT_MESSAGES.TENANT_MEMBERSHIP_REQUIRED,
111:     );
112:   }
113: 
114:   // 5. AC4 / R-004: tenant authority is membership-derived. A client-supplied tenant id is
115:   //    NEVER an input to the decision — it is IGNORED entirely (AC4's "ignored" branch).
116:   //    Whether it is absent, matching, or a stale/spoofed mismatch, the resolved tenant
117:   //    always comes from the server-side membership row, never from the client value. The
118:   //    client value can only ever be ignored — it can never widen, redirect, or DENY
119:   //    access. (Ignoring a stale bookmarked/spoofed id means a rightful admin is never
120:   //    self-DoSed out of their own tenant; the load-bearing "never widens access" property
121:   //    still holds because the tenant is read from `membership.tenant_id` below, not from
122:   //    `clientTenantId`.) The parameter is retained only so callers may detect/log a spoof
123:   //    attempt out-of-band; it has no effect on the authority decision here.
124:   void clientTenantId;
125: 
126:   return ok({
127:     userId: user.id,
128:     tenantId: membership.tenant_id,
129:     role: membership.role,
130:     roles: normalizeRoles([membership.role, ...(membership.roles ?? [])]),
131:     status: "active",
132:     userEmail: user.email,
133:     tenantName: membership.tenant_name ?? null,
134:   });
135: }
136: 


## Full committed source: src/server/calendar-feed/attestation.ts

// SERVER-ONLY: dedicated feed key. Proofs, tokens and keys must never be logged.
import { createHash, createHmac, randomBytes, timingSafeEqual } from "node:crypto";
import { isCalendarFeedToken } from "@/features/calendar-feed/validation";
export const FEED_SCHEMA = "kopplas.calendar-feed.v1";
export const FETCH_DOMAIN = "kopplas.calendar-feed.fetch.v1";
export const MANAGE_DOMAIN = "kopplas.calendar-feed.manage.v1";
export const FETCH_FIELDS = ["schema", "domain", "operation", "tokenHash", "ipHash", "requestId", "keyId", "issuedAt", "expiresAt"] as const;
export const MANAGE_FIELDS = ["schema", "domain", "operation", "tenantId", "actorId", "membershipId", "revision", "attemptId", "newHash", "correlationId", "keyId", "issuedAt", "expiresAt"] as const;
export type FeedClaims = Readonly<Record<string, string>>;
export function canonicalFeedProof(fields: FeedClaims): Uint8Array {
  const names = fields.operation === "fetch" ? FETCH_FIELDS : MANAGE_FIELDS;
  return Buffer.concat(names.map(name => { const bytes = Buffer.from(fields[name] ?? "", "utf8"); return Buffer.concat([Buffer.from(`${bytes.length}:`, "ascii"), bytes]); }));
}
export function acceptsFeedKey(secret: string | undefined): secret is string {
  if (!secret || !/^[A-Za-z0-9_-]+$/.test(secret)) return false;
  const bytes = Buffer.from(secret, "base64url");
  return bytes.length >= 32 && bytes.toString("base64url") === secret;
}
export function feedKeyFromEnv(): { keyId: string; secret: string } {
  const keyId = process.env.CALENDAR_FEED_ATTESTATION_KEY_ID, secret = process.env.CALENDAR_FEED_ATTESTATION_SECRET;
  if (!keyId || !/^[A-Za-z0-9_-]{1,64}$/.test(keyId) || !acceptsFeedKey(secret)) throw new Error("Calendar unavailable");
  return { keyId, secret };
}
export function signFeedProof(fields: FeedClaims, secret: string): string {
  if (!acceptsFeedKey(secret)) throw new Error("Calendar unavailable");
  return createHmac("sha256", Buffer.from(secret, "base64url")).update(canonicalFeedProof(fields)).digest("hex");
}
export function verifyFeedProof(fields: FeedClaims, signature: string, secret: string, now = new Date().toISOString()): boolean {
  try {
    const time = Date.parse(now), issued = Date.parse(fields.issuedAt), expires = Date.parse(fields.expiresAt);
    const names: readonly string[] = fields.operation === "fetch" ? FETCH_FIELDS : MANAGE_FIELDS;
    if (Object.keys(fields).length !== names.length || names.some(name => typeof fields[name] !== "string") || Object.keys(fields).some(name => !names.includes(name))) return false;
    if (fields.schema !== FEED_SCHEMA || fields.domain !== (fields.operation === "fetch" ? FETCH_DOMAIN : MANAGE_DOMAIN) || !Number.isFinite(time) || !Number.isFinite(issued) || !Number.isFinite(expires) || issued > time || expires <= time || expires <= issued || expires - issued > 60000 || !/^[0-9a-f]{64}$/.test(signature)) return false;
    return timingSafeEqual(Buffer.from(signature, "hex"), Buffer.from(signFeedProof(fields, secret), "hex"));
  } catch { return false; }
}
export function issueCalendarFeedToken(entropy: (length: number) => Uint8Array = randomBytes): { raw: string; hash: string } {
  const bytes = entropy(32); if (bytes.length !== 32) throw new Error("Calendar unavailable");
  const raw = Buffer.from(bytes).toString("base64url"); return { raw, hash: hashFeedToken(raw) };
}
export function hashFeedToken(raw: string): string {
  if (!isCalendarFeedToken(raw)) throw new Error("Calendar unavailable");
  return createHash("sha256").update(raw, "utf8").digest("hex");
}


## Committed source context src/server/authz/permission-matrix.ts:1-148

1: import { isTenantRole, normalizeRoles, type TenantRole } from "./roles";
2: 
3: type TenantPermissionRow = { readonly roles: readonly TenantRole[] };
4: type PlatformPermissionRow = {
5:   readonly roles: readonly [];
6:   readonly scope: "platform";
7:   readonly tenantGrantable: false;
8:   readonly tenantRoles: readonly [];
9: };
10: type PermissionRow = TenantPermissionRow | PlatformPermissionRow;
11: type ModulePermissions = Record<string, PermissionRow>;
12: 
13: /**
14:  * Server-only, versioned authorization source. The Phase A seed is the
15:  * owner-approved N-4 matrix. It deliberately names stable business operations
16:  * instead of pages or widgets so command and RLS policies can share it.
17:  */
18: const BOOKINGS_VIEW = { roles: ["tenant_admin", "projektledare", "montor"] } as const;
19: 
20: export const PERMISSION_MATRIX = {
21:   // Classification only: platform authority is DB allow-list based, never a tenant role grant.
22:   provisioning: {
23:     "Platform.Operator.Access": {
24:       roles: [], scope: "platform", tenantGrantable: false, tenantRoles: [],
25:     },
26:   },
27:   foundation: { "Memberships.Manage": { roles: ["tenant_admin"] } },
28:   rbac: { "Memberships.Manage": { roles: ["tenant_admin"] } },
29:   notifications: {
30:     "Notifications.View": { roles: ["tenant_admin"] },
31:     "Notifications.Personal": { roles: ["tenant_admin", "projektledare", "montor", "saljare", "ekonomi"] },
32:   },
33:   resources: {
34:     "Resources.View": { roles: ["tenant_admin", "projektledare"] },
35:     "Resources.Maintain": { roles: ["tenant_admin", "projektledare"] },
36:     "Bookings.View": BOOKINGS_VIEW,
37:     "Bookings.Manage": { roles: ["tenant_admin", "projektledare"] },
38:   },
39:   scheduling: {
40:     "Bookings.View": BOOKINGS_VIEW,
41:     "TimeReports.ReportOwn": { roles: ["tenant_admin", "projektledare", "montor"] },
42:     "TimeReports.Review": { roles: ["tenant_admin", "projektledare"] },
43:   },
44:   dashboard: { "Dashboard.View": { roles: ["tenant_admin", "projektledare", "montor", "saljare", "ekonomi"] } },
45:   crm: {
46:     "Customers.View": { roles: ["tenant_admin", "projektledare", "saljare"] },
47:     "Customers.Create": { roles: ["tenant_admin", "projektledare", "saljare"] },
48:     "Customers.Edit": { roles: ["tenant_admin", "projektledare", "saljare"] },
49:     "Customers.Delete": { roles: ["tenant_admin"] },
50:   },
51:   settings: {
52:     "CompanySettings.View": { roles: ["tenant_admin"] },
53:     "CompanySettings.Edit": { roles: ["tenant_admin"] },
54:     "Pricing.Edit": { roles: ["tenant_admin", "projektledare"] },
55:   },
56:   calculations: {
57:     // Calculation rows carry inline costs and markup. Until their economy data is
58:     // split out, Säljare is deliberately closed at module level (ADR-B001 §3.6).
59:     "Calculations.View": { roles: ["tenant_admin", "projektledare"] },
60:     "Calculations.Create": { roles: ["tenant_admin", "projektledare"] },
61:     "Calculations.Edit": { roles: ["tenant_admin", "projektledare"] },
62:   },
63:   quotes: {
64:     "Quotes.View": { roles: ["tenant_admin", "projektledare", "saljare"] },
65:     "Quotes.Create": { roles: ["tenant_admin", "projektledare", "saljare"] },
66:     "Quotes.Edit": { roles: ["tenant_admin", "projektledare", "saljare"] },
67:     "Quotes.Approve": { roles: ["tenant_admin", "projektledare"] },
68:     "Quotes.Send": { roles: ["tenant_admin", "projektledare", "saljare"] },
69:     "Quotes.Export": { roles: ["tenant_admin", "projektledare", "saljare"] },
70:     // Compatibility key retained for Story 11.1's public capability contract.
71:     // New Phase-A callers use the Economy.* vocabulary below.
72:     "Quotes.ViewSalesPrice": { roles: ["tenant_admin", "projektledare", "saljare", "ekonomi"] },
73:     "Economy.ViewSalesPrice": { roles: ["tenant_admin", "projektledare", "saljare", "ekonomi"] },
74:     "Economy.EditSalesPrice": { roles: ["tenant_admin", "projektledare", "saljare"] },
75:     "Economy.ViewCostPrice": { roles: ["tenant_admin", "projektledare", "ekonomi"] },
76:     "Economy.EditCostPrice": { roles: ["tenant_admin", "projektledare", "ekonomi"] },
77:     "Economy.ViewContributionMargin": { roles: ["tenant_admin", "projektledare", "ekonomi"] },
78:   },
79:   jobs: {
80:     // Row scope remains the auth.uid-bound member/booking-assignee predicate.
81:     "Jobs.ViewAssigned": { roles: ["tenant_admin", "projektledare", "montor"] },
82:     "Jobs.ViewAll": { roles: ["tenant_admin", "projektledare"] },
83:     "Jobs.Create": { roles: ["tenant_admin", "projektledare"] },
84:     "Jobs.Edit": { roles: ["tenant_admin", "projektledare"] },
85:     "Jobs.Delete": { roles: ["tenant_admin"] },
86:     "Jobs.AssignUsers": { roles: [] },
87:     "Jobs.ApproveCompletion": { roles: ["tenant_admin", "projektledare"] },
88:   },
89:   documents: { "Documents.View": { roles: ["tenant_admin", "projektledare"] } },
90:   files: {
91:     // Phase A has neither job_members nor file-owner assignment scope. Montör
92:     // access therefore stays closed rather than becoming a tenant-wide grant.
93:     "Files.View": { roles: ["tenant_admin", "projektledare"] },
94:     "Files.Create": { roles: ["tenant_admin", "projektledare"] },
95:     "Files.Edit": { roles: ["tenant_admin", "projektledare"] },
96:   },
97: } as const satisfies Record<string, ModulePermissions>;
98: 
99: // Sensitive fields are always tenant-scoped; platform classification rows never
100: // enter this matrix or any tenant-role entitlement calculation.
101: export const SENSITIVE_FIELD_MATRIX: Record<string, Record<string, TenantPermissionRow>> = {
102:   quotes: {
103:     sales_price_ore: { roles: ["tenant_admin", "projektledare", "saljare", "ekonomi"] },
104:     cost_price_ore: { roles: ["tenant_admin", "projektledare", "ekonomi"] },
105:     contribution_margin_ore: { roles: ["tenant_admin", "projektledare", "ekonomi"] },
106:     acceptedValueOre: { roles: ["tenant_admin", "projektledare", "ekonomi"] },
107:   },
108: };
109: 
110: export type CapabilityResolution = { readonly granted: boolean };
111: 
112: export function resolveCapability(input: {
113:   readonly roles?: readonly unknown[];
114:   readonly module?: unknown;
115:   readonly capability?: unknown;
116:   readonly matrix?: unknown;
117: }): CapabilityResolution {
118:   if (typeof input.module !== "string" || typeof input.capability !== "string") return { granted: false };
119:   const matrix = input.matrix === undefined ? PERMISSION_MATRIX : input.matrix;
120:   if (!matrix || typeof matrix !== "object") return { granted: false };
121:   const matrixModule = (matrix as Record<string, unknown>)[input.module];
122:   if (!matrixModule || typeof matrixModule !== "object") return { granted: false };
123:   const row = (matrixModule as Record<string, unknown>)[input.capability];
124:   if (!row || typeof row !== "object" || !Array.isArray((row as { roles?: unknown }).roles)) return { granted: false };
125:   const allowed = (row as { roles: unknown[] }).roles;
126:   if (!allowed.every(isTenantRole)) return { granted: false };
127:   return { granted: normalizeRoles(input.roles).some((role) => allowed.includes(role)) };
128: }
129: 
130: export function resolveSensitiveFieldEntitlement(input: {
131:   readonly roles?: readonly unknown[];
132:   readonly module?: unknown;
133:   readonly field?: unknown;
134: }): { readonly withheld: boolean } {
135:   if (typeof input.module !== "string" || typeof input.field !== "string") return { withheld: true };
136:   const fields = SENSITIVE_FIELD_MATRIX[input.module as keyof typeof SENSITIVE_FIELD_MATRIX];
137:   const row = fields && (fields as Record<string, TenantPermissionRow>)[input.field];
138:   if (!row || !Array.isArray(row.roles) || !row.roles.every(isTenantRole)) return { withheld: true };
139:   return { withheld: !normalizeRoles(input.roles).some((role) => row.roles.includes(role)) };
140: }
141: 
142: export function permissionMatrixModuleIds(matrix: unknown = PERMISSION_MATRIX): string[] {
143:   if (!matrix || typeof matrix !== "object") return [];
144:   return Object.entries(matrix as Record<string, unknown>)
145:     .filter(([, capabilities]) => capabilities && typeof capabilities === "object" && Object.keys(capabilities).length > 0)
146:     .map(([moduleId]) => moduleId);
147: }
148: 


## Committed source context tests/support/bookings-atdd.ts:187-213

187: export async function withBookingFixture(run: (fixture: Awaited<ReturnType<typeof seedBookingFixture>>) => Promise<void>) {
188:   const roleFixture = await createRoleAwarePhaseAFixture();
189:   try { await run(await seedBookingFixture(roleFixture)); }
190:   finally { await cleanupRoleAwarePhaseAFixture(roleFixture); }
191: }
192: async function seedBookingFixture(roleFixture: Awaited<ReturnType<typeof createRoleAwarePhaseAFixture>>) {
193:   const { base, users } = roleFixture;
194:   const seedProfile = async (tenantId: string, user: FixtureUser) => {
195:     const [membership] = await adminQuery<{ id: string }>(
196:       "select id from public.tenant_memberships where tenant_id=$1 and user_id=$2", [tenantId, user.id]);
197:     const id = crypto.randomUUID();
198:     await adminQuery("insert into public.person_profiles(id,tenant_id,membership_id) values($1,$2,$3)", [id, tenantId, membership.id]);
199:     return { id, membershipId: membership.id };
200:   };
201:   const [adminProfile, ownProfile, coworkerProfile, foreignProfile] = await Promise.all([
202:     seedProfile(base.tenantA.id, base.adminA), seedProfile(base.tenantA.id, users.montor),
203:     seedProfile(base.tenantA.id, users.projektledare), seedProfile(base.tenantB.id, base.adminB),
204:   ]);
205:   const [adminClient, plannerClient, montorClient, foreignClient] = await Promise.all([
206:     makeAuthedServerClient(base.adminA), makeAuthedServerClient(users.projektledare),
207:     makeAuthedServerClient(users.montor), makeAuthedServerClient(base.adminB),
208:   ]);
209:   return { ...roleFixture, adminProfile, ownProfile, coworkerProfile, foreignProfile,
210:     adminClient, plannerClient, montorClient, foreignClient,
211:     tenantIds: [base.tenantA.id, base.tenantB.id] };
212: }
213: export type BookingFixture = Awaited<ReturnType<typeof seedBookingFixture>>;


## Committed source context node_modules/pg/lib/client.js:368-439

368:   _handleReadyForQuery(msg) {
369:     if (this._connecting) {
370:       this._connecting = false
371:       this._connected = true
372:       clearTimeout(this.connectionTimeoutHandle)
373: 
374:       // process possible callback argument to Client#connect
375:       if (this._connectionCallback) {
376:         this._connectionCallback(null, this)
377:         // remove callback for proper error handling
378:         // after the connect event
379:         this._connectionCallback = null
380:       }
381:       this.emit('connect')
382:     }
383:     const activeQuery = this._getActiveQuery()
384:     this._activeQuery = null
385:     this._txStatus = msg?.status ?? null
386:     this.readyForQuery = true
387:     if (activeQuery) {
388:       activeQuery.handleReadyForQuery(this.connection)
389:     }
390:     this._pulseQueryQueue()
391:   }
392: 
393:   // if we receive an error event or error message
394:   // during the connection process we handle it here
395:   _handleErrorWhileConnecting(err) {
396:     if (this._connectionError) {
397:       // TODO(bmc): this is swallowing errors - we shouldn't do this
398:       return
399:     }
400:     this._connectionError = true
401:     clearTimeout(this.connectionTimeoutHandle)
402:     if (this._connectionCallback) {
403:       return this._connectionCallback(err)
404:     }
405:     this.emit('error', err)
406:   }
407: 
408:   // if we're connected and we receive an error event from the connection
409:   // this means the socket is dead - do a hard abort of all queries and emit
410:   // the socket error on the client as well
411:   _handleErrorEvent(err) {
412:     if (this._connecting) {
413:       return this._handleErrorWhileConnecting(err)
414:     }
415:     this._queryable = false
416:     this._errorAllQueries(err)
417:     this.emit('error', err)
418:   }
419: 
420:   // handle error messages from the postgres backend
421:   _handleErrorMessage(msg) {
422:     if (this._connecting) {
423:       return this._handleErrorWhileConnecting(msg)
424:     }
425:     const activeQuery = this._getActiveQuery()
426: 
427:     if (!activeQuery) {
428:       this._handleErrorEvent(msg)
429:       return
430:     }
431: 
432:     this._activeQuery = null
433:     activeQuery.handleError(msg, this.connection)
434:   }
435: 
436:   _handleRowDescription(msg) {
437:     const activeQuery = this._getActiveQuery()
438:     if (activeQuery == null) {
439:       const error = new Error('Received unexpected rowDescription message from backend.')


## Committed source context node_modules/pg/lib/client.js:603-625

603:   _pulseQueryQueue() {
604:     if (this.readyForQuery === true) {
605:       this._activeQuery = this._queryQueue.shift()
606:       const activeQuery = this._getActiveQuery()
607:       if (activeQuery) {
608:         this.readyForQuery = false
609:         this.hasExecuted = true
610: 
611:         const queryError = activeQuery.submit(this.connection)
612:         if (queryError) {
613:           process.nextTick(() => {
614:             activeQuery.handleError(queryError, this.connection)
615:             this.readyForQuery = true
616:             this._pulseQueryQueue()
617:           })
618:         }
619:       } else if (this.hasExecuted) {
620:         this._activeQuery = null
621:         this.emit('drain')
622:       }
623:     }
624:   }
625: 


## Committed source context node_modules/pg/lib/client.js:734-770

734:   end(cb) {
735:     this._ending = true
736: 
737:     // if we have never connected, then end is a noop, callback immediately
738:     if (!this.connection._connecting || this._ended) {
739:       if (cb) {
740:         cb()
741:         return
742:       } else {
743:         return this._Promise.resolve()
744:       }
745:     }
746: 
747:     if (this._getActiveQuery() || !this._queryable) {
748:       // if we have an active query we need to force a disconnect
749:       // on the socket - otherwise a hung query could block end forever
750:       this.connection.stream.destroy()
751:     } else {
752:       this.connection.end()
753:     }
754: 
755:     if (cb) {
756:       this.connection.once('end', cb)
757:     } else {
758:       return new this._Promise((resolve) => {
759:         this.connection.once('end', resolve)
760:       })
761:     }
762:   }
763:   get queryQueue() {
764:     queryQueueDeprecationNotice()
765:     return this._queryQueue
766:   }
767: }
768: 
769: // expose a Query constructor
770: Client.Query = Query


## Frozen revised design (not implementation or native credit)

# Denial cause-proof revision1 — staged original trace and unmodified baseline

UNALLOCATED proposal, nativecredit0. Author 55db468eef3106ca1b02dc846ba12967a28dc238, checkpoint 56324120f8e08de995e8cc7432ab27f2d0c98635. The original proposal and independent REVISE report are immutable dependencies, not superseded evidence. No source/Spec/old artifact/resource/query/RPC/CI/provider or Git mutation occurred. The only writes are this new revision directory. Exact source/permission/effect bindings are in contract-and-bindings.json.

## Smallest initial decision

ONE representative actual ordinary JWT own-subject manage(create,revision0) call, with a bounded per-invocation closed trace at the real existing erasure branches. Then, only when that observation warrants it, ONE corresponding UNMODIFIED direct-SQL status OR management baseline in a dedicated rollback-only transaction. Not the former eleven-case slice; no RLS010/unmapped scenario expansion, direct rawManage observer, function replacement/clone, new handler, schema, role DDL, membership change, grant, endpoint or SQL transformation in this initial scope. No claim that finer labels resolve the43causes.

The representative case is explicitly named15.5-DIAG001 and is declared only in the wrapper's independently qualified explicit diagnostic mode. Normal test mode does not declare, skip, pass, call or mutate this diagnostic case. Its inventory is separate from the95feature cases; the original15command cases including INT015 remain unchanged. Require a narrowly bound exact title and fixed argv, one worker/no file parallelism, one test max, and no other concurrent consumers of the fresh isolated stack. Do not silently run a broad suite if the pattern matches zero or additional cases. No native test collection/execution was performed in this revision.

## F1 — actual dispatch entrypoint and durable mode

Propose scripts/ci/checkpoint-dispatch.mjs and its existing unit file explicitly. Add ONLY strict --cause-proof true|false; reject duplicates, unknown values and release_validation=true together with diagnostic=true before any POST. Preserve default normal/release behavior and the old three input request when diagnostic is absent/false, so existing branches/records do not depend on a newly deployed workflow input. Diagnostic requests send the fixed new calendar_feed_cause_proof=true input alongside immutable expected_sha/checkpoint_id/release_validation=false. Never accept arbitrary workflow inputs.

Persist an explicit closed verification_mode and matching cause-proof selection in the same exclusive fsynced record BEFORE the only POST. New diagnostic title: checkpoint:cause-proof:<nonce>:<SHA>, matched by the actual workflow run-name and discover/assertOwnedRun. Normal/release titles retain their current byte form. Status, no-run-yet, cancel and terminal receipts report mode/evidenceClass=diagnostic-only; a successful conclusion is never normal acceptance. Preserve actor/triggering_actor/repo/workflow/ref/SHA/UUID/attempt1 checks, bounded discovery, same-state no-repeat dispatch, uncertain POST/cancel custody and uniquely owned cancellation.

Legacy version1 records missing new fields are interpreted only as their existing normal/release selection, never diagnostic. New fields, if present, must be booleans/closed enums and mutually consistent; unknown/corrupt selections fail closed. Status/cancel must use the persisted mode, not a new flag. Missing diagnostic output does not downgrade the run to normal. A mode mismatch between title/state/receipt/input-derived workflow admission refuses qualification.

Workflow availability remains an explicit pre-dispatch blocker, not assumed from workflow id=active. Proposed bounded fixed GitHub GETs establish the actual active ci.yml/default-branch presence and read the exact candidate-SHA workflow input/run-name/admission contract. GitHub documents that workflow_dispatch requires the workflow on the default branch and accepts a ref plus declared inputs. Do not infer that a candidate-only new input is supported by a different hosted definition. If the endpoint/default-branch definition cannot support this exact new diagnostic input or its semantics are uncertain, STOP before POST for Root's separately authorized availability reconciliation; no main update/merge/default workflow edit/ad-hoc dispatch/alternate workflow/retry is authorized here. Preserve an uncertain single-POST record if the server nevertheless refuses or transport fails. No repository API request was taken during this revision.

## F2 — mode-bound capture, artifacts and normal gates

The existing normal db step remains the exact full integration command PLUS pilot probe. Add a separate mutually exclusive diagnostic db step using the same qualified fresh stack binding and fixed wrapper cause-proof mode. Normal mode preserves full reports and all normal/release commands, job dependencies, authority and original artifact paths/names. Diagnostic mode runs no pilot, browser, recovery or optional stream/fixed-browser diagnostic job; record those as NOT_RUN_DIAGNOSTIC, never passed. Verify remains the prerequisite; its ordinary local gates do not create feature acceptance.

The diagnostic child writes nativeJSON only to test-results/calendar-feed-cause-proof/native.json with default/github-actions/json reporters. A closed observation.json and closed receipt.json use the same directory, plus a manifest with actual hashes/availability. Receipt and manifest bind diagnostic-only mode, exact sourceSHA/checkpointUUID/run/attempt1/job and child/report/cleanup state. Only enum/boolean/counter and nonsecret run-binding metadata are allowed. Do not copy private key-name/Vault UUID or other operator-only custody fields into the public diagnostic artifact; retain existing exact custody handling in its existing owner boundary.

Add distinct artifact native-calendar-feed-cause-proof, retention7, upload-artifact@v4, if-no-files-found:error. Its guard is !cancelled() AND explicit workflow_dispatch diagnostic mode, so a test FAILURE still uploads the available diagnostic files. A fixed validation/finalization step runs after failure too: child-started without nativeJSON or case-executed without observation is a capture failure. Setup refusal before child records actual NOT_CREATED availability and its closed stage; it must NOT manufacture a native report or passing test. Upload the actual closed refusal receipt/manifest when available while retaining failure. A malformed/oversize/wrong-mode/report-count>1/missing report after a child or cross-SHA/nonce artifact is rejected.

The normal native-full-integration upload is conditioned !cancelled() AND NOT diagnostic; retain full-integration.json, native-full-integration and missing-file:error. All four original native artifact pairs remain exact in the normal projected workflow; no subset JSON copy/relabel may satisfy them. Original recovery/browser upload steps and conditions remain intact in their unselected jobs. No diagnostic success may be consumed as five required jobs,95feature acceptance, development-complete or delivery evidence. Root's eventual native qualification must read the persisted dispatch mode and diagnostic receipt, then classify the whole run diagnostic-only even if every selected job succeeds. If existing qualifier logic cannot enforce this, it is a named Root-owned adoption blocker, not permission to change a new path silently.

Exact checker scope: tests/support/calendar-feed-ci-contract.ts adds ONLY finite new-mode fragments, actual wrapper LF pin and inverse back to the same original workflow. It rejects changed input/condition/title/mode/argv/reporters/output filename/upload path/source or unrelated workflow bytes. The original fixedChromium inverse hash must stay unchanged. Explicitly propose tests/unit/scripts/verify/ci-native-test-reports.test.ts for distinct raw diagnostic capture and original four pairs, plus tests/unit/scripts/verify/epic-11-pilot-ci-gate.test.ts for normal full+pilot versus diagnostic NOT_RUN. checkpoint-dispatch.test.ts adds exact request/receipt/nonce/attempt/legacy-mode controls. Existing docs-acceptance and fixed-Chromium application tests are READONLY context and must pass unchanged through exact inversion. Any need to edit them or another consumer stops for exact new allocation.

## Original-call capture and its first decision

Keep the finite trace in the existing owned adapter using module-private AsyncLocalStorage.run; explicit fixture scope only, absent-store application calls inert. Max16 entries, fixed truncation, existing own-data/getter/proxy/cycle/depth/node bounds retained. No error/message/stack/cause/result/claims/proof/token/URL retention, generic client/RPC/thenable observer, extra .then or new SQL/HTTP operation. Record only already-consumed result/error-code branches, plus compile-time phase. Preserve call order, once-call counts, original returned values/errors, cached command declarations, capability/auth/proof/state/settlement semantics.

The fixture may supply expected own tenant/user/membership/attempt/action/revision in memory. At the existing execute context and adapter call, emit ONLY fixed equality booleans confirming that the actual selected context and nonsecret primitive intent match that controlled fixture. No raw identifiers or signing material leave the scope. Missing/mismatched context is INCOMPARABLE, not permission to select another tenant. No actual PostgREST database session identity is inferred from configured client or SupAdmin setup.

If input/envelope fails before a SQL call, the exact existing stable result code and phase can justify the next tightly scoped auth/context/RBAC/validation question; no SQL baseline is run. SERVER_ERROR remains unknown within its phase, not a native engine stage. If the actual statusRPC or managementRPC existing branch returns42501, select only that baseline. Other codes/shapes/ordinary success/conflict/replay are their own finite outcomes and stop rather than forcing a denial. The trace does not observe a public Next child and cannot diagnose API019's later unexecuted telemetry checks.

## Unmodified rollback-only baseline

Reuse existing fresh isolated stack, ledger/feed-owner and sole captured SupAdmin transport qualifications without assuming old grants allocate this new execution. One dedicated baseline client and one independently qualified cleanup verifier; no pool/new credential/principal. Verify actual original session=current SupAdmin LOGIN+SUPER and all four exact effective privacy values on each client before parameterized sensitive work. Preserve wrapper key install/COMMIT uncertainty/exact deletion/custody; no new Vault call. All queries have bounded statement/lock/time limits.

BEGIN REPEATABLE READ; read and hash exact deployed function source/owner/ACL/proconfig/signature and owned token/audit state in memory, without emitting definitions/rows/values. Savepoint, transaction-local request claims, and explicitly proposed SET LOCAL SESSION AUTHORIZATION authenticated are the ONLY identity effects: no CREATE/ALTER ROLE, persistent role setting, membership/grant or catalog repair. Immediately before the selected ORIGINAL function invocation verify session_user=current_user=authenticated, both nonSUPER/nonBYPASS, auth.uid equals the owned expected subject, and fixed claim/context equality flags. This session-only switch requires fresh exact admission; original PG17 allocation does not grant it. Never substitute a privileged call to bypass the restricted qualification.

For status baseline use only the matched controlled tenant/attempt. For management construct NEW controlled60s proof using the existing canonical/signing code and runtime key in memory, with a fresh UUID intent/hash. This is not the actual historical signing bytes. Verify finite stable clock-window/current-state predicates before/after; Repeatable Read does not freeze clock_timestamp. Call the corresponding function once, preserve the true feed-owner SECURITY DEFINER boundary, and retain only an allowlisted external SQLSTATE or fixed success/conflict/shape outcome. The verifier remains exactly unmodified, including WHEN OTHERS→false.

ROLLBACK TO SAVEPOINT before further statements after any expected error. Unconditionally FULL ROLLBACK after all actual query promises settle; on an unexpected aborted transaction FULL ROLLBACK must precede reset. RESET SESSION AUTHORIZATION/RESET ROLE, verify original identity, source/owner/ACL and exact owned state using same and independently qualified fresh client, then close both. Preserve primary and ALL cleanup/reset/close failures using bounded closed records. An uncertain connection is never pooled/reused; retain failure/custody, no broad deletion. A baseline rollback does not undo committed ordinary JWT/fixture/auth transactions, prior key commit or sequence advancement.

Initial SQL has NO DDL/transformation, clone, grant, actual persistent role change, new exception handler, phase side channel, raw error parsing, notice/GUC observation channel or public endpoint. It may acquire existing function/table/tenant advisory locks; exclusive fresh-stack/no-other-consumer qualification and finite lock timeout are mandatory. The single test child is serial; no fault/barrier DDL overlaps it. The new baseline still is not the original PostgREST session, transaction snapshot, clock or proof. All such differences must be reported as explicit equivalence limits.

## F3 and staged stop matrix

- Actual pre-SQL stable denial code: the existing envelope boundary is observed; no baseline. Inner resolver SERVER_ERROR or capability/context discrepancy remains a precise named gap, not a generic backend permission claim.
- Original-call42501 plus baseline42501: establishes a present controlled ORIGINAL-function denial under a verified restricted context. It does NOT distinguish explicit guard, helper permission, verifier caught error or another engine42501. Report AMBIGUOUS_SQL42501, owner=Root/sensitive delegate, stop. No local SQL phase variable exists or is propagated.
- Original-call42501 plus baseline success/conflict/other/mismatch/expiry/state instability: NONREPRODUCED/INCOMPARABLE, no historical attribution/fix. Root resolves the exact context/time/input transport gap before a new plan.
- Baseline unmapped/uncaught engine error: UNKNOWN_ENGINE_ERROR with only allowlisted external code if available. No error text, context or invented engine-stage attribution. Stop.
- Any actual request/query still pending, identity/source/ACL/owned-state drift, rollback/reset/fresh verification/close failure: CLEANUP_UNVERIFIED; retain custody/primary+cleanup, no next probe or rerun.

Only a separately challenged, allocated next proposal may choose one exact needed function/guard observation after a stable reproduced boundary. It must solve F3 explicitly before claiming engine phase; a new outer handler changes subtransaction behavior and cannot be silently added. This revision does not preallocate any transformation, all-three-functions change or initial broad scenario pass. No full2039/browser run follows merely from finer labels or one ambiguous baseline. A later cause-driven product fix still requires independent committed latest-delta High review and real unchanged ordinary-JWT functionality followed by all mandatory normal CI gates.

## Planned controls, current limits and ownership

Retain67 existing pure controls. Add faithful actual-source trace calls/once/value/error identity, concurrent/nested isolation, absent-store inertness, bounded privacy and installed in-memory reporter transport. Add injected fixed runner mode, one-case argv, receipt/manifest availability/capture failure, strict dispatcher persisted-before-POST/uncertainty/no-retry/legacy records and workflow/raw upload/mode negatives. No native test collection/services are part of proposal validation. Producer lint only is executed in this preparation.

contract-and-bindings.json enumerates EVERY proposed source path and exact hunk, raw SHA, actual Git-clean/checkpoint/author blobs, protected109/37 overlap and union change. Current69 membership is provenance, NOT write authority. New dispatcher ownership and all shared CI/admission/consumer claims require current Root/Coordinator reconciliation. Original frozen proposal, REVISE report and all11failed histories/capsules remain untouched. RLS010 first assertion, other scenarios/direct-RLS erasures,43DB causes,14browser failures and contentNULL privacy remain unresolved/deferred. No source change, native cause or acceptance is claimed.


## Frozen qualification plan (private consumer unborn until later gates)

# Diagnostic-only native qualification adoption

**ADOPTED PLAN ONLY; native execution remains blocked.** Independent Sol6.1 High qualifier, route `plan-native-cause-proof-qualification`. Baseline source `55db468eef3106ca1b02dc846ba12967a28dc238`, checkpoint `56324120f8e08de995e8cc7432ab27f2d0c98635`. Revision1 and its independent PASS-with-limits are adopted as the bounded first-proof contract, not code PASS, execution authority, a cause finding, development completion or release acceptance. This task changes only these new planning artifacts.

Root subsequently supplied the accepted exact14-path allocation (identity in manifest). Implementation is allocated and in progress; its completion, independent committed-delta High review, meaningful controls, refreshed source freeze and exact-head native admission remain pending. The captured current-source incompatibilities below describe the verified baseline; they are not claims that later author edits have already fixed them. Subsequent source edits by the allocated author are permitted; this packet makes no later whole-worktree-clean claim.

## 1. Before the only POST

Root remains the sole dispatcher, status/job poller and mutation owner. A future run needs one freshly assigned SHA/ref/checkpoint UUID and a private exclusive fsynced state record. Admit exact implementation/effect allocation, committed source/lock/dependency bindings, independent latest-delta High review and current pure mode/capture/settlement/privacy controls first. Do not edit or reuse any frozen failed packet as the new collector.

The future dispatcher must reject unknown/duplicate cause-proof values, release=true or optional diagnostics with cause-proof=true before POST. Normal/false requests retain the old three-input payload and old titles. Legacy version1 records missing mode mean only their existing normal/release choice; unknown/inconsistent fields fail closed. Diagnostic state explicitly binds `verification_mode=calendar-feed-cause-proof`, `evidenceClass=diagnostic-only`, selection=true and release=false BEFORE POST. Status, no-run-yet, cancellation uncertainty and terminal receipts use that persisted choice, never a newly supplied flag. No repeated POST after uncertainty.

Availability is an unsatisfied pre-POST gate: bounded fixed GET evidence must bind repository/default-branch workflow presence, active workflow ID/path and exact candidate-SHA input/run-name/admission definition. Workflow id=active alone is insufficient. Candidate-only support or service input compatibility that remains uncertain stops as `WORKFLOW_INPUT_AVAILABILITY_UNKNOWN`, owner Root, next action separately authorized availability reconciliation. No main/default workflow edit, merge, alternate workflow, ad-hoc request or retry follows from this plan. No such GET was performed here.

After the one admitted POST, require exact repo/workflow path+ID/event/ref/full SHA/checkpoint UUID/title, actor+triggering actor and attempt1. Bind the fixed request, persisted state, actual diagnostic run-name and executed workflow admission's input-derived mode receipt. Contradictory/missing mode or nonce is `MODE_OR_IDENTITY_MISMATCH`; never infer normal mode from missing diagnostic output. Raw GitHub status/event bodies are not public diagnostic evidence.

## 2. Whole run classification and capture

Classify the WHOLE run `DIAGNOSTIC_ONLY`, regardless of selected-job success. Verify may supply actual prerequisite checks; db supplies only DIAG001. Normal full DB/RLS, pilot, browser, recovery and four optional diagnostics are `NOT_RUN_DIAGNOSTIC`, not passes or accepted case skips. Diagnostic positive/failure/absence counts are separate from feature95, normal full2039, prior17 browser and recovery1. Normal acceptance credit is always zero; development_complete=false, release_ready=false, no delivery/DONE/status flip. No successful diagnostic receipt may satisfy the five normal required jobs.

Require explicit-mode-only exact full title `15.5-DIAG001`, fixed frozen argv/reporters/output path, one worker/no file parallelism, actual selected/declaration count exactly1 and at most1 executed case. A describe prefix causing zero matches, extra selected case or broad fallback is a capture failure. Normal mode must not declare, skip, pass or execute DIAG001. Preserve original15 command cases including INT015.

Only `native-calendar-feed-cause-proof`, retention7, captures `test-results/calendar-feed-cause-proof/{native.json,observation.json,receipt.json,manifest.json}`. Failure-capable finalization/upload is bound to workflow_dispatch+diagnostic mode and !cancelled(); normal report paths/names and full+pilot remain exact in normal mode. Before dispatch, implementation must freeze finite schemas/byte/event caps and negative controls; no unbounded parser or alternate filename.

Receipt/manifest jointly bind mode/evidenceClass, source SHA, checkpoint UUID, run ID, attempt1, job, child started/settled, actual declared/executed/failed/passed counts, observation/report availability, baseline0-or1, cleanup flags and fixed failure codes. Hash every available original file and archive, record bytes and API digest, reject cross-run/mode/nonce/oversize/malformed/multiple-case input. A pre-child refusal records actual `NOT_CREATED` plus its closed stage; it cannot manufacture native JSON or a passing case. Child started without native JSON, or executed case without observation, is `CAPTURE_FAILED`. Cancelled/incomplete upload or unavailable content stays unqualified, not zero/pass/leak.

Producer privacy must be qualified before dispatch and then checked on available artifacts: bounded closed trace max16 with truncation, fixed booleans/enums/counters only, no raw identifiers/claims/intent/hash/proof/key/Vault identity/error/message/stack/cause/body/URL/SQLarguments/IP. Native reporter failures must remain sanitized at the owned boundary, not expose raw assertion operands or native errors. Collector reads original data in memory and emits only admitted fixed fields/digests; it must not sanitize/relabel a subset into a normal report. Public custody is only fixed retained/verified/failed state; exact UUID/name custody remains in the existing private operator boundary.

## 3. One actual call, then at most one baseline

Make ONE real ordinary own-JWT `manage(create,revision0)` call through the unchanged resolver/envelope/status/manage flow. Observe only already-consumed stable branch/code/shape plus compile-time phase through scoped AsyncLocalStorage.run. Absent-store calls remain inert; preserve cached commands, once-call order, values/errors and all authorization/proof semantics. No generic client/RPC/thenable observer, extra .then, getter inspection, extra SQL/HTTP or public Next child is implied.

Fixture comparisons emit only equality booleans for selected tenant/user/membership/attempt/action/revision at actual context and adapter sites. Missing/mismatched equality is INCOMPARABLE. SupAdmin setup/client configuration never establishes the actual PostgREST session identity. Pre-SQL stable denial or SERVER_ERROR stops with its exact observed boundary/gap and NO SQL baseline. Ordinary success/conflict/replay, other code/shape or absent trace stops without forcing denial.

Only an actual observed statusRPC42501 or managementRPC42501 may select ONE corresponding ORIGINAL UNMODIFIED function baseline, not both. Admit a dedicated baseline client plus an independently qualified fresh cleanup verifier using the sole captured fresh-stack SupAdmin transport, no pool/new credential. Qualify actual original session=current SupAdmin LOGIN+SUPER and exact effective privacy4 on each before sensitive parameterized work. Separately admit SET LOCAL SESSION AUTHORIZATION authenticated; immediately before the original call require session=current authenticated, nonSUPER/nonBYPASS, expected owned auth.uid and claim/context equality. Failure stops; never substitute SupAdmin invocation. Preserve the real feed-owner SECURITY DEFINER boundary and original verifier including WHEN OTHERS-to-false.

One rollback-only Repeatable Read transaction/savepoint; bounded statement/lock/time limits; source/owner/ACL/proconfig/signature and exact owned token/audit equality checked in memory before/after. Status uses matched controlled tenant/attempt. Manage uses a NEW controlled60s proof from existing signing code/runtime key, fresh intent/hash. It is not the original signing bytes. Record fixed clock-window/state predicates before/after; snapshot stability is not clock freezing. Different PostgREST session, transaction/snapshot, proof, intent/hash, current state and advancing clock prevent historical/byte equivalence. Equality flags qualify only their stated dimensions.

No function replacement/clone/handler/SQL transformation, schema/role/membership DDL, grant/revoke/privilege repair, new Vault operation, phase side channel or public endpoint is allowed. One serial child on a qualified fresh exclusive stack; no other consumer, key overlap or fault/barrier DDL.

## 4. Settlement, rollback and custody

Prove settlement of the ACTUAL ordinary-command promise at its owned await boundary; the existing pendingRequests set covers public fetches and is insufficient. Also prove every actual SQL query, HTTP request/body, timer and child GROUP/done/output is settled/drained before dependent rollback or fixture/key cleanup. A deadline/abort/exit code alone is not settlement. No new generic observer is allocated by this requirement.

After an expected SQL error, ROLLBACK TO SAVEPOINT precedes further statements. After unexpected aborted state, FULL ROLLBACK precedes reset. Unconditionally FULL ROLLBACK once actual queries settle, reset session authorization/role, verify original identity/catalog/owned state on the same client and the qualified fresh verifier, then close both. Retain primary and every rollback/reset/verification/close failure as bounded closed outcomes. Uncertain connections are never pooled/reused.

Rollback does not undo committed ordinary JWT/auth/fixture effects, key COMMIT uncertainty or sequences. Exact-owned row/auth cleanup and captured UUID+name key deletion/absence remain separately required. Any pending operation, drift, failed rollback/reset/fresh verification/close or unconfirmed child/key absence is CLEANUP_UNVERIFIED: retain private custody, stop all further probes/reruns. Job completion is not a key-absence assertion. Preserve all11 failed packets, prior browser custody limits and unavailable attachment content=NULL.

## 5. Staged decision rules

| Observation | Qualified statement and stop |
|---|---|
| Stable pre-SQL denial/code | Actual envelope boundary only; no baseline; name next auth/context/RBAC/validation question. SERVER_ERROR remains unknown in its phase. |
| Original42501 + corresponding baseline42501 | Present controlled original-function denial; AMBIGUOUS_SQL42501. Cannot distinguish explicit guard/helper permission/caught verifier error/other42501. Stop for separately challenged minimal next proof. |
| Baseline success/conflict/other, expiry, mismatch or state instability | NONREPRODUCED or INCOMPARABLE; no historical cause/fix. Root owns exact context/input/clock gap. |
| Unmapped/uncaught engine error | UNKNOWN_ENGINE_ERROR; allowlisted external code only, no raw message or invented engine stage. |
| Missing trace/report, identity/mode/count mismatch | Evidence/capture failure, zero normal acceptance; no fallback. |
| Pending/drift/cleanup uncertainty | CLEANUP_UNVERIFIED, retain failure/custody; no next probe. |

Every unresolved result names owner Root/sensitive delegate, actual bounded evidence, minimal next proof and exact resume condition. No repeated full2039/browser run follows from labels, ambiguous reproduction or diagnostic success. Any product fix later needs separately reviewed committed delta, real unchanged ordinary-JWT functional evidence and all mandatory NORMAL development gates.

## 6. Compatibility and allocation ledger

- `scripts/ci/checkpoint-dispatch.mjs` and existing unit: baseline rejects --cause-proof, persists only normal/release and matches old title. `.github/workflows/ci.yml` has no diagnostic input/title/admission. These are real baseline incompatibilities; their exact proposed hunks are now allocated, NOT yet qualified as implemented.
- `tests/support/calendar-feed-ci-contract.ts` pins wrapper LF SHA and only two normal fragments. `ci-native-test-reports.test.ts` pins four original report pairs; `epic-11-pilot-ci-gate.test.ts` requires normal full+pilot. Their finite mode-aware changes are among allocated14. Require exact normal projection/inverse and negative unrelated-byte/argv/mode/report tests.
- `tests/unit/docs/acceptance-gate-report-validators.test.ts` and `tests/unit/scripts/verify/fixed-chromium-application-admission.test.ts` remain READONLY; fixed-Chromium inverse SHA48adc320f459b648212ee87950facc76cdda306bb0a14e72f2786c67c2c689e0 stays exact. Any needed edit to them or another source consumer requires new exact allocation; no silent upgrade.
- Frozen eleventh `collect-runtime.mjs` binds head/attempt but not persisted mode; its `finalize-packet.py` assumes normal9jobs/5gates. Neither is a diagnostic consumer. Preserve them unchanged. Root may explicitly assign NEW ignored diagnostic packet files `collect-diagnostic-evidence.py`, `diagnostic-qualification.json`, `diagnostic-qualification.md`, `manifest.json` after the future exact checkpoint is known. Effects: bounded authorized completed-evidence GETs, in-memory closed parsing, mode/identity/availability/count/hash qualification and zero normal acceptance. No new existing source consumer change is required by this adoption; any discovered need stops for exact allocation. Root remains sole poller.

Actual checks here: input SHA/bytes,4 proposal manifest members,10 immutable refs,25 raw/clean/index/author/checkpoint context bindings with50 blob checks,69 frozen source/index bindings, and bounded source reads of the actual consumers/call/settlement boundaries. These matched when read; no atomic or later working-tree-clean claim. No application controls, collection, lint/build/install, SQL/RPC/resource/browser/CI/provider operation executed. All implementation controls and native checks above are PLANNED, not passed by this plan.
