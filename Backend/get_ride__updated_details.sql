CREATE OR REPLACE FUNCTION get_ride_details_v3(ride_id_param INT) -- Renamed to v2
RETURNS TABLE (
    ride_name TEXT,
    park_name TEXT,
    city TEXT,
    state TEXT,
    manufacturer_name TEXT,
    model_name TEXT,
    height INT4,
    speed INT4,
    ride_time INT4,
    inversions INT2,
    lift_system_name TEXT,
    green_count INT4,
    blue_count INT4,
    black_count INT4,
    double_black_count INT4,
    long float8,
    lat float8

)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.name AS ride_name,
        p.name AS park_name,
        p.city,
        p.state,
        m.name AS manufacturer_name,
        rm.name AS model_name,
        rc.height,
        rc.speed,
        rc.ride_time,
        rc.inversions,
        lst.name AS lift_system_name,
        r.green_count,
        r.blue_count,
        r.black_count,
        r.double_black_count,
        r.long,
        r.lat
    FROM
        ride r
    JOIN
        parks p ON r.park_id = p.id
    JOIN
        manufacturer m ON r.manufacturer_id = m.id
    LEFT JOIN
        roller_coaster rc ON r.id = rc.ride_id
    LEFT JOIN
        ride_model rm ON rc.model = rm.id 
    LEFT JOIN
        lift_system lst ON rc.lift_system = lst.id 
    WHERE
        r.id = ride_id_param;
END;
$$;