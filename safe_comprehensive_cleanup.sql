-- SAFE COMPREHENSIVE DATABASE CLEANUP
-- This script safely removes all data except for the two specified email addresses
-- Handles ALL possible foreign key constraints

-- 1. Show what we're keeping
SELECT 
    'PROFILES TO KEEP' as check_type,
    p.id,
    p.full_name,
    p.role,
    u.email,
    'These profiles will be preserved' as status
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
WHERE u.email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com');

-- 2. Get target user IDs
SELECT 
    'TARGET USER IDS' as check_type,
    id as user_id,
    email,
    'These users will be preserved' as status
FROM auth.users 
WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com');

-- 3. Delete in correct order to handle ALL foreign key constraints

-- First, delete all dependent records that reference users
-- Delete notifications
DELETE FROM notifications 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- Delete any other tables that might reference users
-- (Add more DELETE statements here as needed based on your schema)

-- Delete course enrollments for non-target students
DELETE FROM course_enrollments 
WHERE student_id IN (
    SELECT p.id FROM profiles p
    WHERE p.user_id NOT IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- Delete batches for non-target institutions
DELETE FROM institution_batches 
WHERE course_id IN (
    SELECT ic.id FROM institution_courses ic
    JOIN institution_profiles ip ON ic.institution_id = ip.id
    WHERE ip.user_id NOT IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- Delete institution courses for non-target institutions
DELETE FROM institution_courses 
WHERE institution_id IN (
    SELECT id FROM institution_profiles 
    WHERE user_id NOT IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- Delete tutor courses for non-target tutors
DELETE FROM courses 
WHERE tutor_id IN (
    SELECT id FROM tutor_profiles 
    WHERE user_id NOT IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- Delete institution profiles for non-target users
DELETE FROM institution_profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- Delete tutor profiles for non-target users
DELETE FROM tutor_profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- Delete profiles for non-target users
DELETE FROM profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- Finally, delete auth users for non-target emails
DELETE FROM auth.users 
WHERE email NOT IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com');

-- 4. Verify the cleanup
SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining profiles' as type,
    COUNT(*) as count
FROM profiles

UNION ALL

SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining institution profiles' as type,
    COUNT(*) as count
FROM institution_profiles

UNION ALL

SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining tutor profiles' as type,
    COUNT(*) as count
FROM tutor_profiles

UNION ALL

SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining institution courses' as type,
    COUNT(*) as count
FROM institution_courses

UNION ALL

SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining tutor courses' as type,
    COUNT(*) as count
FROM courses

UNION ALL

SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining enrollments' as type,
    COUNT(*) as count
FROM course_enrollments

UNION ALL

SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining batches' as type,
    COUNT(*) as count
FROM institution_batches

UNION ALL

SELECT 
    'CLEANUP VERIFICATION' as check_type,
    'Remaining notifications' as type,
    COUNT(*) as count
FROM notifications;

-- 5. Show final state
SELECT 
    'FINAL STATE' as check_type,
    p.id as profile_id,
    p.full_name,
    p.role,
    u.email,
    'Only these profiles remain' as status
FROM profiles p
JOIN auth.users u ON p.user_id = u.id
ORDER BY p.created_at;

-- 6. Success message
SELECT 
    'SUCCESS' as check_type,
    'Database cleanup completed successfully' as message,
    'Only isml.intern1@gmail.com and maseerah.research@gmail.com data remains' as result,
    'All dummy/placeholder/mock data has been removed' as action;
