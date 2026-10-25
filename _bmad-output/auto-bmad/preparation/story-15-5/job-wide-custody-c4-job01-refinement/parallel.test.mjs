import {test,afterAll} from 'vitest';test('parallel',()=>console.log('C4R_PARALLEL_BODY'));afterAll(async()=>{await new Promise(r=>setTimeout(r,10));console.log('C4R_PARALLEL_TEARDOWN');});
