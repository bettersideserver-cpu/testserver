-- Run in the CM Infinia SQL Editor. Exposes availability only, never buyer data.
begin;
create or replace function public.cm_available_apartments()
returns table(tower text, floor integer, unit integer)
language sql stable security definer set search_path = '' as $$
  select a.tower,a.floor,a.unit from public.apartments a
  where lower(a.status)='available' and a.tower in ('A','B','C','D','E','F')
    and a.floor between 1 and 33 and a.unit=1
  order by a.tower,a.floor,a.unit
$$;
revoke all on function public.cm_available_apartments() from public;
grant execute on function public.cm_available_apartments() to anon,authenticated;
create or replace function public.cm_validate_hold() returns trigger
language plpgsql security definer set search_path = '' as $$
begin
  if not exists(select 1 from public.apartments a where a.tower=new.tower
    and a.floor=new.floor and a.unit=new.unit and a.unit=1
    and a.tower in ('A','B','C','D','E','F') and a.floor between 1 and 33
    and lower(a.status)='available') then
    raise exception 'This apartment is not available for a hold request';
  end if;
  return new;
end $$;
drop trigger if exists cm_validate_hold on public.hold_requests;
create trigger cm_validate_hold before insert on public.hold_requests
for each row execute function public.cm_validate_hold();
notify pgrst, 'reload schema';
commit;
