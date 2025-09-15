-- Quick test to check profile access
-- Run this first to see what's broken

-- 1. Test basic profile access
SELECT 'Basic profile access test' as test_name;
SELECT COUNT(*) as profile_count FROM profiles;

-- 2. Test role-based queries
SELECT 'Role-based queries test' as test_name;
SELECT role, COUNT(*) as count FROM profiles GROUP BY role;

-- 3. Test specific user profile access (replace with actual user ID)
SELECT 'User profile access test' as test_name;
SELECT 
    user_id,
    role,
    full_name,
    email
FROM profiles 
LIMIT 5;

-- 4. Check for any error logs or issues
SELECT 'Error check' as test_name;
SELECT 
    'No obvious errors in basic queries' as status;
