-- PREVIEW: Complete Database Cleanup (DRY RUN)
-- This script shows what will be deleted to keep only isml.intern1@gmail.com and maseerah.research@gmail.com

-- 1. Check what profiles exist for the specified emails
SELECT 
    'TARGET PROFILES (TO KEEP)' as check_type,
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

-- 2. Check all other profiles (TO BE DELETED)
SELECT 
    'PROFILES TO BE DELETED' as check_type,
    id,
    full_name,
    role,
    user_id,
    'These profiles will be deleted' as status
FROM profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- 3. Check institution profiles (TO BE DELETED)
SELECT 
    'INSTITUTION PROFILES TO BE DELETED' as check_type,
    id,
    institution_name,
    user_id,
    'These institution profiles will be deleted' as status
FROM institution_profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- 4. Check tutor profiles (TO BE DELETED)
SELECT 
    'TUTOR PROFILES TO BE DELETED' as check_type,
    id,
    full_name,
    user_id,
    'These tutor profiles will be deleted' as status
FROM tutor_profiles 
WHERE user_id NOT IN (
    SELECT id FROM auth.users 
    WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
);

-- 5. Check courses created by users to be deleted
SELECT 
    'COURSES TO BE DELETED' as check_type,
    ic.id,
    ic.title,
    ic.institution_id,
    ip.institution_name,
    'These courses will be deleted' as status
FROM institution_courses ic
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ic.institution_id NOT IN (
    SELECT id FROM institution_profiles 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- 6. Check tutor courses to be deleted
SELECT 
    'TUTOR COURSES TO BE DELETED' as check_type,
    c.id,
    c.title,
    c.tutor_id,
    tp.full_name as tutor_name,
    'These tutor courses will be deleted' as status
FROM courses c
LEFT JOIN tutor_profiles tp ON c.tutor_id = tp.id
WHERE c.tutor_id NOT IN (
    SELECT id FROM tutor_profiles 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- 7. Check enrollments to be deleted
SELECT 
    'ENROLLMENTS TO BE DELETED' as check_type,
    ce.id,
    ce.student_id,
    ce.course_id,
    ce.status,
    p.full_name as student_name,
    'These enrollments will be deleted' as status
FROM course_enrollments ce
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ce.student_id NOT IN (
    SELECT id FROM profiles 
    WHERE user_id IN (
        SELECT id FROM auth.users 
        WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
    )
);

-- 8. Check batches to be deleted
SELECT 
    'BATCHES TO BE DELETED' as check_type,
    ib.id,
    ib.batch_name,
    ib.course_id,
    ic.title as course_title,
    'These batches will be deleted' as status
FROM institution_batches ib
LEFT JOIN institution_courses ic ON ib.course_id = ic.id
WHERE ib.course_id IN (
    SELECT id FROM institution_courses 
    WHERE institution_id NOT IN (
        SELECT id FROM institution_profiles 
        WHERE user_id IN (
            SELECT id FROM auth.users 
            WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')
        )
    )
);

-- 9. Count records to be affected
SELECT 
    'RECORD COUNTS TO BE DELETED' as check_type,
    (SELECT COUNT(*) FROM profiles WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com'))) as profiles_to_delete,
    (SELECT COUNT(*) FROM institution_profiles WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com'))) as institution_profiles_to_delete,
    (SELECT COUNT(*) FROM tutor_profiles WHERE user_id NOT IN (SELECT id FROM auth.users WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com'))) as tutor_profiles_to_delete,
    (SELECT COUNT(*) FROM institution_courses WHERE institution_id NOT IN (SELECT id FROM institution_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')))) as courses_to_delete,
    (SELECT COUNT(*) FROM courses WHERE tutor_id NOT IN (SELECT id FROM tutor_profiles WHERE user_id IN (SELECT id FROM auth.users WHERE email IN ('isml.intern1@gmail.com', 'maseerah.research@gmail.com')))) as tutor_courses_to_delete;

-- 10. Summary
SELECT 
    'CLEANUP SUMMARY' as check_type,
    'Only profiles for isml.intern1@gmail.com and maseerah.research@gmail.com will remain' as result,
    'All dummy/placeholder/mock data will be deleted' as action1,
    'All courses, enrollments, and batches from other users will be deleted' as action2,
    'Database will be clean and ready for production use' as final_state;
