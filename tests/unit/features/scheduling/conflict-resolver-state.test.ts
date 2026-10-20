import test from "node:test";
import assert from "node:assert/strict";
import { resolverAttemptAfter,currentResolverResponse } from "@/features/scheduling/conflict-resolver-state";
test("AC8 unknown outcome retains exact request identity and older read response cannot replace latest",()=>{
  const request={commandId:crypto.randomUUID(),reason:"unsent draft"};
  const unknown=resolverAttemptAfter({request,status:"pending"},"unknown");
  assert.equal(unknown.request,request);assert.equal(unknown.status,"unknown");
  assert.equal(resolverAttemptAfter(unknown,"success").status,"confirmed");
  assert.equal(currentResolverResponse(3,2),false);assert.equal(currentResolverResponse(3,3),true);
});
