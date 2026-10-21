-- Story15.5: resolve canonical actor identity at SQL definition time, without
-- granting Auth namespace access or changing canonical auth.uid() privileges.
-- All DDL, ACL changes and LOCAL role changes are one atomic statement.
do $migration$
declare
 owner_role record;
 executor_oid oid;
 target_oids oid[];
 expected_sources text[] := array[
$original_0$
declare member uuid; latest public.calendar_feed_tokens; active public.calendar_feed_tokens; attempted public.calendar_feed_tokens;
begin
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 select m.id into member from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active';
 if auth.uid() is null or member is null or not public.calendar_feed_subject_internal(p_tenant_id,member,auth.uid()) then raise exception 'calendar denied' using errcode='42501'; end if;
 select * into latest from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member order by revision desc limit 1;
 select * into active from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member and revoked_at is null;
 select * into attempted from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=member and attempt_id=p_attempt_id;
 return jsonb_build_object('membershipId',member,'active',active.id is not null,'revision',coalesce(latest.revision,0),
  'lastUsedAt',active.last_used_at,'usageCount',coalesce(active.usage_count,0),
  'attemptOutcome',case when p_attempt_id is null then null when attempted.id is not null then 'committed' else 'not-found' end,
  'attemptAction',attempted.action,'attemptRevision',attempted.expected_revision);
end $original_0$,
$original_1$
declare latest public.calendar_feed_tokens; prior public.calendar_feed_tokens; active public.calendar_feed_tokens; new_id uuid; next_revision integer;
begin
 if auth.uid() is null or auth.uid() is distinct from p_actor_id or p_action not in ('create','rotate','revoke') or p_action is null
  or p_expected_revision is null or p_expected_revision<0 or p_attempt_id is null or p_correlation_id is null
  or not public.calendar_feed_verify_attestation_internal(p_claims,p_signature,p_action)
  or p_claims->>'tenantId' is distinct from p_tenant_id::text or p_claims->>'actorId' is distinct from p_actor_id::text
  or p_claims->>'membershipId' is distinct from p_membership_id::text or p_claims->>'revision' is distinct from p_expected_revision::text
  or p_claims->>'attemptId' is distinct from p_attempt_id::text or p_claims->>'newHash' is distinct from coalesce(p_new_hash,'')
  or p_claims->>'correlationId' is distinct from p_correlation_id::text
  or (p_action='revoke' and p_new_hash is not null) or (p_action<>'revoke' and (p_new_hash is null or p_new_hash !~ '^[0-9a-f]{64}$')) then raise exception 'calendar denied' using errcode='42501'; end if;
 -- Same tenant lock as scheduling; status/revision and public fetch serialize here.
 perform pg_advisory_xact_lock(hashtextextended(p_tenant_id::text,0));
 if not public.calendar_feed_subject_internal(p_tenant_id,p_membership_id,p_actor_id) then raise exception 'calendar denied' using errcode='42501'; end if;
 select * into prior from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id and attempt_id=p_attempt_id;
 if found then
  if prior.action<>p_action or prior.expected_revision<>p_expected_revision or prior.token_hash is distinct from p_new_hash then raise exception 'calendar conflict' using errcode='CF409'; end if;
  return jsonb_build_object('outcome','replayed','revision',prior.revision);
 end if;
 select * into latest from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id order by revision desc limit 1;
 select * into active from public.calendar_feed_tokens where tenant_id=p_tenant_id and membership_id=p_membership_id and revoked_at is null for update;
 if p_expected_revision<>coalesce(latest.revision,0) or (p_action='create' and active.id is not null) or (p_action='rotate' and active.id is null) then raise exception 'calendar conflict' using errcode='CF409'; end if;
 if p_action='revoke' and active.id is null then return jsonb_build_object('outcome','replayed','revision',coalesce(latest.revision,0)); end if;
 next_revision:=coalesce(latest.revision,0)+1;
 update public.calendar_feed_tokens set revoked_at=clock_timestamp() where tenant_id=p_tenant_id and membership_id=p_membership_id and revoked_at is null;
 insert into public.calendar_feed_tokens(tenant_id,membership_id,token_hash,revision,attempt_id,action,expected_revision,revoked_at)
 values(p_tenant_id,p_membership_id,p_new_hash,next_revision,p_attempt_id,p_action,p_expected_revision,case when p_action='revoke' then clock_timestamp() else null end) returning id into new_id;
 insert into public.audit_events(tenant_id,actor_user_id,command,event_type,target_type,target_id,correlation_id,metadata)
 values(p_tenant_id,p_actor_id,'calendar_feed.'||p_action,'calendar_feed_'||p_action,'calendar_feed',new_id,p_correlation_id,jsonb_build_object('attemptId',p_attempt_id,'revision',next_revision));
 return jsonb_build_object('outcome','committed','revision',next_revision);
end $original_1$,
$original_2$
declare member uuid;
begin
 select m.id into member from public.tenant_memberships m where m.tenant_id=p_tenant_id and m.user_id=auth.uid() and m.status='active';
 if auth.uid() is null or member is null or not public.calendar_feed_subject_internal(p_tenant_id,member,auth.uid(),true) then raise exception 'calendar denied' using errcode='42501'; end if;
 return (select jsonb_build_object('requests',least(coalesce(sum(request_count),0),9007199254740991),'limited',least(coalesce(sum(spike_count),0),9007199254740991),'lastSpikeAt',max(last_spike_at)) from public.calendar_feed_tokens where tenant_id=p_tenant_id);
end $original_2$];
 call_counts integer[] := array[3,2,3];
 definitions text[] := array[]::text[];
 metadata jsonb[] := array[]::jsonb[];
 actor_oid oid;
 item record;
 i integer;
