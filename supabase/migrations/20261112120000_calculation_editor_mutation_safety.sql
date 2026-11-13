-- 35.8-P: matched application/schema cutover only in the separately authorized pause/drain window.
-- One feature-local immutable result store; no retention/cleanup API or target/actor FK.
begin;
create table public.calculation_editor_operations (
 operation_id uuid primary key,
 tenant_id uuid not null references public.tenants(id) on delete cascade,
 actor_user_id uuid not null,
 operation_kind text not null check(operation_kind in ('calculation.create','calculation.update','calculation.archive','calculation.section.create','calculation.section.update','calculation.section.archive','calculation.row.create','calculation.row.update','calculation.row.archive','calculation.sections.reorder','calculation.rows.reorder','quote.version.create')),
 form_kind text not null,
 protocol_version integer not null check(protocol_version=1),
 request_digest text not null check(request_digest ~ '^[a-f0-9]{64}$'),
 status text not null check(status in ('prepared','committed','closed')),
 calculation_id uuid, parent_id uuid, target_id uuid,
 authorization_id uuid unique, captured_at timestamptz,
 terminal_code text check(terminal_code is null or terminal_code='COMMAND_CONFLICT'),
 quote_id uuid, quote_version_id uuid, quote_number bigint, affected_count integer,
 committed_at timestamptz,
 check ((status='prepared' and committed_at is null and terminal_code is null)
     or (status='committed' and committed_at is not null and terminal_code is null)
     or (status='closed' and committed_at is not null and terminal_code='COMMAND_CONFLICT')),
 check(operation_kind='quote.version.create' or (authorization_id is null and captured_at is null and quote_id is null and quote_version_id is null and quote_number is null))
);
create index calculation_editor_operations_actor_idx on public.calculation_editor_operations(tenant_id,actor_user_id,operation_id);
alter table public.calculation_editor_operations enable row level security;
alter table public.calculation_editor_operations force row level security;
revoke all on table public.calculation_editor_operations from public,anon,authenticated,service_role;
create function public.ce_immutable_internal() returns trigger language plpgsql security invoker set search_path='' as $$
begin
 if old.status<>'prepared' or new.status not in ('committed','closed')
 or (to_jsonb(new)-array['status','target_id','calculation_id','parent_id','terminal_code','quote_id','quote_version_id','quote_number','affected_count','committed_at']) is distinct from
    (to_jsonb(old)-array['status','target_id','calculation_id','parent_id','terminal_code','quote_id','quote_version_id','quote_number','affected_count','committed_at']) then
  raise exception 'immutable editor proof' using errcode='23514';
 end if; return new;
end $$;
create trigger calculation_editor_operations_immutable before update on public.calculation_editor_operations for each row execute function public.ce_immutable_internal();
create function public.ce_shape_internal(v jsonb,allowed text[],required text[]) returns void language plpgsql immutable security invoker set search_path='' as $$
begin
 if jsonb_typeof(v) is distinct from 'object' or not v ?& required or v-allowed <> '{}'::jsonb then raise exception 'invalid editor shape' using errcode='23514';end if;
end $$;
create function public.ce_project_internal(kind text,v jsonb) returns jsonb language plpgsql stable security invoker set search_path='' set timezone='UTC' as $$
declare fields text[]; typed jsonb; result jsonb;
begin
 case kind
 when 'header' then fields:=array['id','title','status','archived_at','tax_input_snapshot']; perform public.ce_shape_internal(v,fields,fields); typed:=to_jsonb(jsonb_populate_record(null::public.calculations,v));
 when 'section' then fields:=array['id','title','display_mode','sort_order','archived_at']; perform public.ce_shape_internal(v,fields,fields); typed:=to_jsonb(jsonb_populate_record(null::public.calculation_sections,v));
 when 'row' then fields:=array['id','section_id','row_type','quantity','unit','unit_cost_ore','unit_sell_ore','markup_bp','vat_rate_bp','included_in_invoice_total','deduction_classification','vat_type','is_hidden','is_optional','is_selected','label','description','internal_note','quote_note','sort_order','source_kind','source_id','source_name','source_price_ore','source_cost_ore','source_updated_at','source_captured_at','source_sku','source_unit']; perform public.ce_shape_internal(v,fields,fields); typed:=to_jsonb(jsonb_populate_record(null::public.calculation_rows,v));
 else raise exception 'invalid editor projection' using errcode='23514';end case;
 select jsonb_object_agg(k,typed->k) into result from unnest(fields) k;
 if result->>'id' is null then raise exception 'invalid editor target' using errcode='23514';end if;
 return result;
end $$;
create function public.ce_pick_internal(v jsonb,fields text[]) returns jsonb language sql immutable security invoker set search_path='' as $$
 select coalesce(jsonb_object_agg(k,v->k),'{}'::jsonb) from unnest(fields) k
