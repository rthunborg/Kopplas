import test from "node:test";
import assert from "node:assert/strict";
import { openResolutionReceipt,sealResolutionReceipt,signResolution,RESOLUTION_FIELDS,type ResolutionClaims } from "@/server/bookings/conflict-resolution-attestation";
import { sealSeriesReceipt,SERIES_CLAIM_FIELDS,type SeriesClaims } from "@/server/bookings/series-attestation";
import { sealEditorReceipt } from "@/server/bookings/editor-preview";
import { CONFLICT_CLAIM_FIELDS,type ConflictClaims,signConflictOutput } from "@/server/bookings/conflict-attestation";
test("AC8 resolver encrypted receipt round-trip, tamper rejection and genuine editor/series proof separation",()=>{
  const claims=Object.fromEntries(RESOLUTION_FIELDS.map(k=>[k,`bound:${k}`])) as ResolutionClaims;
  const secret="synthetic-unit-domain-key",value={claims,planDigest:"exact-plan"};
  assert.deepEqual(openResolutionReceipt(sealResolutionReceipt(value,secret),secret),value);
  const receipt=sealResolutionReceipt(value,secret),bytes=Buffer.from(receipt,"base64url");bytes[29]=bytes[29]!^1;
  assert.throws(()=>openResolutionReceipt(bytes.toString("base64url"),secret));
  const single=Object.fromEntries(CONFLICT_CLAIM_FIELDS.map(k=>[k,claims[k]])) as unknown as ConflictClaims;
  assert.throws(()=>openResolutionReceipt(sealEditorReceipt({...single,groups:[]},secret),secret));
  assert.throws(()=>openResolutionReceipt(sealSeriesReceipt({claims:Object.fromEntries(SERIES_CLAIM_FIELDS.map(k=>[k,"bound"])) as SeriesClaims,groups:[]},secret),secret));
  assert.notEqual(signResolution(claims,"[]",secret),signConflictOutput(single,"[]",secret));
});
