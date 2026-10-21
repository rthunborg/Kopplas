import {test} from "node:test";
import assert from "node:assert/strict";
import {readMyJobs, readJobCardOptions} from "@/server/read-models/my-jobs";
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

function optionsClient(authenticated = true) {
  const calls: {name:string;args?:Record<string,unknown>}[] = [];
  const client = {
    auth:{getClaims:async()=>({data:authenticated?{claims:{sub:"actor"}}:null,error:null})},
    from:(table:string)=> {
      const builder={select:()=>builder,eq:()=>builder,order:()=>builder,limit:()=>builder,
        then:(resolve:(value:unknown)=>unknown)=>resolve({error:null,data:table==="membership_roles"?[]:[
          {id:"membership-a",tenant_id:"tenant-a",role:"tenant_admin",status:"active"},
          {id:"membership-b",tenant_id:"tenant-b",role:"tenant_admin",status:"active"}]})};
      return builder;
    },
    rpc:async(name:string,args?:Record<string,unknown>)=> {
      calls.push({name,args});
      return {error:null,data:{customers:[],facilities:[],contacts:[],projectManagers:[],workRoles:[],jobs:[]}};
    },
  };
  return {client,calls};
}
test("checkpoint options use the trusted request tenant even for dual membership", async () => {
  const {client,calls}=optionsClient();
  assert.equal((await readJobCardOptions(client)).error,null);
  assert.deepEqual(calls,[{name:"read_job_card_options",args:{p_tenant_id:"tenant-a"}}]);
});
test("checkpoint options deny unauthenticated callers before any RPC", async () => {
  const {client,calls}=optionsClient(false);
  const result=await readJobCardOptions(client);
  assert.ok(result.error);assert.deepEqual(result.customers,[]);assert.deepEqual(calls,[]);
});
