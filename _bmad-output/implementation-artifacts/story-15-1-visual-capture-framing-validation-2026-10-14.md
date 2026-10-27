# Story 15.1 independent screenshot framing validation — 2026-10-14

Outcome: PASS for literal framing authoring only. This is static candidate validation, not runtime visual acceptance or story completion.

Files changed: This validation record only. Source, helper, spec, fixtures, state, Git, CI and resources were read-only. Another actor's existing state-file modification was left untouched.

Status: Independent Sol 6.1 Low ordinary screenshot-contract review. Route: visual_capture_framing_validation / independent-visual-framing-contract-validator / diverse_review / SolLow / codex / subagents / subagent. Actual AGENTS.md and global frontend-component and visual-validation skills were read. Historical generic nextjs-app and .Codex adapter paths do not establish an installed comparison gate; no approved Figma/reference exists in the supplied evidence. Production Next build/start in playwright.config.ts and ADR-B009 360x640 remain authoritative.

Binding: HEAD 1aa7c52b8e52400b3f49e52a8f15595a70311221. Current tests/e2e/scheduling-views.atdd.e2e.spec.ts is 57328 bytes, SHA256 3fd1906b73e5b26ec6f2f4c0d4bda4a0497d23829631a34784ddc3a10340db6a. Candidate addendum is 6649 bytes, SHA256 786d60a164425eca06fce817292458cbc7cdd1de00f6f4a54261a473b9964e39. Approved spec is 84649 bytes, SHA256 d5a492a1546c19d777d8bff3d7037686e60a577565cac67281bff764f427bc22; baseline ddd188f63e7b84c59e8f921933140ca2a2613551 and intent-contract 035ee9683e8b3e6e0420204a3ddfa8d81b0dcb6a47aa12e638673859d60cc234 remain the supplied approved binding. Helper is 18231 bytes, SHA256 84a90383c375ace822e0ef8519851185a80f043c126f2e2b05437ceff39a3082.

Eligible edit: Only expand the single week attachment statement at current source line 322 into a braced week branch, inserting the following immediately before its existing attachVisual invocation. Preserve that invocation and mapping verbatim, then close the week branch:

```typescript
if (view === "Schema" || view === "Resurser" || view === "Min kalender") {
  await h.block(h.ids.role).scrollIntoViewIfNeeded();
}
```

The old addendum's line 96 is stale after additive passive diagnostics; the actual unique source anchor is line 322. No relocation to AC2 or diagnostics is eligible. An in-memory substitution/inverse check found one original anchor and recovered the entire current source exactly. This is a preservation feasibility proof, not an authored patch. Final authoring must independently compare inverse bytes to the binding above.

The existing AC1 body at lines 307-321 seeds, signs in, selects 1440x1000, opens each current view/period/date and applies Person/Arbetsroll/Jobb/Kund filters before asserting booking IDs. The selected role booking is included in all three targeted week assertions; Min kalender specifically expects only that role booking. Helper line 44 selects :visible and first(); this does not assert DOM uniqueness. Current source explains uniqueness under this case: Schema renders each booking once at its beginning slot/day, hides the phone agenda at desktop width; Resources filters to one person, renders that person's slot/day, and the active seeded role booking is absent from the reassignment section; personal week hides its standalone agenda and renders Schema. The fixture supplies DATE 2026-10-12 and the role booking 09:00-10:00, with the filtered person/work-role/job/customer and the signed-in manager's own assignee. No fixture/filter changes are required.

Native scroll exposes the real booking within the existing vertical Schema/personal grid and horizontal Resources overflow. It does not hide overlays, rewrite styles, change data or replace the screenshot. It introduces no editor action; subsequent toolbar click/cancel/focus/SQL readback assertions remain intact. Any scroll failure must remain a failure. Static inspection supports the intended framing effect; fresh pixels must establish actual output. Crops alone do not prove inaccessible content or an application defect.

Team, Beläggning and all six phone captures remain unchanged. Preserve eleven attachment names/count, view cases, viewport values, fullPage:false helper, native assertions, AC2/native response-body behavior, passive sessions/diagnostics, source fixture, permissions and retries/timeouts. No legacy, Figma, similarity-gate or sensitive-capture pass is supplied.

Open questions: None blocking this narrowly bound authoring. Whether final crops show adequate content remains a fresh-image evidence question.

Deferred work: Implement only the eligible framing lines through the authorized author; validate final inverse preservation; obtain and inspect fresh exact-head production-run images and executed acceptance counts. Old run 38562420502 images are preliminary. Coordinator-reported current 38579679091 first seven passing cases and ten desktop images are incomplete evidence, not full 18 cases or eleven targets; no phone pass follows. Story remains blocked, broad review 0/3, visual/manual/performance gates open.

Blockers: None for literal framing authoring. Runtime/story acceptance remains incomplete. No browser or managed resource was launched and no runtime test was run.