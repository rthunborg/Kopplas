import {test,expect} from 'vitest';
import {fixture,uncertain} from './fixture.mjs';
console.log('C4_FIRST_MODULE_IMPORTED');
test('outer catch demonstrates bail limitation',async()=>{try{await fixture(async()=>{uncertain();throw new Error('C4_EXPECTED_FAULT');});}catch{console.log('C4_OUTER_CAUGHT');}});
