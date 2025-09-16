-- COMPLETE DATABASE CLEANUP
-- This script removes all data except for isml.intern1@gmail.com and maseerah.research@gmail.com

-- 1. First, let's see what we're keeping
SELECT 
    'PROFILES TO KEEP' as check_type,
    id,
    full_name,
    role,
    user_id,
    'These profiles will be preserved' as status
FROM profiles 
WHERE user_id IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- 2. Delete in correct order to handle foreign key constraints

-- First, delete enrollments for students not in target profiles
DELETE FROM course_enrollments 
WHERE student_id NOT IN (
    SELECT id FROM profiles 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- Delete batches for courses not owned by target institutions
DELETE FROM institution_batches 
WHERE course_id NOT IN (
    SELECT id FROM institution_courses 
    WHERE institution_id IN (
        SELECT id FROM institution_profiles 
        WHERE user_id IN (
            SELECT id FROM auth.users 
            WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
        )
    )
);

-- Delete institution courses not owned by target institutions
DELETE FROM institution_courses 
WHERE institution_id NOT IN (
    SELECT id FROM institution_profiles 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- Delete tutor courses not owned by target tutors
DELETE FROM courses 
WHERE tutor_id NOT IN (
    SELECT id FROM tutor_profiles 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- Delete institution profiles not in target users
DELETE FROM institution_profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- Delete tutor profiles not in target users
DELETE FROM tutor_profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- Delete profiles not in target users
DELETE FROM profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- Delete auth users not in target emails
DELETE FROM auth.users 
WHERE email NOT IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com');

-- 11. Verify the cleanup
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
FROM institution_batches;

-- 12. Show final state
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

-- 13. Success message
SELECT 
    'SUCCESS' as check_type,
    'Database cleanup completed' as message,
    'Only isml.intern1@gmail.com and maseerah.research@gmail.com data remains' as result,
    'All dummy/placeholder/mock data has been removed' as action;
