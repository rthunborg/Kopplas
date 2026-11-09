"""Resolve and verify the project-owned, read-only story TEA evidence route."""

import argparse
import hashlib
import json
import os
from pathlib import Path
import re
import secrets
import stat
import subprocess
import sys


EVIDENCE = "_bmad-output/test-artifacts"
FILENAMES = {"atdd": "atdd-checklist.md", "automate": "automation-summary.md"}
PLANNER = ".agents/skills/auto-bmad/scripts/story_plan.py"
PRESENTATION = ("_bmad-output/specs/spec-design-35-7", "35-7", "spec-design-35-7-35-7")
COMMIT = re.compile(r"[0-9a-f]{40}(?:[0-9a-f]{24})?")
SHA256 = re.compile(r"[0-9a-f]{64}")
STORY_KEY = re.compile(r"[A-Za-z0-9][A-Za-z0-9_-]{0,127}")
DEVICE = re.compile(r"(?i:CON|PRN|AUX|NUL|COM[1-9¹²³]|LPT[1-9¹²³])")
TEST_FILE = re.compile(r"tests/(?:unit/.+\.test\.ts|integration/.+\.(?:test|spec)\.ts|e2e/.+\.e2e\.spec\.ts)")


def require(condition, message):
    if not condition:
        raise ValueError(message)


def digest(data):
    return hashlib.sha256(data).hexdigest()


def canonical(data):
    return json.dumps(data, sort_keys=True, separators=(",", ":"))


def unique_object(pairs):
    result = dict(pairs)
    require(len(result) == len(pairs), "Duplicate JSON key")
    return result


def read_json(data):
    result = json.loads(data, object_pairs_hook=unique_object)
    require(isinstance(result, dict), "Expected a JSON object")
    return result


def pinned_json(path, expected_hash):
    data = path.read_bytes()
    require(digest(data) == expected_hash, "Pinned JSON SHA-256 mismatch")
    return read_json(data)


def relative_path(value, *, prefix=False):
    require(isinstance(value, str) and value, "Missing relative path")
    parts = (value[:-1] if prefix and value.endswith("/") else value).split("/")
    for part in parts:
        require(part and not part.endswith((".", " ")) and part.casefold() != ".git"
                and not re.search(r'[\\:*?"<>|\x00-\x1f]', part)
                and not DEVICE.fullmatch(part.split(".")[0]),
                "Unsafe repository-relative path")
    return value


def checked_path(root, relative):
    """Reject aliases through symlinks, junctions and other Windows reparse points."""
    path = root
    for part in relative_path(relative).split("/"):
        path /= part
        try:
            info = path.lstat()
        except FileNotFoundError:
            continue
        require(not stat.S_ISLNK(info.st_mode)
                and not getattr(info, "st_file_attributes", 0) & stat.FILE_ATTRIBUTE_REPARSE_POINT,
                "Symlink or reparse point in repository path")
    return path


def regular_file(path):
    info = path.lstat()
    require(stat.S_ISREG(info.st_mode) and info.st_nlink == 1, "Expected a regular unlinked file")
    return path.read_bytes()


def run(argv, *, data=None, cwd=None, env=None):
    result = subprocess.run(argv, input=data, cwd=cwd, env=env, capture_output=True, timeout=60)
    require(result.returncode == 0, "Read-only command refused: " + " ".join(argv[-2:]))
    return result.stdout


def git(root, *args):
    env = {key: value for key, value in os.environ.items() if not key.upper().startswith("GIT_")}
    return run(["git", "--no-optional-locks", "--no-replace-objects", "-c", "core.fsmonitor=false", *args],
               cwd=root, env=env)


def git_text(root, *args):
    return git(root, *args).decode("utf-8").rstrip("\r\n")


def match(value, pattern, label):
    require(isinstance(value, str) and pattern.fullmatch(value), f"Invalid {label}")
    return value


