import {test} from "node:test";
import assert from "node:assert/strict";
import {readMyJobs} from "@/server/read-models/my-jobs";
test("16.1-U02 personal projection strips unexpected storage and protected keys", async () => {
  const result = await readMyJobs({rpc: async (name,args) => {
    assert.equal(name,"read_job_cards"); assert.equal(args?.p_personal,true);
    return {error:null,data:[{id:"job",title:"Workshop",status:"created",type:"order",updatedAt:"now",
      acceptedPriceOre:12345,card_outcomes:{private:true},customerDisplayName:"Customer"}]};
  }});
  assert.equal(result.error,null); assert.equal(result.rows[0]?.title,"Workshop");
  assert.equal(Object.hasOwn(result.rows[0]!,"acceptedPriceOre"),false);
  assert.equal(Object.hasOwn(result.rows[0]!,"card_outcomes"),false);
});
test("16.1-U02 failed read stays distinct from a confirmed empty personal list", async () => {
  const unavailable = await readMyJobs({rpc:async () => ({data:null,error:new Error("transport")})});
  const empty = await readMyJobs({rpc:async () => ({data:[],error:null})});
  assert.ok(unavailable.error); assert.deepEqual(unavailable.rows,[]);
  assert.equal(empty.error,null); assert.deepEqual(empty.rows,[]);
});