$$;
create function public.ce_expected_internal(kind text,e jsonb) returns jsonb language plpgsql stable security invoker set search_path='' set timezone='UTC' as $$
declare fields text[]; form text; normalized jsonb; items jsonb; item jsonb; trees jsonb:='[]'; normalized_rows jsonb;
begin
 case kind
 when 'calculation.create' then form:='calculation';fields:=array['version','form','customer_id','facility_id','contact_id'];
 when 'calculation.update' then form:=e->>'form';fields:=array['version','form','header']; if form not in ('calculation','tax_input') then raise exception 'invalid form' using errcode='23514';end if;
 when 'calculation.archive' then form:='archive_calculation';fields:=array['version','form','header','sections'];
 when 'calculation.section.create' then form:='section';fields:=array['version','form','header'];
 when 'calculation.section.update' then form:='section';fields:=array['version','form','header','section'];
 when 'calculation.section.archive' then form:='archive_section';fields:=array['version','form','header','section','rows'];
 when 'calculation.row.create' then form:='row';fields:=array['version','form','header','section'];
 when 'calculation.row.update' then form:='row';fields:=array['version','form','header','section','row'];
 when 'calculation.row.archive' then form:='archive_row';fields:=array['version','form','header','section','row'];
 when 'calculation.sections.reorder' then form:='reorder_sections';fields:=array['version','form','header','siblings'];
 when 'calculation.rows.reorder' then form:='reorder_rows';fields:=array['version','form','header','siblings'];
 when 'quote.version.create' then form:='reviewed-initial-quote';fields:=array['version','form','reviewed_snapshot_digest','reviewed_quote_capture_date','attachment_file_ids'];
 else raise exception 'invalid editor kind' using errcode='23514';end case;
 perform public.ce_shape_internal(e,fields,fields);
 if e->'version' is distinct from '1'::jsonb or e->>'form' is distinct from form then raise exception 'invalid editor version/form' using errcode='23514';end if;
 normalized:=jsonb_set(e,'{version}','1'::jsonb);
 if kind='calculation.create' then
  normalized:=normalized||jsonb_build_object('customer_id',(e->>'customer_id')::uuid,'facility_id',(e->>'facility_id')::uuid,'contact_id',(e->>'contact_id')::uuid);
 end if;
 if kind='quote.version.create' then
  if jsonb_typeof(e->'attachment_file_ids') is distinct from 'array' then raise exception 'invalid expected attachments' using errcode='23514';end if;
  select coalesce(jsonb_agg(to_jsonb(value::uuid) order by ord),'[]'::jsonb) into items from jsonb_array_elements_text(e->'attachment_file_ids') with ordinality x(value,ord);
  normalized:=jsonb_set(normalized,'{attachment_file_ids}',items);
 end if;
 if e?'header' then normalized:=jsonb_set(normalized,'{header}',public.ce_project_internal('header',e->'header'));end if;
 if e?'section' then normalized:=jsonb_set(normalized,'{section}',public.ce_project_internal('section',e->'section'));end if;
 if e?'row' then normalized:=jsonb_set(normalized,'{row}',public.ce_project_internal('row',e->'row'));end if;
 if e?'rows' then
  if jsonb_typeof(e->'rows') is distinct from 'array' or jsonb_array_length(e->'rows')>500 then raise exception 'invalid expected rows' using errcode='23514';end if;
  select coalesce(jsonb_agg(public.ce_project_internal('row',x) order by (x->>'id')::uuid),'[]'::jsonb) into items from jsonb_array_elements(e->'rows') x;
  normalized:=jsonb_set(normalized,'{rows}',items);
 end if;
 if e?'sections' then
  if jsonb_typeof(e->'sections') is distinct from 'array' or jsonb_array_length(e->'sections')>1000 then raise exception 'invalid expected sections' using errcode='23514';end if;
  for item in select x from jsonb_array_elements(e->'sections') x order by (x->'section'->>'id')::uuid loop
   perform public.ce_shape_internal(item,array['section','rows'],array['section','rows']);
   if jsonb_typeof(item->'rows') is distinct from 'array' or jsonb_array_length(item->'rows')>500 then raise exception 'invalid subtree' using errcode='23514';end if;
   select coalesce(jsonb_agg(public.ce_project_internal('row',x) order by (x->>'id')::uuid),'[]'::jsonb) into normalized_rows from jsonb_array_elements(item->'rows') x;
   trees:=trees||jsonb_build_array(jsonb_build_object('section',public.ce_project_internal('section',item->'section'),'rows',normalized_rows));
  end loop;
  normalized:=jsonb_set(normalized,'{sections}',trees);
 end if;
 if e?'siblings' then
  if jsonb_typeof(e->'siblings') is distinct from 'array' or jsonb_array_length(e->'siblings')>1000 then raise exception 'invalid siblings' using errcode='23514';end if;
  for item in select x from jsonb_array_elements(e->'siblings') x loop
   perform public.ce_shape_internal(item,array['id','sort_order'],array['id','sort_order']);
   if jsonb_typeof(item->'id') is distinct from 'string' or jsonb_typeof(item->'sort_order') is distinct from 'number' or (item->>'sort_order') !~ '^-?[0-9]+$' then raise exception 'invalid sibling' using errcode='23514';end if;
   perform (item->>'id')::uuid;
  end loop;
  if (select count(*)<>count(distinct x->>'id') from jsonb_array_elements(e->'siblings') x) then raise exception 'duplicate sibling' using errcode='23514';end if;
  select coalesce(jsonb_agg(jsonb_build_object('id',(x->>'id')::uuid,'sort_order',(x->>'sort_order')::integer) order by (x->>'id')::uuid),'[]'::jsonb) into items from jsonb_array_elements(e->'siblings') x;
  normalized:=jsonb_set(normalized,'{siblings}',items);
 end if;
 return normalized;
