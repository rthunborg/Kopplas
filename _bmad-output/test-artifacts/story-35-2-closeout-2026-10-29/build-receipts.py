"""Rebuild machine companions for the bounded, human-reviewed TEA analysis.

This writes process evidence in this directory only. It runs no product tests,
network request, managed resource, Git mutation or workflow-state writer.
"""
import datetime
import hashlib
import json
from pathlib import Path

OUT = Path(__file__).resolve().parent
ROOT = OUT.parents[2]
SOURCE = "f598bb18b4322bf55ac89db6db69a41f3eb6bfd8"
MERGED = "8f9bcf8d2a0cd8a2b65fa7ad6c1fd7e236b85ff9"
STAMP = datetime.datetime.now(datetime.timezone.utc).isoformat()
UNIT = "tests/unit/auth/login-submission.test.ts"
E2E = "tests/e2e/auth/login-and-tenant-context.e2e.spec.ts"
DELIVERY = "_bmad-output/auto-bmad/delivery/spec-design-35-2-35-2.json"
DESIGN = "_bmad-output/test-artifacts/test-design-spec-design-35-2.md"
PREFIX = "_bmad-output/test-artifacts/story-35-2-closeout-2026-10-29/"


def write(name, value):
    (OUT / name).write_text(json.dumps(value, indent=2) + "\n", encoding="utf-8")


def fingerprint(path):
    p = Path(path)
    return {"path": str(path).replace("\\", "/"), "sha256": hashlib.sha256(p.read_bytes()).hexdigest()}


def case(identifier, title, file, line, level):
    return {"id": identifier, "title": title, "file": file, "line": line,
            "level": level, "status": "active", "skipped": False,
            "pending": False, "fixme": False}


tests = [case("35.2-handler-pending", "one active form attempt then refresh before root replace", UNIT, 95, "unit")]
for failure in ["invalid", "validation", "rate-limit", "connection", "returned-transport", "transport-with-rejection-code", "unknown-provider"]:
    tests.append(case("35.2-handler-" + failure, failure + " retains input and permits explicit recovery", UNIT, 125, "unit"))
tests.append(case("35.2-handler-unknown", "response loss claims neither confirmed login nor invalid credentials and never auto-retries", UNIT, 182, "unit"))
for identifier, title, line in [
    ("inherited-anonymous", "an anonymous visitor to a protected route is redirected to login", 69),
    ("inherited-admin", "tenant_admin signs in and lands in app shell", 76),
    ("inherited-context", "top bar displays resolved tenant/company and current user", 83),
    ("inherited-orphan", "no active membership receives safe no-access and zero tenant data", 96),
    ("inherited-logout", "sign out re-protects routes", 112),
    ("35.2-native-post", "native submission uses POST without credentials in the URL", 145),
]:
    tests.append(case(identifier, title, E2E, line, "e2e"))
e2e_source = (ROOT / E2E).read_text(encoding="utf-8").splitlines()
for width, height in [(360, 640), (1440, 900)]:
    for suffix, match, title in [
        ("real-login", "invalid then corrected keyboard sign-in", "invalid then corrected keyboard sign-in confirms current tenant/user"),
        ("foundation", "plain wordmark, local font", "plain wordmark, local font, readable keyboard focus and enlarged reflow"),
        ("pending", "delayed real Auth rejects duplicate", "delayed real Auth rejects duplicate form submissions"),
        ("transport", "actual SDK transport failure retains", "actual SDK transport failure retains input until explicit retry"),
    ]:
        line = next(i + 1 for i, value in enumerate(e2e_source) if match in value)
        tests.append(case(f"35.2-{suffix}-{width}", f"{title} at {width}x{height}", E2E, line, "e2e"))
by_id = {test["id"]: test for test in tests}


def ids(*fragments):
    return [t["id"] for t in tests if any(fragment in t["id"] for fragment in fragments)]


