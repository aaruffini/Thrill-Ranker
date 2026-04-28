CREATE OR REPLACE FUNCTION public.handle_user_vote(
  p_ride_id int,
  p_vote_type text
)
RETURNS TABLE(green_count int, blue_count int, black_count int, double_black_count int)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_user_id uuid := auth.uid();
  v_old_vote_type text;
BEGIN
  -- Check if the user has already voted on this ride
  SELECT vote_type INTO v_old_vote_type
  FROM public.user_votes
  WHERE user_id = v_user_id AND ride_id = p_ride_id;

  -- If the user has voted before
  IF FOUND THEN
    -- If the new vote is the same as the old one, do nothing (or maybe allow un-voting in the future)
    IF v_old_vote_type = p_vote_type THEN
      -- Optional: Could add logic here to remove a vote if clicked again
      NULL;
    ELSE
      -- Decrement the old vote count
      EXECUTE format('UPDATE public.ride SET %I = %I - 1 WHERE id = %L', v_old_vote_type || '_count', v_old_vote_type || '_count', p_ride_id);
      
      -- Increment the new vote count
      EXECUTE format('UPDATE public.ride SET %I = %I + 1 WHERE id = %L', p_vote_type || '_count', p_vote_type || '_count', p_ride_id);

      -- Update the user's vote
      UPDATE public.user_votes
      SET vote_type = p_vote_type, created_at = NOW()
      WHERE user_id = v_user_id AND ride_id = p_ride_id;
    END IF;
  -- If this is a new vote
  ELSE
    -- Increment the new vote count
    EXECUTE format('UPDATE public.ride SET %I = %I + 1 WHERE id = %L', p_vote_type || '_count', p_vote_type || '_count', p_ride_id);

    -- Record the new vote
    INSERT INTO public.user_votes (user_id, ride_id, vote_type)
    VALUES (v_user_id, p_ride_id, p_vote_type);
  END IF;

  -- Return the updated counts for the ride
  RETURN QUERY
  SELECT r.green_count, r.blue_count, r.black_count, r.double_black_count
  FROM public.ride r
  WHERE r.id = p_ride_id;
END;
$$;
