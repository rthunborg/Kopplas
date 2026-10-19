import {test} from "node:test";
import assert from "node:assert/strict";
import {validateJobCardInput} from "@/features/jobs/job-card-domain";
import {signJobCardOutput} from "@/server/commands/jobs/card-proof";
import {verifyConflictOutput, type ConflictClaims} from "@/server/bookings/conflict-attestation";
const customer = "16010000-0000-4000-8000-000000000001";
const input = {commandId: customer, customer_id: customer, facility_id: customer, contact_id: customer,
  title: "Work", requiredWorkRoleIds: null, accessWindows: null, dependencyJobIds: []};
test("16.1-U01 enriched input rejects identity, money, tenant and malformed children without coercion", () => {
  assert.equal(validateJobCardInput(input,"create").valid,true);
  for (const patch of [{tenant_id:customer},{accepted_price_ore:1},{actorId:customer},{facility_id:null},
    {requiredWorkRoleIds:[customer,customer]}, {dependencyJobIds:["foreign-shape"]},
    {accessWindows:[{startsAt:"2026-10-12T07:00:00Z",endsAt:"2026-10-12T06:00:00Z"}]},
    {earliest_date:"2026-10-14",latest_date:"2026-10-12"}, {type:"projekt"},
    {locationOverride:{street:"",city:"Stockholm",countryCode:"SE"}},
    {customer_presence_required:"yes"}, {estimated_duration_minutes:1.1}])
    assert.equal(validateJobCardInput({...input,...patch},"create").valid,false,JSON.stringify(patch));
});
test("16.1-U07 unknown and recorded-empty are distinct normalized values", () => {
  const unknown = validateJobCardInput(input,"create");
  const empty = validateJobCardInput({...input,requiredWorkRoleIds:[],accessWindows:[]},"create");
  assert.equal(unknown.valid,true); assert.equal(empty.valid,true);
  if (!unknown.valid || !empty.valid) throw new Error("Expected valid input");
  assert.equal(unknown.value.accessWindows,null); assert.deepEqual(empty.value.accessWindows,[]);
  assert.equal(unknown.value.requiredWorkRoleIds,null); assert.deepEqual(empty.value.requiredWorkRoleIds,[]);
  assert.equal(unknown.value.priority,"normal");
});
test("16.1-U09 job-card signatures cannot be used as booking output signatures", () => {
  const claims: ConflictClaims = {tenantId:customer,actorId:customer,operation:"update",commandId:customer,
    bookingId:customer,candidateDigest:"candidate",factDigest:"facts",engineVersion:"booking-conflicts-v3",
    configVersion:"stockholm-capacity-v1",correlationId:customer,keyId:"test_v1",issuedAt:"issued",expiresAt:"expires"};
  const signature = signJobCardOutput(claims,"[]","synthetic-unit-secret");
  assert.equal(verifyConflictOutput(claims,"[]","synthetic-unit-secret",signature),false);
  assert.notEqual(signature,signJobCardOutput({...claims,actorId:"other"},"[]","synthetic-unit-secret"));
  assert.notEqual(signature,signJobCardOutput(claims,"[{}]","synthetic-unit-secret"));
});