mapping = {
    "E35-2-AC1": ids("foundation"), "E35-2-AC2": ids("foundation", "pending"),
    "E35-2-AC3": ids("real-login", "pending", "transport", "handler-"),
    "E35-2-AC4": ids("foundation", "real-login"),
    "E35-2-AC5": ids("foundation"),
    "E35-2-AC6": ids("real-login", "pending", "transport", "handler-"),
    "E35-2-AC7": ids("real-login", "native-post", "inherited-"),
    "E35-2-STATE-loading": ids("pending"),
    "E35-2-STATE-loaded": ids("real-login", "inherited-context"),
    "E35-2-STATE-validation": ids("real-login", "handler-invalid", "handler-validation"),
    "E35-2-STATE-denied": ids("real-login", "inherited-orphan"),
    "E35-2-STATE-connection-required": ids("transport", "handler-connection"),
    "E35-2-STATE-submitting": ids("pending"),
    "E35-2-STATE-error-retry": ids("real-login", "transport", "handler-invalid", "handler-validation", "handler-rate-limit"),
    "E35-2-STATE-unknown": ids("transport", "handler-unknown", "handler-returned-transport", "handler-transport-with-rejection-code"),
    "E35-2-STATE-confirmed": ids("real-login", "pending", "inherited-admin", "inherited-context"),
}
requirements = [{"id": key, "priority": "P0" if key == "E35-2-AC7" else "P1",
                 "coverage": "FULL", "tests": [by_id[t] for t in values],
                 "evidence": [DELIVERY, DESIGN], "basis": "bounded development oracle; separate release obligations retained"}
                for key, values in mapping.items()]
by_level = {level: {"tests": sum(t["level"] == level for t in tests),
                    "criteria_covered": sum(any(t["level"] == level for t in req["tests"]) for req in requirements)}
            for level in ["e2e", "api", "component", "unit", "live", "other"]}
priority = {"P0": {"total": 1, "covered": 1, "percentage": 100},
            "P1": {"total": 15, "covered": 15, "percentage": 100},
            "P2": {"total": 0, "covered": 0, "percentage": 100},
            "P3": {"total": 0, "covered": 0, "percentage": 100}}
inventory = {"files": 2, "cases": len(tests), "skipped_cases": 0,
             "fixme_cases": 0, "pending_cases": 0, "by_level": by_level}
live = {"present": False, "freshness": "not_present", "counted": 0,
        "requirements_live_only": 0, "current_source_sha": MERGED,
        "recorded_source_sha": "", "results_file": ""}
oracle = {"resolution_mode": "formal_requirements", "confidence": "high",
          "sources": [DESIGN, "_bmad-output/specs/spec-design-35-2/stories/35-2-tokens-font-and-real-login.md"],
          "synthetic": False, "external_pointer_status": "not_used"}
recommendations = ["Retain separate REL-1/2/3 release work and release_ready=false.",
                   "Retain advisory NFR/test-quality findings and existing browser retry/pending inventory."]
matrix = {"phase": "PHASE_1_COMPLETE", "generated_at": STAMP,
          "trace_target": {"type": "story", "id": "35.2", "label": "single-story legacy adapter"},
          "collection_mode": "source-and-qualified-execution", "collection_status": "COLLECTED",
          "allow_gate": True, "coverage_basis": "acceptance_criteria", "summary_confidence": "high",
          "source_sha": MERGED, "execution_evidence_source_sha": SOURCE,
          "oracle": oracle, "requirements": requirements,
          "coverage_statistics": {"total_requirements": 16, "fully_covered": 16,
              "partially_covered": 0, "uncovered": 0, "overall_coverage_percentage": 100,
              "priority_breakdown": priority},
          "gap_analysis": {"critical_gaps": [], "high_gaps": [], "medium_gaps": [], "low_gaps": [], "partial_coverage_items": [], "unit_only_items": []},
          "coverage_heuristics": {"counts": {"endpoints_without_tests": 0, "auth_missing_negative_paths": 0, "happy_path_only_criteria": 0, "ui_journeys_without_e2e": 0, "ui_states_missing_coverage": 0}},
          "live_evidence": live, "live_records": [],
          "test_inventory": {"summary": inventory, "tests": tests, "blockers": []},
          "blockers": [], "recommendations": recommendations}
write("coverage-matrix.json", matrix)
matrix_read = json.loads((OUT / "coverage-matrix.json").read_text(encoding="utf-8"))
assert matrix_read["coverage_statistics"]["fully_covered"] == len(requirements)
p0 = priority["P0"]["percentage"]
p1 = priority["P1"]["percentage"]
overall = 100 * sum(r["coverage"] == "FULL" for r in requirements) / len(requirements)
gate = "FAIL" if p0 < 100 or p1 < 80 or overall < 80 else "PASS" if p1 >= 90 else "CONCERNS"
criteria = {"p0_coverage_required": "100%", "p0_coverage_actual": "100%", "p0_status": "MET",
            "p1_coverage_target": "90%", "p1_coverage_minimum": "80%", "p1_coverage_actual": "100%", "p1_status": "MET",
            "overall_coverage_minimum": "80%", "overall_coverage_actual": "100%", "overall_status": "MET"}
