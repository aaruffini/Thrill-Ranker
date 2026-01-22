CREATE OR REPLACE FUNCTION get_ride_details(ride_id_param INT)
RETURNS TABLE (
    ride_name TEXT,
    park_name TEXT,
    city TEXT,
    state TEXT,
    manufacturer_name TEXT,
    min_rider_height INT2,
    model TEXT,
    height FLOAT4,
    top_speed FLOAT4,
    material TEXT,
    seat TEXT,
    lift_angle INT2,
    drop_angle FLOAT4,
    ride_time INT2,
    inversion_count INT2,
    lift_system TEXT
)
LANGUAGE plpgsql
AS $$
BEGIN
    RETURN QUERY
    SELECT
        r.name,
        p.name,
        p.city,
        p.state,
        m.name,
        r.min_rider_height,
        rc.model,
        rc.height,
        rc.top_speed,
        rc.material,
        rc.seat,
        rc.lift_angle,
        rc.drop_angle,
        rc.ride_time,
        rc.inversion_count,
        rc.lift_system
    FROM
        ride AS r
    LEFT JOIN
        park AS p ON r.park_id = p.id
    LEFT JOIN
        manufacturer AS m ON r.manufacturer_id = m.id
    LEFT JOIN
        rollercoaster AS rc ON r.id = rc.ride_id
    WHERE
        r.id = ride_id_param;
END;
$$;