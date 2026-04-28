CREATE OR REPLACE FUNCTION public.increment_ride_count(
  p_ride_id int,
  p_button text
)
RETURNS TABLE(green_count int, blue_count int, black_count int, double_black_count int)
LANGUAGE plpgsql
SECURITY INVOKER
AS $$
DECLARE
  updated_ride record;
BEGIN
  IF p_button = 'green_circle' THEN
    UPDATE public.ride
    SET green_count = ride.green_count + 1
    WHERE id = p_ride_id;
  ELSIF p_button = 'blue_square' THEN
    UPDATE public.ride
    SET blue_count = ride.blue_count + 1
    WHERE id = p_ride_id;
  ELSIF p_button = 'black_diamond' THEN
    UPDATE public.ride
    SET black_count = ride.black_count + 1
    WHERE id = p_ride_id;
  ELSIF p_button = 'double_black_diamond' THEN
    UPDATE public.ride
    SET double_black_count = ride.double_black_count + 1
    WHERE id = p_ride_id;
  ELSE
    RAISE EXCEPTION 'Invalid button value: %', p_button
      USING errcode = '22023';
  END IF;

  -- Return the updated counts
  RETURN QUERY
  SELECT r.green_count, r.blue_count, r.black_count, r.double_black_count
  FROM public.ride r
  WHERE r.id = p_ride_id;
END;
$$;