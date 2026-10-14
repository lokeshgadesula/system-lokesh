-- Add optional recruiter contact details while keeping the existing three-argument
-- identity RPC available during the static-site deployment transition.
begin;

alter table public.portfolio_visitor_identity
  add column email text check (length(email) <= 254),
  add column phone text check (length(phone) <= 40);

create function public.portfolio_identify_visitor(
  p_session_id uuid,
  p_name text,
  p_company text,
  p_email text,
  p_phone text
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare inserted integer;
begin
  if not public.portfolio_request_allowed()
    or p_session_id is null
    or length(coalesce(p_name,'')) > 80
    or length(coalesce(p_company,'')) > 120
    or length(coalesce(p_email,'')) > 254
    or length(coalesce(p_phone,'')) > 40 then
    return jsonb_build_object('accepted',false);
  end if;

  p_name := nullif(trim(coalesce(p_name,'')),'');
  p_company := nullif(trim(coalesce(p_company,'')),'');
  p_email := nullif(trim(coalesce(p_email,'')),'');
  p_phone := nullif(trim(coalesce(p_phone,'')),'');
  -- Match the form contract at the database boundary. Optional contact details
  -- never make an otherwise incomplete identity submission valid.
  if p_name is null or p_company is null then
    return jsonb_build_object('accepted',false);
  end if;

  perform 1 from public.portfolio_sessions where id = p_session_id for update;
  if not found then return jsonb_build_object('accepted',false); end if;

  insert into public.portfolio_visitor_identity(session_id,name,company,email,phone)
  values(p_session_id,p_name,p_company,p_email,p_phone) on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 1 then
    insert into public.portfolio_events(id,session_id,event_type,path,metadata)
    values(gen_random_uuid(),p_session_id,'visitor_identified','/',jsonb_build_object(
      'hasName',p_name is not null,
      'hasCompany',p_company is not null,
      'hasEmail',p_email is not null,
      'hasPhone',p_phone is not null
    ));
  end if;
  return jsonb_build_object('accepted',true);
end;
$$;

revoke all on function public.portfolio_identify_visitor(uuid,text,text,text,text) from public,anon,authenticated;
grant execute on function public.portfolio_identify_visitor(uuid,text,text,text,text) to anon;

commit;