end $$;
create function public.ce_input_internal(kind text,input jsonb,operation uuid) returns jsonb language plpgsql stable security invoker set search_path='' set timezone='UTC' as $$
declare allowed text[]; required text[]; domain jsonb; typed jsonb; k text; keys text[]; e jsonb; ids jsonb; value jsonb;
begin
 case kind
 when 'calculation.create' then allowed:=array['customer_id','facility_id','contact_id','title']; required:=array['customer_id','title'];
 when 'calculation.update' then allowed:=array['id','title','status','tax_input_snapshot'];required:=array['id'];
 when 'calculation.archive' then allowed:=array['id'];required:=allowed;
 when 'calculation.section.create' then allowed:=array['calculation_id','title','display_mode'];required:=array['calculation_id'];
 when 'calculation.section.update' then allowed:=array['id','title','display_mode'];required:=array['id'];
 when 'calculation.section.archive' then allowed:=array['id'];required:=allowed;
 when 'calculation.row.create' then allowed:=array['section_id','row_type','quantity','unit','unit_cost_ore','unit_sell_ore','markup_bp','vat_rate_bp','included_in_invoice_total','deduction_classification','vat_type','is_hidden','is_optional','is_selected','label','description','internal_note','quote_note','source_kind','source_id'];required:=array['section_id','row_type','quantity','unit','vat_rate_bp'];
 when 'calculation.row.update' then allowed:=array['id','row_type','quantity','unit','unit_cost_ore','unit_sell_ore','markup_bp','vat_rate_bp','included_in_invoice_total','deduction_classification','vat_type','is_hidden','is_optional','is_selected','label','description','internal_note','quote_note','source_kind','source_id','source_clear'];required:=array['id'];
 when 'calculation.row.archive' then allowed:=array['id'];required:=allowed;
 when 'calculation.sections.reorder' then allowed:=array['calculation_id','ordered_section_ids'];required:=allowed;
 when 'calculation.rows.reorder' then allowed:=array['section_id','ordered_row_ids'];required:=allowed;
 when 'quote.version.create' then allowed:=array['calculation_id','attachment_file_ids','reviewed_snapshot_digest','reviewed_quote_capture_date'];required:=allowed;
 else raise exception 'invalid editor kind' using errcode='23514';end case;
 perform public.ce_shape_internal(input,allowed||array['operation_id','expected'],required||array['operation_id','expected']);
 if operation is null or (input->>'operation_id')::uuid is distinct from operation then raise exception 'invalid operation identity' using errcode='23514';end if;
 e:=public.ce_expected_internal(kind,input->'expected');
 domain:=input-array['operation_id','expected'];
 -- Optional nulls/empty strings follow existing TypeScript omission semantics.
 foreach k in array allowed loop
  value:=domain->k;
  if not k=any(required) and (value='null'::jsonb or value='""'::jsonb) then domain:=domain-k;end if;
 end loop;
 for k,value in select * from jsonb_each(domain) loop
  if k in ('id','customer_id','facility_id','contact_id','calculation_id','section_id','source_id') then
   if jsonb_typeof(value) is distinct from 'string' then raise exception 'invalid uuid' using errcode='23514';end if;
   domain:=jsonb_set(domain,array[k],to_jsonb((domain->>k)::uuid));
  elsif k in ('title','unit','label','description','internal_note','quote_note') then
   if jsonb_typeof(value) is distinct from 'string' or length(domain->>k)>case when k in ('description','internal_note','quote_note') then 2000 else 256 end then raise exception 'invalid editor text' using errcode='23514';end if;
   if k in ('title','unit') then
    if btrim(domain->>k)='' then raise exception 'empty editor text' using errcode='23514';end if;
    domain:=jsonb_set(domain,array[k],to_jsonb(btrim(domain->>k)));
   end if;
  elsif k in ('unit_cost_ore','unit_sell_ore','markup_bp','vat_rate_bp') then
   if jsonb_typeof(value) is distinct from 'number' or (domain->>k)::numeric<0 or (domain->>k)::numeric<>trunc((domain->>k)::numeric) or (domain->>k)::numeric>case when k='markup_bp' then 1000000 when k='vat_rate_bp' then 10000 else 9007199254740991 end then raise exception 'invalid editor number' using errcode='23514';end if;
  elsif k='quantity' then
   if jsonb_typeof(value) is distinct from 'number' or (domain->>k)::numeric<=0 then raise exception 'invalid quantity' using errcode='23514';end if;
  elsif k in ('is_hidden','is_optional','is_selected','included_in_invoice_total','source_clear') then
   if jsonb_typeof(value) is distinct from 'boolean' then raise exception 'invalid editor boolean' using errcode='23514';end if;
  elsif k='tax_input_snapshot' then
   if not public.is_story_10_6_tax_input_v2(value) then raise exception 'invalid tax snapshot' using errcode='23514';end if;
  elsif k='row_type' and domain->>k not in ('labor','material','subcontractor','machinery','other') then raise exception 'invalid row type' using errcode='23514';
  elsif k='display_mode' and domain->>k not in ('detailed','summary','text_only') then raise exception 'invalid display mode' using errcode='23514';
  elsif k='status' and domain->>k not in ('draft','ready','archived') then raise exception 'invalid status' using errcode='23514';
  elsif k='source_kind' and domain->>k not in ('work_role','article') then raise exception 'invalid source kind' using errcode='23514';
  end if;
 end loop;
 if (domain?'source_kind') is distinct from (domain?'source_id') or ((domain->>'source_clear')::boolean is true and domain?'source_id') then raise exception 'invalid source pair' using errcode='23514';end if;
 if kind like 'calculation.row.%' and domain?'source_kind' and domain?'row_type' and domain->>'source_kind' is distinct from case domain->>'row_type' when 'labor' then 'work_role' when 'material' then 'article' else null end then raise exception 'invalid source type' using errcode='23514';end if;
 if kind like 'calculation.row.%' then
  select array_agg(key) into keys from jsonb_each(domain) where key not in ('source_clear');
  typed:=to_jsonb(jsonb_populate_record(null::public.calculation_rows,domain));
 elsif kind like 'calculation.section.%' then typed:=to_jsonb(jsonb_populate_record(null::public.calculation_sections,domain));select array_agg(key) into keys from jsonb_each(domain);
 elsif kind in ('calculation.create','calculation.update','calculation.archive') then typed:=to_jsonb(jsonb_populate_record(null::public.calculations,domain));select array_agg(key) into keys from jsonb_each(domain);
 end if;
 if typed is not null then
  domain:=public.ce_pick_internal(typed,keys)||case when domain?'source_clear' then jsonb_build_object('source_clear',domain->'source_clear') else '{}'::jsonb end;
 end if;
 foreach k in array array['ordered_section_ids','ordered_row_ids','attachment_file_ids'] loop
  if domain?k then
   if jsonb_typeof(domain->k) is distinct from 'array' or jsonb_array_length(domain->k)>case when k='attachment_file_ids' then 100 else 1000 end or (k<>'attachment_file_ids' and jsonb_array_length(domain->k)=0) then raise exception 'invalid id list' using errcode='23514';end if;
   select coalesce(jsonb_agg(to_jsonb(value::uuid) order by ord),'[]'::jsonb) into ids from jsonb_array_elements_text(domain->k) with ordinality x(value,ord);
   if (select count(*)<>count(distinct value) from jsonb_array_elements_text(ids)) then raise exception 'duplicate id' using errcode='23514';end if;
   domain:=jsonb_set(domain,array[k],ids);
  end if;
 end loop;
 if kind='quote.version.create' then
  if jsonb_typeof(domain->'reviewed_snapshot_digest') is distinct from 'string' or domain->>'reviewed_snapshot_digest' !~ '^[a-f0-9]{64}$'
   or jsonb_typeof(domain->'reviewed_quote_capture_date') is distinct from 'string' or domain->>'reviewed_quote_capture_date' !~ '^[0-9]{4}-[0-9]{2}-[0-9]{2}$' then raise exception 'invalid quote review' using errcode='23514';end if;
  perform (domain->>'reviewed_quote_capture_date')::date;
  if (e-array['version','form']) is distinct from (domain-array['calculation_id']) then raise exception 'quote expected binding mismatch' using errcode='23514';end if;
 elsif kind='calculation.update' and (e->>'form'='tax_input') is distinct from (domain?'tax_input_snapshot') then raise exception 'invalid update form' using errcode='23514';
 elsif kind='calculation.create' and (e-array['version','form']) is distinct from jsonb_build_object('customer_id',domain->'customer_id','facility_id',domain->'facility_id','contact_id',domain->'contact_id') then raise exception 'invalid parent facts' using errcode='23514';end if;
 return domain||jsonb_build_object('operation_id',operation,'expected',e);
exception when invalid_text_representation or numeric_value_out_of_range or datetime_field_overflow then raise exception 'invalid typed editor input' using errcode='23514';
end $$;

-- Tenant mutation gate precedes operation lookup/replay, matching the established
-- tenant-operation/membership-role lock order. Operation UUID lock is global.
create function public.ce_gate_internal(tenant uuid,actor uuid,kind text) returns void language plpgsql volatile security invoker set search_path='' as $$
begin
 if auth.uid() is null or auth.uid() is distinct from actor or tenant is null then raise exception 'editor denied' using errcode='42501';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(tenant::text,0));
 perform 1 from public.tenant_memberships m where m.tenant_id=tenant and m.user_id=actor order by m.id for share;
 perform 1 from public.membership_roles r join public.tenant_memberships m on m.id=r.membership_id and m.tenant_id=r.tenant_id where m.tenant_id=tenant and m.user_id=actor order by r.id for share of r;
 if kind='quote.version.create' then perform public.story_11_2_assert_quote_roles(tenant,actor,array['tenant_admin','projektledare','saljare']::text[]);
 elsif kind in ('calculation.create','calculation.update','calculation.archive','calculation.section.create','calculation.section.update','calculation.section.archive','calculation.row.create','calculation.row.update','calculation.row.archive','calculation.sections.reorder','calculation.rows.reorder') then perform public.story_11_2_assert_calculation_roles(tenant,actor);
 else raise exception 'invalid editor kind' using errcode='23514';end if;
