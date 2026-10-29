---
title: "Design 35.2 — approved single-story execution adapter"
---

# Approved 35.2 execution adapter

This folder adapts exactly one approved canonical story to installed Auto-BMAD stories mode. It is not a replacement specification or a new approval. Design-first execution priority is list order: the sole admitted entry is `35-2`, with `done_checkpoint: true`; no other E35 story is enrolled. Run only `/auto-bmad --spec C:/DEV/K35-implementation/_bmad-output/specs/spec-design-35-2 --story 35-2` after adapter review and normal plan phase.

Canonical specification: `_bmad-output/implementation-artifacts/spec-35-2-tokens-font-and-real-login.md`. Canonical test contract: `_bmad-output/test-artifacts/dt-2026-10-23-test-design/slice-35-2.md`. Their exact approved SHA-256 values, approval message identity, candidate and one-to-one execution/tracking mapping are in `source-binding.json`. Historical preparation-only status in the originals stays unchanged; the actual subsequent human approval is `docs/quality/story-35-2-approved-admission-2026-10-28.json`.

The adapter story is deliberately `draft`. Build-auto owns its status and must finish planning before declaring ready-for-dev. Scope/applicability, AC/state/test IDs and release obligations come unchanged from canonical sources. Read `docs/quality/story-35-2-reference-and-inheritance-2026-10-28.md` for bounded reference identities and semantic inheritance.

Official Inter v4.1 roman/italic/license hashes are those explicitly selected in admission. Supplied v1 assets remain unchanged. Product write allocation is root layout, globals, actual login route, new local font assets and license only. Shared primitive edits need exact allocation before editing. Preserve current auth/session/role authority; any actual sensitive change or uncertainty routes to Sol High before deciding. No merge, deployment, database push, global tracking regeneration, whole-E35 execution or additional story. Rasmus's initial visual acceptance follows actual implementation rendering; release_ready remains false.