summary = {"schema_version": "0.2.0", "snapshot_at": STAMP, "repo": "Kopplas",
           "collection_mode": matrix["collection_mode"], "collection_status": "COLLECTED",
           "inventory_basis": "acceptance_criteria", "gate_basis": "priority_thresholds",
           "source_sha": MERGED, "execution_evidence_source_sha": SOURCE,
           "target": matrix["trace_target"], "decision_mode": "deterministic", "evaluator": "bounded Sol High TEA delegate",
           "confidence": "high", "oracle": oracle,
           "coverage": {"inventory": {"covered": 16, "total": 16, "pct": overall},
                        "priority_breakdown": {k: {"total": v["total"], "covered": v["covered"], "pct": v["percentage"]} for k, v in priority.items()}, "by_level": by_level},
           "tests": {k: v for k, v in inventory.items() if k != "by_level"},
           "risk_summary": {"critical_open": 0, "high_open": 0, "medium_open": 0, "low_open": 0},
           "heuristics": {"endpoint_gaps": 0, "auth_negative_path_status": "present", "error_path_status": "present", "ui_journey_status": "not_applicable", "ui_state_status": "not_applicable"},
           "live_evidence": live, "blockers": [], "recommendations": recommendations,
           "links": {"trace_report_path": PREFIX + "traceability-matrix.md", "trace_report_url": "", "artifact_url": "", "journey_evidence_url": ""},
           "gate_status": gate, "gate_criteria": criteria, "release_ready": False}
write("e2e-trace-summary.json", summary)
write("gate-decision.json", {"schema_version": "0.1.0", "evaluated_at": STAMP,
    "repo": "Kopplas", "target": matrix["trace_target"], "collection_status": "COLLECTED",
    "gate_basis": "priority_thresholds", "gate_status": gate,
    "rationale": "Formal bounded development oracle: P0 1/1, P1 15/15, overall 16/16 FULL; no live-only requirements or waiver. Separate release and advisory audit concerns remain.",
    "p0_status": "MET", "p1_status": "MET", "overall_status": "MET", "critical_open": 0,
    "links": summary["links"], "release_ready": False})

domain_findings = {
    "security": [("Authentication/tenant/client containment/native privacy", "PASS", "Known approved invariants; real-cookie/denied/role/native tests and exact-head containment checks retained", [DELIVERY, UNIT, E2E]),
                 ("New provider-issuance guarantee", "N/A", "No such contract is introduced or inferred from controlled captures", [DESIGN])],
    "performance": [("Latency/load/scalability/availability", "CONCERNS", "Threshold and current load/operational evidence UNKNOWN; functional browser success is not SLO measurement", [DESIGN, DELIVERY])],
    "reliability": [("Duplicate guard/explicit retry/unknown reconciliation", "PASS", "Actual caller and real SDK/browser evidence back known bounded behavior", [UNIT, E2E, DELIVERY]),
                    ("Operational error rate/burn-in/MTTR", "CONCERNS", "Threshold and applicable long-term evidence UNKNOWN; existing browser retry remains disclosed", [DELIVERY])],
    "maintainability": [("Current quality checks and proportional seams", "PASS", "Required exact-head unit/build/static checks and unchanged dependency boundary retained", [DELIVERY, UNIT]),
                        ("Coverage percentage/duplication/vulnerability/observability metrics", "CONCERNS", "No current report or applicable numeric threshold supplied: UNKNOWN; test-quality rubric has separate advisory findings", [DELIVERY, PREFIX + "test-review.md"])],
}
for domain, values in domain_findings.items():
    write("nfr-" + domain + ".json", {"domain": domain, "execution": "sequential-worker-step", "ran": True,
          "source_sha": SOURCE, "risk_level": "LOW" if domain == "security" else "MEDIUM",
          "findings": [{"category": category, "status": status, "description": description, "evidence": evidence,
                        "recommendations": [] if status in ["PASS", "N/A"] else ["Retain UNKNOWN/CONCERNS and route applicable release evidence to existing owners; no invented threshold or new program."]}
                       for category, status, description, evidence in values],
          "compliance": {"release_approval": "not-assessed", "provider_issuance_guarantee": "not-claimed"},
          "priority_actions": [], "summary": "Bounded evidence audit; no new scan/runtime execution or compliance certification."})
