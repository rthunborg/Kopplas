---
stepsCompleted: ['step-01-load-context', 'step-02-discover-tests', 'step-03-map-criteria', 'step-04-analyze-gaps', 'step-05-gate-decision']
lastStep: 'step-05-gate-decision'
tempCoverageMatrixPath: 'C:/DEV/Kopplas/tmp/private/35-6-35-7-coordinator-2026-11-09/product-35-14-E8-trace-phase1-matrix-20261113.json'
collectionStatus: COLLECTED
sourceSha: '0a92b1f92f5ec3835955ebc56de51812b7ad0ef0'
lastSaved: '2026-11-13'
coverageBasis: acceptance_criteria
oracleResolutionMode: formal_requirements
oracleConfidence: high
oracleSources:
  - _bmad-output/specs/spec-design-35-14/source-intent.md
  - _bmad-output/specs/spec-design-35-14/source-test-design.md
  - _bmad-output/specs/spec-design-35-14/test-design.md
  - _bmad-output/specs/spec-design-35-14/operative-contract.md
externalPointerStatus: not_used
---

# E19.1 one-story epic integration trace

Create mode; gate_type=epic; allow_gate=true. Rasmus; English. Sol gpt-6.1-sol Low, ordinary evidence mapping. Sensitive authority/money/RLS conclusions are reused only from qualified independent High records, not re-reviewed or newly decided here. Source under trace is actual merged M `0a92b1f92f5ec3835955ebc56de51812b7ad0ef0`; H implementation `cb5495f871136cc5e619836e002f4418cfd57ea2` remains frozen.

## Step 1 â€” Oracle and workflow context

The formal oracle is the seven unchanged E35-14-AC1..AC7 and eleven Applies STATE/T pairs. E19.1 only; E19.2, new mutations/files/dialogs and pending/Phase C surfaces are excluded. Historical preparation status in source-intent and provisional worker prose is provenance, not a fresh readiness judgment. Operative admitted contract, approved completion/readmission decisions and actual qualified H/M evidence control current trace eligibility. Confidence high in requirement identity; no synthetic oracle or external requirements resolution is needed.

Retained coordinator E2 adoption: `C:/DEV/Kopplas/tmp/private/e35-14-20261112/coordinator/_bmad-output/test-artifacts/test-design-spec-design-35-14.md`, raw SHA256 `5345c42e0b3b4136e21d62b4aa3ba917e3dffcae5cf4f1e6e116b627695801e1`; delegate `/root/dashboard_35_14_e2`, Sol Low, source f5b5a5a6d4097dfc5c614e82efafe1ded6e8f294. It adopted canonical design LF hash `94419c9fdfa1b390a31dfefb9ff0d1e1c578e2f0a54d4a23be0f31f61c31e519`. Its historical C-relative anchor receipt is preserved; this artifact is not copied into T or claimed present there.

Skill activated from the exact local SKILL.md. `uv run ...resolve_customization.py` failed on sandbox interpreter cache persistence; used the specified fallback: base customize.toml has empty prepend/append/persistent facts/on_complete; team/user trace override files absent. No config changed. TEA config supplies English/Rasmus. Parent assignment binds the stock traceability-matrix output to this exact owned `closeout-traceability.md` and quality decision to adjacent `closeout-gate-decision.json`; no shared TEA output/progress companion is written.

Loaded priority, risk-governance, probability-impact, test-quality and selective-testing knowledge. Apply retained P0 for AC2/AC7 and P1 for AC1/3/4/5/6; priority is not a fabricated numeric risk score. Map meaningful positive/negative behavior and execution separately; do not infer assertion coverage from screenshots, test count or skipped bodies. No new quantitative risk/coverage-of-code metric is invented. Project development policy separates required functional/visual evidence from exhaustive deferred release validation. No test/resource/provider/native operation is performed by this trace.

## Step 2 — Discovered static suites and actual execution linkage

collection_mode=contract_static, collection_status=COLLECTED. The rerunnable source suites are present in this checkout. This is not runtime_manifest and no live-results observation is substituted for a test. Exact report hashes were checked against the retained qualified M snapshot. The catalog includes85 predeclared browser identities (54 pipeline,27 role/shell,1 onboarding,3 General design) and26 predeclared integration/RLS assertions. There are111 distinct identities across7 files; no repeated requirement mappings inflate that count. DB-level/API category here means actual integration/RLS command assertions, not a new HTTP endpoint.

Discovery used test IDs/describe names/file patterns and read the actual feature-local General design assertions. Additional unchanged unit support files discovered: widget-registry.test.ts, dashboard.test.ts, quote-pipeline-result.test.ts, quote-pipeline-aggregate.test.ts, quote-pipeline-aggregate-atdd.test.ts and components/dashboard/widget-state.test.ts. Actual unit3923 execution is qualified by High; these support files are not individually recounted or used to inflate111. Separate test quality/NFR appraisal remains assigned to later delegates.

The closed dedicated selector's role/shell/onboarding tests are inherited composition regressions, not an expansion of story-owned scope. No foreign General suite is read or graded as E19.1 requirements. Selected General3 each passed once/retry0 inside a FAILED full General execution. Full-suite52DB/22General skipped identities receive zero coverage. No screenshots alone establish a functional assertion.

### Live Verification Results
```json
{
  "liveManifestHeader": {
    "present": false,
    "results_file": "C:\\DEV\\Kopplas\\tmp\\private\\35-14-dashboard-closeout-20261113\\_bmad-output\\test-artifacts\\live-verification-results.json",
    "source_sha": "",
    "observed_at": "",
    "producer": "",
    "read_error": "",
    "current_source_sha": "0a92b1f92f5ec3835955ebc56de51812b7ad0ef0"
  },
  "liveRecords": []
}
```

