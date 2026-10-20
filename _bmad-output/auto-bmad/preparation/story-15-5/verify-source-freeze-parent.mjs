import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
const root='C:/Users/Rasmus/.codex/worktrees/epic-15-calendar/Kopplas';
const prep='_bmad-output/auto-bmad/preparation/story-15-5';
const capsulePath=path.join(root,prep,'source-freeze.json');
const capsuleRaw=fs.readFileSync(capsulePath);const capsule=JSON.parse(capsuleRaw);
const expectedCapsule='2d1e982a10701831a71b8da9cf13ac03234b41499ad525bb8d84464910094e03';
const sha=data=>crypto.createHash('sha256').update(data).digest('hex');
const git=(args,input)=>execFileSync('git',args,{cwd:root,input,windowsHide:true,stdio:['pipe','pipe','pipe']});
const assert=(condition,label)=>{if(!condition)throw new Error(label);};
assert(sha(capsuleRaw)===expectedCapsule,'Capsule bytes mismatch');
const head=git(['rev-parse','HEAD']).toString().trim();
assert(head==='611c86295540161d31169110bf2139cf1d85d708'&&capsule.git.source_head===head,'Head mismatch');
const base='3a1c3bc9fbf22b13c926179288a8b6eefe440c12';assert(capsule.git.canonical_base===base,'Base mismatch');
const trees=new Map();
for(const revision of [base,head,...capsule.git.source_commits.map(x=>x.commit)]){if(trees.has(revision))continue;const map=new Map();for(const row of git(['ls-tree','-r','-z',revision]).toString().split('\0').filter(Boolean)){const tab=row.indexOf('\t');const oid=row.slice(0,tab).split(' ')[2];map.set(row.slice(tab+1),oid);}trees.set(revision,map);}
const changed=git(['diff','--name-only',base,head]).toString().trim().split('\n').sort();assert(JSON.stringify(changed)===JSON.stringify([...capsule.git.source_paths].sort())&&changed.length===60,'Complete source path set mismatch');
assert(git(['status','--porcelain','--untracked-files=no']).length===0,'Tracked source dirty');
assert(git(['rev-parse',`${head}^{tree}`]).toString().trim()===capsule.git.source_tree_oid,'Tree mismatch');
const errors=[];let sourceBindings=0,rawDifferences=0,artifactBindings=0,unchangedBindings=0,dependencyBindings=0;
for(const b of capsule.git.bindings){const raw=fs.readFileSync(path.join(root,b.path));const oid=git(['hash-object',`--path=${b.path}`,'--stdin'],raw).toString().trim();const normalized=git(['cat-file','blob',oid]);assert(raw.length===b.raw_worktree.bytes&&sha(raw)===b.raw_worktree.sha256,`Raw mismatch ${b.path}`);assert(oid===trees.get(head).get(b.path)&&oid===b.git_clean_normalized.blob_oid&&oid===b.head_blob.oid,`Normalized blob mismatch ${b.path}`);assert(normalized.length===b.git_clean_normalized.bytes&&sha(normalized)===b.git_clean_normalized.sha256&&sha(normalized)===b.head_blob.sha256,`Normalized byte mismatch ${b.path}`);if(sha(raw)!==sha(normalized))rawDifferences++;sourceBindings++;}
function walk(value){if(Array.isArray(value)){for(const v of value)walk(v);return;}if(!value||typeof value!=='object')return;
 if(typeof value.path==='string'&&typeof value.sha256==='string'&&typeof value.bytes==='number'){const actual=fs.readFileSync(path.join(root,value.path));assert(actual.length===value.bytes&&sha(actual)===value.sha256,`Artifact mismatch ${value.path}`);artifactBindings++;}
 if(typeof value.path==='string'&&value.baseline_blob_oid&&value.head_blob_oid){assert(trees.get(base).get(value.path)===value.baseline_blob_oid&&trees.get(head).get(value.path)===value.head_blob_oid&&value.baseline_blob_oid===value.head_blob_oid,`Unchanged binding mismatch ${value.path}`);unchangedBindings++;}
 if(typeof value.path==='string'&&value.at_receipt_blob_oid&&value.current_blob_oid){assert(trees.get(head).get(value.path)===value.current_blob_oid,'Current dependency mismatch');assert([...trees.values()].some(t=>t.get(value.path)===value.at_receipt_blob_oid),'Receipt dependency not present at any bound source checkpoint');assert(value.at_receipt_blob_oid===value.current_blob_oid,'Reused dependency changed');dependencyBindings++;}
 for(const v of Object.values(value))walk(v);
}
walk(capsule);
const specText=fs.readFileSync(path.join(root,capsule.approved_intent.spec),'utf8').replace(/\r\n/g,'\n');
const kernel=specText.match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];assert(sha(kernel??'')==='0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977','Kernel mismatch');
assert((specText.match(/^\*\*Round [123] of 3\*\*$/gm)??[]).length===3,'Round cap mismatch');
assert(capsule.inventory.current_feature_cases===95&&capsule.inventory.node_unit===30&&capsule.inventory.native_vitest===51&&capsule.inventory.browser===14&&capsule.inventory.bootstrap_unit_cases_separate.count===22&&!capsule.inventory.bootstrap_unit_cases_separate.included_in_feature95,'Inventory accounting mismatch');
assert(capsule.inventory.files.every(x=>x.missing_prepared_literal_ids.length===0&&!x.explicit_skip_or_todo_declarations),'Prepared inventory loss/explicit skip');
assert(capsule.independent_review.completed_broad_rounds===3&&capsule.independent_review.cap===3&&!capsule.independent_review.fourth_broad_round_permitted,'Review cap record mismatch');
assert(capsule.independent_review.rounds.length===3&&capsule.independent_review.rounds.every(x=>x.layers.length===6),'Original layer count mismatch');
assert(capsule.pending_native_execution.all_unexecuted&&capsule.pending_native_execution.lanes.every(x=>x.executed===0),'Unexecuted native record mismatch');
assert(capsule.development_complete===false&&capsule.release_ready===false&&capsule.not_delivery_record===true,'Premature completion claim');
assert(capsule.ownership.historical_migrations.count===109&&capsule.ownership.protected_scheduling_and_consumer_paths.length===37&&capsule.ownership.shared_additive_source_checks.every(x=>x.source_check==='PASS'),'Ownership summary mismatch');
const result={kind:'independent-build-parent-binding-check',status:'PASS',source_head:head,capsule_sha256:sha(capsuleRaw),capsule_bytes:capsuleRaw.length,source_bindings:sourceBindings,raw_normalized_differences:rawDifferences,artifact_hash_bindings:artifactBindings,unchanged_blob_bindings:unchangedBindings,reused_dependency_blob_bindings:dependencyBindings,historical_migrations:109,protected_consumers:37,kernel_sha256:sha(kernel),review_rounds:3,original_review_layers:18,inventory:{feature95:true,node:30,vitest:51,browser:14,bootstrap_separate:22},limits:'Hash/path/provenance and capsule-accounting check only. Source semantics reuse completed independent review layers and latest-fix PASS; static inventory is not installed collection; native/runtime remains unexecuted pending Root exact-head CI.',errors};
fs.writeFileSync(path.join(root,prep,'source-freeze-parent-check.json'),JSON.stringify(result,null,2)+'\n');process.stdout.write(JSON.stringify(result)+'\n');