nfr_reports = [json.loads((OUT / ("nfr-" + d + ".json")).read_text(encoding="utf-8")) for d in domain_findings]
statuses = [f["status"] for report in nfr_reports for f in report["findings"]]
write("nfr-summary.json", {"ran": True, "status": "FAIL" if "FAIL" in statuses else "CONCERNS" if "CONCERNS" in statuses else "PASS",
    "advisory": True, "unknown_threshold_rule": "CONCERNS, never PASS", "domain_outputs": ["nfr-" + d + ".json" for d in domain_findings],
    "new_production_defects": 0, "release_ready": False})


def violation(file, line, row, severity, description, suggestion):
    return {"file": file, "line": line, "row": row, "severity": severity,
            "description": description, "suggestion": suggestion}


det = [
    violation(UNIT, 151, "H3", "HIGH", "Expected message/disabled/retry assertions are selected by deterministic failure fixture; the literal registry bans conditional expectation selection. All seven fixture variants execute; no observed product result skips an assertion.", "If separately authorized, express explicit expectations per fixture in table data or separate case bodies; preserve all variants and actual assertions."),
    violation(E2E, 268, "H3", "HIGH", "Phone target geometry assertions run only for the statically declared 360px case. Both declared viewports execute; selection is by input, not observed UI state.", "If separately authorized, split the phone-specific assertion into an explicitly named parameterized case without weakening geometry coverage."),
    violation(E2E, 380, "H3", "HIGH", "Reduced-height reachability assertions are selected only for the fixed 360px viewport. This is deterministic scope selection, not a conditional pass based on product output.", "If separately authorized, give the phone reduced-height scenario its own explicit case while preserving both existing viewports."),
]
iso = [violation(UNIT, 1, "M4", "MEDIUM", "Nine handler instances are top-level with no describe/context group, matching the literal ungrouped-suite row; their names already identify story and scenario.", "If separately authorized, add one descriptive suite group without changing behavior.")]
maint = []
for line in [69, 76, 83, 96, 112]:
    maint.append(violation(E2E, line, "L2", "LOW", "Inherited Story 2.1 test name has no [P0-P3] marker; measured neighborhood priorityMarkers convention is established (27/40). This is preserved existing source, not a new product defect.", "If separately authorized, annotate inherited priorities without changing assertions or scope."))
for line in [106, 304, 326, 418, 460]:
    maint.append(violation(E2E, line, "L3", "LOW", "Lookup uses a bare semantic tag or getByText rather than test-id/role/label; measured testIds convention is established (31/40). Labels/roles are otherwise extensively used; raw form lookup deliberately targets native requestSubmit coverage.", "If separately authorized, evaluate stable semantic/test-id lookup without adding a production hook solely for the rubric or losing native-submit coverage."))
perf = [violation(E2E, 60, "M1", "MEDIUM", "The shared login helper and subsequent content reads register hydration/data assertions after page.goto; no data-specific signal is registered before that navigation. Submit-time Auth interception is correctly before submit, and existing server/locator checks execute.", "If separately authorized, register the relevant existing navigation/data readiness signal before the action; preserve real-cookie authority and avoid stubbing away the provider.")]
dimensions = {"determinism": det, "isolation": iso, "maintainability": maint, "performance": perf}
weights = {"CRITICAL": 20, "HIGH": 10, "MEDIUM": 5, "LOW": 2}
for dimension, violations in dimensions.items():
    score = max(0, 100 - sum(weights[v["severity"]] for v in violations))
    write("test-review-" + dimension + ".json", {"dimension": dimension, "ran": True, "execution": "sequential-worker-step", "score": score,
          "max_score": 100, "grade": "A" if score >= 90 else "B" if score >= 80 else "C" if score >= 70 else "D" if score >= 60 else "F",
          "violations": violations, "recommendations": [],
          "summary": "Literal installed test-quality registry applied; no source edits or new execution. Behavioral trace is separate."})
