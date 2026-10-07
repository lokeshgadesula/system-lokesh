-- Add the optional Universe Mode interaction events to the existing analytics API.
-- This migration changes no visitor data and keeps the same origin, rate-limit,
-- session ownership, and role permission checks as the initial migration.
begin;

alter table public.portfolio_events
  drop constraint if exists portfolio_events_event_type_check;

alter table public.portfolio_events
  add constraint portfolio_events_event_type_check check (event_type in (
    'page_view','session_started','section_viewed','project_viewed','resume_opened',
    'resume_downloaded','recruiter_mode_opened','universe_button_clicked',
    'universe_launch','universe_exit','contact_clicked','github_clicked',
    'linkedin_clicked','visitor_identified','engaged_visitor'
  ));

create or replace function public.portfolio_record_event(
  p_session_id uuid, p_event_type text, p_path text, p_metadata jsonb, p_event_id uuid
) returns jsonb language plpgsql security definer set search_path = ''
as $$
declare
  allowed constant text[] := array[
    'page_view','session_started','section_viewed','project_viewed','resume_opened',
    'resume_downloaded','recruiter_mode_opened','universe_button_clicked',
    'universe_launch','universe_exit','contact_clicked','github_clicked',
    'linkedin_clicked','engaged_visitor'
  ];
  inserted integer;
begin
  if not public.portfolio_request_allowed() or p_event_type is null or not(p_event_type = any(allowed))
    or p_event_id is null or p_session_id is null or length(coalesce(p_path,'')) > 300
    or p_metadata is null or jsonb_typeof(p_metadata) <> 'object' or octet_length(p_metadata::text) > 4096 then
    return jsonb_build_object('accepted',false);
  end if;

  perform 1 from public.portfolio_sessions where id = p_session_id for update;
  if not found then return jsonb_build_object('accepted',false); end if;

  if exists(
      select 1 from public.portfolio_events
      where id = p_event_id and session_id = p_session_id and event_type = p_event_type
    ) or (
      p_event_type in ('session_started','engaged_visitor','resume_opened') and exists(
        select 1 from public.portfolio_events
        where session_id = p_session_id and event_type = p_event_type
      )
    ) then
    return jsonb_build_object('accepted',true,'newly_engaged',false);
  end if;

  if (
    select count(*) from public.portfolio_events
    where session_id = p_session_id and created_at > now() - interval '10 minutes'
  ) >= 120 then
    return jsonb_build_object('accepted',false);
  end if;

  insert into public.portfolio_events(id,session_id,event_type,path,metadata)
  values(p_event_id,p_session_id,p_event_type,coalesce(p_path,'/'),p_metadata)
  on conflict do nothing;
  get diagnostics inserted = row_count;
  if inserted = 0 then return jsonb_build_object('accepted',false); end if;

  update public.portfolio_sessions
  set last_seen_at = now(),
      page_views = page_views + case when p_event_type = 'page_view' then 1 else 0 end,
      engaged_at = case
        when p_event_type = 'engaged_visitor' then coalesce(engaged_at,now())
        else engaged_at
      end
  where id = p_session_id;

  return jsonb_build_object(
    'accepted',true,
    'newly_engaged',p_event_type = 'engaged_visitor'
  );
end;
$$;

revoke all on function public.portfolio_record_event(uuid,text,text,jsonb,uuid)
  from public,anon,authenticated;
grant execute on function public.portfolio_record_event(uuid,text,text,jsonb,uuid)
  to anon;

commit;