### Catalog (stable runtime/source identity; passed cases only within the predeclared partition)
```json
[
  {
    "id": "1df34d8f03df251dc5f7-84bf5bd426046400094e:chromium",
    "title": "[P0] SÃ¤ljare receives only matrix-granted server navigation and lands on dashboard",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 11.2 rollstyrda Phase A-ytor"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 59,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-03bf68f0f8c14020b9a7:chromium",
    "title": "[P0] MontÃ¶r direct navigation to active but ungranted settings has one generic denial and no data",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 11.2 rollstyrda Phase A-ytor"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 71,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-0cd579e4473105259d65:chromium",
    "title": "[P0] MontÃ¶r lands on Min dag with monetary values withheld",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 11.2 rollstyrda Phase A-ytor"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 86,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-a653761fac28371540f1:chromium",
    "title": "[P1] SÃ¤ljare can open its matrix-granted customers route without receiving cost or margin",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 11.2 rollstyrda Phase A-ytor"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 96,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-5327fdea050cea8be86c:chromium",
    "title": "[P0] SÃ¤ljare is never offered calculation-origin quote creation",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 11.2 rollstyrda Phase A-ytor"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 106,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-aa1f2064743eebe9ab06:chromium",
    "title": "[P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded saljare desktop retains supplied order, identity and real utility destinations",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 202,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-33b99db731558b91bf1e:chromium",
    "title": "[P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded montor desktop retains supplied order, identity and real utility destinations",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 202,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-e84cc57c7613b0eb57cd:chromium",
    "title": "[P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded saljare phone retains supplied order, identity and real utility destinations",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 202,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-d68eb1a5bf316495e21b:chromium",
    "title": "[P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded montor phone retains supplied order, identity and real utility destinations",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 202,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-bd87faa3ac1b581a20e0:chromium",
    "title": "[P1] E35-5-T-AC2 E35-5-T-AC4 desktop has 248px sidebar, 56px topbar and 24px content gutters",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 286,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-ea864234cd09ecc13235:chromium",
    "title": "[P1] E35-5-T-AC2 E35-5-T-AC5 E35-5-T-AC6 E35-5-T-focus-dialog phone drawer traps visible focus, restores trigger, cleans resize scroll and reduces actual motion",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 302,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-73d1ac2722b046cda2dd:chromium",
    "title": "[P1] E35-5-T-AC4 phone shell reflows enlarged Swedish text and retains reachable 44px owned targets",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 360,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-7949609507d4bdd10f45:chromium",
    "title": "[P0] E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-revoked rendered SÃ¤ljare link cannot override current isolated MontÃ¶r authority",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 415,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-ea6e925ae4566eb1b501:chromium",
    "title": "[P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry desktop actual sign-out rejection retains server identity and same-command real retry logs out",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 469,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-f68ca511b713751e6d05:chromium",
    "title": "[P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry phone actual sign-out rejection retains server identity and same-command real retry logs out",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 authorized responsive shell"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 469,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-7e3986ce399ddc1fd3e0:chromium",
    "title": "[P1] E35-5-CAP-owned-shell desktop real loaded/profile/drawer originals",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 738,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-3a4c78a052f07415d0de:chromium",
    "title": "[P1] E35-5-CAP-owned-record-context desktop actual empty customers/files/jobs",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 771,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-facc12421dba731919f2:chromium",
    "title": "[P1] E35-5-CAP-owned-connected-context desktop actual scheduling/my-day/preferences",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 792,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-a7b14482f4ec28feded7:chromium",
    "title": "[P1] E35-5-CAP-owned-bell desktop actual empty/populated and controlled local failure",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 832,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-f51c1bfdf26b09665ddc:chromium",
    "title": "[P1] E35-5-CAP-owned-signout desktop actual failure/session proof/real retry/blank login",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 895,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-99ede5e426486bfe5ca1:chromium",
    "title": "[P0] E35-5-CAP-owned-revoked desktop actual revoked denial and current reduced navigation",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 962,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-31ff056091e435060a87:chromium",
    "title": "[P1] E35-5-CAP-owned-shell phone real loaded/profile/drawer originals",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 738,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-c0db098a3ac2a5168335:chromium",
    "title": "[P1] E35-5-CAP-owned-record-context phone actual empty customers/files/jobs",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 771,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-1baae0a958ac081cb6d2:chromium",
    "title": "[P1] E35-5-CAP-owned-connected-context phone actual scheduling/my-day/preferences",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 792,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-969e62ee2c6381587c0a:chromium",
    "title": "[P1] E35-5-CAP-owned-bell phone actual empty/populated and controlled local failure",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 832,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-8883f14db8d70d59f71d:chromium",
    "title": "[P1] E35-5-CAP-owned-signout phone actual failure/session proof/real retry/blank login",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 895,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1df34d8f03df251dc5f7-cd1fa65b87f6f14f04b2:chromium",
    "title": "[P0] E35-5-CAP-owned-revoked phone actual revoked denial and current reduced navigation",
    "describe": [
      "auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
      "Story 35.5 owned originals â€” release only after strict Auth deletion"
    ],
    "file": "tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts",
    "line": 962,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-a26118edd72e0a6f04be:chromium",
    "title": "[P1] 19.1-E2E-011 successive failed retries recover in the same session [AC7]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 565,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-b2be2ca6e30e0ecd17f2:chromium",
    "title": "E35-14-T-AC4 E35-14-T-AC6 E35-14-T-connection-required disconnected retry stays honest and explicitly recovers",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 627,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-da757003095dd613d3c6:chromium",
    "title": "E35-14-T-AC4 E35-14-T-error-retry enlarged phone error retains keyboard recovery",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 656,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-2771e2a8a843ed2d84c9:chromium",
    "title": "E35-14-T-AC6 E35-14-T-late-result completed refresh cannot replace newer quote navigation",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 700,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-62996b691405e6e6b53b:chromium",
    "title": "[P0] tenant_admin has one pipeline card and quotes deep link [AC2]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1-E2E-001 current roles and live card set"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 129,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-585a32a6e622c8a145b6:chromium",
    "title": "[P0] projektledare has one pipeline card and quotes deep link [AC2]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1-E2E-001 current roles and live card set"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 129,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-4e5e64c54d503da377cf:chromium",
    "title": "[P0] saljare has one pipeline card and quotes deep link [AC2]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1-E2E-001 current roles and live card set"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 129,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-f487f22e6696df53b551:chromium",
    "title": "[P0] multi-role has one pipeline card and quotes deep link [AC2]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1-E2E-001 current roles and live card set"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 129,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-a704a6bd8140aea081d2:chromium",
    "title": "[P0] montor has no pipeline, skeleton, false totals or deep link [AC2]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1-E2E-001 current roles and live card set"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 146,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-48cf55c1ce6defb0a4a1:chromium",
    "title": "[P0] ekonomi has no pipeline, skeleton, false totals or deep link [AC2]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1-E2E-001 current roles and live card set"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 146,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-5fb150537ceb51bdf0de:chromium",
    "title": "[P1] 19.1-E2E-002 source counts, adjusted commitment, dates, rate and read time [AC3,9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 actual source consistency and money delivery"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 170,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-1e94b6efff7854911425:chromium",
    "title": "[P0] 19.1-E2E-003 seller amount absent in initial HTML, RSC, DOM/attributes [AC4]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 actual source consistency and money delivery"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 202,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-77f402a2a7b8a591b2be:chromium",
    "title": "[P0] 19.1-E2E-003 entitled control shows actual accepted sentinel [AC4]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 actual source consistency and money delivery"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 248,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-6c2236e19e7fca3924a0:chromium",
    "title": "[P1] 19.1-E2E-004 empty-entitled has honest period/zero/null-rate copy [AC4,5]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 actual source consistency and money delivery"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 256,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-5370a4ecb2912c4129fc:chromium",
    "title": "[P1] 19.1-E2E-004 empty-withheld has honest period/zero/null-rate copy [AC4,5]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 actual source consistency and money delivery"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 256,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-a49f7584585944146b92:chromium",
    "title": "[P1] 19.1-E2E-004 sent-only has honest period/zero/null-rate copy [AC4,5]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 actual source consistency and money delivery"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 256,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-56f21c363385018a9985:chromium",
    "title": "[P1] 19.1-E2E-004 entitled-zero has honest period/zero/null-rate copy [AC4,5]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 actual source consistency and money delivery"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 256,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-17c8ac514d782f7cd1ad:chromium",
    "title": "[P0] 19.1-E2E-005 failure remains local and keeps heading/checklist usable [AC6]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 real server-failure recovery and current authority"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 278,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-0ce14da34b19b5ce7b7e:chromium",
    "title": "[P1] 19.1-E2E-006 retry recovery announces loading without side effects [AC7]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 real server-failure recovery and current authority"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 293,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-8f146dac61f3e85e1b65:chromium",
    "title": "[P1] 19.1-E2E-006 retry failure announces loading without side effects [AC7]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 real server-failure recovery and current authority"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 293,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-49b748632b1da7fd89e4:chromium",
    "title": "[P0] 19.1-E2E-007 quote revoked in same session before retry [AC7]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 real server-failure recovery and current authority"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 320,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-ea158bdf966250f29a90:chromium",
    "title": "[P0] 19.1-E2E-007 money revoked in same session before retry [AC7]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 real server-failure recovery and current authority"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 320,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-63471065d7c5fccb45f6:chromium",
    "title": "[P0] 19.1-E2E-007 session lost before retry returns safely to login [AC7]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 real server-failure recovery and current authority"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 374,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-c6fa94e12496a15c9bae:chromium",
    "title": "[P1] 19.1-E2E-008 success preserves undismissed onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-e3f79c3a0af22448c2ce:chromium",
    "title": "[P1] 19.1-E2E-008 success preserves dismissed onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-14f0e21de05a4305cea1:chromium",
    "title": "[P1] 19.1-E2E-008 success preserves completed onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-28c0dd46c7706e6eaea3:chromium",
    "title": "[P1] 19.1-E2E-008 success preserves non-admin onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-8b284e106a909fba3632:chromium",
    "title": "[P1] 19.1-E2E-008 success preserves invisible onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-2b2a4c695f0e14bb6e3f:chromium",
    "title": "[P1] 19.1-E2E-008 success preserves read-failure onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-b6647131517a77e1aa54:chromium",
    "title": "[P1] 19.1-E2E-008 error preserves undismissed onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-9f5e2293af46221d1545:chromium",
    "title": "[P1] 19.1-E2E-008 error preserves dismissed onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-52db8a2c6f46f8ad6944:chromium",
    "title": "[P1] 19.1-E2E-008 error preserves completed onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-3e14db25c2cb902e7a95:chromium",
    "title": "[P1] 19.1-E2E-008 error preserves non-admin onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-cc94348967a88915df4a:chromium",
    "title": "[P1] 19.1-E2E-008 error preserves invisible onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-58da6d1e10a91f1f9736:chromium",
    "title": "[P1] 19.1-E2E-008 error preserves read-failure onboarding [AC8]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 391,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-e7fff9fcf9e3a8240e1a:chromium",
    "title": "[P1] 19.1-E2E-009 keyboard reaches mask explanation and authorized quotes [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 405,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-8fef65a3ea1e1d0fe296:chromium",
    "title": "[P1] 19.1-E2E-009 tooltip retains real pointer passage into its explanation [AC4,9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 425,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-0c29aeebd544d50b058c:chromium",
    "title": "[P1] 19.1-E2E-009 hover tooltip dismisses Escape while focus remains elsewhere [AC4,9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 440,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-052e4f80ef38fc48aec8:chromium",
    "title": "[P1] 19.1-E2E-009 mobile long press shows role explanation [AC4,9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 455,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-a2c6dc42370f1b2f8e47:chromium",
    "title": "[P1] 19.1-E2E-010 mobile live full-width row fits [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 475,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-f1b4147203e65055cedb:chromium",
    "title": "[P1] 19.1-E2E-010 mobile loading fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-353f8bc477c95b246cd7:chromium",
    "title": "[P1] 19.1-E2E-010 mobile error fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-2e1efa46b1c6a7466a61:chromium",
    "title": "[P1] 19.1-E2E-010 mobile empty fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-114d3f87f3e31fa2cefc:chromium",
    "title": "[P1] 19.1-E2E-010 mobile withheld fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-fca5a056badb535e92bd:chromium",
    "title": "[P1] 19.1-E2E-010 tablet live full-width row fits [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 475,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-908cc3908261591ab5a9:chromium",
    "title": "[P1] 19.1-E2E-010 tablet loading fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-149923e259c3952be019:chromium",
    "title": "[P1] 19.1-E2E-010 tablet error fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-431f85d6e52fe1cda7c1:chromium",
    "title": "[P1] 19.1-E2E-010 tablet empty fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-fe653e10c34564e1300c:chromium",
    "title": "[P1] 19.1-E2E-010 tablet withheld fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-0cbc429e1b403dab7dd9:chromium",
    "title": "[P1] 19.1-E2E-010 desktop live full-width row fits [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 475,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-9fd4ed68bf9de2cf2ee6:chromium",
    "title": "[P1] 19.1-E2E-010 desktop loading fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-10cb6272d359c1be10f1:chromium",
    "title": "[P1] 19.1-E2E-010 desktop error fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-fee4976c6decb518e59a:chromium",
    "title": "[P1] 19.1-E2E-010 desktop empty fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "1ea3a87d46afe6b6db8e-7f8e12fd588db1e4c01c:chromium",
    "title": "[P1] 19.1-E2E-010 desktop withheld fits with useful dimensions [AC9]",
    "describe": [
      "dashboard/dashboard-pipeline.e2e.spec.ts",
      "19.1 onboarding composition and accessible responsive layout"
    ],
    "file": "tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts",
    "line": 533,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "7e54e81723011b355e5a-6ab14fc1848a7a1a3c3d:chromium",
    "title": "[P0] 12.3-E2E-001 ready first Admin sees a server-derived checklist, can dismiss and restore it",
    "describe": [
      "onboarding/first-admin-checklist.e2e.spec.ts"
    ],
    "file": "tests/e2e/onboarding/first-admin-checklist.e2e.spec.ts",
    "line": 8,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-dashboard-browser.json"
  },
  {
    "id": "d1a4d5cccaa55fd469ff-067a973e3e7932ef9372:chromium",
    "title": "E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 360 connected facts and keyboard destination",
    "describe": [
      "dashboard/dashboard-design.e2e.spec.ts"
    ],
    "file": "tests/e2e/dashboard/dashboard-design.e2e.spec.ts",
    "line": 40,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-general.json"
  },
  {
    "id": "d1a4d5cccaa55fd469ff-fc0a51c72edd9a30edac:chromium",
    "title": "E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 1280 connected facts and keyboard destination",
    "describe": [
      "dashboard/dashboard-design.e2e.spec.ts"
    ],
    "file": "tests/e2e/dashboard/dashboard-design.e2e.spec.ts",
    "line": 40,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-general.json"
  },
  {
    "id": "d1a4d5cccaa55fd469ff-23e9197dbd7fbd759365:chromium",
    "title": "E35-14-T-AC2 E35-14-T-AC4 phone values remain in one column through enlarged text",
    "describe": [
      "dashboard/dashboard-design.e2e.spec.ts"
    ],
    "file": "tests/e2e/dashboard/dashboard-design.e2e.spec.ts",
    "line": 75,
    "level": "e2e",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "attempts": 1,
    "retry": 0,
    "report": "release-general.json"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money",
    "title": "[P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment",
    "title": "[P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel",
    "title": "[P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant",
    "title": "[P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant",
    "title": "[P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read",
    "title": "[P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority",
    "title": "[P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry",
    "title": "[P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader",
    "title": "[P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result",
    "title": "[P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches",
    "title": "[P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches",
    "describe": [],
    "file": "tests/integration/rls/dashboard-pipeline.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete",
    "title": "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete",
    "describe": [
      "10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant)"
    ],
    "file": "tests/integration/rls/quote-pipeline-read-model.rls.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget",
    "title": "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget",
    "describe": [
      "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path"
    ],
    "file": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)",
    "title": "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)",
    "describe": [
      "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path"
    ],
    "file": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)",
    "title": "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)",
    "describe": [
      "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path"
    ],
    "file": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget",
    "title": "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget",
    "describe": [
      "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path"
    ],
    "file": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules",
    "title": "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules",
    "describe": [
      "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path"
    ],
    "file": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  },
  {
    "id": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)",
    "title": "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)",
    "describe": [
      "10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path"
    ],
    "file": "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts",
    "line": null,
    "level": "api",
    "status": "active",
    "skipped": false,
    "pending": false,
    "fixme": false,
    "execution_status": "passed",
    "report": "release-integration.json",
    "mappingBasis": "Existing sensitive assertion/result qualification reused from independent High; no new Low authority/money judgment"
  }
]
```

coverage_heuristics: no new endpoint required; actual positive/negative eligibility/revocation/withheld and failure/retry/loading/empty/late-result seams present. /dashboard and sole real /quotes destination have E2E assertions; / role landing and onboarding preserved by inherited tests. No N/A mutation/file/dialog row is counted as missing. Detailed mapping follows in Step3.

## Step 3 — Seven-AC traceability matrix

FULL means the applicable bounded development behavior has rerunnable assertions and qualified actual M execution; it is not exhaustive release coverage. Original IDs are retained. Legacy19.1 test titles contain their own historical [AC2..9] references; the mapping below binds them explicitly to E35-14-AC1..7 and does not rename tests.

