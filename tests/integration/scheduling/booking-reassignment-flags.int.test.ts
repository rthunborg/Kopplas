import { randomUUID } from "node:crypto";
import { beforeAll, describe, expect, test } from "vitest";
import { adminQuery, adminSession } from "../../factories/admin-sql";
import { makeAnonServerClient, makeAuthedServerClient } from "../../factories/tenants";
import { bookingSnapshot, seedReadFixtures, withBookingFixture } from "../../support/bookings-atdd";
import { isLocalStackReachable } from "../../support/test-env";
import { skipUnlessStack } from "../../support/stack-gate";

let stackUp = false;
beforeAll(async () => { stackUp = await isLocalStackReachable(); });
const rpc = (client: Awaited<ReturnType<typeof makeAuthedServerClient>>, tenantId: string | null, ids: unknown) =>
  client.rpc("booking_reassignment_flags", {p_tenant_id:tenantId,p_booking_ids:ids});
const denied = (reply: Awaited<ReturnType<typeof rpc>>) => {
  expect(reply.data).toBeNull(); expect(reply.error?.code).toBe("42501"); expect(reply.error?.message).toBe("booking denied");
};

describe("15.1 checked minimal booking reassignment RPC (actual local DB/JWT)", () => {
  test("Admin/PL return exact ordered boolean-only payload and no writes", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    await withBookingFixture(async fx => {
      const seed = await seedReadFixtures(fx), ids=[seed.shared,seed.own,seed.coworker];
      const before = await bookingSnapshot(fx.tenantIds);
      for(const client of [fx.adminClient,fx.plannerClient]) {
        const reply = await rpc(client,fx.base.tenantA.id,ids);
        expect(reply.error).toBeNull();
        expect(reply.data).toEqual(ids.map(bookingId=>({bookingId,needsReassignment:false})));
      }
      expect(await bookingSnapshot(fx.tenantIds)).toEqual(before);
    });
  });

  test("current peer disable/end/reactivation/archive uses OR across all retained assignees", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    await withBookingFixture(async fx => {
      const seed=await seedReadFixtures(fx), ids=[seed.own,seed.shared,seed.coworker];
      const flags=async()=>{const reply=await rpc(fx.plannerClient,fx.base.tenantA.id,ids);expect(reply.error).toBeNull();return reply.data;};
      for(const status of ["disabled","ended"]) {
        await adminQuery("update public.tenant_memberships set status=$2 where id=$1",[fx.ownProfile.membershipId,status]);
        expect(await flags()).toEqual([{bookingId:seed.own,needsReassignment:true},{bookingId:seed.shared,needsReassignment:true},{bookingId:seed.coworker,needsReassignment:false}]);
        const [profile]=await adminQuery("select archived_at from public.person_profiles where id=$1",[fx.ownProfile.id]);expect(profile.archived_at).toBeNull();
      }
      await adminQuery("update public.tenant_memberships set status='active' where id=$1",[fx.ownProfile.membershipId]);
      expect(await flags()).toEqual(ids.map(bookingId=>({bookingId,needsReassignment:false})));
      await adminQuery("update public.person_profiles set archived_at=statement_timestamp() where id=$1",[fx.ownProfile.id]);
      expect((await flags())[1]).toEqual({bookingId:seed.shared,needsReassignment:true});
      await adminQuery("update public.tenant_memberships set status='disabled' where id=$1",[fx.coworkerProfile.membershipId]);
      // The same caller's stored status is current even with its unchanged valid JWT.
      denied(await rpc(fx.plannerClient,fx.base.tenantA.id,ids));
      const reply=await rpc(fx.adminClient,fx.base.tenantA.id,ids);expect(reply.error).toBeNull();expect(reply.data.every((x:{needsReassignment:boolean})=>x.needsReassignment)).toBe(true);
    });
  });

  test("unknown/foreign/mixed/null-tenant requests deny identically without partial data", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    await withBookingFixture(async fx => {
      const seed=await seedReadFixtures(fx);
      for(const [tenant,ids] of [[fx.base.tenantA.id,[randomUUID()]],[fx.base.tenantA.id,[seed.foreign]],[fx.base.tenantA.id,[seed.own,seed.foreign]],[fx.base.tenantB.id,[seed.foreign]],[null,[seed.own]]] as const)
        denied(await rpc(fx.plannerClient,tenant,[...ids]));
    });
  });

  test("Montör even own, sales, economy, orphan, invited, disabled and ended callers deny before shape", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    await withBookingFixture(async fx => {
      const seed=await seedReadFixtures(fx);
      const clients=await Promise.all([fx.users.saljare,fx.users.ekonomi,fx.base.orphanUser,fx.invitedUser,fx.disabledUser].map(makeAuthedServerClient));
      for(const client of [fx.montorClient,...clients]) for(const ids of [[seed.own],null,[]]) denied(await rpc(client,fx.base.tenantA.id,ids));
      await adminQuery("update public.tenant_memberships set status='ended' where id=$1",[fx.coworkerProfile.membershipId]);
      denied(await rpc(fx.plannerClient,fx.base.tenantA.id,[]));
    });
  });

  test("scalar sales/economy with secondary PL/Admin union grant and unchanged JWT revocation denies", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    await withBookingFixture(async fx => {
      const seed=await seedReadFixtures(fx);
      for(const [user,role] of [[fx.users.saljare,"projektledare"],[fx.users.ekonomi,"tenant_admin"]] as const) {
        const client=await makeAuthedServerClient(user);
        const [m]=await adminQuery<{id:string}>("select id from public.tenant_memberships where tenant_id=$1 and user_id=$2",[fx.base.tenantA.id,user.id]);
        await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,$3)",[fx.base.tenantA.id,m.id,role]);
        expect((await rpc(client,fx.base.tenantA.id,[seed.own])).data).toEqual([{bookingId:seed.own,needsReassignment:false}]);
        await adminQuery("delete from public.membership_roles where membership_id=$1",[m.id]);
        denied(await rpc(client,fx.base.tenantA.id,[seed.own]));
        await adminQuery("insert into public.membership_roles(tenant_id,membership_id,role) values($1,$2,$3)",[fx.base.tenantA.id,m.id,role]);
        await adminQuery("update public.tenant_memberships set status='disabled' where id=$1",[m.id]);
        denied(await rpc(client,fx.base.tenantA.id,[seed.own]));
      }
    });
  });

  test("raw cardinality 1/50 succeeds; 0/51/null/null-elements/duplicates/multidimensional fail generically", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    await withBookingFixture(async fx => {
      const ids=Array.from({length:50},()=>randomUUID());
      await adminQuery(`insert into public.bookings(id,tenant_id,starts_at,ends_at,create_command_id,create_payload_digest,create_result)
        select x,$1,'2026-10-12T06:00Z','2026-10-12T07:00Z',gen_random_uuid(),repeat('a',64),jsonb_build_object('bookingId',x) from unnest($2::uuid[]) x`,[fx.base.tenantA.id,ids]);
      for(const batch of [[ids[0]],ids]) {const reply=await rpc(fx.plannerClient,fx.base.tenantA.id,batch);expect(reply.error).toBeNull();expect(reply.data).toHaveLength(batch.length);}
      for(const batch of [[],null,[null],[ids[0],ids[0]],[...ids,randomUUID()],Array(51).fill(ids[0]),[[ids[0]]]]) {
        const reply=await rpc(fx.plannerClient,fx.base.tenantA.id,batch);expect(reply.data).toBeNull();expect(reply.error?.code).toBe("23514");expect(reply.error?.message).toBe("booking input invalid");
      }
    });
  });

  test("STABLE DEFINER empty search path and exact authenticated ACL; anon/service role cannot execute", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    const [meta]=await adminQuery<{provolatile:string;prosecdef:boolean;proconfig:string[];authenticated:boolean;anon:boolean;service_role:boolean;public_execute:boolean}>(`select p.provolatile,p.prosecdef,p.proconfig,
      has_function_privilege('authenticated',p.oid,'execute') authenticated,has_function_privilege('anon',p.oid,'execute') anon,
      has_function_privilege('service_role',p.oid,'execute') service_role,
      exists(select 1 from aclexplode(p.proacl) where grantee=0 and privilege_type='EXECUTE') public_execute
      from pg_proc p where p.oid='public.booking_reassignment_flags(uuid,uuid[])'::regprocedure`);
    expect(meta).toEqual({provolatile:"s",prosecdef:true,proconfig:['search_path=""'],authenticated:true,anon:false,service_role:false,public_execute:false});
    const anon=await makeAnonServerClient();expect((await rpc(anon,randomUUID(),[])).error?.code).toBe("42501");
    await adminSession(async session=>{await session.query("set role service_role");await expect(session.query("select public.booking_reassignment_flags($1,$2::uuid[])",[randomUUID(),[]])).rejects.toMatchObject({code:"42501"});});
    await adminSession(async session=>{await session.query("set role authenticated");await expect(session.query("select public.booking_reassignment_flags($1,$2::uuid[])",[randomUUID(),[]])).rejects.toMatchObject({code:"42501",message:"booking denied"});});
  });

  test("PL still cannot SELECT peer membership; own-active and Admin controls remain", async ctx => {
    if (skipUnlessStack(ctx,stackUp)) return;
    await withBookingFixture(async fx=>{
      const peer=await fx.plannerClient.from("tenant_memberships").select("id,status").eq("id",fx.ownProfile.membershipId);
      expect(peer.error).toBeNull();expect(peer.data).toEqual([]);
      const own=await fx.plannerClient.from("tenant_memberships").select("id,status").eq("id",fx.coworkerProfile.membershipId);
      expect(own.data).toEqual([{id:fx.coworkerProfile.membershipId,status:"active"}]);
      const admin=await fx.adminClient.from("tenant_memberships").select("id,status").eq("id",fx.ownProfile.membershipId);expect(admin.data).toHaveLength(1);
    });
  });
});
