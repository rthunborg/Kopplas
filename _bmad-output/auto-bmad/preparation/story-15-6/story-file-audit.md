# Story-file audit — 15.6 planning

| Criterion | Status | Fix Applied |
|---|---|---|
| ACs preserved verbatim | ✓ | Single source AC sketch copied verbatim; exact text inclusion checked programmatically. Given/When/Then elaborations retained separately. |
| Design gate criteria | ✓ | Source has no four separate criteria; explicit absence callout beside AC sketch. Current canonical design/UX retained. |
| Task sequencing | ✓ | DTO/domain → checked SQL projection → server read/action → composition → enrollment → integrity/flow tests → evidence. |
| No invented requirements | ✓ | Tasks map AC1–7; completion evidence explicitly supporting infrastructure. Routine default decisions recorded. Sensitive source assessment and focused pending-jobs amendment integrated from High. Inline report entry verified by source; no unsupported URL prefill. |
| File impact list | ✓ | Tasks identify all proposed new/modified source/test/schema paths. No dependencies, env/config or existing broad DTO modifications planned. Migration exact directory/stem is pinned; CLI assigns timestamp after Root inventory/allocation. |
| Doc references | ✓ | Root/context/Phase B epic/architecture/UX plus current canonical DESIGN/EXPERIENCE and policies. Superseded old nextjs-app design reference explicitly explained. |
| Test gate | ✓ | Applicable static/build, focused behavior, required full executed integration/RLS and recovery integrity, essential production browser smoke; exhaustive manual/visual work deferred per owner policy. |

All checks pass, story ready for dev at the planning HALT; High assessment integrated. Independent Root-owned validation and allocation still precede build. This audit is planning evidence only; no implementation tests executed and no sprint status changed.
