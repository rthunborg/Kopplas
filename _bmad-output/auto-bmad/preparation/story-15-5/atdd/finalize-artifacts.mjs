import { readdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const atdd = "_bmad-output/auto-bmad/preparation/story-15-5/atdd/";
const json = async path => JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, ""));
const [inventory, preservation, staticDiscovery, api, e2e] = await Promise.all([
  json(atdd + "scaffold-inventory.json"), json(atdd + "preservation-after.json"),
  json(atdd + "static-discovery.json"), json(atdd + "api-worker.json"), json(atdd + "e2e-worker.json"),
]);
const acPurpose = {
  AC1: "own issuance/rotation/revocation, once-only plaintext, exact self authority and audit",
  AC2: "CAS/replay/lost response/audit rollback and commit-ordered lifecycle/fetch races",
  AC3: "complete current planned own materialized events, minimal disclosure and independent dates/UIDs",
  AC4: "generic invalid capability, direct proof/override/current-authority negatives and legacy NULL positive",
  AC5: "independent 60/token and120/IP per900 seconds, DB clock/concurrency/persistence and sanitized monitoring",
  AC6: "actual fetched last-use, honest connected UI/copy/failure/phone/keyboard and Admin separation",
  AC7: "exact public preauth bypass/transitive isolation and real hostile-cookie/cache probes",
  AC8: "independent RFC5545/UTF8/DST/all-day vectors, complete large feed and atomic generic503",
  AC9: "ordinary/direct SQL ACL/RLS and existing scheduling/report/job integrity/closed-scope preservation",
};
const validation = {
  outcome: "P4-complete-RED-scaffolds-only", phase: "P4", model: "gpt-6.1-sol", effort: "high",
  approvedKernel: preservation.kernel,
  approvedRawSpec: "ce07c0361f3ab47005f326efb199443c777ae6c5c89a62650a20b9af68ee7144",
  acPurpose, actualACsMapped: Object.keys(inventory.acMapping), allACsUnproven: true,
  syntacticDeclarations: inventory.totalDeclarations, declarationsByClass: inventory.declarationsByClass,
  plannedExpandedCases: { unit: 22, lifecycle: 14, publicHTTP: 20, rls: 12, component: 4, e2e: 11, total: 83 },
  parameterizationTruth: "Unit 21 declarations expand to22 native registrations; E2E9 declarations expand to11 list-only cases; all inner vector loops are assertion vectors, not separately credited cases.",
  nativeUnitDiscovery: { exit: 0, registered: 22, executed: 0, passed: 0, failed: 0, skipped: 22, todo: 0 },
  nativeREDProbe: { exit: 1, registered: 3, executed: 1, passed: 0, failed: 1, failedBeforeAssertions: 1,
    skipped: 2, error: "ENOENT missing approved public route source", storedScaffoldsRemainSkipped: true },
  vitestDiscovery: { mode: "glob + staticParse only", modules: staticDiscovery.modules.length,
    setupExecuted: false, testBodiesExecuted: 0, runtimePartitionEvidence: false,
    exactSerialConfigDeferred: true, currentNewFilesAllParallel: true },
  playwrightDiscovery: { exit: 0, mode: "--list", registered: 11, files: 1, setupExecuted: false, browserExecuted: 0 },
  acceptanceAssertionsExecuted: 0, acceptanceCasesPassed: 0,
  checks: { typecheck: { exit: 0, command: "node node_modules/typescript/bin/tsc --noEmit --incremental false",
      initialExit: 2, repair: "Typed own trusted-IP data cases as Record<string,string>[]; initial receipt retained" },
    scopedLint: { exit: 0, errors: 0, warnings: 3, warningScope: "unused parameters in deliberately unbound E2E fixture" },
    inventory: { passed: inventory.passed }, preservation: { passed: preservation.passed,
      authorBindings: preservation.frozenBindings.length, independentFiles: preservation.independentFiles.length,
      historicalSourceBindings: preservation.originalSources.length, companionChecks: preservation.boundedCompanions.length,
      allocationHashes: preservation.allocationHashes.length }, diffCheck: { exit: 0 } },
  requiredWorkers: [{ name: "api_red", success: api.success, model: "gpt-6.1-sol", effort: "high", declarations: 46,
      testsExecuted: 0, output: atdd + "api-worker.json" },
    { name: "e2e_red", success: e2e.success, model: "gpt-6.1-sol", effort: "high", declarations: 9,
      expandedCases: 11, testsExecuted: 0, output: atdd + "e2e-worker.json" }],
  changes: { newTestFiles: 11, newHelpers: 2, existingTestFilesModified: 0, existingConfigFilesModified: 0,
    appSchemaImplementationFiles: 0, frozenSpecFilesModified: 0, resourcesStarted: 0, browserDBVaultHTTPActions: 0,
    keysCreated: 0, envFilesModified: 0, dependencyFilesModified: 0, gitWrites: 0, remoteEffects: 0 },
  p5Requirements: ["Bind every actual-subject/test-driver adapter; no mock success or production env getter",
    "Apply accepted exact two-file serial include+parallel exclude and six-file partition expectations BEFORE executing fixtures",
    "Actual installed runtime partition/nonoverlap proof; all new cases active",
    "Root-admitted ephemeral isolated test key/Vault/DB/production browser lane with scoped faults and complete failure-preserving cleanup",
    "Full required DB/RLS + direct Storage integrity + HTTP/browser + static/build + High independent review/exact-head CI + delivery truth"],
  releaseReady: false, developmentComplete: false, inheritedReviewUnverifiedMustRemain: true,
  deferredReleaseChecks: 6, codeReviewRoundsUsed: 0, implementationStarted: false,
  passed: api.success === true && e2e.success === true && inventory.passed && preservation.passed,
};
await writeFile(atdd + "validation.json", JSON.stringify(validation, null, 2) + "\n");
process.stdout.write(JSON.stringify({ outcome: validation.outcome, passed: validation.passed,
  declarations: inventory.totalDeclarations, plannedCases: 83, acceptanceAssertionsExecuted: 0 }) + "\n");
