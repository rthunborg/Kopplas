import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
const prep = "_bmad-output/auto-bmad/preparation/story-15-5/";
const digest = async path => createHash("sha256").update(await readFile(path)).digest("hex");
const json = async path => JSON.parse((await readFile(path, "utf8")).replace(/^\uFEFF/, ""));
const check = async bindings => Promise.all(Object.entries(bindings).map(async ([path, expected]) => {
  const actual = await digest(path);
  return { path, expected, actual, unchanged: expected === actual };
}));
const manifestPath = prep + "artifact-manifest.json";
const manifest = await json(manifestPath);
const frozenBindings = await check(manifest.sha256);
const independentFiles = await check(manifest.independent_validation_files_excluded_and_conserved);
const independent = await json(prep + "independent-validation/validation-report.json");
const originalSources = await check(independent.source_snapshot_sha256);
const before = await json(prep + "atdd/preservation-before.json");
const boundedCompanions = await check(Object.fromEntries(before.map(row => [row.path, row.sha256])));
const expectedHashes = {
  [manifestPath]: "c5c764796b218a7e0903bbb258fb0b2eafc15d28476cae86679d2ba2d4fa13b2",
  [prep + "accepted-ownership-allocation.json"]: "a00bd6d75e7d3c56e0e5985dce9f6c26e43776be6c3670ae319159bdbe1ac0ed",
  [prep + "ownership-inventory-successor.md"]: "a3a9d8b76f58ca8d66d4250ccc7fa0f98a925af19826cbcd337c912b2f4d1419",
};
const allocationHashes = await check(expectedHashes);
const spec = await readFile("_bmad-output/implementation-artifacts/spec-15-5-personal-calendar-feed-adr-b004-surface-1.md", "utf8");
const kernelText = spec.replaceAll("\r\n", "\n").match(/<intent-contract>[\s\S]*?<\/intent-contract>/)?.[0];
if (!kernelText) throw new Error("Frozen kernel missing");
const kernel = createHash("sha256").update(kernelText).digest("hex");
const all = [...frozenBindings, ...independentFiles, ...originalSources, ...boundedCompanions, ...allocationHashes];
const report = { frozenBindings, independentFiles, originalSources, boundedCompanions, allocationHashes, kernel,
  approvedKernel: "0b3255e5ffd15bdc442ce5119bdf4fd5e16584fd7855ae5cddd9806c62ffd977",
  notes: "Only historical source paths are checked here. Newly authorized P4 test sources are additions and zero acceptance coverage; this is not a claim tests/ is unchanged.",
  passed: all.every(row => row.unchanged) && kernel === manifest.approved_kernel };
await writeFile(prep + "atdd/preservation-after.json", JSON.stringify(report, null, 2) + "\n");
process.stdout.write(JSON.stringify({ frozenBindings: frozenBindings.length, independentFiles: independentFiles.length,
  originalSources: originalSources.length, companionChecks: boundedCompanions.length, allocationHashes: allocationHashes.length,
  mismatches: all.filter(row => !row.unchanged), kernel, passed: report.passed }) + "\n");
if (!report.passed) process.exitCode = 1;