end $$;
create function public.ce_proof_internal(op public.calculation_editor_operations) returns jsonb language plpgsql stable security invoker set search_path='' as $$
declare available boolean:=false;
begin
 if op.status='prepared' then return jsonb_build_object('operationId',op.operation_id,'status','unconfirmed');end if;
 if op.status='closed' then return jsonb_build_object('operationId',op.operation_id,'status','closed','code',op.terminal_code);end if;
 if op.operation_kind='quote.version.create' then
  available:=exists(select 1 from public.quote_versions v where v.tenant_id=op.tenant_id and v.id=op.quote_version_id and v.quote_id=op.quote_id);
 elsif op.operation_kind like 'calculation.row.%' then
  available:=exists(select 1 from public.calculation_rows r join public.calculation_sections s on s.id=r.section_id and s.tenant_id=r.tenant_id join public.calculations c on c.id=s.calculation_id and c.tenant_id=s.tenant_id where r.tenant_id=op.tenant_id and r.id=op.target_id);
 elsif op.operation_kind like 'calculation.section.%' or op.operation_kind='calculation.rows.reorder' then
  available:=exists(select 1 from public.calculation_sections s join public.calculations c on c.id=s.calculation_id and c.tenant_id=s.tenant_id where s.tenant_id=op.tenant_id and s.id=op.target_id);
 else available:=exists(select 1 from public.calculations c where c.tenant_id=op.tenant_id and c.id=op.target_id);end if;
 return jsonb_strip_nulls(jsonb_build_object('operationId',op.operation_id,'status','committed','targetAvailable',available,
  'targetId',case when available then op.target_id end,'quoteId',case when available then op.quote_id end,
  'quoteNumber',case when available then op.quote_number end,'affectedCount',op.affected_count,'committedAt',op.committed_at));
end $$;
create function public.ce_request_internal(tenant uuid,actor uuid,operation uuid,kind text,input jsonb) returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare normalized jsonb; digest text; op public.calculation_editor_operations;
begin
 perform public.ce_gate_internal(tenant,actor,kind);
 normalized:=public.ce_input_internal(kind,input,operation);
 digest:=encode(extensions.digest(jsonb_build_object('protocol',1,'tenant',tenant,'actor',actor,'kind',kind,'input',normalized)::text,'sha256'),'hex');
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended('calculation-editor/'||operation::text,0));
 select * into op from public.calculation_editor_operations o where o.operation_id=operation for update;
 if found then
  if op.tenant_id is distinct from tenant or op.actor_user_id is distinct from actor then raise exception 'editor denied' using errcode='42501';end if;
  if op.operation_kind is distinct from kind or op.request_digest is distinct from digest then raise exception 'editor identity conflict' using errcode='CE409';end if;
  return jsonb_build_object('input',normalized,'digest',digest,'exists',true,'proof',public.ce_proof_internal(op));
 end if;
 return jsonb_build_object('input',normalized,'digest',digest,'exists',false);
end $$;
create function public.ce_finish_internal(operation uuid,target uuid,calculation uuid,parent uuid,count integer,closed boolean default false) returns jsonb language plpgsql volatile security invoker set search_path='' as $$
declare op public.calculation_editor_operations;
begin
 update public.calculation_editor_operations o set status=case when closed then 'closed' else 'committed' end,
  terminal_code=case when closed then 'COMMAND_CONFLICT' end,target_id=target,calculation_id=calculation,parent_id=parent,
  affected_count=count,committed_at=clock_timestamp() where o.operation_id=operation and o.status='prepared' returning * into op;
 if not found then raise exception 'editor terminal state conflict' using errcode='CE409';end if;
 return public.ce_proof_internal(op);
end $$;
create function public.mutate_calculation_editor(p_tenant_id uuid,p_actor_user_id uuid,p_operation_id uuid,p_kind text,p_input jsonb,p_captured_at timestamptz) returns jsonb
language plpgsql volatile security definer set search_path='' set timezone='UTC' set lock_timeout='5s' set statement_timeout='20s' as $$
declare request jsonb; input jsonb; expected jsonb; patch jsonb; current_header jsonb; current_section jsonb; current_row jsonb;
 c public.calculations; sec public.calculation_sections; r public.calculation_rows; role_source public.work_roles; article_source public.articles;
 calculation uuid; parent uuid; target uuid; stale boolean:=false; siblings jsonb; rows jsonb; trees jsonb; desired uuid[]; actual uuid[]; count integer:=1; k text;
