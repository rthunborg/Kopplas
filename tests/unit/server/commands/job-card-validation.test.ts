import {test} from "node:test";
import assert from "node:assert/strict";
import {prepareJobCardAccessWindow, validateJobCardInput} from "@/features/jobs/job-card-domain";
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

const loadedWindow = {
  startsAt: "2026-10-20T08:00", endsAt: "2026-10-20T16:00",
  originalStartLocal: "2026-10-20T08:00", originalEndLocal: "2026-10-20T16:00",
  originalStartsAt: "2026-10-20T06:00:00.123456+00:00", originalEndsAt: "2026-10-20T14:00:00.654321+00:00",
};
function acceptedWindow(window: ReturnType<typeof prepareJobCardAccessWindow>) {
  const result = validateJobCardInput({...input,id:customer,accessWindows:[window]},"update");
  assert.equal(result.valid,true,"actual form serializer output must satisfy the closed command validator");
  if (!result.valid) throw new Error("Expected saveable access window");
  assert.deepEqual(result.value.accessWindows,[window]);
}
test("16.4-F05 loaded database-offset access windows remain saveable with every microsecond intact", () => {
  const before = structuredClone(loadedWindow);
  assert.equal(validateJobCardInput({...input,id:customer,accessWindows:[{
    startsAt:loadedWindow.originalStartsAt,endsAt:loadedWindow.originalEndsAt}]},"update").valid,false,
    "the public command contract remains canonical Z only");
  const actual = prepareJobCardAccessWindow(loadedWindow);
  assert.deepEqual(actual,{startsAt:"2026-10-20T06:00:00.123456Z",endsAt:"2026-10-20T14:00:00.654321Z"});
  acceptedWindow(actual);assert.deepEqual(loadedWindow,before);
});
test("16.4-F05 already canonical loaded access windows preserve submillisecond precision", () => {
  const actual = prepareJobCardAccessWindow({...loadedWindow,
    originalStartsAt:"2026-10-20T06:00:00.000001Z",originalEndsAt:"2026-10-20T14:00:00.999999Z"});
  assert.deepEqual(actual,{startsAt:"2026-10-20T06:00:00.000001Z",endsAt:"2026-10-20T14:00:00.999999Z"});
  acceptedWindow(actual);
});
const foldWindow = {startsAt:"2026-10-25T02:30",endsAt:"2026-10-25T03:30",
  originalStartLocal:"2026-10-25T02:30",originalEndLocal:"2026-10-25T03:30",
  originalStartsAt:"2026-10-25T01:30:00.123456+00:00",originalEndsAt:"2026-10-25T02:30:00.654321+00:00"};
test("16.4-F05 untouched second-fold access-window instant is never reparsed to the first fold", () => {
  const actual = prepareJobCardAccessWindow(foldWindow);
  assert.deepEqual(actual,{startsAt:"2026-10-25T01:30:00.123456Z",endsAt:"2026-10-25T02:30:00.654321Z"});
  acceptedWindow(actual);
});
test("16.4-F05 each edited access-window boundary converts independently and retains the other original", () => {
  const startEdited = prepareJobCardAccessWindow({...foldWindow,startsAt:"2026-10-25T02:45"});
  assert.deepEqual(startEdited,{startsAt:"2026-10-25T00:45:00.000000Z",endsAt:"2026-10-25T02:30:00.654321Z"});
  acceptedWindow(startEdited);
  const endEdited = prepareJobCardAccessWindow({...foldWindow,endsAt:"2026-10-25T04:00"});
  assert.deepEqual(endEdited,{startsAt:"2026-10-25T01:30:00.123456Z",endsAt:"2026-10-25T03:00:00.000000Z"});
  acceptedWindow(endEdited);
});
