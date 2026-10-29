# High reconciliation of conflict refresh and R1-P04

Status: within existing approved presentation contract, conditional on the explicit-consent implementation and actual tests below. Author: Build Auto Sol High. This is critical-conflict assessment, not a new product review round, new authorization or completed verification.

## Correct the source attribution

An earlier coordinator message attributed “explicit refresh discards old edits” to approved Design Notes. That exact wording was an implementation comment, not approval evidence, and is not used as authority here. The actual authority is the combination of the immutable stale/retention requirement and the approved explicit Discard choice below. Ordinary refresh is not implicit consent to destroy a draft.

## Exact contract

- Canonical Lane A slice `slice-35-3.md:53` requires stale submission rejection, preservation of the draft and existing refresh/review recovery. Its `:55` requires Cancel to preserve URL/history, selection and input, with existing save/discard/cancel semantics.
- Operative adapter G03 at `stories/35-3-record-inputs-and-tables.md:148` explicitly says “Discard abandons suitable dirty input, never an unresolved mutation hint”; cross-document departure/reload uses beforeunload for remaining protected input. This permits an explicitly chosen abandonment, not silent loss.
- Frozen approved prerequisite `docs/quality/story-35-3-stale-authority-prerequisite-plan-2026-10-29.md:62` forbids silently advancing baseline under retained old edits; `:90` requires open/unsaved conflict explanation, checked current detail and explicit review before another save. It forbids automatic close/saved/replay/merge/baseline advancement, and preserves G01 independently.
- Written EXPERIENCE `:105` defines component-state draft protection and confirmation before abandonment, with no tab-close/device durability promise; `:106` requires stale explanation and preserved edits before that decision.

There is no source promise to retain input AFTER the user knowingly chooses the existing Discard operation. There is also no permission to substitute a refresh for consent, or to treat failed read/transition completion as fresh facts.

## Observed framework boundary

Installed Next version is 16.4.1. Independently read local primary sources: `node_modules/next/dist/client/components/router-reducer/fetch-server-response.js:135` converts non-Flight, non-success or missing-body responses to MPA navigation; `node_modules/next/dist/client/components/app-router.js:243` intentionally infinitely suspends during that navigation, keeping useTransition pending and using location.assign/replace. A genuine503/network failure can therefore leave the component-state lifetime. An empty fabricated Flight body was an invalid positive/no-new-props probe; it is retained as diagnostic failure, not passing evidence.

The allocation supplies no awaitable checked-read error contract. No Flight parser, network monkeypatch, new read action/endpoint, payload persistence, framework patch or excluded route edit is authorized or needed for the explicit-discard path.

## Required bounded implementation

1. Keep conflict draft and captured original baseline unchanged until a named decision. Opening refresh must show an explicit abandonment disclosure and Cancel/continue-editing choice. The affirmative choice must clearly mean **Discard this unsaved draft and load current details**; it is not a generic “refresh” button with hidden destruction.
2. Recheck known connectivity BEFORE abandonment/read dispatch. Known offline keeps the complete in-memory draft and old baseline, dispatches zero reads/writes and explains explicit retry. Cancel likewise preserves input, baseline, URL and history.
3. Never start this path during a pending/unknown own mutation; do not clear a customer-submission safety hint on discard or read. The existing unknown/remount fail-closed contract remains independent.
4. After explicit Discard, mark the old dirty input abandoned and protect fields from new edits until recovery settles or the document changes. Use the existing checked route refresh. The disclosure must state the draft is discarded and that failure may require the existing page/browser retry. Do not promise inline post-dispatch retention or a new recovery service.
5. Only a successfully delivered checked detail may establish new baseline facts, followed by user review and a separate explicit save. Client rerenders, failed reads, transition completion alone and edited controls are not baseline authority. If the old tree survives without fresh facts, show honest not-current/failure/retry state and do not enable a save as though review succeeded.
6. If Next selects full-document fallback after consent, old draft retention is intentionally no longer claimed: it was already explicitly abandoned. Preserve unknown hint safety through that lifetime. Framework/page/browser failure is not a save confirmation; retain its actual retry limits instead of inventing an inline error API.

This is the existing Discard capability applied before checked-read recovery, inside owned CustomerDialog/CustomerDetail. It changes no command, action-state, read model, route, API or persistence contract. It does not waive stale rejection or pre-consent input protection.

## Verification and triage disposition

Preserve the original R1-P04 claim and diagnostics. Amend only its over-strong post-consent retention expectation: the accepted patch requires pre-consent/known-offline preservation, explicit abandonment, honest supported retry limits and fresh checked baseline authority. It must not assert unavailable guarantees. R1-P03 still requires protection against newly entered values being reset; R1-P01/P02 still require dispatch-captured layout-lifecycle view generation and real browser traversal.

In existing allocated E2E prove Cancel and known-offline zero-dispatch/input/baseline preservation; explicit Discard followed by actual checked refresh/review and separately confirmed save; and a controlled genuine503/non-Flight failure path with truthful document/fallback observations, zero mutation/saved claim and no false new-baseline claim. Do not fabricate successful Flight bytes or weaken persistence/history assertions. Preserve failed attempts and label controlled states.

Targeted independent Sol High Round2 must inspect this decision, exact citations, implemented consent/lifecycle behavior and actual evidence. Until then it is a reasoned contract disposition, not a review PASS. All original pins/canonical bytes remain unchanged. Native exact-head CI, physical recovery-Storage, formal current-head images and authenticated owner initial visual acceptance remain pending.
