-- Apply to an existing CM Infinia project.
-- All signed-in Auth accounts can manage inventory and visitor data.
-- Tour visitor form submissions do not create Auth accounts.
begin;
create or replace function public.is_cm_admin() returns boolean
language sql stable set search_path = '' as $$
  select coalesce(auth.jwt()->>'role' = 'authenticated', false)
$$;
notify pgrst, 'reload schema';
commit;
