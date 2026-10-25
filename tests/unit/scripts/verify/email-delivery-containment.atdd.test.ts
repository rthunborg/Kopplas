/* eslint-disable @typescript-eslint/no-explicit-any */
import assert from "node:assert/strict";
import { describe, test } from "node:test";
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";

async function loadContainmentChecker(): Promise<any> {
  return import(["../../../../scripts/verify/check-service-role-containment.mjs"].join(""));
}

describe("Story 13.4 delivery and public-shell containment (ATDD RED)", () => {
  test("[P0][13.4-STATIC-001] allows the provider adapter only in server email modules and rejects credentials or adapter imports from client paths", async () => {
    const { verifyServiceRoleContainment } = await loadContainmentChecker();
    const result = await verifyServiceRoleContainment({ root: process.cwd(), allowlist: ["src/server/email/provider.ts"] });
    assert.deepEqual(result.violations, []);
    assert.deepEqual(result.allowedUsages, ["src/server/email/provider.ts"]);
  });

  test("[P1][13.4-STATIC-002] keeps the public unsubscribe route free of app shell, tenant context, session, navigation, and provider imports", async () => {
    const { verifyPublicRouteImports } = await loadContainmentChecker();
    const result = await verifyPublicRouteImports({ root: process.cwd(), route: "src/app/(public)/unsubscribe" });
    assert.deepEqual(result.violations, []);
    assert.doesNotMatch(JSON.stringify(result.imports), /app-shell|tenant-context|session|navigation|provider/i);
  });
});

test("15.5 transitive feed containment rejects hidden cookie, auth and privileged dependencies", async () => {
  const { scanCalendarFeedImports } = await loadContainmentChecker(), root = mkdtempSync(join(tmpdir(),"calendar-feed-containment-"));
  const route = "src/app/(public)/calendar/feed";
  try {
    mkdirSync(join(root,route),{recursive:true});mkdirSync(join(root,"src/server"),{recursive:true});
    writeFileSync(join(root,route,"route.ts"),'import { read } from "@/server/feed"; export const GET=read;');
    writeFileSync(join(root,"src/server/feed.ts"),'export { read } from "./hidden";');
    writeFileSync(join(root,"src/server/hidden.ts"),'export function read(){ return "safe"; }');
    assert.deepEqual(scanCalendarFeedImports({root}).violations,[]);
    for(const source of ['import { cookies } from "next/headers"; export const read=cookies;', 'export { read } from "@/server/auth/resolve-tenant-context";', 'import "next/headers"; export const read=()=>null;', 'export const read=()=>import("next/headers");', 'export const read=()=>require("next/headers");', 'export const read=()=>import(chosenPath);', 'export const read=()=>process.env.SUPABASE_SERVICE_ROLE_KEY;', 'export const read=()=>client.auth.getUser();']) {
      writeFileSync(join(root,"src/server/hidden.ts"),source);
      assert.ok(scanCalendarFeedImports({root}).violations.length>0,"transitive forbidden dependency escaped detection");
    }
  } finally {rmSync(root,{recursive:true,force:true});}
});
