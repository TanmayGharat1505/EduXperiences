-- Add revoke interest functionality for tutors
-- This migration adds support for tutors to revoke their interest in student requirements

-- Add new status for revoked interests
ALTER TABLE requirement_tutor_matches 
ADD COLUMN IF NOT EXISTS revoked_at TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS revoke_reason TEXT;

-- Update the status check constraint to include 'revoked'
ALTER TABLE requirement_tutor_matches 
DROP CONSTRAINT IF EXISTS requirement_tutor_matches_status_check;

ALTER TABLE requirement_tutor_matches 
ADD CONSTRAINT requirement_tutor_matches_status_check 
CHECK (status IN ('pending', 'interested', 'not_interested', 'accepted', 'rejected', 'revoked'));

-- Create index for revoked interests
CREATE INDEX IF NOT EXISTS idx_requirement_tutor_matches_revoked ON requirement_tutor_matches(revoked_at);

-- Create function to revoke tutor interest
CREATE OR REPLACE FUNCTION revoke_tutor_interest(
    p_requirement_id UUID,
    p_tutor_id UUID,
    p_revoke_reason TEXT DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_current_status TEXT;
    v_student_id UUID;
BEGIN
    -- Check if the match exists and get current status
    SELECT rtm.status, r.student_id INTO v_current_status, v_student_id
    FROM requirement_tutor_matches rtm
    JOIN requirements r ON rtm.requirement_id = r.id
    WHERE rtm.requirement_id = p_requirement_id 
    AND rtm.tutor_id = p_tutor_id;
    
    -- If no match found, return false
    IF v_current_status IS NULL THEN
        RETURN FALSE;
    END IF;
    
    -- Only allow revocation if status is 'interested'
    IF v_current_status != 'interested' THEN
        RETURN FALSE;
    END IF;
    
    -- Update the match to revoked status
    UPDATE requirement_tutor_matches 
    SET 
        status = 'revoked',
        revoked_at = NOW(),
        revoke_reason = p_revoke_reason,
        updated_at = NOW()
    WHERE requirement_id = p_requirement_id 
    AND tutor_id = p_tutor_id;
    
    -- Send notification to student about tutor revoking interest
    INSERT INTO notifications (
        user_id,
        type,
        title,
        message,
        data,
        is_read,
        created_at
    ) VALUES (
        v_student_id,
        'requirement_response',
        'Tutor Revoked Interest',
        'A tutor has revoked their interest in your requirement.',
        jsonb_build_object(
            'requirement_id', p_requirement_id,
            'tutor_id', p_tutor_id,
            'status', 'revoked',
            'revoke_reason', p_revoke_reason
        ),
        false,
        NOW()
    );
    
    RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION revoke_tutor_interest(UUID, UUID, TEXT) TO authenticated;

-- Update the tutor requirements view to exclude revoked interests
CREATE OR REPLACE VIEW tutor_requirements_view AS
SELECT 
    r.id,
    r.category,
    r.subject,
    r.location,
    r.description,
    r.preferred_teaching_mode,
    r.preferred_time,
    r.budget_range,
    r.urgency,
    r.class_level,
    r.board,
    r.exam_preparation,
    r.skill_level,
    r.age_group,
    r.specific_topics,
    r.learning_goals,
    r.status,
    r.created_at,
    -- Student info (anonymized for privacy)
    CONCAT(LEFT(p.full_name, 1), '***') as student_initials,
    p.city as student_city,
    p.area as student_area
FROM requirements r
JOIN profiles p ON r.student_id = p.user_id
WHERE r.status = 'active'
AND NOT EXISTS (
    SELECT 1 FROM requirement_tutor_matches rtm 
    WHERE rtm.requirement_id = r.id 
    AND rtm.tutor_id = auth.uid() 
    AND rtm.status = 'revoked'
);

-- Create a function to get requirements that the tutor has responded to (including revoked)
CREATE OR REPLACE FUNCTION get_tutor_requirement_responses(p_tutor_id UUID)
RETURNS TABLE (
    requirement_id UUID,
    status TEXT,
    response_message TEXT,
    proposed_rate DECIMAL(10,2),
    created_at TIMESTAMP WITH TIME ZONE,
    revoked_at TIMESTAMP WITH TIME ZONE,
    revoke_reason TEXT,
    requirement_data JSONB
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rtm.requirement_id,
        rtm.status,
        rtm.response_message,
        rtm.proposed_rate,
        rtm.created_at,
        rtm.revoked_at,
        rtm.revoke_reason,
        jsonb_build_object(
            'id', r.id,
            'subject', r.subject,
            'category', r.category,
            'description', r.description,
            'location', r.location,
            'budget_range', r.budget_range,
            'urgency', r.urgency,
            'status', r.status,
            'created_at', r.created_at
        ) as requirement_data
    FROM requirement_tutor_matches rtm
    JOIN requirements r ON rtm.requirement_id = r.id
    WHERE rtm.tutor_id = p_tutor_id
    ORDER BY rtm.created_at DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION get_tutor_requirement_responses(UUID) TO authenticated;

-- Update RLS policies to allow tutors to revoke their own interests
CREATE POLICY "Tutors can revoke their own interests" ON requirement_tutor_matches
    FOR UPDATE USING (
        auth.uid() = tutor_id 
        AND status = 'interested'
    );

-- Add comment for documentation
COMMENT ON FUNCTION revoke_tutor_interest(UUID, UUID, TEXT) IS 'Allows tutors to revoke their interest in a student requirement';
COMMENT ON COLUMN requirement_tutor_matches.revoked_at IS 'Timestamp when the tutor revoked their interest';
COMMENT ON COLUMN requirement_tutor_matches.revoke_reason IS 'Optional reason provided by tutor for revoking interest';
