-- Manage one apartment (Unit 1) per floor, as requested by the owner.
-- 6 towers × 33 floors = 198 managed entries. Existing Unit 2 records are preserved.
begin;
insert into public.apartments(tower,floor,unit,status)
select t.tower,f.floor,1,'Available'
from unnest(array['A','B','C','D','E','F']) as t(tower)
cross join generate_series(1,33) as f(floor)
on conflict(tower,floor,unit) do nothing;
notify pgrst, 'reload schema';
commit;
