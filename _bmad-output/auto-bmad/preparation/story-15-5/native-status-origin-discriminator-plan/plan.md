# Status origin discriminator — plan only

Source f304ea548faa05f037cd3aa44c65888d96d543df; pushed checkpoint 33cfa8dfa1323708edf80034c0a98b0620790b6a. This plan grants no implementation or native effect. Normal acceptance credit **0**; three broad reviews completed, only targeted review remains. Reuse the unchanged reviewed once-admission, single-call, rollback, settlement, cleanup and transport framework by its bound source/packet provenance.

## Evidence and smallest delta

The closed observation records execute/context/key/status entry then original status-rpc42501. The separate unmodified restricted baseline also returned 42501; settlement and cleanup were verified. Cause remains unproven, including all 43 DB/14 browser failures. Status migration:146–160 has an explicit guard at :152 and engine/dependency permission paths. Management proof/Vault/HMAC/expiry/limiter/issuance work is downstream and unreached; intended grants/policies already exist. No functional fix is justified.

Modify only the existing restricted qualification SELECT in tests/support/calendar-feed-atdd.ts:832 to add the 18 fixed booleans below. Keep original qualified predicate, $1 parameter, connection/session/claims and time checks. Require one row, original qualified=true, exact own data keys and strict boolean types; null/missing/extra/accessor/duplicate rows or query rejection => INCOMPARABLE, no baseline call. A false permission bit is valid evidence: retain it and still perform the existing at-most-one unmodified status invocation at :837. No additional query, row lookup, connection, session switch, function replacement, grant, role/RLS change or normal app observer.

At existing direct-pg catch :840–844 inspect only own data descriptors code/routine, guarded against throwing proxies. No getter, prototype walk, coercion, enumeration, recursion or error serialization. For exact code='42501' only: routine='exec_stmt_raise' => PLPGSQL_RAISE; routine='aclcheck_error' or 'aclcheck_error_col' => ACL_ENGINE; otherwise UNKNOWN. Nonstring/missing/inherited/accessor/throwing/unmapped fields or any other code => UNKNOWN. Compare three literals in memory, retain only the closed class. Never persist/print raw routine, arbitrary error/message/detail/hint/context/query/params/stack/body/URL/token/proof/key. Classification is never authorization.

## Fixed predicates

All inquiries use pg_catalog qualification; literals below are compile-time constants. current_user is the already-qualified authenticated session; the explicit owner is the already-catalog-qualified function owner, not a session substitution. Column inquiries include table grants. These are ACL inquiries, not RLS row visibility or exhaustive implicit operator/type/built-in dependency proof.

| Fixed field | Predicate arguments and privilege |
| --- | --- |
| caller_public_usage | has_schema_privilege(current_user, 'public', 'USAGE') |
| caller_status_execute | has_function_privilege(current_user, 'public.read_calendar_feed_status(uuid,uuid)', 'EXECUTE') |
| owner_public_usage | has_schema_privilege('calendar_feed_owner', 'public', 'USAGE') |
| owner_auth_usage | has_schema_privilege('calendar_feed_owner', 'auth', 'USAGE') |
| owner_uid_execute | has_function_privilege('calendar_feed_owner', 'auth.uid()', 'EXECUTE') |
| owner_subject_execute | has_function_privilege('calendar_feed_owner', 'public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean)', 'EXECUTE') |
| owner_lock_execute | has_function_privilege('calendar_feed_owner', 'pg_catalog.pg_advisory_xact_lock(bigint)', 'EXECUTE') |
| owner_hash_execute | has_function_privilege('calendar_feed_owner', 'pg_catalog.hashtextextended(text,bigint)', 'EXECUTE') |
| owner_tenant_id_select | has_column_privilege('calendar_feed_owner', 'public.tenants', 'id', 'SELECT') |
| owner_member_id_select | has_column_privilege('calendar_feed_owner', 'public.tenant_memberships', 'id', 'SELECT') |
| owner_member_tenant_select | has_column_privilege('calendar_feed_owner', 'public.tenant_memberships', 'tenant_id', 'SELECT') |
| owner_member_user_select | has_column_privilege('calendar_feed_owner', 'public.tenant_memberships', 'user_id', 'SELECT') |
| owner_member_status_select | has_column_privilege('calendar_feed_owner', 'public.tenant_memberships', 'status', 'SELECT') |
| owner_member_role_select | has_column_privilege('calendar_feed_owner', 'public.tenant_memberships', 'role', 'SELECT') |
| owner_union_tenant_select | has_column_privilege('calendar_feed_owner', 'public.membership_roles', 'tenant_id', 'SELECT') |
| owner_union_member_select | has_column_privilege('calendar_feed_owner', 'public.membership_roles', 'membership_id', 'SELECT') |
| owner_union_role_select | has_column_privilege('calendar_feed_owner', 'public.membership_roles', 'role', 'SELECT') |
| owner_tokens_select | has_table_privilege('calendar_feed_owner', 'public.calendar_feed_tokens', 'SELECT') |


