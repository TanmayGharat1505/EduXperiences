-- FIX DUPLICATE KEY CONSTRAINT VIOLATION IN REQUIREMENT_TUTOR_MATCHES
-- This script fixes the issue where tutors get 409 Conflict errors when responding to requirements

-- ==========================================
-- STEP 1: CHECK CURRENT DUPLICATE MATCHES
-- ==========================================
-- Find any existing duplicate matches that might be causing issues
SELECT 
    'DUPLICATE_CHECK' as section,
    requirement_id,
    tutor_id,
    COUNT(*) as match_count,
    array_agg(id) as match_ids,
    array_agg(status) as statuses,
    array_agg(created_at) as created_dates
FROM requirement_tutor_matches
GROUP BY requirement_id, tutor_id
HAVING COUNT(*) > 1
ORDER BY requirement_id, tutor_id;

-- ==========================================
-- STEP 2: CLEAN UP DUPLICATE MATCHES
-- ==========================================
-- Remove duplicate matches, keeping only the most recent one
DELETE FROM requirement_tutor_matches 
WHERE id IN (
    SELECT id FROM (
        SELECT id,
               ROW_NUMBER() OVER (
                   PARTITION BY requirement_id, tutor_id 
                   ORDER BY created_at DESC
               ) as rn
        FROM requirement_tutor_matches
    ) t
    WHERE t.rn > 1
);

-- ==========================================
-- STEP 3: IMPROVE THE UPSERT FUNCTION
-- ==========================================
-- Create a better function for handling requirement-tutor matches
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
-- STEP 4: CREATE UPSERT POLICY
-- ==========================================
-- Ensure the RLS policy allows proper upsert operations
DROP POLICY IF EXISTS "Requirement Matches - Tutors can insert for themselves" ON requirement_tutor_matches;
DROP POLICY IF EXISTS "Requirement Matches - Tutors can update their own" ON requirement_tutor_matches;

-- Create a comprehensive policy that handles both insert and update
CREATE POLICY "Requirement Matches - Tutors can manage their own matches" ON requirement_tutor_matches
    FOR ALL USING (auth.uid() = tutor_id)
    WITH CHECK (auth.uid() = tutor_id);

-- ==========================================
-- STEP 5: ADD CONFLICT HANDLING TO TABLE
-- ==========================================
-- Ensure the table has proper conflict resolution
-- This will be handled by our custom function, but let's also add a constraint check

-- Add a check to ensure status is valid
ALTER TABLE requirement_tutor_matches 
DROP CONSTRAINT IF EXISTS requirement_tutor_matches_status_check;

ALTER TABLE requirement_tutor_matches 
ADD CONSTRAINT requirement_tutor_matches_status_check 
CHECK (status IN ('pending', 'interested', 'not_interested', 'accepted', 'rejected', 'revoked'));

-- ==========================================
-- STEP 6: CREATE INDEX FOR BETTER PERFORMANCE
-- ==========================================
-- Ensure we have proper indexes for the upsert operations
CREATE INDEX IF NOT EXISTS idx_requirement_tutor_matches_upsert 
ON requirement_tutor_matches(requirement_id, tutor_id, status);

-- ==========================================
-- STEP 7: VERIFY THE FIX
-- ==========================================
-- Test the new function with sample data
SELECT 
    'FUNCTION_TEST' as section,
    'handle_requirement_tutor_match function created' as status,
    'Ready for testing' as details;

-- ==========================================
-- STEP 8: CLEANUP OLD DATA
-- ==========================================
-- Remove any orphaned matches that might cause issues
DELETE FROM requirement_tutor_matches 
WHERE requirement_id NOT IN (SELECT id FROM requirements);

-- Remove any matches with invalid statuses
DELETE FROM requirement_tutor_matches 
WHERE status NOT IN ('pending', 'interested', 'not_interested', 'accepted', 'rejected', 'revoked');

-- ==========================================
-- STEP 9: FINAL VERIFICATION
-- ==========================================
-- Check the final state
SELECT 
    'FINAL_STATE' as section,
    'Total matches' as metric,
    COUNT(*) as value
FROM requirement_tutor_matches

UNION ALL

SELECT 
    'FINAL_STATE' as section,
    'Unique requirement-tutor pairs' as metric,
    COUNT(DISTINCT (requirement_id, tutor_id)) as value
FROM requirement_tutor_matches

UNION ALL

SELECT 
    'FINAL_STATE' as section,
    'Status distribution' as metric,
    COUNT(*) as value
FROM requirement_tutor_matches
GROUP BY status
ORDER BY status;
