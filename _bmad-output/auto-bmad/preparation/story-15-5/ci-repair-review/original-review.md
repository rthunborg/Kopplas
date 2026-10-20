PASS — no consequential defects found in the nine-path CI repair delta `9487c0d9 → 2674b3f7`.

- Read the complete 41,327-byte input; SHA256 matches `a899b8b5…c27978b`.
- Projection validates pinned wrapper source and exact argv/entries, preserves unrelated workflow content and the original inverse hash, and includes meaningful negative assertions.
- Literal create/rotate/revoke declarations preserve action binding and request-time authorization, attestation, CAS and transaction behavior.
- Workflow, runtime wrapper and enrollment checker are unchanged. All 23 Suggested Review Order stops resolve correctly.
- Evidence wording preserves the failed checkpoint and pending native qualification.

Source review only: I did not execute tests or independently establish runtime acceptance. Fresh exact-head CI remains required.