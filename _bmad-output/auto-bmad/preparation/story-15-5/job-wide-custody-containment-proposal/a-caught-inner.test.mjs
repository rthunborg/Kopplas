import {test,expect} from 'vitest';
import {fixture,uncertain} from './fixture.mjs';
console.log('C4_FIRST_MODULE_IMPORTED');
test('caught inner still outer fixture fails',async()=>fixture(async()=>{try{uncertain();throw new Error('C4_EXPECTED_FAULT');}catch{console.log('C4_INNER_CAUGHT');}}));
