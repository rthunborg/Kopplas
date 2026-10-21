import {test,expect} from 'vitest';
import {fixture,uncertain} from './fixture.mjs';
console.log('C4_FIRST_MODULE_IMPORTED');
test('healthy seam',async()=>fixture(async()=>{}));
test('meaningful expected denied outcome',async()=>fixture(async()=>expect({denied:true}).toEqual({denied:true})));
