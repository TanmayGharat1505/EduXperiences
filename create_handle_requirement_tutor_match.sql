-- CREATE THE MISSING handle_requirement_tutor_match FUNCTION
-- This function handles upserts for requirement-tutor matches

CREATE OR REPLACE FUNCTION handle_requirement_tutor_match(
  p_requirement_id UUID,
  p_tutor_id UUID,
  p_status TEXT,
  p_response_message TEXT DEFAULT NULL,
  p_proposed_rate DECIMAL DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_existing_match_id UUID;
  v_result JSONB;
BEGIN
  -- Check if a match already exists
  SELECT id INTO v_existing_match_id
  FROM requirement_tutor_matches
  WHERE requirement_id = p_requirement_id AND tutor_id = p_tutor_id;
  
  IF v_existing_match_id IS NOT NULL THEN
    -- Update existing match
    UPDATE requirement_tutor_matches
    SET 
      status = p_status,
      response_message = COALESCE(p_response_message, response_message),
      proposed_rate = COALESCE(p_proposed_rate, proposed_rate),
      updated_at = NOW()
    WHERE id = v_existing_match_id;
    
    v_result := jsonb_build_object(
      'action', 'updated',
      'match_id', v_existing_match_id,
      'status', p_status,
      'message', 'Existing match updated successfully'
    );
  ELSE
    -- Insert new match
    INSERT INTO requirement_tutor_matches (
      requirement_id,
      tutor_id,
      status,
      response_message,
      proposed_rate,
      created_at,
      updated_at
    ) VALUES (
      p_requirement_id,
      p_tutor_id,
      p_status,
      p_response_message,
      p_proposed_rate,
      NOW(),
      NOW()
    );
    
    v_result := jsonb_build_object(
      'action', 'inserted',
      'match_id', currval(pg_get_serial_sequence('requirement_tutor_matches', 'id')),
      'status', p_status,
      'message', 'New match created successfully'
    );
  END IF;
  
  RETURN v_result;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION handle_requirement_tutor_match(UUID, UUID, TEXT, TEXT, DECIMAL) TO authenticated;

-- Grant execute permission to anon users (if needed)
GRANT EXECUTE ON FUNCTION handle_requirement_tutor_match(UUID, UUID, TEXT, TEXT, DECIMAL) TO anon;
