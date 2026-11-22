import {readFileSync} from 'node:fs';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import assert from 'node:assert/strict';
import test from 'node:test';
import {preflightEditorForm,parseUpdateTaxInputForm} from '@/features/calculations/form-parsing';
const require=createRequire(`${process.cwd()}/package.json`),ts=require('typescript');
const path='tests/e2e/calculations/calculation-mutation-safety.e2e.spec.ts';
const before=execFileSync('git',['show',`3b69b66495131feb90f3aa666244ec9a85898bef:${path}`],{encoding:'utf8'}),current=readFileSync(path,'utf8');
function callback(source,title){const parsed=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true);const statement=parsed.statements.find(node=>ts.isExpressionStatement(node)&&ts.isCallExpression(node.expression)&&node.expression.arguments[0]?.text===title);assert.ok(statement,'Missing actual browser test');return{parsed,node:statement.expression.arguments[1]};}
function compile(body){return ts.transpileModule(body,{compilerOptions:{target:ts.ScriptTarget.ES2022}}).outputText;}
const taxTitle='P-6 tax pending A revalidation preserves controlled allowance membership and newer B draft';
async function taxFixture(source){const{parsed,node}=callback(source,taxTitle);const selected=[];for(const statement of node.body.statements){const text=statement.getText(parsed);if(/^let held=/.test(text))break;if(/^await form\.getByLabel/.test(text))selected.push(text);}
 const data=new FormData(),id='10000000-0000-4000-8000-000000000001';for(const[k,v]of Object.entries({id,document_vat_type:'STANDARD_VAT_25',deduction_choice:'NONE',green_basis_method:'ACTUAL_ELIGIBLE_COSTS',genuine_fixed_price:'false',operation_id:id,expected:JSON.stringify({version:1,form:'tax_input',header:{id,title:'Original',status:'draft',archived_at:null,tax_input_snapshot:null}})}))data.set(k,v);
 const names={'Skatteavdrag':'deduction_choice','Betalningsdatum för ROT':'payment_date','Person 1: ROT kvar (kr)':'person_1_rot_remaining_kronor','Person 1: ROT/RUT kvar (kr)':'person_1_combined_rot_rut_remaining_kronor'};
 const form={getByLabel(label){assert.ok(names[label],`Unexpected actual fixture label ${label}`);return{fill:async value=>data.set(names[label],value),selectOption:async value=>data.set(names[label],value)};}};
 await new Function('form',compile(`return (async()=>{${selected.join('\n')}})();`))(form);return{data,preflight:preflightEditorForm(data),parsed:parseUpdateTaxInputForm(data)};
}
test('actual tax browser setup now passes real preflight with a paired ROT/combined allowance',async()=>{
 const old=await taxFixture(before);assert.equal(old.preflight.ok,false,'original fixture must demonstrate nonadmission');
 const fixed=await taxFixture(current);assert.deepEqual(fixed.preflight,{ok:true});assert.equal(fixed.data.get('payment_date'),'2026-11-13');assert.deepEqual(fixed.parsed.input.tax_input_snapshot.personAllowanceSlots,[{slot:'PERSON_1',remainingRotAllowanceOre:100000,remainingCombinedRotRutAllowanceOre:200000}]);
});
const abcTitle='P-6 pending A then draft B cannot adopt concurrent C facts on a later server refresh';
async function stage(source,{failFetch=false}={}){
 let routeHandler,routeTask,completed=false,fulfilled=false,fetchStarted,releaseFetch,failUpstream,navigationBeforeCommit=false,navigations=0,bAtNavigation=false,mainTitle='';
 const started=new Promise(resolve=>fetchStarted=resolve),response=new Promise((resolve,reject)=>{releaseFetch=()=>{completed=true;resolve({actualUpstreamResponse:true});};failUpstream=reject;});
 const request={method:()=> 'POST',headers:()=>({'next-action':'actual-action'}),postData:()=> 'operation_id'};
 const route={request:()=>request,continue:async()=>{},fetch:()=>{fetchStarted();return response;},fulfill:async({response})=>{assert.equal(response.actualUpstreamResponse,true);fulfilled=true;}};
 const locator={getByLabel:()=>({fill:async value=>{mainTitle=value;}}),getByRole:()=>locator,getByText:()=>locator,getByTestId:()=>locator,click:async()=>{if(!routeTask){routeTask=routeHandler(route);routeTask.catch(()=>{});}}};
 const otherForm={...locator,getByRole:()=>({...locator,click:async()=>{}}),getByLabel:()=>({fill:async()=>{}})};
 const other={goto:async()=>{navigations++;navigationBeforeCommit||=!completed;bAtNavigation=mainTitle.startsWith('B ');assert.equal(fulfilled,false,'client response must remain held before C');},reload:async()=>{},close:async()=>{}};
 const page={route:async(_pattern,handler)=>{routeHandler=handler;},getByTestId:()=>locator,getByRole:()=>locator};
 const expected=()=>({toHaveAttribute:async()=>{},toBeVisible:async()=>{},toHaveValue:async()=>{},toContainText:async()=>{},toHaveCount:async()=>{}});expected.poll=fn=>({toBe:async value=>assert.equal(fn(),value)});
 const{parsed,node}=callback(source,abcTitle);
 const fn=new Function('ownCalculation','headerForm','page','context','expect','addSection',compile(`const run=${node.getText(parsed)};return run;`))(async()=> 'http://local/calculations/id',candidate=>candidate===other?otherForm:locator,page,{newPage:async()=>other},expected,async()=>{});
 const body=fn({page,context:{newPage:async()=>other}});body.catch(()=>{});
 await started;await new Promise(resolve=>setImmediate(resolve));
 const beforeRelease=navigations;
 if(failFetch){const error=new Error('synthetic actual upstream failure');failUpstream(error);await assert.rejects(body,reason=>reason===error);await assert.rejects(routeTask,reason=>reason===error);assert.equal(navigations,0);return;}
 releaseFetch();await body;await routeTask;return{beforeRelease,navigations,navigationBeforeCommit,bAtNavigation,fulfilled};
}
test('actual A/B/C browser body waits for upstream completion while client A stays held',async()=>{
 const old=await stage(before);assert.equal(old.navigationBeforeCommit,true,'original test only established interception');
 const fixed=await stage(current);assert.equal(fixed.beforeRelease,0);assert.equal(fixed.navigationBeforeCommit,false);assert.equal(fixed.navigations,1);assert.equal(fixed.bAtNavigation,true);assert.equal(fixed.fulfilled,true);
});
test('actual A/B/C browser body and route propagate a failed upstream response',async()=>{await stage(current,{failFetch:true});});
