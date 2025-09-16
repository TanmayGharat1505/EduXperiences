-- Debug User ID Confusion Issue
-- Investigate why student and institution have the same ID

-- 1. Check all profiles with this specific ID
SELECT 
    'Profile Check' as check_type,
    id,
    full_name,
    role::text as role,
    user_id,
    created_at
FROM profiles 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 2. Check if this ID exists in institution_profiles
SELECT 
    'Institution Profile Check' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 3. Check if this ID exists in tutor_profiles
SELECT 
    'Tutor Profile Check' as check_type,
    id,
    full_name,
    user_id,
    created_at
FROM tutor_profiles 
WHERE id = '4136968b-f971-4b9c-82ed-bbc0c4d82171';

-- 4. Check all profiles to see if there are duplicate IDs
SELECT 
    'Duplicate ID Check' as check_type,
    id,
    COUNT(*) as count,
    STRING_AGG(role::text, ', ') as roles,
    STRING_AGG(full_name, ', ') as names
FROM profiles 
GROUP BY id 
HAVING COUNT(*) > 1
ORDER BY count DESC;

-- 5. Check course enrollments to see the actual student_id
SELECT 
    'Enrollment Student ID Check' as check_type,
    ce.id as enrollment_id,
    ce.student_id,
    ce.course_id,
    ce.status,
    p.full_name as student_name,
    p.role::text as student_role,
    ic.title as course_title,
    ic.institution_id,
    ip.institution_name
FROM course_enrollments ce
JOIN institution_courses ic ON ce.course_id = ic.id
LEFT JOIN profiles p ON ce.student_id = p.id
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.id
WHERE ce.status = 'enrolled'
ORDER BY ce.enrolled_at DESC;

-- 6. Check if there are any other students with different IDs
SELECT 
    'All Student Enrollments' as check_type,
    ce.student_id,
    p.full_name as student_name,
    p.role::text as student_role,
    COUNT(*) as enrollment_count
FROM course_enrollments ce
LEFT JOIN profiles p ON ce.student_id = p.id
WHERE ce.status = 'enrolled'
GROUP BY ce.student_id, p.full_name, p.role
ORDER BY enrollment_count DESC;

-- 7. Check the actual institution that created the courses
SELECT 
    'Course Creator Check' as check_type,
    ic.id as course_id,
    ic.title,
    ic.institution_id,
    ip.institution_name,
    ip.user_id as institution_user_id
FROM institution_courses ic
LEFT JOIN institution_profiles ip ON ic.institution_id = ip.id
ORDER BY ic.created_at DESC;

-- 8. Check if there are any other institution profiles
SELECT 
    'All Institution Profiles' as check_type,
    id,
    institution_name,
    user_id,
    created_at
FROM institution_profiles 
ORDER BY created_at DESC;
