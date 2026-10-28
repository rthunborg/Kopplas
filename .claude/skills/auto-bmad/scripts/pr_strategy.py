#!/usr/bin/env python3
"""Read-only sequential publication planner. Emits patches for existing state_update.

Evidence inputs are observations, never authorization. The coordinator verifies them
against Git/GitHub and existing delivery/visual controllers before applying a patch.
No network, Git mutation, resource launch or independent state store is used here.
"""
import argparse
import json
from pathlib import Path

VERSION = 1
FIELD = "pr_strategy_json"


def require(condition, message):
    if not condition:
        raise ValueError(message)


def text(value):
    return isinstance(value, str) and bool(value.strip())


def capsule(state):
    raw = state.get(FIELD)
    if raw is None:
        return None
    result = json.loads(raw)
    require(result.get("version") == VERSION, "unsupported strategy version; do not migrate an active run")
    return result


def encode(value):
    return {FIELD: json.dumps(value, sort_keys=True, separators=(",", ":"))}


def transition_errors(current, patch, initializing=False):
    """Local state integrity only; external evidence is verified by existing gates."""
    errors = []
    for field in (FIELD, "publication_identity_json"):
        if field in patch and field in current and patch[field] != current[field]:
            errors.append(f"{field} is immutable; explicit reassessment cannot silently switch an active run")
    if FIELD in patch and FIELD not in current and not initializing:
        errors.append("cannot add strategy to an existing legacy anchor")
    combined = {**current, **patch}
    if str(patch.get("status", "")).strip().lower() == "done":
        try:
            strategy = capsule(combined)
            if strategy and strategy["mode"] == "story-pr":
                receipt = json.loads(combined.get("integration_receipt_json", "{}"))
                errors.extend(completion_errors(strategy, receipt.get("states", {}), receipt.get("main_ancestors", []), receipt.get("integration", {})))
            if combined.get("publication_identity_json") and (combined.get("merge_state") != "merged" or combined.get("merge_target") != "main" or not text(combined.get("merge_revision"))):
                errors.append("story publication remains resumable until required merge is observed on main")
        except (ValueError, KeyError, TypeError) as exc:
            errors.append(str(exc))
    return errors


def select(state, assessment, fresh=False):
    """Pin approved scope once; absence on an existing anchor means legacy forever."""
    existing = capsule(state)
    if existing is not None:
        require(existing["assessment"] == assessment, "scope drift: reassess with owner before incompatible publication; strategy remains pinned")
        return {"mode": existing["mode"], "patch": {}, "resume": True}
    if not fresh:
        return {"mode": "epic-pr", "patch": {}, "legacy": True}
    require(not state, "fresh selection requires absent anchor; existing legacy runs cannot migrate")
    require(text(assessment.get("source_revision")) and text(assessment.get("approved_scope")), "approved source identity and revision required")
    stories = assessment.get("stories")
    require(isinstance(stories, list) and bool(stories), "ordered approved stories required")
    keys = [s.get("key") for s in stories]
    require(all(text(k) for k in keys) and len(set(keys)) == len(keys), "unique story identities required")
    for index, story in enumerate(stories):
        require(isinstance(story.get("visible_ui"), bool) and text(story.get("scope_rationale")), "actual visible scope assessment required, not filenames")
        require(isinstance(story.get("dependencies"), list) and text(story.get("dependency_rationale")), "explicit dependency assessment required")
        external = assessment.get("external_dependencies", [])
        require(all(dep in keys[:index] or dep in external for dep in story["dependencies"]), "dependencies must name earlier approved stories or assessed external prerequisites")
        require(isinstance(story.get("independent_of_pending"), bool), "explicit independence assessment required")
    mode = "story-pr" if any(s["visible_ui"] for s in stories) else "epic-pr"
    value = {"version": VERSION, "mode": mode, "assessment": assessment}
    return {"mode": mode, "patch": encode(value), "resume": False}


def publication_patch(state, identity):
    """Write identity before launching anything; uncertain outcomes are reconciled."""
    for name in ("run_id", "repository", "story_key", "branch", "worktree", "base_revision"):
        require(text(identity.get(name)), f"{name} required")
    require(identity.get("base_branch") == "main", "story PR must target qualified main")
    old = state.get("publication_identity_json")
    if old is not None:
        require(json.loads(old) == identity, "existing identity differs: reconcile, never create duplicate artifacts")
        return {}
    return {"publication_identity_json": json.dumps(identity, sort_keys=True)}


def reconcile_operation(intent, matches):
    """Reconcile read-only provider observations; unknown is never retry authority."""
    for key in ("run_id", "repository", "story_key", "operation", "branch", "base", "head"):
        require(text(intent.get(key)), f"operation intent {key} required")
    require(isinstance(matches, list), "observed artifact matches required")
    if not matches:
        return {"action": "wait", "reason": "absence alone does not prove original operation refusal"}
    require(len(matches) == 1, "ambiguous artifacts; do not retry or create replacements")
    observed = matches[0]
    for key in ("repository", "branch", "base", "head"):
        require(observed.get(key) == intent[key], f"observed {key} conflicts with operation intent")
    require(text(observed.get("artifact_id")), "durable observed artifact identity required")
    return {"action": "reuse", "artifact_id": observed["artifact_id"], "head": observed["head"]}


