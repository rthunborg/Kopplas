import subprocess,sys,json
from pathlib import Path
b=Path(r'C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas');o=b/'_bmad-output/auto-bmad/preparation/story-15-5/post-f1-targeted-terminal-diagnostic-operator-source-review'
p=b/'.env.epic15.mail-runtime/story-15-5-preparation/post-f1-targeted-terminal-diagnostic-preparation/test_targeted_diagnostic.py'
r=subprocess.run([sys.executable,'-X','utf8','-B',str(p)],cwd=b,capture_output=True,timeout=60)
for name,data in [('pure-tests.stdout.txt',r.stdout),('pure-tests.stderr.txt',r.stderr),('pure-tests.exit',str(r.returncode).encode())]:
 with (o/name).open('xb')as f:f.write(data)
print(r.stdout.decode());print(r.stderr.decode());print(json.dumps({'native_exit':r.returncode,'API_GETs':0,'live_operator_transport':0}))
raise SystemExit(r.returncode)