### E35-14-AC1 / E35-14-T-AC1 (P1) — FULL

Registry-backed isolated read, current facts/freshness, one real destination. Given the admitted eligible/current-source fixture, when the real read is delayed/fails/retried or completes, then heading/onboarding remain usable, loading/error are local, server freshness/facts update only after success and the single real /quotes destination works.

Mapped 12 catalog identities (deduplicated globally):
- `1ea3a87d46afe6b6db8e-a26118edd72e0a6f04be:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:565`: [P1] 19.1-E2E-011 successive failed retries recover in the same session [AC7]
- `1ea3a87d46afe6b6db8e-62996b691405e6e6b53b:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] tenant_admin has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-585a32a6e622c8a145b6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] projektledare has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-4e5e64c54d503da377cf:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] saljare has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-f487f22e6696df53b551:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] multi-role has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-5fb150537ceb51bdf0de:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:170`: [P1] 19.1-E2E-002 source counts, adjusted commitment, dates, rate and read time [AC3,9]
- `1ea3a87d46afe6b6db8e-17c8ac514d782f7cd1ad:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:278`: [P0] 19.1-E2E-005 failure remains local and keeps heading/checklist usable [AC6]
- `1ea3a87d46afe6b6db8e-0ce14da34b19b5ce7b7e:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:293`: [P1] 19.1-E2E-006 retry recovery announces loading without side effects [AC7]
- `1ea3a87d46afe6b6db8e-8f146dac61f3e85e1b65:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:293`: [P1] 19.1-E2E-006 retry failure announces loading without side effects [AC7]
- `d1a4d5cccaa55fd469ff-067a973e3e7932ef9372:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:40`: E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 360 connected facts and keyboard destination
- `d1a4d5cccaa55fd469ff-fc0a51c72edd9a30edac:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:40`: E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 1280 connected facts and keyboard destination
- `d1a4d5cccaa55fd469ff-23e9197dbd7fbd759365:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:75`: E35-14-T-AC2 E35-14-T-AC4 phone values remain in one column through enlarged text

### E35-14-AC2 / E35-14-T-AC2 (P0) — FULL

Withheld payload absence, genuine zero, one-column phone facts/context. Given entitled and withheld fixtures, when reading/rendering current pipeline and revoking money permission, then actual forbidden acceptedValueOre is absent in initial HTML/RSC/DOM rather than zero; authoritative zero/null-rate remain distinct. Existing High-qualified sensitive assertions supply the invariant; General enlarged phone asserts one metric column, all real labels and reachable destination.

Mapped 39 catalog identities (deduplicated globally):
- `1ea3a87d46afe6b6db8e-1e94b6efff7854911425:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:202`: [P0] 19.1-E2E-003 seller amount absent in initial HTML, RSC, DOM/attributes [AC4]
- `1ea3a87d46afe6b6db8e-77f402a2a7b8a591b2be:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:248`: [P0] 19.1-E2E-003 entitled control shows actual accepted sentinel [AC4]
- `1ea3a87d46afe6b6db8e-6c2236e19e7fca3924a0:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 empty-entitled has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-5370a4ecb2912c4129fc:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 empty-withheld has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-a49f7584585944146b92:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 sent-only has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-56f21c363385018a9985:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 entitled-zero has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-ea158bdf966250f29a90:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:320`: [P0] 19.1-E2E-007 money revoked in same session before retry [AC7]
- `1ea3a87d46afe6b6db8e-114d3f87f3e31fa2cefc:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile withheld fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-fe653e10c34564e1300c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet withheld fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-7f8e12fd588db1e4c01c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop withheld fits with useful dimensions [AC9]
- `d1a4d5cccaa55fd469ff-067a973e3e7932ef9372:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:40`: E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 360 connected facts and keyboard destination
- `d1a4d5cccaa55fd469ff-fc0a51c72edd9a30edac:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:40`: E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 1280 connected facts and keyboard destination
- `d1a4d5cccaa55fd469ff-23e9197dbd7fbd759365:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:75`: E35-14-T-AC2 E35-14-T-AC4 phone values remain in one column through enlarged text
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)

### E35-14-AC3 / E35-14-T-AC3 (P1) — FULL

Only delivered E19.1 registry; no E19.2/fabricated pending cards. Given actual role fixtures, when /dashboard is read, then eligible users have exactly one real pipeline card/link, ineligible users have no pipeline/skeleton/false empty/error or link, and no Kommer snart/Låst widget. Existing registry unit and High source applicability corroborate no E19.2 addition.

Mapped 7 catalog identities (deduplicated globally):
- `1ea3a87d46afe6b6db8e-62996b691405e6e6b53b:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] tenant_admin has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-585a32a6e622c8a145b6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] projektledare has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-4e5e64c54d503da377cf:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] saljare has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-f487f22e6696df53b551:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] multi-role has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-a704a6bd8140aea081d2:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:146`: [P0] montor has no pipeline, skeleton, false totals or deep link [AC2]
- `1ea3a87d46afe6b6db8e-48cf55c1ce6defb0a4a1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:146`: [P0] ekonomi has no pipeline, skeleton, false totals or deep link [AC2]
- `1ea3a87d46afe6b6db8e-5fb150537ceb51bdf0de:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:170`: [P1] 19.1-E2E-002 source counts, adjusted commitment, dates, rate and read time [AC3,9]

### E35-14-AC4 / E35-14-T-AC4 (P1) — FULL

Connected Swedish phone/desktop journey, usable focus/touch/enlargement. Given Swedish synthetic current identity at360x640/1280x900, when using real Tab/Enter, touch-equivalent retry and doubled root text, then visible focus/44px phone actions/no horizontal overflow, all permitted labels and real Quotes navigation remain usable. Actual role tooltip pointer/keyboard/touch and enlarged error recovery are checked. No editable input/dialog is added, so virtual-keyboard editing is N/A here; broader physical-device/manual accessibility remains release work.

Mapped 24 catalog identities (deduplicated globally):
- `1ea3a87d46afe6b6db8e-b2be2ca6e30e0ecd17f2:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:627`: E35-14-T-AC4 E35-14-T-AC6 E35-14-T-connection-required disconnected retry stays honest and explicitly recovers
- `1ea3a87d46afe6b6db8e-da757003095dd613d3c6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:656`: E35-14-T-AC4 E35-14-T-error-retry enlarged phone error retains keyboard recovery
- `1ea3a87d46afe6b6db8e-e7fff9fcf9e3a8240e1a:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:405`: [P1] 19.1-E2E-009 keyboard reaches mask explanation and authorized quotes [AC9]
- `1ea3a87d46afe6b6db8e-8fef65a3ea1e1d0fe296:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:425`: [P1] 19.1-E2E-009 tooltip retains real pointer passage into its explanation [AC4,9]
- `1ea3a87d46afe6b6db8e-0c29aeebd544d50b058c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:440`: [P1] 19.1-E2E-009 hover tooltip dismisses Escape while focus remains elsewhere [AC4,9]
- `1ea3a87d46afe6b6db8e-052e4f80ef38fc48aec8:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:455`: [P1] 19.1-E2E-009 mobile long press shows role explanation [AC4,9]
- `1ea3a87d46afe6b6db8e-a2c6dc42370f1b2f8e47:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:475`: [P1] 19.1-E2E-010 mobile live full-width row fits [AC9]
- `1ea3a87d46afe6b6db8e-f1b4147203e65055cedb:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile loading fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-353f8bc477c95b246cd7:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile error fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-2e1efa46b1c6a7466a61:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile empty fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-114d3f87f3e31fa2cefc:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile withheld fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-fca5a056badb535e92bd:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:475`: [P1] 19.1-E2E-010 tablet live full-width row fits [AC9]
- `1ea3a87d46afe6b6db8e-908cc3908261591ab5a9:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet loading fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-149923e259c3952be019:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet error fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-431f85d6e52fe1cda7c1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet empty fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-fe653e10c34564e1300c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet withheld fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-0cbc429e1b403dab7dd9:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:475`: [P1] 19.1-E2E-010 desktop live full-width row fits [AC9]
- `1ea3a87d46afe6b6db8e-9fd4ed68bf9de2cf2ee6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop loading fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-10cb6272d359c1be10f1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop error fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-fee4976c6decb518e59a:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop empty fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-7f8e12fd588db1e4c01c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop withheld fits with useful dimensions [AC9]
- `d1a4d5cccaa55fd469ff-067a973e3e7932ef9372:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:40`: E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 360 connected facts and keyboard destination
- `d1a4d5cccaa55fd469ff-fc0a51c72edd9a30edac:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:40`: E35-14-T-AC4 E35-14-T-AC1 E35-14-T-loaded 1280 connected facts and keyboard destination
- `d1a4d5cccaa55fd469ff-23e9197dbd7fbd759365:chromium` — `tests/e2e/dashboard/dashboard-design.e2e.spec.ts:75`: E35-14-T-AC2 E35-14-T-AC4 phone values remain in one column through enlarged text

### E35-14-AC5 / E35-14-T-AC5 (P1) — FULL

Existing focus/tooltip, late-result navigation and frozen host preservation. Given unchanged host/shell/onboarding and the actual adapted role tooltip, when success/error, focus/hover/long-press/Escape and newer Quotes navigation occur, then host/checklist/focus behavior stays correct and old refresh cannot replace current UI. No new modal, trapped-focus dialog, dirty draft or motion exists; inherited source behavior is preserved, not fabricated as a new journey.

