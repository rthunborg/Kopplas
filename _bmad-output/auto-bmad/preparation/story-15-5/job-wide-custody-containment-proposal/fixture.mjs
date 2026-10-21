let held=false;
console.log('C4_FIXTURE_IMPORTED');
export function uncertain(){held=true;}
export async function fixture(run){if(held)throw new Error('C4_CUSTODY_UNKNOWN');console.log('C4_ADMIT');let failed=false;try{await run();}catch{failed=true;}if(held||failed)throw new Error('C4_CUSTODY_UNKNOWN');}
