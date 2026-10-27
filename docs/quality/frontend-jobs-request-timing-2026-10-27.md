# PR109 bounded RLS001 request timing

Author route: GPT-6.1 Sol High for RLS/test-integrity work. The coordinator
authorized this exact five-TypeScript-path change plus this report after
independent High pre-edit review. Independent High actual-diff review returned
GO with no actionable defect and independently reran all 12 units successfully.
Base: `eb86bec5b253f0d42228307d2dd3ffd2ec993f7a`. Other agents own the separate
browser/CI stabilization work; it is outside this report's source identities.

## Problem and evidence boundary

Run `40489824772` on that base still failed the original **16.1-RLS-001** in
`tests/integration/rls/jobs-depth.rls.test.ts`, at 30012.671021 ms. Its frozen
phase evidence reports five role reads taking 16294 ms and an incomplete
inactive-read phase: two started, one returned, 6240 ms aggregate. This cannot
identify HTTP, client scheduling, PostgREST, database execution or contention
as the cause. The passing **15.5-RLS001** calendar case is a different test;
the retained integration summary's `RLS001` field selects that calendar case.
The native failure entry identifies the jobs test correctly.

This change adds request-layer evidence to the existing failure-only native
metadata carrier. It neither fixes nor establishes the historical failure's
cause. No backend test, service workload or hosted CI was run for this change.
Required integration evidence remains failed; no readiness claim follows.

## Capture contract

Only RLS001 supplies a per-client fetch override. The global fetch is untouched.
The recorder arms during the existing own, role and inactive read phases only.
Setup and sign-in delegate without inspecting arguments, responses, headers or
errors. Existing requests, their arguments and order, assertions, cleanup,
30-second test timeout, retry settings and runner concurrency stay intact.

The optional factory seam preserves the exact previous createClient options
when omitted. Its overloads retain existing `Array.map(makeAuthedServerClient)`
callers: map's numeric second argument remains ignored, rather than becoming a
fetch override. Only an explicitly supplied function adds `global.fetch`.
Local-target guards, real sign-in and the existing quote observer remain.

The existing `jobsDepthPhaseV1` snapshot gains `requestTiming` with version 1,
a closed captured/unavailable state, and at most 36 flat records. Fixed subject
ordinals are 0 for the own read, 1-5 for the existing role iteration and 6-8 for
the existing inactive iteration. Request ordinals are 1-4 per subject. These
limits bound observations; they create no request or retry. Overflow makes
request evidence unavailable and retains the existing phase evidence.

Each record contains integer start elapsed time, outer phase elapsed time,
closed outer/request state, fetch-start-to-response-header elapsed time, and
only numeric values from the two existing Kong headers:
`x-kong-proxy-latency` and `x-kong-upstream-latency`. Header values must be
canonical ASCII nonnegative integers no larger than 600000. Missing, malformed,
combined, signed, whitespace, exponent, fractional, non-finite or oversized
values become `UNAVAILABLE`. A present valid `0` stays zero. All durations are
bounded to 600000 ms. Request capture failures do not erase phase evidence.

The delegated call runs once with the same argument and receiver references.
Returned Response and rejection objects retain identity. No body is read,
cloned or replaced. The capture reads no URLs, query strings, identifiers,
claims, raw header collections, error values, credentials or signal reasons.
The existing timeout abort freezes a copied, deeply frozen snapshot; later
headers and outer completion cannot alter it. Passing tests publish no metadata.
All evidence retains `diagnostic-only` and `acceptanceCredit=0`.

