import {test} from 'vitest';
import {fixture} from './fixture.mjs';
console.log('C4_NEXT_MODULE_IMPORTED');
test('next isolated different target',async()=>{console.log('C4_NEXT_BODY');await fixture(async()=>console.log('C4_DIFFERENT_TARGET_ADMITTED'));});
