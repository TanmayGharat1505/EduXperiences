-- FIX ROLE MIXING IN MESSAGING SYSTEM
-- This script ensures users always appear with their correct roles

-- ==========================================
-- STEP 1: VERIFY CURRENT ROLE ASSIGNMENTS
-- ==========================================
-- Check the specific user mentioned in the issue
SELECT 
    'USER_ROLE_CHECK' as section,
    p.user_id,
    p.full_name,
    p.role,
    CASE 
        WHEN tp.user_id IS NOT NULL THEN 'Has tutor profile'
        ELSE 'No tutor profile'
    END as tutor_profile_status,
    CASE 
        WHEN sp.user_id IS NOT NULL THEN 'Has student profile'
        ELSE 'No student profile'
    END as student_profile_status
FROM profiles p
LEFT JOIN tutor_profiles tp ON p.user_id = tp.user_id
LEFT JOIN student_profiles sp ON p.user_id = sp.user_id
WHERE p.user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- ==========================================
-- STEP 2: CHECK FOR ROLE INCONSISTENCIES
-- ==========================================
-- Find users with conflicting role assignments
SELECT 
    'ROLE_CONFLICTS' as section,
    p.user_id,
    p.full_name,
    p.role as profile_role,
    CASE 
        WHEN tp.user_id IS NOT NULL THEN 'tutor'
        WHEN sp.user_id IS NOT NULL THEN 'student'
        ELSE 'none'
    END as actual_profile_type,
    CASE 
        WHEN p.role != CASE 
            WHEN tp.user_id IS NOT NULL THEN 'tutor'
            WHEN sp.user_id IS NOT NULL THEN 'student'
            ELSE 'none'
        END THEN 'CONFLICT'
        ELSE 'OK'
    END as status
FROM profiles p
LEFT JOIN tutor_profiles tp ON p.user_id = tp.user_id
LEFT JOIN student_profiles sp ON p.user_id = sp.user_id
WHERE p.role IS NOT NULL
ORDER BY status DESC, p.role;

-- ==========================================
-- STEP 3: FIX ROLE INCONSISTENCIES
-- ==========================================
-- Update profiles to have correct roles based on their actual profile tables
UPDATE profiles 
SET role = 'tutor'
WHERE user_id IN (
    SELECT DISTINCT user_id FROM tutor_profiles
) 
AND (role != 'tutor' OR role IS NULL);

UPDATE profiles 
SET role = 'student'
WHERE user_id IN (
    SELECT DISTINCT user_id FROM student_profiles
) 
AND (role != 'student' OR role IS NULL);

-- ==========================================
-- STEP 4: ENSURE UNIQUE ROLE ASSIGNMENTS
-- ==========================================
-- Remove duplicate role assignments (users shouldn't be both tutor and student)
-- If a user has both profiles, prioritize the tutor role
UPDATE profiles 
SET role = 'tutor'
WHERE user_id IN (
    SELECT DISTINCT tp.user_id 
    FROM tutor_profiles tp 
    JOIN student_profiles sp ON tp.user_id = sp.user_id
);

-- ==========================================
-- STEP 5: VERIFY THE FIX
-- ==========================================
-- Check the specific user again
SELECT 
    'USER_ROLE_FIXED' as section,
    p.user_id,
    p.full_name,
    p.role,
    CASE 
        WHEN tp.user_id IS NOT NULL THEN 'Has tutor profile'
        ELSE 'No tutor profile'
    END as tutor_profile_status,
    CASE 
        WHEN sp.user_id IS NOT NULL THEN 'Has student profile'
        ELSE 'No student profile'
    END as student_profile_status
FROM profiles p
LEFT JOIN tutor_profiles tp ON p.user_id = tp.user_id
LEFT JOIN student_profiles sp ON p.user_id = sp.user_id
WHERE p.user_id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- ==========================================
-- STEP 6: CREATE ROLE VALIDATION FUNCTION
-- ==========================================
-- Function to ensure role consistency
CREATE OR REPLACE FUNCTION validate_user_role(
    p_user_id UUID
) RETURNS TEXT AS $$
DECLARE
    v_profile_role TEXT;
    v_actual_role TEXT;
BEGIN
    -- Get the role from profiles table
    SELECT role INTO v_profile_role
    FROM profiles 
    WHERE user_id = p_user_id;
    
    -- Determine actual role based on profile tables
    IF EXISTS (SELECT 1 FROM tutor_profiles WHERE user_id = p_user_id) THEN
        v_actual_role := 'tutor';
    ELSIF EXISTS (SELECT 1 FROM student_profiles WHERE user_id = p_user_id) THEN
        v_actual_role := 'student';
    ELSE
        v_actual_role := 'none';
    END IF;
    
    -- Return the correct role
    RETURN v_actual_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- STEP 7: CREATE ROLE ENFORCEMENT TRIGGER
-- ==========================================
-- Trigger to automatically fix role inconsistencies
CREATE OR REPLACE FUNCTION enforce_role_consistency()
RETURNS TRIGGER AS $$
BEGIN
    -- If this is a tutor profile insertion/update, ensure the user has 'tutor' role
    IF TG_TABLE_NAME = 'tutor_profiles' THEN
        UPDATE profiles 
        SET role = 'tutor'
        WHERE user_id = NEW.user_id 
        AND (role != 'tutor' OR role IS NULL);
    END IF;
    
    -- If this is a student profile insertion/update, ensure the user has 'student' role
    IF TG_TABLE_NAME = 'student_profiles' THEN
        UPDATE profiles 
        SET role = 'student'
        WHERE user_id = NEW.user_id 
        AND (role != 'student' OR role IS NULL);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers on profile tables
DROP TRIGGER IF EXISTS enforce_tutor_role ON tutor_profiles;
CREATE TRIGGER enforce_tutor_role
    AFTER INSERT OR UPDATE ON tutor_profiles
    FOR EACH ROW EXECUTE FUNCTION enforce_role_consistency();

DROP TRIGGER IF EXISTS enforce_student_role ON student_profiles;
CREATE TRIGGER enforce_student_role
    AFTER INSERT OR UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION enforce_role_consistency();

-- ==========================================
-- STEP 8: FINAL VERIFICATION
-- ==========================================
-- Check overall role distribution
SELECT 
    'FINAL_ROLE_DISTRIBUTION' as section,
    role,
    COUNT(*) as count
FROM profiles 
WHERE role IS NOT NULL
GROUP BY role
ORDER BY role;

-- Check for any remaining conflicts
SELECT 
    'REMAINING_CONFLICTS' as section,
    COUNT(*) as conflict_count
FROM profiles p
LEFT JOIN tutor_profiles tp ON p.user_id = tp.user_id
LEFT JOIN student_profiles sp ON p.user_id = sp.user_id
WHERE p.role != CASE 
    WHEN tp.user_id IS NOT NULL THEN 'tutor'
    WHEN sp.user_id IS NOT NULL THEN 'student'
    ELSE 'none'
END;
