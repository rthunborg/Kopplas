import ts from "typescript";
import fs from "node:fs";import path from "node:path";import crypto from "node:crypto";
const root=process.cwd(),files=["tests/integration/commands/calendar-feed.int.test.ts","tests/integration/calendar-feed/public-feed.int.test.ts"];
const result=files.map(file=>{const raw=fs.readFileSync(path.join(root,file)),sf=ts.createSourceFile(file,raw.toString(),ts.ScriptTarget.Latest,true);const calls=[];
function visit(n){if(ts.isCallExpression(n)&&ts.isIdentifier(n.expression)&&n.expression.text==="withCalendarFeedFixture"){
let parent=n.parent;const awaited=ts.isAwaitExpression(parent);let catches=0,functions=0,testCase=null;
for(let a=n.parent;a;a=a.parent){if(ts.isTryStatement(a)&&a.catchClause){let c=n;while(c.parent&&c.parent!==a)c=c.parent;if(c===a.tryBlock)catches++;}
if(ts.isFunctionLike(a)){functions++;const c=a.parent;if(ts.isCallExpression(c)&&c.arguments.includes(a)){const id=c.arguments[0];if(ts.isStringLiteral(id))testCase=id.text;break;}}}
calls.push({line:sf.getLineAndCharacterOfPosition(n.getStart()).line+1,awaited,outer_catches_before_test_callback:catches,callback_depth:functions,test_id:testCase?.match(/15\.5-(?:INT|API)\d{3}/)?.[0]??null});}ts.forEachChild(n,visit);}visit(sf);
return {path:file,bytes:raw.length,sha256:crypto.createHash("sha256").update(raw).digest("hex"),calls};});
if(result.some(x=>x.calls.length===0||x.calls.some(c=>!c.awaited||c.outer_catches_before_test_callback!==0||c.callback_depth!==1||!c.test_id)))throw new Error("C4_CALLER_BOUNDARY_NOT_PROVEN");
console.log(JSON.stringify({kind:"STATIC_TYPESCRIPT_AST_ONLY",actual_source_modules_executed:0,outer_catch_not_present_in_current_34_serial_fixture_call_sites:true,files:result,limitation:"No general proof against future helper replacement, monkeypatch, outer test wrapper, or catch added later. Preserve direct-await/unswallowed caller contract with a targeted control."},null,2));
