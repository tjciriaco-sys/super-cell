create or replace function public.claim_first_admin(setup_token text, owner_name text)
returns boolean language plpgsql security definer
set search_path = ''
as $$
declare
  expected_token text;
  caller uuid;
begin
  caller := (select auth.uid());
  if caller is null then raise exception 'authentication required'; end if;
  if exists (select 1 from public.admin_profiles) then raise exception 'owner already configured'; end if;
  select value #>> '{}' into expected_token from public.commercial_settings where key = 'owner_setup_token';
  if expected_token is null or expected_token <> setup_token then raise exception 'invalid setup token'; end if;
  insert into public.admin_profiles(user_id, full_name, role, active) values (caller, nullif(trim(owner_name),''), 'owner', true);
  delete from public.commercial_settings where key = 'owner_setup_token';
  execute 'revoke execute on function public.claim_first_admin(text,text) from authenticated';
  return true;
end;
$$;
revoke all on function public.claim_first_admin(text,text) from public, anon;
grant execute on function public.claim_first_admin(text,text) to authenticated;