begin
 if p_captured_at is null or not isfinite(p_captured_at) then raise exception 'invalid editor capture' using errcode='23514';end if;
 if p_kind='quote.version.create' then raise exception 'wrong editor endpoint' using errcode='23514';end if;
 request:=public.ce_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,p_kind,p_input);
 if (request->>'exists')::boolean then return request->'proof';end if;
 input:=request->'input';expected:=input->'expected';patch:=input-array['operation_id','expected','id','calculation_id','section_id'];
 insert into public.calculation_editor_operations(operation_id,tenant_id,actor_user_id,operation_kind,form_kind,protocol_version,request_digest,status)
 values(p_operation_id,p_tenant_id,p_actor_user_id,p_kind,expected->>'form',1,request->>'digest','prepared');
 if p_kind='calculation.create' then
  -- The existing checked helper rechecks all same-tenant parent links and owns audit.
  target:=public.create_calculation_with_audit(p_tenant_id,p_actor_user_id,p_operation_id,(input->>'customer_id')::uuid,(input->>'facility_id')::uuid,(input->>'contact_id')::uuid,input->>'title');
  return public.ce_finish_internal(p_operation_id,target,target,null,1);
 end if;
 -- Resolve ancestry without treating that pre-read as expected-state authority.
 if p_kind like 'calculation.row.%' and p_kind<>'calculation.row.create' then
  select * into r from public.calculation_rows x where x.tenant_id=p_tenant_id and x.id=(input->>'id')::uuid;
  if not found then raise exception 'editor target denied' using errcode='42501';end if;parent:=r.section_id;
 elsif p_kind='calculation.row.create' or p_kind='calculation.rows.reorder' then parent:=(input->>'section_id')::uuid;
 elsif p_kind in ('calculation.section.update','calculation.section.archive') then parent:=(input->>'id')::uuid;
 else calculation:=coalesce((input->>'calculation_id')::uuid,(input->>'id')::uuid);end if;
 if parent is not null then
  select * into sec from public.calculation_sections x where x.tenant_id=p_tenant_id and x.id=parent;
  if not found then raise exception 'editor parent denied' using errcode='42501';end if;calculation:=sec.calculation_id;
 end if;
 select * into c from public.calculations x where x.tenant_id=p_tenant_id and x.id=calculation for update;
 if not found then raise exception 'editor calculation denied' using errcode='42501';end if;
 -- Root, then all sections, then all rows in stable ID order. This serializes every
 -- admitted editor effect and freezes archive membership before comparing it.
 perform 1 from public.calculation_sections x where x.tenant_id=p_tenant_id and x.calculation_id=calculation order by x.id for update;
 perform 1 from public.calculation_rows x join public.calculation_sections s on s.id=x.section_id and s.tenant_id=x.tenant_id where x.tenant_id=p_tenant_id and s.calculation_id=calculation order by x.id for update of x;
 current_header:=public.ce_project_internal('header',public.ce_pick_internal(to_jsonb(c),array['id','title','status','archived_at','tax_input_snapshot']));
 if parent is not null then
  select * into sec from public.calculation_sections x where x.tenant_id=p_tenant_id and x.id=parent and x.calculation_id=calculation;
  if not found then raise exception 'editor parent changed' using errcode='CE409';end if;
  current_section:=public.ce_project_internal('section',public.ce_pick_internal(to_jsonb(sec),array['id','title','display_mode','sort_order','archived_at']));
 end if;
 if p_kind like 'calculation.row.%' and p_kind<>'calculation.row.create' then
  select * into r from public.calculation_rows x where x.tenant_id=p_tenant_id and x.id=(input->>'id')::uuid and x.section_id=parent;
  if not found then raise exception 'editor row changed' using errcode='CE409';end if;
  current_row:=public.ce_project_internal('row',public.ce_pick_internal(to_jsonb(r),array['id','section_id','row_type','quantity','unit','unit_cost_ore','unit_sell_ore','markup_bp','vat_rate_bp','included_in_invoice_total','deduction_classification','vat_type','is_hidden','is_optional','is_selected','label','description','internal_note','quote_note','sort_order','source_kind','source_id','source_name','source_price_ore','source_cost_ore','source_updated_at','source_captured_at','source_sku','source_unit']));
 end if;
 -- Lifecycle is always expected; header edits compare only their actual write set.
 stale:=(expected->'header'->'id' is distinct from current_header->'id') or (expected->'header'->'status' is distinct from current_header->'status') or (expected->'header'->'archived_at' is distinct from current_header->'archived_at');
 if p_kind='calculation.update' then
  foreach k in array array['title','status','tax_input_snapshot'] loop
   if input?k and expected->'header'->k is distinct from current_header->k then stale:=true;end if;
  end loop;
 elsif p_kind='calculation.archive' then
  stale:=stale or expected->'header' is distinct from current_header;
  select coalesce(jsonb_agg(jsonb_build_object('section',public.ce_project_internal('section',public.ce_pick_internal(to_jsonb(s),array['id','title','display_mode','sort_order','archived_at'])),'rows',
   (select coalesce(jsonb_agg(public.ce_project_internal('row',public.ce_pick_internal(to_jsonb(x),array['id','section_id','row_type','quantity','unit','unit_cost_ore','unit_sell_ore','markup_bp','vat_rate_bp','included_in_invoice_total','deduction_classification','vat_type','is_hidden','is_optional','is_selected','label','description','internal_note','quote_note','sort_order','source_kind','source_id','source_name','source_price_ore','source_cost_ore','source_updated_at','source_captured_at','source_sku','source_unit'])) order by x.id),'[]'::jsonb) from public.calculation_rows x where x.tenant_id=p_tenant_id and x.section_id=s.id and x.archived_at is null)) order by s.id),'[]'::jsonb)
   into trees from public.calculation_sections s where s.tenant_id=p_tenant_id and s.calculation_id=calculation and s.archived_at is null;
  stale:=stale or trees is distinct from expected->'sections';
 end if;
 if expected?'section' then stale:=stale or expected->'section' is distinct from current_section;end if;
 if expected?'row' then stale:=stale or expected->'row' is distinct from current_row or r.archived_at is not null;end if;
 if expected?'rows' then
  select coalesce(jsonb_agg(public.ce_project_internal('row',public.ce_pick_internal(to_jsonb(x),array['id','section_id','row_type','quantity','unit','unit_cost_ore','unit_sell_ore','markup_bp','vat_rate_bp','included_in_invoice_total','deduction_classification','vat_type','is_hidden','is_optional','is_selected','label','description','internal_note','quote_note','sort_order','source_kind','source_id','source_name','source_price_ore','source_cost_ore','source_updated_at','source_captured_at','source_sku','source_unit'])) order by x.id),'[]'::jsonb) into rows from public.calculation_rows x where x.tenant_id=p_tenant_id and x.section_id=parent and x.archived_at is null;
  stale:=stale or rows is distinct from expected->'rows';
 end if;
 if expected?'siblings' then
  if p_kind='calculation.sections.reorder' then
   select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'sort_order',x.sort_order) order by x.id),'[]'::jsonb),coalesce(array_agg(x.id order by x.id),'{}'::uuid[]) into siblings,actual from public.calculation_sections x where x.tenant_id=p_tenant_id and x.calculation_id=calculation and x.archived_at is null;
   select array_agg(value::uuid order by ord) into desired from jsonb_array_elements_text(input->'ordered_section_ids') with ordinality t(value,ord);
  else
   select coalesce(jsonb_agg(jsonb_build_object('id',x.id,'sort_order',x.sort_order) order by x.id),'[]'::jsonb),coalesce(array_agg(x.id order by x.id),'{}'::uuid[]) into siblings,actual from public.calculation_rows x where x.tenant_id=p_tenant_id and x.section_id=parent and x.archived_at is null;
   select array_agg(value::uuid order by ord) into desired from jsonb_array_elements_text(input->'ordered_row_ids') with ordinality t(value,ord);
  end if;
  stale:=stale or siblings is distinct from expected->'siblings';
  if (select array_agg(x order by x) from unnest(desired) x) is distinct from actual then stale:=true;end if;
 end if;
 if c.archived_at is not null or (parent is not null and sec.archived_at is not null) then stale:=true;end if;
 if stale then return public.ce_finish_internal(p_operation_id,null,calculation,parent,0,true);end if;
 case p_kind
 when 'calculation.update' then
  target:=c.id;
  if patch<>'{}'::jsonb then perform public.update_calculation_with_audit(p_tenant_id,p_actor_user_id,p_operation_id,c.id,patch);end if;
 when 'calculation.archive' then target:=public.archive_calculation_with_audit(p_tenant_id,p_actor_user_id,p_operation_id,c.id,p_captured_at);
 when 'calculation.section.create' then
  insert into public.calculation_sections(tenant_id,calculation_id,title,display_mode,sort_order)
  select p_tenant_id,c.id,input->>'title',coalesce(input->>'display_mode','detailed'),coalesce(max(x.sort_order),-1)+1 from public.calculation_sections x where x.tenant_id=p_tenant_id and x.calculation_id=c.id and x.archived_at is null returning id into target;
 when 'calculation.section.update' then
  target:=sec.id; update public.calculation_sections x set title=case when input?'title' then input->>'title' else x.title end,display_mode=case when input?'display_mode' then input->>'display_mode' else x.display_mode end where x.id=sec.id and x.tenant_id=p_tenant_id;
 when 'calculation.section.archive' then target:=sec.id;update public.calculation_sections x set archived_at=p_captured_at where x.id=sec.id and x.tenant_id=p_tenant_id;
 when 'calculation.row.archive' then target:=r.id;update public.calculation_rows x set archived_at=p_captured_at where x.id=r.id and x.tenant_id=p_tenant_id;
 when 'calculation.sections.reorder' then
  target:=c.id;count:=cardinality(desired);update public.calculation_sections x set sort_order=t.ord-1 from unnest(desired) with ordinality t(id,ord) where x.id=t.id and x.tenant_id=p_tenant_id and x.calculation_id=c.id;
 when 'calculation.rows.reorder' then
  target:=sec.id;count:=cardinality(desired);update public.calculation_rows x set sort_order=t.ord-1 from unnest(desired) with ordinality t(id,ord) where x.id=t.id and x.tenant_id=p_tenant_id and x.section_id=sec.id;
 else
  -- Resolve effective persisted/source facts only after the root and descendant locks.
  if p_kind='calculation.row.create' then
   select count(*)::integer into count from public.calculation_rows x join public.calculation_sections s on s.id=x.section_id and s.tenant_id=x.tenant_id where x.tenant_id=p_tenant_id and s.calculation_id=c.id and x.archived_at is null and s.archived_at is null;
   if count>=500 then raise exception 'calculation row limit' using errcode='23514';end if;
   patch:=jsonb_build_object('tenant_id',p_tenant_id,'section_id',sec.id,'row_type',input->'row_type','quantity',input->'quantity','unit',input->'unit','vat_rate_bp',input->'vat_rate_bp','vat_type',coalesce(input->'vat_type','"STANDARD_VAT_25"'::jsonb),'deduction_classification',coalesce(input->'deduction_classification','"NONE"'::jsonb),'is_hidden',coalesce(input->'is_hidden','false'::jsonb),'is_optional',coalesce(input->'is_optional','false'::jsonb),'is_selected',input->'is_selected','included_in_invoice_total',coalesce(input->'included_in_invoice_total',to_jsonb(case when coalesce((input->>'is_optional')::boolean,false) then coalesce((input->>'is_selected')::boolean,false) else true end)),'tax_reconciliation_required',false,'tax_reconciliation_reason',null)||patch;
  else
   patch:=to_jsonb(r)||patch;
   if input?'is_selected' and not input?'included_in_invoice_total' and coalesce((input->>'is_optional')::boolean,r.is_optional) and (input->>'is_selected')::boolean is distinct from r.is_selected then patch:=jsonb_set(patch,'{included_in_invoice_total}',input->'is_selected');end if;
   if (input?'vat_type') is distinct from (input?'vat_rate_bp') and r.tax_reconciliation_required then raise exception 'explicit VAT repair required' using errcode='23514';end if;
   if input?'vat_type' and input?'vat_rate_bp' then patch:=patch||jsonb_build_object('tax_reconciliation_required',false,'tax_reconciliation_reason',null);end if;
  end if;
  if input?'source_kind' then
   if input->>'source_kind' is distinct from case patch->>'row_type' when 'labor' then 'work_role' when 'material' then 'article' end then raise exception 'source kind mismatch' using errcode='23514';end if;
   if input->>'source_kind'='work_role' then
    select * into role_source from public.work_roles x where x.tenant_id=p_tenant_id and x.id=(input->>'source_id')::uuid for share;
    if not found then raise exception 'source denied' using errcode='42501';end if;
    patch:=patch||jsonb_build_object('source_kind','work_role','source_id',role_source.id,'source_name',role_source.display_name,'source_price_ore',role_source.sell_rate_ore,'source_cost_ore',role_source.cost_rate_ore,'source_updated_at',role_source.updated_at,'source_captured_at',p_captured_at,'source_sku',null,'source_unit',null);
   else
    select * into article_source from public.articles x where x.tenant_id=p_tenant_id and x.id=(input->>'source_id')::uuid for share;
    if not found then raise exception 'source denied' using errcode='42501';end if;
    patch:=patch||jsonb_build_object('source_kind','article','source_id',article_source.id,'source_name',article_source.name,'source_price_ore',article_source.unit_price_ore,'source_cost_ore',null,'source_updated_at',article_source.updated_at,'source_captured_at',p_captured_at,'source_sku',article_source.sku,'source_unit',article_source.unit);
   end if;
  elsif p_kind='calculation.row.create' or (input->>'source_clear')::boolean is true then
   patch:=patch||jsonb_build_object('source_kind',null,'source_id',null,'source_name',null,'source_price_ore',null,'source_cost_ore',null,'source_updated_at',null,'source_captured_at',null,'source_sku',null,'source_unit',null);
  end if;
  r:=jsonb_populate_record(null::public.calculation_rows,patch);
  if p_kind='calculation.row.create' then
   insert into public.calculation_rows(tenant_id,section_id,sort_order,row_type,quantity,unit,unit_cost_ore,unit_sell_ore,markup_bp,vat_rate_bp,included_in_invoice_total,deduction_classification,vat_type,is_hidden,is_optional,is_selected,label,description,internal_note,quote_note,source_kind,source_id,source_name,source_price_ore,source_cost_ore,source_updated_at,source_captured_at,source_sku,source_unit,tax_reconciliation_required,tax_reconciliation_reason)
   select p_tenant_id,sec.id,coalesce(max(x.sort_order),-1)+1,r.row_type,r.quantity,r.unit,r.unit_cost_ore,r.unit_sell_ore,r.markup_bp,r.vat_rate_bp,r.included_in_invoice_total,r.deduction_classification,r.vat_type,r.is_hidden,r.is_optional,r.is_selected,r.label,r.description,r.internal_note,r.quote_note,r.source_kind,r.source_id,r.source_name,r.source_price_ore,r.source_cost_ore,r.source_updated_at,r.source_captured_at,r.source_sku,r.source_unit,r.tax_reconciliation_required,r.tax_reconciliation_reason from public.calculation_rows x where x.tenant_id=p_tenant_id and x.section_id=sec.id and x.archived_at is null returning id into target;
  else
   target:=r.id;update public.calculation_rows x set row_type=r.row_type,quantity=r.quantity,unit=r.unit,unit_cost_ore=r.unit_cost_ore,unit_sell_ore=r.unit_sell_ore,markup_bp=r.markup_bp,vat_rate_bp=r.vat_rate_bp,included_in_invoice_total=r.included_in_invoice_total,deduction_classification=r.deduction_classification,vat_type=r.vat_type,is_hidden=r.is_hidden,is_optional=r.is_optional,is_selected=r.is_selected,label=r.label,description=r.description,internal_note=r.internal_note,quote_note=r.quote_note,source_kind=r.source_kind,source_id=r.source_id,source_name=r.source_name,source_price_ore=r.source_price_ore,source_cost_ore=r.source_cost_ore,source_updated_at=r.source_updated_at,source_captured_at=r.source_captured_at,source_sku=r.source_sku,source_unit=r.source_unit,tax_reconciliation_required=r.tax_reconciliation_required,tax_reconciliation_reason=r.tax_reconciliation_reason where x.id=r.id and x.tenant_id=p_tenant_id;
  end if;
 end case;
 return public.ce_finish_internal(p_operation_id,target,c.id,parent,case when p_kind like '%.reorder' then count else 1 end);
