#!/usr/bin/env python3
"""Validate truthful development/release disposition; never grants release approval."""
import argparse
import json
from pathlib import Path

POLICY = "docs/process/development-completion-policy.md"


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def validate(record):
    errors = []
    if not isinstance(record, dict):
        return ["delivery record must be an object"]
    if not nonempty(record.get("evidence_revision")):
        errors.append("evidence_revision is required; reviewer must verify provenance")
    if record.get("policy_version") != "2026-10-19" or not nonempty(record.get("contract_reconciliation")):
        errors.append("current policy_version and contract_reconciliation are required, including pinned legacy gates on resume")
    checks = record.get("development_checks")
    if not isinstance(checks, list) or not checks:
        errors.append("development_checks must contain applicable executed checks")
    else:
        for check in checks:
            if not isinstance(check, dict) or not all(nonempty(check.get(k)) for k in ("name", "evidence")) or check.get("status") != "passed":
                errors.append("each development check requires name, passed status and actual evidence")
    review = record.get("independent_review")
    if not isinstance(review, dict) or review.get("status") != "passed" or not nonempty(review.get("evidence")):
        errors.append("independent review must pass with evidence")
    release = record.get("deferred_release_validation")
    if not isinstance(release, list):
        errors.append("deferred_release_validation must be a list (empty if no applicable checks)")
        release = []
    for check in release:
        if not isinstance(check, dict) or check.get("status") not in ("deferred", "passed") or not all(nonempty(check.get(k)) for k in ("item", "owner", "evidence", "next_action")):
            errors.append("release items require item, owner, deferred/passed status, evidence and next_action")
    if not isinstance(record.get("release_ready"), bool):
        errors.append("release_ready must be boolean")
    elif record["release_ready"] and (not nonempty(record.get("release_approval")) or any(not isinstance(c, dict) or c.get("status") != "passed" for c in release)):
        errors.append("release ready requires all recorded release checks passed and separate approval evidence")
    return errors


def load_record(path):
    try:
        record = json.loads(Path(path).read_text(encoding="utf-8"))
    except (OSError, ValueError) as exc:
        return [f"cannot read delivery record {path}: {exc}"]
    return validate(record)


def require_for_transition(target, key, kind="state"):
    """Policy-bearing repos fail closed; standalone/upstream fixtures remain portable."""
    target = Path(target).resolve()
    root = next((p for p in target.parents if (p / POLICY).is_file()), None)
    if root is None:
        return []
    if kind == "state":
        # Supported state layout: <output>/auto-bmad/state/<key>.yaml.
        base = next((p for p in target.parents if p.name == "auto-bmad"), target.parent.parent)
    else:
        # Sprint status lives in <output>/implementation-artifacts/.
        base = target.parent.parent / "auto-bmad"
    return load_record(base / "delivery" / f"{key}.json")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("record", type=Path)
    args = parser.parse_args()
    errors = load_record(args.record)
    print(json.dumps({"ok": not errors, "development_complete": not errors,
                      "errors": errors, "approval_granted": False}))
    return 1 if errors else 0


if __name__ == "__main__":
    raise SystemExit(main())
