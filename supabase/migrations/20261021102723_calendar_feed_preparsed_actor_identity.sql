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
 -- All eight immutable predecessor definitions are checked before any mutation.
 source_shapes jsonb := $source_shapes$[{"identity":"public.calendar_feed_attestation_payload(jsonb)","name":"calendar_feed_attestation_payload","types":["jsonb"],"names":["p_claims"],"returns":"bytea","language":"plpgsql","volatility":"i","definer":false,"defaults":0,"default_expr":null,"external":""},{"identity":"public.calendar_feed_verify_attestation_internal(jsonb,text,text)","name":"calendar_feed_verify_attestation_internal","types":["jsonb","text","text"],"names":["p_claims","p_signature","p_operation"],"returns":"boolean","language":"plpgsql","volatility":"v","definer":false,"defaults":0,"default_expr":null,"external":""},{"identity":"public.calendar_feed_subject_internal(uuid,uuid,uuid,boolean)","name":"calendar_feed_subject_internal","types":["uuid","uuid","uuid","boolean"],"names":["p_tenant","p_membership","p_actor","p_admin"],"returns":"boolean","language":"sql","volatility":"s","definer":false,"defaults":2,"default_expr":"NULL::uuid, false","external":""},{"identity":"public.calendar_feed_now_internal()","name":"calendar_feed_now_internal","types":[],"names":null,"returns":"timestamptz","language":"sql","volatility":"v","definer":false,"defaults":0,"default_expr":null,"external":""},{"identity":"public.fetch_calendar_feed(text,text,jsonb,text)","name":"fetch_calendar_feed","types":["text","text","jsonb","text"],"names":["p_token_hash","p_ip_hash","p_claims","p_signature"],"returns":"jsonb","language":"plpgsql","volatility":"v","definer":true,"defaults":0,"default_expr":null,"external":"anon"},{"identity":"public.read_calendar_feed_status(uuid,uuid)","name":"read_calendar_feed_status","types":["uuid","uuid"],"names":["p_tenant_id","p_attempt_id"],"returns":"jsonb","language":"plpgsql","volatility":"v","definer":true,"defaults":1,"default_expr":"NULL::uuid","external":"authenticated"},{"identity":"public.manage_calendar_feed(uuid,uuid,uuid,text,integer,uuid,text,uuid,jsonb,text)","name":"manage_calendar_feed","types":["uuid","uuid","uuid","text","integer","uuid","text","uuid","jsonb","text"],"names":["p_tenant_id","p_actor_id","p_membership_id","p_action","p_expected_revision","p_attempt_id","p_new_hash","p_correlation_id","p_claims","p_signature"],"returns":"jsonb","language":"plpgsql","volatility":"v","definer":true,"defaults":0,"default_expr":null,"external":"authenticated"},{"identity":"public.read_calendar_feed_abuse(uuid)","name":"read_calendar_feed_abuse","types":["uuid"],"names":["p_tenant_id"],"returns":"jsonb","language":"plpgsql","volatility":"v","definer":true,"defaults":0,"default_expr":null,"external":"authenticated"}]$source_shapes$::jsonb;
 source_bodies text[] := array[
$canonical_0$
declare k text; result bytea:=''::bytea; keys text[];
begin
 keys:=case when p_claims->>'operation'='fetch' then array['schema','domain','operation','tokenHash','ipHash','requestId','keyId','issuedAt','expiresAt']
 else array['schema','domain','operation','tenantId','actorId','membershipId','revision','attemptId','newHash','correlationId','keyId','issuedAt','expiresAt'] end;
 foreach k in array keys loop
  result:=result || convert_to(octet_length(convert_to(coalesce(p_claims->>k,''),'UTF8'))::text || ':' || coalesce(p_claims->>k,''),'UTF8');
 end loop;
 return result;
end $canonical_0$,
$canonical_1$
declare secret text; decoded bytea; issued timestamptz; expires timestamptz; now_at timestamptz:=clock_timestamp(); keys text[];
begin
 if p_claims is null or jsonb_typeof(p_claims)<>'object' or p_signature is null or p_signature !~ '^[0-9a-f]{64}$'
  or p_claims->>'schema' is distinct from 'kopplas.calendar-feed.v1' or p_claims->>'operation' is distinct from p_operation
  or p_claims->>'domain' is distinct from (case when p_operation='fetch' then 'kopplas.calendar-feed.fetch.v1' else 'kopplas.calendar-feed.manage.v1' end) then return false; end if;
 keys:=case when p_operation='fetch' then array['schema','domain','operation','tokenHash','ipHash','requestId','keyId','issuedAt','expiresAt']
 else array['schema','domain','operation','tenantId','actorId','membershipId','revision','attemptId','newHash','correlationId','keyId','issuedAt','expiresAt'] end;
 if (select count(*) from jsonb_object_keys(p_claims))<>cardinality(keys)
  or exists(select 1 from unnest(keys) k where jsonb_typeof(p_claims->k) is distinct from 'string') then return false; end if;
 issued:=(p_claims->>'issuedAt')::timestamptz; expires:=(p_claims->>'expiresAt')::timestamptz;
 if not isfinite(issued) or not isfinite(expires) or issued>now_at or expires<=now_at or expires<=issued or expires-issued>interval '60 seconds' then return false; end if;
 secret:=public.calendar_feed_secret_internal(p_claims->>'keyId');
 if secret is null or secret !~ '^[A-Za-z0-9_-]+$' then return false; end if;
 decoded:=decode(translate(secret,'-_','+/') || repeat('=',(4-length(secret)%4)%4),'base64');
 if octet_length(decoded)<32 or rtrim(translate(replace(encode(decoded,'base64'),E'\n',''),'+/','-_'),'=')<>secret then return false; end if;
 return encode(extensions.hmac(public.calendar_feed_attestation_payload(p_claims),decoded,'sha256'),'hex')=p_signature;
exception when others then return false;
end $canonical_1$,
$canonical_2$
 select exists(select 1 from public.tenants t join public.tenant_memberships m on m.tenant_id=t.id
  where t.id=p_tenant and m.id=p_membership and m.status='active' and m.user_id is not null and (p_actor is null or m.user_id=p_actor)
   and (m.role=any(case when p_admin then array['tenant_admin'] else array['tenant_admin','projektledare','montor'] end)
    or exists(select 1 from public.membership_roles r where r.tenant_id=t.id and r.membership_id=m.id
     and r.role=any(case when p_admin then array['tenant_admin'] else array['tenant_admin','projektledare','montor'] end))))
$canonical_2$,
$canonical_3$ select clock_timestamp() $canonical_3$,
$canonical_4$
declare now_at timestamptz; window_at timestamptz; retry integer; ip_count bigint; bucket text:=p_ip_hash;
 token public.calendar_feed_tokens; events jsonb; requests bigint;
begin
 if p_token_hash is null or p_token_hash !~ '^[0-9a-f]{64}$' or p_ip_hash is null or p_ip_hash !~ '^[0-9a-f]{64}$'
  or not public.calendar_feed_verify_attestation_internal(p_claims,p_signature,'fetch')
  or p_claims->>'tokenHash' is distinct from p_token_hash or p_claims->>'ipHash' is distinct from p_ip_hash
  or coalesce(p_claims->>'requestId','') !~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' then raise exception 'calendar denied' using errcode='42501'; end if;
 -- Global cardinality admission is bounded, including malicious distinct addresses.
 -- Acquire before the tenant lock everywhere to avoid cross-axis lock inversion.
 perform pg_advisory_xact_lock(hashtextextended('kopplas.calendar-feed.ip-windows.v1',0));
 now_at:=public.calendar_feed_now_internal(); window_at:=to_timestamp(floor(extract(epoch from now_at)/900)*900);
 retry:=greatest(1,ceil(extract(epoch from window_at+interval '900 seconds'-now_at))::integer);
 delete from public.calendar_feed_ip_windows where ip_hash in (select w.ip_hash from public.calendar_feed_ip_windows w where w.window_start<window_at order by w.ip_hash limit 128);
 if not exists(select 1 from public.calendar_feed_ip_windows where ip_hash=bucket)
  and (select count(*) from public.calendar_feed_ip_windows)>=4095 then bucket:=repeat('f',64); end if;
 insert into public.calendar_feed_ip_windows(ip_hash,window_start,request_count) values(bucket,window_at,1)
 on conflict(ip_hash) do update set window_start=excluded.window_start,request_count=case when calendar_feed_ip_windows.window_start=excluded.window_start then least(calendar_feed_ip_windows.request_count+1,9007199254740991) else 1 end returning request_count into ip_count;
 -- Lookup supplies only the lock key; re-read token after the tenant wait.
 select * into token from public.calendar_feed_tokens where token_hash=p_token_hash;
 if token.id is not null then
  perform pg_advisory_xact_lock(hashtextextended(token.tenant_id::text,0));
  select * into token from public.calendar_feed_tokens where token_hash=p_token_hash for update;
 end if;
 if token.id is null or token.revoked_at is not null or not public.calendar_feed_subject_internal(token.tenant_id,token.membership_id) then
  return jsonb_build_object('status',case when ip_count>120 then 429 else 404 end,'retryAfter',retry);
 end if;
 requests:=case when token.window_start=window_at then least(token.request_count+1,9007199254740991) else 1 end;
 update public.calendar_feed_tokens set window_start=window_at,request_count=requests,
  spike_count=least(spike_count+case when requests>60 or ip_count>120 then 1 else 0 end,9007199254740991),
  last_spike_at=case when requests>60 or ip_count>120 then now_at else last_spike_at end where id=token.id;
 if requests>60 or ip_count>120 then return jsonb_build_object('status',429,'retryAfter',retry); end if;
 -- A single JSON scalar avoids the PostgREST row cap and any partial-page success.
 -- Projection faults roll back only their subtransaction; admitted abuse counters
 -- stay durable and no successful-use timestamp is written for a failed feed.
 begin
 select coalesce(jsonb_agg(jsonb_strip_nulls(jsonb_build_object('id',b.id,'startsAt',b.starts_at,'endsAt',b.ends_at,'allDay',b.all_day,'updatedAt',greatest(b.updated_at,w.updated_at,j.updated_at,c.updated_at,f.updated_at),
  'title',coalesce(nullif(w.display_name,''),'Bokning'),'jobLabel',j.title,'customerLabel',c.display_name,
  'location',nullif(concat_ws(', ',nullif(f.address_line1,''),nullif(f.address_line2,''),nullif(concat_ws(' ',nullif(f.postal_code,''),nullif(f.city,'')),'')),''))) order by b.starts_at,b.id),'[]'::jsonb) into events
 from public.bookings b
 left join public.work_roles w on w.id=b.work_role_id and w.tenant_id=b.tenant_id
 left join public.jobs j on j.id=b.job_id and j.tenant_id=b.tenant_id
 left join public.customers c on c.id=coalesce(b.customer_id,j.customer_id) and c.tenant_id=b.tenant_id
 left join public.facilities f on f.id=coalesce(b.facility_id,j.facility_id) and f.tenant_id=b.tenant_id
 where b.tenant_id=token.tenant_id and b.status='planned' and exists(
  select 1 from public.booking_assignees a join public.person_profiles p on p.id=a.person_profile_id and p.tenant_id=a.tenant_id
  where a.tenant_id=b.tenant_id and a.booking_id=b.id and p.membership_id=token.membership_id and p.archived_at is null);
 exception when sqlstate '57014' or others then return jsonb_build_object('status',503); end;
 update public.calendar_feed_tokens set last_used_at=now_at,usage_count=least(usage_count+1,9007199254740991) where id=token.id;
 return jsonb_build_object('status',200,'events',events);
end $canonical_4$,
expected_sources[1],
expected_sources[2],
expected_sources[3]];
 canonical_oids oid[];
 canonical_metadata jsonb[] := array[]::jsonb[];
 canonical_definitions text[] := array[]::text[];
 desired_roles text[] := array['','','','','anon','authenticated','authenticated','authenticated'];
 shape jsonb;
 anon_oid oid; authenticated_oid oid; service_oid oid; desired_oid oid;
 acl_count integer; distinct_grantees integer; owner_entries integer; acl_safe boolean; grantees oid[]; intended_grantees oid[];
 authority_before jsonb;
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
 -- Begin all-eight source-comparable preflight (read-only).
 select oid into anon_oid from pg_catalog.pg_roles where rolname='anon';
 select oid into authenticated_oid from pg_catalog.pg_roles where rolname='authenticated';
 select oid into service_oid from pg_catalog.pg_roles where rolname='service_role';
 if anon_oid is null or authenticated_oid is null or service_oid is null then
  raise exception 'SOURCE_ACL_NOT_COMPARABLE';
 end if;
 canonical_oids := array(select pg_catalog.to_regprocedure(x->>'identity')::oid from jsonb_array_elements(source_shapes) with ordinality t(x,n) order by n);
 if cardinality(canonical_oids)<>8 or array_position(canonical_oids,null) is not null
  or (select count(distinct x) from unnest(canonical_oids) x)<>8
  or exists(select 1 from pg_catalog.pg_proc p where p.pronamespace='public'::regnamespace
   and p.proname in (select x->>'name' from jsonb_array_elements(source_shapes) x) and not p.oid=any(canonical_oids)) then
  raise exception 'SOURCE_ACL_NOT_COMPARABLE';
 end if;
 for i in 1..8 loop
  shape := source_shapes->(i-1);
  select p.*,l.lanname into strict item from pg_catalog.pg_proc p join pg_catalog.pg_language l on l.oid=p.prolang where p.oid=canonical_oids[i];
  if item.proowner is distinct from owner_role.oid or item.proname is distinct from shape->>'name' or item.pronamespace<>'public'::regnamespace or item.prokind<>'f'
   or item.proretset or item.provariadic<>0 or item.proallargtypes is not null or item.proargmodes is not null
   or item.pronargs<>jsonb_array_length(shape->'types')
   or item.proargtypes::text is distinct from (select coalesce(string_agg((v::regtype)::oid::text,' ' order by n),'') from jsonb_array_elements_text(shape->'types') with ordinality t(v,n))
   or (case when shape->'names'='null'::jsonb then item.proargnames is not null else to_jsonb(item.proargnames) is distinct from shape->'names' end)
   or item.prorettype<>(shape->>'returns')::regtype or item.pronargdefaults<>(shape->>'defaults')::integer
   or pg_catalog.pg_get_expr(item.proargdefaults,0) is distinct from shape->>'default_expr'
   or item.lanname is distinct from shape->>'language' or item.prosecdef is distinct from (shape->>'definer')::boolean
   or item.provolatile::text is distinct from shape->>'volatility' or item.proconfig is distinct from array['search_path=""']::text[]
   or item.proisstrict or item.proleakproof or item.proparallel<>'u' or item.prosupport<>0 or item.procost<>100 or item.prorows<>0
   or item.protrftypes is not null or item.prosqlbody is not null or item.prosrc is distinct from source_bodies[i] then
   raise exception 'SOURCE_ACL_NOT_COMPARABLE';
  end if;
  if i>=6 and (length(item.prosrc)-length(replace(item.prosrc,'auth.uid()','')))/length('auth.uid()')<>call_counts[i-5] then
   raise exception 'SOURCE_ACL_NOT_COMPARABLE';
  end if;
  desired_oid := case desired_roles[i] when 'anon' then anon_oid when 'authenticated' then authenticated_oid else null end;
  intended_grantees := array(select x from unnest(array[owner_role.oid,desired_oid]) x where x is not null order by x);
  select count(*),count(distinct a.grantee),count(*) filter(where a.grantee=owner_role.oid),
   coalesce(bool_and((a.grantor=owner_role.oid and a.grantee is not null and a.privilege_type='EXECUTE' and not a.is_grantable) is true),false),
   array_agg(a.grantee order by a.grantee)
  into acl_count,distinct_grantees,owner_entries,acl_safe,grantees
  from pg_catalog.aclexplode(coalesce(item.proacl,pg_catalog.acldefault('f',item.proowner))) a;
  if not acl_safe or acl_count<>distinct_grantees or owner_entries<>1
   or not (grantees=array[0::oid,owner_role.oid] or grantees=intended_grantees) then
   raise exception 'SOURCE_ACL_NOT_COMPARABLE';
  end if;
  canonical_metadata := array_append(canonical_metadata,(select to_jsonb(p)-'proacl' from pg_catalog.pg_proc p where p.oid=item.oid));
  canonical_definitions := array_append(canonical_definitions,pg_catalog.pg_get_functiondef(item.oid));
 end loop;
 authority_before := jsonb_build_object(
   'owner',(select to_jsonb(r) from pg_catalog.pg_roles r where r.oid=owner_role.oid),
   'executor',(select to_jsonb(r) from pg_catalog.pg_roles r where r.oid=executor_oid),
   'memberships',(select coalesce(jsonb_agg(to_jsonb(m) order by m.roleid,m.member,m.grantor),'[]'::jsonb) from pg_catalog.pg_auth_members m where m.roleid=owner_role.oid or m.member=owner_role.oid),
   'public',(select to_jsonb(n) from pg_catalog.pg_namespace n where n.oid='public'::regnamespace));
 -- End all-eight source-comparable preflight. No role or ACL mutation precedes it.
 execute 'set local role calendar_feed_owner';
 if session_user<>'postgres' or current_user<>'calendar_feed_owner' or authority_before is distinct from jsonb_build_object(
   'owner',(select to_jsonb(r) from pg_catalog.pg_roles r where r.oid=owner_role.oid),
   'executor',(select to_jsonb(r) from pg_catalog.pg_roles r where r.oid=executor_oid),
   'memberships',(select coalesce(jsonb_agg(to_jsonb(m) order by m.roleid,m.member,m.grantor),'[]'::jsonb) from pg_catalog.pg_auth_members m where m.roleid=owner_role.oid or m.member=owner_role.oid),
   'public',(select to_jsonb(n) from pg_catalog.pg_namespace n where n.oid='public'::regnamespace)) then
  raise exception 'SOURCE_ACL_NOT_COMPARABLE';
 end if;
 -- Begin exact owner ACL reconciliation fragment.
 for i in 1..cardinality(canonical_oids) loop
  execute format('revoke all on function %s from public,anon,authenticated,service_role',canonical_oids[i]::regprocedure);
  if desired_roles[i]<>'' then
   execute format('grant execute on function %s to %I',canonical_oids[i]::regprocedure,desired_roles[i]);
  end if;
 end loop;
 -- End exact owner ACL reconciliation fragment.
 execute 'reset role';
 if session_user<>'postgres' or current_user<>'postgres' or authority_before is distinct from jsonb_build_object(
   'owner',(select to_jsonb(r) from pg_catalog.pg_roles r where r.oid=owner_role.oid),
   'executor',(select to_jsonb(r) from pg_catalog.pg_roles r where r.oid=executor_oid),
   'memberships',(select coalesce(jsonb_agg(to_jsonb(m) order by m.roleid,m.member,m.grantor),'[]'::jsonb) from pg_catalog.pg_auth_members m where m.roleid=owner_role.oid or m.member=owner_role.oid),
   'public',(select to_jsonb(n) from pg_catalog.pg_namespace n where n.oid='public'::regnamespace)) then
  raise exception 'SOURCE_ACL_NOT_COMPARABLE';
 end if;
 for i in 1..8 loop
  select * into strict item from pg_catalog.pg_proc where oid=canonical_oids[i];
  if (select to_jsonb(p)-'proacl' from pg_catalog.pg_proc p where p.oid=item.oid) is distinct from canonical_metadata[i]
   or pg_catalog.pg_get_functiondef(item.oid) is distinct from canonical_definitions[i] then
   raise exception 'SOURCE_ACL_NOT_COMPARABLE';
  end if;
  desired_oid := case desired_roles[i] when 'anon' then anon_oid when 'authenticated' then authenticated_oid else null end;
  intended_grantees := array(select x from unnest(array[owner_role.oid,desired_oid]) x where x is not null order by x);
  select count(*),count(distinct a.grantee),count(*) filter(where a.grantee=owner_role.oid),
   coalesce(bool_and((a.grantor=owner_role.oid and a.grantee is not null and a.privilege_type='EXECUTE' and not a.is_grantable) is true),false),
   array_agg(a.grantee order by a.grantee)
  into acl_count,distinct_grantees,owner_entries,acl_safe,grantees
  from pg_catalog.aclexplode(coalesce(item.proacl,pg_catalog.acldefault('f',item.proowner))) a;
  if not acl_safe or acl_count<>distinct_grantees or owner_entries<>1 or grantees is distinct from intended_grantees
   or not pg_catalog.has_function_privilege(owner_role.oid,item.oid,'EXECUTE')
   or pg_catalog.has_function_privilege('anon',item.oid,'EXECUTE') is distinct from (desired_roles[i]='anon')
   or pg_catalog.has_function_privilege('authenticated',item.oid,'EXECUTE') is distinct from (desired_roles[i]='authenticated')
   or pg_catalog.has_function_privilege('service_role',item.oid,'EXECUTE') then
   raise exception 'SOURCE_ACL_NOT_COMPARABLE';
  end if;
 end loop;
 -- The complete original three-function guard/matrix and adapter path follow unchanged.
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
