# Story 15.5 isolated setup authority and transport proposal

Status: **PROPOSAL ONLY — source and all five capsules frozen.** Author route:
`gpt-6.1-sol`, `high`, sensitive isolated setup, credential custody and restricted
session proof. Root recorded `build-native-authority-boundary-design` /
`build-author-isolated-setup-authority-design` before this read-only work. This
document is the only new artifact; no source, configuration, process, credential,
database or hosted mutation is authorized by it. Distinct context-free High
review of this proposal precedes Root admission, any Coordinator ownership
clarification, and a separately recorded implementation route. Broad review cap
remains three; this is not a fourth story review.

## Actual evidence and the two remaining prerequisites

Frozen source is `e472741a91f58c5ef9e623720e2bba0d1164c360`; fifth checkpoint is
`c7570096435dfbae2f6a535be46e61daaf9e28dc`, run `39468849461` attempt 1, **failed**.
Native verify passed 3102 Node cases, Python 43, build and containment. The
separate one-case isolated recovery job passed. The 51 feature Vitest and 14
browser bodies remain unexecuted; no key or child followed the wrapper refusal.

Both wrappers actually connected to the qualified source publication as
session=current=`postgres`. Both observed superuser flags were false and both
BYPASSRLS flags true. Four strictly valid privacy rows were returned: the three
SUSET controls did not match the required values; USERSET on-error matched.
All `canSet` observations were false. Those observations are not an actual SET
trial, do not prohibit USERSET generally, and reveal no raw effective values.
The fourth run's startup42501 and earlier generic failures retain their separate
historical meanings; no retroactive diagnosis is made.

The existing key-bearing connection cannot continue under the required privacy
contract with those observed settings. Independently, INT015's fixed
`LOCAL_SUPABASE_DB_URL` transport cannot meet its original authenticated-superuser
precondition with the observed source `postgres` role. Do not weaken that
precondition, replace SESSION AUTHORIZATION with SET ROLE, or credit a bypass-RLS
role as a superuser.

The fifth immutable packet is under
`C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas/.env.epic15.mail-runtime/story-15-5-preparation/checkpoint-c7570096-ci-independent/`:

| Artifact | Bytes | SHA256 |
| --- | ---: | --- |
| native-qualification.json | 20237 | `8790401b0ae1441e88c32b81d71ecfbe0cdf1c5e1c2631f6dc082552fac5638e` |
| native-qualification.md | 3404 | `512f7132d08e2bd44f195ce66f9d8ccb24d56c2ada28094ca43e6e348a815ec3` |
| manifest.json (18 listed files, self separate) | 3039 | `dc8bee5066b45e02ae8305e3873fb035e942fa5f6b3f4f2bf7d667a07220c8dc` |

Sibling `root-failed-c757-packet-admission.json` has SHA256
`bc57e48417de15ba5f0911e4ec1cdc1d207b6954a5f1f4404a9b8b9924299c76`.
Its integrity PASS does not change the native failure. All five preceding
capsules and all five failed packets remain immutable.

## Selected candidate: existing admin login over the existing pg transport

Use the existing source container's canonical `supabase_admin` principal through
the existing direct `node-pg` TCP transport to the **same already qualified** local
DB publication. Keep the ordinary `postgres` connection and all application/test
defaults unchanged. Do not introduce a custom psql stream/protocol adapter,
another database, another principal, a proxy, a SECURITY DEFINER test RPC,
membership grants, parameter grants or an elevated application client.

The credential candidate comes solely from exactly one nonempty existing
`POSTGRES_PASSWORD` entry in **that same source DB container's** in-memory Docker
inspect `Config.Env`, already captured by the fresh-stack qualification. Reject
missing/duplicate/invalid entries. Never use a default literal, the password
portion of another principal's DSN, host environment PGPASSWORD/PGUSER, a caller
selected admin URL, the recovery target's generated credential, or fallback
credential attempts. Do not create/reset a password or copy a credential into
an environment file. This new credential use is in-memory explicit `pg.Client`
configuration; it produces no privileged serialized DSN, command argument, log,
receipt, assertion dump or additional child environment field.

**Unverified prerequisite:** repository source does not prove that the CLI source
container exposes that environment entry, that it authenticates `supabase_admin`
over TCP, or that this source principal is an authenticated superuser. This
proposal does not assert any of those facts. The implementation would attempt
this one exact existing credential/principal route, then require actual
authentication and identity qualification before any key/fixture mutation. An
absent credential, auth refusal, non-superuser or different session is a bounded
failure with zero key/fixture work, no alternate principal/transport, and no
automatic privilege/configuration repair. Root must decide any further route
from that new evidence; there is no blind retry or invented credential mapping.

## Admission, session privacy and principal proof

