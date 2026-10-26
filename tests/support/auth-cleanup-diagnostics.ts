/** Fixed, test-only Auth cleanup diagnostics. No error message/body/cause is read. */
const AUTH_CLASSES = new Map([
  ["AuthApiError", "api-error"],
  ["AuthRetryableFetchError", "retryable-fetch"],
  ["AuthUnknownError", "unknown-auth"],
]);
const AUTH_CODES = new Set([
  "unexpected_failure", "user_not_found", "over_request_rate_limit",
  "request_timeout", "bad_jwt", "not_admin", "no_authorization",
  "validation_failed", "conflict",
]);
function ownData(error: unknown, key: "name" | "status" | "code"): unknown {
  if ((typeof error !== "object" || error === null) && typeof error !== "function") return undefined;
  try {
    const property = Object.getOwnPropertyDescriptor(error, key);
    return property && Object.hasOwn(property, "value") ? property.value : undefined;
  } catch { return undefined; }
}
export function authCleanupFailure(error: unknown): Error {
  const name = ownData(error, "name"), status = ownData(error, "status"), code = ownData(error, "code");
  const category = typeof name === "string" ? AUTH_CLASSES.get(name) ?? "unclassified" : "unclassified";
  const httpStatus = typeof status === "number" && Number.isInteger(status) && (status === 0 || status >= 400 && status <= 599) ? String(status) : "unavailable";
  const authCode = typeof code === "string" ? AUTH_CODES.has(code) ? code : "other" : "unavailable";
  const failure = new Error(`Fixture Auth deletion failed [class=${category};status=${httpStatus};code=${authCode}]`);
  failure.name = "FixtureAuthCleanupError";
  return failure;
}
