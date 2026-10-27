import copy
import importlib.util
import json
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest

SCRIPTS = Path(__file__).resolve().parents[1]
spec = importlib.util.spec_from_file_location("delivery_gate", SCRIPTS / "delivery_gate.py")
gate = importlib.util.module_from_spec(spec)
spec.loader.exec_module(gate)


def record():
    return {"policy_version": "2026-10-19", "contract_reconciliation": "Old screenshot gate deferred; integrity unchanged", "evidence_revision": "abc123",
            "development_checks": [{"name": "focused integrity", "status": "passed", "evidence": "executed 12; skipped 0"}],
            "independent_review": {"status": "passed", "evidence": "reviewer at abc123"},
            "deferred_release_validation": [{"item": "browser matrix", "owner": "release owner", "status": "deferred", "evidence": "not executed", "next_action": "run release dispatch"}],
            "release_ready": False}


class DeliveryGateTests(unittest.TestCase):
    def test_deferred_release_does_not_block_development(self):
        self.assertEqual(gate.validate(record()), [])

    def test_false_pass_and_release_claim_fail(self):
        for mutate in (lambda r: r.update(release_ready=True),
                       lambda r: r["development_checks"][0].update(status="skipped"),
                       lambda r: r.update(independent_review={"status": "deferred"}),
                       lambda r: r.pop("contract_reconciliation"),
                       lambda r: r["deferred_release_validation"][0].pop("owner")):
            data = record()
            mutate(data)
            self.assertTrue(gate.validate(data))

    def test_malformed_records_fail(self):
        for value in (None, [], {}, {"development_checks": "passed"}):
            self.assertTrue(gate.validate(value))

    def test_normalized_done_and_epic_lift_require_records_before_write(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            policy = root / gate.POLICY
            policy.parent.mkdir(parents=True)
            policy.write_text("policy")
            sprint = root / "_bmad-output/implementation-artifacts/sprint-status.yaml"
            sprint.parent.mkdir(parents=True)
            sprint.write_text("development_status:\n  epic-1: in-progress\n  1-1-example: review\n")
            original = sprint.read_bytes()
            def run(status):
                return subprocess.run([sys.executable, str(SCRIPTS / "story_plan.py"),
                    "--mark-status", "1-1-example", "--to", status,
                    "--sprint-status", str(sprint)], text=True, capture_output=True)
            for target in ("DONE", " done ", " DONE "):
                result = run(target)
                self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
                self.assertIn("delivery gate", result.stdout)
                self.assertEqual(sprint.read_bytes(), original)
            delivery = root / "_bmad-output/auto-bmad/delivery"
            delivery.mkdir(parents=True)
            (delivery / "1-1-example.json").write_text(json.dumps(record()))
            result = run(" DONE ")
            self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
            self.assertIn("epic development delivery gate", result.stdout)
            self.assertEqual(sprint.read_bytes(), original)
            (delivery / "epic-1.json").write_text(json.dumps(record()))
            result = run(" DONE ")
            self.assertEqual(result.returncode, 0, result.stdout + result.stderr)
            self.assertIn("epic-1: done", sprint.read_text())
            self.assertIn("1-1-example: done", sprint.read_text())

    def test_real_state_and_sprint_entrypoints_fail_closed(self):
        with tempfile.TemporaryDirectory() as tmp:
            root = Path(tmp)
            policy = root / gate.POLICY
            policy.parent.mkdir(parents=True)
            policy.write_text("policy")
            auto = root / "_bmad-output/auto-bmad"
            state = auto / "state/1-1-example.yaml"
            state.parent.mkdir(parents=True)
            state.write_text("story_key: 1-1-example\nstatus: in-progress\nblockers: []\nreview_unverified: false\n")
            sprint = root / "_bmad-output/implementation-artifacts/sprint-status.yaml"
            sprint.parent.mkdir(parents=True)
            sprint.write_text("development_status:\n  epic-1: in-progress\n  1-1-example: review\n")
            commands = [
                ["state_update.py", "set", "--state-file", str(state), "--json", "-"],
                ["state_plan.py", "--state-dir", str(state.parent), "--story-key", state.stem, "--finalize"],
                ["story_plan.py", "--mark-status", state.stem, "--to", "done", "--sprint-status", str(sprint)]]
            before = state.read_text(), sprint.read_text()
            for command in commands:
                result = subprocess.run([sys.executable, str(SCRIPTS / command[0]), *command[1:]], input='{"status":"done"}', text=True, capture_output=True)
                self.assertEqual(result.returncode, 1, result.stdout + result.stderr)
                self.assertIn("delivery gate", result.stdout)
            self.assertEqual(before, (state.read_text(), sprint.read_text()))
            path = auto / "delivery/1-1-example.json"
            path.parent.mkdir()
            path.write_text(json.dumps(record()))
            self.assertEqual(gate.require_for_transition(state, state.stem), [])
            epic = auto / "state/epic/epic-1.yaml"
            epic.parent.mkdir()
            (auto / "delivery/epic-1.json").write_text(json.dumps(record()))
            self.assertEqual(gate.require_for_transition(epic, "epic-1"), [])
            for command in commands:
                result = subprocess.run([sys.executable, str(SCRIPTS / command[0]), *command[1:]], input='{"status":"done"}', text=True, capture_output=True)
                self.assertEqual(result.returncode, 0, result.stdout + result.stderr)


if __name__ == "__main__":
    unittest.main()
