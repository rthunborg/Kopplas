import copy
import json
import sys
import unittest
import tempfile
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import pr_strategy as p
import state_update as writer
import state_plan


def assessment(ui=True):
    return {"approved_scope": "approved epic", "source_revision": "source-sha", "source_allows_skip": True, "stories": [
        {"key": k, "visible_ui": ui and k == "a", "scope_rationale": "actual approved behavior",
         "dependencies": [], "dependency_rationale": "independent behavior", "independent_of_pending": True}
        for k in ("a", "b")]}


def strategy():
    return p.capsule(p.select({}, assessment(), True)["patch"])


class StrategyTests(unittest.TestCase):
    def test_01_backend_epic_legacy_publication(self):
        self.assertEqual(p.select({}, assessment(False), True)["mode"], "epic-pr")

    def test_02_ui_mixed_all_stories_isolated(self):
        self.assertEqual(strategy()["mode"], "story-pr")
        self.assertEqual(len(strategy()["assessment"]["stories"]), 2)

    def test_03_existing_epic_and_single_story_unchanged(self):
        self.assertTrue(p.select({"active_story": "35.2"}, assessment())["legacy"])
        self.assertEqual(p.select({}, {}, False)["patch"], {})
        with self.assertRaises(ValueError):
            p.select({"active_story": "35.2"}, assessment(), True)

    def test_04_interruption_pin_roundtrip(self):
        patch = p.select({}, assessment(), True)["patch"]
        state = writer.default_state()
        writer.apply_patch(state, patch)
        self.assertTrue(p.select(state, assessment(), False)["resume"])
        self.assertEqual(p.select(state, assessment(), False)["patch"], {})
        changed = assessment(False)
        with self.assertRaisesRegex(ValueError, "scope drift"):
            p.select(state, changed, False)

    def test_05_dependency_requires_confirmed_main_merge(self):
        s = strategy()
        s["assessment"]["stories"][1]["dependencies"] = ["a"]
        states = {"a": {"publication_state": "published", "merge_revision": "m"}}
        self.assertEqual(p.next_story(s, states, ["m"], True)["action"], "wait")
        states["a"].update(merge_state="merged", merge_target="main")
        self.assertEqual(p.next_story(s, states, ["m"], True)["story"], "b")
        self.assertEqual(p.next_story(s, states, [], True)["action"], "wait")
        self.assertIn("dependency a", p.next_story(s, states, [], True)["blockers"]["b"][0])
        s["assessment"]["source_allows_skip"] = False
        self.assertEqual(p.next_story(s, states, [], True)["action"], "wait")
        states = {"a": {"development_state": "complete"}}
        self.assertEqual(p.next_story(strategy(), states, [], True)["story"], "a")
        states = {"a": {"development_state": "blocked", "blocker_reason": "manual decision"}}
        self.assertEqual(p.next_story(strategy(), states, [], True)["story"], "b")

    def test_06_pending_visual_continues_independent_only(self):
        states = {"a": {"development_state": "checkpoint_pending", "publication_state": "published", "visual_state": "pending"}}
        self.assertEqual(p.next_story(strategy(), states, [], True)["story"], "b")
        self.assertEqual(p.next_story(strategy(), states, [], False)["action"], "wait")
        s = strategy()
        s["assessment"]["stories"][1]["independent_of_pending"] = False
        self.assertEqual(p.next_story(s, states, [], True)["action"], "wait")

    def test_07_resume_no_duplicate_identity(self):
        identity = dict(run_id="run", repository="repo", story_key="a", branch="codex/a", worktree="C:/a", base_revision="base", base_branch="main")
        patch = p.publication_patch({}, identity)
        self.assertEqual(p.publication_patch(patch, identity), {})
        with self.assertRaises(ValueError):
            p.publication_patch(patch, dict(identity, branch="codex/duplicate"))
        with self.assertRaises(ValueError):
            p.publication_patch({}, dict(identity, base_branch="story/a"))
        intent = dict(run_id="run", repository="repo", story_key="a", operation="create-pr", branch="codex/a", base="main", head="head")
        observed = dict(repository="repo", branch="codex/a", base="main", head="head", artifact_id="PR123")
        self.assertEqual(p.reconcile_operation(intent, [observed])["action"], "reuse")
        self.assertEqual(p.reconcile_operation(intent, [])["action"], "wait")
        for matches in ([observed, observed], [dict(observed, head="other-writer")]):
            with self.assertRaises(ValueError):
                p.reconcile_operation(intent, matches)

    def test_08_publication_frontend_label_and_evidence(self):
        story = assessment()["stories"][0]
        observation = self.observation()
        self.assertEqual(p.publish_errors(story, observation), [])
        for field, value in (("verified_labels", []), ("images", []), ("exclusive_writer", False), ("scope_matches", False)):
            self.assertTrue(p.publish_errors(story, dict(observation, **{field: value})))
        self.assertTrue(p.publish_errors(story, dict(observation, head="new-head")))

    def test_09_merge_exact_head_and_visual_gates(self):
        observation = self.observation()
        for name in ("development", "ci", "coordinator_review", "acceptance", "merge_authorization"):
            observation[name] = dict(revision="head", status="passed", evidence="verified external receipt")
        observation.update(visual=dict(revision="head", status="passed", controller_verified=True), merge_method="merge", retain_branch=True)
        self.assertEqual(p.merge_errors(assessment()["stories"][0], observation), [])
        for name in ("development", "ci", "coordinator_review", "acceptance", "merge_authorization", "visual"):
            changed = copy.deepcopy(observation)
            changed[name]["revision"] = "old"
            self.assertTrue(p.merge_errors(assessment()["stories"][0], changed))

    def test_10_completion_all_merges_integration_and_backend_na(self):
        states = {k: dict(merge_revision=k, merge_state="merged", merge_target="main") for k in ("a", "b")}
        integration = dict(trace="passed", reconcile="passed", retro="passed", delivery="passed", main_revision="b", qualified_main_revision="b")
        self.assertEqual(p.completion_errors(strategy(), states, ["a", "b"], integration), [])
        self.assertTrue(p.completion_errors(strategy(), states, ["a"], integration))
        self.assertTrue(p.completion_errors(strategy(), states, ["a", "b"], dict(integration, retro="pending")))
        self.assertTrue(p.completion_errors(strategy(), states, ["a", "b"], dict(integration, main_revision="a")))
        backend = assessment(False)["stories"][0]
        observation = self.observation()
        observation.update(actual_frontend=False, images=[], verified_labels=[], visual_na_reason="no visible surface")
        self.assertEqual(p.publish_errors(backend, observation), [])

    def test_state_writer_preserves_strategy_and_rejects_migration_done(self):
        with tempfile.TemporaryDirectory() as folder:
            path = Path(folder) / "epic-1.yaml"
            writer.cmd_init(path, {"story_key": "epic-1", **p.select({}, assessment(), True)["patch"]})
            writer.cmd_set(path, {"active_story": "a"})
            self.assertEqual(p.capsule(writer.load_state(path)), strategy())
            with self.assertRaises(writer.ContractError):
                writer.cmd_set(path, {"status": "done"})
            with self.assertRaises(writer.ContractError):
                writer.cmd_set(path, {"status": " DONE "})
            with self.assertRaises(writer.ContractError):
                writer.cmd_phase_done(path, 9, None)
            result, code = state_plan.build_finalize_result(folder, "epic-1")
            self.assertEqual(code, 0)
            self.assertFalse(result["flip_bmad_status"])
            self.assertTrue(result["draft"])
            with self.assertRaises(writer.ContractError):
                writer.cmd_set(path, {p.FIELD: "{}"})
            receipt = dict(states={k: dict(merge_revision=k, merge_state="merged", merge_target="main") for k in ("a", "b")},
                           main_ancestors=["a", "b"], integration=dict(trace="passed", reconcile="passed", retro="passed", delivery="passed", main_revision="b", qualified_main_revision="b"))
            writer.cmd_set(path, {"integration_receipt_json": json.dumps(receipt), "status": "done"})
            self.assertEqual(writer.load_state(path)["status"], "done")
            legacy = Path(folder) / "epic-35.yaml"
            writer.cmd_init(legacy, {"story_key": "epic-35"})
            with self.assertRaises(writer.ContractError):
                writer.cmd_set(legacy, p.select({}, assessment(), True)["patch"])

    @staticmethod
    def observation():
        return dict(head="head", base_branch="main", qualified_main=True, exclusive_writer=True,
                    scope_matches=True, actual_frontend=True, verified_labels=["agent-fix"],
                    images=[dict(url="https://evidence/revision/image.png", revision="head", screen="screen", state="success", viewport="360x640", kind="implemented")])


if __name__ == "__main__":
    unittest.main()
