CREATE OR REPLACE FUNCTION get_park_details(park_id_param integer)
RETURNS TABLE (
  name text,
  city text,
  state text,
  rides text
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    p.name,
    p.city,
    p.state,
    COALESCE(string_agg(r.name, ', ' ORDER BY r.name), '') AS rides
  FROM
    parks p
  LEFT JOIN
    ride r ON r.park_id = p.id
  WHERE
    p.id = park_id_param
  GROUP BY
    p.name, p.city, p.state;
END;
$$ LANGUAGE plpgsql;