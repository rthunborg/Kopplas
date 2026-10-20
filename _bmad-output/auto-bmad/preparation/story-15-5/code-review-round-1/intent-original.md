Read the entire 325,115-byte diff; its SHA-256 matches the supplied digest. No files changed or runtime checks executed.

1. **Defensible readings of intent**

   - **Authorized implementation:** the immutable contract describes a planning-stage hold, subsequently superseded within the exact accepted ownership and bootstrap allocations. App/schema/test/CI changes inside those allocations are consistent with the admitted execution phase.
   - **Connected subscription feature:** users manage their own capability through usable settings; anonymous clients obtain a newly generated snapshot of current materialized own bookings. “Live” describes regeneration on fetch, without an invented date horizon or recurrence re-expansion.
   - **Security and release conditions:** current self authority, revocation, minimal disclosure, independent limits and public isolation belong to the implemented feature. Hosted key provisioning, deployment-specific trusted-IP qualification and deferred provider/device matrices remain separate release prerequisites.

2. **Reading implemented by the diff**

   The diff implements that connected subscription feature with staged verification and hosted enablement. It contains the personal-calendar subscription link, profile entry, shared settings page, create/rotate/revoke and uncertain-result reconciliation, isolated public GET route, minimal SQL projection, signed lifecycle/fetch inputs, atomic audit and counters, sanitized Admin aggregates, and manifest/H4/ACL enrollment.

   The projection uses work-role title or `Bokning`, plus job/customer/location labels. This follows the recorded safe-title default rather than exposing booking descriptions. Tenant existence and exact active membership/current role union govern access; provisioning readiness is not introduced as an availability condition.

3. **Surface expectations versus implemented changes and test reach**

   | Expected surface | Source/test reach |
   |---|---|
   | Actual personal-calendar entry | Link is in `PersonalCalendarView`; browser cases start through Planering and exercise agenda, week and no-profile states. |
   | Profile entry and settings lifecycle | Profile link reaches the same page; browser bodies cover issuance, rotation/revocation, confirmation, clipboard fallback, revisit, lost response and phone interaction. |
   | Anonymous HTTP capability | Actual HTTP adapters cover projection/query overrides, invalid-response uniformity, hostile cookies/headers/validators, completeness, serialization and failures. |
   | Independent limits and transactional authority | Adapters exercise production orchestration and ordinary RPC/SQL paths. Independent-IP and race tests use private dependency seams and database barriers; they do not establish deployed ingress behavior. |
   | Admin monitoring | SQL authorization, sanitized aggregates and separate UI presentation are represented in RLS and browser cases. |
   | Hosted trusted-IP boundary | Canonicalization and trust selection have source/unit coverage. Deployment-specific header replacement remains an explicitly unverified release prerequisite. |

   I found no missing outermost settings or public-feed implementation in this diff. Its acceptance coverage extends beyond detached components: actual browser and HTTP test bodies are bound. The four component cases remain SSR coverage and do not themselves establish interaction or focus behavior.

   The important divergence is **implementation versus demonstrated execution**, not an omitted product surface. The 83 prepared cases are bound as 22 Node, 50 Vitest and 11 browser cases; native DB/RLS/HTTP/browser execution, installed collection and recovery evidence remain pending. The reported focused local passes do not establish those outcomes.

   All 20 Suggested Review Order stops resolve to their stated symbols or test cases at the recorded lines. Its evidence limitations accurately distinguish synthetic middleware/bootstrap checks, SSR presentation and discovery from pending native execution. It makes no completed-delivery or release-readiness claim. No concrete intent-to-source divergence was established by this descriptive audit.