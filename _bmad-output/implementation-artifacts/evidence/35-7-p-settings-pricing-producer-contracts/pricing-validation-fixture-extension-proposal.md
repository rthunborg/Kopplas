# Supplementary pricing-validator fixture extension — proposal only

Exact path: `tests/unit/server/commands/pricing-validation-edges.test.ts`; SHA-256 `02c9eb1fede410ff04c1bd10fe2bf77b634477c03bf65da21011ef87e117d9f6`. Source remains untouched.

BEFORE: Existing supplementary pure-validator fixtures omit operationId/targetId/expectedRevision; five positive cases now reject under the approved mandatory protocol. WorkRole UPDATE exact expected-key list currently includes only four business keys.

AFTER: Only local fixture preparation: alias imports of the two actual pricing validators, add one pure protocolFixture(raw) preserving primitives and every business value while adding a fixed valid operation UUID, target UUID equal existing valid id for updates or fixed proposed target for creates, and fixed valid expected revision for updates/explicit null for creates. Local wrappers call actual validators with that fixture. No validated output stripping. Extend ONLY the exact WorkRole UPDATE expected-key array with operationId,targetId,expectedRevision in sorted order, retaining every current business key and exact full-set equality. All other assertions/titles/value/range/supplier checks and their outcomes stay unchanged. No production fallback, dependency, factory/global setup or money/permission change.

Actual full-unit evidence native1:3794 tests,3781 passed,12 failed,1 skipped. Five positive tests in this file reject because protocol fixtures are absent. Preserve the source log and prior five-file reviewed proposal pins; this is a separate narrow discovered delta.

Complete protocol-consumer scan retained. No runtime result, implementation review or owner approval is inferred.