if (!validation.passed) process.exitCode = 1;
// Manifest is written separately AFTER checklist completion so it binds final bytes.
export async function manifest() {
  const checklist = "_bmad-output/test-artifacts/atdd-checklist-spec-15-5-personal-calendar-feed-adr-b004-surface-1.md";
  const codePaths = [...inventory.reports.map(report => report.path), "tests/support/calendar-feed-atdd.ts", "tests/e2e/support/calendar-feed-atdd.ts"];
  const artifacts = (await readdir(atdd)).filter(name => name !== "artifact-manifest.json").map(name => atdd + name);
  const files = await Promise.all([...codePaths, checklist, ...artifacts].sort().map(async path => {
    const bytes = await readFile(path);
    return { path, absolutePath: resolve(path).replaceAll("\\", "/"), bytes: bytes.length,
      sha256: createHash("sha256").update(bytes).digest("hex") };
  }));
  const result = { phase: "P4 RED only", newFiles: files, existingFilesModified: [],
    frozenSpecManifest: "_bmad-output/auto-bmad/preparation/story-15-5/artifact-manifest.json",
    frozenSpecManifestSHA256: "c5c764796b218a7e0903bbb258fb0b2eafc15d28476cae86679d2ba2d4fa13b2",
    note: "This ATDD manifest is new and separate from the unchanged frozen35-binding specification manifest. It intentionally excludes its own digest." };
  const manifestPath = atdd + "artifact-manifest.json";
  const bytes = JSON.stringify(result, null, 2) + "\n";
  await writeFile(manifestPath, bytes);
  process.stdout.write(JSON.stringify({ manifest: resolve(manifestPath).replaceAll("\\", "/"), entries: files.length,
    sha256: createHash("sha256").update(bytes).digest("hex") }) + "\n");
}
if (process.argv.includes("--manifest")) await manifest();