begin
 if session_user <> 'postgres' or current_user <> 'postgres'
  or not exists(select 1 from pg_catalog.pg_roles where rolname=current_user and rolcanlogin and not rolsuper) then
  raise exception 'calendar actor source executor refused';
 end if;
 select oid into strict executor_oid from pg_catalog.pg_roles where rolname='postgres';
 select * into strict owner_role from pg_catalog.pg_roles where rolname='calendar_feed_owner';
 if owner_role.rolcanlogin or owner_role.rolinherit or owner_role.rolsuper or owner_role.rolcreatedb
  or owner_role.rolcreaterole or owner_role.rolreplication or owner_role.rolbypassrls
  or not pg_catalog.pg_has_role(current_user,owner_role.oid,'SET')
  or pg_catalog.pg_has_role(current_user,owner_role.oid,'USAGE')
  or not exists(select 1 from pg_catalog.pg_auth_members where roleid=owner_role.oid and member=executor_oid and set_option and not inherit_option)
  or exists(select 1 from pg_catalog.pg_auth_members where member=owner_role.oid or roleid=owner_role.oid and (member<>executor_oid or inherit_option))
  or pg_catalog.has_schema_privilege(owner_role.oid,'public','CREATE') then
  raise exception 'calendar actor owner or SET authority refused';
 end if;
 if pg_catalog.to_regprocedure('public.calendar_feed_actor_internal()') is not null then
  raise exception 'calendar actor adapter already present';
 end if;
 target_oids := array[
  'public.read_calendar_feed_status(uuid,uuid)'::regprocedure::oid,
  'public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)'::regprocedure::oid,
  'public.read_calendar_feed_abuse(uuid)'::regprocedure::oid];
 for i in 1..3 loop
  select p.*,l.lanname into strict item from pg_catalog.pg_proc p join pg_catalog.pg_language l on l.oid=p.prolang where p.oid=target_oids[i];
  if item.proowner<>owner_role.oid or not item.prosecdef or item.provolatile<>'v' or item.lanname<>'plpgsql'
   or item.proconfig is distinct from array['search_path=""']::text[]
   or not pg_catalog.has_function_privilege('authenticated',item.oid,'EXECUTE')
   or pg_catalog.has_function_privilege('anon',item.oid,'EXECUTE')
   or pg_catalog.has_function_privilege('service_role',item.oid,'EXECUTE')
   or exists(select 1 from pg_catalog.aclexplode(coalesce(item.proacl,pg_catalog.acldefault('f',item.proowner))) a
    where a.grantee not in (owner_role.oid,(select oid from pg_catalog.pg_roles where rolname='authenticated'))
     or a.grantee<>owner_role.oid and a.is_grantable)
   or item.prosrc is distinct from expected_sources[i]
   or (length(item.prosrc)-length(replace(item.prosrc,'auth.uid()','')))/length('auth.uid()')<>call_counts[i] then
   raise exception 'calendar actor original function refused %', pg_catalog.jsonb_build_object(
    'schema','calendar-original-function-guard-v1','ordinal',i,'checks',pg_catalog.jsonb_build_object(
     'owner_matches',item.proowner=owner_role.oid,
     'security_definer',item.prosecdef,
     'volatile',item.provolatile='v',
     'plpgsql',item.lanname='plpgsql',
     'exact_proconfig',item.proconfig is not distinct from array['search_path=""']::text[],
     'authenticated_execute',pg_catalog.has_function_privilege('authenticated',item.oid,'EXECUTE'),
     'anon_denied',not pg_catalog.has_function_privilege('anon',item.oid,'EXECUTE'),
     'service_role_denied',not pg_catalog.has_function_privilege('service_role',item.oid,'EXECUTE'),
     'acl_grantees_safe',not exists(select 1 from pg_catalog.aclexplode(coalesce(item.proacl,pg_catalog.acldefault('f',item.proowner))) a
    where a.grantee not in (owner_role.oid,(select oid from pg_catalog.pg_roles where rolname='authenticated'))
     or a.grantee<>owner_role.oid and a.is_grantable),
     'body_exact',item.prosrc is not distinct from expected_sources[i],
     'call_count_exact',(length(item.prosrc)-length(replace(item.prosrc,'auth.uid()','')))/length('auth.uid()')=call_counts[i]));
  end if;
  definitions := array_append(definitions,pg_catalog.pg_get_functiondef(item.oid));
  metadata := array_append(metadata,(select to_jsonb(p)-'prosrc' from pg_catalog.pg_proc p where p.oid=item.oid));
 end loop;
 -- Preparsed SQL body binds the canonical function OID while postgres may resolve
 -- Auth. SECURITY INVOKER still checks canonical EXECUTE as the caller at runtime.
 execute $adapter$create function public.calendar_feed_actor_internal() returns uuid
 language sql stable security invoker set search_path='' return auth.uid()$adapter$;
 actor_oid := 'public.calendar_feed_actor_internal()'::regprocedure::oid;
 revoke all on function public.calendar_feed_actor_internal() from public,anon,authenticated,service_role;
 grant execute on function public.calendar_feed_actor_internal() to calendar_feed_owner;
 grant create on schema public to calendar_feed_owner;
 execute 'set local role calendar_feed_owner';
 if current_user<>'calendar_feed_owner' or not pg_catalog.has_schema_privilege(current_user,'public','CREATE') then
  raise exception 'calendar actor replacement authority refused';
 end if;
 for i in 1..3 loop
  execute replace(definitions[i],'auth.uid()','public.calendar_feed_actor_internal()');
 end loop;
 execute 'reset role';
 if current_user<>'postgres' or session_user<>'postgres' then
  raise exception 'calendar actor executor restore refused';
 end if;
 revoke create on schema public from calendar_feed_owner;
 if pg_catalog.has_schema_privilege(owner_role.oid,'public','CREATE') then
  raise exception 'calendar actor transient CREATE retained';
 end if;
 for i in 1..3 loop
  if not exists(select 1 from pg_catalog.pg_proc p where p.oid=target_oids[i]
    and to_jsonb(p)-'prosrc'=metadata[i]
    and p.prosrc=replace(expected_sources[i],'auth.uid()','public.calendar_feed_actor_internal()')) then
   raise exception 'calendar actor replacement metadata changed';
  end if;
 end loop;
 if not exists(select 1 from pg_catalog.pg_proc p join pg_catalog.pg_language l on l.oid=p.prolang
   where p.oid=actor_oid and p.proowner=executor_oid and p.pronargs=0 and p.prorettype='uuid'::regtype
    and l.lanname='sql' and p.provolatile='s' and not p.prosecdef and p.prosqlbody is not null
    and p.proconfig=array['search_path=""']::text[])
  or not exists(select 1 from pg_catalog.pg_depend d where d.classid='pg_catalog.pg_proc'::regclass and d.objid=actor_oid
   and d.refclassid='pg_catalog.pg_proc'::regclass and d.refobjid='auth.uid()'::regprocedure::oid and d.deptype='n')
  or not pg_catalog.has_function_privilege(owner_role.oid,actor_oid,'EXECUTE')
  or exists(select 1 from pg_catalog.pg_proc p, lateral pg_catalog.aclexplode(coalesce(p.proacl,pg_catalog.acldefault('f',p.proowner))) a
   where p.oid=actor_oid and (a.grantee not in (executor_oid,owner_role.oid) or a.grantee=owner_role.oid and a.is_grantable))
  or pg_catalog.has_function_privilege('anon',actor_oid,'EXECUTE')
  or pg_catalog.has_function_privilege('authenticated',actor_oid,'EXECUTE')
  or pg_catalog.has_function_privilege('service_role',actor_oid,'EXECUTE') then
  raise exception 'calendar actor adapter contract refused';
 end if;
end
$migration$;