end $$;

create function public.authorize_calculation_editor_quote(p_tenant_id uuid,p_actor_user_id uuid,p_operation_id uuid,p_input jsonb,p_review jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' set timezone='UTC' set lock_timeout='5s' set statement_timeout='20s' as $$
declare request jsonb; input jsonb; authorization uuid; captured timestamptz; supplied_ids jsonb; op public.calculation_editor_operations;
begin
 request:=public.ce_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,'quote.version.create',p_input);
 if (request->>'exists')::boolean then return request->'proof';end if;
 input:=request->'input';
 perform public.ce_shape_internal(p_review,array['p_calculation_id','p_captured_at','p_customer_id','p_facility_id','p_contact_id','p_snapshot','p_lines','p_attachments','p_reviewed_quote_capture_date','p_reviewed_calculation_status','p_reviewed_readiness_rows'],array['p_calculation_id','p_captured_at','p_customer_id','p_facility_id','p_contact_id','p_snapshot','p_lines','p_attachments','p_reviewed_quote_capture_date','p_reviewed_calculation_status','p_reviewed_readiness_rows']);
 if (p_review->>'p_calculation_id')::uuid is distinct from (input->>'calculation_id')::uuid or p_review->>'p_reviewed_quote_capture_date' is distinct from input->>'reviewed_quote_capture_date'
  or jsonb_typeof(p_review->'p_attachments') is distinct from 'array' then raise exception 'review binding mismatch' using errcode='23514';end if;
 select coalesce(jsonb_agg(to_jsonb((x->>'fileId')::uuid) order by ord),'[]'::jsonb) into supplied_ids from jsonb_array_elements(p_review->'p_attachments') with ordinality t(x,ord);
 if supplied_ids is distinct from input->'attachment_file_ids' then raise exception 'attachment selection mismatch' using errcode='23514';end if;
 captured:=(p_review->>'p_captured_at')::timestamptz;
 if captured is null or not isfinite(captured) then raise exception 'invalid quote capture' using errcode='23514';end if;
 -- Lock root before calling the established role-specific source/review validators.
 perform 1 from public.calculations c where c.tenant_id=p_tenant_id and c.id=(input->>'calculation_id')::uuid for update;
 if not found then raise exception 'quote source denied' using errcode='42501';end if;
 perform 1 from public.calculation_sections s where s.tenant_id=p_tenant_id and s.calculation_id=(input->>'calculation_id')::uuid order by s.id for update;
 perform 1 from public.calculation_rows r join public.calculation_sections s on s.id=r.section_id and s.tenant_id=r.tenant_id where r.tenant_id=p_tenant_id and s.calculation_id=(input->>'calculation_id')::uuid order by r.id for update of r;
 if public.has_tenant_role(p_tenant_id,array['tenant_admin','projektledare']::text[]) then
  authorization:=public.authorize_quote_initial_review(p_tenant_id,(input->>'calculation_id')::uuid,captured,(p_review->>'p_customer_id')::uuid,(p_review->>'p_facility_id')::uuid,(p_review->>'p_contact_id')::uuid,p_review->'p_snapshot',p_review->'p_lines',p_review->'p_attachments',(input->>'reviewed_quote_capture_date')::date,p_review->>'p_reviewed_calculation_status',p_review->'p_reviewed_readiness_rows',p_actor_user_id,p_operation_id);
 else
  authorization:=public.authorize_quote_initial_customer_visible_review(p_tenant_id,(input->>'calculation_id')::uuid,captured,(p_review->>'p_customer_id')::uuid,(p_review->>'p_facility_id')::uuid,(p_review->>'p_contact_id')::uuid,p_review->'p_snapshot',p_review->'p_lines',p_review->'p_attachments',(input->>'reviewed_quote_capture_date')::date,p_review->>'p_reviewed_calculation_status',p_actor_user_id,p_operation_id);
 end if;
 insert into public.calculation_editor_operations(operation_id,tenant_id,actor_user_id,operation_kind,form_kind,protocol_version,request_digest,status,calculation_id,authorization_id,captured_at)
 values(p_operation_id,p_tenant_id,p_actor_user_id,'quote.version.create','reviewed-initial-quote',1,request->>'digest','prepared',(input->>'calculation_id')::uuid,authorization,captured) returning * into op;
 return public.ce_proof_internal(op);
