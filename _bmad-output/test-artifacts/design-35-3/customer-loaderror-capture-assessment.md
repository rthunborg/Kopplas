# Bounded High assessment: actual CustomerList load-error capture

Proposal only, not execution or resource admission. SolHigh assessment; independently qualify the concrete private adapter before arming. No product review round or permission/SQL mutation. Existing authoritative pattern is `tests/e2e/dashboard/server-read-proxy.mjs` and its existing production build/start integration at `tests/e2e/dashboard/playwright.ci.config.ts:29-38`.

## Smallest existing seam

Prefer the existing guarded loopback read proxy over any new ACL fault. It forwards to one configured local upstream, accepts only origin-form request paths (SSRF guard), and selects private filesystem plans by a syntactically checked decoded JWT subject (the proxy is not a cryptographic verifier). It has no HTTP plan-control API. A private plan with a fresh revision and `tables.customers=[{outcome:"error"}]` returns an actual PostgREST-shaped400 for only that synthetic fixture subject. The real production Next server then executes unchanged `readCustomerList` and renders the actual CustomerList loadError branch. This is different from fabricated Flight bytes, injected DOM or the synthetic503 document fallback evidence.

## Qualification and lifetime

- Root verifies the same guard-owned isolated upstream127.0.0.1:55421/DB55422/project identity and exact final candidate; no production/demo. No new dependency or product source/config/migration change.
- Root guard-Start existing proxy with verified Node executable, high configurable loopback port and ignored private control-root. Check native exit/ok and actual health; children never launch it. Guard-Stop when finished, preserving files/data/profile.
- The existing pattern builds and starts production Next with NEXT_PUBLIC_SUPABASE_URL pointing to this proxy and its original local anon key; public variables are compile-time, so do not merely switch a running direct build. Use the actual final Git head for that formal rebuild/capture and record this test-only proxy environment/upstream/provenance. Same committed source, real isolated backend.
- Use canonical setup -> capture -> teardown, a fresh exclusively owned synthetic fixture and managed CDP browser. Before arming, normal loaded customer list must render. Journal exact proxy arguments, fixture subject, plan revision/hash and expected armed state privately; never log keys/cookies/JWTs/passwords.
- Arm only that subject's customers-read plan, capture actual load-error at exact1440x900 and360x640 with fullPage:false. Prove no empty/no-match/saved claim and capture the real error branch, not the control document. Additional scrolled footer frames are separate exact viewport captures.
- In finally disarm only the operation's own still-matching private plan (preserve revision/history; do not overwrite foreign state), verify normal pass-through loaded list returns, then canonical fixture teardown. Report any uncertain/failed disarm; never credit success without proof. Counts/control plans remain private, no browser/public control endpoint.
- Conditional action-error/business mutation states remain unclaimed. Formal images require complete source/current-head/viewport/byte binding and authenticated owner acceptance. Existing preview images remain previews.

## Scope and risk

This reuses an existing per-subject test fault seam and changes no database grants or persistent schema. It avoids a global authenticated SELECT revocation and its cross-consumer/restore risks. No ACL/SQL mutation is approved or performed here. Independent High read-only review of the exact wrapper/control-lifetime plan, target verification and test metadata must precede execution; root owns runtime starts and all qualified formal replay. If the existing proxy cannot meet these bounds, return the concrete blocker rather than invent a new API or decoder.

## Exact existing CLI/config recipe for independent qualification

Use the root-verified absolute Node22 executable from its current guard Next admission (resolve the concrete path before admission; no PATH shim). Working directory is `C:/DEV/K35-records`. Existing script arguments are:

`tests/e2e/dashboard/server-read-proxy.mjs --upstream http://127.0.0.1:55421 --port 37921 --control-root C:/DEV/K35-records/tmp/private/story35-3/frontend-packet/customer-read-control`

37921 is the existing configurable high-port default, not a claim that it is free. Root checks availability and chooses/records another high loopback port if occupied; never adopts or stops a listener by port. Health is `http://127.0.0.1:<qualified-proxy-port>/auth/v1/health`, unarmed pass-through before any error plan. The actual CLI uses `listen(port,"127.0.0.1")`.