def blob(root, revision, path):
    return git(root, "show", revision + ":" + path).replace(b"\r\n", b"\n")


def run_planner(root, route, *args):
    revision = match(route["planner_revision"], COMMIT, "trusted planner revision")
    planner = blob(root, revision, PLANNER)
    require(digest(planner) == route["planner_sha256"], "Trusted planner SHA-256 mismatch")
    # Only the pinned installed planner bytes run. Candidate checkout paths are inputs to its
    # read-only CLI, and isolated Python cannot load modules from that checkout.
    result = read_json(run([sys.executable, "-I", "-B", "-", *args], data=planner, cwd=root))
    require(not result.get("hard_stop") and not result.get("warnings"),
            "Planner requires story identity reconciliation")
    return result


def check_source(root, route, source, story_key, spec):
    path = checked_path(root, spec)
    require(path.is_file(), "Approved spec is missing")
    if source["mode"] == "stories":
        folder = checked_path(root, source["spec_folder"])
        checked_path(root, f"{source['spec_folder']}/stories")
        source_paths = [f"{source['spec_folder']}/{name}" for name in ("SPEC.md", "stories.yaml")]
        for name in source_paths:
            regular_file(checked_path(root, name))
        result = run_planner(root, route, f"--resolve={source['story_id']}", "--spec-folder", str(folder))
        require(result.get("story_id") == source["story_id"], "Canonical story ID mismatch")
        found = result.get("story_file")
    else:
        require(source["mode"] == "sprint", "Unsupported story source")
        sprint = checked_path(root, source["sprint_status"])
        impl = checked_path(root, source["impl_dir"])
        regular_file(sprint)
        source_paths = [source["sprint_status"]]
        result = run_planner(root, route, f"--resolve={source['story_ref']}", "--sprint-status", str(sprint))
        require(result.get("story_key") == story_key, "Canonical story key mismatch")
        result = run_planner(root, route, "--find-spec", "--story-key", story_key,
                             "--impl-dir", str(impl), "--sprint-status", str(sprint))
        require(result.get("artifact_format") != "legacy-story", "Legacy story retains its pinned route")
        found = result.get("spec_path")
    require(result.get("story_key") == story_key, "Canonical story key mismatch")
    require(found and Path(found) == path, "Canonical story spec mismatch")
    return result, {name: digest(regular_file(checked_path(root, name)).replace(b"\r\n", b"\n"))
                    for name in source_paths}


def parallel_source(root, route, args):
    require(args.assignment is not None, "Native schema-2 assignment receipt required")
    assignment = pinned_json(args.assignment, route["assignment_sha256"])
    require(assignment.get("ok") is True and type(assignment.get("schema_version")) is int
            and assignment["schema_version"] == 2 and assignment.get("story_source") == "stories"
            and assignment.get("publication_strategy") == "story-pr" and assignment.get("base_branch") == "main"
            and assignment.get("state") in {"claimed", "running"},
            "Expected an active native schema-2 stories/story-PR assignment")
    for field in ("run_id", "owner", "worker", "generation", "branch"):
        require(assignment[field] == route[field], f"Native assignment {field} mismatch")
    require(type(assignment["generation"]) is int and assignment["generation"] > 0,
            "Invalid native assignment generation")
    require(Path(assignment["worktree"]) == root, "Native assignment worktree mismatch")
    story, source = assignment["story"], assignment["source"]
    require(story.get("approved") is True and story["id"] == source["story_key"] == route["story_key"]
            and story["source"] == source, "Native assignment story or source mismatch")
    base = match(assignment["base_sha"], COMMIT, "native base commit")
    git(root, "merge-base", "--is-ancestor", base, args.revision)
    spec = story["spec_path"]
    checked_path(root, spec)
    require(digest(blob(root, base, spec)) == story["spec_revision"], "Approved native spec pin mismatch")
    folder = source["spec_folder"]
    source_paths = {f"{folder}/SPEC.md", f"{folder}/stories.yaml"}
    pins = source["files"]
    require(len(pins) == 2 and {pin["path"] for pin in pins} == source_paths, "Invalid native source pins")
    resolved, source_hashes = check_source(root, route, {**source, "mode": "stories"}, story["id"], spec)
    require(source_hashes == {pin["path"]: pin["sha256"] for pin in pins}, "Native source pin mismatch")
    for field in ("position", "spec_checkpoint", "done_checkpoint"):
        require(resolved[field] == source[field], f"Native source {field} mismatch")
    require(resolved["epic_story_count"] == 1, "Schema-2 source must contain exactly one story")
    return spec, story["write_paths"], (folder, source["story_id"], story["id"]), source_hashes


