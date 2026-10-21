import {BaseSequencer} from 'vitest/node';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('.',import.meta.url));
class Stable extends BaseSequencer{sort(files){return [...files].sort((a,b)=>a.moduleId.localeCompare(b.moduleId));}}
export default {root,envDir:root,cacheDir:root+'/.probe-cache',test:{watch:false,environment:'node',globals:false,setupFiles:[],globalSetup:[],cache:false,retry:0,isolate:true,reporters:['json','./sentinel-reporter.mjs'],sequence:{sequencer:Stable},projects:[{extends:true,test:{name:'parallel',include:['parallel.test.mjs'],maxWorkers:2,sequence:{groupOrder:0}}},{extends:true,test:{name:'serial',include:["a-caught-outer.test.mjs", "z-next.test.mjs"],maxWorkers:1,fileParallelism:false,bail:1,sequence:{groupOrder:1}}}]}};
