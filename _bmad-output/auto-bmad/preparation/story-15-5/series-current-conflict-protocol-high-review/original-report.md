# Targeted current series protocol repair review

Verdict: NOTPASS_TARGETED_PROTOCOL_TEST_REGRESSION. One P2 finding blocks closure at cb65b06b8884938f2054821166e9fd7e4d5e4aa9 (parent537ad798a117464192d2a146d7573f1351848ad2; Root-bound tree98a19328cbd46528cfa12625a54d323834917853). No fourth broad review.

## P2 SERIES-PROTOCOL-01: active integration assertion still requires obsolete claims

Location: tests/integration/commands/booking-series.int.test.ts:802, active15.2-INT-REAL-011.

On a qualified stack, this case calls actual snapshotBookingSeries at801. The repaired SQL producer returns booking-conflicts-v4/stockholm-capacity-v2, which the real TypeScript guard admits. Line802 still expects booking-conflicts-v3/stockholm-capacity-v1 and fails before its per-job null/empty, digest and review-invalidation assertions. No downstream validator prevents that contradiction; this is an active real-stack test, not the skipped scaffolding.

Narrow correction: use the actual current protocol constants already used by REAL004, retaining all remaining REAL011 assertions and authorization/digest/rollback negatives. Refresh author review evidence/order. No production guard, historical migration, skip, timeout or broader source change is required. Other old literals at177/178 are inside test.skip and are excluded from this finding. This does not establish the original hosted first throw or backend cause.

## Other bounded checks

Both effective bodies reconstruct exactly: snapshot canonical2032B/de57810a4ef7fd45ef5d4c7b4b8f8aee322b145d8dae8c6e6fe35e62331ad974 and finalizer14472B/87cd4e1062df816bc060069404d25e71f3e7744188a2387fe89936b339a218bc. The finalizer includes the actual20261020180000 common booking_conflict_refresh_internal transformation exactly once. Full inverses permit only the two protocol literals, preserving tenant/actor/signature/review/digest/expiry/locking and accepted/resolved/reopened refresh behavior. The resolver's separate v3/v1 pair is unchanged.

Actual source-reachable states are snapshot22LF-only newlines and finalizer127CRLF/no loneLF after the newline-free refresh replacement. Both are admitted. No mixed-newline defect is reported. Only embedded references are canonicalized; actual raw prosrc is retained and postchecked after its two substitutions.

The single DO qualifies both complete bodies before DDL and statically checks original OIDs, every non-prosrc pg_proc JSON attribute and exact substituted raw source afterward. PostgreSQL compilation/application, metadata/ACL preservation and atomic rollback remain UNEXECUTED, not runtime-proven.

All116 historical migration raw hashes are unchanged; total117. Exact four body hashes/computed blob IDs match Root-bound committed identities. The old29415B unit prefix is byte-identical (SHA256 da5a4ed9987caee817961245ee55c956a0683dcaf670ec15118a6e4521363ac6), retaining existing negative cases; three source controls are appended. REAL004's stronger claims checks do not cover old REAL011's expectation.

Independent focused pure run:42pass/0fail/0skip/cancel, exit0,1439.266ms. It does not execute live REAL011 or PostgreSQL. Author TS/lint/reader/SRO178 and initial39P2F/intermediate41P/final42P are separately attributed/nonadditive. Suggested Review Order checked; kernel5760/status/counter conservation remains Root/author-bound.

Local Supabase security guidance applied within explicit source-only constraints; no network/changelog/query/runtime action. Historical failed CI facts, hosted first throw/browser cause/custody UNKNOWN, required95, counter3 and normal acceptance0 remain. Only these review artifacts written; no source/Git/SQL/Spec/state/provider/resource effect.
