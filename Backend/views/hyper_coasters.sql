CREATE OR REPLACE VIEW hyper_coasters AS
SELECT
    r.id,
    r.name,
    p.name as park_name,
    m.name as manufacturer_name
FROM
    ride r
JOIN
    roller_coaster rc ON r.id = rc.ride_id
JOIN
    ride_model rm ON rc.model = rm.id
JOIN
    parks p ON r.park_id = p.id
JOIN
    manufacturer m ON r.manufacturer_id = m.id
WHERE
    rc.height >= 200 AND rc.height <= 299;