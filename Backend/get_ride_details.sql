create or replace function get_ride_details(
  search_term text
)
returns table (
  name text,
  park_id bigint,
  manufactuer_id bigint,
  ride_type int,
  ride_long double precision,
  ride_lat double precision,
  model text,
  height double precision,
  speed double precision,
  lift_system text,
  ride_time double precision,
  inversions int
)
language sql
as $$
  select
    r.name,
    r.park_id,
    r.manufacturer_id,
    r.ride_type,
    r."long" as ride_long,
    r.lat as ride_lat,

    ro.model,
    ro.height,
    ro.speed,
    ro.lift_system,
    ro.ride_time,
    ro.inversions
  from ride as r
  join roller_coaster as ro
    on ro.ride_id = r.id
  where r.ride_type = 1
    and r.name ilike '%' || search_term || '%'
  limit 100;
$$;