Kong upstream latency measures time until upstream response headers, **not
database execution or total response time**. The outer phase also includes SDK,
body processing and assertions. Differences between these timings can locate a
layer needing further assessment, but do not prove network, SQL planning,
execution or contention as the cause. See the
[Kong latency definitions](https://docs.konghq.com/gateway/latest/how-kong-works/routing-traffic/).
No database sampler, admin endpoint, Server-Timing, logging or setting change
is included. The existing calendar-only cause-proof input is unchanged.

## Executed verification

Commands ran in `C:/DEV/Kopplas-quality-gate` on the five source identities below:

- `node --experimental-strip-types --import ./tests/support/register.mjs --test tests/unit/support/jobs-depth-phase-diagnostics.test.ts`: 12 passed, zero failed, skipped or pending.
- `node node_modules/typescript/bin/tsc --noEmit`: passed after preserving the existing Array.map callback contract described above.
- Targeted ESLint on the five TypeScript paths: passed.

The units exercise the actual extracted factory and fixture wrapper, exact
default options including ignored numeric map indices, local-guard refusal,
sign-in forwarding, request/receiver identity, one delegated call, Response and
sync/async rejection identity, hostile inputs, strict header parsing, capture
clock failures, ordinal/cap bounds, and timeout immutability. They run no backend.

The actual installed Vitest/JsonReporter subprocess intentionally executes
three synthetic cases: one 20 ms timeout, one original rejection and one pass.
Its required exit code is 1: two deliberate failures, one pass, zero pending.
The outer unit requires native pending-request metadata at timeout, unchanged
original rejection and no late header access or passing-test publication.
Receipt: `tmp/private/rls001-phase-proof-pjhg6O/native.json`, SHA-256
`fe1ef0f882b4789e2076e79558a085c29abf2ed55fc03dbda3b40e1ee09321aa`.
These synthetic failures prove the carrier and noninterference mechanisms only.

Canonical LF SHA-256 source identities:

| Path | SHA-256 |
| --- | --- |
| `tests/support/jobs-depth-phase-diagnostics.ts` | `f03d3dfc3613376d6258414de62dc975e32036cbfff8918803360491fe6644b1` |
| `tests/factories/tenants/core.ts` | `ca0468ab53fc8d50cdcbd898a9517cb582ba626c9c83074597408a681df0c742` |
| `tests/support/jobs-depth-atdd.ts` | `fbc7b6e225f31dee0cb6333172f69f68933412d3589c5ecd3314d7b4a845275e` |
| `tests/integration/rls/jobs-depth.rls.test.ts` | `fe6558763fa310f9de4682bd43951c6096a386930474c14db5a0251c7b098148` |
| `tests/unit/support/jobs-depth-phase-diagnostics.test.ts` | `012df4006731a91d9e78eb0c6d11a876527afbfac0fd5783f72c049a43d8460f` |

## Suggested Review Order

- `tests/integration/rls/jobs-depth.rls.test.ts:8` — `16.1-RLS-001`: verify that only this case injects fetch into its existing client path and all assertions remain.
- `tests/factories/tenants/core.ts:339` — `makeAuthedServerClient`: verify default options, map compatibility, the local guard and unchanged real sign-in.
- `tests/support/jobs-depth-atdd.ts:108` — `createJobsDepthFixture`: follow the optional seam to only the existing montor client; verify callback/finally cleanup at `withJobsDepthFixture`.
- `tests/support/jobs-depth-phase-diagnostics.ts:66` — `const latency`: inspect the two-header whitelist and strict numeric/unavailable semantics.
- `tests/support/jobs-depth-phase-diagnostics.ts:75` — `const observedFetch`: verify one delegate call and unchanged response/error identity with no body or input inspection.
- `tests/support/jobs-depth-phase-diagnostics.ts:127` — `const freeze`: verify copied request records and phase preservation when request capture fails.
- `tests/unit/support/jobs-depth-phase-diagnostics.test.ts:199` — `actual authenticated factory`: inspect the actual-source noninterference proof.
- `tests/unit/support/jobs-depth-phase-diagnostics.test.ts:218` — `actual installed Vitest`: inspect native timeout/rejection/pass transport and late-freeze evidence.

## Independent review result

Independent GPT-6.1 Sol High inspected the actual six-path change, including
fetch delegation, the two-header numeric privacy boundary, copied abort freeze,
request-only failure isolation, default factory options, overload/map
compatibility, and preservation of original assertions, ordering, timeout and
cleanup. Verdict: GO, no actionable defect. The reviewer independently reran
the 12 focused units: 12 passed, zero failed or skipped, and verified the
author's native synthetic receipt above (two deliberate failures, one pass,
zero pending). The five TypeScript source identities remain frozen. This
verdict qualifies the bounded diagnostic implementation, not a backend cause,
successful integration, another CI run, publication, merge or deployment.