def next_story(strategy, states, main_ancestors, source_allows_skip=False):
    require(strategy["mode"] == "story-pr", "legacy epic uses existing loop")
    main_ancestors = set(main_ancestors)
    pending = []
    reasons = {}
    for story in strategy["assessment"]["stories"]:
        key = story["key"]
        state = states.get(key, {})
        merged = state.get("merge_revision")
        if merged and merged in main_ancestors and state.get("merge_state") == "merged" and state.get("merge_target") == "main":
            continue
        if state.get("publication_state") == "published" or state.get("development_state") in ("blocked", "needs-human"):
            pending.append(key)
            reasons[key] = ([state.get("blocker_reason") or "blocked: owner action required"] if state.get("development_state") in ("blocked", "needs-human") else
                            [f"{gate}: {state.get(field) or 'pending'}" for gate, field in (("CI", "ci_status"), ("review", "review_state"), ("visual", "visual_state"), ("merge", "merge_state"))])
            continue
        missing = [d for d in story["dependencies"] if not states.get(d, {}).get("merge_revision") or states[d]["merge_revision"] not in main_ancestors or states[d].get("merge_state") != "merged" or states[d].get("merge_target") != "main"]
        if missing:
            pending.append(key)
            reasons[key] = [f"dependency {dep}: confirmed merged-main ancestry required" for dep in missing]
            continue
        if pending and not (source_allows_skip and strategy["assessment"].get("source_allows_skip") is True and story["independent_of_pending"]):
            reasons[key] = ["source order or independence not established"]
            return {"action": "wait", "pending": pending, "blockers": reasons, "reason": "source order or independence not established"}
        return {"action": "resume" if state else "start", "story": key, "pending": pending, "blockers": reasons}
    return {"action": "wait" if pending else "integration", "pending": pending, "blockers": reasons}


def publish_errors(story, observation):
    errors = []
    def check(ok, reason):
        if not ok:
            errors.append(reason)
    head = observation.get("head")
    check(text(head), "actual full candidate head required")
    check(observation.get("base_branch") == "main" and observation.get("qualified_main") is True, "qualified main required")
    check(observation.get("exclusive_writer") is True, "exclusive current-head writer ownership required")
    check(observation.get("scope_matches") is True, "scope drift requires reassessment before publication")
    if story["visible_ui"] or observation.get("actual_frontend") is True:
        check(observation.get("actual_frontend") is True, "assessed UI scope requires actual frontend reconciliation")
        check("agent-fix" in observation.get("verified_labels", []), "actual frontend PR requires verified agent-fix label")
        images = observation.get("images", [])
        check(bool(images), "frontend publication requires durable revision-bound screenshots")
        for item in images:
            check(item.get("revision") == head and all(text(item.get(k)) for k in ("url", "screen", "state", "viewport", "kind")), "screenshots require current revision and screen/state/viewport/kind labels")
    else:
        check(text(observation.get("visual_na_reason")), "backend-only publication requires justified visual N/A")
    return errors


def merge_errors(story, observation):
    errors = publish_errors(story, observation)
    head = observation.get("head")
    for name in ("development", "ci", "coordinator_review", "acceptance", "merge_authorization"):
        evidence = observation.get(name, {})
        if evidence.get("revision") != head or evidence.get("status") != "passed" or not text(evidence.get("evidence")):
            errors.append(f"{name} must pass for actual current head with independently verified evidence")
    if story["visible_ui"] or observation.get("actual_frontend"):
        visual = observation.get("visual", {})
        if visual.get("revision") != head or visual.get("status") != "passed" or visual.get("controller_verified") is not True:
            errors.append("operational visual controller/manual acceptance required for current head")
    if observation.get("merge_method") != "merge" or observation.get("retain_branch") is not True:
        errors.append("merge commit and branch retention required")
    return errors


def completion_errors(strategy, states, ancestors, integration):
    errors = []
    for story in strategy["assessment"]["stories"]:
        state = states.get(story["key"], {})
        if not state.get("merge_revision") or state["merge_revision"] not in ancestors or state.get("merge_state") != "merged" or state.get("merge_target") != "main":
            errors.append(f"{story['key']}: required merge not observed on main")
    for name in ("trace", "reconcile", "retro", "delivery"):
        if integration.get(name) != "passed":
            errors.append(f"integration {name} obligation unresolved")
    if not text(integration.get("main_revision")) or integration["main_revision"] not in ancestors or integration.get("main_revision") != integration.get("qualified_main_revision"):
        errors.append("integration evidence must identify qualified main revision")
    return errors


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("select", "identity", "reconcile", "next", "publish", "merge", "complete"))
    parser.add_argument("input", type=Path, help="JSON input; output is advisory or existing-state patch")
    args = parser.parse_args()
    try:
        data = json.loads(args.input.read_text(encoding="utf-8"))
        op = args.operation
        if op == "select":
            result = select(data["state"], data["assessment"], data.get("fresh", False))
        elif op == "identity":
            result = {"patch": publication_patch(data["state"], data["identity"])}
        elif op == "reconcile":
            result = reconcile_operation(data["intent"], data["matches"])
        elif op == "next":
            result = next_story(data["strategy"], data["states"], data["main_ancestors"], data.get("source_allows_skip", False))
        else:
            errors = (completion_errors(data["strategy"], data["states"], data["main_ancestors"], data["integration"]) if op == "complete" else
                      (merge_errors if op == "merge" else publish_errors)(data["story"], data["observation"]))
            result = {"ok": not errors, "errors": errors}
        print(json.dumps(result))
        return 1 if result.get("ok") is False else 0
    except (ValueError, KeyError, TypeError, OSError) as exc:
        print(json.dumps({"ok": False, "errors": [str(exc)]}))
        return 1


if __name__ == "__main__":
    raise SystemExit(main())