end $$;
create function public.create_calculation_editor_quote(p_tenant_id uuid,p_actor_user_id uuid,p_operation_id uuid,p_input jsonb) returns jsonb
language plpgsql volatile security definer set search_path='' set timezone='UTC' set lock_timeout='5s' set statement_timeout='20s' as $$
declare request jsonb; op public.calculation_editor_operations; a public.quote_review_authorizations; revision jsonb; q uuid; v uuid; number bigint;
begin
 request:=public.ce_request_internal(p_tenant_id,p_actor_user_id,p_operation_id,'quote.version.create',p_input);
 if not (request->>'exists')::boolean then return jsonb_build_object('operationId',p_operation_id,'status','unconfirmed');end if;
 -- ce_request holds both UUID transaction lock and the latest operation row lock.
 select * into op from public.calculation_editor_operations o where o.operation_id=p_operation_id for update;
 if op.status<>'prepared' then return public.ce_proof_internal(op);end if;
 select * into a from public.quote_review_authorizations x where x.id=op.authorization_id for update;
 if not found or a.tenant_id is distinct from p_tenant_id or a.actor_user_id is distinct from p_actor_user_id
  or a.correlation_id is distinct from p_operation_id or a.captured_at is distinct from op.captured_at or a.calculation_id is distinct from op.calculation_id then raise exception 'quote operation denied' using errcode='42501';end if;
 -- Known stale/expired closure is committed only after failed domain work has
 -- rolled back inside this subtransaction. Unexpected faults roll back everything.
 begin
  perform 1 from public.calculations c where c.tenant_id=p_tenant_id and c.id=op.calculation_id for update;
  if not found then raise exception 'quote source changed' using errcode='QV409';end if;
  perform 1 from public.calculation_sections s where s.tenant_id=p_tenant_id and s.calculation_id=op.calculation_id order by s.id for update;
  perform 1 from public.calculation_rows r join public.calculation_sections s on s.id=r.section_id and s.tenant_id=r.tenant_id where r.tenant_id=p_tenant_id and s.calculation_id=op.calculation_id order by r.id for update of r;
  begin
  perform public.assert_story_10_6_line_sources(a.tenant_id,a.calculation_id,a.lines_payload);
  perform public.assert_story_10_6_reviewed_source(a.tenant_id,a.calculation_id,a.customer_id,a.facility_id,a.contact_id,a.snapshot_payload,a.attachments_payload,repeat('0',64),a.reviewed_quote_capture_date,a.reviewed_calculation_status,a.reviewed_readiness_rows,(a.captured_at at time zone 'Europe/Stockholm')::date);
  revision:=public.story_10_8_calculation_source_revision(a.tenant_id,a.calculation_id,a.customer_id,a.facility_id,a.contact_id,a.attachments_payload);
  if revision is distinct from a.source_revision then raise exception 'quote source changed' using errcode='QV409';end if;
  exception when check_violation then raise exception 'reviewed source changed' using errcode='QV409';end;
  -- Acquire the existing numbering row before the real wall-clock check. New
  -- initial creators already serialize on the established tenant-operation lock.
  insert into public.tenant_counters(tenant_id,counter_name,current_value) values(p_tenant_id,'quote_number',0)
  on conflict(tenant_id,counter_name) do update set current_value=public.tenant_counters.current_value;
  -- The upsert also locks an initially absent counter key before checking expiry.
  if a.purpose<>'initial_creation' or a.consumed_at is not null or a.expires_at<=clock_timestamp() then raise exception 'quote review expired' using errcode='QV401';end if;
  -- Existing implementation still owns one-time consume, source/file locks,
  -- numbering, quote/version/event/audit writes and their rollback semantics.
  select x.quote_id,x.quote_version_id,x.quote_number into q,v,number from public.create_quote_version_from_calculation(p_tenant_id,op.authorization_id,op.captured_at,p_actor_user_id,p_operation_id) x;
  if q is null or v is null or number is null then raise exception 'missing quote result';end if;
 exception when sqlstate 'QV401' or sqlstate 'QV409' then
  return public.ce_finish_internal(p_operation_id,null,op.calculation_id,null,0,true);
 end;
 update public.calculation_editor_operations o set status='committed',target_id=v,quote_id=q,quote_version_id=v,quote_number=number,affected_count=1,committed_at=clock_timestamp()
 where o.operation_id=p_operation_id and o.status='prepared' returning * into op;
 if not found then raise exception 'closed quote operation' using errcode='CE409';end if;
 return public.ce_proof_internal(op);
