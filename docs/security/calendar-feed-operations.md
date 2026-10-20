# Personal calendar feed operations

Story 15.5 adds ADR-B004's read-only `/calendar/feed/<token>` capability. A URL
is issued once to its current authenticated membership; rotation or revocation
invalidates the old hash at database commit. Already downloaded calendar events
cannot be recalled from a provider. Tokens are 32 random bytes, encoded as
base64url. Only their SHA-256 hashes are persisted. Never capture the URL/token,
proof, key, raw IP or hash in access logs, traces, error reports or analytics.

## Hosted readiness remains a release prerequisite

Hosted use is not enabled or verified by this implementation. The release
operator must separately authorize and provision a dedicated random key of at
least 32 bytes. Set server-only `CALENDAR_FEED_ATTESTATION_KEY_ID` (1–64 ASCII
letters, digits, `_` or `-`) and `CALENDAR_FEED_ATTESTATION_SECRET` (canonical
unpadded base64url bytes), and install exactly the same encoded secret in Vault
as `calendar_feed_attestation_<key-id>`. The application has no fallback and
never uses a JWT, service-role, booking, provisioning or document key. The
dedicated database owner can execute only the filtered feed-key helper; it has
no general Vault access. Proofs bind operation, current subject, lifecycle
revision/attempt, token/IP hashes and expiry with a maximum 60-second lifetime.

Before enabling platform IP trust, the operator must verify that the deployment
is Vercel, that its single `x-vercel-forwarded-for` value is replaced/controlled
by the platform, and that no alternate ingress preserves an attacker value.
Record deployment-specific evidence and then set
`CALENDAR_FEED_VERIFIED_VERCEL_IP=1` only in that verified Vercel context.
`VERCEL=1` alone is insufficient. Other contexts use one conservative shared
unknown-IP bucket. Arbitrary forwarded headers are never trusted.

Missing or mismatched keys and database failures return a generic 503. Invalid,
malformed, rotated, revoked or currently unauthorized subjects share the same
404 response. Every response is no-store, without cookies, ETags or redirects.
Feed response telemetry contains only `calendar_feed.response` and HTTP status;
request identity and capability data must never be added to that record.

## Independent budgets and monitoring

The database owns 900-second UTC windows, 60 attempts per active capability and
120 requests per keyed canonical IP across capabilities. Invalid token shapes
also consume the IP budget. Limits are independently atomic and return 429
with seconds remaining in the fixed window. Counters saturate at the JavaScript
safe integer bound. At most 4096 IP infrastructure rows are admitted; excess
new addresses share a conservative overflow bucket. Each request prunes at most
128 expired counter rows. No retention or legal program is introduced.

The user's Kalenderprenumeration page shows current own status and last admitted
fetch. Admins additionally see tenant aggregate request/limited counts and last
spike time, without hashes, addresses, URLs, booking or peer details. A burst may
require the owner to revoke their URL and explicitly rotate; an issued URL
cannot be recovered after a lost response. The UI reconciles the saved attempt
before retrying and never rotates automatically.

## Verification and release record

Required development evidence is the exact-head static/build lane, full executed
integration/RLS/ACL/abuse tests, physical recovery Storage integrity, essential
production browser flow and independent High review. A skipped test is not
coverage. CI uses a unique ephemeral TEST-only key and isolated local stack;
parallel fixtures read it, and only the allocated serial suites may change and
restore that owned key or install scoped fault/barrier objects. No hosted
project, `.env` file or persistent provider secret is used.

Release operator owns hosted key and trusted-IP qualification. QA/UX owns the
deferred provider/device matrix, exhaustive visual/manual accessibility and
screenshots. Product/Architect/operations must approve representative feed
volumes and performance targets before measurement. Record each result and next
action in the delivery record; development completion does not imply release
readiness or permission to deploy.
