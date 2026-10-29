/**
 * Story 35.2 actual TSX caller tests. Client/router seams and React hook storage
 * are isolated using the existing booking-series-editor unit-test pattern.
 * These are NOT browser event, cookie, server-authorization or provider proofs.
 * The pending-guard case was confirmed RED before implementing the guard.
 */
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { runInNewContext } from "node:vm";
import ts from "typescript";

type Node = { type: unknown; props: Record<string, unknown> };
type Credentials = { email: string; password: string };
type AuthResult = { error: null | { message: string; code?: string; name?: string; status?: number } };
type SignIn = (credentials: Credentials) => Promise<AuthResult>;
const EMAIL = "existing-user@example.invalid";
const PASSWORD = "synthetic-unit-password";

function nodes(value: unknown): Node[] {
  if (Array.isArray(value)) return value.flatMap(nodes);
  if (!value || typeof value !== "object" || !("props" in value)) return [];
  const node = value as Node;
  return [node, ...nodes(node.props.children)];
}

function harness(signIn: SignIn) {
  const require = createRequire(import.meta.url);
  const cells: unknown[] = [];
  const calls: Credentials[] = [];
  const navigation: string[] = [];
  let cursor = 0;
  let tree: Node;
  const hooks = {
    // Browser effects/focus are verified by E2E; this harness isolates the handler.
    useEffect() {},
    useState(initial: unknown) {
      const index = cursor++;
      if (!(index in cells)) cells[index] = initial;
      return [cells[index], (next: unknown) => {
        cells[index] = typeof next === "function"
          ? (next as (previous: unknown) => unknown)(cells[index]) : next;
      }];
    },
    useRef(initial: unknown) {
      const index = cursor++;
      return cells[index] ?? (cells[index] = { current: initial });
    },
  };
  const modules: Record<string, unknown> = {
    react: hooks,
    "next/navigation": { useRouter: () => ({
      refresh: () => navigation.push("refresh"),
      replace: (destination: string) => navigation.push(`replace:${destination}`),
    }) },
    "@/server/db/supabase-browser-client": { createSupabaseBrowserClient: () => ({
      auth: { signInWithPassword: (input: Credentials) => {
        calls.push({ ...input });
        return signIn(input);
      } },
    }) },
  };
  const compiledModule = { exports: {} as { default?: () => Node } };
  const output = ts.transpileModule(
    readFileSync("src/app/(auth)/login/page.tsx", "utf8"),
    { compilerOptions: { module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } },
  ).outputText;
  runInNewContext(output, { module: compiledModule, exports: compiledModule.exports,
    require: (name: string) => modules[name] ?? require(name) });
  const Login = compiledModule.exports.default!;
  function render() { cursor = 0; tree = Login(); }
  function find(predicate: (node: Node) => boolean) {
    const found = nodes(tree).find(predicate);
    assert.ok(found, "Expected actual login control");
    return found;
  }
  function field(name: string) { return find(node => node.type === "input" && node.props.name === name); }
  function fill(name: string, value: string) {
    (field(name).props.onChange as (event: unknown) => void)({ target: { value } });
    render();
  }
  function submit() {
    return (find(node => node.type === "form").props.onSubmit as
      (event: { preventDefault: () => void }) => Promise<void>)({ preventDefault() {} });
  }
  render();
  return { render, field, fill, submit, calls, navigation,
    action: () => find(node => node.type === "button" && node.props.type === "submit"),
    reconciliation: () => find(node => node.type === "a" && node.props.href === "/"),
    alerts: () => nodes(tree).filter(node => node.props.role === "alert") };
}

test("[35.2][P1] E35-2-T-loading/submitting/confirmed: one active form attempt then refresh before root replace", async () => {
  // Given the actual form and a held imported Auth promise.
  let resolve!: (value: AuthResult) => void;
  const pending = new Promise<AuthResult>(done => { resolve = done; });
  const h = harness(() => pending);
  h.fill("email", EMAIL);
  h.fill("password", PASSWORD);
  const first = h.submit();
  const sameTurnRepeat = h.submit();
  h.render();
  assert.equal(h.action().props.disabled, true);
  assert.equal(h.action().props.children, "Loggar in…");
  assert.equal(h.field("email").props.value, EMAIL);
  assert.equal(h.field("password").props.value, PASSWORD);
  assert.deepEqual(h.navigation, []);
  // When another form submission arrives while the same sign-in is unresolved.
  const pendingRepeat = h.submit();
  try {
    assert.equal(h.calls.length, 1, "Repeated form gestures must not dispatch overlapping sign-ins");
  } finally {
    resolve({ error: null });
    await Promise.all([first, sameTurnRepeat, pendingRepeat]);
  }
  // Then success refreshes server-visible session state before root navigation.
  assert.deepEqual(h.navigation, ["refresh", "replace:/"]);
  await h.submit();
  assert.equal(h.calls.length, 1, "Successful navigation stays guarded until the page leaves");
});