end $$;
create function public.reconcile_calculation_editor_operation(p_operation_id uuid) returns jsonb
language plpgsql volatile security definer set search_path='' set timezone='UTC' set lock_timeout='5s' set statement_timeout='20s' as $$
declare tenant uuid; actor uuid:=auth.uid(); op public.calculation_editor_operations;
begin
 if actor is null or p_operation_id is null then raise exception 'editor denied' using errcode='42501';end if;
 -- Resolve live active membership before reading any operation, without accepting
 -- a client tenant or using identity as a bearer capability.
 select m.tenant_id into tenant from public.tenant_memberships m where m.user_id=actor and m.status='active';
 if tenant is null or (select count(*) from public.tenant_memberships m where m.user_id=actor and m.status='active')<>1 then raise exception 'editor denied' using errcode='42501';end if;
 perform pg_catalog.pg_advisory_xact_lock(pg_catalog.hashtextextended(tenant::text,0));
 perform 1 from public.tenant_memberships m where m.tenant_id=tenant and m.user_id=actor order by m.id for share;
 perform 1 from public.membership_roles r join public.tenant_memberships m on m.id=r.membership_id and m.tenant_id=r.tenant_id where m.tenant_id=tenant and m.user_id=actor order by r.id for share of r;
 if not public.has_tenant_role(tenant,array['tenant_admin','projektledare','saljare']::text[]) then raise exception 'editor denied' using errcode='42501';end if;
 -- Read-only: absence and preparation are always unconfirmed. No expiration or
 -- closure is inferred from an observer's clock and no row is reserved here.
 select * into op from public.calculation_editor_operations o where o.operation_id=p_operation_id;
 if not found then return jsonb_build_object('operationId',p_operation_id,'status','unconfirmed');end if;
 if op.tenant_id is distinct from tenant or op.actor_user_id is distinct from actor then raise exception 'editor denied' using errcode='42501';end if;
 perform public.ce_gate_internal(tenant,actor,op.operation_kind);
 return public.ce_proof_internal(op);
end $$;
-- Exact matched-app/schema cutover: no old unchecked application route survives.
revoke insert,update,delete on public.calculations,public.calculation_sections,public.calculation_rows from authenticated;
do $$ declare f record; begin
 for f in select p.oid::regprocedure signature from pg_proc p where p.pronamespace='public'::regnamespace and
 (p.proname like 'ce_%_internal' or p.proname in ('create_calculation_with_audit','update_calculation_with_audit','archive_calculation_with_audit','reorder_calculation_rows','reorder_calculation_sections','authorize_quote_initial_review','authorize_quote_initial_customer_visible_review','create_quote_version_from_calculation','mutate_calculation_editor','authorize_calculation_editor_quote','create_calculation_editor_quote','reconcile_calculation_editor_operation')) loop
  execute format('revoke all on function %s from public,anon,authenticated,service_role',f.signature);
 end loop;
end $$;
grant execute on function public.mutate_calculation_editor(uuid,uuid,uuid,text,jsonb,timestamptz),public.authorize_calculation_editor_quote(uuid,uuid,uuid,jsonb,jsonb),public.create_calculation_editor_quote(uuid,uuid,uuid,jsonb),public.reconcile_calculation_editor_operation(uuid) to authenticated;
commit;
