import test from "node:test";
import assert from "node:assert/strict";
import { resolverAttemptAfter,currentResolverResponse,resolverAttemptForFailure,resolverOutcomeNotice } from "@/features/scheduling/conflict-resolver-state";
test("AC8 unknown outcome retains exact request identity and older read response cannot replace latest",()=>{
  const request={commandId:crypto.randomUUID(),reason:"unsent draft"};
  const unknown=resolverAttemptAfter({request,status:"pending"},"unknown");
  assert.equal(unknown.request,request);assert.equal(unknown.status,"unknown");
  assert.equal(resolverAttemptAfter(unknown,"success").status,"confirmed");
  assert.equal(currentResolverResponse(3,2),false);assert.equal(currentResolverResponse(3,3),true);
});
test("R1-03 first definite denial releases the form but denied retry retains an already unknown identity",()=>{
 const pending={request:{commandId:"exact"},status:"pending" as const};
 for(const code of ["UNAUTHENTICATED","TENANT_MEMBERSHIP_REQUIRED","PERMISSION_DENIED","TENANT_ACCESS_DENIED"]){assert.equal(resolverAttemptForFailure(pending,code,false),null);assert.equal(resolverAttemptForFailure(pending,code,true)?.request,pending.request);}
 assert.equal(resolverAttemptForFailure(pending,"SERVER_ERROR",false)?.status,"unknown");assert.equal(resolverAttemptForFailure(pending,"PREVIEW_STALE",false),null);
});
test("R1-12 remaining result has an explicit truthful notice, distinct from resolution",()=>{
 assert.equal(resolverOutcomeNotice("remaining"),"Bokningen har ändrats. Den valda konflikten finns fortfarande kvar.");assert.notEqual(resolverOutcomeNotice("remaining"),resolverOutcomeNotice("resolved"));
});
