# Story 15.1 visual capture framing addendum — 2026-10-14

Status: preparation only. Ordinary visual evidence review: Sol 6.1 Low. No test, application, fixture, approved spec, runtime, CI or resource change is authorized by this document. Story remains blocked; broad review remains 0/3.

## Actual requirements and adapter applicability

- `AGENTS.md:101` requires Playwright's configured production server; `AGENTS.md:105` requires ADR-B009 connected 360×640 failure/retry and server-confirmed persistence. `playwright.config.ts:54,62` configures Next build followed by Next start.
- Approved `spec-15-1-the-five-scheduling-views-2.md:80,87,94` requires five live projections, booking context, phone agenda/summary, long/multi-assignee labels and connected phone/editor failure/retry usability. Its `:132,137` verification uses configured production-server Playwright and all eight ACs; `:148` retains blocked status and outstanding visual/native gates.
- `.agents/skills/bmad-build-auto/step-03-implement.md:36,40` requires spec verification and executed passing matrix coverage; an existing but unexecuted/skipped test supplies none. `_bmad/custom/bmad-build-auto.toml:16` preserves blocked/incomplete exits.
- The global `C:/Users/Rasmus/.agents/skills/visual-validation/SKILL.md` describes a Figma-reference comparison adapter, including `.Codex/scripts/visual-validate.sh`, `.Codex/scripts/sprint-status-gate.sh`, `project-context.md` screen mapping and `nextjs-app/docs/design/references/screens/`. Those four paths and `nextjs-app/docs/design/DESIGN.md` are absent in this owned checkout. No corresponding visual/Figma/screenshot adapter reference was found in the actual Build Auto implementation steps/scripts or project customization searched. This is concrete adapter absence, not a waiver of visual review or an invented comparison pass.
- No approved Figma screen ID or reference PNG is available. No reference similarity percentage, Figma match or legacy-parity claim can be made. The owner disposition at `docs/decisions/epic-15-scheduling-ux-disposition-2026-10-09.md` removes Lovable observation and adopts work-role Team grouping including no-role; it does not waive other evidence.

The actual screenshot contract currently has five desktop week targets at 1440×1000 and six phone targets at 360×640. `tests/e2e/scheduling-views.atdd.e2e.spec.ts:16-20` uses native viewport PNGs (`fullPage: false`); desktop attachment is at `:96`, phone attachments at `:500,505,510,520,524,532`. These are implementation evidence targets, not approved design-reference images.

## Why minimum framing is needed

The ten real desktop PNGs from native run 38562420502 were mapped through the HTML report's embedded ZIP metadata and viewed directly; each is 1440×1000. Both attempts show consistent structure with differing fixture labels. Schema and Min kalender capture only midnight–05:30, leaving their asserted 09:00 booking outside the image. Resurser captures the first midnight slot row rather than booking blocks. Those crops do not meaningfully show the central booking presentation required by the spec. Team already shows booking cards; Beläggning already shows numerical capacity and drilldown cells.

Team cards extend below the viewport with long fixture labels; Resurser/Beläggning later columns extend beyond the right capture boundary. Static crops establish neither inaccessible scrolling nor a production defect. Do not convert these observations into redesign requirements or adjust fixtures/filters to improve appearances. A single fixed viewport cannot show every long card, toolbar and day simultaneously.

## Smallest eligible candidate — no code authored

After independent preservation validation and inspection of the new actual CI results, the candidate is confined to the week attachment branch currently at `tests/e2e/scheduling-views.atdd.e2e.spec.ts:96`:

```typescript
if (mode === "week") {
  if (view === "Schema" || view === "Resurser" || view === "Min kalender") {
    await h.block(h.ids.role).scrollIntoViewIfNeeded();
  }
  // Existing attachVisual call and its five-name mapping remain verbatim.
}
```

`tests/e2e/support/scheduling-views-atdd.ts:44` already exposes the visible first matching booking locator. AC1 `:91-94` already checks the expected authorised booking IDs, including `h.ids.role`, in these projections before `:96`; the fixture's role booking is 09:00–10:00 (`support/scheduling-views-atdd.ts:61`). Use the existing native Playwright locator scroll API; no DOM style rewrite, synthetic image, playback or document execution. Scroll does not open an editor, persist a change or add authority.

Keep Team and Beläggning capture positions unchanged: they already expose their core projection evidence, and moving to a taller Team card does not establish whole-card usability. Keep all six phone capture positions unchanged until their actual PNGs are available and inspected. The failure screenshot already scrolls the real retry control at `:519`; the long-label screenshot already scrolls the role block at `:531`. No speculative phone correction is justified before pixels exist.

Preserve viewports, eleven names/count, cases, native assertions, screenshot helper, fixtures/SQL, authentication, data/filters, permissions, payload capture scope, timeout/retry configuration and blocked status. Preserve all later editor focus/cancel/readback assertions. Any failure produced by ordinary scroll remains a failure; do not mask it. This preparation supplies no authorization to change sensitive capture or fixture behavior.

## Preservation and remaining evidence

Read-only baseline verified: scheduling E2E source SHA256 `8563d81330b0f2cd79b9e86ec5888c1c96866bfdaff48b8af484acf3b4852e66`, 40324 bytes; approved spec SHA256 `d5a492a1546c19d777d8bff3d7037686e60a577565cac67281bff764f427bc22`, 84649 bytes; raw tagged intent-contract SHA256 `035ee9683e8b3e6e0420204a3ddfa8d81b0dcb6a47aa12e638673859d60cc234`. Baseline revision `ddd188f63e7b84c59e8f921933140ca2a2613551`, status blocked and kernel are unchanged.

Old run screenshots are preliminary only. Run 38579679091 targets exact head `e448f856b1f1ea337b2c91ed6cfc624995272521`; its actual outcome and all eleven fresh PNGs still require inspection. Any later approved framing change requires its own fresh exact-head capture evidence. Include actual phone failure/retry and long-label pixels; do not infer a phone pass from source or desktop pictures. No manual assistive-technology, daylight, one-hand usability or representative p95 performance certification is supplied. No runtime test was run for this addendum.
