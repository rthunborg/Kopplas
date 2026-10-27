# Production deployment from earned merges

Owner decision: 2026-10-25. This standing authorization applies to production deployments triggered by earned merges. The owner authorizes that merge effect and asks agents to avoid merge/wait/deploy/find-issue/redeploy loops.

Complete the existing applicable development checks, required GitHub CI for the actual head, independent review and merge requirements before merging. For E15, the final independent PR review remains a fresh-chat review bound to the actual PR head. This decision grants no waiver of authorization/RLS/privacy/transaction integrity, scope governance, review limits or evidence truth. It does not make a branch push deployment authorization.

Automatic Vercel Preview deployments remain disabled under the October16 decision until the owner explicitly re-enables them. An earned merge may incidentally trigger production deployment through the existing integration. This decision authorizes no Git disconnect, provider/configuration write, manual deployment/redeployment, database push or other backend mutation; those actions retain their separate authorization requirements. Do not start automatic post-merge retry or redeployment loops. If a concrete issue is found, retain its actual evidence and route a bounded repair through the existing review and CI process.

## E15 compatibility handoff

E15 requires the repository migration history through migration119. That history was verified in isolated CI; no demo database push occurred in this run. Compatibility of the production target backend schema was not newly verified here. This records the known handoff limit; it establishes neither that the target is missing migrations nor an additional merge gate. Existing requirements still apply.

Development completion remains distinct from release readiness. E15 retains `release_ready=false`, its owned release-validation items and the final PhaseB release-validation/stabilization checkpoint. This authorization does not attest backend configuration, mail/integration readiness or completed release validation.

## Historical evidence

Earlier no-deployment/HOLD statements remain valid records of their original scope and time. For future earned merge-triggered production effects, this dated owner decision supersedes that earlier constraint. Preserve earlier execution results and unknowns; do not relabel them as newly verified deployment, schema or release evidence.
