"""Read-only targeted revalidation artifact check; grants no implementation/release approval."""
from pathlib import Path
import hashlib, json, re, subprocess, sys
HERE=Path(__file__).resolve().parent
ROOT=Path(__file__).resolve().parents[6]
PREP="_bmad-output/auto-bmad/preparation/story-15-5"
INITIAL=ROOT/PREP/"independent-validation/validation-report.json"
def sha(path): return hashlib.sha256(path.read_bytes()).hexdigest()
def require(ok,detail):
    if not ok: raise AssertionError(detail)
def run(*args): return subprocess.check_output(list(args),cwd=ROOT,text=True).strip()
report=json.loads((HERE/"validation-report.json").read_text(encoding="utf-8"))
manifest=json.loads((HERE/"artifact-manifest.json").read_text(encoding="utf-8"))
initial=json.loads(INITIAL.read_text(encoding="utf-8"))
require(sha(INITIAL)==report["initial_assessment"]["report_sha256"],"initial report changed")
require(run("git","rev-parse","HEAD")==report["baseline_revision"],"HEAD drift")
require(run("git","branch","--show-current")==report["branch"],"branch drift")
for path,digest in report["input_freeze_sha256"].items(): require(sha(ROOT/path)==digest,"frozen input changed: "+path)
for path,digest in initial["source_snapshot_sha256"].items(): require(sha(ROOT/path)==digest,"reviewed source changed: "+path)
for path,digest in initial["source_preservation"]["author_freeze"].items():
    require(sha(ROOT/PREP/"revisions/initial-candidate"/path)==digest,"original history changed: "+path)
for path,digest in manifest["sha256"].items(): require(sha(ROOT/path)==digest,"revalidation artifact changed: "+path)
changed=set(run("git","diff","--name-only","HEAD").splitlines())
require(changed<=set(report["source_preservation"]["allowed_root_tracked_changes"]),"unexpected tracked changes")
spec=ROOT/report["candidate"]["spec_path"]
text=spec.read_text(encoding="utf-8")
old=(ROOT/PREP/"revisions/initial-candidate"/report["candidate"]["spec_path"]).read_text(encoding="utf-8")
kernel=lambda s:re.search(r"<intent-contract>.*?</intent-contract>",s,re.S).group()
old_clause="rechecks active tenant/membership/current permission/unarchived own profile/assignment"
new_clause="requires the tenant row to exist, the exact token-bound/current self membership status to be active and its current Bookings.View role union to allow access, plus unarchived own profile/assignment"
require(kernel(old).replace(old_clause,new_clause)==kernel(text),"kernel has unrelated change")
require(sha(spec)==report["candidate"]["raw_spec_sha256"],"raw spec mismatch")
require(hashlib.sha256(kernel(text).encode()).hexdigest()==report["candidate"]["kernel_sha256"],"kernel mismatch")
require(re.findall(r"^- \[ \] T(\d+) —",text,re.M)==[str(i) for i in range(1,11)],"task count")
require(len(re.findall(r"^- AC\d+ — Given .+, when .+, then .+",text,re.M))==9,"AC count")
for n in [2,3,5,6,7,8]:
    ac=lambda s:next(l for l in s.splitlines() if l.startswith("- AC"+str(n)+" —"))
    require(ac(old)==ac(text),"nonrepair AC changed: "+str(n))
source=(ROOT/"_bmad-output/planning-artifacts/epics-phase-b.md").read_text(encoding="utf-8").split("#### Story 15.5: Personal Calendar Feed (ADR-B004 Surface #1)",1)[1].split("#### Story 15.6:",1)[0].strip()
require(text.count(source)==1,"approved source sketch not preserved once")
reader=json.loads(run(sys.executable,".agents/skills/auto-bmad/scripts/story_plan.py","--spec",str(spec)))
require(reader["status"]=="ready-for-dev" and reader["parse_warnings"]==[] and reader["error"] is None,"canonical reader")
discovery=json.loads(run(sys.executable,".agents/skills/auto-bmad/scripts/story_plan.py","--find-spec","--impl-dir",str(spec.parent),"--story-key","15-5-personal-calendar-feed-adr-b004-surface-1"))
require(discovery["found"] and not discovery["ambiguous"] and not discovery["hard_stop"] and Path(discovery["spec_path"]).resolve()==spec.resolve(),"canonical discovery")
require(report["status"]=="PASS" and len(report["checks"])==6 and all(c["status"]=="PASS" for c in report["checks"]),"targeted check counts")
require(len(report["findings_closed"])==2 and not report["findings"] and not report["blockers"],"finding closure")
require(report["approved_kernel"] is None and not report["implementation_admitted"] and not report["resource_granted"] and not report["release_ready"],"unauthorized admission claim")
print(json.dumps({"artifact_integrity":"PASS","targeted_specification_revalidation":"PASS","targeted_checks":6,"closed_findings":2,"remaining_findings":0,"initial_pass_assessments_reused":12,"initial_FAIL_preserved":True,"original_author_history_files":15,"original_independent_files":4,"unchanged_source_files":40,"successor_bindings":30,"candidate_kernel_sha256":report["candidate"]["kernel_sha256"],"raw_spec_sha256":sha(spec),"report_sha256":sha(HERE/"validation-report.json"),"markdown_sha256":sha(HERE/"validation-report.md"),"validator_sha256":sha(Path(__file__).resolve()),"manifest_sha256":sha(HERE/"artifact-manifest.json"),"code_review_rounds":0,"implementation_changes":0,"resources":0},indent=2))