Missing objects/denied inquiries fail qualification; no grants or elevated retry. No changes to ordinary status/management parameters, results, public response uniformity, gate ordering or SQL behavior.

## Why the classifier is reachable, and its limit

[PG17 ErrorResponse](https://www.postgresql.org/docs/17/protocol-error-fields.html) defines R as the reporting source routine, not a stable cause taxonomy. [PG17.6 PL/pgSQL source](https://raw.githubusercontent.com/postgres/postgres/REL_17_6/src/pl/plpgsql/src/pl_exec.c) emits explicit RAISE from exec_stmt_raise. [PG17.6 ACL source](https://raw.githubusercontent.com/postgres/postgres/REL_17_6/src/backend/catalog/aclchk.c) emits insufficient privilege from aclcheck_error/aclcheck_error_col. Names outside this finite mapping remain UNKNOWN; major17 alone does not prove deployed minor source equivalence. PLPGSQL_RAISE identifies explicit PL/pgSQL origin, not migration:152 without every reachable raiser being independently qualified.

[PG17 privilege inquiries](https://www.postgresql.org/docs/17/functions-info.html#FUNCTIONS-INFO-ACCESS-TABLE) define named-role/schema/function/table/column checks. They do not execute the function or establish definer RLS-visible rows. [Official pg-protocol1.15.0 parser](https://raw.githubusercontent.com/brianc/node-postgres/pg-protocol%401.15.0/packages/pg-protocol/src/parser.ts):389 assigns fields.R to message.routine; installed dist/parser.js:321 agrees. Installed pg8.22.0 client.js:433 forwards the error to query.js:122–133/callback. Bound installed bytes establish normal own-data transport reach, not that the previous native error actually contained routine; cancellation/protocol replacement can erase it. No dependency update. Supabase changelog fetch was refused by the documentation tool's markdown content-type handling; no changelog verification or Supabase feature change is claimed.

## Exact schema delta and affected ownership

Proposed observation retains the existing ten fields and adds exactly statusDiscriminator: null, or {schema:'status-origin-v1', origin:PLPGSQL_RAISE|ACL_ENGINE|UNKNOWN, permissions:{exact18 own strict booleans}}. Nonnull requires qualified baseline=status and a completed existing invocation/catch. Nonselected/before-call failure keeps null and existing not-selected/INCOMPARABLE/CAPTURE_UNAVAILABLE outcome. Non-42501 or success => UNKNOWN. Non-UNKNOWN requires baseline=status/sqlState42501. Existing outcomes/SQLSTATE vocabulary unchanged; AMBIGUOUS_SQL42501 is never renamed backend-proven.

Reject unknown/extra/duplicate JSON keys, invalid cross-fields, getters, malformed booleans, oversized/unbounded data, unknown schema/class and arbitrary additions. Retain current producer 1,000,000-byte report cap (runtime:57), private consumer observation 65,536-byte cap, and all other archive/member/native/receipt/manifest caps. Expected new observation <8KiB is a design target, not measured native evidence; boundary tests must enforce actual caps. Same artifact names, nonce/ref/source/run admission, diagnostic mode and acceptanceCredit=0; no workflow/dispatcher changes. New target's strict producer+consumer both require the eleven-field schema before any POST. Historical ten-field packets/consumers remain immutable and separate by source/target; no permissive fallback or retroactive origin inference.

Candidate source hunks, still UNALLOCATED: tests/support/calendar-feed-atdd.ts (:763 report/:832 SELECT validation/:840 catch); scripts/ci/with-calendar-feed-runtime.mjs (:20–48 strict observation validator only); tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts (live-source/parser/validator controls); tests/support/calendar-feed-ci-contract.ts (reviewed wrapper SHA pin only); the author 15.5 Spec (trail/SRO, approved5760-byte kernel and in-review status preserved). Separately coordinate NEW future pushed-head private collect-diagnostic-evidence.py and test_collect_diagnostic_evidence.py strict schema/target binding; current checkpoint-33cfa8df and earlier private files stay immutable. No migration/app/package/lock/ordinary cases/INT015/shared canonical factory/normal collector/workflow/dispatcher change or source-union expansion.

## Focused proof and decision table

Planned, not executed: synthetic finite ErrorResponse frames through the installed parser, then actual reachable/live-source catch and strict producer/private consumer validators. Cover all3 routine literals; missing/inherited/accessor/nonstring/unmapped/oversized/proxy/code mismatch; hostile message/detail/stack getters never touched and raw sentinel absent from serialized outputs. Actual caller controls capture the existing qualification SELECT/unchanged parameter and return strict rows: all18 keys, each false separately, missing/extra/null/type/accessor/duplicate-row/rejection; prove original identity gating and one baseline call only, false bits not coerced or skipped, no additional queries/session operations. Preserve actual finally/settlement wiring. Consumer negatives cover exact schema, duplicate keys, caps, cross-fields, old/new target separation and raw-field rejection. Appropriate affected controls/type/lint and distinct High actual committed delta review required; no redundant app build for test-only changes. Pure controls have zero native credit.

| Authorized new result | Permitted conclusion / stop |
| --- | --- |
| ACL_ENGINE + one false required bit | Controlled setting has a concrete missing necessary privilege candidate; not first-failure ordering or original JWT cause. Root may request a narrowly reviewed causal correction/test plan; no automatic grant or normal rerun. |
| PLPGSQL_RAISE | Explicit PL/pgSQL origin only; exact guard, membership/subject/RLS facts unproven. STOP STATUS_ORIGIN_UNRESOLVED. |
| ACL_ENGINE with all true or multiple false bits; UNKNOWN origin | Remaining/unordered dependency gap. STOP STATUS_ORIGIN_UNRESOLVED; no generic observer or follow-on probe. |
| Nonreproduction; identity/claims/clock/state/source mismatch | No comparable cause proof. STOP STATUS_ORIGIN_UNRESOLVED. |
| Pending command/query/HTTP/child work, rollback/RESET/fresh checks or cleanup uncertain | Fail publication/verification and retain custody under existing protocol. STOP named cleanup/settlement prerequisite. |

The original JWT invocation and later direct SQL baseline are different sessions, times and snapshots. Repeatable read does not freeze wall time or establish historical state; copied subject claims and SupAdmin setup qualification do not prove the original RPC identity or original definer row visibility. Fixed permission predicates are from the controlled snapshot and can change later. Never promote a controlled class/bitset to the historical 43-case cause. No raw errors/object names are required for these limited conclusions.

This is approach two after ambiguous status42501. Any unresolved result above terminates the attempt, owned by Root with the exact frozen source/observation as evidence. Resume only for a new independently reviewed and explicitly allocated proof or concrete causal source correction; no automatic opaque diagnostic ladder or full CI retry. Preserve unchanged one-call bounds, statement/lock/time limits, actual promise/query/HTTP/timer/child settlement before rollback/drain, function OID/owner/ACL/proconfig/source and owned-state comparisons, independently qualified fresh cleanup and exact UUID/name key/fixture custody.

Before implementation: Root narrow allocation of source/private hunks plus recorded High author/review routes. Before effects: actual committed-delta review PASS, Root freeze/push, fresh exclusive private target/UUID/schema adoption and independent review, hosted availability/admission qualification, then a separately recorded Root once-only activation. Current metadata grant authorizes none of these. All normal full DB/RLS/recovery/essential-browser gates remain required. No implementation, tests, runtime, queries, Git/provider or resources were executed by this plan.