def output_path(story_key, paths, phase, identity):
    directory = f"{EVIDENCE}/" + ("story-35-7" if identity == PRESENTATION else story_key)
    allowed = {directory + "/", *(f"{directory}/{name}" for name in FILENAMES.values())}
    require(isinstance(paths, list) and paths, "Approved write paths required")
    for value in paths:
        token = relative_path(value, prefix=True)
        key = token.casefold()
        touches_evidence = (key.rstrip("/") == EVIDENCE or key.startswith(EVIDENCE + "/")
                            or EVIDENCE.startswith(key if key.endswith("/") else key + "/"))
        require(not touches_evidence or token in allowed,
                "Approved write scope overlaps shared or another story's TEA evidence")
    output = f"{directory}/{FILENAMES[phase]}"
    require(directory + "/" in paths or output in paths, "Phase output is outside approved write paths")
    return output


def admitted_test_paths(root, route, write_paths):
    by_phase = route["phase_test_paths"]
    require(isinstance(by_phase, dict) and set(by_phase) == set(route["phases"]),
            "Exact test paths required for each selected phase")
    for paths in by_phase.values():
        require(isinstance(paths, list), "Phase test paths must be a list")
        seen = set()
        for token in paths:
            path = relative_path(token)
            require(TEST_FILE.fullmatch(path) and path.casefold() not in seen,
                    "Expected a unique exact unit, integration or e2e test file")
            seen.add(path.casefold())
            require(any(path == owned or (owned.endswith("/") and path.startswith(owned))
                        for owned in write_paths), "Phase test file is outside approved write paths")
            checked_path(root, path)
    return by_phase


def phase_binding(args, route):
    require(type(route.get("schema_version")) is int and route["schema_version"] == 1,
            "Expected an explicitly admitted project TEA route")
    require(isinstance(route.get("phases"), list) and route["phases"]
            and all(isinstance(p, str) and p in FILENAMES for p in route["phases"])
            and args.phase in route["phases"], "Phase was not selected for this route")
    story_key = match(route["story_key"], STORY_KEY, "canonical story key")
    require(not DEVICE.fullmatch(story_key), "Unsafe canonical story key")
    root = args.checkout.resolve(strict=True)
    require(args.checkout == root == Path(route["checkout"])
            and Path(git_text(root, "rev-parse", "--show-toplevel")) == root,
            "Checkout must be the exact admitted Git worktree root")
    branch = git_text(root, "symbolic-ref", "--short", "HEAD")
    require(branch == route["branch"], "Checkout branch mismatch")
    match(args.revision, COMMIT, "expected phase revision")
    require(git_text(root, "rev-parse", "--verify", "HEAD") == args.revision, "Phase revision is stale")
    if route["route"] == "schema-2":
        spec, paths, identity, source_hashes = parallel_source(root, route, args)
    else:
        require(route["route"] == "sequential" and args.assignment is None,
                "Unsupported project route or unexpected assignment")
        spec, paths, identity = route["spec_path"], route["write_paths"], None
        _, source_hashes = check_source(root, route, route["source"], story_key, spec)
    spec_bytes = regular_file(checked_path(root, spec)).replace(b"\r\n", b"\n")
    require(spec_bytes == blob(root, args.revision, spec), "Story spec does not match the phase revision")
    output = output_path(story_key, paths, args.phase, identity)
    test_paths = admitted_test_paths(root, route, paths)[args.phase]
    git_dir = git_text(root, "rev-parse", "--absolute-git-dir")
    binding = {"story_key": story_key, "spec_path": spec, "spec_sha256": digest(spec_bytes),
               "phase": args.phase, "revision": args.revision, "branch": branch,
               "checkout_id": digest(canonical([str(root), git_dir]).encode()),
               "output_path": output, "route_sha256": args.route_sha256,
               "source_sha256": digest(canonical(source_hashes).encode()),
               "phase_test_paths": test_paths}
    return root, binding


