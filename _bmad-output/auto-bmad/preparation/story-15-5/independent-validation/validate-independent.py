"""Read-only Story15.5 independent-report integrity check; never approves the spec."""
from pathlib import Path
import hashlib, json, re, subprocess, sys

HERE = Path(__file__).resolve().parent
ROOT = Path(__file__).resolve().parents[5]
BASELINE = "159557e114f18123e73282c39c90830917de9948"
def sha(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()
def run(*args):
    return subprocess.check_output(list(args), cwd=ROOT, text=True).strip()
def require(condition, detail):
    if not condition:
        raise AssertionError(detail)

report = json.loads((HERE/"validation-report.json").read_text(encoding="utf-8"))
manifest = json.loads((HERE/"artifact-manifest.json").read_text(encoding="utf-8"))
require(run("git","rev-parse","HEAD")==BASELINE,"HEAD drift")
require(run("git","branch","--show-current")==report["branch"],"branch drift")
for path, digest in report["source_preservation"]["author_freeze"].items():
    require(sha(ROOT/path)==digest, "author freeze changed: "+path)
for path, digest in report["source_snapshot_sha256"].items():
    require(sha(ROOT/path)==digest, "reviewed source changed: "+path)
for path, digest in manifest["sha256"].items():
    require(sha(ROOT/path)==digest,"independent artifact changed: "+path)
require(manifest["candidate_kernel_sha256"]==report["candidate"]["kernel_sha256"],"manifest kernel mismatch")
require(manifest["candidate_raw_spec_sha256"]==report["candidate"]["raw_spec_sha256"],"manifest raw mismatch")
changed=set(run("git","diff","--name-only","HEAD").splitlines())
require(changed<=set(report["source_preservation"]["allowed_root_tracked_changes"]),"unexpected tracked source change: "+str(changed))
context=ROOT/"_bmad-output/implementation-artifacts/epic-15-context.md"
require(sha(context)==report["source_preservation"]["cached_epic_context_sha256"],"epic context changed")
spec=ROOT/report["candidate"]["spec_path"]
require(sha(spec)==report["candidate"]["raw_spec_sha256"],"raw spec drift")
text=spec.read_text(encoding="utf-8")
kernel=re.search(r"<intent-contract>.*?</intent-contract>",text,re.S).group()
require(hashlib.sha256(kernel.encode()).hexdigest()==report["candidate"]["kernel_sha256"],"kernel drift")
require(kernel==(ROOT/"_bmad-output/auto-bmad/preparation/story-15-5/candidate-intent-contract.txt").read_text(encoding="utf-8"),"candidate kernel companion mismatch")
require(re.findall(r"^- \[ \] T(\d+) —",text,re.M)==[str(i) for i in range(1,11)],"task enumeration mismatch")
require(len(re.findall(r"^- AC\d+ — Given .+, when .+, then .+",text,re.M))==9,"AC count mismatch")
source=(ROOT/"_bmad-output/planning-artifacts/epics-phase-b.md").read_text(encoding="utf-8").split("#### Story 15.5: Personal Calendar Feed (ADR-B004 Surface #1)",1)[1].split("#### Story 15.6:",1)[0].strip()
require(text.count(source)==1,"source acceptance not preserved once")
reader=json.loads(run(sys.executable,".agents/skills/auto-bmad/scripts/story_plan.py","--spec",str(spec)))
require(reader["status"]=="ready-for-dev" and reader["parse_warnings"]==[] and reader["error"] is None,"canonical reader mismatch")
discovery=json.loads(run(sys.executable,".agents/skills/auto-bmad/scripts/story_plan.py","--find-spec","--impl-dir",str(spec.parent),"--story-key","15-5-personal-calendar-feed-adr-b004-surface-1"))
require(discovery["found"] and not discovery["ambiguous"] and not discovery["hard_stop"],"discovery mismatch")
require(Path(discovery["spec_path"]).resolve()==spec.resolve(),"discovery path mismatch")
require(len(report["checks"])==14 and sum(c["status"]=="PASS" for c in report["checks"])==12 and sum(c["status"]=="FAIL" for c in report["checks"])==2,"check count mismatch")
require(report["status"]=="FAIL" and len(report["findings"])==2,"verdict/findings drift")
require(report["approved_kernel"] is None and not report["implementation_admitted"] and not report["release_ready"] and not report["resource_granted"],"unauthorized approval claim")
print(json.dumps({"artifact_integrity":"PASS","specification_verdict":"FAIL","checks":14,"checks_passed":12,"checks_failed":2,"findings":[f["id"] for f in report["findings"]],"author_frozen_files":len(report["source_preservation"]["author_freeze"]),"source_snapshot_files":len(report["source_snapshot_sha256"]),"tracked_changes":sorted(changed),"candidate_kernel_sha256":report["candidate"]["kernel_sha256"],"raw_spec_sha256":sha(spec),"report_sha256":sha(HERE/"validation-report.json"),"markdown_sha256":sha(HERE/"validation-report.md"),"validator_sha256":sha(Path(__file__).resolve()),"manifest_sha256":sha(HERE/"artifact-manifest.json"),"resources":0,"implementation_changes":0},indent=2))