1. Retain actual hosted/disposable admission, repository/check-out binding,
   newly created exact Docker IDs/labels/network/publications, current migration
   ledger and real feed-function owner checks. A CI flag or loopback address is
   insufficient. Read the candidate credential only from the qualified source DB
   object; keep it bound to that container ID. Reject an unexpected container or
   any configurable role/endpoint selector. Root grants no new resource launch.
2. Construct the setup client with explicit fixed local host, published port,
   database and `user: supabase_admin`, plus that observed credential. Do not
   parse a caller-supplied privileged URL or let node-pg ambient PG options select
   an identity. Preserve existing connection/query/statement bounds. The only
   startup GUC options are the original four session-only privacy controls
   `log_statement=none`, `log_min_error_statement=panic`,
   `log_parameter_max_length=0`, `log_parameter_max_length_on_error=0` (and the
   existing fixed read-only option for the fresh absence connection). This
   restores the initial privacy intent using the explicit setup principal;
   nothing persists at server/database/role level and no SET privilege is granted.
3. Immediately after successful authentication, read fixed booleans proving
   session_user=current_user=`supabase_admin`, both actual session/current roles
   are LOGIN and SUPERUSER, and neither identity was achieved through SET ROLE.
   Require all of those actual identity facts. Require native PG17 in INT015 as
   before. Other role attributes may be observed as closed booleans; no missing
   privilege is repaired and no ordinary role's attributes are changed. These
   are explicit **setup authority** prerequisites, separate from diagnostic-only
   `canSet` observations in the privacy proof.
4. On that **same live client**, retain the strict read-only exact-four
   names/types/contexts/effective-value checks before UUID, entropy, telemetry,
   Vault or a fixture. All four must match `none/panic/0/0`. Unknown, missing,
   duplicate, malformed, mismatched or failed facts close/fail without fallback.
   Continue on that client through the key transaction, COMMIT and exact-key
   cleanup. No earlier run or server default supplies this proof. Read-only
   qualification queries before privacy proof contain no runtime secret.
5. Only explicit setup call sites authenticate as the admin. The Next build/server,
   Playwright process and generic test/admin pools keep their existing ordinary
   DB/JWT configuration, byte-for-byte. No admin URL/client handle or new setup
   credential/capability environment field is passed to a child. INT015
   independently uses the same fixed, admitted constructor from
   its already qualified source-container observation; the full test runner is
   not handed an extra credential. Its existing Docker read-only observation
   authority is not enlarged to lifecycle commands. This is call-site authority
   control, not a process sandbox: the isolated job already has Docker access.
   If the image reuses a password value across existing principals, ordinary
   child DB credentials may already contain the same bytes. Do not claim physical
   credential separation or value absence in that case. Tests must prove no new
   privileged configuration is distributed, rather than assert an impossible
   absence of a value already present in unchanged ordinary configuration.

The proposed authenticated setup route can change session-local startup settings;
no existing database role, membership, PUBLIC/schema ACL, persistent setting or
application authority changes. A superuser setup session is already the original
accepted INT015 effect boundary, not the restricted principal credited by the
test. Its actual availability on the source stack is still unverified.

## INT015 keeps the original restricted oracle and cleanup

Move only its direct connection construction to the qualified setup constructor;
leave the single case, exact two UUID NOLOGIN roles, UUID schema/harmless function,
transaction-local effects, leading actual migration DO extraction and reversible
role-name-only substitutions intact. Do not change real `calendar_feed_owner`
membership, source migration or recovery bootstrap.

Before mutation, the original **authenticated** session must actually be the
qualified SupAdmin superuser with session=current. Setup creates only the owned
fixture. Every credited source, SET and ownership operation must still immediately
follow `SET LOCAL SESSION AUTHORIZATION` plus proof that both identities are the
owned restricted migrator, with its exact restricted attributes and self-grant
setting. Preserve separate native creator ADMIN/SET/INHERIT baseline, savepoint
rollback before genuinely fresh source creation, fresh/replay seven attributes,
SET=true, USAGE=false, nonempty/all INHERIT=false membership proof, native guard
failures and actual restricted function ownership. No SECURITY DEFINER wrapper
or mere SET ROLE may stand in for that proof.

Retain pending-query settlement; expected errors roll back their savepoints
before assertions. Unexpected abort requires full rollback before identity reset.
Superuser reset/setup cannot receive restricted-operation credit. Verify actual
original session/current identity after reset, then same-connection absence.
Fresh read-only absence uses another independently authenticated same fixed setup
route, requires its identity/privacy qualification, observes exact owned roles/
schema/function absence, and closes without pooling. Keep primary and every
cleanup/transport/identity/absence failure; close failure never becomes success.
Transactional UUID-schema CREATE remains unrelated to real public-schema
source/recovery prerequisite proof.

