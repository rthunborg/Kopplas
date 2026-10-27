import {test,expect} from 'vitest';
import {fixture,uncertain} from './fixture.mjs';
console.log('C4_FIRST_MODULE_IMPORTED');
test('uncertainty reaches test failure',async()=>fixture(async()=>{uncertain();throw new Error('C4_EXPECTED_FAULT');}));
