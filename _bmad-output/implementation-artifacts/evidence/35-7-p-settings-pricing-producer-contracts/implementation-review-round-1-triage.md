# Implementation review — Round 1 of 3

Reviewed fixed commit `cad737c4399bb453ad3eb624911f3ce9218433c5` against original baseline `ce526a0ef58c6d54dc80dcad4c8ae4985ef5f657`. Three independent context-free Sol High layers completed. The full 41-source-file implementation, including new migration/recovery/attempt/tests, was included. Source author was stopped.

## R1-1: Refreshed props silently rebind an old draft to a newer expected revision.

Triage: **patch; high**. Reported by blind-hunter, edge-case-hunter.

Admin A edits revision R1; admin B changes the row to R2. A stale rejection refresh or neighboring pricing editor success refresh replaces the revision prop without replacing/reviewing the old draft. A deliberate next submit carries stale field values and R2, so SQL legitimately accepts and overwrites B.

Downstream check: SQL target revision comparison remains enforced but cannot detect replacement of the draft's original revision with R2. Company echo state, controlled terms draft, and selected-ID keyed uncontrolled pricing inputs retain old fields.

Fix: Bind draft baseline ID/revision to the actual displayed/selected values, retain original expected facts through unrelated refreshes, show separately established current facts after stale rejection, and require explicit review/adoption before a fresh draft can use newer revision. Never clear or replace pending/unknown immutable attempts. Cover company/terms/pricing and neighboring editor refresh.

Locations: `src/components/settings/CompanySettingsForm.tsx:55`, `src/components/settings/QuoteTermsEditor.tsx:63`, `src/components/pricing/WorkRolesEditor.tsx:39`, `src/components/pricing/ArticlesEditor.tsx:40`.

## R1-2: Saved canonical terms with surrounding whitespace stay dirty and block approval.

Triage: **patch; medium**. Reported by blind-hunter.

Draft 'Reviewed terms\n' saves canonical trimmed wording; raw draft inequality against current saved text keeps dirty=true and approval disabled on every repeat save.

Downstream check: Parsers and command validators both trim terms. SQL approval exact canonical text/revision/current unapproved guard is correct; this is client dirty-state mismatch, not an approval bypass.

Fix: Use the existing canonical trim semantics for reviewed saved equivalence or reconcile only the matching committed draft after a successful current read; preserve genuinely unsaved edits and exact current unapproved approval requirements. Add meaningful save/approve whitespace regression.

Locations: `src/components/settings/QuoteTermsEditor.tsx:51`, `src/components/settings/QuoteTermsEditor.tsx:52`, `src/components/settings/QuoteTermsEditor.tsx:104`.

## R1-3: Failed pricing rereads are displayed as confirmed committed-target deletion.

Triage: **patch; medium**. Reported by blind-hunter, edge-case-hunter, verification-gap.

Committed/reconciled pricing operation refreshes; domain read fails and returns empty arrays with an error. A new readToken alone makes hasCurrentRead true; editor says existing target is gone.

Downstream check: Generic page read alert exists but does not suppress editor's contradictory deletion/current-state claim. Settings forms already check readError; pricing editors receive no read-error state.

Fix: Carry successful domain-read status to the pricing editors, gate presence/absence/revision claims and mutation expected facts on actual successful authoritative reads, and show unavailable current facts on error. Cover active and archived reads and both editors with an owned regression.

Locations: `src/app/(app)/settings/pricing/page.tsx:43`, `src/app/(app)/settings/pricing/page.tsx:77`, `src/components/pricing/WorkRolesEditor.tsx:99`, `src/components/pricing/ArticlesEditor.tsx:100`, `src/components/settings/CompanySettingsForm.tsx:223`.

## R1-4: Authority-race requests are lazy RPC builders and never start before lock observation.

Triage: **patch; high**. Reported by verification-gap.

Four company.save/work_role.update x disable/re_role tests assign writer=call(op), then wait(1), and revoker=manage(...), then wait(2). Supabase/PostgREST builders execute on .then/await, so lock barrier cannot observe either request before finally consumes them.

Downstream check: Authenticated fixture observer forwards RPC builders unchanged; no eager call wrapper. Other Promise.all/then paths consume builders normally.

Fix: Start real executing promises before waiting for each blocker, retain actual lock barrier and current-authority/audit/receipt assertions, and make cleanup settle in-flight requests deterministically without serializing away the race. Required actual CI execution remains outstanding.

Locations: `tests/integration/commands/settings-pricing-operation-contract.int.test.ts:347`, `tests/integration/commands/settings-pricing-operation-contract.int.test.ts:357`.

No source/runtime/readiness PASS is earned. Required CI, browser captures and authenticated visual acceptance remain unearned. The six pending allocation paths remain untouched and forbidden. The original baseline and canonical source bytes remain unchanged. Two pre-existing calendar failures were reproduced on a clean baseline; that is provenance, not a waiver of candidate checks.

The same context-retaining Sol High author will receive all four patch findings as one batch. No new business decision or normative contract change is needed. Reviews are capped at three completed broad rounds; allocation-only reviews do not count.