def inspect_phase(args):
    route = pinned_json(args.route, args.route_sha256)
    root, binding = phase_binding(args, route)
    output = checked_path(root, binding["output_path"])
    status_args = ("status", "--porcelain=v1", "-z", "--untracked-files=all", "--no-renames")
    status = git(root, *status_args)
    evidence_status = git(root, *status_args, "--ignored=matching", "--", EVIDENCE)
    if args.operation == "resolve":
        require(args.receipt is None, "Resolve takes no prior receipt")
        require(not output.exists() and not evidence_status, "Evidence already exists or TEA output scope is dirty")
        require(not status, "Phase baseline requires a clean checkout")
        nonce = secrets.token_hex(16)
    else:
        require(args.receipt is not None, "Verification requires the original pre-phase receipt")
        pre = read_json(args.receipt.read_bytes())
        nonce = match(pre.get("nonce"), re.compile(r"[0-9a-f]{32}"), "pre-phase nonce")
    receipt = {**binding, "nonce": nonce}
    header = "<!-- kopplas-story-tea-v1 " + canonical(receipt).replace(">", "\\u003e") + " -->"
    result = {"ok": True, **receipt, "output_absolute": str(output), "evidence_header": header}
    if args.operation == "verify":
        require(pre == result, "Pre-phase receipt does not bind this checkout, phase or revision")
        artifact_entry = b"?? " + binding["output_path"].encode()
        require(evidence_status == artifact_entry + b"\x00",
                "Expected only the new, unstaged story phase artifact in the TEA output scope")
        test_paths = {path.encode(): path for path in binding["phase_test_paths"]}
        test_hashes = {}
        for entry in status.split(b"\x00"):
            if entry and entry != artifact_entry:
                require(entry[:3] in {b"?? ", b" M "} and entry[3:] in test_paths,
                        "Checkout changed outside the exact unstaged phase files")
                path = test_paths[entry[3:]]
                test_hashes[path] = digest(regular_file(checked_path(root, path)))
        data = regular_file(output)
        first_line, separator, body = data.decode("utf-8").partition("\n")
        require(first_line.rstrip("\r") == header and separator and body.strip(),
                "Phase evidence identity mismatch or empty evidence")
        result["artifact_sha256"] = digest(data)
        result["changed_test_sha256"] = test_hashes
    return result


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("operation", choices=("resolve", "verify"))
    parser.add_argument("--route", required=True, type=Path)
    parser.add_argument("--route-sha256", required=True)
    parser.add_argument("--checkout", required=True, type=Path)
    parser.add_argument("--phase", choices=FILENAMES, required=True)
    parser.add_argument("--revision", required=True)
    parser.add_argument("--assignment", type=Path)
    parser.add_argument("--receipt", type=Path)
    try:
        result = inspect_phase(parser.parse_args())
        print(canonical(result))
        return 0
    except (ValueError, OSError, TypeError, KeyError, AttributeError, subprocess.SubprocessError) as error:
        print(canonical({"ok": False, "error": str(error)}))
        return 1


if __name__ == "__main__":
    sys.exit(main())