for (const failure of ["invalid", "validation", "rate-limit", "connection", "returned-transport", "transport-with-rejection-code", "unknown-provider"] as const) {
  test(`[35.2][P1] E35-2-T-validation/denied/connection-required/error-retry: ${failure} retains input and permits explicit recovery`, async () => {
    // Given a definite failed imported Auth attempt, followed by explicit success.
    let attempts = 0;
    const h = harness(async () => {
      if (++attempts > 1) return { error: null };
      if (failure === "connection") throw new Error("synthetic transport detail must stay private");
      return { error: {
        message: "synthetic provider account detail must stay private",
        ...(["invalid", "validation", "rate-limit"].includes(failure) ? {
          name: "AuthApiError", code: failure === "invalid" ? "invalid_credentials"
            : failure === "validation" ? "validation_failed" : "over_request_rate_limit",
          status: failure === "rate-limit" ? 429 : 400,
        }
          : failure === "returned-transport" ? { name: "AuthRetryableFetchError", status: 0 }
          : failure === "transport-with-rejection-code" ? { name: "AuthRetryableFetchError", code: "validation_failed", status: 0 }
          : { name: "AuthUnknownError" }),
      } };
    });
    h.fill("email", EMAIL);
    h.fill("password", PASSWORD);
    // When the real handler receives the failed result.
    await h.submit();
    h.render();
    const message = String(h.alerts()[0]?.props.children);
    assert.equal(h.alerts().length, 1);
    const definite = ["invalid", "validation", "rate-limit"].includes(failure);
    assert.equal(message, failure === "invalid" ? "Fel e-post eller lösenord. Försök igen."
      : failure === "validation" ? "Inloggningen avvisades. Kontrollera dina uppgifter och försök igen."
      : failure === "rate-limit" ? "För många inloggningsförsök. Vänta en stund och försök igen."
      : "Inloggningen kunde inte bekräftas. Kontrollera inloggningen innan du försöker igen.");
    assert.equal(h.action().props.disabled, !definite);
    assert.equal(h.field("email").props.value, EMAIL);
    assert.equal(h.field("password").props.value, PASSWORD);
    assert.equal(h.field("email").props["aria-describedby"], "login-error");
    assert.equal(h.field("password").props["aria-describedby"], "login-error");
    assert.deepEqual(h.navigation, []);
    assert.equal(h.calls.length, 1, "A failed sign-in is never retried automatically");
    if (!definite) {
      assert.equal(h.reconciliation().props.children, "Kontrollera inloggningen");
      await h.submit();
      assert.equal(h.calls.length, 1, "Unconfirmed outcomes require ordinary server reconciliation before retry");
      // An isolated TSX harness cannot execute the root/session reconciliation.
      return;
    }
    // Then correction/waiting requires another explicit gesture; no automatic retry.
    h.fill("email", `corrected-${EMAIL}`);
    h.fill("password", `${PASSWORD}-corrected`);
    await h.submit();
    h.render();
    assert.equal(h.calls.length, 2);
    assert.equal(h.calls[1].email, `corrected-${EMAIL}`);
    assert.equal(h.calls[1].password, `${PASSWORD}-corrected`);
    assert.equal(h.alerts().length, 0);
    assert.deepEqual(h.navigation, ["refresh", "replace:/"]);
  });
}

test("[35.2][P1] E35-2-T-unknown: response loss claims neither confirmed login nor invalid credentials and never auto-retries", async () => {
  // Given dispatch has occurred, but its response is lost. This fake cannot
  // determine whether Auth issued a session or a cookie reached the browser.
  let loseResponse!: (reason: Error) => void;
  const pending = new Promise<AuthResult>((_, reject) => { loseResponse = reject; });
  const h = harness(() => pending);
  h.fill("email", EMAIL);
  h.fill("password", PASSWORD);
  const attempt = h.submit();
  assert.equal(h.calls.length, 1);
  // When the existing imported seam rejects after dispatch.
  loseResponse(new Error("synthetic response loss"));
  await attempt;
  h.render();
  // Then no client success, credential denial or automatic replay is asserted.
  assert.equal(h.alerts().length, 1);
  assert.equal(String(h.alerts()[0].props.children), "Inloggningen kunde inte bekräftas. Kontrollera inloggningen innan du försöker igen.");
  assert.deepEqual(h.navigation, []);
  assert.equal(h.calls.length, 1);
  assert.equal(h.field("email").props.value, EMAIL);
  assert.equal(h.field("password").props.value, PASSWORD);
  assert.equal(h.action().props.disabled, true);
  assert.equal(h.reconciliation().props.href, "/");
  await h.submit();
  assert.equal(h.calls.length, 1);
  // Real response-loss/reload reconciliation through server context is pending;
  // no new receipt, issuance guarantee or automatic retry protocol is specified.
});
