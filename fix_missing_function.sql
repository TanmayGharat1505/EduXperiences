-- FIX MISSING FUNCTION - This will resolve your 409 Conflict errors
-- The function handle_requirement_tutor_match is missing, causing the duplicate key violations

-- ==========================================
-- STEP 1: CREATE THE MISSING FUNCTION
-- ==========================================
CREATE OR REPLACE FUNCTION handle_requirement_tutor_match(
    p_requirement_id UUID,
    p_tutor_id UUID,
    p_status TEXT,
    p_response_message TEXT DEFAULT NULL,
    p_proposed_rate DECIMAL(10,2) DEFAULT NULL,
    p_proposed_schedule TEXT DEFAULT NULL
) RETURNS JSONB AS $$
DECLARE
    v_existing_id UUID;
    v_result JSONB;
BEGIN
    -- First, check if a match already exists
    SELECT id INTO v_existing_id
    FROM requirement_tutor_matches
    WHERE requirement_id = p_requirement_id 
    AND tutor_id = p_tutor_id;
    
    IF v_existing_id IS NOT NULL THEN
        -- Update existing match
        UPDATE requirement_tutor_matches 
        SET 
            status = p_status,
            response_message = COALESCE(p_response_message, response_message),
            proposed_rate = COALESCE(p_proposed_rate, proposed_rate),
            proposed_schedule = COALESCE(p_proposed_schedule, proposed_schedule),
            updated_at = NOW()
        WHERE id = v_existing_id;
        
        v_result := jsonb_build(
            'action', 'updated',
            'match_id', v_existing_id,
            'status', p_status
        );
    ELSE
        -- Insert new match
        INSERT INTO requirement_tutor_matches (
            requirement_id,
            tutor_id,
            status,
            response_message,
            proposed_rate,
            proposed_schedule
        ) VALUES (
            p_requirement_id,
            p_tutor_id,
            p_status,
            p_response_message,
            p_proposed_rate,
            p_proposed_schedule
        ) RETURNING id INTO v_existing_id;
        
        v_result := jsonb_build(
            'action', 'inserted',
            'match_id', v_existing_id,
            'status', p_status
        );
    END IF;
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION handle_requirement_tutor_match(UUID, UUID, TEXT, TEXT, DECIMAL, TEXT) TO authenticated;

-- ==========================================
-- STEP 2: VERIFY FUNCTION CREATION
-- ==========================================
SELECT 
    'FUNCTION_CREATED' as status,
    'handle_requirement_tutor_match function is now available' as message;
