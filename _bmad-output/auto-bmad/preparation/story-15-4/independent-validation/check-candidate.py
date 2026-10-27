"""Independent bounded planning checks. Writes only its own machine receipt."""
from pathlib import Path
import ast
import hashlib
import json
import re
import subprocess
import sys

HERE = Path(__file__).resolve().parent
ROOT = HERE.parents[4]
PREP = HERE.parent
SPEC = ROOT / "_bmad-output/implementation-artifacts/spec-15-4-time-reporting-filing-timesheet-review.md"
BASE = "5040f683cf9446d39de8512cdca82242c55fca3e"
STATE = "_bmad-output/auto-bmad/state/15-4-time-reporting-filing-timesheet-review.yaml"
checks = []

def sha(data):
    return hashlib.sha256(data).hexdigest()

def check(name, passed, detail=None):
    checks.append({"name": name, "passed": bool(passed), "detail": detail})

def git(*args):
    result = subprocess.run(["git", "-C", str(ROOT), *args], capture_output=True, text=True)
    assert result.returncode == 0, result.stderr
    return result.stdout.strip()

head_before = git("rev-parse", "HEAD")
tracked_before = git("status", "--porcelain", "--untracked-files=no")
state_hash_before = sha((ROOT / STATE).read_bytes())
check("baseline-head", head_before == BASE, head_before)
branch = git("branch", "--show-current")
check("owned-branch", branch == "codex/epic-15-scheduling-time-calendar", branch)
changed = git("diff", "HEAD", "--name-only").splitlines()
check("only-expected-root-state-tracked-delta", changed == [STATE], changed)
manifest = json.loads((PREP / "artifact-manifest.json").read_text(encoding="utf8"))
check("author-manifest-baseline", manifest["baseline_revision"] == BASE)
manifest_errors = []
for rel, digest in manifest["sha256"].items():
    path = ROOT / rel
    if not path.is_file() or sha(path.read_bytes()) != digest:
        manifest_errors.append(rel)
check("author-manifest-13-bindings", len(manifest["sha256"]) == 13 and not manifest_errors, {"bindings": len(manifest["sha256"]), "errors": manifest_errors})
author_files = [p for p in PREP.iterdir() if p.is_file()]
check("all-13-author-preparation-artifacts", len(author_files) == 13 and all(p.name == "artifact-manifest.json" or str(p.relative_to(ROOT)).replace("\\", "/") in manifest["sha256"] for p in author_files), len(author_files))
raw = SPEC.read_bytes()
text = raw.decode("utf8").replace("\r\n", "\n")
kernel = re.search(r"<intent-contract>.*?</intent-contract>", text, re.S).group()
kernel_hash = sha(kernel.encode("utf8"))
raw_hash = sha(raw)
check("candidate-raw-hash", raw_hash == "7933d020fba0986d283294cb94f85859a58d1fdc83f884a4d29e8b69751c89bb", raw_hash)
check("candidate-kernel-hash", kernel_hash == "3c701d71dba37a136ae104fd24c3b223ef46081913301fb43ff92baca3f16ffb", kernel_hash)
check("candidate-kernel-file-equality", (PREP / "candidate-intent-contract.txt").read_bytes() == kernel.encode("utf8"))
epics = (ROOT / "_bmad-output/planning-artifacts/epics-phase-b.md").read_text(encoding="utf8")
source_ac = epics.split("#### Story 15.4: Time Reporting — Filing, Timesheet, Review", 1)[1].split("#### Story 15.5:", 1)[0].strip()
check("one-verbatim-original-ac-sketch", text.count(source_ac) == 1, text.count(source_ac))
tasks = re.findall(r"^- \[ \] T(\d+) —", text, re.M)
acs = re.findall(r"^- AC(\d+) — Given .+, when .+, then .+", text, re.M)
check("ten-ordered-path-bound-tasks", tasks == [str(i) for i in range(1, 11)], len(tasks))
check("nine-gwt-acceptance-criteria", acs == [str(i) for i in range(1, 10)], len(acs))
check("no-template-placeholders", not re.search(r"\b(TBD|ONE_TO_TWO_SENTENCES|HAPPY_PATH|ERROR_CASE|DESIGN_RATIONALE_AND_EXAMPLES)\b", text))
check("single-kernel-pair", text.count("<intent-contract>") == text.count("</intent-contract>") == 1)
check("no-premature-final-review-trail", "## Suggested Review Order" not in text)
context_paths = re.findall(r"^  - (.+)$", text.split("---", 2)[1], re.M)
check("frontmatter-context-paths-exist", all((ROOT / p).is_file() for p in context_paths), len(context_paths))
preservation = json.loads((PREP / "source-preservation-before.json").read_text(encoding="utf8"))
context = ROOT / "_bmad-output/implementation-artifacts/epic-15-context.md"
context_hash = sha(context.read_bytes())
check("cached-context-byte-conservation", context_hash == preservation["cached_context_sha256"] == "f41bccd2029d5dbd027f9b98c3f7b3e8b93b4ce7627331ec7bcf2592aded910a", context_hash)
check("cached-context-current-mtime", context.stat().st_mtime >= max(p.stat().st_mtime for p in (ROOT / "_bmad-output/planning-artifacts").iterdir() if p.is_file()))
snapshot = ROOT / ".env.epic15.mail-runtime/story-15-4-preparation/root-coordinator-snapshot-20261020.json"
check("coordinator-snapshot-digest", sha(snapshot.read_bytes()) == "7e1e05d64ff28638b2b606a78ba293922e65ab9f359e00f86049f6929c78a4b8")
ast.parse((PREP / "validate-planning.py").read_text(encoding="utf8"))
check("author-validator-inspected-and-parses", True, "Not executed: writes author-owned receipts and requires clean tracked status; independent equivalents used.")
helper = ROOT / ".agents/skills/auto-bmad/scripts/story_plan.py"
commands = []
for mode, args in (("reader", ["--spec", str(SPEC)]), ("discovery", ["--find-spec", "--impl-dir", str(SPEC.parent), "--story-key", "15-4-time-reporting-filing-timesheet-review"])):
    command = [sys.executable, str(helper), *args]
    result = subprocess.run(command, capture_output=True, text=True)
    payload = json.loads(result.stdout) if result.returncode == 0 else {}
    commands.append({"mode": mode, "command": command, "exit_code": result.returncode})
    if mode == "reader":
        check("actual-authoritative-reader", result.returncode == 0 and payload.get("status") == "ready-for-dev" and payload.get("parse_warnings") == [] and payload.get("error") is None and payload.get("frontmatter", {}).get("warnings") == ["oversized"], {"status": payload.get("status"), "parse_warnings": payload.get("parse_warnings"), "warnings": payload.get("frontmatter", {}).get("warnings")})
    else:
        check("actual-unique-discovery", result.returncode == 0 and payload.get("found") and not payload.get("ambiguous") and not payload.get("hard_stop") and Path(payload.get("spec_path", "")) == SPEC, {k: payload.get(k) for k in ("found", "ambiguous", "hard_stop", "warnings")})
