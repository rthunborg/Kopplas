import {test,afterAll} from 'vitest';
test('parallel baseline',()=>console.log('C4_PARALLEL_BODY'));
afterAll(async()=>{await new Promise(r=>setTimeout(r,15));console.log('C4_PARALLEL_TEARDOWN_END');});