The wrapper preserves irreversible COMMIT uncertainty, captured child settlement,
exact UUID/name deletion and independent absence read, no name-only fallback,
and job-operator custody on unverified outcomes. A failed setup qualification has
not-attempted key outcome. After key mutation, no new transport/authority fallback
can manufacture cleanup success. Credentials/connection references are released
after all own requests and cleanup settle; JavaScript string zeroization is not
claimed. Raw driver error fields and Docker/status payloads remain in memory;
only fixed stages/categories and validated nonsecret booleans are persisted.

## Exact proposed source scope and bounded verification

| Path | Proposed responsibility and scope |
| --- | --- |
| `scripts/ci/with-calendar-feed-runtime.mjs` | Return the qualified source DB observation internally; shared explicit setup client constructor; credential-source guards; fixed admin identity and same-client privacy gates; original four startup controls. Existing argv/lifecycle/COMMIT/cleanup/custody unchanged. No new command or workflow. |
| `tests/unit/scripts/ci/with-calendar-feed-runtime.test.ts` | Existing file only: real unconnected pg constructor/startup tests plus injected credential/principal/privacy failure and ordering/custody tests. No actual service/qualification execution. |
| `tests/support/calendar-feed-ci-contract.ts` | Only refresh actual LF wrapper SHA after the reviewed implementation. Preserve exact entry/argv projection and all unrelated-source/workflow drift negatives and original inverse hash. |
| `tests/integration/commands/calendar-feed.int.test.ts` | Existing INT015 only: use the shared qualified constructor for original and fresh read-only sessions; retain every restricted identity/operation/rollback/absence assertion. No new case, object or role effect. |
| `_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md` | Author technical choice/evidence limits and single SRO after implementation; intent kernel and historical approvals immutable. |

No new helper/dependency/shared environment/workflow/recovery/migration path is
proposed. The constructor is already exported by the owned wrapper, and INT015
already imports its validators. This is a new **credential-use and authenticated
setup transport effect**, so the original superuser allocation alone must not be
presented as implementation admission. Root handles explicit review/admission and
any Coordinator clarification for the exact existing INT015/wrapper boundaries;
the author does not contact other owners or write those sources now.

Meaningful bounded tests must demonstrate: no guessing/duplicates/missing
credential or alternate endpoint; explicit real-driver startup/config excludes
ambient identity/options; wrong/partial/non-super/session-mismatched authority
and unsafe privacy block UUID/entropy/Vault/fixtures/children; setup proof and
key/cleanup use one client; fresh absence requalifies independently; child
configuration remains exactly ordinary with no new privileged field/DSN;
safe primary-plus-cleanup outcomes
and unchanged COMMIT/custody; actual argv/inverse/drift fences. Run only affected
Node cases, full typecheck/focused lint and kernel/SRO/diff checks locally. Test
counts follow actual implementation, not a predicted number. Native PG17 setup,
restricted proof and feed bodies require new exact-head isolated CI after distinct
High review of the implemented delta; no current native success is promised.

## Evidence for the selected boundaries, and explicit limits

- Existing original allocation: `accepted-pg17-probe-allocation.json`, especially
  initially authenticated isolated superuser, restricted SESSION AUTHORIZATION,
  seven attributes, exact two-role effects, and all cleanup/absence conditions.
- Existing `code-review-round-2/source-role-disposition.json` binds PostgreSQL17
  [SESSION AUTHORIZATION](https://www.postgresql.org/docs/17/sql-set-session-authorization.html)
  and [SET ROLE](https://www.postgresql.org/docs/17/sql-set-role.html) semantics.
  This design reused that already recorded primary analysis; no native probe or
  new remote infrastructure observation occurred.
- Existing source: wrapper source admission/fixed publication and pg constructor;
  INT015 lines296-302,378-385 and restricted/reset/absence logic. The
  `tests/support/test-env.ts` local-superuser comment is not authority: actual
  fifth-run facts contradict it for this route. No general test-env rewrite is
  proposed.
- Existing `.github/workflows/ci.yml:325` uses source-container psql as postgres;
  lines348/405 authenticate the **separate** isolated recovery target as
  supabase_admin. `scripts/ops/write-recovery-runtime-config.mjs` generates that
  target's private password; `ops/recovery/bootstrap-roles.sql` initializes only
  its existing runtime role passwords. Neither proves a source admin password or
  source SupAdmin superuser login. Do not reuse the recovery credential/target.
- Installed pg8.22.0 startup/config behavior was already inspected and bound in
  `author-native-privacy-preflight-route.json`: explicit constructor settings
  override ambient PG choices. The proposed source credential/role mapping still
  needs actual single-route authentication and catalog proof in an admitted CI
  run. If unavailable, stop with that named prerequisite gap rather than elevate
  postgres, grant SET, change HBA, use peer-socket fallback or relax either oracle.

This document grants no action. Root owns review dispatch, admission, bookkeeping,
the next checkpoint/CI and any effect/ownership coordination. Source remains
frozen, status in-review, development and release incomplete, no delivery/DONE.