all_violations = [v for values in dimensions.values() for v in values]
dedup = {(v["file"], "file" if v["row"] in {"H5", "H6", "H7", "H8", "L4"} else v["line"], v["row"]): v for v in all_violations}
values = list(dedup.values())
counts = {severity: sum(v["severity"] == severity for v in values) for severity in ["CRITICAL", "HIGH", "MEDIUM", "LOW"]}
deduction = counts["CRITICAL"] * 10 + counts["HIGH"] * 5 + counts["MEDIUM"] * 2 + counts["LOW"]
score = max(0, min(100, 100 - deduction))
recommendation = "Block" if counts["CRITICAL"] else "Request Changes" if counts["HIGH"] or score < 70 else "Approve with Comments" if counts["MEDIUM"] + counts["LOW"] else "Approve"
write("test-review-summary.json", {"ran": True, "overall_score": score, "overall_grade": "C" if 70 <= score < 80 else "other",
    "recommendation": recommendation, "advisory": True, "violations_summary": {"total": len(values), **counts},
    "bonuses": {key: 0 for key in ["excellentBdd", "comprehensiveFixtures", "dataFactories", "networkFirst", "perfectIsolation", "allTestIds"]},
    "all_violations": values, "convention_baseline": "convention-baseline.json",
    "context_basis": "pr_diff", "review_files": [UNIT, E2E], "excluded_files": [],
    "limits": ["Literal H3 findings are deterministic input/viewport selection, not demonstrated result-dependent assertion avoidance.", "Inherited marker/selector/grouping findings are test structure, not introduced production defects.", "No runtime duration is measured in this audit; current CI counts are reused.", "No test edits authorized in process-only closeout."], "release_ready": False})

inputs = [UNIT, E2E, "playwright.config.ts", "package.json", DESIGN,
          "_bmad-output/specs/spec-design-35-2/SPEC.md",
          "_bmad-output/specs/spec-design-35-2/source-binding.json",
          "docs/quality/story-35-2-closeout-tea-routing-2026-10-29.json", DELIVERY]
write("input-provenance.json", {"recorded_at": STAMP, "source_sha": SOURCE, "merged_source_sha": MERGED,
    "inputs": [{"path": p, "sha256": hashlib.sha256((ROOT / p).read_bytes()).hexdigest()} for p in inputs],
    "note": "Hashes describe the file bytes read at this audit point. Adapter/delivery may receive later author-only closeout additions; product source identity remains separate."})
skill_base = Path("C:/DEV/Kopplas/.agents/skills")
skills = ["bmad-testarch-automate", "bmad-testarch-trace", "bmad-testarch-nfr", "bmad-testarch-test-review"]
write("phase8-tea-result.json", {"schema_version": "1.0", "story_id": "35.2", "ran": True, "ran_at": STAMP,
    "phase": 8, "workflow_status": "completed", "source_sha": SOURCE, "merged_source_sha": MERGED,
    "skills": [{"name": s, **fingerprint(skill_base / s / "SKILL.md")} for s in skills],
    "execution": {"mode": "coordinator-approved sequential bounded worker steps", "actual_new_product_test_runs": 0,
                  "new_test_files": 0, "new_managed_resources": 0, "nested_agents_spawned": 0,
                  "pact_mcp_reachable": False, "completion_hooks": "resolved empty", "output_scope": PREFIX},
    "marker_proposals": {"trace": "done", "nfr": "done", "test_review": "done"},
    "verdicts": {"trace": gate, "nfr": "CONCERNS", "test_review": recommendation},
    "advisory": {"nfr": True, "test_review": True},
    "trace": {"report": PREFIX + "traceability-matrix.md", "summary": PREFIX + "e2e-trace-summary.json", "gate": PREFIX + "gate-decision.json", "requirements": 16, "full": 16},
    "nfr": {"report": PREFIX + "nfr-assessment.md", "summary": PREFIX + "nfr-summary.json", "unknowns": ["load/performance/operational targets", "long-term rate/MTTR/burn-in", "coverage/duplication/vulnerability/observability metrics", "separate release/manual/device evidence"]},
    "test_review": {"report": PREFIX + "test-review.md", "summary": PREFIX + "test-review-summary.json", "score": score, "findings": counts,
                    "finding_scope": "literal test-structure rubric; deterministic fixture/viewport expectation selection, inherited markers/selectors, grouping and readiness; no production defect demonstrated"},
    "release_ready": False,
    "limits": ["Completed/done markers mean the audit executed, not that every advisory verdict passed.", "Existing exact-head CI, accepted packet and fresh independent product review are reused, not rerun or relabeled as TEA phases.", "No provider issuance guarantee from controlled captures.", "REL-1/2/3 and E15 pending checks retain original ownership/provenance.", "Independent process review of these new artifacts remains coordinator-owned."]})

for p in OUT.glob("*.json"):
    json.loads(p.read_text(encoding="utf-8"))
assert len(tests) == 23 and sum(t["level"] == "unit" for t in tests) == 9
assert gate == "PASS" and score == 71 and recommendation == "Request Changes"
print(json.dumps({"trace": gate, "requirements": len(requirements), "tests": inventory,
                  "nfr": "CONCERNS", "test_review": recommendation, "score": score, "findings": counts}, indent=2))
