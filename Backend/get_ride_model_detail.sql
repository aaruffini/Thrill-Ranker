
BEGIN
  RETURN QUERY
  SELECT
    rm."desc"
  FROM ride_model rm
  WHERE rm.id = ride_model_id;
END;