Mapped 45 catalog identities (deduplicated globally):
- `1df34d8f03df251dc5f7-84bf5bd426046400094e:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:59`: [P0] SÃ¤ljare receives only matrix-granted server navigation and lands on dashboard
- `1df34d8f03df251dc5f7-03bf68f0f8c14020b9a7:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:71`: [P0] MontÃ¶r direct navigation to active but ungranted settings has one generic denial and no data
- `1df34d8f03df251dc5f7-0cd579e4473105259d65:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:86`: [P0] MontÃ¶r lands on Min dag with monetary values withheld
- `1df34d8f03df251dc5f7-a653761fac28371540f1:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:96`: [P1] SÃ¤ljare can open its matrix-granted customers route without receiving cost or margin
- `1df34d8f03df251dc5f7-5327fdea050cea8be86c:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:106`: [P0] SÃ¤ljare is never offered calculation-origin quote creation
- `1df34d8f03df251dc5f7-aa1f2064743eebe9ab06:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded saljare desktop retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-33b99db731558b91bf1e:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded montor desktop retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-e84cc57c7613b0eb57cd:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded saljare phone retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-d68eb1a5bf316495e21b:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded montor phone retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-bd87faa3ac1b581a20e0:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:286`: [P1] E35-5-T-AC2 E35-5-T-AC4 desktop has 248px sidebar, 56px topbar and 24px content gutters
- `1df34d8f03df251dc5f7-ea864234cd09ecc13235:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:302`: [P1] E35-5-T-AC2 E35-5-T-AC5 E35-5-T-AC6 E35-5-T-focus-dialog phone drawer traps visible focus, restores trigger, cleans resize scroll and reduces actual motion
- `1df34d8f03df251dc5f7-73d1ac2722b046cda2dd:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:360`: [P1] E35-5-T-AC4 phone shell reflows enlarged Swedish text and retains reachable 44px owned targets
- `1df34d8f03df251dc5f7-7949609507d4bdd10f45:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:415`: [P0] E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-revoked rendered SÃ¤ljare link cannot override current isolated MontÃ¶r authority
- `1df34d8f03df251dc5f7-ea6e925ae4566eb1b501:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:469`: [P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry desktop actual sign-out rejection retains server identity and same-command real retry logs out
- `1df34d8f03df251dc5f7-f68ca511b713751e6d05:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:469`: [P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry phone actual sign-out rejection retains server identity and same-command real retry logs out
- `1df34d8f03df251dc5f7-7e3986ce399ddc1fd3e0:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:738`: [P1] E35-5-CAP-owned-shell desktop real loaded/profile/drawer originals
- `1df34d8f03df251dc5f7-3a4c78a052f07415d0de:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:771`: [P1] E35-5-CAP-owned-record-context desktop actual empty customers/files/jobs
- `1df34d8f03df251dc5f7-facc12421dba731919f2:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:792`: [P1] E35-5-CAP-owned-connected-context desktop actual scheduling/my-day/preferences
- `1df34d8f03df251dc5f7-a7b14482f4ec28feded7:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:832`: [P1] E35-5-CAP-owned-bell desktop actual empty/populated and controlled local failure
- `1df34d8f03df251dc5f7-f51c1bfdf26b09665ddc:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:895`: [P1] E35-5-CAP-owned-signout desktop actual failure/session proof/real retry/blank login
- `1df34d8f03df251dc5f7-99ede5e426486bfe5ca1:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:962`: [P0] E35-5-CAP-owned-revoked desktop actual revoked denial and current reduced navigation
- `1df34d8f03df251dc5f7-31ff056091e435060a87:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:738`: [P1] E35-5-CAP-owned-shell phone real loaded/profile/drawer originals
- `1df34d8f03df251dc5f7-c0db098a3ac2a5168335:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:771`: [P1] E35-5-CAP-owned-record-context phone actual empty customers/files/jobs
- `1df34d8f03df251dc5f7-1baae0a958ac081cb6d2:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:792`: [P1] E35-5-CAP-owned-connected-context phone actual scheduling/my-day/preferences
- `1df34d8f03df251dc5f7-969e62ee2c6381587c0a:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:832`: [P1] E35-5-CAP-owned-bell phone actual empty/populated and controlled local failure
- `1df34d8f03df251dc5f7-8883f14db8d70d59f71d:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:895`: [P1] E35-5-CAP-owned-signout phone actual failure/session proof/real retry/blank login
- `1df34d8f03df251dc5f7-cd1fa65b87f6f14f04b2:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:962`: [P0] E35-5-CAP-owned-revoked phone actual revoked denial and current reduced navigation
- `1ea3a87d46afe6b6db8e-2771e2a8a843ed2d84c9:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:700`: E35-14-T-AC6 E35-14-T-late-result completed refresh cannot replace newer quote navigation
- `1ea3a87d46afe6b6db8e-c6fa94e12496a15c9bae:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves undismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-e3f79c3a0af22448c2ce:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves dismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-14f0e21de05a4305cea1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves completed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-28c0dd46c7706e6eaea3:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves non-admin onboarding [AC8]
- `1ea3a87d46afe6b6db8e-8b284e106a909fba3632:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves invisible onboarding [AC8]
- `1ea3a87d46afe6b6db8e-2b2a4c695f0e14bb6e3f:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves read-failure onboarding [AC8]
- `1ea3a87d46afe6b6db8e-b6647131517a77e1aa54:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves undismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-9f5e2293af46221d1545:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves dismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-52db8a2c6f46f8ad6944:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves completed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-3e14db25c2cb902e7a95:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves non-admin onboarding [AC8]
- `1ea3a87d46afe6b6db8e-cc94348967a88915df4a:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves invisible onboarding [AC8]
- `1ea3a87d46afe6b6db8e-58da6d1e10a91f1f9736:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves read-failure onboarding [AC8]
- `1ea3a87d46afe6b6db8e-e7fff9fcf9e3a8240e1a:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:405`: [P1] 19.1-E2E-009 keyboard reaches mask explanation and authorized quotes [AC9]
- `1ea3a87d46afe6b6db8e-8fef65a3ea1e1d0fe296:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:425`: [P1] 19.1-E2E-009 tooltip retains real pointer passage into its explanation [AC4,9]
- `1ea3a87d46afe6b6db8e-0c29aeebd544d50b058c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:440`: [P1] 19.1-E2E-009 hover tooltip dismisses Escape while focus remains elsewhere [AC4,9]
- `1ea3a87d46afe6b6db8e-052e4f80ef38fc48aec8:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:455`: [P1] 19.1-E2E-009 mobile long press shows role explanation [AC4,9]
- `7e54e81723011b355e5a-6ab14fc1848a7a1a3c3d:chromium` — `tests/e2e/onboarding/first-admin-checklist.e2e.spec.ts:8`: [P0] 12.3-E2E-001 ready first Admin sees a server-derived checklist, can dismiss and restore it

### E35-14-AC6 / E35-14-T-AC6 (P1) — FULL

All eleven applicable honest read-state bindings. Given the existing real source/role/read-proxy fixtures, when each applicable state occurs, then current period/identity and real destination are preserved; failed/denied/unavailable are not successful empty, explicit retry re-reads current authority, and late result cannot replace newer context. Same-DOM seams and limits are recorded below, not silently omitted.

Mapped 54 catalog identities (deduplicated globally):
- `1ea3a87d46afe6b6db8e-a26118edd72e0a6f04be:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:565`: [P1] 19.1-E2E-011 successive failed retries recover in the same session [AC7]
- `1ea3a87d46afe6b6db8e-b2be2ca6e30e0ecd17f2:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:627`: E35-14-T-AC4 E35-14-T-AC6 E35-14-T-connection-required disconnected retry stays honest and explicitly recovers
- `1ea3a87d46afe6b6db8e-da757003095dd613d3c6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:656`: E35-14-T-AC4 E35-14-T-error-retry enlarged phone error retains keyboard recovery
- `1ea3a87d46afe6b6db8e-2771e2a8a843ed2d84c9:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:700`: E35-14-T-AC6 E35-14-T-late-result completed refresh cannot replace newer quote navigation
- `1ea3a87d46afe6b6db8e-62996b691405e6e6b53b:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] tenant_admin has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-585a32a6e622c8a145b6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] projektledare has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-4e5e64c54d503da377cf:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] saljare has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-f487f22e6696df53b551:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:129`: [P0] multi-role has one pipeline card and quotes deep link [AC2]
- `1ea3a87d46afe6b6db8e-a704a6bd8140aea081d2:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:146`: [P0] montor has no pipeline, skeleton, false totals or deep link [AC2]
- `1ea3a87d46afe6b6db8e-48cf55c1ce6defb0a4a1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:146`: [P0] ekonomi has no pipeline, skeleton, false totals or deep link [AC2]
- `1ea3a87d46afe6b6db8e-5fb150537ceb51bdf0de:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:170`: [P1] 19.1-E2E-002 source counts, adjusted commitment, dates, rate and read time [AC3,9]
- `1ea3a87d46afe6b6db8e-1e94b6efff7854911425:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:202`: [P0] 19.1-E2E-003 seller amount absent in initial HTML, RSC, DOM/attributes [AC4]
- `1ea3a87d46afe6b6db8e-77f402a2a7b8a591b2be:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:248`: [P0] 19.1-E2E-003 entitled control shows actual accepted sentinel [AC4]
- `1ea3a87d46afe6b6db8e-6c2236e19e7fca3924a0:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 empty-entitled has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-5370a4ecb2912c4129fc:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 empty-withheld has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-a49f7584585944146b92:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 sent-only has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-56f21c363385018a9985:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:256`: [P1] 19.1-E2E-004 entitled-zero has honest period/zero/null-rate copy [AC4,5]
- `1ea3a87d46afe6b6db8e-17c8ac514d782f7cd1ad:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:278`: [P0] 19.1-E2E-005 failure remains local and keeps heading/checklist usable [AC6]
- `1ea3a87d46afe6b6db8e-0ce14da34b19b5ce7b7e:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:293`: [P1] 19.1-E2E-006 retry recovery announces loading without side effects [AC7]
- `1ea3a87d46afe6b6db8e-8f146dac61f3e85e1b65:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:293`: [P1] 19.1-E2E-006 retry failure announces loading without side effects [AC7]
- `1ea3a87d46afe6b6db8e-49b748632b1da7fd89e4:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:320`: [P0] 19.1-E2E-007 quote revoked in same session before retry [AC7]
- `1ea3a87d46afe6b6db8e-ea158bdf966250f29a90:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:320`: [P0] 19.1-E2E-007 money revoked in same session before retry [AC7]
- `1ea3a87d46afe6b6db8e-63471065d7c5fccb45f6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:374`: [P0] 19.1-E2E-007 session lost before retry returns safely to login [AC7]
- `1ea3a87d46afe6b6db8e-c6fa94e12496a15c9bae:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves undismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-e3f79c3a0af22448c2ce:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves dismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-14f0e21de05a4305cea1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves completed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-28c0dd46c7706e6eaea3:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves non-admin onboarding [AC8]
- `1ea3a87d46afe6b6db8e-8b284e106a909fba3632:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves invisible onboarding [AC8]
- `1ea3a87d46afe6b6db8e-2b2a4c695f0e14bb6e3f:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 success preserves read-failure onboarding [AC8]
- `1ea3a87d46afe6b6db8e-b6647131517a77e1aa54:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves undismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-9f5e2293af46221d1545:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves dismissed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-52db8a2c6f46f8ad6944:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves completed onboarding [AC8]
- `1ea3a87d46afe6b6db8e-3e14db25c2cb902e7a95:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves non-admin onboarding [AC8]
- `1ea3a87d46afe6b6db8e-cc94348967a88915df4a:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves invisible onboarding [AC8]
- `1ea3a87d46afe6b6db8e-58da6d1e10a91f1f9736:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:391`: [P1] 19.1-E2E-008 error preserves read-failure onboarding [AC8]
- `1ea3a87d46afe6b6db8e-e7fff9fcf9e3a8240e1a:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:405`: [P1] 19.1-E2E-009 keyboard reaches mask explanation and authorized quotes [AC9]
- `1ea3a87d46afe6b6db8e-8fef65a3ea1e1d0fe296:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:425`: [P1] 19.1-E2E-009 tooltip retains real pointer passage into its explanation [AC4,9]
- `1ea3a87d46afe6b6db8e-0c29aeebd544d50b058c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:440`: [P1] 19.1-E2E-009 hover tooltip dismisses Escape while focus remains elsewhere [AC4,9]
- `1ea3a87d46afe6b6db8e-052e4f80ef38fc48aec8:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:455`: [P1] 19.1-E2E-009 mobile long press shows role explanation [AC4,9]
- `1ea3a87d46afe6b6db8e-a2c6dc42370f1b2f8e47:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:475`: [P1] 19.1-E2E-010 mobile live full-width row fits [AC9]
- `1ea3a87d46afe6b6db8e-f1b4147203e65055cedb:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile loading fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-353f8bc477c95b246cd7:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile error fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-2e1efa46b1c6a7466a61:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile empty fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-114d3f87f3e31fa2cefc:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 mobile withheld fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-fca5a056badb535e92bd:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:475`: [P1] 19.1-E2E-010 tablet live full-width row fits [AC9]
- `1ea3a87d46afe6b6db8e-908cc3908261591ab5a9:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet loading fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-149923e259c3952be019:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet error fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-431f85d6e52fe1cda7c1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet empty fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-fe653e10c34564e1300c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 tablet withheld fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-0cbc429e1b403dab7dd9:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:475`: [P1] 19.1-E2E-010 desktop live full-width row fits [AC9]
- `1ea3a87d46afe6b6db8e-9fd4ed68bf9de2cf2ee6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop loading fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-10cb6272d359c1be10f1:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop error fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-fee4976c6decb518e59a:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop empty fits with useful dimensions [AC9]
- `1ea3a87d46afe6b6db8e-7f8e12fd588db1e4c01c:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:533`: [P1] 19.1-E2E-010 desktop withheld fits with useful dimensions [AC9]

### E35-14-AC7 / E35-14-T-AC7 (P0) — FULL

Preserved read-only authority/money/provenance contracts and required integrity evidence. Given the unchanged reviewed contracts and current M execution, when scoped existing integration/RLS and negative browser paths execute, then dashboard/quote read authority and non-scope guard remain intact. Sensitive source/runtime/evidence findings are retained independent High conclusions; Low does not newly grade auth/money/transactions. Full successful release DB, unit/static/build/recovery and exact merged-tree reconciliation supplement rather than replace mapped tests.

Mapped 58 catalog identities (deduplicated globally):
- `1df34d8f03df251dc5f7-84bf5bd426046400094e:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:59`: [P0] SÃ¤ljare receives only matrix-granted server navigation and lands on dashboard
- `1df34d8f03df251dc5f7-03bf68f0f8c14020b9a7:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:71`: [P0] MontÃ¶r direct navigation to active but ungranted settings has one generic denial and no data
- `1df34d8f03df251dc5f7-0cd579e4473105259d65:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:86`: [P0] MontÃ¶r lands on Min dag with monetary values withheld
- `1df34d8f03df251dc5f7-a653761fac28371540f1:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:96`: [P1] SÃ¤ljare can open its matrix-granted customers route without receiving cost or margin
- `1df34d8f03df251dc5f7-5327fdea050cea8be86c:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:106`: [P0] SÃ¤ljare is never offered calculation-origin quote creation
- `1df34d8f03df251dc5f7-aa1f2064743eebe9ab06:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded saljare desktop retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-33b99db731558b91bf1e:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded montor desktop retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-e84cc57c7613b0eb57cd:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded saljare phone retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-d68eb1a5bf316495e21b:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:202`: [P1] E35-5-T-AC1 E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-loaded montor phone retains supplied order, identity and real utility destinations
- `1df34d8f03df251dc5f7-bd87faa3ac1b581a20e0:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:286`: [P1] E35-5-T-AC2 E35-5-T-AC4 desktop has 248px sidebar, 56px topbar and 24px content gutters
- `1df34d8f03df251dc5f7-ea864234cd09ecc13235:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:302`: [P1] E35-5-T-AC2 E35-5-T-AC5 E35-5-T-AC6 E35-5-T-focus-dialog phone drawer traps visible focus, restores trigger, cleans resize scroll and reduces actual motion
- `1df34d8f03df251dc5f7-73d1ac2722b046cda2dd:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:360`: [P1] E35-5-T-AC4 phone shell reflows enlarged Swedish text and retains reachable 44px owned targets
- `1df34d8f03df251dc5f7-7949609507d4bdd10f45:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:415`: [P0] E35-5-T-AC3 E35-5-T-AC6 E35-5-T-AC7 E35-5-T-revoked rendered SÃ¤ljare link cannot override current isolated MontÃ¶r authority
- `1df34d8f03df251dc5f7-ea6e925ae4566eb1b501:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:469`: [P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry desktop actual sign-out rejection retains server identity and same-command real retry logs out
- `1df34d8f03df251dc5f7-f68ca511b713751e6d05:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:469`: [P1] E35-5-T-AC3 E35-5-T-AC4 E35-5-T-AC6 E35-5-T-error-retry phone actual sign-out rejection retains server identity and same-command real retry logs out
- `1df34d8f03df251dc5f7-7e3986ce399ddc1fd3e0:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:738`: [P1] E35-5-CAP-owned-shell desktop real loaded/profile/drawer originals
- `1df34d8f03df251dc5f7-3a4c78a052f07415d0de:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:771`: [P1] E35-5-CAP-owned-record-context desktop actual empty customers/files/jobs
- `1df34d8f03df251dc5f7-facc12421dba731919f2:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:792`: [P1] E35-5-CAP-owned-connected-context desktop actual scheduling/my-day/preferences
- `1df34d8f03df251dc5f7-a7b14482f4ec28feded7:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:832`: [P1] E35-5-CAP-owned-bell desktop actual empty/populated and controlled local failure
- `1df34d8f03df251dc5f7-f51c1bfdf26b09665ddc:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:895`: [P1] E35-5-CAP-owned-signout desktop actual failure/session proof/real retry/blank login
- `1df34d8f03df251dc5f7-99ede5e426486bfe5ca1:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:962`: [P0] E35-5-CAP-owned-revoked desktop actual revoked denial and current reduced navigation
- `1df34d8f03df251dc5f7-31ff056091e435060a87:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:738`: [P1] E35-5-CAP-owned-shell phone real loaded/profile/drawer originals
- `1df34d8f03df251dc5f7-c0db098a3ac2a5168335:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:771`: [P1] E35-5-CAP-owned-record-context phone actual empty customers/files/jobs
- `1df34d8f03df251dc5f7-1baae0a958ac081cb6d2:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:792`: [P1] E35-5-CAP-owned-connected-context phone actual scheduling/my-day/preferences
- `1df34d8f03df251dc5f7-969e62ee2c6381587c0a:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:832`: [P1] E35-5-CAP-owned-bell phone actual empty/populated and controlled local failure
- `1df34d8f03df251dc5f7-8883f14db8d70d59f71d:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:895`: [P1] E35-5-CAP-owned-signout phone actual failure/session proof/real retry/blank login
- `1df34d8f03df251dc5f7-cd1fa65b87f6f14f04b2:chromium` — `tests/e2e/auth/role-aware-phase-a-surface.atdd.e2e.spec.ts:962`: [P0] E35-5-CAP-owned-revoked phone actual revoked denial and current reduced navigation
- `1ea3a87d46afe6b6db8e-1e94b6efff7854911425:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:202`: [P0] 19.1-E2E-003 seller amount absent in initial HTML, RSC, DOM/attributes [AC4]
- `1ea3a87d46afe6b6db8e-77f402a2a7b8a591b2be:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:248`: [P0] 19.1-E2E-003 entitled control shows actual accepted sentinel [AC4]
- `1ea3a87d46afe6b6db8e-49b748632b1da7fd89e4:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:320`: [P0] 19.1-E2E-007 quote revoked in same session before retry [AC7]
- `1ea3a87d46afe6b6db8e-ea158bdf966250f29a90:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:320`: [P0] 19.1-E2E-007 money revoked in same session before retry [AC7]
- `1ea3a87d46afe6b6db8e-63471065d7c5fccb45f6:chromium` — `tests/e2e/dashboard/dashboard-pipeline.e2e.spec.ts:374`: [P0] 19.1-E2E-007 session lost before retry returns safely to login [AC7]
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result
- `tests/integration/rls/dashboard-pipeline.rls.test.ts::[P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches` — `tests/integration/rls/dashboard-pipeline.rls.test.ts`: [P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline
- `tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete` — `tests/integration/rls/quote-pipeline-read-model.rls.test.ts`: 10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules
- `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)` — `tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts`: 10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)

### Eleven Applies STATE/T pairs (supplementary decomposition, not eleven extra ACs)

| Original STATE / T suffix | Actual mapped assertions | Limitation preserved |
|---|---|---|
| loading | E2E006 retry recovery/failure; E2E010 mobile/tablet/desktop loading | Actual controlled held source; not a fabricated skeleton success. |
| loaded | E2E002 source history plus General connected360/1280 | Current authoritative facts/time and real destination, no screenshot-only proof. |
| empty | E2E004 empty-entitled/empty-withheld/entitled-zero; E2E010 empty | Successful resolved current period, distinct from denial/error. |
| no-match | Same E2E004 current-period empty seam | Canonical current test-design explicitly has no independent filter/reset; original generic mutation/filter wording does not create one. No separate no-match UI or reset assertion is invented. |
| denied | E2E001 ineligible card/link absence, scoped DB tenant/eligibility negatives | Actual absence, not a generic-denial page substituted; High sensitivity conclusions reused. |
| revoked | E2E007 quote/money/session branches plus scoped DB stale/current-authority checks | Same-session server re-evaluation, no stale local authority. |
| unavailable | E2E005 controlled source error and E2E001 ineligible absence | No independent pending-module/unavailable widget exists; actual seam is preserved, no new placeholder. |
| connection-required | E35-14-T-connection-required | Offline click stays honest/usable without dispatched success; reconnect explicit retry recovers; same existing error DOM, no invented offline banner or queue. |
| error-retry | E2E005/006/011 and E35-14-T-error-retry enlarged error | Failed read has no successful facts/time; repeated explicit retry eventually confirms current read. |
| stale | E2E006 failed retry plus E2E011 successive failure/recovery | Drops stale facts; no independent stale-cache badge/draft/mutation state. |
| late-result | E35-14-T-late-result | Fresh M original dashboard request26 completes200 after real newer Quotes UI/nonce. Controlled tee changes buffering/lifetime; separate live Quotes37 aborted. No claim of original Next-consumer completion, unmodified transport, cancellation cause or permanent repair. |

Validation, submitting, unknown, confirmed, locked, dirty-navigation, focus-dialog and widget upload/download are N/A under the formal applicability contract. One real /quotes link is not a file command. Existing motion/dialog rules apply only where adapted motion/dialogs actually exist; none is newly introduced. Preserve E16/E20 release caveats without counting them as this story's requirements.

Mapping validation: both P0 and every P1 have positive and adverse-path assertions at the applicable browser/integration levels. No new HTTP/API endpoint is required. Auth/eligibility and withheld/revoked negative assertions are present through existing qualified High evidence. Controlled source failures/offline/stale/late ordering prevent happy-path-only classification. General browser and DB assertions overlap deliberately for presentation versus server invariant; repeated mappings do not inflate tests. No stale/unverifiable/skipped live record is used.

### Requirement mapping data
```json
[
  {
    "id": "E35-14-AC1",
    "proposed_test_id": "E35-14-T-AC1",
    "description": "Registry-backed isolated read, current facts/freshness, one real destination",
    "priority": "P1",
    "coverage": "FULL",
    "justification": "Given the admitted eligible/current-source fixture, when the real read is delayed/fails/retried or completes, then heading/onboarding remain usable, loading/error are local, server freshness/facts update only after success and the single real /quotes destination works.",
    "gaps": [],
    "test_ids": [
      "1ea3a87d46afe6b6db8e-a26118edd72e0a6f04be:chromium",
      "1ea3a87d46afe6b6db8e-62996b691405e6e6b53b:chromium",
      "1ea3a87d46afe6b6db8e-585a32a6e622c8a145b6:chromium",
      "1ea3a87d46afe6b6db8e-4e5e64c54d503da377cf:chromium",
      "1ea3a87d46afe6b6db8e-f487f22e6696df53b551:chromium",
      "1ea3a87d46afe6b6db8e-5fb150537ceb51bdf0de:chromium",
      "1ea3a87d46afe6b6db8e-17c8ac514d782f7cd1ad:chromium",
      "1ea3a87d46afe6b6db8e-0ce14da34b19b5ce7b7e:chromium",
      "1ea3a87d46afe6b6db8e-8f146dac61f3e85e1b65:chromium",
      "d1a4d5cccaa55fd469ff-067a973e3e7932ef9372:chromium",
      "d1a4d5cccaa55fd469ff-fc0a51c72edd9a30edac:chromium",
      "d1a4d5cccaa55fd469ff-23e9197dbd7fbd759365:chromium"
    ]
  },
  {
    "id": "E35-14-AC2",
    "proposed_test_id": "E35-14-T-AC2",
    "description": "Withheld payload absence, genuine zero, one-column phone facts/context",
    "priority": "P0",
    "coverage": "FULL",
    "justification": "Given entitled and withheld fixtures, when reading/rendering current pipeline and revoking money permission, then actual forbidden acceptedValueOre is absent in initial HTML/RSC/DOM rather than zero; authoritative zero/null-rate remain distinct. Existing High-qualified sensitive assertions supply the invariant; General enlarged phone asserts one metric column, all real labels and reachable destination.",
    "gaps": [],
    "test_ids": [
      "1ea3a87d46afe6b6db8e-1e94b6efff7854911425:chromium",
      "1ea3a87d46afe6b6db8e-77f402a2a7b8a591b2be:chromium",
      "1ea3a87d46afe6b6db8e-6c2236e19e7fca3924a0:chromium",
      "1ea3a87d46afe6b6db8e-5370a4ecb2912c4129fc:chromium",
      "1ea3a87d46afe6b6db8e-a49f7584585944146b92:chromium",
      "1ea3a87d46afe6b6db8e-56f21c363385018a9985:chromium",
      "1ea3a87d46afe6b6db8e-ea158bdf966250f29a90:chromium",
      "1ea3a87d46afe6b6db8e-114d3f87f3e31fa2cefc:chromium",
      "1ea3a87d46afe6b6db8e-fe653e10c34564e1300c:chromium",
      "1ea3a87d46afe6b6db8e-7f8e12fd588db1e4c01c:chromium",
      "d1a4d5cccaa55fd469ff-067a973e3e7932ef9372:chromium",
      "d1a4d5cccaa55fd469ff-fc0a51c72edd9a30edac:chromium",
      "d1a4d5cccaa55fd469ff-23e9197dbd7fbd759365:chromium",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)"
    ]
  },
  {
    "id": "E35-14-AC3",
    "proposed_test_id": "E35-14-T-AC3",
    "description": "Only delivered E19.1 registry; no E19.2/fabricated pending cards",
    "priority": "P1",
    "coverage": "FULL",
    "justification": "Given actual role fixtures, when /dashboard is read, then eligible users have exactly one real pipeline card/link, ineligible users have no pipeline/skeleton/false empty/error or link, and no Kommer snart/Låst widget. Existing registry unit and High source applicability corroborate no E19.2 addition.",
    "gaps": [],
    "test_ids": [
      "1ea3a87d46afe6b6db8e-62996b691405e6e6b53b:chromium",
      "1ea3a87d46afe6b6db8e-585a32a6e622c8a145b6:chromium",
      "1ea3a87d46afe6b6db8e-4e5e64c54d503da377cf:chromium",
      "1ea3a87d46afe6b6db8e-f487f22e6696df53b551:chromium",
      "1ea3a87d46afe6b6db8e-a704a6bd8140aea081d2:chromium",
      "1ea3a87d46afe6b6db8e-48cf55c1ce6defb0a4a1:chromium",
      "1ea3a87d46afe6b6db8e-5fb150537ceb51bdf0de:chromium"
    ]
  },
  {
    "id": "E35-14-AC4",
    "proposed_test_id": "E35-14-T-AC4",
    "description": "Connected Swedish phone/desktop journey, usable focus/touch/enlargement",
    "priority": "P1",
    "coverage": "FULL",
    "justification": "Given Swedish synthetic current identity at360x640/1280x900, when using real Tab/Enter, touch-equivalent retry and doubled root text, then visible focus/44px phone actions/no horizontal overflow, all permitted labels and real Quotes navigation remain usable. Actual role tooltip pointer/keyboard/touch and enlarged error recovery are checked. No editable input/dialog is added, so virtual-keyboard editing is N/A here; broader physical-device/manual accessibility remains release work.",
    "gaps": [],
    "test_ids": [
      "1ea3a87d46afe6b6db8e-b2be2ca6e30e0ecd17f2:chromium",
      "1ea3a87d46afe6b6db8e-da757003095dd613d3c6:chromium",
      "1ea3a87d46afe6b6db8e-e7fff9fcf9e3a8240e1a:chromium",
      "1ea3a87d46afe6b6db8e-8fef65a3ea1e1d0fe296:chromium",
      "1ea3a87d46afe6b6db8e-0c29aeebd544d50b058c:chromium",
      "1ea3a87d46afe6b6db8e-052e4f80ef38fc48aec8:chromium",
      "1ea3a87d46afe6b6db8e-a2c6dc42370f1b2f8e47:chromium",
      "1ea3a87d46afe6b6db8e-f1b4147203e65055cedb:chromium",
      "1ea3a87d46afe6b6db8e-353f8bc477c95b246cd7:chromium",
      "1ea3a87d46afe6b6db8e-2e1efa46b1c6a7466a61:chromium",
      "1ea3a87d46afe6b6db8e-114d3f87f3e31fa2cefc:chromium",
      "1ea3a87d46afe6b6db8e-fca5a056badb535e92bd:chromium",
      "1ea3a87d46afe6b6db8e-908cc3908261591ab5a9:chromium",
      "1ea3a87d46afe6b6db8e-149923e259c3952be019:chromium",
      "1ea3a87d46afe6b6db8e-431f85d6e52fe1cda7c1:chromium",
      "1ea3a87d46afe6b6db8e-fe653e10c34564e1300c:chromium",
      "1ea3a87d46afe6b6db8e-0cbc429e1b403dab7dd9:chromium",
      "1ea3a87d46afe6b6db8e-9fd4ed68bf9de2cf2ee6:chromium",
      "1ea3a87d46afe6b6db8e-10cb6272d359c1be10f1:chromium",
      "1ea3a87d46afe6b6db8e-fee4976c6decb518e59a:chromium",
      "1ea3a87d46afe6b6db8e-7f8e12fd588db1e4c01c:chromium",
      "d1a4d5cccaa55fd469ff-067a973e3e7932ef9372:chromium",
      "d1a4d5cccaa55fd469ff-fc0a51c72edd9a30edac:chromium",
      "d1a4d5cccaa55fd469ff-23e9197dbd7fbd759365:chromium"
    ]
  },
  {
    "id": "E35-14-AC5",
    "proposed_test_id": "E35-14-T-AC5",
    "description": "Existing focus/tooltip, late-result navigation and frozen host preservation",
    "priority": "P1",
    "coverage": "FULL",
    "justification": "Given unchanged host/shell/onboarding and the actual adapted role tooltip, when success/error, focus/hover/long-press/Escape and newer Quotes navigation occur, then host/checklist/focus behavior stays correct and old refresh cannot replace current UI. No new modal, trapped-focus dialog, dirty draft or motion exists; inherited source behavior is preserved, not fabricated as a new journey.",
    "gaps": [],
    "test_ids": [
      "1df34d8f03df251dc5f7-84bf5bd426046400094e:chromium",
      "1df34d8f03df251dc5f7-03bf68f0f8c14020b9a7:chromium",
      "1df34d8f03df251dc5f7-0cd579e4473105259d65:chromium",
      "1df34d8f03df251dc5f7-a653761fac28371540f1:chromium",
      "1df34d8f03df251dc5f7-5327fdea050cea8be86c:chromium",
      "1df34d8f03df251dc5f7-aa1f2064743eebe9ab06:chromium",
      "1df34d8f03df251dc5f7-33b99db731558b91bf1e:chromium",
      "1df34d8f03df251dc5f7-e84cc57c7613b0eb57cd:chromium",
      "1df34d8f03df251dc5f7-d68eb1a5bf316495e21b:chromium",
      "1df34d8f03df251dc5f7-bd87faa3ac1b581a20e0:chromium",
      "1df34d8f03df251dc5f7-ea864234cd09ecc13235:chromium",
      "1df34d8f03df251dc5f7-73d1ac2722b046cda2dd:chromium",
      "1df34d8f03df251dc5f7-7949609507d4bdd10f45:chromium",
      "1df34d8f03df251dc5f7-ea6e925ae4566eb1b501:chromium",
      "1df34d8f03df251dc5f7-f68ca511b713751e6d05:chromium",
      "1df34d8f03df251dc5f7-7e3986ce399ddc1fd3e0:chromium",
      "1df34d8f03df251dc5f7-3a4c78a052f07415d0de:chromium",
      "1df34d8f03df251dc5f7-facc12421dba731919f2:chromium",
      "1df34d8f03df251dc5f7-a7b14482f4ec28feded7:chromium",
      "1df34d8f03df251dc5f7-f51c1bfdf26b09665ddc:chromium",
      "1df34d8f03df251dc5f7-99ede5e426486bfe5ca1:chromium",
      "1df34d8f03df251dc5f7-31ff056091e435060a87:chromium",
      "1df34d8f03df251dc5f7-c0db098a3ac2a5168335:chromium",
      "1df34d8f03df251dc5f7-1baae0a958ac081cb6d2:chromium",
      "1df34d8f03df251dc5f7-969e62ee2c6381587c0a:chromium",
      "1df34d8f03df251dc5f7-8883f14db8d70d59f71d:chromium",
      "1df34d8f03df251dc5f7-cd1fa65b87f6f14f04b2:chromium",
      "1ea3a87d46afe6b6db8e-2771e2a8a843ed2d84c9:chromium",
      "1ea3a87d46afe6b6db8e-c6fa94e12496a15c9bae:chromium",
      "1ea3a87d46afe6b6db8e-e3f79c3a0af22448c2ce:chromium",
      "1ea3a87d46afe6b6db8e-14f0e21de05a4305cea1:chromium",
      "1ea3a87d46afe6b6db8e-28c0dd46c7706e6eaea3:chromium",
      "1ea3a87d46afe6b6db8e-8b284e106a909fba3632:chromium",
      "1ea3a87d46afe6b6db8e-2b2a4c695f0e14bb6e3f:chromium",
      "1ea3a87d46afe6b6db8e-b6647131517a77e1aa54:chromium",
      "1ea3a87d46afe6b6db8e-9f5e2293af46221d1545:chromium",
      "1ea3a87d46afe6b6db8e-52db8a2c6f46f8ad6944:chromium",
      "1ea3a87d46afe6b6db8e-3e14db25c2cb902e7a95:chromium",
      "1ea3a87d46afe6b6db8e-cc94348967a88915df4a:chromium",
      "1ea3a87d46afe6b6db8e-58da6d1e10a91f1f9736:chromium",
      "1ea3a87d46afe6b6db8e-e7fff9fcf9e3a8240e1a:chromium",
      "1ea3a87d46afe6b6db8e-8fef65a3ea1e1d0fe296:chromium",
      "1ea3a87d46afe6b6db8e-0c29aeebd544d50b058c:chromium",
      "1ea3a87d46afe6b6db8e-052e4f80ef38fc48aec8:chromium",
      "7e54e81723011b355e5a-6ab14fc1848a7a1a3c3d:chromium"
    ]
  },
  {
    "id": "E35-14-AC6",
    "proposed_test_id": "E35-14-T-AC6",
    "description": "All eleven applicable honest read-state bindings",
    "priority": "P1",
    "coverage": "FULL",
    "justification": "Given the existing real source/role/read-proxy fixtures, when each applicable state occurs, then current period/identity and real destination are preserved; failed/denied/unavailable are not successful empty, explicit retry re-reads current authority, and late result cannot replace newer context. Same-DOM seams and limits are recorded below, not silently omitted.",
    "gaps": [],
    "test_ids": [
      "1ea3a87d46afe6b6db8e-a26118edd72e0a6f04be:chromium",
      "1ea3a87d46afe6b6db8e-b2be2ca6e30e0ecd17f2:chromium",
      "1ea3a87d46afe6b6db8e-da757003095dd613d3c6:chromium",
      "1ea3a87d46afe6b6db8e-2771e2a8a843ed2d84c9:chromium",
      "1ea3a87d46afe6b6db8e-62996b691405e6e6b53b:chromium",
      "1ea3a87d46afe6b6db8e-585a32a6e622c8a145b6:chromium",
      "1ea3a87d46afe6b6db8e-4e5e64c54d503da377cf:chromium",
      "1ea3a87d46afe6b6db8e-f487f22e6696df53b551:chromium",
      "1ea3a87d46afe6b6db8e-a704a6bd8140aea081d2:chromium",
      "1ea3a87d46afe6b6db8e-48cf55c1ce6defb0a4a1:chromium",
      "1ea3a87d46afe6b6db8e-5fb150537ceb51bdf0de:chromium",
      "1ea3a87d46afe6b6db8e-1e94b6efff7854911425:chromium",
      "1ea3a87d46afe6b6db8e-77f402a2a7b8a591b2be:chromium",
      "1ea3a87d46afe6b6db8e-6c2236e19e7fca3924a0:chromium",
      "1ea3a87d46afe6b6db8e-5370a4ecb2912c4129fc:chromium",
      "1ea3a87d46afe6b6db8e-a49f7584585944146b92:chromium",
      "1ea3a87d46afe6b6db8e-56f21c363385018a9985:chromium",
      "1ea3a87d46afe6b6db8e-17c8ac514d782f7cd1ad:chromium",
      "1ea3a87d46afe6b6db8e-0ce14da34b19b5ce7b7e:chromium",
      "1ea3a87d46afe6b6db8e-8f146dac61f3e85e1b65:chromium",
      "1ea3a87d46afe6b6db8e-49b748632b1da7fd89e4:chromium",
      "1ea3a87d46afe6b6db8e-ea158bdf966250f29a90:chromium",
      "1ea3a87d46afe6b6db8e-63471065d7c5fccb45f6:chromium",
      "1ea3a87d46afe6b6db8e-c6fa94e12496a15c9bae:chromium",
      "1ea3a87d46afe6b6db8e-e3f79c3a0af22448c2ce:chromium",
      "1ea3a87d46afe6b6db8e-14f0e21de05a4305cea1:chromium",
      "1ea3a87d46afe6b6db8e-28c0dd46c7706e6eaea3:chromium",
      "1ea3a87d46afe6b6db8e-8b284e106a909fba3632:chromium",
      "1ea3a87d46afe6b6db8e-2b2a4c695f0e14bb6e3f:chromium",
      "1ea3a87d46afe6b6db8e-b6647131517a77e1aa54:chromium",
      "1ea3a87d46afe6b6db8e-9f5e2293af46221d1545:chromium",
      "1ea3a87d46afe6b6db8e-52db8a2c6f46f8ad6944:chromium",
      "1ea3a87d46afe6b6db8e-3e14db25c2cb902e7a95:chromium",
      "1ea3a87d46afe6b6db8e-cc94348967a88915df4a:chromium",
      "1ea3a87d46afe6b6db8e-58da6d1e10a91f1f9736:chromium",
      "1ea3a87d46afe6b6db8e-e7fff9fcf9e3a8240e1a:chromium",
      "1ea3a87d46afe6b6db8e-8fef65a3ea1e1d0fe296:chromium",
      "1ea3a87d46afe6b6db8e-0c29aeebd544d50b058c:chromium",
      "1ea3a87d46afe6b6db8e-052e4f80ef38fc48aec8:chromium",
      "1ea3a87d46afe6b6db8e-a2c6dc42370f1b2f8e47:chromium",
      "1ea3a87d46afe6b6db8e-f1b4147203e65055cedb:chromium",
      "1ea3a87d46afe6b6db8e-353f8bc477c95b246cd7:chromium",
      "1ea3a87d46afe6b6db8e-2e1efa46b1c6a7466a61:chromium",
      "1ea3a87d46afe6b6db8e-114d3f87f3e31fa2cefc:chromium",
      "1ea3a87d46afe6b6db8e-fca5a056badb535e92bd:chromium",
      "1ea3a87d46afe6b6db8e-908cc3908261591ab5a9:chromium",
      "1ea3a87d46afe6b6db8e-149923e259c3952be019:chromium",
      "1ea3a87d46afe6b6db8e-431f85d6e52fe1cda7c1:chromium",
      "1ea3a87d46afe6b6db8e-fe653e10c34564e1300c:chromium",
      "1ea3a87d46afe6b6db8e-0cbc429e1b403dab7dd9:chromium",
      "1ea3a87d46afe6b6db8e-9fd4ed68bf9de2cf2ee6:chromium",
      "1ea3a87d46afe6b6db8e-10cb6272d359c1be10f1:chromium",
      "1ea3a87d46afe6b6db8e-fee4976c6decb518e59a:chromium",
      "1ea3a87d46afe6b6db8e-7f8e12fd588db1e4c01c:chromium"
    ]
  },
  {
    "id": "E35-14-AC7",
    "proposed_test_id": "E35-14-T-AC7",
    "description": "Preserved read-only authority/money/provenance contracts and required integrity evidence",
    "priority": "P0",
    "coverage": "FULL",
    "justification": "Given the unchanged reviewed contracts and current M execution, when scoped existing integration/RLS and negative browser paths execute, then dashboard/quote read authority and non-scope guard remain intact. Sensitive source/runtime/evidence findings are retained independent High conclusions; Low does not newly grade auth/money/transactions. Full successful release DB, unit/static/build/recovery and exact merged-tree reconciliation supplement rather than replace mapped tests.",
    "gaps": [],
    "test_ids": [
      "1df34d8f03df251dc5f7-84bf5bd426046400094e:chromium",
      "1df34d8f03df251dc5f7-03bf68f0f8c14020b9a7:chromium",
      "1df34d8f03df251dc5f7-0cd579e4473105259d65:chromium",
      "1df34d8f03df251dc5f7-a653761fac28371540f1:chromium",
      "1df34d8f03df251dc5f7-5327fdea050cea8be86c:chromium",
      "1df34d8f03df251dc5f7-aa1f2064743eebe9ab06:chromium",
      "1df34d8f03df251dc5f7-33b99db731558b91bf1e:chromium",
      "1df34d8f03df251dc5f7-e84cc57c7613b0eb57cd:chromium",
      "1df34d8f03df251dc5f7-d68eb1a5bf316495e21b:chromium",
      "1df34d8f03df251dc5f7-bd87faa3ac1b581a20e0:chromium",
      "1df34d8f03df251dc5f7-ea864234cd09ecc13235:chromium",
      "1df34d8f03df251dc5f7-73d1ac2722b046cda2dd:chromium",
      "1df34d8f03df251dc5f7-7949609507d4bdd10f45:chromium",
      "1df34d8f03df251dc5f7-ea6e925ae4566eb1b501:chromium",
      "1df34d8f03df251dc5f7-f68ca511b713751e6d05:chromium",
      "1df34d8f03df251dc5f7-7e3986ce399ddc1fd3e0:chromium",
      "1df34d8f03df251dc5f7-3a4c78a052f07415d0de:chromium",
      "1df34d8f03df251dc5f7-facc12421dba731919f2:chromium",
      "1df34d8f03df251dc5f7-a7b14482f4ec28feded7:chromium",
      "1df34d8f03df251dc5f7-f51c1bfdf26b09665ddc:chromium",
      "1df34d8f03df251dc5f7-99ede5e426486bfe5ca1:chromium",
      "1df34d8f03df251dc5f7-31ff056091e435060a87:chromium",
      "1df34d8f03df251dc5f7-c0db098a3ac2a5168335:chromium",
      "1df34d8f03df251dc5f7-1baae0a958ac081cb6d2:chromium",
      "1df34d8f03df251dc5f7-969e62ee2c6381587c0a:chromium",
      "1df34d8f03df251dc5f7-8883f14db8d70d59f71d:chromium",
      "1df34d8f03df251dc5f7-cd1fa65b87f6f14f04b2:chromium",
      "1ea3a87d46afe6b6db8e-1e94b6efff7854911425:chromium",
      "1ea3a87d46afe6b6db8e-77f402a2a7b8a591b2be:chromium",
      "1ea3a87d46afe6b6db8e-49b748632b1da7fd89e4:chromium",
      "1ea3a87d46afe6b6db8e-ea158bdf966250f29a90:chromium",
      "1ea3a87d46afe6b6db8e-63471065d7c5fccb45f6:chromium",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-001 AC5 B-only data gives A a successful empty dashboard, not B counts/identity/money",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-002 AC3 real new entry and default adapter show own exact adjusted accepted commitment",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2/4 actual seller membership keeps counts while browser DTO omits accepted-value sentinel",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real montor membership invokes no result reader despite dashboard grant",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 real ekonomi membership invokes no result reader despite dashboard grant",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-003 AC2 current membership_roles union yields one card/one actual read",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC2 forged runtime role/tenant/money properties cannot replace actual seller authority",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked money membership on retry",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 same authenticated client sees revoked quote grant before any retry loader",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P0] 19.1-INT-004 AC7 missing session after sign-out cannot retain a previous dashboard result",
      "tests/integration/rls/dashboard-pipeline.rls.test.ts::[P1] 19.1-INT-005 AC3/6 new result-entry/default adapter preserve real later pages and accepted ID batches",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) STRUCTURAL: the read-model imports the RLS client and imports NO service-role / unscoped client",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: with a B-only fixture, tenant A's read-model returns all-zero counts (never B's data)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) cross-tenant: tenant A's read-model reflects EXACTLY A's own in-period lifecycle events (never B's)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) money: acceptedValueOre sums the ACCEPTED commitment (quote_acceptances), NOT the frozen sent total (quote_versions)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) follow-up counts: an open follow-up on a REJECTED or EXPIRED (decided) quote is excluded (iteration-2 review)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) fail-closed: the read-model with an OMITTED entitlement input withholds the money leaf (defense-in-depth)",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) Story 11.2: seller retains pipeline counts but never receives the accepted-value aggregate; installer receives neither quote rows nor money",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-page: an event after PostgREST's first 1,000 RLS-visible rows still changes the pipeline",
      "tests/integration/rls/quote-pipeline-read-model.rls.test.ts::10.4-INT-01: pipeline read-model isolation floor (RLS-client-only, cross-tenant) multi-ID batch: accepted commitments beyond one conservative ID batch remain complete",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module declares only the approved Story 19.1 quote-pipeline widget",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the quotes module keeps its SINGLE /quotes nav item (no new nav item)",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the derived active nav route set admits the approved scheduling activation (no analytics/reports page)",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the active widget inventory contains only the approved Story 19.1 quote-pipeline widget",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the governed tenant-table inventory derives from the active manifest modules",
      "tests/integration/features/quotes/quote-pipeline-non-scope-guard.int.test.ts::10.4-INT-03: non-scope guard â€” no new analytics surface / no email-send path the read-model source path imports NO email/notification send path (Epic 13 owns reminders)"
    ]
  }
]
```

Test IDs above resolve to the single complete Step2 catalog (stable title/file/line/flags); the private Phase1 handoff retains full mapped objects. Metadata is not duplicated per AC in this published document.

## Step 4 — Coverage gaps, metrics and Phase1 handoff

Execution mode: config auto, capability probe enabled; no `runtime.canLaunchSubagents`/agent-team capability adapter is supplied to this workflow, so its deterministic capability fallback is sequential. This ordinary bounded trace used no nested delegates; retained independent High sensitivity judgments are reused. Gap classification, heuristics/live rollup, recommendations, statistics, deterministic merge and private matrix save ran in order. No gate decision made in this step.

| Priority | Criteria | FULL | Coverage |
|---|---:|---:|---:|
| P0 |2|2|100%|
| P1 |5|5|100%|
| P2 |0|0|N/A (safe calculation100%)|
| P3 |0|0|N/A (safe calculation100%)|
| Total |7|7|100%|

Uncovered/partial/unit-only/integration-only required ACs:0. Critical/high/medium/low required-coverage gaps:0. All11 Applies state identities have explicit current-seam bindings; N/A rows do not inflate the denominator. All7 ACs map to E2E; AC2/AC7 additionally map to26 integration/RLS assertions.111 globally deduplicated identities:85E2E,26API/integration,0component/unit/live/other in this counted partition. Supplemental3923unit/149smoke/recovery proofs are separately reported support, not additional111 identities.

Quality evidence is bounded: static owned design/pipeline assertions and existing independent High source/runtime reviews establish meaningful explicit failure/recovery/negative-path assertions and selected first-attempt execution. The strict late-response test uses the approved controlled-stream intervention and retains its limitations. No new test-quality score, whole foreign-suite review, unmeasured WCAG contrast or universal self-cleaning claim is made; the normal separate test-quality/NFR delegates retain their work. Cross-level overlap is justified by browser usability versus server invariants, not duplicated coverage credit. Existing broader failed/flaky/skipped bodies are not quality-checked into passes.

### Adverse history and scope boundary

Both actual M workflows remain FAILED: ordinary43415039676 and release43415271262. Ordinary full DB2252pass/1fail/52rawskip failed16.4-INT-C05 during Auth CREATE setup before its functional assertions; cause UNKNOWN, key/privacy/coverage limitations remain. Qualifying test:int instead comes from separately preplanned SAME-M successful release DB2253pass/0fail/52rawskip/all26 plus complete qualified lifecycle. This does not turn ordinary CI green or explain its failure.

Full General539 logical identities:491expected/24unexpected/22skipped/2flaky;584physical records493passed/50failed/41skip descriptors. The24 unexpected families fail both attempts; CRM B07 and MyDay15.6-E03 each fail retry0/pass retry1. No failed/skipped/first-retry body is credited. Calendar custody/readback/SQLSTATE-unavailable and producer-admission failures retain unknown/unverified states. Distinct High caller/source/error-stage assessment found no consequential introduced dashboard/Q dependency invalidating the predeclared dashboard85/DB26. That scoped conclusion is reused, not a claim that foreign failures are harmless or globally unrelated. This trace does not read or grade those foreign suites as its own requirements.

Required General3 each once/retry0 plus dedicated82 each once/retry0 earn the fixed85, canonical identity SHA256 `cb3fd1437f8fed506d44d649308852efe7a4ac8460ff1c58e7421217d6bef4f6`. All52 DB and22 logical General skips receive zero credit. Actual M unit3923/0skip, nine hosted development components, ordinary149 first-attempt smoke and ordinary/release isolated recovery1pass each are qualified separate support. Standalone verify:development was NOT invoked. Native verify actually returned integrated at M; it does not complete trace or remaining coordinator gates.

### Visual/completion provenance

M ordered parents[Q,H] and complete tree equal accepted H tree438c1644bfc33455f8685d80a93a940945700e15; distinct High source review supports applicability. H human6850909113/controller131845490311 SUCCESS binds digest5b4209f92d8db320512c28fb3a5f5a7d39fd5aa05a5165a3f9730d0a50a46490, published19 at retained evidence commit9be95693d062146faf317810d54a3c02fc039ea1. This is H acceptance, not a new M owner command. Actual unchanged H frontend-FIRST wrapper exit0/log4456829f39bb5c59421f94f3b95d9b3eac9b20229738d8f9ebb58dcdf3607f31 validated the SAME CC-bound delivery. No M wrapper invocation is invented. Fresh M82 includes78 original PNG provenance; this trace views no new images. The approved outside-worker reconciliation and unchanged tree retain actual visual/source applicability, not H runtime transplanted to M.

### Recommendations and release limits

1. Complete the separately assigned E8 advisories/reconciliation/retro and actual coordinator completion/publication gates; none is completed by this trace.
2. Preserve broader adverse history and unknown causes under existing scenario owners; this trace requests no rerun, repair or additional instrumentation.
3. Retain REL-1 wider device/composite contrast/reflow (UI owner), REL-2 manual keyboard/screen-reader/daylight (QA/accessibility owner), REL-3 PhaseB consolidation (Coordinator); named people/exact release candidate remain to be assigned through the existing ledger/delivery route. Existing E16/E20 caveats remain. These release gaps do not create new E19.1 development requirements; `release_ready=false`.

Full Phase1 machine matrix saved privately at `C:\DEV\Kopplas\tmp\private\35-6-35-7-coordinator-2026-11-09\product-35-14-E8-trace-phase1-matrix-20261113.json`; no fourth tracked file. Parent explicitly allocated the required schema0.2.0 companion `closeout-e2e-trace-summary.json` under the same story-local directory; no fenced-JSON substitute for that required machine artifact is used. Output names are scope-bound adaptations, not config/helper edits.

## Step 5 — Deterministic epic gate decision: PASS

P0 coverage100% (2/2), P1 coverage100% (5/5), overall100% (7/7) meet deterministic thresholds100/90/80. Formal high-confidence oracle; rerunnable static suites with fresh qualified M execution, no live-only requirement or uncovered required AC. PASS is bounded E19.1 development trace coverage only: both M workflows remain FAILED, all52DB/22General logical skips receive zero credit, and broader failures/unknown causes and separate release/E8/native-finalization obligations remain open. No release/deployment approval is granted.

Thresholds: P0 required100%→100% MET; P1 target90%/minimum80%→100% MET; overall minimum80%→100% MET. Collection contract_static/COLLECTED and allow_gate=true make this run gate-eligible. High-confidence formal AC oracle,111 active rerunnable mapped tests and0live-only requirements apply no confidence/live cap. No manual waiver or owner-acceptance claim is used to set this trace verdict. Uncovered required ACs:[]; required-coverage blockers:[]; critical open coverage gaps:0. Those scoped zeroes are not a statement that all foreign bugs, operational risks or release obligations are closed.

The installed gate logic read the exact Phase1 matrix from the persisted tempCoverageMatrixPath, rather than regenerating it. The complete required summary is separately written to `closeout-e2e-trace-summary.json` (schema0.2.0); slim decision separately to `closeout-gate-decision.json` (schema0.1.0). Parent allocated that exact third artifact because the skill requires it. Formal-AC UI journey/state mappings are explicit above; the stock machine summary UI synthetic-oracle-only flags are not_applicable, not missing UI evidence. Repo labels use current Kopplas branding rather than historical TEA config ElproSaas.

### Validation and output boundary

- Requirements7/7 accounted; priorities2P0+5P1; full coverage percentages computed from FULL rows only. Eleven state decompositions do not inflate the denominator.
- Stable test IDs/file/title/line where available and skipped/pending/fixme flags preserved.111 unique tests across7files,85E2E+26API/integration; global deduplication independently checked. Line:null for native integration reports with no assertion line is explicit, not invented.
- Actual negative/error/read-state and current-authority tests mapped; no new endpoint or N/A mutation/dialog/file feature manufactured. New test generation, assertion weakening and source/config/spec/state/ledger writes absent.
- Full source/runtime/payload High qualification reused with current M binding, real native integrated receipt and source-tree applicability. No new Low auth/money/RLS judgment, broad code review, provider call, resource launch or suite rerun. No image viewing or M human command here.
- Both machine outputs parse with requested schema versions, all six by-level buckets, complete priority/gate/live/blocker/link fields; counts/criteria match the private matrix. Selected skipped_cases0 is only the predeclared mapped111, not a false full-suite zero-skip claim.52DB/22General raw logical skips and all broader failures remain disclosed above.
- Required Markdown/machine paths are the three specifically allocated story-local closeout artifacts. Private matrix remains outside T. No stock shared traceability/gate paths, progress companion or story Traceability section is written; these would exceed ownership.
- Standard trace-template sections are represented by context, catalog, seven-AC detailed Given/When/Then mapping, states, gap/statistics/quality notes, recommendation/release scope, gate and evidence index. Applicable checklist validated; separate NFR/test-quality/retro/status/publication remain unperformed by this role.
- Customization terminal hook is empty under the already-resolved fallback; no on_complete action. Workflow complete for this bounded trace, not completion of the story/epic/native run.

### Exact retained evidence index

- `C:\DEV\Kopplas\tmp\private\35-6-35-7-coordinator-2026-11-09\product-35-14-M-runtime-snapshot-c767ff18-20261113.md` — SHA256 `c767ff18c874dbf2a2ddcb2b69bd0afc41e945b9bab00c1161d3c4cf34546253`
- `C:\DEV\Kopplas\tmp\private\35-6-35-7-coordinator-2026-11-09\product-35-14-M-combined-source-review-high-snapshot-3aacc78d-20261113.md` — SHA256 `3aacc78dfd04a67409b6d15966acfcb40744d89e8496da5637135a551bf8939b`
- `C:\DEV\Kopplas\tmp\private\35-6-35-7-coordinator-2026-11-09\product-35-14-M-combined-evidence-proposal-snapshot-0d000f96-20261113.json` — SHA256 `0d000f96e7323e6b189d44af1569022a42ff61442d09a34f855075f9c9fef593`
- `C:\DEV\Kopplas\tmp\private\35-6-35-7-coordinator-2026-11-09\product-35-14-M-exact-verify-payload-independent-high-snapshot-10fdd9da-20261113.md` — SHA256 `10fdd9da2cc94dcbf8ee65c2ddd0fa75623979d6a33892aea9e72ed9c969c5a5`
- `C:\DEV\Kopplas\tmp\private\35-6-35-7-coordinator-2026-11-09\product-35-14-M-native-verify-output-20261113.json` — SHA256 `00193018cbfbe59cb0e39ed6c7e316cadfffeaade62ed1e4688b3a7ffbba0af7`

Actual full native raw reports under `C:\DEV\Kopplas\tmp\private\35-6-35-7-coordinator-2026-11-09\35-14-main-0a92b1f9`: dashboard SHA256b94503e7038fe7a725645822efb1622c2a2ead73ad5697cf8a97c6634d8411dd; General827d1230e50b2f14651c14b26e05ddc6c4dca7f1b3e541decbba56ac97bcf461; successful release integration010a8cd09d140a43e518266ba97cb64098e822553fd3c64da8a0746b3a132f7b. Each was rehashed during collection. Existing High reviews supply complete provider/ZIP/physical execution provenance, source authority and adverse-outcome limits.

Checkout newline provenance supplied by Root: SAME unchanged CC delivery in T has raw CRLF SHA256 `58cfa6c652001424e8d4dbda668d4c16423676151b5a16c8d01bf89cea1f1f7c`; normalized LF identity `6cd235f36b3534107d13524c7ffdff3abc419570e8a52a113899a2552f556f88` is the retained source/Git-object/original-W identity. This trace does not call6cd the T raw-file hash; no delivery byte/Git-blob edit is made.
