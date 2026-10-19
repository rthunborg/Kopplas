import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { createHash } from "node:crypto";
import ts from "typescript";
const paths = ["_bmad-output/test-artifacts/tea-atdd-api-tests-2026-10-19-story15-2.json", "_bmad-output/test-artifacts/tea-atdd-e2e-tests-2026-10-19-story15-2.json"];
const workers = paths.map(path => { const value = JSON.parse(readFileSync(path,"utf8")); if (!value.success || value.tdd_phase !== "RED") throw new Error("Worker failed"); for (const item of [...value.tests,...(value.support_files ?? [])]) { const current = readFileSync(item.file,"utf8"); if (item.content && current !== item.content) throw new Error("JSON/disk mismatch: "+item.file); } return {path, value}; });
const files = [
 "tests/integration/commands/booking-series.int.test.ts","tests/integration/rls/booking-series.rls.test.ts",
 "tests/e2e/booking-series.e2e.spec.ts","tests/integration/components/booking-series.test.ts",
 "tests/unit/features/scheduling/recurrence.test.ts","tests/unit/features/resources/booking-series-state.test.ts",
 "tests/support/booking-series-atdd.ts","tests/e2e/support/booking-series-atdd.ts","tests/support/booking-series-unit-atdd.ts",
 "tests/fixtures/golden/scheduling/recurrence.json"
];
const records = files.map(path => { const text=readFileSync(path,"utf8"); let registrations=0; let active=0; if (path.endsWith(".ts")) { const source=ts.createSourceFile(path,text,ts.ScriptTarget.Latest,true); const visit=node=>{if(ts.isCallExpression(node)){const expression=node.expression.getText(source); if(expression==="test.skip") registrations++; if(expression==="test"||expression==="it"||expression==="test.only"||expression==="it.only")active++;} ts.forEachChild(node,visit);}; visit(source); if(active)throw new Error("Active canonical tests: "+path); if(text.includes("expect(true).toBe(true)"))throw new Error("Placeholder assertion"); } return {path,lines:text.trimEnd().split("\n").length,skipRegistrationSites:registrations,activeRegistrationSites:active,sha256:createHash("sha256").update(text).digest("hex")}; });
const summary={story:"15.2",workflow:"bmad-testarch-atdd",phase:"RED",sourceHead:"eb3da24daf45a13e2a29fffb020d4cd9c0c65879",executionMode:"subagent",workers:workers.map(({path,value})=>({artifact:path,success:value.success,testCount:value.test_count})),canonicalFiles:records,plannedCases:{command:37,rls:14,e2e:6,ssr:7,pure:46,total:110},execution:{api:0,rls:0,e2e:0,ssr:0,pure:"pending bounded probe"},allCanonicalTestsSkipped:true,acceptancePassClaim:false};
const redReceipt = "_bmad-output/test-artifacts/story15-2/activate-receipt.json";
if (existsSync(redReceipt)) summary.execution.pure = JSON.parse(readFileSync(redReceipt, "utf8"));
summary.verificationReceipt = "_bmad-output/test-artifacts/story15-2/verification-receipt.json";
writeFileSync("_bmad-output/test-artifacts/story15-2/atdd-summary.json",JSON.stringify(summary,null,2)+"\n");
console.log(JSON.stringify({workerOutputsValid:true,canonicalFiles:records.length,activeTestSites:0,plannedCases:summary.plannedCases},null,2));