For the formal final-head build, copy only the already qualified synthetic runtime environment privately and override NEXT_PUBLIC_SUPABASE_URL to that exact proxy origin; retain its existing anon key, APP_URL3100 and server-only test material without printing values. The reviewed CI config performs both next build and next start with this proxy environment; do not reuse the prior direct-origin compiled build or launch Playwright webServer. Root guard manages proxy and Next separately; attach existing managed CDP only.

The arming JSON shape is `{ "revision": "<fresh operation GUID>", "tables": { "customers": [{ "outcome": "error" }] } }`, in `<control-root>/<actual canonical synthetic actor subject UUID>.json`. Placeholders are documentation only, never an executed plan. Before mutation, record the actual actor/revision/plan hash privately; plans are data with no public HTTP interface. Arm only after current fixture auth/pass-through proof. Disarm by a new recorded empty tables plan only while the active file still matches the operation's armed revision/hash; preserve prior bytes as evidence. Verify an actual loaded customer list after clearing, then canonical teardown. No frontend Save/Upload/business mutation occurs.

Existing primary test sources `tests/unit/e2e/server-read-proxy.test.ts` and `dashboard-ci-startup.test.ts` are available for independent read-only qualification; no new unit run or runtime is claimed by this assessment.

## Recorded existing-source identity

- `tests/e2e/dashboard/server-read-proxy.mjs`: raw SHA-256 `20147c434a5af5b7ee88c272d7034d5ff44ed6d2b9f3abbbfafce998d61029e8`; canonical Git blob `7eeedd8fcb5a69a9a03458bf683b752b056575ef`.
- `tests/e2e/dashboard/playwright.ci.config.ts`: raw SHA-256 `7e000255aad35be003f815eab7c5c5650d15e93658dde287a54e586a82bcebf8`; canonical Git blob `b0ea764c471b56444f71daa87449842b4d1909d0`.

## Independent configuration qualification and mandatory execution caveats

Root reports the independent packet High reviewer passed the bounded concrete configuration only; actual runtime/capture is still pending. Concrete root-verified executable is `C:/Users/Rasmus/AppData/Local/nvm/v22.23.2/node.exe` (Node22.23.2), same working directory/upstream described above. Exact private runtime inputs and independent receipt are `tmp/private/story35-3/frontend-packet/proxy-runtime-inputs.json` and `review.json`; root must use their final concrete values and latest guard ownership proof, not treat this prose as admission.

- The proxy subject decoder is NOT a crypto verifier. Arm only a fresh canonical fixture subject independently confirmed with normal authenticated Auth getUser/session against the owned upstream; never authorize arming from blind JWT decoding, a stale fixture file or a user-supplied subject. The upstream retains authentication/RLS enforcement. Do not log tokens or credentials.
- A customers plan applies to ALL HTTP methods matching that table path. The entire armed window is STRICTLY read-only: no UI Save/Upload or business command requests (including unrelated RPCs that the plan would forward). Capture only actual read states; no write/rollback claim can come from this proxy.
- Existing dashboard armReadPlan helper hardcodes a different control root and MUST NOT be reused silently. Write the exact independently reviewed data into the new private root, with exclusive operation ownership/journal and the qualified actor/revision.
- The existing proxy has no conditional clear helper. The private adapter must journal before arm/clear, compare BOTH armed revision and raw plan SHA-256 immediately before replacing it with an empty-tables plan, and preserve the original evidence. Only the operation's unchanged state may be cleared. A mismatch, transport uncertainty or failed pass-through/teardown is a STOP/reconciliation condition, not a blind restore or PASS.
- Formal build/start/captures happen after actual code HEAD is frozen. All formal PNGs use fullPage:false at exact1440x900/360x640; additional scrolled frames are separate captures. Synthetic503 document HTML remains separate fault evidence, never the actual CustomerList loadError frame.

No SQL/ACL helper was written or run. No proxy/runtime was launched by this assessment.
