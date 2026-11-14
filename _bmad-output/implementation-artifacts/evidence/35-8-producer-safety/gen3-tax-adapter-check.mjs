import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
const require = createRequire(`${process.cwd()}/package.json`);
const ts = require('typescript');
// Execute the actual helper declarations, extracted by the TypeScript parser.
// The RPC and canonical source read are synthetic seams; this is not DB evidence.
function declaration(path, name) {
  const source = readFileSync(path, 'utf8');
  const parsed = ts.createSourceFile(path, source, ts.ScriptTarget.Latest, true);
  const node = parsed.statements.find(n => ts.isFunctionDeclaration(n) && n.name?.text === name);
  assert.ok(node, `Missing actual declaration ${name}`);
  return ts.transpileModule(node.getText(parsed).replace(/^export /, ''), {compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;
}
const capture = new Function(declaration('tests/integration/commands/calculation-editor-safety-fixture.ts', 'captureEditorTestIntent') + '\nreturn captureEditorTestIntent;')();
const body = declaration('tests/integration/commands/tax-answer-reconciliation.int.test.ts', 'authorizeAndCreateInitial');
const operation = '00000000-0000-4000-8000-000000000003';
const owningClient = {source: 'original-owning-fixture'};
const input = {
  tenantId:'tenant-original',calculationId:'calculation-original',capturedAt:'2026-08-04T22:30:00.000Z',
  customerId:'customer-original',facilityId:null,contactId:null,
  snapshot:{snapshotSchemaVersion:1,taxAnswerSnapshot:{hostile:'do-not-replace'}},
  lines:[{sourceRowId:'row-original',vatType:'hostile-invalid'}],
  attachments:[{fileId:'selected-file',displayName:'selected-original',sortOrder:0}],
  reviewedQuoteCaptureDate:'2026-08-04',reviewedCalculationStatus:'ready',
  reviewedReadinessRows:[{sourceRowId:'row-original',unitCostOre:1,sourceKind:null}],
  actorUserId:'actor-original',correlationId:operation,
};
function harness(authorization={data:{status:'unconfirmed',operationId:operation},error:null},created={data:{status:'committed',operationId:operation,targetAvailable:true,targetId:'version-original',quoteId:'quote-original',quoteNumber:7},error:null}) {
  const calls=[],sourceCalls=[];
  const foreignClient={rpc:async (name,args)=>{calls.push({name,args});return calls.length===1?authorization:created;}};
  const fn = new Function('fixture','client','asQuoteReviewRpcClient','buildQuoteReviewProof','captureEditorTestIntent',body+'\nreturn authorizeAndCreateInitial;')(
    {adminA:{id:'default-actor'}},owningClient,x=>x,
    async (client,args)=>{sourceCalls.push({client,args});return {reviewed_snapshot_digest:'a'.repeat(64),reviewed_quote_capture_date:'2026-08-05'};},capture,
  );
  return {calls,sourceCalls,foreignClient,run:()=>fn(foreignClient,input)};
}
test('checked INITIAL adapter binds original identity and preserves hostile review payloads',async()=>{
  const h=harness(); const result=await h.run();
  assert.deepEqual(result,{data:[{quote_id:'quote-original',quote_version_id:'version-original',quote_number:7}],error:null});
  assert.deepEqual(h.calls.map(c=>c.name),['authorize_calculation_editor_quote','create_calculation_editor_quote']);
  const auth=h.calls[0].args, create=h.calls[1].args;
  assert.equal(h.sourceCalls[0].client,owningClient);
  assert.deepEqual(h.sourceCalls[0].args,{calculationId:input.calculationId,attachmentFileIds:['selected-file'],capturedAt:input.capturedAt});
  assert.equal(auth.p_tenant_id,input.tenantId);assert.equal(auth.p_actor_user_id,input.actorUserId);assert.equal(auth.p_operation_id,operation);
  assert.deepEqual(create,{p_tenant_id:auth.p_tenant_id,p_actor_user_id:auth.p_actor_user_id,p_operation_id:operation,p_input:auth.p_input});
  assert.deepEqual(auth.p_input,{calculation_id:input.calculationId,attachment_file_ids:['selected-file'],reviewed_snapshot_digest:'a'.repeat(64),reviewed_quote_capture_date:input.reviewedQuoteCaptureDate,operation_id:operation,expected:{version:1,form:'reviewed-initial-quote',reviewed_snapshot_digest:'a'.repeat(64),reviewed_quote_capture_date:input.reviewedQuoteCaptureDate,attachment_file_ids:['selected-file']}});
  assert.deepEqual(auth.p_review,{p_calculation_id:input.calculationId,p_captured_at:input.capturedAt,p_customer_id:input.customerId,p_facility_id:null,p_contact_id:null,p_snapshot:input.snapshot,p_lines:input.lines,p_attachments:input.attachments,p_reviewed_quote_capture_date:input.reviewedQuoteCaptureDate,p_reviewed_calculation_status:input.reviewedCalculationStatus,p_reviewed_readiness_rows:input.reviewedReadinessRows});
  assert.equal(auth.p_review.p_snapshot,input.snapshot);assert.equal(auth.p_review.p_lines,input.lines);assert.equal(auth.p_review.p_attachments,input.attachments);assert.equal(auth.p_review.p_reviewed_readiness_rows,input.reviewedReadinessRows);
});
test('authorization rejection is returned unchanged without creating',async()=>{
  const denied={data:null,error:{code:'23514',message:'original hostile review error'}};
  const h=harness(denied);assert.equal(await h.run(),denied);assert.equal(h.calls.length,1);
});
test('creator rejection is returned unchanged',async()=>{
  const denied={data:null,error:{code:'42501',message:'original tenant denial'}};
  const h=harness(undefined,denied);assert.equal(await h.run(),denied);assert.equal(h.calls.length,2);
});
for(const [name,patch] of [
 ['prepared',{status:'prepared'}],['closed',{status:'closed'}],['unconfirmed',{status:'unconfirmed'}],
 ['different operation',{operationId:'different'}],['unavailable target',{targetAvailable:false}],
 ['missing version',{targetId:null}],['missing quote',{quoteId:null}],['missing number',{quoteNumber:null}],
 ['unsafe number',{quoteNumber:Number.MAX_SAFE_INTEGER+1}],
]) test(`never maps ${name} to success`,async()=>{
  const proof={status:'committed',operationId:operation,targetAvailable:true,targetId:'version-original',quoteId:'quote-original',quoteNumber:7,...patch};
  await assert.rejects(harness(undefined,{data:proof,error:null}).run(),/did not confirm/);
});