diff = subprocess.run(["git", "-C", str(ROOT), "diff", "--check"], capture_output=True, text=True)
check("git-diff-check", diff.returncode == 0, {"exit_code": diff.returncode, "output": diff.stdout + diff.stderr})
check("no-time-report-implementation", not (ROOT / "src/features/time-reports").exists() and not (ROOT / "src/server/read-models/time-reports.ts").exists() and not any("time_report" in p.name for p in (ROOT / "supabase/migrations").iterdir()))
migrations = sorted(p.name for p in (ROOT / "supabase/migrations").iterdir() if p.is_file())
check("latest-migration-108-preserved", migrations[-1] == "20261020180000_conflict_resolver.sql", {"count": len(migrations), "latest": migrations[-1]})
check("tracked-source-and-root-state-conserved-during-checks", git("rev-parse", "HEAD") == head_before and git("status", "--porcelain", "--untracked-files=no") == tracked_before and sha((ROOT / STATE).read_bytes()) == state_hash_before)
result = {"kind": "independent-specification-validation-machine-checks", "baseline_revision": BASE, "branch": branch, "candidate_raw_sha256": raw_hash, "candidate_kernel_sha256": kernel_hash, "author_artifact_manifest_sha256": sha((PREP / "artifact-manifest.json").read_bytes()), "author_preparation_artifacts": len(author_files), "author_manifest_bindings": len(manifest["sha256"]), "tasks": len(tasks), "acceptance_criteria": len(acs), "checks_passed": sum(c["passed"] for c in checks), "checks_failed": sum(not c["passed"] for c in checks), "checks": checks, "actual_reader_commands": commands, "tracked_status": tracked_before, "root_state_sha256_observed_only": state_hash_before, "runtime_tests_executed": 0, "resources_started": 0, "author_validator_executed": False, "approved_binding_claimed": False}
(HERE / "machine-checks.json").write_text(json.dumps(result, indent=2) + "\n", encoding="utf8", newline="\n")
print(json.dumps({k: result[k] for k in ("checks_passed", "checks_failed", "tasks", "acceptance_criteria", "author_preparation_artifacts", "author_manifest_bindings", "candidate_raw_sha256", "candidate_kernel_sha256")}))
raise SystemExit(0 if result["checks_failed"] == 0 else 1)
